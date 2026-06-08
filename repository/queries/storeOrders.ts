import { db } from '@/db'
import { orders, orderItems } from '@/db/schema'
import { eq, and } from 'drizzle-orm'

// ─── getStoreOrderById ────────────────────────────────────────────────────────

export async function getStoreOrderById(id: string) {
  return db.query.orders.findFirst({
    where: and(eq(orders.id, id), eq(orders.isDeleted, false)),
    with: {
      items: {
        where: eq(orderItems.isDeleted, false),
      },
    },
  })
}

// ─── getStoreOrdersByEmail ────────────────────────────────────────────────────

export async function getStoreOrdersByEmail(email: string) {
  return db.query.orders.findMany({
    where: and(
      eq(orders.guestEmail, email),
      eq(orders.channel, 'b2c'),
      eq(orders.isDeleted, false)
    ),
    with: {
      items: {
        where: eq(orderItems.isDeleted, false),
      },
    },
    orderBy: (o, { desc }) => [desc(o.createdAt)],
  })
}
