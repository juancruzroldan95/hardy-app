'use server'

import { db } from '@/db'
import { productAvailability, priceOverrides, clientAlerts } from '@/db/schema'
import { and, eq, count } from 'drizzle-orm'

export async function getAllStockRecords() {
  return db.query.productAvailability.findMany()
}

export async function getActivePriceOverrides() {
  return db.query.priceOverrides.findMany({
    where: and(eq(priceOverrides.isDeleted, false), eq(priceOverrides.isActive, true)),
  })
}

export async function getPendingAlertsCount() {
  return db.select({ total: count() })
    .from(clientAlerts)
    .where(and(eq(clientAlerts.isDeleted, false), eq(clientAlerts.isResolved, false)))
    .then((res) => res[0]?.total ?? 0)
}
