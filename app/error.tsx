'use client'

import { useEffect } from 'react'
import Link from 'next/link'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-ink text-paper flex flex-col items-center justify-center px-6 text-center">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-6">
        ── Error inesperado
      </p>

      <div className="font-display text-[clamp(60px,14vw,140px)] leading-none text-red mb-4">
        !</div>

      <h1 className="font-heading text-[clamp(22px,4vw,38px)] font-medium leading-[1.1] tracking-[-0.02em] text-paper mb-4 max-w-lg">
        Algo salió mal.
        <br />
        <em className="not-italic text-red">Ya estamos en eso.</em>
      </h1>

      <p className="font-body text-[14px] text-paper/50 mb-10 max-w-sm leading-relaxed">
        Ocurrió un error inesperado. Podés intentar de nuevo o volver al inicio.
      </p>

      <div className="flex gap-3 flex-wrap justify-center">
        <button
          onClick={reset}
          className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[16px] hover:bg-red/90 transition-colors"
        >
          Intentar de nuevo →
        </button>
        <Link
          href="/"
          className="border border-paper/30 text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[16px] hover:border-red hover:text-red transition-colors"
        >
          Ir al inicio
        </Link>
      </div>

      {error.digest && (
        <p className="font-mono text-[9px] text-paper/20 mt-8 tracking-[0.06em]">
          Código: {error.digest}
        </p>
      )}
    </div>
  )
}
