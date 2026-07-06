/**
 * Carga el costo de materia prima de la factura A-00002-00000182 de Bunker BMI
 * S.A. (pasta de maní clásica, insumo para los baldes) en la sección de
 * Finanzas del portal.
 *
 * Es idempotente: si ya existe un costo con el mismo número de factura en las
 * notas, no lo duplica.
 *
 * Uso:
 *   npx tsx scripts/load-costo-bunker-mani.ts
 *
 * Requiere en .env.local: DATABASE_URL (o DIRECT_URL)
 */
import dotenv from 'dotenv'
import postgres from 'postgres'

dotenv.config({ path: '.env.local' })

const DB_URL = process.env.DATABASE_URL ?? process.env.DIRECT_URL
if (!DB_URL) throw new Error('Falta DATABASE_URL (o DIRECT_URL) en .env.local')

const sql = postgres(DB_URL, { prepare: false })

const FACTURA_NRO = 'A-00002-00000182'
const COSTO = {
  concept:   'Pasta de Maní Clásica (828 u.) — Bunker BMI S.A.',
  category:  'materia_prima',
  costDate:  '2026-05-21', // fecha de la factura
  amountArs: 2073891.60,   // total con IVA (828 u. x $2.070 = $1.713.960 + IVA 21% $359.931,60)
  notes: `Factura ${FACTURA_NRO} · Proveedor: Bunker BMI S.A. (CUIT 30-71924006-9). `
       + `828 unidades x $2.070 + IVA. Forma de pago: Cuenta corriente.`,
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

  const existing = await sql`
    SELECT id FROM costs WHERE is_deleted = false AND notes ILIKE ${'%' + FACTURA_NRO + '%'} LIMIT 1
  `

  if (existing.length > 0) {
    console.log(`✓ El costo de la factura ${FACTURA_NRO} ya estaba cargado (id ${existing[0].id}) — no se duplica.`)
    return
  }

  const inserted = await sql`
    INSERT INTO costs (concept, category, amount_ars, cost_date, notes, created_by_user_id)
    VALUES (${COSTO.concept}, ${COSTO.category}, ${COSTO.amountArs.toFixed(2)}, ${COSTO.costDate}, ${COSTO.notes}, ${adminUserId})
    RETURNING id
  `
  console.log(`✓ Costo cargado (id ${inserted[0].id}) — ${COSTO.concept} — $${COSTO.amountArs.toFixed(2)} el ${COSTO.costDate}`)
}

run()
  .catch((e) => { console.error('Error fatal:', e); process.exitCode = 1 })
  .finally(() => sql.end())
