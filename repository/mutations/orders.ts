'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { db } from '@/db'
import { orders, orderItems, profiles, priceOverrides } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import { createClient } from '@/services/supabase/server'
import { getProductById } from '@/consts/products'
import { sendOrderConfirmation } from '@/services/resend'
import type { ShippingMethod, PaymentMethod, UserRole } from '@/db/schema'

export type CreateOrderState =
  | { error: string }
  | undefined

export interface OrderLineInput {
  productId: string
  qty: number
}

// Balde product IDs — counter is totalBaldes for these
const BALDE_IDS = new Set(['balde-45', 'balde-23', 'miel-balde-6', 'miel-balde-30'])

// Minimum total frasco cajas per role (frasco orders only)
const MIN_FRASCO_CAJAS: Partial<Record<UserRole, number>> = {
  mayorista:    3,
  distribuidor: 20,
}

/**
 * Build tiered price map for a role.
 * Returns a function: (productId, totalFrascoCajas, totalBaldes) => pricePerUnit
 */
async function buildPriceLookup(role: UserRole) {
  const rawOverrides = await db.query.priceOverrides.findMany({
    where: and(eq(priceOverrides.role, role), eq(priceOverrides.isDeleted, false), eq(priceOverrides.isActive, true)),
  })

  // Group by productId, sorted by minQty ascending
  const tiersByProduct = new Map<string, Array<{ minQty: number; pricePerUnit: number }>>()
  rawOverrides
    .sort((a, b) => a.minQty - b.minQty)
    .forEach((o) => {
      if (!tiersByProduct.has(o.productId)) tiersByProduct.set(o.productId, [])
      tiersByProduct.get(o.productId)!.push({ minQty: o.minQty, pricePerUnit: Number(o.priceArs) })
    })

  return (productId: string, totalFrascoCajas: number, totalBaldes: number): number | null => {
    const tiers = tiersByProduct.get(productId)
    if (!tiers || tiers.length === 0) return null
    const counter = BALDE_IDS.has(productId) ? totalBaldes : totalFrascoCajas
    let active = tiers[0]
    for (const tier of tiers) {
      if (counter >= tier.minQty) active = tier
    }
    return active.pricePerUnit
  }
}

// ─── createPortalOrder ────────────────────────────────────────────────────────

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

  return _createOrderForUser({
    userId:   user.id,
    profile,
    formData,
    role:     profile.role,
  })
}

// ─── createPortalOrderForClient (admin) ──────────────────────────────────────

export async function createPortalOrderForClient(
  clientUserId: string,
  _prev: CreateOrderState,
  formData: FormData,
): Promise<CreateOrderState> {
  const clientProfile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, clientUserId), eq(profiles.isDeleted, false)),
  })
  if (!clientProfile) return { error: 'Perfil del cliente no encontrado.' }

  return _createOrderForUser({
    userId:     clientUserId,
    profile:    clientProfile,
    formData,
    role:       clientProfile.role,
    isAdmin:    true,
  })
}

// ─── Shared order creation logic ──────────────────────────────────────────────

