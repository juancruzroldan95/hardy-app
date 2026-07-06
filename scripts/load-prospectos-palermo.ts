/**
 * Carga los prospectos del relevamiento "Prospectos_Palermo" (comercios de
 * Palermo ya contactados por WhatsApp con la oferta de lanzamiento de crema
 * de maní natural 380g) como clientes del portal B2B, y les crea una alerta
 * de seguimiento/recontacto.
 *
 * No todos los prospectos traían email, así que a los que no lo tienen se
 * les genera un email placeholder (@prospecto-hardy.ar) solo para poder
 * crearles la cuenta y el perfil — no se usa para enviarles nada.
 *
 * Las alertas se programan en una ventana de 55 a 75 días (aprox. 60), pero
 * se distribuyen una por día hábil (Lu-Vi) en el orden de la lista, para que
 * no se apilen todas el mismo día y el seguimiento se pueda hacer de forma
 * ordenada.
 *
 * Por cada prospecto:
 *   1. Si ya existe un perfil con el mismo nombre de empresa (ej. un cliente
 *      que ya se dio de alta "de verdad"), lo salta — no duplica.
 *   2. Crea (o reutiliza) el usuario en Supabase Auth con contraseña temporal.
 *   3. Crea su perfil en public.profiles (rol: mayorista).
 *   4. Crea una client_alert de tipo 'custom' con fecha escalonada.
 * Es idempotente: si el email ya tiene perfil, no lo duplica; si ya existe
 * una alerta de seguimiento no resuelta con el mismo mensaje, no la duplica.
 *
 * Uso:
 *   npx tsx scripts/load-prospectos-palermo.ts
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL (o DIRECT_URL)
 *
 * Las credenciales generadas (email + contraseña temporal) se escriben en
 * un CSV local — nunca se imprimen por consola ni se commitean al repo.
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

const FOLLOWUP_MIN_DAYS = 55
const FOLLOWUP_MAX_DAYS = 75

interface Prospecto {
  tipo:      string
  nombre:    string
  direccion: string
  telefono:  string
}

// Extraído de Prospectos_Palermo.ods
export const PROSPECTOS: Prospecto[] = [
  { tipo: 'BOX',         nombre: 'Kasten Training',                      direccion: 'Godoy Cruz 2037',                    telefono: '+54 11 4774-3680' },
  { tipo: 'BOX',         nombre: 'AIRESFITBOX',                          direccion: 'El Salvador 4037',                   telefono: '+54 9 11 2253-6196' },
  { tipo: 'BOX',         nombre: 'OPEN BOX 24/7 HYROX',                  direccion: 'Ortega y Gasset 1707',               telefono: '+54 9 11 3508-1127' },
  { tipo: 'BOX',         nombre: 'AnimalX Life Style Palermo',           direccion: 'Av. Sta. Fe 4276',                   telefono: '+54 11 3780-7301' },
  { tipo: 'BOX',         nombre: 'Clinch House',                        direccion: 'Av. R. Scalabrini Ortiz 1147',       telefono: '+54 9 11 4035-8561' },
  { tipo: 'DIETETICA',   nombre: 'Cacau Natural Market',                 direccion: 'Malabia 2221',                       telefono: '+54 11 7621-3691' },
  { tipo: 'DIETETICA',   nombre: 'Hoppy Dietética Las Heras',            direccion: 'Silvio L. Ruggeri 2744',             telefono: '+54 11 5332-0260' },
  { tipo: 'DIETETICA',   nombre: 'Nogal Dietética',                      direccion: 'Fray J. Sta. María de Oro 2595',     telefono: '+54 11 5105-8685' },
  { tipo: 'DIETETICA',   nombre: 'Dietetica Tienda Callao Scalabrini',   direccion: 'Av. R. Scalabrini Ortiz 1771',       telefono: '+54 11 2407-9112' },
  { tipo: 'DIETETICA',   nombre: 'Badian Natural Market',                direccion: 'Bonpland 2013',                      telefono: '5491160310067' },
  { tipo: 'SUPLEMENTOS', nombre: 'Suplementos Deportivos CABA',          direccion: 'Av. R. Scalabrini Ortiz 2069',       telefono: '+54 9 11 6437-2321' },
  { tipo: 'SUPLEMENTOS', nombre: 'Cuerpo Blindado',                      direccion: 'Av. R. Scalabrini Ortiz 1235',       telefono: '+54 11 3904-8930' },
  { tipo: 'SUPLEMENTOS', nombre: 'HEDGEHOG Suplementos',                 direccion: 'Charcas 3786',                       telefono: '+54 11 5563-8172' },
  { tipo: 'SUPLEMENTOS', nombre: 'Pitbull Suplementos',                  direccion: 'Av. Sta. Fe 4108',                   telefono: '+54 11 3102-9846' },
  { tipo: 'SUPLEMENTOS', nombre: 'ADN Nutrition',                        direccion: 'Av. Córdoba 4685',                   telefono: '+54 11 4779-9399' },
]

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
// connection pooler (pgbouncer) requiere prepare:false
const sql = postgres(DB_URL, { prepare: false })

function generateTempPassword(): string {
  return `Hardy2026$${randomBytes(4).toString('hex').toUpperCase()}`
}

function slugify(name: string): string {
  return name
    .normalize('NFD').replace(/[̀-ͯ]/g, '') // saca acentos
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function placeholderEmail(name: string): string {
  return `${slugify(name)}@prospecto-hardy.ar`
}

/** Días hábiles (Lu-Vi) a partir de hoy+minDays, uno por prospecto, hasta hoy+maxDays. */
function distribuirFechasHabiles(count: number, minDays: number, maxDays: number): Date[] {
  const fechas: Date[] = []
  const d = new Date()
  d.setDate(d.getDate() + minDays)
  const limite = new Date()
  limite.setDate(limite.getDate() + maxDays)

  while (fechas.length < count && d <= limite) {
    const dow = d.getDay() // 0 domingo, 6 sábado
    if (dow !== 0 && dow !== 6) fechas.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  // Si se acabó la ventana de días hábiles antes de cubrir todos los prospectos,
  // seguimos asignando de a uno por día hábil más allá del máximo.
  while (fechas.length < count) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) fechas.push(new Date(d))
    d.setDate(d.getDate() + 1)
  }
  return fechas
}

