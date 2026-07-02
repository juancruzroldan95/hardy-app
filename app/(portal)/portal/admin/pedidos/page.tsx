import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { getProfileByUserId } from '@/repository/queries/profile'
import { formatARS } from '@/consts/products'
import { ROLE_LABELS } from '@/consts/roles'
import OrderStatusBadge from '@/components/portal/OrderStatusBadge'
import PaymentStatusBadge from '@/components/portal/PaymentStatusBadge'
import type { UserRole } from '@/db/schema'
import { db } from '@/db'
import { desc, eq } from 'drizzle-orm'
import { orderItems, orders, profiles } from '@/db/schema'
import { deleteOrder } from '@/repository/mutations/admin'
import DeleteButton from '@/components/portal/DeleteButton'

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: '',             label: 'Todos'          },
  { value: 'mayorista',    label: 'Mayoristas'     },
  { value: 'distribuidor', label: 'Distribuidores' },
  { value: 'gastronomico', label: 'Gastronómicos'  },
  { value: 'productor',    label: 'Productores'    },
]

interface Props {
  searchParams: Promise<{ role?: string; filter?: string }>
}

export default async function AdminPedidosPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfileByUserId(user.id)
  if (profile?.role !== 'admin') redirect('/portal')

  const { role: roleFilter, filter: statusFilter } = await searchParams

  const allOrders = await db.query.orders.findMany({
    where:   eq(orders.isDeleted, false),
    orderBy: [desc(orders.createdAt)],
    with:    { items: { where: eq(orderItems.isDeleted, false) } },
  })

  const allProfiles = await db.query.profiles.findMany({
    where: eq(profiles.isDeleted, false),
  })
  const profileMap = new Map(allProfiles.map((p) => [p.userId, p]))

  // Filter by role first
  const roleFiltered = roleFilter
    ? allOrders.filter((o) => o.userId && profileMap.get(o.userId)?.role === roleFilter)
    : allOrders

  // Stats (always based on role filter, not status filter)
  const pending   = roleFiltered.filter((o) => o.status === 'pending').length
  const confirmed = roleFiltered.filter((o) => o.status === 'confirmed').length
  const unpaid    = roleFiltered.filter((o) => o.paymentStatus === 'unpaid').length

  // Then filter by status/payment block
  const filteredOrders = statusFilter === 'pending'
    ? roleFiltered.filter((o) => o.status === 'pending')
    : statusFilter === 'confirmed'
      ? roleFiltered.filter((o) => o.status === 'confirmed')
      : statusFilter === 'unpaid'
        ? roleFiltered.filter((o) => o.paymentStatus === 'unpaid')
        : roleFiltered

  const buildHref = (params: { role?: string; filter?: string }) => {
    const p = new URLSearchParams()
    if (params.role)   p.set('role',   params.role)
    if (params.filter) p.set('filter', params.filter)
    const qs = p.toString()
    return `/portal/admin/pedidos${qs ? `?${qs}` : ''}`
  }

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

      {/* Stats — clickeables para filtrar */}
      <div className="grid grid-cols-4 gap-3 mb-6 max-md:grid-cols-2">
        {[
          { label: 'Total',       value: roleFiltered.length, highlight: false,        filterKey: undefined      },
          { label: 'Pendientes',  value: pending,             highlight: pending > 0,  filterKey: 'pending'      },
          { label: 'Confirmados', value: confirmed,           highlight: false,         filterKey: 'confirmed'    },
          { label: 'Sin pago',    value: unpaid,              highlight: unpaid > 0,   filterKey: 'unpaid'       },
        ].map(({ label, value, highlight, filterKey }) => {
          const isActive = (statusFilter ?? undefined) === filterKey
          const href = buildHref({ role: roleFilter, filter: filterKey })
          return (
            <Link
              key={label}
              href={href}
              className={[
                'border p-4 transition-all',
                isActive
                  ? 'ring-2 ring-ink'
                  : 'hover:ring-1 hover:ring-ink/30',
                highlight ? 'bg-[#fdecea] border-red/20' : 'bg-paper border-ink/8',
              ].join(' ')}
            >
              <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-1">{label}</p>
              <p className={`font-heading text-[28px] font-medium leading-none ${highlight ? 'text-red' : 'text-ink'}`}>
                {value}
              </p>
            </Link>
          )
        })}
      </div>

      {/* Role filter */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mr-1">Filtrar por tipo:</span>
        {ROLE_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={buildHref({ role: opt.value || undefined, filter: statusFilter })}
            className={[
              'font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-1.5 border transition-all',
              (roleFilter ?? '') === opt.value
                ? 'bg-ink text-paper border-ink'
                : 'bg-paper border-ink/15 text-ink/50 hover:text-ink hover:border-ink/40',
            ].join(' ')}
          >
            {opt.label}
          </Link>
        ))}
      </div>

      {/* Table */}
      {filteredOrders.length === 0 ? (
        <div className="bg-paper border border-ink/8 p-10 text-center">
          <p className="font-body text-[14px] text-ink/40">No hay pedidos para este filtro.</p>
        </div>
      ) : (
        <div className="bg-paper border border-ink/8 overflow-x-auto">
          <div className="min-w-[820px]">
            <div
              className="px-5 py-3 border-b border-ink/8 bg-paper-2 grid gap-4"
              style={{ gridTemplateColumns: '1fr 110px 130px 100px 110px 100px 60px 36px' }}
            >
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Cliente</span>
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Segmento</span>
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Fecha</span>
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Estado</span>
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Pago</span>
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 text-right">Total</span>
              <span />
              <span />
            </div>

            <div className="divide-y divide-ink/8">
              {filteredOrders.map((order) => {
                const p = order.userId ? profileMap.get(order.userId) : undefined
                const roleName = p?.role ? (ROLE_LABELS[p.role as UserRole] ?? p.role) : '—'
                return (
                  <div
                    key={order.id}
                    className="px-5 py-4 grid gap-4 items-center"
                    style={{ gridTemplateColumns: '1fr 110px 130px 100px 110px 100px 60px 36px' }}
                  >
                    <div>
                      <div className="flex items-center gap-1.5">
                        <div className="font-body font-semibold text-[13px] text-ink truncate">
                          {p?.company ?? p?.displayName ?? '—'}
                        </div>
                        {order.isCustomOrder && (
                          <span className="font-mono text-[7px] tracking-[0.1em] uppercase bg-ink text-paper px-1 py-0.5 shrink-0">
                            Personalizado
                          </span>
                        )}
                      </div>
                      <div className="font-mono text-[9px] tracking-[0.08em] text-ink/40 mt-[2px]">
                        {order.items.length} {order.items.length === 1 ? 'producto' : 'productos'}
                      </div>
                    </div>
                    <span className="font-mono text-[8px] tracking-[0.1em] uppercase text-red border border-red/20 px-1.5 py-0.5 inline-block w-fit">
                      {roleName}
                    </span>
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
                    <div className="flex items-center justify-end">
                      <Link
                        href={`/portal/admin/pedidos/${order.id}`}
                        className="font-mono text-[11px] text-red hover:text-ink transition-colors"
                      >
                        →
                      </Link>
                    </div>
                    <div className="flex items-center justify-end">
                      <DeleteButton
                        action={async () => {
                          'use server'
                          await deleteOrder(order.id)
                        }}
                        confirm={`¿Estás seguro que deseás eliminar el pedido de ${order.userId ? (profileMap.get(order.userId)?.company ?? profileMap.get(order.userId)?.displayName ?? 'este cliente') : 'este cliente'}?`}
                        title="Eliminar pedido"
                        className="w-7 h-7 flex items-center justify-center text-ink/20 hover:text-red hover:bg-red/8 transition-colors rounded"
                      >
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                        </svg>
                      </DeleteButton>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
