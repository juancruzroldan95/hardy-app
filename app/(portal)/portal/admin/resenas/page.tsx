import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, productReviews } from '@/drizzle/schema'
import { and, eq, desc } from 'drizzle-orm'
import { getProductById } from '@/lib/products'
import { publishReview, deleteReview } from '@/lib/actions/reviews'

export default async function AdminResenasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (profile?.role !== 'admin') redirect('/portal')

  const allReviews = await db.query.productReviews.findMany({
    where: eq(productReviews.isDeleted, false),
    orderBy: [desc(productReviews.createdAt)],
  })

  const pending   = allReviews.filter((r) => !r.isPublished)
  const published = allReviews.filter((r) => r.isPublished)

  function Stars({ rating }: { rating: number }) {
    return <span className="text-amber-500">{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</span>
  }

  return (
    <div className="max-w-[860px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">── Admin</p>
      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-8">
        Reseñas de productos
      </h1>

      {/* Pending */}
      {pending.length > 0 && (
        <div className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-red mb-3">
            ── Pendientes de publicación ({pending.length})
          </p>
          <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
            {pending.map((r) => {
              const product = getProductById(r.productId)
              return (
                <div key={r.id} className="px-5 py-4">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <span className="font-body font-semibold text-[14px]">{r.reviewerName}</span>
                      <span className="font-mono text-[9px] text-ink/30 ml-2">
                        {new Date(r.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Stars rating={r.rating} />
                    </div>
                  </div>
                  <p className="font-mono text-[9px] tracking-[0.1em] text-red uppercase mb-2">
                    {product?.name ?? r.productId} · {product?.size ?? ''}
                  </p>
                  {r.comment && (
                    <p className="font-body text-[13px] text-ink/70 mb-3">{r.comment}</p>
                  )}
                  <div className="flex items-center gap-3">
                    <form action={async () => { 'use server'; await publishReview(r.id) }}>
                      <button type="submit"
                        className="bg-ink text-paper font-mono text-[10px] tracking-[0.12em] uppercase px-4 py-2 hover:bg-ink/80 transition-colors">
                        Publicar ✓
                      </button>
                    </form>
                    <form action={async () => { 'use server'; await deleteReview(r.id) }}>
                      <button type="submit"
                        className="font-mono text-[10px] tracking-[0.12em] uppercase text-red border border-red/20 px-4 py-2 hover:bg-red/5 transition-colors">
                        Eliminar
                      </button>
                    </form>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Published */}
      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 mb-3">
          ── Publicadas ({published.length})
        </p>
        {published.length === 0 ? (
          <p className="font-mono text-[10px] text-ink/30">Sin reseñas publicadas aún.</p>
        ) : (
          <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
            {published.map((r) => {
              const product = getProductById(r.productId)
              return (
                <div key={r.id} className="px-5 py-3 flex items-center justify-between gap-4">
                  <div>
                    <span className="font-body text-[13px] font-medium">{r.reviewerName}</span>
                    <span className="font-mono text-[9px] text-ink/30 ml-2">· {product?.name ?? r.productId}</span>
                    <span className="ml-2 text-amber-500 text-[12px]">{'★'.repeat(r.rating)}</span>
                    {r.comment && <p className="font-body text-[12px] text-ink/50 mt-1 truncate max-w-[500px]">{r.comment}</p>}
                  </div>
                  <form action={async () => { 'use server'; await deleteReview(r.id) }}>
                    <button type="submit" className="font-mono text-[9px] text-red/50 hover:text-red transition-colors uppercase tracking-[0.1em]">
                      Eliminar
                    </button>
                  </form>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
