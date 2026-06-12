import { db } from '@/db'
import { profiles, deliveryAddresses, orders, orderItems, clientAlerts } from '@/db/schema'
import type { AlertTipo } from '@/db/schema'
import { and, eq, ne, desc, asc, or, isNull, lte } from 'drizzle-orm'

export async function getProfileByUserId(userId: string) {
  return db.query.profiles.findFirst({
    where: and(eq(profiles.userId, userId), eq(profiles.isDeleted, false)),
  })
}

export async function getProfileById(profileId: string) {
  return db.query.profiles.findFirst({
    where: and(eq(profiles.id, profileId), eq(profiles.isDeleted, false)),
  })
}

export async function getDeliveryAddressesByProfileId(profileId: string) {
  return db.query.deliveryAddresses.findMany({
    where: and(
      eq(deliveryAddresses.profileId, profileId),
      eq(deliveryAddresses.isDeleted, false),
      eq(deliveryAddresses.isActive, true)
    ),
  })
}

export async function getAllClients() {
  return db.query.profiles.findMany({
    where: and(
      eq(profiles.isDeleted, false),
      eq(profiles.isActive, true),
      ne(profiles.role, 'admin')
    ),
    orderBy: (profiles, { asc }) => [asc(profiles.displayName)],
  })
}

export async function getAllProfiles() {
  return db.query.profiles.findMany({
    where: eq(profiles.isDeleted, false),
  })
}

function endOfToday() {
  const d = new Date()
  d.setHours(23, 59, 59, 999)
  return d
}

export async function getAllPendingAlerts(opts?: {
  tipo?: AlertTipo
  profileId?: string
  incluirFuturas?: boolean
}) {
  const today = endOfToday()
  const conditions = [
    eq(clientAlerts.isDeleted, false),
    eq(clientAlerts.isResolved, false),
    ...(!opts?.incluirFuturas
      ? [or(isNull(clientAlerts.scheduledFor), lte(clientAlerts.scheduledFor, today))!]
      : []),
    ...(opts?.tipo      ? [eq(clientAlerts.tipo,      opts.tipo)]      : []),
    ...(opts?.profileId ? [eq(clientAlerts.profileId, opts.profileId)] : []),
  ]
  return db.query.clientAlerts.findMany({
    where: and(...conditions),
    orderBy: [asc(clientAlerts.scheduledFor), desc(clientAlerts.createdAt)],
    with: { profile: true },
  })
}

export async function getPendingAlertsCount() {
  const today = endOfToday()
  const rows = await db.query.clientAlerts.findMany({
    where: and(
      eq(clientAlerts.isDeleted, false),
      eq(clientAlerts.isResolved, false),
      or(isNull(clientAlerts.scheduledFor), lte(clientAlerts.scheduledFor, today)),
    ),
    columns: { id: true },
  })
  return rows.length
}

export async function getAllClientsWithOrdersAndAlerts() {
  return db.query.profiles.findMany({
    where: eq(profiles.isDeleted, false),
    orderBy: [desc(profiles.createdAt)],
    with: {
      orders: {
        where: eq(orders.isDeleted, false),
        orderBy: [desc(orders.createdAt)],
        with: {
          items: { where: eq(orderItems.isDeleted, false) },
        },
      },
      alerts: {
        where: eq(clientAlerts.isDeleted, false),
        orderBy: [desc(clientAlerts.createdAt)],
      },
    },
  })
}
