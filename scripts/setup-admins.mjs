import postgres from 'postgres'

// Usando pooler URL que sí resuelve desde este entorno
const DB_URL = 'postgresql://postgres.jveyfjoeavsbfwfrtpnd:HikGJ6SAZWMIrH7y@aws-1-sa-east-1.pooler.supabase.com:6543/postgres'

const sql = postgres(DB_URL, { ssl: 'require', max: 1, prepare: false })

async function main() {
  const users = await sql`
    SELECT id, email FROM auth.users
    WHERE email IN ('guido.giambruni@gmail.com', 'gustavo.giambruni@gmail.com')
  `
  console.log('Usuarios encontrados en auth:', users)

  for (const u of users) {
    const existing = await sql`
      SELECT id, role FROM public.profiles
      WHERE user_id = ${u.id} AND is_deleted = false
    `
    if (existing.length > 0) {
      await sql`UPDATE public.profiles SET role = 'admin', updated_at = NOW() WHERE user_id = ${u.id}`
      console.log(`✓ ${u.email} → admin (actualizado)`)
    } else {
      await sql`INSERT INTO public.profiles (user_id, role, display_name, is_active, is_deleted)
                VALUES (${u.id}, 'admin', ${u.email.split('@')[0]}, true, false)`
      console.log(`✓ ${u.email} → admin (creado)`)
    }
  }

  const found = users.map(u => u.email)
  ;['guido.giambruni@gmail.com','gustavo.giambruni@gmail.com'].forEach(e => {
    if (!found.includes(e)) console.log(`⚠ ${e} no existe en Supabase Auth — invitar primero desde el dashboard`)
  })

  await sql.end()
}

main().catch(e => { console.error(e.message); process.exit(1) })
