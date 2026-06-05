import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, newsletterSubscribers } from '@/drizzle/schema'
import { and, eq, desc } from 'drizzle-orm'

export default async function AdminSuscriptoresPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (profile?.role !== 'admin') redirect('/portal')

  const items = await db.query.newsletterSubscribers.findMany({
    where:   eq(newsletterSubscribers.isDeleted, false),
    orderBy: [desc(newsletterSubscribers.createdAt)],
  })

  const total = items.length
  const last30 = items.filter(
    (s) => Date.now() - new Date(s.createdAt).getTime() < 30 * 24 * 60 * 60 * 1000,
  ).length

  return (
    <div className="max-w-[860px]">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">── Admin</p>
          <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em]">
            Suscriptores
          </h1>
          <p className="font-body text-[14px] text-ink/50 mt-1">
            Emails capturados desde el sitio. Útiles para novedades, lanzamientos y promos.
          </p>
        </div>
        {total > 0 && (
          <a
            href="/api/admin/export?type=suscriptores"
            className="border border-ink/20 text-ink font-mono text-[11px] tracking-[0.12em] uppercase px-4 py-3 hover:bg-paper-2 transition-colors shrink-0"
          >
            ↓ Exportar CSV
          </a>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-8">
        {[
          { label: 'Total suscriptores', value: total },
          { label: 'Últimos 30 días',    value: last30 },
        ].map(({ label, value }) => (
          <div key={label} className="border border-ink/8 bg-paper p-4">
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-1">{label}</p>
            <p className="font-heading text-[28px] font-medium leading-none text-ink">{value}</p>
          </div>
        ))}
      </div>

      {/* List */}
      {items.length === 0 ? (
        <div className="bg-paper border border-ink/8 p-10 text-center">
          <p className="font-body text-[14px] text-ink/40">Todavía no hay suscriptores.</p>
        </div>
      ) : (
        <div className="bg-paper border border-ink/8">
          <div
            className="px-5 py-3 border-b border-ink/8 bg-paper-2 grid gap-4"
            style={{ gridTemplateColumns: '1fr 120px 110px' }}
          >
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Email</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Origen</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 text-right">Fecha</span>
          </div>

          <div className="divide-y divide-ink/8">
            {items.map((s) => (
              <div
                key={s.id}
                className="px-5 py-4 grid gap-4 items-center"
                style={{ gridTemplateColumns: '1fr 120px 110px' }}
              >
                <div className="min-w-0">
                  <div className="font-body font-medium text-[14px] text-ink truncate">{s.email}</div>
                  {s.name && (
                    <div className="font-mono text-[10px] tracking-[0.08em] text-ink/40 mt-[2px]">{s.name}</div>
                  )}
                </div>
                <span className="font-mono text-[10px] tracking-[0.08em] uppercase text-ink/50">
                  {s.source ?? '—'}
                </span>
                <span className="font-mono text-[10px] tracking-[0.08em] text-ink/40 text-right">
                  {new Date(s.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
