import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'
import { createNovedad } from '@/lib/actions/admin'
import AdminNovedadForm from '@/components/portal/AdminNovedadForm'

export default async function AdminNuevaNovedadPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (profile?.role !== 'admin') redirect('/portal')

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
        Nueva novedad
      </h1>

      <AdminNovedadForm action={createNovedad} submitLabel="Publicar novedad →" />
    </div>
  )
}
