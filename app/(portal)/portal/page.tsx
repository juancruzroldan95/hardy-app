import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { orderItems, orders, profiles, productReviews } from '@/drizzle/schema'
import { and, eq, count, desc, inArray } from 'drizzle-orm'
import { getProductById } from '@/lib/products'
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/roles'
import OrderStatusBadge from '@/components/portal/OrderStatusBadge'
import { formatARS, WA_NUMBER } from '@/lib/products'
import SolicitudForm from '@/components/mayoristas/SolicitudForm'

// ── §5: Pantalla pública de dos caminos para visitantes sin sesión ──────────
function PortalPublicLanding() {
  return (
    <div className="min-h-screen bg-paper text-ink">

      {/* Header mínimo de marca */}
      <div className="bg-ink text-paper px-10 py-5 flex items-center justify-between max-md:px-5">
        <Link href="/" className="font-display text-[22px] tracking-[0.08em] text-paper">
          HARDY
        </Link>
        <Link
          href="/tienda"
          className="font-mono text-[10px] tracking-[0.2em] uppercase text-paper/50 hover:text-paper transition-colors"
        >
          ← Volver a la tienda
        </Link>
      </div>

      {/* Intro */}
      <section className="py-16 px-10 bg-paper-2 border-b border-ink/10 max-md:px-5">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">── Portal Hardy · Clientes</p>
          <h1
            className="font-heading font-medium tracking-[-0.02em] m-0 mb-4"
            style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1 }}
          >
            Acceso a tu <em className="not-italic text-red">lista de precios.</em>
          </h1>
          <p className="text-[15px] text-[#555] max-w-[600px] leading-[1.7] m-0">
            El portal es exclusivo para clientes mayoristas, gastronómicos y distribuidores.
            Cada cliente accede únicamente a la lista de precios que le corresponde,
            habilitada tras la validación de su cuenta.
          </p>
        </div>
      </section>

      {/* Dos caminos */}
      <section className="py-16 px-10 max-md:px-5">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 gap-[2px] max-md:grid-cols-1">

          {/* Camino 1 — Ya soy cliente */}
          <div className="bg-ink text-paper p-12 flex flex-col justify-between gap-10 max-md:p-8">
            <div>
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-red mb-4">── Camino 1</p>
              <h2
                className="font-heading font-medium leading-[1.1] m-0 mb-4 tracking-[-0.02em]"
                style={{ fontSize: 'clamp(26px, 3vw, 38px)' }}
              >
                Ya soy cliente.
                <br />
                <em className="not-italic text-red">Quiero entrar.</em>
              </h2>
              <p className="text-[14px] leading-[1.7]" style={{ color: 'rgba(250,250,248,0.65)' }}>
                Si ya tenés usuario y contraseña, accedé directo al portal para ver tu lista de precios, hacer pedidos y consultar tu cuenta.
              </p>
            </div>
            <Link
              href="/login"
              className="bg-red text-paper font-mono text-[12px] tracking-[0.18em] uppercase px-8 py-[18px] self-start inline-block"
            >
              INGRESAR AL PORTAL →
            </Link>
          </div>

          {/* Camino 2 — Soy nuevo */}
          <div className="bg-paper-2 p-12 flex flex-col gap-6 max-md:p-8">
            <div>
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-red mb-4">── Camino 2</p>
              <h2
                className="font-heading font-medium leading-[1.1] m-0 mb-4 tracking-[-0.02em]"
                style={{ fontSize: 'clamp(26px, 3vw, 38px)' }}
              >
                Soy nuevo.
                <br />
                <em className="not-italic text-red">Quiero acceder.</em>
              </h2>
              <p className="text-[14px] text-[#555] leading-[1.7] mb-2">
                Completá el formulario con los datos de tu negocio.
                Validamos tu cuenta y te habilitamos la lista de precios que te corresponde.
              </p>
              {/* §5 — aviso de validación visible, no promete precios instantáneos */}
              <div className="bg-ink text-paper px-5 py-3 mb-6 inline-block">
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-paper/70 m-0">
                  ⏱ Validación: 24 a 48 horas hábiles.
                </p>
              </div>
            </div>

            <SolicitudForm />

            <p className="font-mono text-[10px] tracking-[0.1em] text-ink/40 uppercase">
              ¿Preferís escribirnos directo?{' '}
              <a
                href={`${WA_NUMBER}?text=Hola%20Hardy,%20quiero%20acceso%20al%20portal%20mayorista`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink border-b border-ink"
              >
                WhatsApp →
              </a>
            </p>
          </div>

        </div>
      </section>

    </div>
  )
}

