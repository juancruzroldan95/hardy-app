/**
 * Remito / Comprobante de pedido — optimizado para impresión / guardar como PDF
 *
 * El cliente hace: Archivo → Imprimir → Guardar como PDF
 * O: botón "Descargar comprobante" que abre esta página en nueva pestaña + print()
 */
import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { getProfileByUserId } from '@/repository/queries/profile'
import { getOrderById } from '@/repository/queries/orders'
import { HARDY_BANK } from '@/consts/hardy'
import PrintButton from '@/components/portal/PrintButton'

const SHIPPING_LABELS: Record<string, string> = {
  urgente_caba:      'Urgente — CABA (48-72hs hábiles)',
  urgente_gba:       'Urgente — GBA (48-72hs hábiles)',
  sin_urgencia_caba: 'Sin urgencia — CABA (3 a 5 días hábiles)',
  sin_urgencia_gba:  'Sin urgencia — GBA (3 a 5 días hábiles)',
  retiro_deposito:   'Retiro en depósito — Valentín Alsina',
  andreani:          'Andreani',
  oca:               'OCA',
  coordinar_whatsapp: 'A coordinar por WhatsApp',
}

const PAYMENT_LABELS: Record<string, string> = {
  transferencia:    'Transferencia bancaria — 50% + 50%',
  deposito_bancario: 'Depósito bancario — 50% + 50%',
  echeq_30:         'E-CHEQ 30 días',
  efectivo:         'Efectivo',
  credito30:        'Crédito 30 días',
  credito60:        'Crédito 60 días',
  cheque:           'Cheque',
}

