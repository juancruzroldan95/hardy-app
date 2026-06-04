import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { db } from '@/db'
import { orderItems, orders, profiles, orderMessages } from '@/db/schema'
import { and, eq, asc } from 'drizzle-orm'
import { formatARS } from '@/consts/products'
import { updateOrderStatus, updateTrackingNumber } from '@/repository/mutations/admin'
import OrderStatusBadge from '@/components/portal/OrderStatusBadge'
import PaymentStatusBadge from '@/components/portal/PaymentStatusBadge'
import MessageThread from '@/components/portal/MessageThread'
import type { OrderStatus, PaymentStatus } from '@/db/schema'

const ORDER_STATUS_OPTIONS: { value: OrderStatus; label: string }[] = [
  { value: 'pending',   label: 'Pendiente'       },
  { value: 'confirmed', label: 'Confirmado'       },
  { value: 'preparing', label: 'En preparación'  },
  { value: 'shipped',   label: 'En camino'        },
  { value: 'delivered', label: 'Entregado'        },
  { value: 'cancelled', label: 'Cancelado'        },
]

const PAYMENT_STATUS_OPTIONS: { value: PaymentStatus; label: string }[] = [
  { value: 'unpaid',   label: 'Sin pagar'   },
  { value: 'paid',     label: 'Pagado'      },
  { value: 'refunded', label: 'Reintegrado' },
  { value: 'failed',   label: 'Fallido'     },
]

const SHIPPING_LABELS: Record<string, string> = {
  coordinar_whatsapp: 'Coordinar por WhatsApp',
  andreani:           'Andreani',
  oca:                'OCA',
  retiro_deposito:    'Retiro en depósito',
}

