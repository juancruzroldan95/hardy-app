import { db } from '@/db'
import { profiles, deliveryAddresses, orders, orderItems, clientAlerts } from '@/db/schema'
import { and, eq, ne, desc } from 'drizzle-orm'

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
