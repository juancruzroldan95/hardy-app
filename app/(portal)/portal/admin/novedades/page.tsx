import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { novedades, profiles } from '@/drizzle/schema'
import { and, eq, desc } from 'drizzle-orm'
import { softDeleteNovedad } from '@/lib/actions/admin'

export default async function AdminNovedadesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (profile?.role !== 'admin') redirect('/portal')

  const items = await db.query.novedades.findMany({
    where:   eq(novedades.isDeleted, false),
    orderBy: [desc(novedades.createdAt)],
  })

  return (
    <div className="max-w-[860px]">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">── Admin</p>
          <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em]">
            Novedades
          </h1>
        </div>
        <Link
          href="/portal/admin/novedades/nueva"
          className="bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[13px] whitespace-nowrap"
        >
          + Nueva novedad
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="bg-paper border border-ink/8 p-10 text-center">
          <p className="font-body text-[14px] text-ink/40 mb-4">No hay novedades publicadas.</p>
          <Link
            href="/portal/admin/novedades/nueva"
            className="inline-block bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[12px]"
          >
            Crear primera novedad →
          </Link>
        </div>
      ) : (
        <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
          {items.map((item) => (
            <div key={item.id} className="px-5 py-5 flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-3 mb-1">
                  <h3 className="font-body font-semibold text-[14px] text-ink truncate">
                    {item.titulo}
                  </h3>
                  {!item.isActive && (
                    <span className="font-mono text-[8px] tracking-[0.15em] uppercase bg-paper-2 text-ink/40 px-2 py-[3px] shrink-0">
                      Inactiva
                    </span>
                  )}
                </div>
                <p className="font-mono text-[9px] tracking-[0.1em] text-ink/40 mb-1">
                  {new Date(item.createdAt).toLocaleDateString('es-AR', {
                    day: '2-digit', month: 'long', year: 'numeric',
                  })}
                </p>
                <p className="font-body text-[13px] text-ink/50 line-clamp-2 leading-[1.5]">
                  {item.cuerpo}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <Link
                  href={`/portal/admin/novedades/${item.id}/editar`}
                  className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 hover:text-ink border border-ink/15 px-3 py-[7px] transition-colors"
                >
                  Editar
                </Link>
                <form
                  action={async () => {
                    'use server'
                    await softDeleteNovedad(item.id)
                  }}
                >
                  <button
                    type="submit"
                    className="font-mono text-[10px] tracking-[0.12em] uppercase text-red/60 hover:text-red border border-red/20 px-3 py-[7px] transition-colors"
                  >
                    Eliminar
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
