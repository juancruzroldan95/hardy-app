export default function AdminPedidosLoading() {
  return (
    <div className="max-w-[1100px] animate-pulse">
      <div className="h-3 w-16 bg-ink/10 rounded mb-4" />
      <div className="h-9 w-52 bg-ink/10 rounded mb-8" />

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-6 max-md:grid-cols-2">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border border-ink/8 bg-paper p-4 h-[80px]" />
        ))}
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 mb-6">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="h-6 w-20 bg-ink/8 rounded" />
        ))}
      </div>

      {/* Table */}
      <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 bg-ink/8 rounded" />
              <div className="h-2 w-20 bg-ink/5 rounded" />
            </div>
            <div className="h-5 w-20 bg-ink/8 rounded" />
            <div className="h-4 w-24 bg-ink/8 rounded" />
            <div className="h-5 w-16 bg-ink/8 rounded-full" />
            <div className="h-5 w-20 bg-ink/8 rounded-full" />
            <div className="h-4 w-16 bg-ink/8 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
