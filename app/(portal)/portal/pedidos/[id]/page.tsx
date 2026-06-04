import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { getProfileByUserId } from '@/repository/queries/profile'
import { getOrderById, getOrderMessages } from '@/repository/queries/orders'
import OrderStatusBadge from '@/components/portal/OrderStatusBadge'
import { formatARS } from '@/consts/products'
import MessageThread from '@/components/portal/MessageThread'
import type { OrderStatus } from '@/db/schema'

const STATUS_STEPS: OrderStatus[] = ['pending', 'confirmed', 'preparing', 'shipped', 'delivered']

const STATUS_LABELS: Record<OrderStatus, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  shipped:   'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const SHIPPING_LABELS: Record<string, string> = {
  urgente_caba:      'Urgente — CABA',
  urgente_gba:       'Urgente — GBA',
  sin_urgencia_caba: 'Sin urgencia — CABA',
  sin_urgencia_gba:  'Sin urgencia — GBA',
  retiro_deposito:   'Retiro en depósito',
  andreani:          'Andreani',
  oca:               'OCA',
  coordinar_whatsapp: 'A coordinar por WhatsApp',
}

const PAYMENT_LABELS: Record<string, string> = {
  transferencia:    'Transferencia bancaria',
  deposito_bancario: 'Depósito bancario',
  echeq_30:         'E-CHEQ 30 días',
  efectivo:         'Efectivo',
  credito30:        'Crédito 30 días',
  credito60:        'Crédito 60 días',
  cheque:           'Cheque',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function PedidoDetailPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { id } = await params

  const [order, profile, messages] = await Promise.all([
    getOrderById(id),
    getProfileByUserId(user.id),
    getOrderMessages(id),
  ])

  if (!order) notFound()

  const isAdmin = profile?.role === 'admin'
  if (!isAdmin && order.userId !== user.id) notFound()

  const isCancelled    = order.status === 'cancelled'
  const currentStepIdx = isCancelled ? -1 : STATUS_STEPS.indexOf(order.status)

  return (
    <div className="max-w-[780px]">
      <Link
        href={isAdmin ? '/portal/admin/pedidos' : '/portal/pedidos'}
        className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-ink/40 hover:text-ink transition-colors mb-6"
      >
        ← Volver a pedidos
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-1">── Detalle de pedido</p>
          <h1 className="font-heading text-[clamp(22px,3vw,32px)] font-medium leading-[1.1] tracking-[-0.02em]">
            {new Date(order.createdAt).toLocaleDateString('es-AR', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <OrderStatusBadge status={order.status} />
          <Link
            href={`/portal/pedidos/${id}/remito`}
            target="_blank"
            className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 border border-ink/15 px-3 py-2 hover:bg-paper-2 transition-colors"
          >
            Remito →
          </Link>
        </div>
      </div>

      {/* Status timeline */}
      {!isCancelled && (
        <div className="bg-paper border border-ink/8 p-6 mb-6">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-4">Estado del pedido</p>
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
                      current ? 'bg-red border-red' : done ? 'bg-ink border-ink' : 'bg-paper border-ink/20',
                    ].join(' ')} />
                    <span className={[
                      'font-mono text-[8px] tracking-[0.1em] uppercase text-center leading-tight w-[56px]',
                      current ? 'text-red' : done ? 'text-ink/70' : 'text-ink/25',
                    ].join(' ')}>
                      {STATUS_LABELS[step]}
                    </span>
                  </div>
                  {!last && (
                    <div className={['flex-1 h-[2px] mb-[18px]', idx < currentStepIdx ? 'bg-ink' : 'bg-ink/10'].join(' ')} />
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Tracking */}
      {order.trackingNumber && (
        <div className="bg-[#f0f7f0] border border-[#c6dfc7] px-5 py-4 mb-6 flex items-center gap-3">
          <span className="text-[20px]">📦</span>
          <div>
            <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#2d6a35] mb-1">Número de seguimiento</p>
            <p className="font-mono text-[15px] font-semibold text-[#2d6a35]">{order.trackingNumber}</p>
          </div>
        </div>
      )}

      {/* Order items */}
      <div className="bg-paper border border-ink/8 mb-6">
        <div className="px-5 py-3 border-b border-ink/8 bg-paper-2">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40">Productos</p>
        </div>
        <div className="divide-y divide-ink/8">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4 gap-4">
              <div className="flex flex-col gap-[2px]">
                <span className="font-body text-[14px] text-ink font-medium">{item.productName}</span>
                <span className="font-mono text-[10px] tracking-[0.08em] text-ink/40 uppercase">
                  {item.variant} · {item.size}
                </span>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <span className="font-mono text-[12px] text-ink/50">×{item.qty}</span>
                <span className="font-mono text-[13px] text-ink w-[90px] text-right">
                  {formatARS(Number(item.subtotalArs))}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-ink/8 bg-paper-2">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/50">Total (sin IVA)</span>
          <span className="font-heading text-[20px] font-medium text-ink">{formatARS(Number(order.totalArs))}</span>
        </div>
      </div>

      {/* PO Number + Fecha deseada */}
      {(order.purchaseOrderNumber || order.requestedDeliveryDate) && (
        <div className="grid grid-cols-2 gap-4 mb-4 max-md:grid-cols-1">
          {order.purchaseOrderNumber && (
            <div className="bg-paper border border-ink/8 px-5 py-4">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">N° Orden de Compra</p>
              <p className="font-mono text-[14px] font-semibold text-ink">{order.purchaseOrderNumber}</p>
            </div>
          )}
          {order.requestedDeliveryDate && (
            <div className="bg-paper border border-ink/8 px-5 py-4">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">Entrega deseada</p>
              <p className="font-body text-[13px] text-ink/70">
                {new Date(order.requestedDeliveryDate + 'T12:00:00').toLocaleDateString('es-AR', {
                  weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Shipping + Payment */}
      <div className="grid grid-cols-2 gap-4 mb-6 max-md:grid-cols-1">
        <div className="bg-paper border border-ink/8 px-5 py-4">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">Envío</p>
          <p className="font-body text-[13px] text-ink/70">
            {SHIPPING_LABELS[order.shippingMethod ?? ''] ?? order.shippingMethod ?? '—'}
          </p>
        </div>
        <div className="bg-paper border border-ink/8 px-5 py-4">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">Forma de pago</p>
          <p className="font-body text-[13px] text-ink/70">
            {PAYMENT_LABELS[order.paymentMethod ?? ''] ?? order.paymentMethod ?? '—'}
          </p>
        </div>
      </div>

      {/* Notes */}
      {order.notes && (
        <div className="bg-paper border border-ink/8 p-5 mb-6">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-2">Notas</p>
          <p className="font-body text-[14px] text-ink/70">{order.notes}</p>
        </div>
      )}

      {/* Repeat order */}
      <div className="mb-6">
        <Link
          href={`/portal/pedidos/nuevo?repeat=${id}`}
          className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 border border-ink/15 px-4 py-3 hover:bg-paper-2 transition-colors inline-block"
        >
          ↺ Repetir este pedido
        </Link>
      </div>

      {/* Message thread */}
      <MessageThread
        orderId={id}
        messages={messages.map((m) => ({
          id:           m.id,
          message:      m.message,
          isAdmin:      m.isAdmin,
          senderUserId: m.senderUserId,
          createdAt:    m.createdAt,
        }))}
        currentUserId={user.id}
        isAdmin={isAdmin}
      />
    </div>
  )
}
