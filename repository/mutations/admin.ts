'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/services/supabase/server'
import { db } from '@/db'
import { profiles, orders, solicitudes, novedades, clientAlerts, orderMessages } from '@/db/schema'
import { and, eq, sql as drizzleSql } from 'drizzle-orm'
import type { EstadoSolicitud, OrderStatus, PaymentStatus, AlertTipo, UserRole } from '@/db/schema'
import { sendOrderStatusUpdate, sendReviewRequest } from '@/services/resend'
import { createAdminClient } from '@/services/supabase/admin'

// ─── Guard ─────────────────────────────────────────────────────────────────────

export async function getAdminUser() {
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
        const clientProfile = order.userId
          ? await db.query.profiles.findFirst({
              where: and(eq(profiles.userId, order.userId), eq(profiles.isDeleted, false)),
            })
          : null
        await sendOrderStatusUpdate({
          orderId:     order.id,
          orderDate:   order.createdAt,
          clientName:  clientProfile?.company ?? clientProfile?.displayName ?? clientEmail,
          clientEmail,
          newStatus:   status,
          totalArs:    Number(order.totalArs),
        })

        // Cuando el pedido se entrega → pedir reseña
        if (status === 'delivered') {
          const orderWithItems = await db.query.orders.findFirst({
            where: eq(orders.id, id),
            with: { items: true },
          })
          if (orderWithItems?.items?.length) {
            await sendReviewRequest({
              to:          clientEmail,
              clientName:  clientProfile?.displayName ?? clientProfile?.company ?? clientEmail,
              orderNumber: order.id.slice(-8).toUpperCase(),
              items:       orderWithItems.items.map((i) => ({
                productName: i.productName,
                productId:   i.productId,
              })),
            })
          }
        }
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

export type CreateClientState =
  | { error: string }
  | { success: true; displayName: string; email: string; tempPassword?: string; linkedExisting?: boolean }
  | undefined

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

  // 1. Verificar si ya existe en auth.users por email
  let authUserId: string | null = null
  let isNewUser = false
  let tempPassword = ''

  try {
    const result = await db.execute(
      drizzleSql`SELECT id FROM auth.users WHERE email = ${email} LIMIT 1`
    )
    authUserId = (result as unknown as Array<{ id: string }>)[0]?.id ?? null
  } catch (e) {
    console.error('Error al consultar auth.users por email:', e)
  }

  // 2. Si no existe, lo creamos en Supabase Auth
  if (!authUserId) {
    isNewUser = true
    const randomStr = Math.random().toString(36).substring(2, 8).toUpperCase()
    tempPassword = `Hardy2026$${randomStr}`

    try {
      const adminClient = createAdminClient()
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password: tempPassword,
        email_confirm: true,
      })

      if (authError) {
        return { error: `Error al crear usuario en Supabase Auth: ${authError.message}` }
      }
      authUserId = authData.user?.id ?? null
    } catch (e) {
      console.error('Error con Supabase Admin Client:', e)
      return { error: 'Error de comunicación con Supabase Auth.' }
    }
  }

  if (!authUserId) {
    return { error: 'No se pudo crear o resolver el ID de usuario en Supabase Auth.' }
  }

  // 3. Verificar que no tenga un perfil ya creado en la DB
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, authUserId),
  })
  if (existing) {
    return { error: 'Este usuario ya tiene un perfil en el portal.' }
  }

  // 4. Insertar el perfil
  try {
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
  } catch (e) {
    console.error('Error al insertar perfil:', e)
    return { error: 'Error al guardar el perfil en la base de datos.' }
  }

  revalidatePath('/portal/admin/clientes')

  const params = new URLSearchParams()
  params.set('success', 'true')
  params.set('displayName', displayName)
  params.set('email', email)
  if (isNewUser && tempPassword) {
    params.set('tempPassword', tempPassword)
  } else {
    params.set('linkedExisting', 'true')
  }

  redirect(`/portal/admin/clientes/nuevo?${params.toString()}`)
}

// ─── Crear acceso desde solicitud ──────────────────────────────────────────────

export type CreateAccessState =
  | { success: true; email: string; tempPassword: string; displayName: string }
  | { error: string }
  | undefined

