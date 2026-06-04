'use server'

import { db } from '@/db'
import { orders, orderItems, orderMessages } from '@/db/schema'
import { and, eq, desc, asc, count, sum, gte, lt } from 'drizzle-orm'
import type { OrderStatus } from '@/db/schema'

export async function getOrderById(orderId: string) {
  return db.query.orders.findFirst({
    where: and(eq(orders.id, orderId), eq(orders.isDeleted, false)),
    with: { items: { where: eq(orderItems.isDeleted, false) } },
  })
}

export async function getOrdersByUserId(userId: string, statusFilter?: OrderStatus | null) {
  return db.query.orders.findMany({
    where: statusFilter
      ? and(eq(orders.userId, userId), eq(orders.status, statusFilter), eq(orders.isDeleted, false))
      : and(eq(orders.userId, userId), eq(orders.isDeleted, false)),
    orderBy: [desc(orders.createdAt)],
    with: { items: { where: eq(orderItems.isDeleted, false) } },
  })
}

export async function getOrderMessages(orderId: string) {
  return db.query.orderMessages.findMany({
    where: and(eq(orderMessages.orderId, orderId), eq(orderMessages.isDeleted, false)),
    orderBy: [asc(orderMessages.createdAt)],
  })
}

export async function getAllOrders() {
  return db.query.orders.findMany({
    where: eq(orders.isDeleted, false),
    orderBy: [desc(orders.createdAt)],
    with: { items: { where: eq(orderItems.isDeleted, false) } },
  })
}

export async function getUserOrderCount(userId: string) {
  return db.select({ total: count() })
    .from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.isDeleted, false)))
    .then((res) => res[0]?.total ?? 0)
}

export async function getUserOrdersTotalSum(userId: string) {
  return db.select({ total: sum(orders.totalArs) })
    .from(orders)
    .where(and(eq(orders.userId, userId), eq(orders.isDeleted, false)))
    .then((res) => Number(res[0]?.total ?? 0))
}

export async function getOrdersSummaryForStats() {
  return db.select({
    id: orders.id,
    status: orders.status,
    paymentStatus: orders.paymentStatus,
    totalArs: orders.totalArs,
  })
    .from(orders)
    .where(eq(orders.isDeleted, false))
}

export async function getMonthlyRevenue(startDate: Date, endDate?: Date) {
  const conditions = [eq(orders.isDeleted, false), gte(orders.createdAt, startDate)]
  if (endDate) {
    conditions.push(lt(orders.createdAt, endDate))
  }
  return db.select({ total: sum(orders.totalArs) })
    .from(orders)
    .where(and(...conditions))
    .then((res) => Number(res[0]?.total ?? 0))
}

export async function getAllOrdersForRevenueTracking() {
  return db.query.orders.findMany({
    where: eq(orders.isDeleted, false),
    columns: { userId: true, totalArs: true },
  })
}