// ── Dashboard autenticado ────────────────────────────────────────────────────
export default async function PortalDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Sin sesión → landing pública de dos caminos (§5)
  if (!user) {
    return <PortalPublicLanding />
  }

  const userOrdersSubquery = db.select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.userId, user.id), eq(orders.isDeleted, false)))

  const [profile, recentOrders, [orderCount], reviews, allOrderItems, allOrders] = await Promise.all([
    db.query.profiles.findFirst({
      where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
    }),
    db.query.orders.findMany({
      where:   and(eq(orders.userId, user.id), eq(orders.isDeleted, false)),
      orderBy: [desc(orders.createdAt)],
      limit:   5,
      with:    { items: { where: eq(orderItems.isDeleted, false) } },
    }),
    db.select({ total: count() })
      .from(orders)
      .where(and(eq(orders.userId, user.id), eq(orders.isDeleted, false))),
    db.query.productReviews.findMany({
      where:   and(eq(productReviews.isPublished, true), eq(productReviews.isDeleted, false)),
      orderBy: [desc(productReviews.createdAt)],
      limit:   4,
    }),
    db.query.orderItems.findMany({
      where: and(
        inArray(orderItems.orderId, userOrdersSubquery),
        eq(orderItems.isDeleted, false),
      ),
    }),
    db.query.orders.findMany({
      where:   and(eq(orders.userId, user.id), eq(orders.isDeleted, false)),
      orderBy: [desc(orders.createdAt)],
    }),
  ])

  const role        = profile?.role ?? 'consumer'
  const displayName = profile?.displayName ?? user.email ?? 'Cliente'
  const total       = orderCount?.total ?? 0

  // ── Insights de compra ──────────────────────────────────────────────────────
  // Producto más pedido
  const qtyByProduct: Record<string, { name: string; qty: number }> = {}
  for (const item of allOrderItems) {
    const key = item.productId
    if (!qtyByProduct[key]) qtyByProduct[key] = { name: item.productName, qty: 0 }
    qtyByProduct[key].qty += item.qty
  }
  const topProduct = Object.values(qtyByProduct).sort((a, b) => b.qty - a.qty)[0] ?? null

  // Gasto total acumulado
  const gastoTotal = allOrders.reduce((sum, o) => sum + Number(o.totalArs), 0)

  // Frecuencia promedio (días entre pedidos)
  let frecuenciaLabel = 'Sin pedidos'
  if (allOrders.length === 1) {
    frecuenciaLabel = 'Primer pedido'
  } else if (allOrders.length >= 2) {
    const sorted = [...allOrders].sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    )
    let totalDays = 0
    for (let i = 1; i < sorted.length; i++) {
      const diff = new Date(sorted[i].createdAt).getTime() - new Date(sorted[i - 1].createdAt).getTime()
      totalDays += diff / (1000 * 60 * 60 * 24)
    }
    const avgDays = Math.round(totalDays / (sorted.length - 1))
    frecuenciaLabel = `c/${avgDays} días`
  }

  return (
    <div className="max-w-[900px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">
        ── Portal Hardy
      </p>
      <h1 className="font-heading text-[clamp(28px,4vw,42px)] font-medium leading-[1.1] tracking-[-0.02em] mb-1">
        Bienvenido,{' '}
        <em className="not-italic text-red">{displayName}.</em>
      </h1>
      <p className="font-body text-[14px] text-ink/50 mb-8">
        {ROLE_DESCRIPTIONS[role]}
      </p>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6 max-md:grid-cols-1">
        <div className="bg-paper border border-ink/8 p-6">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">
            Total de pedidos
          </p>
          <p className="font-heading text-[36px] font-medium leading-none text-ink">
            {total}
          </p>
        </div>
        <div className="bg-paper border border-ink/8 p-6">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">
            Tu segmento
          </p>
          <p className="font-heading text-[22px] font-medium leading-none text-ink">
            {ROLE_LABELS[role]}
          </p>
        </div>
      </div>

      {/* Insights de compra */}
      <div className="grid grid-cols-3 gap-4 mb-10 max-md:grid-cols-1">
        <div className="bg-paper border border-ink/8 p-6">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">
            Producto más pedido
          </p>
          <p className="font-heading text-[15px] font-medium leading-snug text-ink">
            {topProduct ? topProduct.name : '—'}
          </p>
          {topProduct && (
            <p className="font-mono text-[9px] tracking-[0.1em] text-ink/30 uppercase mt-1">
              {topProduct.qty} unidades
            </p>
          )}
        </div>
        <div className="bg-paper border border-ink/8 p-6">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">
            Gasto total
          </p>
          <p className="font-heading text-[20px] font-medium leading-none text-ink">
            {gastoTotal > 0 ? formatARS(gastoTotal) : '—'}
          </p>
          {gastoTotal > 0 && (
            <p className="font-mono text-[9px] tracking-[0.1em] text-ink/30 uppercase mt-1">
              acumulado
            </p>
          )}
        </div>
        <div className="bg-paper border border-ink/8 p-6">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">
            Frecuencia promedio
          </p>
          <p className="font-heading text-[20px] font-medium leading-none text-ink">
            {frecuenciaLabel}
          </p>
          {allOrders.length >= 2 && (
            <p className="font-mono text-[9px] tracking-[0.1em] text-ink/30 uppercase mt-1">
              entre pedidos
            </p>
          )}
        </div>
      </div>

      {/* Historial de compras — gráfico de barras CSS últimos 6 meses */}
      {(() => {
        const monthlyData: { month: string; label: string; total: number; count: number }[] = []
        for (let i = 5; i >= 0; i--) {
          const d = new Date()
          d.setDate(1)
          d.setMonth(d.getMonth() - i)
          const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
          const label = d.toLocaleDateString('es-AR', { month: 'short' })
          const monthOrders = allOrders.filter(o => {
            const od = new Date(o.createdAt)
            return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth()
          })
          monthlyData.push({
            month: key,
            label: label.toUpperCase(),
            total: monthOrders.reduce((s, o) => s + Number(o.totalArs), 0),
            count: monthOrders.length,
          })
        }
        const maxTotal = Math.max(...monthlyData.map(m => m.total), 1)

        if (!monthlyData.some(m => m.count > 0)) return null

        return (
          <div className="mb-10">
            <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/60 mb-5">
              Historial de compras — últimos 6 meses
            </h2>
            <div className="bg-paper border border-ink/8 px-6 py-6">
              <div className="flex items-end gap-3 h-[120px]">
                {monthlyData.map((m) => {
                  const heightPct = maxTotal > 0 ? (m.total / maxTotal) * 100 : 0
                  const isCurrentMonth = m.month === monthlyData[monthlyData.length - 1].month
                  return (
                    <div key={m.month} className="flex-1 flex flex-col items-center gap-2">
                      <div className="w-full flex items-end justify-center" style={{ height: '90px' }}>
                        <div
                          className={`w-full transition-all ${isCurrentMonth ? 'bg-red' : 'bg-ink/20'}`}
                          style={{ height: m.total > 0 ? `${Math.max(heightPct, 4)}%` : '2px' }}
                          title={m.total > 0 ? formatARS(m.total) : 'Sin pedidos'}
                        />
                      </div>
                      <span className="font-mono text-[8px] tracking-[0.1em] text-ink/40">{m.label}</span>
                      {m.count > 0 && (
                        <span className="font-mono text-[7px] text-red">{m.count}p</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )
      })()}

      {/* Recent orders */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/60">
            Pedidos recientes
          </h2>
          {total > 5 && (
            <Link
              href="/portal/pedidos"
              className="font-mono text-[10px] tracking-[0.12em] uppercase text-red hover:underline"
            >
              Ver todos →
            </Link>
          )}
        </div>

        {recentOrders.length === 0 ? (
          <div className="bg-paper border border-ink/8 p-10 text-center">
            <p className="font-body text-[14px] text-ink/40">
              Todavía no hay pedidos registrados.
            </p>
          </div>
        ) : (
          <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
            {recentOrders.map((order) => (
              <Link
                key={order.id}
                href={`/portal/pedidos/${order.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-paper-2 transition-colors group"
              >
                <div className="flex flex-col gap-1">
                  <span className="font-mono text-[10px] tracking-[0.1em] text-ink/40 uppercase">
                    {new Date(order.createdAt).toLocaleDateString('es-AR', {
                      day:   '2-digit',
                      month: 'short',
                      year:  'numeric',
                    })}
                  </span>
                  <span className="font-body text-[13px] text-ink/60">
                    {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                  </span>
                </div>
                <div className="flex items-center gap-4">
                  <OrderStatusBadge status={order.status} />
                  <span className="font-mono text-[13px] text-ink">
                    {formatARS(Number(order.totalArs))}
                  </span>
                  <span className="font-mono text-[11px] text-ink/30 group-hover:text-red transition-colors">
                    →
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Reseñas de clientes */}
      {reviews.length > 0 && (
        <div className="mt-10">
          <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/60 mb-5">
            Lo que dicen nuestros clientes
          </h2>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            {reviews.map((r) => {
              const product = getProductById(r.productId)
              return (
                <div key={r.id} className="bg-paper border border-ink/8 px-5 py-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-amber-500 text-[13px]">{'★'.repeat(r.rating)}</span>
                    <span className="font-mono text-[8px] tracking-[0.1em] text-red uppercase ml-auto">
                      {product?.name ?? r.productId}
                    </span>
                  </div>
                  {r.comment && (
                    <p className="font-body text-[13px] text-ink/70 leading-[1.6] mb-3 italic">
                      &ldquo;{r.comment}&rdquo;
                    </p>
                  )}
                  <p className="font-mono text-[9px] tracking-[0.1em] text-ink/40 uppercase">
                    — {r.reviewerName}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
