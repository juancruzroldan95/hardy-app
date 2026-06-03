'use client'

import { useActionState, useState } from 'react'
import { submitProductReview, type ReviewState } from '@/lib/actions/reviews'

interface ProductOption {
  id:   string
  name: string
  size: string
}

interface Props {
  products: ProductOption[]
}

export default function ReviewForm({ products }: Props) {
  const [rating, setRating] = useState(0)
  const [hover,  setHover]  = useState(0)

  const [state, action, isPending] = useActionState<ReviewState, FormData>(
    submitProductReview,
    undefined,
  )

  if (state && 'success' in state) {
    return (
      <div className="bg-[#f0f7f0] border border-[#c6dfc7] px-5 py-6 text-center">
        <p className="font-heading text-[20px] font-medium text-[#2d6a35] mb-1">¡Gracias por tu reseña!</p>
        <p className="font-body text-[14px] text-[#2d6a35]/70">
          La revisaremos y la publicaremos en breve.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="bg-paper border border-ink/8 p-6 max-w-[560px]">
      {/* Product selector */}
      <div className="mb-4">
        <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50 block mb-2">
          Producto *
        </label>
        <select name="productId" required
          className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors">
          <option value="">Seleccioná un producto</option>
          {products.map((p) => (
            <option key={p.id} value={p.id}>{p.name} {p.size}</option>
          ))}
        </select>
      </div>

      {/* Name */}
      <div className="mb-4">
        <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50 block mb-2">
          Tu nombre *
        </label>
        <input type="text" name="reviewerName" required placeholder="Nombre"
          className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors" />
      </div>

      {/* Star rating */}
      <div className="mb-4">
        <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50 block mb-2">
          Calificación *
        </label>
        <input type="hidden" name="rating" value={rating} />
        <div className="flex gap-1">
          {[1,2,3,4,5].map((star) => (
            <button
              key={star}
              type="button"
              onMouseEnter={() => setHover(star)}
              onMouseLeave={() => setHover(0)}
              onClick={() => setRating(star)}
              className="text-[28px] transition-colors"
              style={{ color: star <= (hover || rating) ? '#f59e0b' : '#d1d5db' }}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-5">
        <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50 block mb-2">
          Comentario (opcional)
        </label>
        <textarea name="comment" rows={3} placeholder="Contanos tu experiencia con el producto…"
          className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors resize-none" />
      </div>

      {state && 'error' in state && (
        <p className="font-mono text-[11px] text-red mb-4">{state.error}</p>
      )}

      <button type="submit" disabled={isPending || rating === 0}
        className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[14px] disabled:opacity-40 transition-opacity">
        {isPending ? 'Enviando…' : 'Enviar reseña →'}
      </button>
    </form>
  )
}
