import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { getProfileByUserId, getProfileById } from '@/repository/queries/profile'
import { db } from '@/db'
import { sql } from 'drizzle-orm'
import EditClientForm from './EditClientForm'

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditarClientePage({ params }: PageProps) {
  const { id } = await params

  // 1. Validar autenticación
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  // 2. Validar que el usuario sea administrador
  const adminProfile = await getProfileByUserId(user.id)
  if (adminProfile?.role !== 'admin') redirect('/portal')

  // 3. Buscar perfil del cliente a editar
  const client = await getProfileById(id)

  if (!client) {
    redirect('/portal/admin/clientes')
  }

  // 4. Obtener email del cliente desde la tabla auth.users
  let clientEmail = ''
  try {
    const result = await db.execute(
      sql`SELECT email FROM auth.users WHERE id = ${client.userId}::uuid`
    )
    clientEmail = (result as unknown as Array<{ email: string }>)[0]?.email ?? ''
  } catch (e) {
    console.error('Error al obtener el email de auth.users:', e)
  }

  return (
    <div className="max-w-[700px]">
      <Link
        href="/portal/admin/clientes"
        className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/40 hover:text-ink transition-colors mb-6 block"
      >
        ← Volver a clientes
      </Link>

      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">── Admin · CRM</p>
      <h1 className="font-heading text-[clamp(24px,3vw,34px)] font-medium leading-[1.1] tracking-[-0.02em] mb-2">
        Editar cliente
      </h1>
      <p className="font-body text-[14px] text-ink/40 mb-8">
        Modificá los datos del perfil de este cliente. El correo electrónico no es editable.
      </p>

      <EditClientForm client={client} email={clientEmail} />
    </div>
  )
}
