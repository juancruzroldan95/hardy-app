import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { orderItems, orders, profiles } from '@/drizzle/schema'
import { and, eq, desc, sum } from 'drizzle-orm'
import { formatARS } from '@/lib/products'
import OrderStatusBadge from '@/components/portal/OrderStatusBadge'
import PaymentStatusBadge from '@/components/portal/PaymentStatusBadge'

export default async function CuentaPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, allOrders, [totals]] = await Promise.all([
    db.query.profiles.findFirst({
      where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
    }),
    db.query.orders.findMany({
      where:   and(eq(orders.userId, user.id), eq(orders.isDeleted, false)),
      orderBy: [desc(orders.createdAt)],
      with:    { items: { where: eq(orderItems.isDeleted, false) } },
    }),
    db.select({ total: sum(orders.totalArs) })
      .from(orders)
      .where(and(eq(orders.userId, user.id), eq(orders.isDeleted, false))),
  ])

  if (!profile) redirect('/portal')

  const totalFacturado = Number(totals?.total ?? 0)
  const totalPedidos   = allOrders.length
  const pendientesPago = allOrders.filter((o) => o.paymentStatus === 'unpaid')
  const totalPendiente = pendientesPago.reduce((acc, o) => acc + Number(o.totalArs), 0)

  return (
    <div className="max-w-[860px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">
        ── Estado de cuenta
      </p>
      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-8">
        Resumen de cuenta
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-10 max-md:grid-cols-1">
        <div className="bg-paper border border-ink/8 p-6">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">
            Total pedidos
          </p>
          <p className="font-heading text-[36px] font-medium leading-none text-ink">
            {totalPedidos}
          </p>
        </div>
        <div className="bg-paper border border-ink/8 p-6">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">
            Total facturado
          </p>
          <p className="font-heading text-[28px] font-medium leading-none text-ink">
            {totalFacturado > 0 ? formatARS(totalFacturado) : '—'}
          </p>
        </div>
        <div className={`border p-6 ${totalPendiente > 0 ? 'bg-red/5 border-red/20' : 'bg-paper border-ink/8'}`}>
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">
            Pendiente de pago
          </p>
          <p className={`font-heading text-[28px] font-medium leading-none ${totalPendiente > 0 ? 'text-red' : 'text-ink/30'}`}>
            {totalPendiente > 0 ? formatARS(totalPendiente) : '—'}
          </p>
        </div>
      </div>

      {/* Orders list */}
      <div>
        <h2 className="font-mono text-[11px] tracking-[0.2em] uppercase text-ink/60 mb-5">
          Historial de pedidos
        </h2>

        {allOrders.length === 0 ? (
          <div className="bg-paper border border-ink/8 p-10 text-center">
            <p className="font-body text-[14px] text-ink/40">
              Todavía no hay pedidos registrados.
            </p>
            <Link
              href="/portal/pedidos/nuevo"
              className="inline-block mt-4 bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[12px]"
            >
              Hacer primer pedido →
            </Link>
          </div>
        ) : (
          <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
            {/* Header */}
            <div className="px-5 py-3 grid gap-4 bg-paper-2" style={{ gridTemplateColumns: '1fr 120px 110px 100px' }}>
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Fecha</span>
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Estado</span>
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Pago</span>
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 text-right">Total</span>
            </div>

            {allOrders.map((order) => (
              <Link
                key={order.id}
                href={`/portal/pedidos/${order.id}`}
                className="px-5 py-4 grid gap-4 items-center hover:bg-paper-2 transition-colors group"
                style={{ gridTemplateColumns: '1fr 120px 110px 100px' }}
              >
                <div>
                  <div className="font-mono text-[11px] tracking-[0.08em] text-ink/60">
                    {new Date(order.createdAt).toLocaleDateString('es-AR', {
                      day:   '2-digit',
                      month: 'short',
                      year:  'numeric',
                    })}
                  </div>
                  <div className="font-body text-[11px] text-ink/30 mt-[2px]">
                    {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                  </div>
                </div>
                <OrderStatusBadge status={order.status} />
                <PaymentStatusBadge status={order.paymentStatus} />
                <span className="font-mono text-[13px] text-ink text-right">
                  {formatARS(Number(order.totalArs))}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
