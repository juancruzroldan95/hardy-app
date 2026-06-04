'use client'

export default function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-5 py-2 hover:bg-red/90 transition-colors"
    >
      Descargar PDF →
    </button>
  )
}