async function findAuthUserIdByEmail(email: string): Promise<string | null> {
  const result = await sql`SELECT id FROM auth.users WHERE email = ${email} LIMIT 1`
  return result[0]?.id ?? null
}

async function findExistingProfileByCompany(nombre: string): Promise<string | null> {
  const result = await sql`
    SELECT id FROM profiles
    WHERE is_deleted = false AND (upper(company) = upper(${nombre}) OR upper(display_name) = upper(${nombre}))
    LIMIT 1
  `
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

  const fechas = distribuirFechasHabiles(PROSPECTOS.length, FOLLOWUP_MIN_DAYS, FOLLOWUP_MAX_DAYS)

  const credenciales: { email: string; empresa: string; tempPassword: string }[] = []
  let creados = 0
  let reutilizados = 0
  let saltadosPorDuplicado = 0
  let alertasCreadas = 0
  let alertasExistentes = 0
  const errores: { nombre: string; error: string }[] = []

  let fechaIdx = 0

  for (const p of PROSPECTOS) {
    try {
      const existingByCompany = await findExistingProfileByCompany(p.nombre)
      if (existingByCompany) {
        console.log(`— ${p.nombre}: ya existe un perfil con ese nombre de empresa, se salta.`)
        saltadosPorDuplicado++
        continue
      }

      const email = placeholderEmail(p.nombre)
      let userId = await findAuthUserIdByEmail(email)
      let tempPassword: string | null = null

      if (!userId) {
        tempPassword = generateTempPassword()
        const { data, error } = await admin.auth.admin.createUser({
          email,
          password: tempPassword,
          email_confirm: true,
        })
        if (error) {
          errores.push({ nombre: p.nombre, error: `auth: ${error.message}` })
          continue
        }
        userId = data.user!.id
        creados++
        credenciales.push({ email, empresa: p.nombre, tempPassword })
      } else {
        reutilizados++
      }

      const existingProfile = await sql`SELECT id FROM profiles WHERE user_id = ${userId} LIMIT 1`
      let profileId: string

      const notes = `Prospecto — Barrio Palermo (${p.tipo}). Contactado por WhatsApp con oferta de lanzamiento `
                  + `(crema de maní natural 380g, stock limitado). ⚠️ Email genérico (placeholder) — actualizar cuando se consiga el real.`

      if (existingProfile.length > 0) {
        profileId = existingProfile[0].id
      } else {
        const inserted = await sql`
          INSERT INTO profiles (user_id, role, display_name, company, phone, address, city, province, notes)
          VALUES (${userId}, 'mayorista', ${p.nombre}, ${p.nombre}, ${p.telefono}, ${p.direccion}, 'Palermo', 'CABA', ${notes})
          RETURNING id
        `
        profileId = inserted[0].id
      }

      const scheduledFor = fechas[fechaIdx]
      fechaIdx++
      const mensaje = `Seguimiento — Prospecto Palermo (${p.nombre}). Contactado por WhatsApp con oferta de lanzamiento, revisar respuesta/pedido.`

      const existingAlert = await sql`
        SELECT id FROM client_alerts
        WHERE profile_id = ${profileId} AND is_resolved = false AND is_deleted = false AND mensaje = ${mensaje}
        LIMIT 1
      `

      if (existingAlert.length > 0) {
        alertasExistentes++
      } else {
        await sql`
          INSERT INTO client_alerts (profile_id, tipo, mensaje, scheduled_for, created_by_user_id)
          VALUES (${profileId}, 'custom', ${mensaje}, ${scheduledFor.toISOString()}, ${adminUserId})
        `
        alertasCreadas++
      }

      console.log(`✓ ${p.nombre} — perfil ${existingProfile.length > 0 ? 'existente' : 'creado'}, alerta ${existingAlert.length > 0 ? 'ya existía' : `programada ${scheduledFor.toISOString().slice(0, 10)}`}`)
    } catch (e) {
      errores.push({ nombre: p.nombre, error: e instanceof Error ? e.message : String(e) })
      console.error(`✗ ${p.nombre} — error:`, e)
    }
  }

  console.log('\n── Resumen ──')
  console.log(`Total prospectos en la planilla:  ${PROSPECTOS.length}`)
  console.log(`Saltados (ya eran clientes):       ${saltadosPorDuplicado}`)
  console.log(`Usuarios Auth creados:             ${creados}`)
  console.log(`Usuarios Auth reutilizados:        ${reutilizados}`)
  console.log(`Alertas de seguimiento creadas:     ${alertasCreadas} (distribuidas entre +${FOLLOWUP_MIN_DAYS} y +${FOLLOWUP_MAX_DAYS} días hábiles)`)
  console.log(`Alertas ya existentes:              ${alertasExistentes}`)
  console.log(`Errores:                            ${errores.length}`)
  if (errores.length > 0) {
    console.log('\nDetalle de errores:')
    errores.forEach((e) => console.log(`  - ${e.nombre}: ${e.error}`))
  }

  if (credenciales.length > 0) {
    const csvPath = path.join(process.env.USERPROFILE ?? '.', 'Downloads', 'prospectos-palermo-credenciales.csv')
    const csv = ['email,empresa,contrasena_temporal']
      .concat(credenciales.map((c) => `${c.email},"${c.empresa.replace(/"/g, '""')}",${c.tempPassword}`))
      .join('\n')
    writeFileSync(csvPath, csv, 'utf-8')
    console.log(`\n🔐 Credenciales de ${credenciales.length} cuentas nuevas guardadas en: ${csvPath}`)
    console.log('   (no se imprimen por consola — revisá el CSV para compartirlas manualmente)')
  }
}

run()
  .catch((e) => { console.error('Error fatal:', e); process.exitCode = 1 })
  .finally(() => sql.end())
