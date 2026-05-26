import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { orderItems, orders } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'
import OrderStatusBadge from '@/components/portal/OrderStatusBadge'
import { formatARS } from '@/lib/products'
import type { OrderStatus } from '@/drizzle/schema'

const STATUS_STEPS: OrderStatus[] = [
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
]

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  shipped:   'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function PedidoDetailPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  const order = await db.query.orders.findFirst({
    where: and(eq(orders.id, id), eq(orders.isDeleted, false)),
    with:  { items: { where: eq(orderItems.isDeleted, false) } },
  })

  if (!order) notFound()

  // Authorization: users can only see their own orders
  if (order.userId !== user.id) notFound()

  const isCancelled    = order.status === 'cancelled'
  const currentStepIdx = isCancelled ? -1 : STATUS_STEPS.indexOf(order.status)

  return (
    <div className="max-w-[780px]">
      {/* Back */}
      <Link
        href="/portal/pedidos"
        className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-ink/40 hover:text-ink transition-colors mb-6"
      >
        ← Volver a pedidos
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-1">
            ── Detalle de pedido
          </p>
          <h1 className="font-heading text-[clamp(22px,3vw,32px)] font-medium leading-[1.1] tracking-[-0.02em]">
            {new Date(order.createdAt).toLocaleDateString('es-AR', {
              weekday: 'long',
              day:     '2-digit',
              month:   'long',
              year:    'numeric',
            })}
          </h1>
        </div>
        <OrderStatusBadge status={order.status} />
      </div>

      {/* Status timeline */}
      {!isCancelled && (
        <div className="bg-paper border border-ink/8 p-6 mb-6">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-4">
            Estado del pedido
          </p>
          <div className="flex items-center gap-0">
            {STATUS_STEPS.map((step, idx) => {
              const done    = idx <= currentStepIdx
              const current = idx === currentStepIdx
              const last    = idx === STATUS_STEPS.length - 1
              return (
                <div key={step} className="flex items-center flex-1 last:flex-none">
                  <div className="flex flex-col items-center gap-1">
                    <div className={[
                      'w-3 h-3 rounded-full border-2 transition-colors',
                      current ? 'bg-red border-red' :
                      done    ? 'bg-ink border-ink' :
                                'bg-paper border-ink/20',
                    ].join(' ')} />
                    <span className={[
                      'font-mono text-[8px] tracking-[0.1em] uppercase text-center leading-tight w-[56px]',
                      current ? 'text-red' : done ? 'text-ink/70' : 'text-ink/25',
                    ].join(' ')}>
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                  {!last && (
                    <div className={[
                      'flex-1 h-[2px] mb-[18px]',
                      idx < currentStepIdx ? 'bg-ink' : 'bg-ink/10',
                    ].join(' ')} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="bg-paper border border-ink/8 mb-6">
        <div className="px-5 py-3 border-b border-ink/8 bg-paper-2">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40">
            Productos
          </p>
        </div>
        <div className="divide-y divide-ink/8">
          {order.items.map((item) => (
            <div
              key={item.id}
              className="flex items-center justify-between px-5 py-4 gap-4"
            >
              <div className="flex flex-col gap-[2px]">
                <span className="font-body text-[14px] text-ink font-medium">
                  {item.productName}
                </span>
                <span className="font-mono text-[10px] tracking-[0.08em] text-ink/40 uppercase">
                  {item.variant} · {item.size}
                </span>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <span className="font-mono text-[12px] text-ink/50">
                  ×{item.qty}
                </span>
                <span className="font-mono text-[13px] text-ink w-[90px] text-right">
                  {formatARS(Number(item.subtotalArs))}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Total */}
        <div className="flex items-center justify-between px-5 py-4 border-t border-ink/8 bg-paper-2">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/50">
            Total
          </span>
          <span className="font-heading text-[20px] font-medium text-ink">
            {formatARS(Number(order.totalArs))}
          </span>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-paper border border-ink/8 p-5">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">
            Notas
          </p>
          <p className="font-body text-[14px] text-ink/70">{order.notes}</p>
        </div>
      )}
    </div>
  )
}
