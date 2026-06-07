import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ink text-paper flex flex-col items-center justify-center px-6 text-center">
      {/* Eyebrow */}
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-6">
        ── Error 404
      </p>

      {/* Big number */}
      <div className="font-display text-[clamp(80px,20vw,200px)] leading-none text-red mb-4">
        404
      </div>

      {/* Heading con estilo Hardy */}
      <h1 className="font-heading text-[clamp(24px,4vw,42px)] font-medium leading-[1.1] tracking-[-0.02em] text-paper mb-4 max-w-lg">
        Esta página no existe.
        <br />
        <em className="not-italic text-red">Pero el maní sí.</em>
      </h1>

      <p className="font-body text-[15px] text-paper/50 mb-10 max-w-sm leading-relaxed">
        La dirección que buscás no existe. Probablemente fue movida o nunca existió.
      </p>

      {/* CTAs */}
      <div className="flex gap-3 flex-wrap justify-center">
        <Link
          href="/"
          className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[16px]"
        >
          Ir al inicio →
        </Link>
        <Link
          href="/tienda"
          className="border border-paper/30 text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[16px] hover:border-red hover:text-red transition-colors"
        >
          Ver productos
        </Link>
      </div>
    </div>
  )
}
