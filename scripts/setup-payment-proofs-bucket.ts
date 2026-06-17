/**
 * Crea (de forma idempotente) el bucket de Storage "payment-proofs" y sus
 * políticas RLS, usado para que los clientes B2B adjunten el comprobante de
 * transferencia/depósito bancario de un pedido.
 *
 * Uso:
 *   npx tsx scripts/setup-payment-proofs-bucket.ts
 *
 * Requiere en .env.local:
 *   NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, DATABASE_URL
 */
import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'
import postgres from 'postgres'

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

const BUCKET_ID = 'payment-proofs'

async function main() {
  const supabase = createClient(SUPABASE_URL!, SERVICE_ROLE_KEY!, {
    auth: { autoRefreshToken: false, persistSession: false },
  })

  console.log(`📦 Creando bucket "${BUCKET_ID}" (privado)...`)
  const { error: bucketError } = await supabase.storage.createBucket(BUCKET_ID, {
    public: false,
    fileSizeLimit: '10MB',
    allowedMimeTypes: ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'],
  })
  if (bucketError && !bucketError.message.includes('already exists')) {
    throw bucketError
  }
  console.log(bucketError ? '↪ Bucket ya existía.' : '✅ Bucket creado.')

  // Políticas RLS sobre storage.objects: cada usuario sólo puede subir/leer
  // archivos bajo su propio user_id como primer segmento del path
  // (payment-proofs/<userId>/<orderId>-<timestamp>.<ext>). Admins leen todo.
  const sql = postgres(DB_URL!, { prepare: false, max: 1 })

  console.log('🔐 Aplicando políticas RLS...')
  await sql`
    DROP POLICY IF EXISTS "payment_proofs_owner_insert" ON storage.objects;
  `
  await sql.unsafe(`
    CREATE POLICY "payment_proofs_owner_insert" ON storage.objects
    FOR INSERT TO authenticated
    WITH CHECK (
      bucket_id = 'payment-proofs'
      AND (storage.foldername(name))[1] = auth.uid()::text
    );
  `)
  await sql`
    DROP POLICY IF EXISTS "payment_proofs_owner_select" ON storage.objects;
  `
  await sql.unsafe(`
    CREATE POLICY "payment_proofs_owner_select" ON storage.objects
    FOR SELECT TO authenticated
    USING (
      bucket_id = 'payment-proofs'
      AND (
        (storage.foldername(name))[1] = auth.uid()::text
        OR EXISTS (
          SELECT 1 FROM public.profiles
          WHERE profiles.user_id = auth.uid()
            AND profiles.role = 'admin'
            AND profiles.is_deleted = false
        )
      )
    );
  `)

  console.log('✅ Políticas aplicadas.')
  await sql.end()
}

main().catch((e) => { console.error(e); process.exit(1) })