const STATUS_LABELS: Record<string, string> = {
  pending:   'Pendiente de confirmación',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  shipped:   'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

interface Props {
  params: Promise<{ id: string }>
}

export default async function RemitoPage({ params }: Props) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const order = await getOrderById(id)
  if (!order) notFound()

  // Security: only the owner or an admin can view the remito
  const profile = await getProfileByUserId(user.id)
  if (profile?.role !== 'admin' && order.userId !== user.id) notFound()

  // Get client profile for display
  const clientProfile = order.userId !== user.id
    ? await getProfileByUserId(order.userId)
    : profile

  const remitNumber = `R-${order.createdAt.getFullYear()}${String(order.createdAt.getMonth() + 1).padStart(2, '0')}-${order.id.slice(-6).toUpperCase()}`

  return (
    <>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white; margin: 0; }
          @page { margin: 15mm 20mm; size: A4; }
        }
        @media screen {
          body { background: #f0efec; }
        }
      `}</style>

      {/* Print button — hidden when printing */}
      <div className="no-print bg-ink text-paper px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="font-display text-[18px] tracking-[0.08em] text-paper">HARDY</span>
          <span className="font-mono text-[10px] text-paper/50">· Remito {remitNumber}</span>
        </div>
        <div className="flex items-center gap-3">
          <a
            href={`/portal/pedidos/${id}`}
            className="font-mono text-[10px] tracking-[0.12em] uppercase text-paper/50 hover:text-paper transition-colors"
          >
            ← Volver al pedido
          </a>
          <PrintButton />
        </div>
      </div>

      {/* Document */}
      <div className="max-w-[800px] mx-auto my-6 bg-white shadow-sm print:shadow-none print:my-0 print:max-w-none">
        <div className="p-10 print:p-0">

          {/* Header */}
          <div className="flex items-start justify-between mb-10 pb-8 border-b border-gray-200">
            <div>
              <div className="font-display text-[36px] tracking-[0.04em] leading-none mb-2" style={{ fontFamily: 'Anton, sans-serif' }}>
                HARDY
              </div>
              <div className="font-mono text-[9px] tracking-[0.25em] uppercase text-gray-400">
                Alimentá tu instinto
              </div>
            </div>
            <div className="text-right">
              <div className="font-mono text-[10px] tracking-[0.25em] uppercase text-gray-400 mb-1">Remito</div>
              <div className="font-mono text-[18px] font-bold text-gray-800">{remitNumber}</div>
              <div className="font-mono text-[10px] text-gray-400 mt-1">
                {order.createdAt.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
              </div>
              <div className={`inline-block mt-2 px-2 py-1 font-mono text-[9px] tracking-[0.1em] uppercase ${
                order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                'bg-gray-100 text-gray-600'
              }`}>
                {STATUS_LABELS[order.status] ?? order.status}
              </div>
            </div>
          </div>

          {/* Client + Hardy info */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            <div>
              <div className="font-mono text-[8px] tracking-[0.25em] uppercase text-gray-400 mb-3">Cliente</div>
              <div className="font-semibold text-[15px] mb-1">
                {clientProfile?.company ?? clientProfile?.displayName ?? 'Cliente'}
              </div>
              {clientProfile?.company && clientProfile?.displayName && (
                <div className="text-[13px] text-gray-500 mb-1">{clientProfile.displayName}</div>
              )}
              {clientProfile?.cuit && (
                <div className="font-mono text-[11px] text-gray-500">CUIT: {clientProfile.cuit}</div>
              )}
              {clientProfile?.address && (
                <div className="text-[12px] text-gray-500 mt-1">{clientProfile.address}</div>
              )}
              {clientProfile?.city && (
                <div className="text-[12px] text-gray-500">
                  {clientProfile.city}{clientProfile.province ? `, ${clientProfile.province}` : ''}
                </div>
              )}
              {clientProfile?.phone && (
                <div className="font-mono text-[11px] text-gray-500 mt-1">{clientProfile.phone}</div>
              )}
            </div>
            <div>
              <div className="font-mono text-[8px] tracking-[0.25em] uppercase text-gray-400 mb-3">Vendedor</div>
              <div className="font-semibold text-[14px] mb-1">HARDY HERMANOS S.R.L.</div>
              <div className="font-mono text-[11px] text-gray-500">CUIT: {HARDY_BANK.cuit}</div>
              <div className="text-[12px] text-gray-500 mt-1">Valentín Alsina, Buenos Aires</div>
              <div className="text-[12px] text-gray-500">ventas@hardy.ar</div>
            </div>
          </div>

          {/* Items table */}
          <table className="w-full mb-8" style={{ borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #000' }}>
                <th className="font-mono text-[9px] tracking-[0.15em] uppercase text-left pb-2 text-gray-500">Producto</th>
                <th className="font-mono text-[9px] tracking-[0.15em] uppercase text-center pb-2 text-gray-500">Cant.</th>
                <th className="font-mono text-[9px] tracking-[0.15em] uppercase text-right pb-2 text-gray-500">Precio unit.</th>
                <th className="font-mono text-[9px] tracking-[0.15em] uppercase text-right pb-2 text-gray-500">Subtotal</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} style={{ borderBottom: '1px solid #e5e5e5' }}>
                  <td className="py-3 pr-4">
                    <div className="font-medium text-[13px]">{item.productName}</div>
                    <div className="font-mono text-[10px] text-gray-400 mt-[1px]">{item.variant} · {item.size}</div>
                  </td>
                  <td className="py-3 text-center font-mono text-[13px]">{item.qty}</td>
                  <td className="py-3 text-right font-mono text-[13px] text-gray-600">{formatARS(Number(item.unitPriceArs))}</td>
                  <td className="py-3 text-right font-mono text-[14px] font-semibold">{formatARS(Number(item.subtotalArs))}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ borderTop: '2px solid #000' }}>
                <td colSpan={3} className="pt-4 font-mono text-[10px] tracking-[0.1em] uppercase text-gray-500 text-right pr-6">
                  Total (sin IVA)
                </td>
                <td className="pt-4 font-mono text-[20px] font-bold text-right">
                  {formatARS(Number(order.totalArs))}
                </td>
              </tr>
            </tfoot>
          </table>

          {/* PO Number + Requested date */}
          {(order.purchaseOrderNumber || order.requestedDeliveryDate) && (
            <div className="grid grid-cols-2 gap-8 mb-6 pb-6 border-b border-gray-200">
              {order.purchaseOrderNumber && (
                <div>
                  <div className="font-mono text-[8px] tracking-[0.25em] uppercase text-gray-400 mb-1">Orden de Compra</div>
                  <div className="font-mono text-[15px] font-bold text-gray-800">{order.purchaseOrderNumber}</div>
                </div>
              )}
              {order.requestedDeliveryDate && (
                <div>
                  <div className="font-mono text-[8px] tracking-[0.25em] uppercase text-gray-400 mb-1">Entrega solicitada</div>
                  <div className="text-[13px] text-gray-700">
                    {new Date(order.requestedDeliveryDate + 'T12:00:00').toLocaleDateString('es-AR', {
                      weekday: 'long', day: '2-digit', month: 'long', year: 'numeric',
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Shipping + Payment */}
          <div className="grid grid-cols-2 gap-8 mb-10 pt-6 border-t border-gray-200">
            <div>
              <div className="font-mono text-[8px] tracking-[0.25em] uppercase text-gray-400 mb-2">Envío</div>
              <div className="text-[12px] text-gray-700">
                {SHIPPING_LABELS[order.shippingMethod ?? ''] ?? order.shippingMethod ?? '—'}
              </div>
              {order.trackingNumber && (
                <div className="font-mono text-[11px] text-gray-500 mt-1">
                  Tracking: <strong>{order.trackingNumber}</strong>
                </div>
              )}
            </div>
            <div>
              <div className="font-mono text-[8px] tracking-[0.25em] uppercase text-gray-400 mb-2">Forma de pago</div>
              <div className="text-[12px] text-gray-700">
                {PAYMENT_LABELS[order.paymentMethod ?? ''] ?? order.paymentMethod ?? '—'}
              </div>
            </div>
          </div>

          {order.notes && (
            <div className="mb-8 bg-gray-50 border border-gray-200 px-4 py-3">
              <div className="font-mono text-[8px] tracking-[0.25em] uppercase text-gray-400 mb-1">Notas</div>
              <div className="text-[12px] text-gray-600">{order.notes}</div>
            </div>
          )}

          {/* Footer */}
          <div className="pt-6 border-t border-gray-200 text-center">
            <div className="font-mono text-[9px] tracking-[0.15em] uppercase text-gray-400">
              Hardy Hermanos S.R.L. · ventas@hardy.ar · hardy.ar · @hardy.arg
            </div>
            <div className="font-mono text-[8px] text-gray-300 mt-1">
              Los precios no incluyen IVA · Documento no válido como factura
            </div>
          </div>

        </div>
      </div>
    </>
  )
}
