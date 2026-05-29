'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, orders, orderItems, solicitudes, novedades, clientAlerts } from '@/drizzle/schema'
import { and, eq, sql as drizzleSql } from 'drizzle-orm'
import type { EstadoSolicitud, OrderStatus, PaymentStatus, AlertTipo, UserRole } from '@/drizzle/schema'
import { sendOrderStatusUpdate } from '@/lib/email'

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

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, id),
  })

  await db.update(orders)
    .set({
      status,
      ...(paymentStatus ? { paymentStatus } : {}),
      updatedAt: new Date(),
    })
    .where(eq(orders.id, id))

  revalidatePath('/portal/admin/pedidos')
  revalidatePath(`/portal/admin/pedidos/${id}`)

  // Email al cliente con el nuevo estado
  if (order) {
    try {
      // Obtener email del cliente desde auth.users
      const result = await db.execute(
        drizzleSql`SELECT email FROM auth.users WHERE id = ${order.userId}::uuid`
      )
      const clientEmail = (result as unknown as Array<{ email: string }>)[0]?.email

      if (clientEmail) {
        const clientProfile = await db.query.profiles.findFirst({
          where: and(eq(profiles.userId, order.userId), eq(profiles.isDeleted, false)),
        })
        await sendOrderStatusUpdate({
          orderId:     order.id,
          orderDate:   order.createdAt,
          clientName:  clientProfile?.company ?? clientProfile?.displayName ?? clientEmail,
          clientEmail,
          newStatus:   status,
          totalArs:    Number(order.totalArs),
        })
      }
    } catch (e) {
      console.error('[email] Error al enviar estado de pedido:', e)
    }
  }
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

// ─── Client Alerts ─────────────────────────────────────────────────────────────

export async function createClientAlert(
  profileId:    string,
  tipo:         AlertTipo,
  mensaje:      string,
  scheduledFor?: string | null,
) {
  const { user } = await getAdminUser()
  if (!mensaje.trim()) return

  await db.insert(clientAlerts).values({
    profileId,
    tipo,
    mensaje:         mensaje.trim(),
    scheduledFor:    scheduledFor ? new Date(scheduledFor) : null,
    createdByUserId: user.id,
  })
  revalidatePath('/portal/admin/clientes')
}

export async function resolveClientAlert(alertId: string) {
  await getAdminUser()
  await db.update(clientAlerts)
    .set({ isResolved: true, resolvedAt: new Date(), updatedAt: new Date() })
    .where(eq(clientAlerts.id, alertId))
  revalidatePath('/portal/admin/clientes')
}

export async function deleteClientAlert(alertId: string) {
  await getAdminUser()
  await db.update(clientAlerts)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(clientAlerts.id, alertId))
  revalidatePath('/portal/admin/clientes')
}

// ─── Client Notes ──────────────────────────────────────────────────────────────

export async function updateClientNotes(profileId: string, notes: string) {
  await getAdminUser()
  await db.update(profiles)
    .set({ notes: notes.trim() || null, updatedAt: new Date() })
    .where(eq(profiles.id, profileId))
  revalidatePath('/portal/admin/clientes')
}

// ─── Client Role ──────────────────────────────────────────────────────────────

export async function updateClientRole(profileId: string, role: UserRole) {
  await getAdminUser()
  await db.update(profiles)
    .set({ role, updatedAt: new Date() })
    .where(eq(profiles.id, profileId))
  revalidatePath('/portal/admin/clientes')
}

// ─── Create Client Profile ────────────────────────────────────────────────────
// Busca al usuario en auth.users por email y crea el perfil en public.profiles.
// El usuario debe estar invitado en Supabase Dashboard antes de ejecutar esto.

export type CreateClientState = { error: string } | { success: true; displayName: string } | undefined

export async function createClientProfile(
  _prev: CreateClientState,
  formData: FormData,
): Promise<CreateClientState> {
  await getAdminUser()

  const email       = (formData.get('email')       as string)?.trim().toLowerCase()
  const displayName = (formData.get('displayName') as string)?.trim()
  const company     = (formData.get('company')     as string)?.trim() || null
  const role        = (formData.get('role')        as UserRole) ?? 'mayorista'
  const phone       = (formData.get('phone')       as string)?.trim() || null
  const city        = (formData.get('city')        as string)?.trim() || null
  const province    = (formData.get('province')    as string)?.trim() || null
  const cuit        = (formData.get('cuit')        as string)?.trim() || null
  const address     = (formData.get('address')     as string)?.trim() || null

  if (!email)       return { error: 'El email es requerido.' }
  if (!displayName) return { error: 'El nombre es requerido.' }

  // Buscar en auth.users por email
  let authUserId: string | null = null
  try {
    const result = await db.execute(
      drizzleSql`SELECT id FROM auth.users WHERE email = ${email} LIMIT 1`
    )
    authUserId = (result as unknown as Array<{ id: string }>)[0]?.id ?? null
  } catch {
    return { error: 'Error al consultar la base de datos.' }
  }

  if (!authUserId) {
    return {
      error: `No se encontró un usuario con el email "${email}" en Supabase Auth. Primero invitalo desde el Dashboard de Supabase (Authentication → Users → Invite user).`,
    }
  }

  // Verificar que no tenga perfil ya
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, authUserId),
  })
  if (existing) {
    return { error: 'Este usuario ya tiene un perfil en el portal.' }
  }

  await db.insert(profiles).values({
    userId:      authUserId,
    role,
    displayName,
    company,
    phone,
    city,
    province,
    cuit,
    address,
  })

  revalidatePath('/portal/admin/clientes')
  return { success: true, displayName }
}

// ─── Update Alert Scheduled Date ─────────────────────────────────────────────

export async function updateAlertScheduledDate(alertId: string, scheduledFor: string | null) {
  await getAdminUser()
  await db.update(clientAlerts)
    .set({
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      updatedAt: new Date(),
    })
    .where(eq(clientAlerts.id, alertId))
  revalidatePath('/portal/admin/clientes')
}
