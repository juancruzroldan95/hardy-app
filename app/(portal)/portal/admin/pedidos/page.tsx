import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { getProfileByUserId } from '@/repository/queries/profile'
import { formatARS } from '@/consts/products'
import { ROLE_LABELS } from '@/consts/roles'
import OrderStatusBadge from '@/components/portal/OrderStatusBadge'
import PaymentStatusBadge from '@/components/portal/PaymentStatusBadge'
import { imputarPago } from '@/repository/mutations/admin'
import type { UserRole } from '@/db/schema'
import { db } from '@/db'
import { and, desc, eq, sql } from 'drizzle-orm'
import { orderItems, orders, profiles } from '@/db/schema'

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: '',             label: 'Todos'        },
  { value: 'mayorista',    label: 'Mayoristas'   },
  { value: 'distribuidor', label: 'Distribuidores' },
  { value: 'gastronomico', label: 'Gastronómicos' },
  { value: 'productor',    label: 'Productores'  },
]

interface Props {
  searchParams: Promise<{ role?: string }>
}

export default async function AdminPedidosPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfileByUserId(user.id)
  if (profile?.role !== 'admin') redirect('/portal')

  const { role: roleFilter } = await searchParams

  const allOrders = await db.query.orders.findMany({
    where:   eq(orders.isDeleted, false),
    orderBy: [desc(orders.createdAt)],
    with:    { items: { where: eq(orderItems.isDeleted, false) } },
  })

  const allProfiles = await db.query.profiles.findMany({
    where: eq(profiles.isDeleted, false),
  })
  const profileMap = new Map(allProfiles.map((p) => [p.userId, p]))

  // Filter by role if selected
  const filteredOrders = roleFilter
    ? allOrders.filter((o) => o.userId && profileMap.get(o.userId)?.role === roleFilter)
    : allOrders

  const pending   = filteredOrders.filter((o) => o.status === 'pending').length
  const confirmed = filteredOrders.filter((o) => o.status === 'confirmed').length
  const unpaid    = filteredOrders.filter((o) => o.paymentStatus === 'unpaid').length

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
      <div className="grid grid-cols-4 gap-3 mb-6 max-md:grid-cols-2">
        {[
          { label: 'Total',       value: filteredOrders.length, highlight: false },
          { label: 'Pendientes',  value: pending,               highlight: pending > 0 },
          { label: 'Confirmados', value: confirmed,             highlight: false },
          { label: 'Sin pago',    value: unpaid,                highlight: unpaid > 0 },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`border p-4 ${highlight ? 'bg-[#fdecea] border-red/20' : 'bg-paper border-ink/8'}`}>
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-1">{label}</p>
            <p className={`font-heading text-[28px] font-medium leading-none ${highlight ? 'text-red' : 'text-ink'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Role filter */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mr-1">Filtrar por tipo:</span>
        {ROLE_OPTIONS.map((opt) => (
          <Link
            key={opt.value}
            href={opt.value ? `/portal/admin/pedidos?role=${opt.value}` : '/portal/admin/pedidos'}
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
          <p className="font-body text-[14px] text-ink/40">No hay pedidos para este segmento.</p>
        </div>
      ) : (
        <div className="bg-paper border border-ink/8 overflow-x-auto">
          <div className="min-w-[760px]">
          <div
            className="px-5 py-3 border-b border-ink/8 bg-paper-2 grid gap-4"
            style={{ gridTemplateColumns: '1fr 110px 130px 100px 110px 100px 80px' }}
          >
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Cliente</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Segmento</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Fecha</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Estado</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Pago</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 text-right">Total</span>
            <span />
          </div>

          <div className="divide-y divide-ink/8">
            {filteredOrders.map((order) => {
              const p = order.userId ? profileMap.get(order.userId) : undefined
              const roleName = p?.role ? (ROLE_LABELS[p.role as UserRole] ?? p.role) : '—'
              const isUnpaid = order.paymentStatus === 'unpaid'
              return (
                <div
                  key={order.id}
                  className="px-5 py-4 grid gap-4 items-center"
                  style={{ gridTemplateColumns: '1fr 110px 130px 100px 110px 100px 80px' }}
                >
                  <div>
                    <div className="font-body font-semibold text-[13px] text-ink truncate">
                      {p?.company ?? p?.displayName ?? '—'}
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
                  <div className="flex items-center gap-2 justify-end">
                    {isUnpaid && (
                      <form action={async () => { 'use server'; await imputarPago(order.id) }}>
                        <button
                          type="submit"
                          title="Imputar pago"
                          className="font-mono text-[9px] tracking-[0.1em] uppercase text-green-700 border border-green-200 bg-green-50 hover:bg-green-100 px-2 py-1 transition-colors"
                        >
                          ✓ Pago
                        </button>
                      </form>
                    )}
                    <Link
                      href={`/portal/admin/pedidos/${order.id}`}
                      className="font-mono text-[11px] text-red hover:text-ink transition-colors"
                    >
                      →
                    </Link>
                  </div>
                </div>
              )
            })}
          </div>
          </div>{/* fin min-w */}
        </div>
      )}
    </div>
  )
}
