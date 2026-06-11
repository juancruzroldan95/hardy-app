import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { getProfileByUserId } from '@/repository/queries/profile'
import { getOrdersByUserId } from '@/repository/queries/orders'
import OrderStatusBadge from '@/components/portal/OrderStatusBadge'
import { formatARS } from '@/consts/products'
import type { OrderStatus } from '@/db/schema'
import { deleteOwnOrder } from '@/repository/mutations/orders'

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

const VOLUME_ROLES = ['mayorista', 'distribuidor', 'productor', 'gastronomico'] as const

function getDaysSinceLast(createdAt: Date | string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000)
}

export default async function PedidosPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { status: rawStatus } = await searchParams
  const statusFilter = rawStatus && isValidStatus(rawStatus) ? rawStatus : null

  const [profile, userOrders] = await Promise.all([
    getProfileByUserId(user.id),
    getOrdersByUserId(user.id, statusFilter),
  ])

  const role = profile?.role ?? 'consumer'
  const isVolumeRole = (VOLUME_ROLES as readonly string[]).includes(role)

  // Volume suggestion: show banner if last order is between 30 and 90 days ago
  const lastOrder = userOrders[0] ?? null
  const daysSinceLast = lastOrder
    ? getDaysSinceLast(lastOrder.createdAt)
    : null
  const showRepeatBanner = isVolumeRole && lastOrder && daysSinceLast !== null && daysSinceLast >= 30 && daysSinceLast <= 90

  return (
    <div className="max-w-[900px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">
        ── Pedidos
      </p>
      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em]">
          Mis pedidos
        </h1>
        <Link
          href="/portal/pedidos/nuevo"
          className="bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-5 py-[11px] hover:bg-red/90 transition-colors shrink-0"
        >
          + Nuevo pedido
        </Link>
      </div>

      {/* Volume reorder suggestion banner */}
      {showRepeatBanner && lastOrder && (
        <div className="bg-[#f0f7f0] border border-[#c6dfc7] px-5 py-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <span className="text-[#2d6a35] text-[20px]">↺</span>
            <div>
              <p className="font-body font-semibold text-[14px] text-[#2d6a35]">
                ¿Repetimos el pedido?
              </p>
              <p className="font-mono text-[10px] tracking-[0.08em] text-[#2d6a35]/70">
                Tu último pedido fue hace {daysSinceLast} días · {lastOrder.items.length} producto{lastOrder.items.length !== 1 ? 's' : ''} · {formatARS(Number(lastOrder.totalArs))}
              </p>
            </div>
          </div>
          <Link
            href={`/portal/pedidos/nuevo?repeat=${lastOrder.id}`}
            className="bg-[#2d6a35] text-paper font-mono text-[10px] tracking-[0.12em] uppercase px-5 py-[10px] hover:bg-[#2d6a35]/80 transition-colors shrink-0"
          >
            Repetir pedido →
          </Link>
        </div>
      )}

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
          <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto_auto_auto] gap-6 px-5 py-3 bg-paper-2">
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Fecha</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Estado</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Total</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 sr-only">Repetir</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 sr-only">Ver</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 sr-only">Eliminar</span>
          </div>

          {userOrders.map((order) => (
            <div
              key={order.id}
              className="flex md:grid md:grid-cols-[1fr_auto_auto_auto_auto_auto] items-center gap-4 md:gap-6 px-5 py-4 hover:bg-paper-2 transition-colors group"
            >
              <Link
                href={`/portal/pedidos/${order.id}`}
                className="flex-1 flex flex-col gap-1 min-w-0"
              >
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
              </Link>
              <OrderStatusBadge status={order.status} />
              <span className="font-mono text-[13px] text-ink">
                {formatARS(Number(order.totalArs))}
              </span>
              <Link
                href={`/portal/pedidos/nuevo?repeat=${order.id}`}
                className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/30 hover:text-[#2d6a35] border border-ink/10 hover:border-[#c6dfc7] px-3 py-[6px] transition-colors hidden md:block"
                title="Repetir este pedido"
              >
                ↺ Repetir
              </Link>
              <Link
                href={`/portal/pedidos/${order.id}`}
                className="font-mono text-[11px] text-ink/30 group-hover:text-red transition-colors"
              >
                →
              </Link>
              <form
                action={async () => {
                  'use server'
                  await deleteOwnOrder(order.id)
                }}
              >
                <button
                  type="submit"
                  title="Eliminar pedido"
                  className="w-7 h-7 flex items-center justify-center text-ink/20 hover:text-red hover:bg-red/8 transition-colors rounded"
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                </button>
              </form>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
