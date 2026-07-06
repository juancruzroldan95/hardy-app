/**
 * One-off: resetea la contraseña de las 46 cuentas del Lote Fundador y
 * escribe un único CSV completo con todas las credenciales.
 *
 * Motivo: la corrida anterior de load-prospectos-lote-fundador.ts sobreescribió
 * el CSV de credenciales con solo las últimas cuentas creadas, perdiendo las
 * contraseñas en texto plano de las primeras 43 (los perfiles y alertas en la
 * base quedaron intactos, solo se perdió el registro de la contraseña temporal).
 *
 * Uso: npx tsx scripts/reset-prospectos-passwords.ts
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

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) throw new Error('Faltan credenciales de Supabase en .env.local')
if (!DB_URL) throw new Error('Falta DATABASE_URL en .env.local')

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
const sql = postgres(DB_URL, { prepare: false })

const ENTRIES: { email: string; company: string }[] = [
  { "email": "laura.fitnessarg@gmail.com", "company": "COLISEUM FITNESS CENTER" },
  { "email": "calacatraining@gmail.com", "company": "CALACA TRAINING" },
  { "email": "maraciar@hotmail.com", "company": "CROSSFIT ATLON" },
  { "email": "vittarf@gmail.com", "company": "CATAPUMBA" },
  { "email": "crossfitfortia@gmail.com", "company": "CROSSFIT FORTIA" },
  { "email": "zoka.conservas20@hotmail.com", "company": "ZOKA" },
  { "email": "hola@jummp.fit", "company": "CROSSFIT JUMMP" },
  { "email": "info@blackfit.com.ar", "company": "BLACK FIT" },
  { "email": "crossfitvillaluro@gmail.com", "company": "CROSSFIT VILLA LURO" },
  { "email": "arieltrabazo@hotmail.com", "company": "ANTIGUO MANANTIAL" },
  { "email": "raulcundins1@gmail.com", "company": "TIENDA LA SALUDABLE ADROGUE" },
  { "email": "caramjorge1969@hormail.com", "company": "DIETETICA SANAS DELICIAS" },
  { "email": "admisimpleco@gmail.com", "company": "SIMPLE & CO" },
  { "email": "martingnunez2003@gmail.com", "company": "PUNTO VERDE" },
  { "email": "ferfernandez19@icloud.com", "company": "DIETETICA RAICES" },
  { "email": "luis.valvarez@hotmail.com", "company": "LA LENTEJA HEAVY" },
  { "email": "gastonscrimi@gmail.com", "company": "VITALSER MICROCENTRO (FLORIDA 596)" },
  { "email": "puertorganico.ok@gmail.com", "company": "PUERTO ORGANICO" },
  { "email": "nuezalmacendietetico@gmail.com", "company": "NUEZ ALMACEN DIETETICO" },
  { "email": "semilla.dietetica.22@gmail.com", "company": "SEMILLA DIETETICA" },
  { "email": "zojamarket@yahoo.com", "company": "ZOJA MARKET" },
  { "email": "admin@harperjuice.com", "company": "HARPER JUICE (BARRIO CHINO)" },
  { "email": "merope.arg@gmail.com", "company": "MEROPE" },
  { "email": "caballito_fit@hotmail.com", "company": "CABALLITO FIT" },
  { "email": "info.mmsuplementos@gmail.com", "company": "MM SUPLEMENTOS" },
  { "email": "goodfitness2016@hotmail.com", "company": "GOODFITNESS" },
  { "email": "mlpolizzotto@hotmail.com", "company": "SUPLEMUS" },
  { "email": "flo.mrodriguez@live.com", "company": "FLORENCIA RODRIGUEZ" },
  { "email": "bulldogfithouse@gmail.com", "company": "BULLDOG FIT HOUSE" },
  { "email": "verdegreenvert979@gmail.com", "company": "VERDE GREENVERT" },
  { "email": "nutrigen2019@hotmail.com", "company": "NUTRIGEN" },
  { "email": "hernan@fernandezdiaz.com", "company": "MUV" },
  { "email": "compraswholegreen@gmail.com", "company": "WHOLE GREEN" },
  { "email": "aguscatania@hotmail.com.ar", "company": "SELVA" },
  { "email": "matias.amorales@hotmail.com", "company": "SPARTA GYM" },
  { "email": "anaclc15@hotmail.com", "company": "ANA CASTRO" },
  { "email": "natalia.pizzolo@gmail.com", "company": "WARM UP" },
  { "email": "creperielaplata@gmail.com", "company": "CRÊPERIE" },
  { "email": "scaranoyamila@gmail.com", "company": "NEMEA SPORT" },
  { "email": "ovopalermo@gmail.com", "company": "OVO MARKET" },
  { "email": "davilaaa.federicooo@hotmail.com", "company": "CUERO CRUDO" },
  { "email": "voxcoffee.arg@gmail.com", "company": "VOX COFFEE" },
  { "email": "ventas@copralsa.com.ar", "company": "COPRALSA" },
  { "email": "freshmarket.laplata@prospecto-hardy.ar", "company": "FRESH MARKET" },
  { "email": "vivenaturaltienda@prospecto-hardy.ar", "company": "VIVE NATURAL TIENDA" },
  { "email": "rinconmaceda@prospecto-hardy.ar", "company": "RINCON MACEDA" },
]

function generateTempPassword(): string {
  return `Hardy2026$${randomBytes(4).toString('hex').toUpperCase()}`
}

async function run() {
  const rows: { email: string; company: string; tempPassword: string }[] = []
  const errores: { email: string; error: string }[] = []

  for (const e of ENTRIES) {
    const found = await sql`SELECT id FROM auth.users WHERE email = ${e.email} LIMIT 1`
    const userId = found[0]?.id
    if (!userId) {
      errores.push({ email: e.email, error: 'No existe usuario Auth con ese email.' })
      continue
    }
    const tempPassword = generateTempPassword()
    const { error } = await admin.auth.admin.updateUserById(userId, { password: tempPassword })
    if (error) {
      errores.push({ email: e.email, error: error.message })
      continue
    }
    rows.push({ email: e.email, company: e.company, tempPassword })
    console.log(`✓ ${e.company} (${e.email}) — contraseña reseteada`)
  }

  console.log(`\nTotal: ${rows.length} reseteadas, ${errores.length} errores.`)
  if (errores.length > 0) {
    errores.forEach((e) => console.log(`  ✗ ${e.email}: ${e.error}`))
  }

  const csvPath = path.join(process.env.USERPROFILE ?? '.', 'Downloads', 'prospectos-lote-fundador-credenciales.csv')
  const csv = ['email,empresa,contrasena_temporal']
    .concat(rows.map((r) => `${r.email},"${r.company.replace(/"/g, '""')}",${r.tempPassword}`))
    .join('\n')
  writeFileSync(csvPath, csv, 'utf-8')
  console.log(`\n🔐 CSV completo (${rows.length} cuentas) guardado en: ${csvPath}`)
}

run()
  .catch((e) => { console.error('Error fatal:', e); process.exitCode = 1 })
  .finally(() => sql.end())
