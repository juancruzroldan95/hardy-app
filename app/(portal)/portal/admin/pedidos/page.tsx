import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { orderItems, orders, profiles } from '@/drizzle/schema'
import { and, eq, desc } from 'drizzle-orm'
import { formatARS } from '@/lib/products'
import OrderStatusBadge from '@/components/portal/OrderStatusBadge'
import PaymentStatusBadge from '@/components/portal/PaymentStatusBadge'

export default async function AdminPedidosPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (profile?.role !== 'admin') redirect('/portal')

  const allOrders = await db.query.orders.findMany({
    where:   eq(orders.isDeleted, false),
    orderBy: [desc(orders.createdAt)],
    with:    { items: { where: eq(orderItems.isDeleted, false) } },
  })

  // Build a map userId → profile for display
  const userIds    = [...new Set(allOrders.map((o) => o.userId))]
  const allProfiles = userIds.length > 0
    ? await db.query.profiles.findMany({
        where: and(
          eq(profiles.isDeleted, false),
        ),
      })
    : []

  const profileMap = new Map(allProfiles.map((p) => [p.userId, p]))

  const pending   = allOrders.filter((o) => o.status === 'pending').length
  const confirmed = allOrders.filter((o) => o.status === 'confirmed').length
  const unpaid    = allOrders.filter((o) => o.paymentStatus === 'unpaid').length

  return (
    <div className="max-w-[1100px]">
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">── Admin</p>
          <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em]">
            Todos los pedidos
          </h1>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/api/admin/export?type=pedidos"
            className="border border-ink/20 text-ink font-mono text-[11px] tracking-[0.12em] uppercase px-4 py-3 hover:bg-paper-2 transition-colors"
          >
            ↓ Exportar CSV
          </a>
          <Link
            href="/portal/admin/pedidos/nuevo"
            className="bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-5 py-3 hover:bg-red/90 transition-colors"
          >
            + Crear pedido
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8 max-md:grid-cols-2">
        {[
          { label: 'Total',          value: allOrders.length, highlight: false },
          { label: 'Pendientes',     value: pending,          highlight: pending > 0 },
          { label: 'Confirmados',    value: confirmed,        highlight: false },
          { label: 'Sin pago',       value: unpaid,           highlight: unpaid > 0 },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`border p-4 ${highlight ? 'bg-[#fdecea] border-red/20' : 'bg-paper border-ink/8'}`}>
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-1">{label}</p>
            <p className={`font-heading text-[28px] font-medium leading-none ${highlight ? 'text-red' : 'text-ink'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      {allOrders.length === 0 ? (
        <div className="bg-paper border border-ink/8 p-10 text-center">
          <p className="font-body text-[14px] text-ink/40">No hay pedidos todavía.</p>
        </div>
      ) : (
        <div className="bg-paper border border-ink/8">
          <div
            className="px-5 py-3 border-b border-ink/8 bg-paper-2 grid gap-4"
            style={{ gridTemplateColumns: '1fr 130px 100px 110px 100px 40px' }}
          >
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Cliente</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Fecha</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Estado</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Pago</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 text-right">Total</span>
            <span />
          </div>

          <div className="divide-y divide-ink/8">
            {allOrders.map((order) => {
              const p = profileMap.get(order.userId)
              return (
                <div
                  key={order.id}
                  className="px-5 py-4 grid gap-4 items-center"
                  style={{ gridTemplateColumns: '1fr 130px 100px 110px 100px 40px' }}
                >
                  <div>
                    <div className="font-body font-semibold text-[13px] text-ink truncate">
                      {p?.company ?? p?.displayName ?? '—'}
                    </div>
                    <div className="font-mono text-[9px] tracking-[0.08em] text-ink/40 mt-[2px]">
                      {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.08em] text-ink/50">
                    {new Date(order.createdAt).toLocaleDateString('es-AR', {
                      day: '2-digit', month: 'short', year: 'numeric',
                    })}
                  </span>
                  <OrderStatusBadge status={order.status} />
                  <PaymentStatusBadge status={order.paymentStatus} />
                  <span className="font-mono text-[13px] text-ink text-right">
                    {formatARS(Number(order.totalArs))}
                  </span>
                  <Link
                    href={`/portal/admin/pedidos/${order.id}`}
                    className="font-mono text-[11px] text-red hover:text-ink transition-colors"
                  >
                    →
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
