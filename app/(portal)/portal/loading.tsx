export default function PortalLoading() {
  return (
    <div className="max-w-[900px] animate-pulse">
      {/* Eyebrow */}
      <div className="h-3 w-32 bg-ink/10 rounded mb-4" />

      {/* Title */}
      <div className="h-9 w-64 bg-ink/10 rounded mb-2" />
      <div className="h-4 w-48 bg-ink/8 rounded mb-8" />

      {/* Stats cards */}
      <div className="grid grid-cols-2 gap-4 mb-10 max-md:grid-cols-1">
        {[1, 2].map((i) => (
          <div key={i} className="bg-paper border border-ink/8 p-6 h-[88px]" />
        ))}
      </div>

      {/* Content rows */}
      <div className="h-4 w-40 bg-ink/8 rounded mb-4" />
      <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 bg-ink/8 rounded" />
              <div className="h-3 w-16 bg-ink/5 rounded" />
            </div>
            <div className="h-6 w-20 bg-ink/8 rounded" />
            <div className="h-4 w-16 bg-ink/8 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
