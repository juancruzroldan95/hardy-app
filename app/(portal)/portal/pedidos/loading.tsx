export default function PedidosLoading() {
  return (
    <div className="max-w-[860px] animate-pulse">
      <div className="h-3 w-24 bg-ink/10 rounded mb-4" />
      <div className="h-8 w-48 bg-ink/10 rounded mb-2" />
      <div className="h-4 w-64 bg-ink/8 rounded mb-8" />

      <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-5 py-4 flex items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-3 w-20 bg-ink/8 rounded" />
              <div className="h-3 w-28 bg-ink/5 rounded" />
            </div>
            <div className="flex items-center gap-4">
              <div className="h-5 w-20 bg-ink/8 rounded-full" />
              <div className="h-4 w-16 bg-ink/8 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
