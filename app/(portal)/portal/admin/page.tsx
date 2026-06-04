import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { getProfileByUserId, getAllClients } from '@/repository/queries/profile'
import { getAllOrders, getOrdersSummaryForStats, getMonthlyRevenue, getAllOrdersForRevenueTracking } from '@/repository/queries/orders'
import { getPendingAlertsCount } from '@/repository/queries/stock'
import { getPendingSolicitudesCount } from '@/repository/queries/solicitudes'
import { formatARS } from '@/consts/products'
import OrderStatusBadge from '@/components/portal/OrderStatusBadge'
import { ROLE_LABELS } from '@/consts/roles'

export default async function AdminDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfileByUserId(user.id)
  if (profile?.role !== 'admin') redirect('/portal')

  // ── Date helpers ──────────────────────────────────────────────────────────────
  const now          = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const startOfLastM = new Date(now.getFullYear(), now.getMonth() - 1, 1)

  // ── Parallel queries ─────────────────────────────────────────────────────────
  const [
    allOrders,
    revenueThisMonth,
    revenueLastMonth,
    allProfiles,
    alertsCount,
    solicitudesCount,
    recentOrders,
  ] = await Promise.all([
    getOrdersSummaryForStats(),
    getMonthlyRevenue(startOfMonth),
    getMonthlyRevenue(startOfLastM, startOfMonth),
    getAllClients(),
    getPendingAlertsCount(),
    getPendingSolicitudesCount(),
    getAllOrders().then((orders) => orders.slice(0, 8)),
  ])

  // ── Compute metrics ──────────────────────────────────────────────────────────
  const totalOrders   = allOrders.length
  const thisMonthArs  = revenueThisMonth
  const lastMonthArs  = revenueLastMonth
  const growthPct     = lastMonthArs > 0
    ? ((thisMonthArs - lastMonthArs) / lastMonthArs * 100).toFixed(0)
    : null
  const pendingCount  = allOrders.filter((o) => o.status === 'pending').length
  const unpaidCount   = allOrders.filter((o) => o.paymentStatus === 'unpaid').length
  const thisMonthOrders = allOrders.filter((o) => {
    const date = typeof o.id === 'string' ? new Date() : new Date()
    return true // simplified, recentOrders gives us the data we need
  }).length

  // ── Top clients by total spend ───────────────────────────────────────────────
  const spendByUser = new Map<string, number>()
  for (const o of allOrders) {
    const prev = spendByUser.get(o as unknown as string) ?? 0
    spendByUser.set(o.id, prev) // placeholder - need userId
  }

  // Build a proper revenue per userId from allOrders
  const allOrdersFull = await getAllOrdersForRevenueTracking()
  const revenuePerUser = new Map<string, number>()
  for (const o of allOrdersFull) {
    revenuePerUser.set(o.userId, (revenuePerUser.get(o.userId) ?? 0) + Number(o.totalArs))
  }
  const topClients = allProfiles
    .map((p) => ({ profile: p, spend: revenuePerUser.get(p.userId) ?? 0 }))
    .filter((c) => c.spend > 0)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 5)

  const profileMap = new Map(allProfiles.map((p) => [p.userId, p]))

  return (
    <div className="max-w-[1100px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">── Admin</p>
      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-8">
        Dashboard
      </h1>

      {/* ── KPIs ───────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-4 gap-3 mb-8 max-md:grid-cols-2">
        {/* Revenue this month */}
        <div className="bg-ink text-paper p-5 col-span-2 max-md:col-span-2">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-paper/40 mb-2">
            Facturado este mes
          </p>
          <p className="font-heading text-[32px] font-medium leading-none mb-2">
            {thisMonthArs > 0 ? formatARS(thisMonthArs) : '—'}
          </p>
          <div className="flex items-center gap-3">
            <p className="font-mono text-[9px] tracking-[0.1em] text-paper/40">
              Mes anterior: {lastMonthArs > 0 ? formatARS(lastMonthArs) : '—'}
            </p>
            {growthPct !== null && (
              <span className={`font-mono text-[10px] font-semibold ${Number(growthPct) >= 0 ? 'text-green-400' : 'text-red'}`}>
                {Number(growthPct) >= 0 ? '+' : ''}{growthPct}%
              </span>
            )}
          </div>
        </div>

        {/* Pending orders */}
        <div className={`p-5 border ${pendingCount > 0 ? 'bg-[#fdecea] border-red/20' : 'bg-paper border-ink/8'}`}>
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">
            Pedidos pendientes
          </p>
          <p className={`font-heading text-[36px] font-medium leading-none ${pendingCount > 0 ? 'text-red' : 'text-ink'}`}>
            {pendingCount}
          </p>
          <Link href="/portal/admin/pedidos" className="font-mono text-[9px] text-ink/40 uppercase tracking-[0.1em] hover:text-red transition-colors mt-2 block">
            Ver pedidos →
          </Link>
        </div>

        {/* Unpaid */}
        <div className={`p-5 border ${unpaidCount > 0 ? 'bg-amber-50 border-amber-200' : 'bg-paper border-ink/8'}`}>
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">
            Sin pago
          </p>
          <p className={`font-heading text-[36px] font-medium leading-none ${unpaidCount > 0 ? 'text-amber-600' : 'text-ink'}`}>
            {unpaidCount}
          </p>
          <p className="font-mono text-[9px] text-ink/40 uppercase tracking-[0.1em] mt-2">
            {totalOrders} total
          </p>
        </div>
      </div>

      {/* ── Alerts + Solicitudes row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3 mb-8 max-md:grid-cols-1">
        <Link
          href="/portal/admin/clientes"
          className={`p-5 border flex items-center justify-between hover:bg-paper-2 transition-colors ${alertsCount > 0 ? 'bg-[#fdecea] border-red/20' : 'bg-paper border-ink/8'}`}
        >
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-1">Alertas pendientes</p>
            <p className={`font-heading text-[28px] font-medium leading-none ${alertsCount > 0 ? 'text-red' : 'text-ink/30'}`}>
              {alertsCount > 0 ? alertsCount : '—'}
            </p>
          </div>
          <span className="font-mono text-[20px] text-ink/20">🔔</span>
        </Link>
        <Link
          href="/portal/admin/solicitudes"
          className={`p-5 border flex items-center justify-between hover:bg-paper-2 transition-colors ${solicitudesCount > 0 ? 'bg-[#f0f7f0] border-green-200' : 'bg-paper border-ink/8'}`}
        >
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-1">Solicitudes nuevas</p>
            <p className={`font-heading text-[28px] font-medium leading-none ${solicitudesCount > 0 ? 'text-[#2d6a35]' : 'text-ink/30'}`}>
              {solicitudesCount > 0 ? solicitudesCount : '—'}
            </p>
          </div>
          <span className="font-mono text-[20px] text-ink/20">📋</span>
        </Link>
      </div>

      {/* ── Main grid ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-[1fr_320px] gap-6 max-lg:grid-cols-1">

        {/* Recent orders */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/60">Pedidos recientes</h2>
            <Link href="/portal/admin/pedidos" className="font-mono text-[10px] text-red uppercase tracking-[0.1em] hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
            {recentOrders.map((order) => {
              const clientProfile = profileMap.get(order.userId)
              return (
                <Link
                  key={order.id}
                  href={`/portal/admin/pedidos/${order.id}`}
                  className="flex items-center gap-4 px-5 py-3 hover:bg-paper-2 transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <div className="font-body font-medium text-[13px] truncate">
                      {clientProfile?.displayName ?? clientProfile?.company ?? 'Cliente'}
                    </div>
                    <div className="font-mono text-[9px] tracking-[0.1em] text-red uppercase mt-[2px]">
                      {clientProfile ? (ROLE_LABELS[clientProfile.role] ?? clientProfile.role) : '—'}
                    </div>
                  </div>
                  <div className="text-center">
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-mono text-[13px] text-ink">{formatARS(Number(order.totalArs))}</div>
                    <div className="font-mono text-[9px] text-ink/30">
                      {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        {/* Top clients + Quick actions */}
        <div className="flex flex-col gap-6">
          {/* Top clients */}
          <div>
            <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/60 mb-4">Top clientes</h2>
            <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
              {topClients.length === 0 ? (
                <p className="px-5 py-4 font-mono text-[10px] text-ink/30">Sin datos aún.</p>
              ) : topClients.map(({ profile: p, spend }, i) => (
                <div key={p.id} className="flex items-center gap-3 px-4 py-3">
                  <span className="font-mono text-[10px] text-ink/30 w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="font-body text-[12px] font-medium truncate">
                      {p.displayName ?? p.company ?? 'Sin nombre'}
                    </div>
                    <div className="font-mono text-[8px] tracking-[0.1em] text-red uppercase">
                      {ROLE_LABELS[p.role] ?? p.role}
                    </div>
                  </div>
                  <span className="font-mono text-[11px] text-ink shrink-0">{formatARS(spend)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/60 mb-4">Accesos rápidos</h2>
            <div className="flex flex-col gap-2">
              {[
                { href: '/portal/admin/pedidos/nuevo',    label: 'Crear pedido para cliente' },
                { href: '/portal/admin/clientes/nuevo',   label: 'Agregar cliente'           },
                { href: '/portal/admin/stock',            label: 'Gestionar stock'           },
                { href: '/portal/admin/pedidos?export=1', label: 'Exportar pedidos CSV'      },
                { href: '/portal/admin/novedades/nueva',  label: 'Nueva novedad'             },
              ].map(({ href, label }) => (
                <Link
                  key={href}
                  href={href}
                  className="px-4 py-3 bg-paper border border-ink/8 font-mono text-[10px] tracking-[0.1em] uppercase text-ink/60 hover:bg-paper-2 hover:text-ink transition-colors flex items-center justify-between"
                >
                  {label}
                  <span className="text-ink/30">→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
