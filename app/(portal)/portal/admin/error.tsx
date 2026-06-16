'use client'

export default function AdminDashboardError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="max-w-[1100px] py-16 text-center">
      <div className="font-mono text-[9px] tracking-[0.2em] uppercase text-red mb-4">
        Error al cargar el dashboard
      </div>
      <p className="font-mono text-[11px] text-ink/50 mb-6">
        Ocurrió un problema al obtener los datos. Intentá de nuevo.
      </p>
      <button
        onClick={reset}
        className="bg-ink text-paper font-mono text-[10px] tracking-[0.15em] uppercase px-6 py-3"
      >
        Reintentar
      </button>
    </div>
  )
}
