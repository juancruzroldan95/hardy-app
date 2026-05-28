import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { novedades } from '@/drizzle/schema'
import { and, eq, desc } from 'drizzle-orm'

export default async function NovedadesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const items = await db.query.novedades.findMany({
    where:   and(eq(novedades.isDeleted, false), eq(novedades.isActive, true)),
    orderBy: [desc(novedades.createdAt)],
  })

  return (
    <div className="max-w-[780px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">
        ── Novedades
      </p>
      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-8">
        Novedades y avisos
      </h1>

      {items.length === 0 ? (
        <div className="bg-paper border border-ink/8 p-10 text-center">
          <p className="font-body text-[14px] text-ink/40">
            No hay novedades por el momento.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {items.map((item) => (
            <article
              key={item.id}
              className="bg-paper border border-ink/8 overflow-hidden"
            >
              {item.imageUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={item.imageUrl}
                  alt={item.titulo}
                  className="w-full h-[200px] object-cover"
                />
              )}
              <div className="p-6">
                <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-2">
                  {new Date(item.createdAt).toLocaleDateString('es-AR', {
                    day:   '2-digit',
                    month: 'long',
                    year:  'numeric',
                  })}
                </p>
                <h2 className="font-heading text-[20px] font-medium leading-[1.2] mb-3">
                  {item.titulo}
                </h2>
                <p className="font-body text-[14px] text-ink/70 leading-[1.7] whitespace-pre-wrap">
                  {item.cuerpo}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  )
}
