'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, orders, solicitudes, novedades } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'
import type { EstadoSolicitud, OrderStatus, PaymentStatus } from '@/drizzle/schema'

// ─── Guard ─────────────────────────────────────────────────────────────────────

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })

  if (profile?.role !== 'admin') redirect('/portal')
  return { user, profile }
}

// ─── Solicitudes ───────────────────────────────────────────────────────────────

export async function updateSolicitudEstado(
  id: string,
  estado: EstadoSolicitud,
  notasAdmin?: string,
) {
  await getAdminUser()
  await db.update(solicitudes)
    .set({ estado, notasAdmin: notasAdmin ?? null, updatedAt: new Date() })
    .where(eq(solicitudes.id, id))
  revalidatePath('/portal/admin/solicitudes')
  revalidatePath(`/portal/admin/solicitudes/${id}`)
}

// ─── Orders ────────────────────────────────────────────────────────────────────

export async function updateOrderStatus(
  id: string,
  status: OrderStatus,
  paymentStatus?: PaymentStatus,
) {
  await getAdminUser()
  await db.update(orders)
    .set({
      status,
      ...(paymentStatus ? { paymentStatus } : {}),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))
  revalidatePath('/portal/admin/pedidos')
  revalidatePath(`/portal/admin/pedidos/${id}`)
}

// ─── Vendedor ──────────────────────────────────────────────────────────────────

export async function assignVendedor(
  profileId: string,
  vendedorNombre: string,
  vendedorWhatsapp: string,
) {
  await getAdminUser()
  await db.update(profiles)
    .set({ vendedorNombre, vendedorWhatsapp, updatedAt: new Date() })
    .where(eq(profiles.id, profileId))
  revalidatePath('/portal/admin/clientes')
}

// ─── Novedades ─────────────────────────────────────────────────────────────────

export type NovedadState = { success: true } | { error: string } | undefined

export async function createNovedad(
  _prev: NovedadState,
  formData: FormData,
): Promise<NovedadState> {
  await getAdminUser()

  const titulo   = (formData.get('titulo')   as string)?.trim()
  const cuerpo   = (formData.get('cuerpo')   as string)?.trim()
  const imageUrl = (formData.get('imageUrl') as string)?.trim() || null

  if (!titulo || !cuerpo) return { error: 'Completá título y cuerpo.' }

  await db.insert(novedades).values({ titulo, cuerpo, imageUrl })
  revalidatePath('/portal/novedades')
  revalidatePath('/portal/admin/novedades')
  redirect('/portal/admin/novedades')
}

export async function updateNovedad(
  id: string,
  _prev: NovedadState,
  formData: FormData,
): Promise<NovedadState> {
  await getAdminUser()

  const titulo   = (formData.get('titulo')   as string)?.trim()
  const cuerpo   = (formData.get('cuerpo')   as string)?.trim()
  const imageUrl = (formData.get('imageUrl') as string)?.trim() || null

  if (!titulo || !cuerpo) return { error: 'Completá título y cuerpo.' }

  await db.update(novedades)
    .set({ titulo, cuerpo, imageUrl, updatedAt: new Date() })
    .where(eq(novedades.id, id))
  revalidatePath('/portal/novedades')
  revalidatePath('/portal/admin/novedades')
  redirect('/portal/admin/novedades')
}

export async function softDeleteNovedad(id: string) {
  await getAdminUser()
  await db.update(novedades)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(novedades.id, id))
  revalidatePath('/portal/novedades')
  revalidatePath('/portal/admin/novedades')
}
