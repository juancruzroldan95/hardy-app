'use client'

import { useActionState, useState } from 'react'
import { updateOrderDetails } from '@/repository/mutations/admin'
import type { OrderUpdateState } from '@/repository/mutations/admin'

const SHIPPING_OPTIONS = [
  { value: '',                  label: 'Sin especificar' },
  { value: 'coordinar_whatsapp', label: 'Coordinar por WhatsApp' },
  { value: 'andreani',           label: 'Andreani' },
  { value: 'oca',                label: 'OCA' },
  { value: 'retiro_deposito',    label: 'Retiro en depósito' },
  { value: 'urgente_caba',       label: 'Urgente CABA' },
  { value: 'urgente_gba',        label: 'Urgente GBA' },
  { value: 'sin_urgencia_caba',  label: 'Sin urgencia CABA' },
  { value: 'sin_urgencia_gba',   label: 'Sin urgencia GBA' },
]

const PAYMENT_OPTIONS = [
  { value: '',               label: 'Sin especificar' },
  { value: 'transferencia',  label: 'Transferencia bancaria' },
  { value: 'mercadopago',    label: 'Tarjeta / Mercado Pago' },
  { value: 'efectivo',       label: 'Efectivo al recibir' },
  { value: 'deposito_bancario', label: 'Depósito bancario' },
  { value: 'echeq_30',       label: 'E-CHEQ 30 días' },
  { value: 'credito30',      label: 'Crédito a 30 días' },
  { value: 'credito60',      label: 'Crédito a 60 días' },
  { value: 'cheque',         label: 'Cheque' },
]

function formatARS(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

type Item = {
  id: string
  productName: string
  variant: string
  size: string
  unitPriceArs: number
  qty: number
}

type Props = {
  orderId: string
  items: Item[]
  shippingMethod: string | null
  paymentMethod: string | null
  notes: string | null
}

export default function AdminOrderEditForm({
  orderId, items, shippingMethod, paymentMethod, notes,
}: Props) {
  const [state, action, isPending] = useActionState<OrderUpdateState, FormData>(
    updateOrderDetails,
    undefined,
  )

  const [qtys, setQtys] = useState<Record<string, number>>(
    Object.fromEntries(items.map((i) => [i.id, i.qty])),
  )

  const total = items.reduce((acc, item) => {
    const q = qtys[item.id] ?? item.qty
    return acc + (q > 0 ? q * item.unitPriceArs : 0)
  }, 0)

  const selectCls = 'w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors'

  return (
    <div className="bg-paper border border-ink/8 p-6 mb-6">
      <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-5">
        Editar pedido
      </p>

      <form action={action} className="flex flex-col gap-6">
        <input type="hidden" name="orderId" value={orderId} />

        {/* Items */}
        <div>
          <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink/40 mb-3">Productos</p>
          <div className="border border-ink/8 divide-y divide-ink/8">
            {items.map((item) => {
              const q       = qtys[item.id] ?? item.qty
              const subtotal = q > 0 ? q * item.unitPriceArs : 0
              return (
                <div key={item.id} className={`flex items-center gap-4 px-4 py-3 ${q === 0 ? 'opacity-40' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <p className="font-body text-[13px] text-ink font-medium leading-tight">{item.productName}</p>
                    <p className="font-mono text-[9px] tracking-[0.08em] text-ink/40 uppercase mt-[2px]">
                      {item.variant} · {item.size} · {formatARS(item.unitPriceArs)}/u
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setQtys((prev) => ({ ...prev, [item.id]: Math.max(0, (prev[item.id] ?? item.qty) - 1) }))}
                      className="w-8 h-8 border border-ink/20 font-mono text-[14px] flex items-center justify-center hover:border-ink transition-colors"
                    >−</button>
                    <input
                      type="number"
                      name={`qty_${item.id}`}
                      min={0}
                      value={q}
                      onChange={(e) => setQtys((prev) => ({ ...prev, [item.id]: Math.max(0, parseInt(e.target.value) || 0) }))}
                      className="w-12 text-center border border-ink/20 font-mono text-[14px] py-1 outline-none focus:border-ink bg-paper"
                    />
                    <button
                      type="button"
                      onClick={() => setQtys((prev) => ({ ...prev, [item.id]: (prev[item.id] ?? item.qty) + 1 }))}
                      className="w-8 h-8 border border-ink/20 font-mono text-[14px] flex items-center justify-center hover:border-ink transition-colors"
                    >+</button>
                  </div>
                  <span className="font-mono text-[13px] text-ink w-[80px] text-right shrink-0">
                    {q > 0 ? formatARS(subtotal) : <span className="text-ink/30 text-[10px]">eliminado</span>}
                  </span>
                </div>
              )
            })}
            <div className="flex items-center justify-between px-4 py-3 bg-paper-2">
              <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50">Total</span>
              <span className="font-heading text-[18px] font-medium text-ink">{formatARS(total)}</span>
            </div>
          </div>
          {items.some((i) => (qtys[i.id] ?? i.qty) === 0) && (
            <p className="font-mono text-[9px] text-amber-600 mt-2">
              Los ítems con cantidad 0 serán eliminados del pedido al guardar.
            </p>
          )}
        </div>

        {/* Envío + Pago */}
        <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
          <div>
            <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/60 block mb-2">Envío</label>
            <select name="shippingMethod" defaultValue={shippingMethod ?? ''} className={selectCls}>
              {SHIPPING_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/60 block mb-2">Forma de pago</label>
            <select name="paymentMethod" defaultValue={paymentMethod ?? ''} className={selectCls}>
              {PAYMENT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Notas */}
        <div>
          <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/60 block mb-2">Notas del cliente</label>
          <textarea
            name="notes"
            defaultValue={notes ?? ''}
            rows={2}
            className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors resize-none"
          />
        </div>

        {/* Feedback + Submit */}
        <div className="flex items-center gap-4 flex-wrap">
          <button
            type="submit"
            disabled={isPending}
            className="bg-ink text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[13px] hover:bg-ink/80 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Guardando...' : 'Guardar cambios →'}
          </button>
          {state && 'success' in state && (
            <span className="font-mono text-[10px] tracking-[0.1em] text-[#2d6a35] uppercase">✓ Guardado</span>
          )}
          {state && 'error' in state && (
            <span className="font-mono text-[10px] tracking-[0.1em] text-red uppercase">{state.error}</span>
          )}
        </div>
      </form>
    </div>
  )
}
