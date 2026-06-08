import Link from 'next/link'

export default function PortalNotFound() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-6">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-6">── Error 404</p>
      <h1 className="font-display text-[80px] leading-none text-ink">404</h1>
      <h2 className="font-heading mt-6 text-[28px] font-medium text-ink leading-[1.2]">
        Esta página no existe.<br />
        <em className="not-italic text-red">Pero el maní sí.</em>
      </h2>
      <p className="font-body mt-4 text-[14px] text-ink/50 max-w-md leading-[1.7]">
        La dirección que buscás no existe dentro del portal.
      </p>
      <div className="mt-8 flex gap-3 flex-wrap justify-center">
        <Link
          href="/portal"
          className="bg-red text-paper font-mono text-[11px] tracking-[0.18em] uppercase px-6 py-[13px]"
        >
          Volver al dashboard →
        </Link>
        <Link
          href="/portal/catalogo"
          className="border border-ink/20 text-ink font-mono text-[11px] tracking-[0.18em] uppercase px-6 py-[13px] hover:bg-paper-2 transition-colors"
        >
          Ver catálogo
        </Link>
      </div>
    </div>
  )
}
