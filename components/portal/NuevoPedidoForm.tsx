'use client'

import { useActionState, useMemo, useState } from 'react'
import Image from 'next/image'
import { createPortalOrder } from '@/lib/actions/orders'
import type { CreateOrderState } from '@/lib/actions/orders'
import { formatARS } from '@/lib/products'

export interface ProductOrden {
  id: string
  name: string
  variant: string
  size: string
  image: string
  b2bPrice: number
  minQty: number
}

interface Props {
  productos:    ProductOrden[]
  initialQtys?: Record<string, number>
}

const SHIPPING_OPTIONS = [
  { value: 'coordinar_whatsapp', label: 'Coordinar por WhatsApp',   sub: 'Te contactamos para definir envío y costos' },
  { value: 'andreani',           label: 'Andreani',                  sub: 'Cotización según destino, a tu cargo' },
  { value: 'oca',                label: 'OCA',                       sub: 'Cotización según destino, a tu cargo' },
  { value: 'retiro_deposito',    label: 'Retiro en depósito',        sub: 'Coordinar dirección por WhatsApp' },
]

const PAYMENT_OPTIONS = [
  { value: 'transferencia', label: 'Transferencia bancaria', sub: 'Datos al confirmar el pedido' },
  { value: 'efectivo',      label: 'Efectivo al recibir',   sub: 'Solo disponible con envío propio' },
  { value: 'credito30',     label: 'Crédito a 30 días',     sub: 'Disponible para clientes habilitados' },
  { value: 'credito60',     label: 'Crédito a 60 días',     sub: 'Disponible para clientes habilitados' },
  { value: 'cheque',        label: 'Cheque',                sub: 'Coordinar con el equipo de ventas' },
]

export default function NuevoPedidoForm({ productos, initialQtys }: Props) {
  const [state, action, isPending] = useActionState<CreateOrderState, FormData>(
    createPortalOrder,
    undefined,
  )

  const [qtys, setQtys] = useState<Record<string, number>>(
    Object.fromEntries(productos.map((p) => [p.id, initialQtys?.[p.id] ?? 0]))
  )

  const total = useMemo(
    () => productos.reduce((acc, p) => acc + (qtys[p.id] ?? 0) * p.b2bPrice, 0),
    [qtys, productos]
  )

  const hasItems = Object.values(qtys).some((q) => q > 0)

  function setQty(id: string, value: string) {
    const n = Math.max(0, parseInt(value, 10) || 0)
    setQtys((prev) => ({ ...prev, [id]: n }))
  }

  return (
    <form action={action}>
      {/* Productos */}
      <div className="bg-paper border border-ink/8 mb-6">
        <div className="px-5 py-3 border-b border-ink/8 grid gap-4" style={{ gridTemplateColumns: '1fr 80px 90px 80px' }}>
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Producto</span>
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 text-right">Precio</span>
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 text-center">Cantidad</span>
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 text-right">Subtotal</span>
        </div>

        {productos.map((p) => {
          const qty     = qtys[p.id] ?? 0
          const subtotal = qty * p.b2bPrice
          return (
            <div
              key={p.id}
              className="px-5 py-4 border-b border-ink/8 grid gap-4 items-center last:border-0"
              style={{ gridTemplateColumns: '1fr 80px 90px 80px' }}
            >
              {/* Hidden field with quantity */}
              <input type="hidden" name={`qty-${p.id}`} value={qty} />

              {/* Product info */}
              <div className="flex items-center gap-3 min-w-0">
                <Image
                  src={p.image}
                  alt={p.name}
                  width={40}
                  height={40}
                  className="object-contain shrink-0"
                />
                <div className="min-w-0">
                  <div className="font-body font-semibold text-[13px] truncate">{p.name}</div>
                  <div className="font-mono text-[9px] tracking-[0.12em] text-red uppercase">
                    {p.variant} · {p.size}
                    {p.minQty > 1 && (
                      <span className="text-ink/30 ml-2">mín. {p.minQty}u</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Price */}
              <div className="font-mono text-[12px] text-ink/70 text-right">
                {formatARS(p.b2bPrice)}
              </div>

              {/* Qty input */}
              <div className="flex items-center justify-center">
                <input
                  type="number"
                  min={0}
                  value={qty || ''}
                  placeholder="0"
                  onChange={(e) => setQty(p.id, e.target.value)}
                  className="w-[70px] text-center bg-paper-2 border border-ink/15 font-mono text-[13px] py-2 outline-none focus:border-ink transition-colors"
                />
              </div>

              {/* Subtotal */}
              <div className={`font-heading text-[16px] font-medium text-right ${subtotal > 0 ? 'text-ink' : 'text-ink/20'}`}>
                {subtotal > 0 ? formatARS(subtotal) : '—'}
              </div>
            </div>
          )
        })}

        {/* Total */}
        <div className="px-5 py-4 bg-ink flex justify-between items-center">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-paper/50">
            Total estimado
          </span>
          <span className={`font-heading text-[26px] font-medium ${total > 0 ? 'text-paper' : 'text-paper/20'}`}>
            {total > 0 ? formatARS(total) : '$0'}
          </span>
        </div>
      </div>

      {/* Envío */}
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 mb-3">
          ── Método de envío *
        </p>
        <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
          {SHIPPING_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-paper-2 transition-colors"
            >
              <input
                type="radio"
                name="shippingMethod"
                value={opt.value}
                required
                className="mt-1 shrink-0 accent-[#C0171E]"
              />
              <div>
                <div className="font-body font-semibold text-[14px]">{opt.label}</div>
                <div className="font-body text-[12px] text-ink/50">{opt.sub}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Pago */}
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 mb-3">
          ── Forma de pago *
        </p>
        <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
          {PAYMENT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className="flex items-start gap-4 px-5 py-4 cursor-pointer hover:bg-paper-2 transition-colors"
            >
              <input
                type="radio"
                name="paymentMethod"
                value={opt.value}
                required
                className="mt-1 shrink-0 accent-[#C0171E]"
              />
              <div>
                <div className="font-body font-semibold text-[14px]">{opt.label}</div>
                <div className="font-body text-[12px] text-ink/50">{opt.sub}</div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* Notas */}
      <div className="mb-6">
        <label
          htmlFor="notes"
          className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 block mb-3"
        >
          ── Notas del pedido (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Indicaciones especiales, dirección de entrega, horarios, etc."
          className="w-full bg-paper border border-ink/15 text-ink font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors resize-none"
        />
      </div>

      {/* Errors */}
      {state && 'error' in state && (
        <div className="bg-red/10 border border-red/20 px-5 py-4 mb-5">
          <p className="font-mono text-[11px] tracking-[0.1em] text-red">{state.error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !hasItems}
        className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-10 py-[18px] disabled:opacity-40 transition-opacity w-full"
      >
        {isPending ? 'Confirmando pedido...' : `Confirmar pedido ${total > 0 ? `— ${formatARS(total)}` : ''} →`}
      </button>

      {!hasItems && (
        <p className="font-mono text-[10px] tracking-[0.1em] text-ink/40 uppercase text-center mt-3">
          Agregá al menos un producto para continuar
        </p>
      )}
    </form>
  )
}
