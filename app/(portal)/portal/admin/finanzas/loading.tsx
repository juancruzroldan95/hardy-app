export default function AdminFinanzasLoading() {
  return (
    <div className="max-w-[1100px] animate-pulse">
      <div className="h-3 w-16 bg-ink/10 rounded mb-4" />
      <div className="h-9 w-52 bg-ink/10 rounded mb-8" />
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[1, 2, 3].map((i) => (
          <div key={i} className="border border-ink/8 bg-paper p-4 h-[80px]" />
        ))}
      </div>
      <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="px-5 py-4 flex items-center gap-4">
            <div className="flex-1 space-y-2">
              <div className="h-3 w-32 bg-ink/8 rounded" />
              <div className="h-2 w-20 bg-ink/5 rounded" />
            </div>
            <div className="h-4 w-24 bg-ink/8 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
