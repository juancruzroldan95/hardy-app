'use client'

import { useActionState } from 'react'
import { subscribeNewsletter } from '@/repository/mutations/newsletter'
import type { NewsletterState } from '@/repository/mutations/newsletter'

export default function NewsletterForm() {
  const [state, action, isPending] = useActionState<NewsletterState, FormData>(
    subscribeNewsletter,
    undefined,
  )

  const done = state && 'success' in state

  return (
    <div>
      <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-red mb-5">
        Novedades
      </div>

      {done ? (
        <p className="font-body text-[14px] text-[#bbb] leading-[1.5]">
          ¡Listo! Te vamos a avisar de lanzamientos, recetas y promos. 🙌
        </p>
      ) : (
        <>
          <p className="text-[#888] text-[13px] leading-[1.5] mb-4">
            Recetas, lanzamientos y promos. Sin spam.
          </p>
          <form action={action} className="flex flex-col gap-2">
            <input type="hidden" name="source" value="footer" />
            <div className="flex gap-2 max-[600px]:flex-col">
              <input
                type="email"
                name="email"
                required
                placeholder="tu@email.com"
                aria-label="Tu email"
                className="flex-1 bg-transparent border border-[#2a2a2a] text-paper font-body text-[13px] px-4 py-[10px] outline-none focus:border-red transition-colors placeholder:text-[#555]"
              />
              <button
                type="submit"
                disabled={isPending}
                className="bg-red text-paper font-mono text-[10px] tracking-[0.15em] uppercase px-5 py-[10px] hover:bg-red/90 transition-colors disabled:opacity-50 whitespace-nowrap"
              >
                {isPending ? '...' : 'Suscribirme →'}
              </button>
            </div>
            {state && 'error' in state && (
              <p className="font-mono text-[10px] text-red mt-1">{state.error}</p>
            )}
          </form>
        </>
      )}
    </div>
  )
}
