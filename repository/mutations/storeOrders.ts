'use server'

import { db } from '@/db'
import { orders, orderItems } from '@/db/schema'
import { eq } from 'drizzle-orm'
import type { ShippingData } from '@/types'

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
      shippingMethod:  'andreani',
      paymentMethod:   'transferencia', // MP — se actualiza post-webhook
      totalArs:        String(totalArs),
      shippingAddress: `${shippingData.calle} ${shippingData.numero}, ${shippingData.ciudad}, ${shippingData.provincia}`,
      shippingCp:      shippingData.cp,
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
