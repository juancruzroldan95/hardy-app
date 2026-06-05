'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-ink text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-3 hover:bg-ink/80 transition-colors print:hidden"
    >
      Imprimir / Guardar PDF →
    </button>
  )
}
