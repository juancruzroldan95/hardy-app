import { redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { db } from '@/db'
import { profiles, orders, costs } from '@/db/schema'
import { and, eq, desc, ne } from 'drizzle-orm'
import { formatARS } from '@/consts/products'
import CostForm from '@/components/portal/CostForm'
import { COST_CATEGORIES } from '@/consts/cost-categories'
import { deleteCost } from '@/repository/mutations/finanzas'

const CAT_LABEL: Record<string, string> = Object.fromEntries(
  COST_CATEGORIES.map((c) => [c.value, c.label]),
)

function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

export default async function AdminFinanzasPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminProfile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (adminProfile?.role !== 'admin') redirect('/portal')

  const [allOrders, allCosts] = await Promise.all([
    db.query.orders.findMany({
      where: and(eq(orders.isDeleted, false), ne(orders.status, 'cancelled')),
      columns: { totalArs: true, createdAt: true },
    }),
    db.query.costs.findMany({
      where:   eq(costs.isDeleted, false),
      orderBy: [desc(costs.costDate)],
    }),
  ])

  // ── Totales globales ────────────────────────────────────────────────────────
  const totalVentas = allOrders.reduce((s, o) => s + Number(o.totalArs), 0)
  const totalCostos = allCosts.reduce((s, c) => s + Number(c.amountArs), 0)
  const resultado   = totalVentas - totalCostos
  const margen      = totalVentas > 0 ? (resultado / totalVentas) * 100 : 0

  // ── Serie mensual (últimos 6 meses) ────────────────────────────────────────
  const months: { key: string; label: string; ventas: number; costos: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    months.push({
      key:    monthKey(d),
      label:  d.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase(),
      ventas: 0,
      costos: 0,
    })
  }
  const monthMap = new Map(months.map((m) => [m.key, m]))
  for (const o of allOrders) {
    const m = monthMap.get(monthKey(new Date(o.createdAt)))
    if (m) m.ventas += Number(o.totalArs)
  }
  for (const c of allCosts) {
    // costDate es 'YYYY-MM-DD' → tomar 'YYYY-MM'
    const m = monthMap.get(c.costDate.slice(0, 7))
    if (m) m.costos += Number(c.amountArs)
  }
  const maxBar = Math.max(...months.flatMap((m) => [m.ventas, m.costos]), 1)

  // ── Costos del mes actual por categoría ─────────────────────────────────────
  const curKey = monthKey(new Date())
  const curCostsByCat = new Map<string, number>()
  for (const c of allCosts) {
    if (c.costDate.slice(0, 7) !== curKey) continue
    const cat = c.category ?? 'otros'
    curCostsByCat.set(cat, (curCostsByCat.get(cat) ?? 0) + Number(c.amountArs))
  }
  const catRows = [...curCostsByCat.entries()].sort((a, b) => b[1] - a[1])
  const curCostsTotal = catRows.reduce((s, [, v]) => s + v, 0)

  return (
    <div className="max-w-[1000px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">── Admin · Finanzas</p>
      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-2">
        Resultado contable
      </h1>
      <p className="font-body text-[14px] text-ink/40 mb-8">
        Cargá tus costos y mirá cómo viene el negocio: ventas, costos y resultado mes a mes.
      </p>

      {/* ── Resumen ─────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 mb-8 max-md:grid-cols-2">
        <div className="border border-ink/8 bg-paper p-4">
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-1">Ventas (total)</p>
          <p className="font-heading text-[24px] font-medium leading-none text-ink">{formatARS(totalVentas)}</p>
        </div>
        <div className="border border-ink/8 bg-paper p-4">
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-1">Costos (total)</p>
          <p className="font-heading text-[24px] font-medium leading-none text-red">{formatARS(totalCostos)}</p>
        </div>
        <div className={`border p-4 ${resultado >= 0 ? 'bg-[#e8f4ea] border-[#c6dfc7]' : 'bg-[#fdecea] border-red/20'}`}>
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-1">Resultado</p>
          <p className={`font-heading text-[24px] font-medium leading-none ${resultado >= 0 ? 'text-[#2d6a35]' : 'text-red'}`}>
            {formatARS(resultado)}
          </p>
        </div>
        <div className="border border-ink/8 bg-paper p-4">
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-1">Margen</p>
          <p className={`font-heading text-[24px] font-medium leading-none ${margen >= 0 ? 'text-ink' : 'text-red'}`}>
            {margen.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* ── Gráfico mensual ─────────────────────────────────────────── */}
      <div className="bg-paper border border-ink/8 p-6 mb-8">
        <div className="flex items-center justify-between mb-6 flex-wrap gap-2">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold">── Ventas vs Costos · últimos 6 meses</p>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink/50">
              <span className="w-3 h-3 bg-ink inline-block" /> Ventas
            </span>
            <span className="flex items-center gap-1.5 font-mono text-[9px] uppercase tracking-[0.1em] text-ink/50">
              <span className="w-3 h-3 bg-red inline-block" /> Costos
            </span>
          </div>
        </div>

        <div className="flex items-end gap-4 h-[200px] max-md:gap-2">
          {months.map((m) => {
            const vH = (m.ventas / maxBar) * 100
            const cH = (m.costos / maxBar) * 100
            const res = m.ventas - m.costos
            return (
              <div key={m.key} className="flex-1 flex flex-col items-center gap-2">
                <div className="w-full flex items-end justify-center gap-1" style={{ height: '150px' }}>
                  <div
                    className="w-1/2 bg-ink transition-all relative group"
                    style={{ height: m.ventas > 0 ? `${Math.max(vH, 1)}%` : '1px' }}
                    title={`Ventas: ${formatARS(m.ventas)}`}
                  />
                  <div
                    className="w-1/2 bg-red transition-all relative group"
                    style={{ height: m.costos > 0 ? `${Math.max(cH, 1)}%` : '1px' }}
                    title={`Costos: ${formatARS(m.costos)}`}
                  />
                </div>
                <span className="font-mono text-[9px] tracking-[0.1em] text-ink/40">{m.label}</span>
                {(m.ventas > 0 || m.costos > 0) && (
                  <span className={`font-mono text-[8px] ${res >= 0 ? 'text-[#2d6a35]' : 'text-red'}`}>
                    {res >= 0 ? '+' : ''}{formatARS(res)}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* ── Costos del mes por categoría ────────────────────────────── */}
      {catRows.length > 0 && (
        <div className="bg-paper border border-ink/8 p-6 mb-8">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold mb-4">
            ── Costos de este mes por categoría
          </p>
          <div className="flex flex-col gap-2">
            {catRows.map(([cat, val]) => {
              const pct = curCostsTotal > 0 ? (val / curCostsTotal) * 100 : 0
              return (
                <div key={cat} className="flex items-center gap-3">
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-ink/60 w-[140px] shrink-0">
                    {CAT_LABEL[cat] ?? cat}
                  </span>
                  <div className="flex-1 bg-paper-2 h-5 relative overflow-hidden">
                    <div className="h-full bg-red/70" style={{ width: `${pct}%` }} />
                  </div>
                  <span className="font-mono text-[11px] text-ink w-[110px] text-right shrink-0">{formatARS(val)}</span>
                  <span className="font-mono text-[9px] text-ink/35 w-[40px] text-right shrink-0">{pct.toFixed(0)}%</span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Formulario de carga ─────────────────────────────────────── */}
      <div className="mb-8">
        <CostForm />
      </div>

      {/* ── Lista de costos ─────────────────────────────────────────── */}
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 mb-3">
        ── Costos cargados ({allCosts.length})
      </p>
      {allCosts.length === 0 ? (
        <div className="bg-paper border border-ink/8 p-10 text-center">
          <p className="font-body text-[14px] text-ink/40">Todavía no cargaste ningún costo.</p>
        </div>
      ) : (
        <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
          {allCosts.map((c) => (
            <div key={c.id} className="px-5 py-3 flex items-center gap-4">
              <div className="flex-1 min-w-0">
                <div className="font-body font-medium text-[13px] text-ink truncate">{c.concept}</div>
                <div className="font-mono text-[9px] tracking-[0.08em] text-ink/40 mt-[2px]">
                  {c.category ? (CAT_LABEL[c.category] ?? c.category) : 'Sin categoría'}
                  {' · '}
                  {new Date(c.costDate + 'T00:00:00').toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                </div>
              </div>
              <span className="font-mono text-[13px] text-red shrink-0">{formatARS(Number(c.amountArs))}</span>
              <form action={async () => { 'use server'; await deleteCost(c.id) }}>
                <button
                  type="submit"
                  className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/30 hover:text-red transition-colors shrink-0"
                  title="Eliminar costo"
                >
                  × Borrar
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
