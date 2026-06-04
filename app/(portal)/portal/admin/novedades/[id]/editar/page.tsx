import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { getProfileByUserId } from '@/repository/queries/profile'
import { getNovedadById } from '@/repository/queries/novedades'
import { updateNovedad } from '@/repository/mutations/admin'
import AdminNovedadForm from '@/components/portal/AdminNovedadForm'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminEditarNovedadPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfileByUserId(user.id)
  if (profile?.role !== 'admin') redirect('/portal')

  const { id } = await params

  const novedad = await getNovedadById(id)
  if (!novedad) notFound()

  const boundUpdate = updateNovedad.bind(null, id)

  return (
    <div className="max-w-[680px]">
      <Link
        href="/portal/admin/novedades"
        className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-ink/40 hover:text-ink transition-colors mb-6"
      >
        ← Volver a novedades
      </Link>

      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">── Admin</p>
      <h1 className="font-heading text-[clamp(22px,3vw,32px)] font-medium leading-[1.1] tracking-[-0.02em] mb-8">
        Editar novedad
      </h1>

      <AdminNovedadForm
        action={boundUpdate}
        defaultValues={{
          titulo:   novedad.titulo,
          cuerpo:   novedad.cuerpo,
          imageUrl: novedad.imageUrl ?? '',
        }}
        submitLabel="Guardar cambios →"
      />
    </div>
  )
}
