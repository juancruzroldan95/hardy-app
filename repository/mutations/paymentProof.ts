'use server'

import { db } from '@/db'
import { orders } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { createClient } from '@/services/supabase/server'
import { revalidatePath } from 'next/cache'
import { getOrderById } from '@/repository/queries/orders'

export type PaymentProofState =
  | { error: string }
  | { success: true }
  | undefined

const IVA_RATE = 0.21
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hardy.ar'
const BUCKET   = 'payment-proofs'

// ─── createMpPreferenceForExistingOrder ──────────────────────────────────────

export async function createMpPreferenceForExistingOrder(
  orderId: string
): Promise<{ initPoint: string } | { error: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const order = await getOrderById(orderId)
  if (!order) return { error: 'Pedido no encontrado.' }
  if (order.userId !== user.id) return { error: 'No autorizado.' }
  if (order.paymentStatus !== 'unpaid') return { error: 'Este pedido ya fue pagado.' }
  if (order.paymentMethod !== 'mercadopago') return { error: 'El pedido no es de Mercado Pago.' }

  // Rebuild MP items from order items (unit price already includes IVA
  // as stored in unitPriceArs). Shipping also adds IVA.
  const mpItems = [
    ...order.items.map((i) => ({
      title:       `${i.productName} · ${i.variant} · ${i.size}`,
      quantity:    i.qty,
      unit_price:  Number((Number(i.unitPriceArs) * (1 + IVA_RATE)).toFixed(2)),
      currency_id: 'ARS',
    })),
    ...(order.shippingCost && Number(order.shippingCost) > 0
      ? [{
          title:       `Envío — ${order.shippingMethod ?? ''}`,
          quantity:    1,
          unit_price:  Number((Number(order.shippingCost) * (1 + IVA_RATE)).toFixed(2)),
          currency_id: 'ARS',
        }]
      : []),
  ]

  const mpRes = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization:  `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items:              mpItems,
      back_urls: {
        success: `${BASE_URL}/portal/pedidos/${orderId}?payment=success`,
        failure: `${BASE_URL}/portal/pedidos/${orderId}?payment=failure`,
        pending: `${BASE_URL}/portal/pedidos/${orderId}?payment=pending`,
      },
      auto_return:        'approved',
      external_reference: orderId,
      notification_url:   `${BASE_URL}/api/mercadopago/webhook`,
    }),
  })

  if (!mpRes.ok) {
    const detail = await mpRes.json()
    console.error('[mp] Error recreating preference:', detail)
    return { error: 'No se pudo generar el link de pago. Intentá de nuevo.' }
  }

  const mpData = await mpRes.json()
  return { initPoint: mpData.init_point as string }
}

// ─── uploadPaymentProof ───────────────────────────────────────────────────────

export async function uploadPaymentProof(
  _prev: PaymentProofState,
  formData: FormData
): Promise<PaymentProofState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const orderId = formData.get('orderId') as string | null
  const file    = formData.get('file')    as File    | null

  if (!orderId) return { error: 'Falta el ID del pedido.' }
  if (!file || file.size === 0) return { error: 'Seleccioná un archivo.' }
  if (file.size > 10 * 1024 * 1024) return { error: 'El archivo no puede superar los 10 MB.' }

  const allowed = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf']
  if (!allowed.includes(file.type)) {
    return { error: 'Solo se aceptan imágenes (PNG, JPG, WEBP) o PDF.' }
  }

  const order = await getOrderById(orderId)
  if (!order) return { error: 'Pedido no encontrado.' }
  if (order.userId !== user.id) return { error: 'No autorizado.' }
  if (order.paymentStatus === 'paid') return { error: 'Este pedido ya está marcado como pagado.' }

  const ext      = file.name.split('.').pop() ?? 'pdf'
  const path     = `${user.id}/${orderId}-${Date.now()}.${ext}`
  const buffer   = await file.arrayBuffer()

  const { error: uploadError } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: file.type, upsert: true })

  if (uploadError) {
    console.error('[storage] upload error:', uploadError)
    return { error: 'No se pudo subir el archivo. Intentá de nuevo.' }
  }

  // Guardamos el path (no la URL pública) porque el bucket es privado.
  // Las URLs firmadas se generan al mostrar desde Server Components.
  await db.update(orders)
    .set({ paymentProofUrl: path, updatedAt: new Date() })
    .where(and(eq(orders.id, orderId), eq(orders.isDeleted, false)))

  revalidatePath(`/portal/pedidos/${orderId}`)
  revalidatePath(`/portal/admin/pedidos/${orderId}`)

  return { success: true }
}
