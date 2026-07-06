/**
 * Carga a "El Antonio Distribuidora" (Ushuaia, Tierra del Fuego) como cliente
 * distribuidor del portal B2B, y registra el Pedido Nº 00003129 (06/07/2026):
 * 5 cajas de Miel Sólida + 10 cajas de Miel Líquida a $3.400 la unidad
 * (caja de 12u), sin IVA por estar en zona franca (Ley 19.640), pagadero con
 * E-CHEQ a 60 días.
 *
 * Es idempotente: si el email ya tiene perfil, no lo duplica; si ya existe un
 * pedido con la misma referencia, no lo duplica.
 *
 * Uso:
 *   npx tsx scripts/load-orden-antonio-distribuidora.ts
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

const PEDIDO_REF = 'REF:ANTONIO-DISTRIBUIDORA-PEDIDO-00003129'

const CLIENTE = {
  email:       'elantonio.distribuidora@gmail.com',
  displayName: 'Hernán Emiliano Arguello Bariffuzza',
  company:     'El Antonio Distribuidora',
  cuit:        '20-36513669-7',
  phone:       '+54 9 2901 586998',
  address:     'San Martín 1533',
  city:        'Ushuaia',
  province:    'Tierra del Fuego',
  notes:       'Persona de contacto: Emiliano Arguello. Vendedor asignado: Guido Giambruni. '
             + 'Cliente exento de IVA por estar en zona franca (Ley 19.640, Tierra del Fuego).',
}

const ITEMS = [
  { productId: 'miel-solida-500',  productName: 'Miel Sólida',  variant: 'Sólida',  size: '500g', unitPriceArs: 3400, qty: 5  * 12 },
  { productId: 'miel-liquida-500', productName: 'Miel Líquida', variant: 'Líquida', size: '500g', unitPriceArs: 3400, qty: 10 * 12 },
]

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

async function run() {
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
      INSERT INTO profiles (user_id, role, display_name, company, phone, address, city, province, cuit, notes,
                             vendedor_nombre, vendedor_whatsapp)
      VALUES (${userId}, 'distribuidor', ${CLIENTE.displayName}, ${CLIENTE.company}, ${CLIENTE.phone},
              ${CLIENTE.address}, ${CLIENTE.city}, ${CLIENTE.province}, ${CLIENTE.cuit}, ${CLIENTE.notes},
              'Guido Giambruni', null)
      RETURNING id
    `
    profileId = inserted[0].id
    console.log(`✓ Perfil creado (id ${profileId})`)
  }

  // 3. Pedido (idempotente por referencia en notes) — sin IVA (Tierra del Fuego)
  const subtotal  = ITEMS.reduce((s, i) => s + i.unitPriceArs * i.qty, 0)
  const orderNotes = `${PEDIDO_REF} — Pedido Nº 00003129 (06/07/2026). Sin IVA (zona franca, Ley 19.640). `
                    + `Forma de pago: E-Cheq 60 días. Transporte: LT. Lugar de retiro/entrega: `
                    + `Av. Don Pedro de Mendoza 2661, La Boca (Lu-Vi 9 a 17 hs).`

  const existingOrder = await sql`
    SELECT id FROM orders WHERE user_id = ${userId} AND notes = ${orderNotes} AND is_deleted = false LIMIT 1
  `

  if (existingOrder.length > 0) {
    console.log(`✓ Pedido ya existía (id ${existingOrder[0].id}) — no se duplica`)
  } else {
    const insertedOrder = await sql`
      INSERT INTO orders (
        user_id, channel, status, payment_status, total_ars,
        shipping_method, payment_method, is_custom_order, notes, purchase_order_number
      )
      VALUES (
        ${userId}, 'b2b', 'confirmed', 'unpaid', ${subtotal.toFixed(2)},
        'LT', 'echeq_60', true, ${orderNotes}, '00003129'
      )
      RETURNING id
    `
    const orderId = insertedOrder[0].id

    for (const item of ITEMS) {
      const itemSubtotal = item.unitPriceArs * item.qty
      await sql`
        INSERT INTO order_items (order_id, product_id, product_name, variant, size, unit_price_ars, qty, subtotal_ars)
        VALUES (
          ${orderId}, ${item.productId}, ${item.productName}, ${item.variant}, ${item.size},
          ${item.unitPriceArs.toFixed(2)}, ${item.qty}, ${itemSubtotal.toFixed(2)}
        )
      `
    }
    console.log(`✓ Pedido creado (id ${orderId}) — total sin IVA $${subtotal.toFixed(2)}`)
  }

  // 4. Credenciales (solo si la cuenta es nueva)
  if (isNewUser && tempPassword) {
    const csvPath = path.join(process.env.USERPROFILE ?? '.', 'Downloads', 'antonio-distribuidora-credenciales.csv')
    const csv = ['email,empresa,contrasena_temporal', `${CLIENTE.email},"${CLIENTE.company}",${tempPassword}`].join('\n')
    writeFileSync(csvPath, csv, 'utf-8')
    console.log(`\n🔐 Credenciales guardadas en: ${csvPath}`)
    console.log('   (no se imprimen por consola — revisá el CSV para compartirlas manualmente)')
  }
}

run()
  .catch((e) => { console.error('Error fatal:', e); process.exitCode = 1 })
  .finally(() => sql.end())
