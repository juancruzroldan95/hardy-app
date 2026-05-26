import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { orders, profiles } from '@/drizzle/schema'
import { eq, count, desc } from 'drizzle-orm'
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/lib/roles'
import OrderStatusBadge from '@/components/portal/OrderStatusBadge'
import { formatARS } from '@/lib/products'

export default async function PortalDashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [profile, recentOrders, [orderCount]] = await Promise.all([
    db.query.profiles.findFirst({
      where: eq(profiles.id, user.id),
    }),
    db.query.orders.findMany({
      where:   eq(orders.userId, user.id),
      orderBy: [desc(orders.createdAt)],
      limit:   5,
      with:    { items: true },
    }),
    db.select({ total: count() })
      .from(orders)
      .where(eq(orders.userId, user.id)),
  ])

  const role        = profile?.role ?? 'consumer'
  const displayName = profile?.displayName ?? user.email ?? 'Cliente'
  const total       = orderCount?.total ?? 0

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
      <div className="grid grid-cols-2 gap-4 mb-10 max-md:grid-cols-1">
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
    </div>
  )
}
