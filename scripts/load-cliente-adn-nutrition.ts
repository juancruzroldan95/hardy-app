/**
 * Carga a "Adn Nutrition" (razón social XCORE S.R.L., CUIT 30-71910348-7)
 * como cliente mayorista del portal B2B, registra su primer pedido
 * (4 cajas de Crema de Maní Natural 380g, pagado por transferencia) y
 * programa una alerta de seguimiento/recompra a 60 días.
 *
 * Es idempotente: si el email ya tiene perfil, no lo duplica; si ya existe
 * un pedido con la misma referencia, no lo duplica; si ya existe una alerta
 * de reorder no resuelta con el mismo mensaje, no la duplica.
 *
 * Uso:
 *   npx tsx scripts/load-cliente-adn-nutrition.ts
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL (o DIRECT_URL)
 *
 * La contraseña temporal generada (si la cuenta es nueva) se escribe en un
 * CSV local — nunca se imprime por consola ni se commitea al repo.
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'
import { randomBytes } from 'crypto'
import { writeFileSync } from 'fs'
import path from 'path'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const DB_URL           = process.env.DATABASE_URL ?? process.env.DIRECT_URL

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env.local')
}
if (!DB_URL) {
  throw new Error('Falta DATABASE_URL (o DIRECT_URL) en .env.local')
}

const FOLLOWUP_DAYS = 60
const ORDER_REF      = 'REF:ADN-NUTRITION-4CAJAS-NATURAL-2026'

const CLIENTE = {
  email:       'adnpalermo@gmail.com',
  displayName: 'Adn Nutrition',
  company:     'ADN NUTRITION',
  cuit:        '30-71910348-7', // razón social de facturación: XCORE S.R.L.
  phone:       '+54 9 11 3167-5253',
  address:     'Av. Córdoba 4685, C1414 BAE',
  city:        'Palermo',
  province:    'CABA',
  notes:       'Razón social de facturación: XCORE S.R.L. (CUIT 30-71910348-7). '
             + 'Nombre comercial / contacto de WhatsApp: "Adn Nutrition" (Av. Córdoba 4685, Palermo, CABA).',
}

const PEDIDO = {
  productId:    'natural-380',
  productName:  'Crema de Maní Natural',
  variant:      'Natural',
  size:         '380g',
  unitPriceArs: 1900,
  qty:          60, // 4 cajas x 15 unidades c/u
  shippingCost: 5000,
}

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
// connection pooler (pgbouncer) requiere prepare:false
const sql = postgres(DB_URL, { prepare: false })

function generateTempPassword(): string {
  return `Hardy2026$${randomBytes(4).toString('hex').toUpperCase()}`
}

async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const result = await sql`SELECT id FROM auth.users WHERE email = ${email} LIMIT 1`
  return result[0]?.id ?? null
}

async function findAdminUserId(): Promise<string> {
  const result = await sql`
    SELECT user_id FROM profiles WHERE role = 'admin' AND is_deleted = false LIMIT 1
  `
  if (!result[0]?.user_id) throw new Error('No se encontró ningún perfil admin activo en profiles.')
  return result[0].user_id
}

async function run() {
  const adminUserId = await findAdminUserId()

  // 1. Usuario en Supabase Auth
  let userId = await findAuthUserIdByEmail(CLIENTE.email)
  let tempPassword: string | null = null
  let isNewUser = false

  if (!userId) {
    isNewUser = true
    tempPassword = generateTempPassword()
    const { data, error } = await admin.auth.admin.createUser({
      email: CLIENTE.email,
      password: tempPassword,
      email_confirm: true,
    })
    if (error) throw new Error(`Error al crear usuario en Supabase Auth: ${error.message}`)
    userId = data.user!.id
    console.log(`✓ Usuario Auth creado: ${CLIENTE.email}`)
  } else {
    console.log(`✓ Usuario Auth ya existía: ${CLIENTE.email}`)
  }

  // 2. Perfil en public.profiles
  const existingProfile = await sql`SELECT id FROM profiles WHERE user_id = ${userId} LIMIT 1`
  let profileId: string

  if (existingProfile.length > 0) {
    profileId = existingProfile[0].id
    console.log(`✓ Perfil ya existía (id ${profileId})`)
  } else {
    const inserted = await sql`
      INSERT INTO profiles (user_id, role, display_name, company, phone, address, city, province, cuit, notes)
      VALUES (${userId}, 'mayorista', ${CLIENTE.displayName}, ${CLIENTE.company}, ${CLIENTE.phone},
              ${CLIENTE.address}, ${CLIENTE.city}, ${CLIENTE.province}, ${CLIENTE.cuit}, ${CLIENTE.notes})
      RETURNING id
    `
    profileId = inserted[0].id
    console.log(`✓ Perfil creado (id ${profileId})`)
  }

  // 3. Pedido (idempotente por referencia en notes)
  const subtotalNeto = PEDIDO.unitPriceArs * PEDIDO.qty
  const totalConIva  = (subtotalNeto + PEDIDO.shippingCost) * 1.21
  const orderNotes   = `${ORDER_REF} — Pedido cargado manualmente desde WhatsApp: 4 cajas (${PEDIDO.qty} u.) `
                     + `de Crema de Maní Natural 380g a $${PEDIDO.unitPriceArs}+IVA la unidad. Pagado por transferencia.`

  const existingOrder = await sql`
    SELECT id FROM orders WHERE user_id = ${userId} AND notes = ${orderNotes} AND is_deleted = false LIMIT 1
  `

  if (existingOrder.length > 0) {
    console.log(`✓ Pedido ya existía (id ${existingOrder[0].id}) — no se duplica`)
  } else {
    const insertedOrder = await sql`
      INSERT INTO orders (
        user_id, channel, status, payment_status, total_ars,
        shipping_method, payment_method, is_custom_order, notes, shipping_cost
      )
      VALUES (
        ${userId}, 'b2b', 'confirmed', 'paid', ${totalConIva.toFixed(2)},
        'Flete', 'transferencia', true, ${orderNotes}, ${PEDIDO.shippingCost.toFixed(2)}
      )
      RETURNING id
    `
    const orderId = insertedOrder[0].id

    await sql`
      INSERT INTO order_items (order_id, product_id, product_name, variant, size, unit_price_ars, qty, subtotal_ars)
      VALUES (
        ${orderId}, ${PEDIDO.productId}, ${PEDIDO.productName}, ${PEDIDO.variant}, ${PEDIDO.size},
        ${PEDIDO.unitPriceArs.toFixed(2)}, ${PEDIDO.qty}, ${subtotalNeto.toFixed(2)}
      )
    `
    console.log(`✓ Pedido creado (id ${orderId}) — total con IVA $${totalConIva.toFixed(2)}`)
  }

  // 4. Alerta de seguimiento y recompra a 60 días
  const scheduledFor = new Date(Date.now() + FOLLOWUP_DAYS * 24 * 60 * 60 * 1000)
  const alertMensaje = `Seguimiento y recompra — Adn Nutrition. Compró 4 cajas (${PEDIDO.qty} u.) de Natural 380g. `
                     + `Contactar para reposición (~${FOLLOWUP_DAYS} días desde la compra).`

  const existingAlert = await sql`
    SELECT id FROM client_alerts
    WHERE profile_id = ${profileId} AND is_resolved = false AND is_deleted = false AND mensaje = ${alertMensaje}
    LIMIT 1
  `

  if (existingAlert.length > 0) {
    console.log(`✓ Alerta de seguimiento ya existía (id ${existingAlert[0].id})`)
  } else {
    const insertedAlert = await sql`
      INSERT INTO client_alerts (profile_id, tipo, mensaje, scheduled_for, created_by_user_id)
      VALUES (${profileId}, 'reorder', ${alertMensaje}, ${scheduledFor.toISOString()}, ${adminUserId})
      RETURNING id
    `
    console.log(`✓ Alerta de seguimiento programada (id ${insertedAlert[0].id}) para ${scheduledFor.toISOString().slice(0, 10)}`)
  }

  // 5. Credenciales (solo si la cuenta es nueva)
  if (isNewUser && tempPassword) {
    const csvPath = path.join(process.env.USERPROFILE ?? '.', 'Downloads', 'adn-nutrition-credenciales.csv')
    const csv = ['email,empresa,contrasena_temporal', `${CLIENTE.email},"${CLIENTE.company}",${tempPassword}`].join('\n')
    writeFileSync(csvPath, csv, 'utf-8')
    console.log(`\n🔐 Credenciales guardadas en: ${csvPath}`)
    console.log('   (no se imprimen por consola — revisá el CSV para compartirlas manualmente)')
  }
}

run()
  .catch((e) => { console.error('Error fatal:', e); process.exitCode = 1 })
  .finally(() => sql.end())
