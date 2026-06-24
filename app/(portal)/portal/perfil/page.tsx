import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { db } from '@/db'
import { orderItems, orders, profiles } from '@/db/schema'
import { and, desc, eq, inArray } from 'drizzle-orm'
import { getDeliveryAddressesByProfileId, getProfileByUserId } from '@/repository/queries/profile'
import { formatARS, getProductById } from '@/consts/products'
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/consts/roles'
import ProfileForm from '@/components/portal/ProfileForm'
import DeliveryAddressesSection from '@/components/portal/DeliveryAddressesSection'
import PasswordChangeModal from '@/components/portal/PasswordChangeModal'
import OrderStatusBadge from '@/components/portal/OrderStatusBadge'

export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfileByUserId(user.id)
  if (!profile) redirect('/portal')

  const [myAddresses, allOrders] = await Promise.all([
    getDeliveryAddressesByProfileId(profile.id),
    db.query.orders.findMany({
      where:   and(eq(orders.userId, user.id), eq(orders.isDeleted, false)),
      orderBy: [desc(orders.createdAt)],
    }),
  ])

  const orderIds = allOrders.map((o) => o.id)
  const allItems = orderIds.length > 0
    ? await db.query.orderItems.findMany({
        where: and(
          inArray(orderItems.orderId, orderIds),
          eq(orderItems.isDeleted, false),
        ),
      })
    : []

  // ── Métricas ────────────────────────────────────────────────────────────────

  const gastoTotal   = allOrders.reduce((s, o) => s + Number(o.totalArs), 0)
  const totalPedidos = allOrders.length

  // Cajas vs baldes
  let totalCajas  = 0
  let totalBaldes = 0
  for (const item of allItems) {
    const prod = getProductById(item.productId)
    if (prod?.line === 'balde') totalBaldes += item.qty
    else               totalCajas  += item.qty
  }

  // Frecuencia promedio
  let frecuenciaLabel = '—'
  if (allOrders.length === 1) {
    frecuenciaLabel = 'Primer pedido'
  } else if (allOrders.length >= 2) {
    const sorted = [...allOrders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    let totalDays = 0
    for (let i = 1; i < sorted.length; i++) {
      totalDays +=
        (new Date(sorted[i].createdAt).getTime() - new Date(sorted[i - 1].createdAt).getTime()) /
        (1000 * 60 * 60 * 24)
    }
    const avg = Math.round(totalDays / (sorted.length - 1))
    frecuenciaLabel = `cada ${avg} días`
  }

  // Último pedido
  const lastOrder = allOrders[0] ?? null

  // ── Breakdown por producto ──────────────────────────────────────────────────

  const byProduct: Record<string, { name: string; size: string; isBalde: boolean; qty: number; subtotal: number }> = {}
  for (const item of allItems) {
    if (!byProduct[item.productId]) {
      const prod = getProductById(item.productId)
      byProduct[item.productId] = {
        name:    item.productName,
        size:    item.size,
        isBalde: prod?.line === 'balde',
        qty:     0,
        subtotal: 0,
      }
    }
    byProduct[item.productId].qty      += item.qty
    byProduct[item.productId].subtotal += Number(item.subtotalArs)
  }

  const productBreakdown = Object.values(byProduct)
    .sort((a, b) => b.subtotal - a.subtotal)

  const totalQtyAll = productBreakdown.reduce((s, p) => s + p.qty, 0)

  // ── Últimos 6 meses (gráfico) ───────────────────────────────────────────────

  const monthlyData: { key: string; label: string; total: number; count: number }[] = []
  for (let i = 5; i >= 0; i--) {
    const d = new Date()
    d.setDate(1)
    d.setMonth(d.getMonth() - i)
    const key   = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('es-AR', { month: 'short' }).toUpperCase()
    const monthOrders = allOrders.filter((o) => {
      const od = new Date(o.createdAt)
      return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth()
    })
    monthlyData.push({
      key,
      label,
      total: monthOrders.reduce((s, o) => s + Number(o.totalArs), 0),
      count: monthOrders.length,
    })
  }
  const maxMonthly  = Math.max(...monthlyData.map((m) => m.total), 1)
  const hasActivity = monthlyData.some((m) => m.count > 0)

  const recentOrders = allOrders.slice(0, 5)

  return (
    <div className="max-w-[860px]">

      {/* ── Encabezado ─────────────────────────────────────────────── */}
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">── Mi perfil</p>
      <h1 className="font-heading text-[clamp(26px,3.5vw,38px)] font-medium leading-[1.1] tracking-[-0.02em] mb-1">
        {profile.displayName ?? user.email}
      </h1>
      <div className="flex items-center gap-3 mb-10">
        <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-red bg-[#fdecea] px-3 py-[5px]">
          {ROLE_LABELS[profile.role]}
        </span>
        <span className="font-body text-[13px] text-ink/40">
          {ROLE_DESCRIPTIONS[profile.role]}
        </span>
      </div>

      {/* ── Métricas resumen ────────────────────────────────────────── */}
      {totalPedidos > 0 && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
            <div className="bg-paper border border-ink/8 p-5">
              <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink/40 mb-2">Pedidos</p>
              <p className="font-heading text-[32px] font-medium leading-none">{totalPedidos}</p>
            </div>
            <div className="bg-paper border border-ink/8 p-5">
              <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink/40 mb-2">Gasto total</p>
              <p className="font-heading text-[20px] font-medium leading-none">{formatARS(gastoTotal)}</p>
              <p className="font-mono text-[8px] text-ink/30 mt-1 uppercase tracking-[0.08em]">c/IVA acum.</p>
            </div>
            <div className="bg-paper border border-ink/8 p-5">
              <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink/40 mb-2">Cajas totales</p>
              <p className="font-heading text-[32px] font-medium leading-none">{totalCajas}</p>
              {totalBaldes > 0 && (
                <p className="font-mono text-[8px] text-ink/30 mt-1 uppercase tracking-[0.08em]">
                  + {totalBaldes} baldes
                </p>
              )}
            </div>
            <div className="bg-paper border border-ink/8 p-5">
              <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink/40 mb-2">Frecuencia</p>
              <p className="font-heading text-[18px] font-medium leading-tight">{frecuenciaLabel}</p>
              {allOrders.length >= 2 && (
                <p className="font-mono text-[8px] text-ink/30 mt-1 uppercase tracking-[0.08em]">entre pedidos</p>
              )}
            </div>
          </div>

          {/* ── Gráfico últimos 6 meses ─────────────────────────────── */}
          {hasActivity && (
            <div className="bg-paper border border-ink/8 px-6 py-5 mb-3">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-4">
                Compras · últimos 6 meses
              </p>
              <div className="flex items-end gap-3 h-[100px]">
                {monthlyData.map((m, idx) => {
                  const heightPct    = (m.total / maxMonthly) * 100
                  const isCurrent    = idx === monthlyData.length - 1
                  return (
                    <div key={m.key} className="flex-1 flex flex-col items-center gap-2 h-full">
                      <div className="w-full flex-1 flex items-end">
                        <div
                          title={m.total > 0 ? `${formatARS(m.total)} · ${m.count} pedido${m.count !== 1 ? 's' : ''}` : 'Sin pedidos'}
                          className={`w-full transition-all ${isCurrent ? 'bg-red' : 'bg-ink/20'}`}
                          style={{ height: m.total > 0 ? `${Math.max(heightPct, 3)}%` : '2px' }}
                        />
                      </div>
                      <span className="font-mono text-[8px] tracking-[0.08em] text-ink/40">{m.label}</span>
                      {m.count > 0 && (
                        <span className="font-mono text-[7px] text-red leading-none">{m.count}p</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* ── Breakdown por producto ──────────────────────────────── */}
          {productBreakdown.length > 0 && (
            <div className="bg-paper border border-ink/8 mb-10">
              <div className="px-5 py-3 border-b border-ink/8">
                <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/50">
                  Qué venís comprando
                </p>
              </div>
              {productBreakdown.map((prod) => {
                const pct = totalQtyAll > 0 ? Math.round((prod.qty / totalQtyAll) * 100) : 0
                const unit = prod.isBalde ? 'balde' : 'caja'
                return (
                  <div key={prod.name + prod.size} className="px-5 py-3 border-b border-ink/8 last:border-0">
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <div className="min-w-0">
                        <span className="font-body font-semibold text-[13px]">{prod.name}</span>
                        <span className="font-mono text-[9px] text-ink/40 ml-2 uppercase tracking-[0.08em]">{prod.size}</span>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="font-mono text-[12px] text-ink">{prod.qty} {unit}{prod.qty !== 1 ? 's' : ''}</span>
                        <span className="font-mono text-[9px] text-ink/35 ml-2">{formatARS(prod.subtotal)}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 bg-ink/6 h-[4px]">
                        <div className="bg-red h-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="font-mono text-[8px] text-ink/35 shrink-0 w-[28px] text-right">{pct}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* ── Pedidos recientes ───────────────────────────────────── */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50">
                Pedidos recientes
              </p>
              {totalPedidos > 5 && (
                <Link
                  href="/portal/pedidos"
                  className="font-mono text-[10px] tracking-[0.12em] uppercase text-red hover:underline"
                >
                  Ver todos →
                </Link>
              )}
            </div>
            <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
              {recentOrders.map((order) => (
                <Link
                  key={order.id}
                  href={`/portal/pedidos/${order.id}`}
                  className="flex items-center justify-between px-5 py-4 hover:bg-paper-2 transition-colors group"
                >
                  <div>
                    <span className="font-mono text-[10px] tracking-[0.08em] text-ink/40 uppercase block">
                      {new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                    {order.purchaseOrderNumber && (
                      <span className="font-mono text-[9px] text-ink/30">{order.purchaseOrderNumber}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <OrderStatusBadge status={order.status} />
                    <span className="font-mono text-[13px] text-ink">{formatARS(Number(order.totalArs))}</span>
                    <span className="font-mono text-[11px] text-ink/30 group-hover:text-red transition-colors">→</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      {totalPedidos === 0 && (
        <div className="bg-paper border border-ink/8 p-10 text-center mb-12">
          <p className="font-body text-[14px] text-ink/40 mb-4">Todavía no hay pedidos registrados.</p>
          <Link
            href="/portal/catalogo"
            className="inline-block bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[12px]"
          >
            Ver catálogo y precios →
          </Link>
        </div>
      )}

      {/* ── Datos de cuenta ─────────────────────────────────────────── */}
      <div className="border-t border-ink/10 pt-10">
        <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">── Datos de cuenta</p>
        <h2 className="font-heading text-[clamp(20px,2.5vw,28px)] font-medium leading-[1.1] tracking-[-0.02em] mb-6">
          Información del negocio
        </h2>

        {/* Email — inmutable */}
        <div className="bg-paper border border-ink/8 p-5 mb-6">
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-1">Email</p>
          <p className="font-body text-[15px] text-ink">{user.email}</p>
          <p className="font-mono text-[9px] tracking-[0.1em] text-ink/30 mt-1">
            Para cambiar el email, contactá a Hardy.
          </p>
          <div className="mt-4 pt-4 border-t border-ink/8">
            <PasswordChangeModal />
          </div>
        </div>

        <ProfileForm profile={profile} />
      </div>

      {/* ── Direcciones de entrega ──────────────────────────────────── */}
      <div className="mt-10">
        <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">── Logística</p>
        <h2 className="font-heading text-[clamp(20px,2.5vw,28px)] font-medium leading-[1.1] tracking-[-0.02em] mb-6">
          Direcciones de entrega
        </h2>
        <DeliveryAddressesSection addresses={myAddresses} />
      </div>

    </div>
  )
}