async function _createOrderForUser({
  userId,
  profile,
  formData,
  role,
  isAdmin = false,
}: {
  userId:    string
  profile:   { role: UserRole; displayName?: string | null; company?: string | null }
  formData:  FormData
  role:      UserRole
  isAdmin?:  boolean
}): Promise<CreateOrderState> {
  const shippingMethod       = formData.get('shippingMethod') as ShippingMethod | null
  const paymentMethod        = formData.get('paymentMethod')  as PaymentMethod  | null
  const notes                = (formData.get('notes')                as string)?.trim() || null
  const purchaseOrderNumber  = (formData.get('purchaseOrderNumber')  as string)?.trim() || null
  const requestedDeliveryDate = (formData.get('requestedDeliveryDate') as string)?.trim() || null
  const shippingAddress      = (formData.get('shippingAddress')      as string)?.trim() || null

  if (!shippingMethod) return { error: 'Seleccioná un método de envío.' }
  if (!paymentMethod)  return { error: 'Seleccioná un método de pago.' }

  // Parse qty and unitsPerBox from FormData
  const unitsPerBoxMap = new Map<string, number>()
  const lines: OrderLineInput[] = []

  for (const [key, value] of formData.entries()) {
    if (key.startsWith('upb-')) {
      unitsPerBoxMap.set(key.replace('upb-', ''), parseInt(value as string, 10) || 1)
    }
  }
  for (const [key, value] of formData.entries()) {
    if (key.startsWith('qty-')) {
      const qty = parseInt(value as string, 10)
      if (qty > 0) lines.push({ productId: key.replace('qty-', ''), qty })
    }
  }

  if (lines.length === 0) return { error: 'Agregá al menos un producto al pedido.' }

  // Compute frasco/balde totals for tier selection and validation
  let totalFrascoCajas = 0
  let totalBaldes = 0
  for (const line of lines) {
    if (BALDE_IDS.has(line.productId)) totalBaldes += line.qty
    else totalFrascoCajas += line.qty
  }

  // Minimum order validation
  const minFrascos = MIN_FRASCO_CAJAS[role] ?? 0
  if (minFrascos > 0 && totalFrascoCajas > 0 && totalFrascoCajas < minFrascos) {
    return {
      error: `El pedido mínimo para tu segmento (${role}) es ${minFrascos} cajas de frascos. Actualmente tenés ${totalFrascoCajas}.`,
    }
  }

  // Build price lookup with tiered pricing
  const getPrice = await buildPriceLookup(role)

  // Build order items
  let totalArs = 0
  const itemsToInsert: {
    productId:    string
    productName:  string
    variant:      string
    size:         string
    unitPriceArs: string
    qty:          number
    subtotalArs:  string
  }[] = []

  for (const line of lines) {
    const product = getProductById(line.productId)
    if (!product) return { error: `Producto no encontrado: ${line.productId}` }

    const unitPrice    = getPrice(line.productId, totalFrascoCajas, totalBaldes) ?? product.price
    const unitsPerBox  = unitsPerBoxMap.get(line.productId) ?? product.unitsPerBox ?? 1
    const pricePerCaja = unitPrice * unitsPerBox
    const subtotal     = pricePerCaja * line.qty
    totalArs          += subtotal

    itemsToInsert.push({
      productId:    product.id,
      productName:  product.name,
      variant:      product.variant,
      size:         product.size,
      unitPriceArs: pricePerCaja.toFixed(2),
      qty:          line.qty,
      subtotalArs:  subtotal.toFixed(2),
    })
  }

  // Insert order
  const [newOrder] = await db.insert(orders).values({
    userId,
    status:               'pending',
    paymentStatus:        'unpaid',
    totalArs:             totalArs.toFixed(2),
    shippingMethod,
    paymentMethod,
    notes,
    purchaseOrderNumber,
    requestedDeliveryDate,
    shippingAddress,
  }).returning({ id: orders.id })

  await db.insert(orderItems).values(
    itemsToInsert.map((item) => ({ ...item, orderId: newOrder.id }))
  )

  revalidatePath('/portal/pedidos')
  if (isAdmin) revalidatePath('/portal/admin/pedidos')

  // Send confirmation email (non-blocking)
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    const clientEmail = authUser?.email
    if (clientEmail) {
      await sendOrderConfirmation({
        orderId:        newOrder.id,
        orderDate:      new Date(),
        clientName:     profile.displayName ?? profile.company ?? clientEmail,
        clientEmail,
        shippingMethod,
        paymentMethod,
        notes,
        totalArs,
        items:          itemsToInsert.map((i) => ({
          ...i,
          id:          '',
          orderId:     newOrder.id,
          isActive:    true,
          isDeleted:   false,
        })),
      })
    }
  } catch (e) {
    console.error('[email] Failed to send order confirmation:', e)
  }

  redirect(`/portal/pedidos/${newOrder.id}`)
}
