'use server'

import { db } from '@/db'
import { orders, orderItems } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { ShippingData } from '@/types'
import type { ShippingMethod } from '@/db/schema'
import { sendReviewRequest } from '@/services/resend'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoreOrderItem {
  productId:   string
  productName: string
  variant:     string
  size:        string
  qty:         number
  unitPriceArs: number
}

export interface CreateStoreOrderInput {
  items:        StoreOrderItem[]
  shippingData: ShippingData
  shippingCost: number
  totalArs:     number      // productos + envío
}

// ─── createStoreOrder ─────────────────────────────────────────────────────────

export async function createStoreOrder(input: CreateStoreOrderInput): Promise<string> {
  const { items, shippingData, shippingCost, totalArs } = input

  const [order] = await db
    .insert(orders)
    .values({
      channel:         'b2c',
      status:          'pending',
      paymentStatus:   'unpaid',
      shippingMethod:  shippingData.shippingMethod as ShippingMethod,
      paymentMethod:   'transferencia', // MP — se actualiza post-webhook
      totalArs:        String(totalArs),
      shippingAddress: shippingData.shippingMethod === 'retiro_local' ? 'Retiro en local · Mario Bravo 1314' : undefined,
      shippingCp:      undefined,
      shippingCost:    String(shippingCost),
      guestName:       shippingData.nombre,
      guestEmail:      shippingData.email,
      guestPhone:      shippingData.telefono,
    })
    .returning({ id: orders.id })

  const orderId = order.id

  await db.insert(orderItems).values(
    items.map((item) => ({
      orderId,
      productId:    item.productId,
      productName:  item.productName,
      variant:      item.variant,
      size:         item.size,
      qty:          item.qty,
      unitPriceArs: String(item.unitPriceArs),
      subtotalArs:  String(item.unitPriceArs * item.qty),
    }))
  )

  return orderId
}

// ─── updateOrderPaymentStatus ─────────────────────────────────────────────────

export async function updateOrderPaymentStatus(
  orderId: string,
  paymentStatus: 'paid' | 'failed' | 'refunded',
  mpPaymentId?: string
): Promise<void> {
  await db
    .update(orders)
    .set({
      paymentStatus,
      status: paymentStatus === 'paid' ? 'confirmed' : 'cancelled',
      notes:  mpPaymentId ? `MP payment_id: ${mpPaymentId}` : undefined,
      updatedAt: new Date(),
    })
    .where(eq(orders.id, orderId))
}

// ─── markB2COrderDelivered ────────────────────────────────────────────────────
// Marca el pedido como entregado y dispara el email de pedido de reseña.

export async function markB2COrderDelivered(orderId: string): Promise<void> {
  await db
    .update(orders)
    .set({ status: 'delivered', updatedAt: new Date() })
    .where(eq(orders.id, orderId))

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId),
    with: { items: true },
  })

  if (order?.guestEmail && order.items?.length) {
    await sendReviewRequest({
      to:          order.guestEmail,
      clientName:  order.guestName ?? order.guestEmail,
      orderNumber: order.id.slice(-8).toUpperCase(),
      items:       order.items.map((i) => ({
        productName: i.productName,
        productId:   i.productId,
      })),
    }).catch((e) => console.error('[review-request]', e))
  }
}

// ─── updateOrderAndreani ──────────────────────────────────────────────────────

export async function updateOrderAndreani(
  orderId: string,
  nroEnvio: string
): Promise<void> {
  await db
    .update(orders)
    .set({
      andreaniNroEnvio: nroEnvio,
      status:           'preparing',
      updatedAt:        new Date(),
    })
    .where(eq(orders.id, orderId))
}
