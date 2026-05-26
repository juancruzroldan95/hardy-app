import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { orders } from '@/drizzle/schema'
import { eq, desc, and } from 'drizzle-orm'
import OrderStatusBadge from '@/components/portal/OrderStatusBadge'
import { formatARS } from '@/lib/products'
import type { OrderStatus } from '@/drizzle/schema'

const STATUS_FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all',       label: 'Todos'          },
  { value: 'pending',   label: 'Pendientes'     },
  { value: 'confirmed', label: 'Confirmados'    },
  { value: 'preparing', label: 'En preparación' },
  { value: 'shipped',   label: 'En camino'      },
  { value: 'delivered', label: 'Entregados'     },
  { value: 'cancelled', label: 'Cancelados'     },
]

const ORDER_STATUS_VALUES = [
  'pending', 'confirmed', 'preparing', 'shipped', 'delivered', 'cancelled',
] as const

function isValidStatus(value: string): value is OrderStatus {
  return (ORDER_STATUS_VALUES as readonly string[]).includes(value)
}

interface Props {
  searchParams: Promise<{ status?: string }>
}

export default async function PedidosPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { status: rawStatus } = await searchParams
  const statusFilter = rawStatus && isValidStatus(rawStatus) ? rawStatus : null

  const userOrders = await db.query.orders.findMany({
    where: statusFilter
      ? and(eq(orders.userId, user.id), eq(orders.status, statusFilter))
      : eq(orders.userId, user.id),
    orderBy: [desc(orders.createdAt)],
    with: { items: true },
  })

  return (
    <div className="max-w-[900px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">
        ── Pedidos
      </p>
      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-8">
        Mis pedidos
      </h1>

      {/* Status filter */}
      <div className="flex flex-wrap gap-2 mb-6">
        {STATUS_FILTERS.map(({ value, label }) => {
          const isActive = value === 'all' ? !statusFilter : statusFilter === value
          return (
            <Link
              key={value}
              href={value === 'all' ? '/portal/pedidos' : `/portal/pedidos?status=${value}`}
              className={[
                'font-mono text-[10px] tracking-[0.12em] uppercase px-3 py-2 border transition-colors',
                isActive
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper text-ink/50 border-ink/15 hover:border-ink/40',
              ].join(' ')}
            >
              {label}
            </Link>
          )
        })}
      </div>

      {userOrders.length === 0 ? (
        <div className="bg-paper border border-ink/8 p-10 text-center">
          <p className="font-body text-[14px] text-ink/40">
            {statusFilter ? 'No hay pedidos con ese estado.' : 'Todavía no hay pedidos registrados.'}
          </p>
        </div>
      ) : (
        <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
          {/* Header */}
          <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-6 px-5 py-3 bg-paper-2">
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Fecha</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Estado</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Total</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 sr-only">Ver</span>
          </div>

          {userOrders.map((order) => (
            <Link
              key={order.id}
              href={`/portal/pedidos/${order.id}`}
              className="flex md:grid md:grid-cols-[1fr_auto_auto_auto] items-center gap-4 md:gap-6 px-5 py-4 hover:bg-paper-2 transition-colors group"
            >
              <div className="flex-1 flex flex-col gap-1">
                <span className="font-body text-[14px] text-ink">
                  {new Date(order.createdAt).toLocaleDateString('es-AR', {
                    day:   '2-digit',
                    month: 'long',
                    year:  'numeric',
                  })}
                </span>
                <span className="font-mono text-[10px] tracking-[0.08em] text-ink/40">
                  {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                </span>
              </div>
              <OrderStatusBadge status={order.status} />
              <span className="font-mono text-[13px] text-ink">
                {formatARS(Number(order.totalArs))}
              </span>
              <span className="font-mono text-[11px] text-ink/30 group-hover:text-red transition-colors">
                →
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