export async function createPortalAccessFromSolicitud(
  solicitudId: string,
  _prev: CreateAccessState,
  formData: FormData,
): Promise<CreateAccessState> {
  await getAdminUser()

  const email       = (formData.get('email')       as string)?.trim().toLowerCase()
  const displayName = (formData.get('displayName') as string)?.trim()
  const company     = (formData.get('company')     as string)?.trim() || null
  const role        = (formData.get('role')        as string)?.trim() as UserRole
  const phone       = (formData.get('phone')       as string)?.trim() || null
  const cuit        = (formData.get('cuit')        as string)?.trim() || null
  const city        = (formData.get('city')        as string)?.trim() || null
  const province    = (formData.get('province')    as string)?.trim() || null
  const password    = (formData.get('password')    as string)?.trim()

  if (!email || !displayName || !role) {
    return { error: 'Email, nombre y rol son obligatorios.' }
  }
  if (!password || password.length < 6) {
    return { error: 'La contraseña debe tener al menos 6 caracteres.' }
  }

  // 1. Buscar si ya existe en auth.users
  let authUserId: string | null = null

  try {
    const result = await db.execute(
      drizzleSql`SELECT id FROM auth.users WHERE email = ${email} LIMIT 1`
    )
    authUserId = (result as unknown as Array<{ id: string }>)[0]?.id ?? null
  } catch (e) {
    console.error('Error al consultar auth.users:', e)
  }

  // 2. Si no existe, crear en Supabase Auth con la contraseña elegida
  if (!authUserId) {
    try {
      const adminClient = createAdminClient()
      const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (authError) return { error: `Error en Supabase Auth: ${authError.message}` }
      authUserId = authData.user?.id ?? null
    } catch (e) {
      console.error('Error Supabase Admin:', e)
      return { error: 'Error de comunicación con Supabase Auth.' }
    }
  }

  if (!authUserId) return { error: 'No se pudo obtener el ID de usuario.' }

  // 3. Verificar que no tenga perfil ya creado
  const existing = await db.query.profiles.findFirst({
    where: eq(profiles.userId, authUserId),
  })
  if (existing) return { error: 'Este email ya tiene un perfil activo en el portal.' }

  // 4. Crear el perfil
  try {
    await db.insert(profiles).values({
      userId: authUserId, role, displayName, company, phone, cuit, city, province,
    })
  } catch (e) {
    console.error('Error al insertar perfil:', e)
    return { error: 'Error al guardar el perfil.' }
  }

  // 5. Marcar la solicitud como aprobada
  await db.update(solicitudes)
    .set({ estado: 'aprobada', updatedAt: new Date() })
    .where(eq(solicitudes.id, solicitudId))

  revalidatePath(`/portal/admin/solicitudes/${solicitudId}`)
  revalidatePath('/portal/admin/solicitudes')
  revalidatePath('/portal/admin/clientes')

  return { success: true, email, tempPassword: password, displayName }
}

// ─── Edit Client Profile (Admin) ──────────────────────────────────────────────

export type EditClientState = { error: string } | { success: true } | undefined

export async function updateClientProfileAdmin(
  profileId: string,
  _prev: EditClientState,
  formData: FormData,
): Promise<EditClientState> {
  await getAdminUser()

  const displayName = (formData.get('displayName') as string)?.trim()
  const company     = (formData.get('company')     as string)?.trim() || null
  const role        = (formData.get('role')        as UserRole) ?? 'mayorista'
  const phone       = (formData.get('phone')       as string)?.trim() || null
  const city        = (formData.get('city')        as string)?.trim() || null
  const province    = (formData.get('province')    as string)?.trim() || null
  const cuit        = (formData.get('cuit')        as string)?.trim() || null
  const address     = (formData.get('address')     as string)?.trim() || null

  if (!displayName) return { error: 'El nombre es requerido.' }

  try {
    await db.update(profiles)
      .set({
        displayName,
        company,
        role,
        phone,
        city,
        province,
        cuit,
        address,
        updatedAt: new Date(),
      })
      .where(eq(profiles.id, profileId))
  } catch (e) {
    console.error('Error al actualizar perfil de cliente:', e)
    return { error: 'Error al actualizar el perfil en la base de datos.' }
  }

  revalidatePath('/portal/admin/clientes')
  revalidatePath(`/portal/admin/clientes/${profileId}/editar`)
  redirect('/portal/admin/clientes')
}

// ─── Imputar pago ─────────────────────────────────────────────────────────────

export async function imputarPago(orderId: string) {
  await getAdminUser()
  const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) })
  if (!order) return
  await db.update(orders)
    .set({ paymentStatus: 'paid', updatedAt: new Date() })
    .where(eq(orders.id, orderId))
  revalidatePath('/portal/admin/pedidos')
  revalidatePath(`/portal/admin/pedidos/${orderId}`)
  revalidatePath(`/portal/pedidos/${orderId}`)
}

// ─── Tracking number ──────────────────────────────────────────────────────────

export async function updateTrackingNumber(orderId: string, trackingNumber: string) {
  await getAdminUser()
  await db.update(orders)
    .set({ trackingNumber: trackingNumber.trim() || null, updatedAt: new Date() })
    .where(eq(orders.id, orderId))
  revalidatePath(`/portal/admin/pedidos/${orderId}`)
  revalidatePath(`/portal/pedidos/${orderId}`)
}

// ─── Order messages ───────────────────────────────────────────────────────────

export async function sendOrderMessage(orderId: string, message: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (!profile) redirect('/login')

  const msgText = message.trim()
  if (!msgText) return

  await db.insert(orderMessages).values({
    orderId,
    senderUserId: user.id,
    isAdmin:      profile.role === 'admin',
    message:      msgText,
  })

  revalidatePath(`/portal/pedidos/${orderId}`)
  revalidatePath(`/portal/admin/pedidos/${orderId}`)
}

export async function deleteOrderMessage(messageId: string) {
  await getAdminUser()
  await db.update(orderMessages)
    .set({ isDeleted: true })
    .where(eq(orderMessages.id, messageId))
  revalidatePath('/portal/admin/pedidos')
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
