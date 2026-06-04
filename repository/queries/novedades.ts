import { db } from '@/db'
import { novedades } from '@/db/schema'
import { and, eq, desc } from 'drizzle-orm'

export async function getActiveNovedades() {
  return db.query.novedades.findMany({
    where: and(eq(novedades.isDeleted, false), eq(novedades.isActive, true)),
    orderBy: [desc(novedades.createdAt)],
  })
}

export async function getNovedadById(id: string) {
  return db.query.novedades.findFirst({
    where: and(eq(novedades.id, id), eq(novedades.isDeleted, false)),
  })
}

export async function getAllNovedadesAdmin() {
  return db.query.novedades.findMany({
    where: eq(novedades.isDeleted, false),
    orderBy: [desc(novedades.createdAt)],
  })
}
