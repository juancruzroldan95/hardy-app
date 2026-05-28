'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/lib/db'
import { orders, orderItems, profiles, priceOverrides } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'
import { createClient } from '@/lib/supabase/server'
import { getProductById } from '@/lib/products'
import type { ShippingMethod, PaymentMethod } from '@/drizzle/schema'

export type CreateOrderState =
  | { error: string }
  | undefined

export interface OrderLineInput {
  productId: string
  qty: number
}

export async function createPortalOrder(
  _prev: CreateOrderState,
  formData: FormData,
): Promise<CreateOrderState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (!profile) return { error: 'Perfil no encontrado.' }

  const shippingMethod = formData.get('shippingMethod') as ShippingMethod | null
  const paymentMethod  = formData.get('paymentMethod')  as PaymentMethod  | null
  const notes          = (formData.get('notes') as string)?.trim() || null

  if (!shippingMethod) return { error: 'Seleccioná un método de envío.' }
  if (!paymentMethod)  return { error: 'Seleccioná un método de pago.' }

  // Parsear líneas del pedido desde el FormData (qty-<productId>)
  const lines: OrderLineInput[] = []
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('qty-')) {
      const productId = key.replace('qty-', '')
      const qty = parseInt(value as string, 10)
      if (qty > 0) lines.push({ productId, qty })
    }
  }

  if (lines.length === 0) return { error: 'Agregá al menos un producto al pedido.' }

  // Obtener precios B2B para el rol del usuario
  const overrides = await db.query.priceOverrides.findMany({
    where: and(eq(priceOverrides.role, profile.role), eq(priceOverrides.isDeleted, false)),
  })
  const overrideMap = new Map(overrides.map((o) => [o.productId, Number(o.priceArs)]))

  // Calcular total y construir items
  let totalArs = 0
  const itemsToInsert: {
    productId: string
    productName: string
    variant: string
    size: string
    unitPriceArs: string
    qty: number
    subtotalArs: string
  }[] = []

  for (const line of lines) {
    const product = getProductById(line.productId)
    if (!product) return { error: `Producto no encontrado: ${line.productId}` }

    const unitPrice  = overrideMap.get(line.productId) ?? product.price
    const subtotal   = unitPrice * line.qty
    totalArs        += subtotal

    itemsToInsert.push({
      productId:    product.id,
      productName:  product.name,
      variant:      product.variant,
      size:         product.size,
      unitPriceArs: unitPrice.toFixed(2),
      qty:          line.qty,
      subtotalArs:  subtotal.toFixed(2),
    })
  }

  // Crear la orden en la DB
  const [newOrder] = await db.insert(orders).values({
    userId:         user.id,
    status:         'pending',
    paymentStatus:  'unpaid',
    totalArs:       totalArs.toFixed(2),
    shippingMethod,
    paymentMethod,
    notes,
  }).returning({ id: orders.id })

  // Insertar los items
  await db.insert(orderItems).values(
    itemsToInsert.map((item) => ({ ...item, orderId: newOrder.id }))
  )

  revalidatePath('/portal/pedidos')
  redirect(`/portal/pedidos/${newOrder.id}`)
}
