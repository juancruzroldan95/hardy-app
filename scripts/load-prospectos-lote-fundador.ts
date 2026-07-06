/**
 * Carga los prospectos del "Lote Fundador" (contactados por WhatsApp con la
 * oferta de relanzamiento) como clientes del portal B2B, y les crea una
 * alerta de seguimiento a 60 días.
 *
 * Por cada prospecto:
 *   1. Crea (o reutiliza) el usuario en Supabase Auth con contraseña temporal.
 *   2. Crea su perfil en public.profiles (rol: mayorista).
 *   3. Crea una client_alert de tipo 'custom' programada a +60 días.
 * Es idempotente: si el email ya tiene perfil, no lo duplica; si ya existe
 * una alerta de seguimiento no resuelta para ese perfil, no la duplica.
 *
 * Uso:
 *   npx tsx scripts/load-prospectos-lote-fundador.ts
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
const DB_URL            = process.env.DATABASE_URL ?? process.env.DIRECT_URL

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env.local')
}
if (!DB_URL) {
  throw new Error('Falta DATABASE_URL (o DIRECT_URL) en .env.local')
}

const FOLLOWUP_DAYS = 60

interface Prospecto {
  tipo:              string
  email:             string
  displayName:       string
  company:           string
  phone:             string
  city:              string
  barrio:            string
  placeholderEmail?: boolean
}

export const PROSPECTOS: Prospecto[] = [
  {
    "tipo": "BOX CROSSFIT",
    "email": "laura.fitnessarg@gmail.com",
    "displayName": "LAURA VILLAREAL",
    "company": "COLISEUM FITNESS CENTER",
    "phone": "11 32154555",
    "city": "VILLA CRESPO",
    "barrio": "VILLA CRESPO"
  },
  {
    "tipo": "BOX CROSSFIT",
    "email": "calacatraining@gmail.com",
    "displayName": "MATIAS LUIS",
    "company": "CALACA TRAINING",
    "phone": "(011) 15 3066 8561",
    "city": "TIGRE",
    "barrio": ""
  },
  {
    "tipo": "BOX CROSSFIT",
    "email": "maraciar@hotmail.com",
    "displayName": "MARCELO OSCAR",
    "company": "CROSSFIT ATLON",
    "phone": "(011) 15 5062 7213",
    "city": "PILAR",
    "barrio": ""
  },
  {
    "tipo": "BOX CROSSFIT",
    "email": "vittarf@gmail.com",
    "displayName": "FERNANDO JAVIER",
    "company": "CATAPUMBA",
    "phone": "(011) 15 3445-5696",
    "city": "LOMAS DE ZAMORA",
    "barrio": "LOMAS DE ZAMORA"
  },
  {
    "tipo": "BOX CROSSFIT",
    "email": "crossfitfortia@gmail.com",
    "displayName": "CLAUDIO SEBASTIAN",
    "company": "CROSSFIT FORTIA",
    "phone": "+54 911 3103 4895",
    "city": "BELGRANO",
    "barrio": "BELGRANO"
  },
  {
    "tipo": "BOX CROSSFIT",
    "email": "zoka.conservas20@hotmail.com",
    "displayName": "SOFIA PAGANO",
    "company": "ZOKA",
    "phone": "1154131565",
    "city": "PATERNAL",
    "barrio": "PATERNAL"
  },
  {
    "tipo": "BOX CROSSFIT",
    "email": "hola@jummp.fit",
    "displayName": "BOPE CAVEIRA SRL",
    "company": "CROSSFIT JUMMP",
    "phone": "(011) 15 6591 2725",
    "city": "COLEGIALES",
    "barrio": "COLEGIALES"
  },
  {
    "tipo": "BOX CROSSFIT",
    "email": "info@blackfit.com.ar",
    "displayName": "EMILIANO ALI",
    "company": "BLACK FIT",
    "phone": "1166384196",
    "city": "",
    "barrio": ""
  },
  {
    "tipo": "BOX CROSSFIT",
    "email": "crossfitvillaluro@gmail.com",
    "displayName": "GISELA EDITH",
    "company": "CROSSFIT VILLA LURO",
    "phone": "+54 911 5579 1358",
    "city": "VILLA LURO",
    "barrio": "VILLA LURO"
  },
  {
    "tipo": "DIETETICA",
    "email": "arieltrabazo@hotmail.com",
    "displayName": "RODRIGO ARIEL",
    "company": "ANTIGUO MANANTIAL",
    "phone": "(011) 15 6458-6584",
    "city": "FLORES",
    "barrio": "FLORES"
  },
  {
    "tipo": "DIETETICA",
    "email": "raulcundins1@gmail.com",
    "displayName": "SEGOVIA RAUL",
    "company": "TIENDA LA SALUDABLE ADROGUE",
    "phone": "1166743658",
    "city": "ADROGUE",
    "barrio": ""
  },
  {
    "tipo": "DIETETICA",
    "email": "caramjorge1969@hormail.com",
    "displayName": "JORGE JAVIER",
    "company": "DIETETICA SANAS DELICIAS",
    "phone": "1157025833",
    "city": "BURZACO",
    "barrio": ""
  },
  {
    "tipo": "DIETETICA",
    "email": "admisimpleco@gmail.com",
    "displayName": "SIMPLE & CO SA",
    "company": "SIMPLE & CO",
    "phone": "+54 911 3674 7331",
    "city": "PALERMO",
    "barrio": "PALERMO"
  },
  {
    "tipo": "DIETETICA",
    "email": "martingnunez2003@gmail.com",
    "displayName": "ABIGAIL ISABEL",
    "company": "PUNTO VERDE",
    "phone": "1130723733",
    "city": "",
    "barrio": ""
  },
  {
    "tipo": "DIETETICA",
    "email": "ferfernandez19@icloud.com",
    "displayName": "CHRISTIAN GABRIEL",
    "company": "DIETETICA RAICES",
    "phone": "1164521175",
    "city": "ITUZAINGO",
    "barrio": ""
  },
  {
    "tipo": "DIETETICA",
    "email": "luis.valvarez@hotmail.com",
    "displayName": "MARIA CECILIA",
    "company": "LA LENTEJA HEAVY",
    "phone": "1144004477",
    "city": "MORENO",
    "barrio": ""
  },
  {
    "tipo": "DIETETICA",
    "email": "gastonscrimi@gmail.com",
    "displayName": "GASTON",
    "company": "VITALSER MICROCENTRO (FLORIDA 596)",
    "phone": "(011) 15 6733-5685",
    "city": "CENTRO",
    "barrio": "CABA"
  },
  {
    "tipo": "DIETETICA",
    "email": "puertorganico.ok@gmail.com",
    "displayName": "FERNANDO DAVID",
    "company": "PUERTO ORGANICO",
    "phone": "11 2544-7475",
    "city": "PUERTO MADERO",
    "barrio": "PUERTO MADERO"
  },
  {
    "tipo": "DIETETICA",
    "email": "nuezalmacendietetico@gmail.com",
    "displayName": "SANTIAGO NICOLAS MEDINA",
    "company": "NUEZ ALMACEN DIETETICO",
    "phone": "1138180146",
    "city": "",
    "barrio": ""
  },
  {
    "tipo": "DIETETICA",
    "email": "semilla.dietetica.22@gmail.com",
    "displayName": "LILIANA VANESA",
    "company": "SEMILLA DIETETICA",
    "phone": "115325-1332",
    "city": "BELGRANO",
    "barrio": ""
  },
  {
    "tipo": "DIETETICA",
    "email": "zojamarket@yahoo.com",
    "displayName": "ZOJA SRL",
    "company": "ZOJA MARKET",
    "phone": "+54 9 11 5848-4248",
    "city": "PALERMO",
    "barrio": "PALERMO"
  },
  {
    "tipo": "DIETETICA",
    "email": "admin@harperjuice.com",
    "displayName": "HARPER JUICE (BARRIO CHINO)",
    "company": "HARPER JUICE (BARRIO CHINO)",
    "phone": "11 6588-6082",
    "city": "",
    "barrio": ""
  },
  {
    "tipo": "DIETETICA",
    "email": "merope.arg@gmail.com",
    "displayName": "MEROPE TROPICAL",
    "company": "MEROPE",
    "phone": "1166710944",
    "city": "",
    "barrio": ""
  },
  {
    "tipo": "DIETETICA",
    "email": "caballito_fit@hotmail.com",
    "displayName": "PABLO DAVID",
    "company": "CABALLITO FIT",
    "phone": "+54 911 5660 3770",
    "city": "CABALLITO",
    "barrio": "CABALLITO"
  },
  {
    "tipo": "SUPLEMENTOS",
    "email": "info.mmsuplementos@gmail.com",
    "displayName": "MARIANO PATRICIO",
    "company": "MM SUPLEMENTOS",
    "phone": "+54 911 4971 9867",
    "city": "COLEGIALES",
    "barrio": "COLEGIALES"
  },
  {
    "tipo": "SUPLEMENTOS",
    "email": "goodfitness2016@hotmail.com",
    "displayName": "LAUTARO NAHUEL",
    "company": "GOODFITNESS",
    "phone": "+54 9 11 3590-9009",
    "city": "AVELLANEDA",
    "barrio": ""
  },
  {
    "tipo": "SUPLEMENTOS",
    "email": "mlpolizzotto@hotmail.com",
    "displayName": "MARIA LAURA",
    "company": "SUPLEMUS",
    "phone": "1153262864",
    "city": "QUILMES",
    "barrio": ""
  },
  {
    "tipo": "COMERCIO",
    "email": "flo.mrodriguez@live.com",
    "displayName": "FLORENCIA",
    "company": "FLORENCIA RODRIGUEZ",
    "phone": "(011) 3594 2698",
    "city": "PARQUE PATRICIOS",
    "barrio": ""
  },
  {
    "tipo": "COMERCIO",
    "email": "bulldogfithouse@gmail.com",
    "displayName": "GUSTAVO SERGIO OMAR",
    "company": "BULLDOG FIT HOUSE",
    "phone": "1154682984",
    "city": "ITUZAINGO",
    "barrio": "ITUZAINGO"
  },
  {
    "tipo": "COMERCIO",
    "email": "verdegreenvert979@gmail.com",
    "displayName": "CLAUDIA PATRICIA",
    "company": "VERDE GREENVERT",
    "phone": "1132845856",
    "city": "TRISTAN SUAREZ",
    "barrio": ""
  },
  {
    "tipo": "COMERCIO",
    "email": "nutrigen2019@hotmail.com",
    "displayName": "JUAN ESTEBAN",
    "company": "NUTRIGEN",
    "phone": "+54 9231 441 1850",
    "city": "SAN CARLOS DE BOLIVAR",
    "barrio": "SAN CARLOS DE BOLIVAR"
  },
  {
    "tipo": "COMERCIO",
    "email": "hernan@fernandezdiaz.com",
    "displayName": "HERNAN PABLO",
    "company": "MUV",
    "phone": "+54 911 6427 4498",
    "city": "PALERMO",
    "barrio": "PALERMO"
  },
  {
    "tipo": "COMERCIO",
    "email": "compraswholegreen@gmail.com",
    "displayName": "WHOLE LIFE S.A.S S.A.S.",
    "company": "WHOLE GREEN",
    "phone": "1138787192",
    "city": "CAPITAL FEDERAL",
    "barrio": ""
  },
  {
    "tipo": "COMERCIO",
    "email": "aguscatania@hotmail.com.ar",
    "displayName": "AGUSTINA VALERIA",
    "company": "SELVA",
    "phone": "+54 911 3688 1967",
    "city": "BARRIO NORTE",
    "barrio": "BARRIO NORTE"
  },
  {
    "tipo": "COMERCIO",
    "email": "matias.amorales@hotmail.com",
    "displayName": "MATIAS ALEJANDRO",
    "company": "SPARTA GYM",
    "phone": "11 22761783",
    "city": "WILDE",
    "barrio": "WILDE"
  },
  {
    "tipo": "COMERCIO",
    "email": "anaclc15@hotmail.com",
    "displayName": "ANA CELESTE LUZ",
    "company": "ANA CASTRO",
    "phone": "(011) 15 6896-2997",
    "city": "PALERMO",
    "barrio": "PALERMO"
  },
  {
    "tipo": "COMERCIO",
    "email": "natalia.pizzolo@gmail.com",
    "displayName": "NATALIA MARIEL",
    "company": "WARM UP",
    "phone": "(011) 15 3086 1986",
    "city": "RAMOS MEJIA",
    "barrio": "SAN JUSTO"
  },
  {
    "tipo": "COMERCIO",
    "email": "creperielaplata@gmail.com",
    "displayName": "BERNARDO LALANNE",
    "company": "CRÊPERIE",
    "phone": "221 4216314",
    "city": "LA PLATA",
    "barrio": "LA PLATA"
  },
  {
    "tipo": "COMERCIO",
    "email": "scaranoyamila@gmail.com",
    "displayName": "YAMILA PAOLA",
    "company": "NEMEA SPORT",
    "phone": "+54 911 2248 6601",
    "city": "MORENO",
    "barrio": "MORENO"
  },
  {
    "tipo": "COMERCIO",
    "email": "ovopalermo@gmail.com",
    "displayName": "GUY",
    "company": "OVO MARKET",
    "phone": "(011) 15 2842 3422",
    "city": "PALERMO",
    "barrio": "PALERMO"
  },
  {
    "tipo": "COMERCIO",
    "email": "davilaaa.federicooo@hotmail.com",
    "displayName": "BEATRIZ SUSANA",
    "company": "CUERO CRUDO",
    "phone": "+54 9 226 253-5757",
    "city": "NECOCHEA",
    "barrio": ""
  },
  {
    "tipo": "COMERCIO",
    "email": "voxcoffee.arg@gmail.com",
    "displayName": "FIORELLA",
    "company": "VOX COFFEE",
    "phone": "1131950808",
    "city": "TIGRE",
    "barrio": ""
  },
  {
    "tipo": "COMERCIO",
    "email": "ventas@copralsa.com.ar",
    "displayName": "COPRALSA",
    "company": "COPRALSA",
    "phone": "+5491125921990",
    "city": "QUILMES",
    "barrio": ""
  },
  {
    "tipo": "DIETETICA",
    "email": "freshmarket.laplata@prospecto-hardy.ar",
    "displayName": "SANDRA MARIA",
    "company": "FRESH MARKET",
    "phone": "+54 9221 525 5225",
    "city": "LA PLATA",
    "barrio": "LA PLATA",
    "placeholderEmail": true
  },
  {
    "tipo": "DIETETICA",
    "email": "vivenaturaltienda@prospecto-hardy.ar",
    "displayName": "VIVE NATURAL TIENDA",
    "company": "VIVE NATURAL TIENDA",
    "phone": "+54 9 11 6860-6733",
    "city": "",
    "barrio": "",
    "placeholderEmail": true
  },
  {
    "tipo": "DIETETICA",
    "email": "rinconmaceda@prospecto-hardy.ar",
    "displayName": "RINCON MACEDA",
    "company": "RINCON MACEDA",
    "phone": "11-6433-6729",
    "city": "VILLA DEL PARQUE",
    "barrio": "VILLA DEL PARQUE",
    "placeholderEmail": true
  }
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

async function findAdminUserId(): Promise<string> {
  const result = await sql`
    SELECT user_id FROM profiles WHERE role = 'admin' AND is_deleted = false LIMIT 1
  `
  if (!result[0]?.user_id) throw new Error('No se encontró ningún perfil admin activo en profiles.')
  return result[0].user_id
}

async function run() {
  const adminUserId = await findAdminUserId()

  const credenciales: { email: string; company: string; tempPassword: string }[] = []
  let creados = 0
  let reutilizados = 0
  let alertasCreadas = 0
  let alertasExistentes = 0
  const errores: { email: string; error: string }[] = []

  for (const p of PROSPECTOS) {
    try {
      let userId = await findAuthUserIdByEmail(p.email)
      let tempPassword: string | null = null

      if (!userId) {
        tempPassword = generateTempPassword()
        const { data, error } = await admin.auth.admin.createUser({
          email: p.email,
          password: tempPassword,
          email_confirm: true,
        })
        if (error) {
          errores.push({ email: p.email, error: `auth: ${error.message}` })
          continue
        }
        userId = data.user!.id
        creados++
        credenciales.push({ email: p.email, company: p.company, tempPassword })
      } else {
        reutilizados++
      }

      const existingProfile = await sql`
        SELECT id FROM profiles WHERE user_id = ${userId} LIMIT 1
      `

      let profileId: string
      const notes = `Prospecto — Lote Fundador (${p.tipo}). Contactado por WhatsApp con oferta de relanzamiento (crema de maní natural 380g).`
        + (p.placeholderEmail ? ' ⚠️ Email genérico (placeholder) — actualizar cuando se consiga el real.' : '')

      if (existingProfile.length > 0) {
        profileId = existingProfile[0].id
      } else {
        const inserted = await sql`
          INSERT INTO profiles (user_id, role, display_name, company, phone, city, notes)
          VALUES (${userId}, 'mayorista', ${p.displayName}, ${p.company}, ${p.phone || null}, ${p.city || null}, ${notes})
          RETURNING id
        `
        profileId = inserted[0].id
      }

      const scheduledFor = new Date(Date.now() + FOLLOWUP_DAYS * 24 * 60 * 60 * 1000)
      const mensaje = `Seguimiento — Lote Fundador (${p.company}). Contactado por WhatsApp con oferta de relanzamiento, revisar respuesta/pedido.`

      const existingAlert = await sql`
        SELECT id FROM client_alerts
        WHERE profile_id = ${profileId} AND is_resolved = false AND is_deleted = false
          AND mensaje = ${mensaje}
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

      console.log(`✓ ${p.company} (${p.email}) — perfil ${existingProfile.length > 0 ? 'existente' : 'creado'}, alerta ${existingAlert.length > 0 ? 'ya existía' : 'programada'}`)
    } catch (e) {
      errores.push({ email: p.email, error: e instanceof Error ? e.message : String(e) })
      console.error(`✗ ${p.email} — error:`, e)
    }
  }

  console.log('\n── Resumen ──')
  console.log(`Total prospectos procesados: ${PROSPECTOS.length}`)
  console.log(`Usuarios Auth creados:       ${creados}`)
  console.log(`Usuarios Auth reutilizados:  ${reutilizados}`)
  console.log(`Alertas de seguimiento creadas (+${FOLLOWUP_DAYS}d): ${alertasCreadas}`)
  console.log(`Alertas ya existentes:        ${alertasExistentes}`)
  console.log(`Errores:                      ${errores.length}`)
  if (errores.length > 0) {
    console.log('\nDetalle de errores:')
    errores.forEach((e) => console.log(`  - ${e.email}: ${e.error}`))
  }

  if (credenciales.length > 0) {
    const csvPath = path.join(process.env.USERPROFILE ?? '.', 'Downloads', 'prospectos-lote-fundador-credenciales.csv')
    const csv = ['email,empresa,contrasena_temporal']
      .concat(credenciales.map((c) => `${c.email},"${c.company.replace(/"/g, '""')}",${c.tempPassword}`))
      .join('\n')
    writeFileSync(csvPath, csv, 'utf-8')
    console.log(`\n🔐 Credenciales de ${credenciales.length} cuentas nuevas guardadas en: ${csvPath}`)
    console.log('   (no se imprimen por consola — revisá el CSV para compartirlas manualmente)')
  }
}

run()
  .catch((e) => { console.error('Error fatal:', e); process.exitCode = 1 })
  .finally(() => sql.end())