const PAYMENT_LABELS: Record<string, string> = {
  transferencia: 'Transferencia bancaria',
  efectivo:      'Efectivo al recibir',
  credito30:     'Crédito a 30 días',
  credito60:     'Crédito a 60 días',
  cheque:        'Cheque',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminPedidoDetailPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminProfile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (adminProfile?.role !== 'admin') redirect('/portal')

  const { id } = await params

  const [order, messages] = await Promise.all([
    db.query.orders.findFirst({
      where: and(eq(orders.id, id), eq(orders.isDeleted, false)),
      with:  { items: { where: eq(orderItems.isDeleted, false) } },
    }),
    db.query.orderMessages.findMany({
      where: and(eq(orderMessages.orderId, id), eq(orderMessages.isDeleted, false)),
      orderBy: [asc(orderMessages.createdAt)],
    }),
  ])
  if (!order) notFound()

  const clientProfile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, order.userId), eq(profiles.isDeleted, false)),
  })

  async function handleStatusUpdate(formData: FormData) {
    'use server'
    const status        = formData.get('status')        as OrderStatus
    const paymentStatus = formData.get('paymentStatus') as PaymentStatus
    if (!status) return
    await updateOrderStatus(id, status, paymentStatus || undefined)
  }

  async function handleTrackingUpdate(formData: FormData) {
    'use server'
    const tracking = formData.get('trackingNumber') as string
    await updateTrackingNumber(id, tracking ?? '')
  }

  return (
    <div className="max-w-[780px]">
      <Link
        href="/portal/admin/pedidos"
        className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-ink/40 hover:text-ink transition-colors mb-6"
      >
        ← Volver a pedidos
      </Link>

      <div className="flex items-start justify-between gap-4 mb-8 flex-wrap">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-1">── Admin · Pedido</p>
          <h1 className="font-heading text-[clamp(20px,3vw,30px)] font-medium leading-[1.1] tracking-[-0.02em]">
            {new Date(order.createdAt).toLocaleDateString('es-AR', {
              weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
            })}
          </h1>
          {clientProfile && (
            <p className="font-mono text-[10px] tracking-[0.1em] text-ink/40 uppercase mt-1">
              {clientProfile.company ?? clientProfile.displayName ?? order.userId}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <OrderStatusBadge status={order.status} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </div>
      </div>

      {/* Order items */}
      <div className="bg-paper border border-ink/8 mb-6">
        <div className="px-5 py-3 border-b border-ink/8 bg-paper-2">
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40">Productos</p>
        </div>
        <div className="divide-y divide-ink/8">
          {order.items.map((item) => (
            <div key={item.id} className="flex items-center justify-between px-5 py-4 gap-4">
              <div>
                <span className="font-body text-[14px] text-ink font-medium">{item.productName}</span>
                <div className="font-mono text-[10px] tracking-[0.08em] text-ink/40 uppercase mt-[2px]">
                  {item.variant} · {item.size}
                </div>
              </div>
              <div className="flex items-center gap-6 shrink-0">
                <span className="font-mono text-[12px] text-ink/50">×{item.qty}</span>
                <span className="font-mono text-[12px] text-ink/40">{formatARS(Number(item.unitPriceArs))}/u</span>
                <span className="font-mono text-[13px] text-ink w-[90px] text-right">
                  {formatARS(Number(item.subtotalArs))}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between px-5 py-4 border-t border-ink/8 bg-paper-2">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/50">Total</span>
          <span className="font-heading text-[20px] font-medium text-ink">{formatARS(Number(order.totalArs))}</span>
        </div>
      </div>

      {/* PO Number + Fecha deseada */}
      {(order.purchaseOrderNumber || order.requestedDeliveryDate) && (
        <div className="grid grid-cols-2 gap-4 mb-4 max-md:grid-cols-1">
          {order.purchaseOrderNumber && (
            <div className="bg-amber-50 border border-amber-200 px-5 py-4">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-amber-600 mb-1">N° Orden de Compra</p>
              <p className="font-mono text-[16px] font-bold text-ink">{order.purchaseOrderNumber}</p>
            </div>
          )}
          {order.requestedDeliveryDate && (
            <div className="bg-paper border border-ink/8 px-5 py-4">
              <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-1">Entrega deseada</p>
              <p className="font-body text-[14px] text-ink">
                {new Date(order.requestedDeliveryDate + 'T12:00:00').toLocaleDateString('es-AR', {
                  weekday: 'long', day: '2-digit', month: 'long',
                })}
              </p>
            </div>
          )}
        </div>
      )}

      {/* Delivery + payment method */}
      {(order.shippingMethod || order.paymentMethod || order.notes) && (
        <div className="bg-paper border border-ink/8 p-5 mb-6">
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            {order.shippingMethod && (
              <div>
                <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink/40 mb-1">Envío</p>
                <p className="font-body text-[14px] text-ink">
                  {SHIPPING_LABELS[order.shippingMethod] ?? order.shippingMethod}
                </p>
              </div>
            )}
            {order.paymentMethod && (
              <div>
                <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink/40 mb-1">Forma de pago</p>
                <p className="font-body text-[14px] text-ink">
                  {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
                </p>
              </div>
            )}
          </div>
          {order.notes && (
            <div className="mt-4 pt-4 border-t border-ink/8">
              <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink/40 mb-1">Notas del cliente</p>
              <p className="font-body text-[14px] text-ink/70">{order.notes}</p>
            </div>
          )}
        </div>
      )}

      {/* Status update */}
      <div className="bg-paper border border-ink/8 p-6 mb-6">
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-5">
          Actualizar estado
        </p>
        <form action={handleStatusUpdate} className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <div>
            <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/60 block mb-2">Estado del pedido</label>
            <select name="status" defaultValue={order.status}
              className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors">
              {ORDER_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/60 block mb-2">Estado de pago</label>
            <select name="paymentStatus" defaultValue={order.paymentStatus}
              className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors">
              {PAYMENT_STATUS_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <div className="col-span-2 max-md:col-span-1">
            <button type="submit"
              className="bg-ink text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[13px] hover:bg-ink/80 transition-colors">
              Guardar cambios →
            </button>
          </div>
        </form>
      </div>

      {/* Tracking number */}
      <div className="bg-paper border border-ink/8 p-6 mb-6">
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-4">Número de seguimiento</p>
        <form action={handleTrackingUpdate} className="flex items-center gap-3">
          <input
            type="text"
            name="trackingNumber"
            defaultValue={order.trackingNumber ?? ''}
            placeholder="Ej: 12345678901234 (Andreani/OCA)"
            className="flex-1 bg-paper-2 border border-ink/15 font-mono text-[13px] px-4 py-3 outline-none focus:border-ink transition-colors"
          />
          <button type="submit"
            className="bg-ink text-paper font-mono text-[10px] tracking-[0.12em] uppercase px-5 py-3 hover:bg-ink/80 transition-colors shrink-0">
            Guardar
          </button>
        </form>
        <p className="font-mono text-[9px] text-ink/30 mt-2">
          Al guardar el número de seguimiento aparecerá en el detalle del pedido del cliente.
        </p>
      </div>

      {/* Remito link */}
      <div className="mb-6">
        <Link href={`/portal/pedidos/${id}/remito`} target="_blank"
          className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 border border-ink/15 px-4 py-3 hover:bg-paper-2 transition-colors inline-block">
          Ver remito →
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
        isAdmin={true}
      />
    </div>
  )
}
