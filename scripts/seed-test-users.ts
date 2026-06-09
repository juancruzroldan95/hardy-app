/**
 * Seed de usuarios de prueba para el portal.
 *
 * Crea (de forma idempotente) un usuario de Supabase Auth + su perfil en
 * public.profiles por cada rol, para poder ingresar al portal como distintos
 * tipos de cliente y hacer QA.
 *
 * Uso:
 *   npx tsx scripts/seed-test-users.ts
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DIRECT_URL
 *
 * Para revertir (borrado lógico de perfiles + borrado de auth users):
 *   npx tsx scripts/seed-test-users.ts --remove
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'

dotenv.config({ path: '.env.local' })

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY
// Usa el pooler (DATABASE_URL) — la conexión directa (DIRECT_URL) puede no
// ser accesible desde entornos locales restringidos (DNS ENOTFOUND).
const DB_URL            = process.env.DATABASE_URL ?? process.env.DIRECT_URL

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  throw new Error('Faltan NEXT_PUBLIC_SUPABASE_URL y/o SUPABASE_SERVICE_ROLE_KEY en .env.local')
}
if (!DB_URL) {
  throw new Error('Falta DIRECT_URL (o DATABASE_URL) en .env.local')
}

const REMOVE = process.argv.includes('--remove')

const PASSWORD = 'HardyTest2026$'

type Role = 'admin' | 'mayorista' | 'gastronomico' | 'distribuidor' | 'productor' | 'consumer'

interface TestUser {
  email: string
  role: Role
  displayName: string
  company?: string
  city?: string
  province?: string
}

const USERS: TestUser[] = [
  { email: 'admin@hardy.test',        role: 'admin',        displayName: 'Admin Hardy' },
  { email: 'mayorista@hardy.test',    role: 'mayorista',    displayName: 'Dietética El Maní',   company: 'Dietética El Maní',   city: 'Rosario',      province: 'Santa Fe' },
  { email: 'gastronomico@hardy.test', role: 'gastronomico', displayName: 'Café de la Esquina',  company: 'Café de la Esquina',  city: 'CABA',         province: 'Ciudad Autónoma de Buenos Aires' },
  { email: 'distribuidor@hardy.test', role: 'distribuidor', displayName: 'Distribuidora Sur',   company: 'Distribuidora Sur',   city: 'Bahía Blanca', province: 'Buenos Aires' },
  { email: 'productor@hardy.test',    role: 'productor',    displayName: 'Alfajores Don José',  company: 'Alfajores Don José',  city: 'Córdoba',      province: 'Córdoba' },
  { email: 'consumer@hardy.test',     role: 'consumer',     displayName: 'Consumidor de Prueba' },
]

const admin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
})
// connection pooler (pgbouncer) requiere prepare:false
const sql = postgres(DB_URL, { prepare: false })

/** Devuelve el id del auth user con ese email, o null. */
async function findAuthUserId(email: string): Promise<string | null> {
  // listUsers pagina de a 50; recorremos hasta encontrarlo.
  for (let page = 1; page <= 20; page++) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 50 })
    if (error) throw error
    const found = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (found) return found.id
    if (data.users.length < 50) break
  }
  return null
}

async function seed() {
  for (const u of USERS) {
    let userId = await findAuthUserId(u.email)

    if (!userId) {
      const { data, error } = await admin.auth.admin.createUser({
        email: u.email,
        password: PASSWORD,
        email_confirm: true,
      })
      if (error) {
        console.error(`✗ ${u.email} — error creando auth user: ${error.message}`)
        continue
      }
      userId = data.user!.id
      console.log(`✓ Auth user creado: ${u.email}`)
    } else {
      // Asegura la contraseña conocida por si ya existía con otra.
      await admin.auth.admin.updateUserById(userId, { password: PASSWORD })
      console.log(`• Auth user ya existía, contraseña reseteada: ${u.email}`)
    }

    const existing = await sql`
      SELECT id FROM profiles WHERE user_id = ${userId} LIMIT 1
    `
    if (existing.length > 0) {
      await sql`
        UPDATE profiles SET
          role = ${u.role},
          display_name = ${u.displayName},
          company = ${u.company ?? null},
          city = ${u.city ?? null},
          province = ${u.province ?? null},
          is_active = true,
          is_deleted = false,
          updated_at = now()
        WHERE user_id = ${userId}
      `
      console.log(`  ↳ perfil actualizado (${u.role})`)
    } else {
      await sql`
        INSERT INTO profiles (user_id, role, display_name, company, city, province)
        VALUES (${userId}, ${u.role}, ${u.displayName}, ${u.company ?? null}, ${u.city ?? null}, ${u.province ?? null})
      `
      console.log(`  ↳ perfil creado (${u.role})`)
    }
  }

  console.log('\n── Listo. Credenciales de prueba ──')
  console.log(`Contraseña (todos): ${PASSWORD}`)
  for (const u of USERS) console.log(`  ${u.role.padEnd(13)} → ${u.email}`)
}

async function remove() {
  for (const u of USERS) {
    const userId = await findAuthUserId(u.email)
    if (!userId) {
      console.log(`• ${u.email} — no existe, nada que borrar`)
      continue
    }
    await sql`UPDATE profiles SET is_deleted = true, is_active = false, updated_at = now() WHERE user_id = ${userId}`
    const { error } = await admin.auth.admin.deleteUser(userId)
    if (error) console.error(`✗ ${u.email} — error borrando auth user: ${error.message}`)
    else console.log(`✓ ${u.email} — auth user borrado y perfil marcado is_deleted`)
  }
}

;(async () => {
  try {
    if (REMOVE) await remove()
    else await seed()
  } catch (e) {
    console.error('Error fatal:', e)
    process.exitCode = 1
  } finally {
    await sql.end()
  }
})()
