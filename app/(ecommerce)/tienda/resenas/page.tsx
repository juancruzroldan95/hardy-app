import type { Metadata } from 'next'
import { db } from '@/db'
import { productReviews } from '@/db/schema'
import { and, eq, desc } from 'drizzle-orm'
import { getProducts } from '@/consts/products'
import ReviewForm from '@/components/store/ReviewForm'

export const metadata: Metadata = {
  title: 'Reseñas · Hardy',
  description: 'Leé lo que dicen nuestros clientes y dejá tu opinión sobre los productos Hardy.',
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex gap-[2px]">
      {[1,2,3,4,5].map((i) => (
        <span key={i} className={i <= rating ? 'text-amber-500' : 'text-gray-300'}>★</span>
      ))}
    </div>
  )
}

export default async function ResenasPage() {
  const products = getProducts()
  const frascos  = products.filter((p) => p.line === 'frasco')

  const reviews = await db.query.productReviews.findMany({
    where: and(eq(productReviews.isPublished, true), eq(productReviews.isDeleted, false)),
    orderBy: [desc(productReviews.createdAt)],
  })

  const reviewsByProduct = new Map<string, typeof reviews>()
  reviews.forEach((r) => {
    if (!reviewsByProduct.has(r.productId)) reviewsByProduct.set(r.productId, [])
    reviewsByProduct.get(r.productId)!.push(r)
  })

  const avgByProduct = new Map<string, number>()
  reviewsByProduct.forEach((rs, pid) => {
    avgByProduct.set(pid, rs.reduce((s, r) => s + r.rating, 0) / rs.length)
  })

  return (
    <div className="bg-paper min-h-screen py-16 px-8 max-md:px-5">
      <div className="max-w-[900px] mx-auto">
        <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">── Reseñas</p>
        <h1 className="font-heading text-[clamp(32px,5vw,48px)] font-medium leading-[1.1] tracking-[-0.02em] mb-4">
          Lo que dicen nuestros clientes.
        </h1>
        <p className="font-body text-[16px] text-ink/50 mb-12">
          {reviews.length} reseña{reviews.length !== 1 ? 's' : ''} verificada{reviews.length !== 1 ? 's' : ''} de clientes reales.
        </p>

        {/* Reviews by product */}
        {frascos.map((product) => {
          const productRevs = reviewsByProduct.get(product.id) ?? []
          const avg = avgByProduct.get(product.id)
          if (productRevs.length === 0) return null
          return (
            <div key={product.id} className="mb-12">
              <div className="flex items-center gap-3 mb-6">
                <h2 className="font-heading text-[20px] font-medium">{product.name}</h2>
                <span className="font-mono text-[9px] tracking-[0.1em] text-red uppercase">{product.size}</span>
                {avg && (
                  <div className="flex items-center gap-1 ml-auto">
                    <Stars rating={Math.round(avg)} />
                    <span className="font-mono text-[11px] text-ink/50 ml-1">{avg.toFixed(1)}</span>
                  </div>
                )}
              </div>
              <div className="space-y-4">
                {productRevs.map((r) => (
                  <div key={r.id} className="bg-paper border border-ink/8 px-5 py-4">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div>
                        <span className="font-body font-semibold text-[14px]">{r.reviewerName}</span>
                        <span className="font-mono text-[9px] text-ink/30 ml-2">
                          {new Date(r.createdAt).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                      <Stars rating={r.rating} />
                    </div>
                    {r.comment && (
                      <p className="font-body text-[14px] text-ink/70 leading-[1.6]">{r.comment}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

        {reviews.length === 0 && (
          <div className="bg-paper-2 border border-ink/8 p-10 text-center mb-12">
            <p className="font-body text-[15px] text-ink/40">Sé el primero en dejar tu reseña.</p>
          </div>
        )}

        {/* Review form */}
        <div className="border-t border-ink/10 pt-12">
          <h2 className="font-heading text-[24px] font-medium tracking-[-0.02em] mb-2">
            Dejá tu opinión
          </h2>
          <p className="font-body text-[14px] text-ink/50 mb-6">
            Tu reseña se publica después de una verificación rápida.
          </p>
          <ReviewForm products={frascos.map((p) => ({ id: p.id, name: p.name, size: p.size }))} />
        </div>
      </div>
    </div>
  )
}
