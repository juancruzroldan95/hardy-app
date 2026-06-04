'use server'

import { db } from '@/db'
import { solicitudes } from '@/db/schema'
import { and, eq, desc, count } from 'drizzle-orm'

export async function getAllSolicitudes() {
  return db.query.solicitudes.findMany({
    where: eq(solicitudes.isDeleted, false),
    orderBy: [desc(solicitudes.createdAt)],
  })
}

export async function getSolicitudById(id: string) {
  return db.query.solicitudes.findFirst({
    where: and(eq(solicitudes.id, id), eq(solicitudes.isDeleted, false)),
  })
}

export async function getPendingSolicitudesCount() {
  return db.select({ total: count() })
    .from(solicitudes)
    .where(and(eq(solicitudes.isDeleted, false), eq(solicitudes.estado, 'pendiente')))
    .then((res) => res[0]?.total ?? 0)
}
