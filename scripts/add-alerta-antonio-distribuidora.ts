/**
 * Programa una alerta de seguimiento a 60 días en el perfil de "El Antonio
 * Distribuidora" para chequear el cobro del E-Cheq del Pedido Nº 00003129 y
 * hacer seguimiento de cómo vienen las ventas.
 *
 * Es idempotente: si ya existe una alerta no resuelta con el mismo mensaje,
 * no la duplica.
 *
 * Uso:
 *   npx tsx scripts/add-alerta-antonio-distribuidora.ts
 *
 * Requiere en .env.local: DATABASE_URL (o DIRECT_URL)
 */
import dotenv from 'dotenv'
import postgres from 'postgres'

dotenv.config({ path: '.env.local' })

const DB_URL = process.env.DATABASE_URL ?? process.env.DIRECT_URL
if (!DB_URL) throw new Error('Falta DATABASE_URL (o DIRECT_URL) en .env.local')

const sql = postgres(DB_URL, { prepare: false })

const CLIENTE_EMAIL = 'elantonio.distribuidora@gmail.com'
const FOLLOWUP_DAYS = 60
const MENSAJE = 'Seguimiento — El Antonio Distribuidora. Chequear cobro del E-Cheq a 60 días '
              + '(Pedido Nº 00003129) y ver cómo vienen las ventas para coordinar el próximo pedido.'

async function findAdminUserId(): Promise<string> {
  const result = await sql`
    SELECT user_id FROM profiles WHERE role = 'admin' AND is_deleted = false LIMIT 1
  `
  if (!result[0]?.user_id) throw new Error('No se encontró ningún perfil admin activo en profiles.')
  return result[0].user_id
}

async function run() {
  const adminUserId = await findAdminUserId()

  const authUser = await sql`SELECT id FROM auth.users WHERE email = ${CLIENTE_EMAIL} LIMIT 1`
  if (!authUser[0]?.id) throw new Error(`No se encontró un usuario Auth con el email ${CLIENTE_EMAIL}`)

  const profile = await sql`SELECT id FROM profiles WHERE user_id = ${authUser[0].id} AND is_deleted = false LIMIT 1`
  if (!profile[0]?.id) throw new Error(`No se encontró un perfil para el usuario ${CLIENTE_EMAIL}`)
  const profileId = profile[0].id

  const existingAlert = await sql`
    SELECT id FROM client_alerts
    WHERE profile_id = ${profileId} AND is_resolved = false AND is_deleted = false AND mensaje = ${MENSAJE}
    LIMIT 1
  `

  if (existingAlert.length > 0) {
    console.log(`✓ La alerta ya existía (id ${existingAlert[0].id}) — no se duplica.`)
    return
  }

  const scheduledFor = new Date(Date.now() + FOLLOWUP_DAYS * 24 * 60 * 60 * 1000)

  const inserted = await sql`
    INSERT INTO client_alerts (profile_id, tipo, mensaje, scheduled_for, created_by_user_id)
    VALUES (${profileId}, 'payment', ${MENSAJE}, ${scheduledFor.toISOString()}, ${adminUserId})
    RETURNING id
  `
  console.log(`✓ Alerta programada (id ${inserted[0].id}) para ${scheduledFor.toISOString().slice(0, 10)}`)
}

run()
  .catch((e) => { console.error('Error fatal:', e); process.exitCode = 1 })
  .finally(() => sql.end())
