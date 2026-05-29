'use client'

import { useActionState, useMemo, useState } from 'react'
import Image from 'next/image'
import { createPortalOrder } from '@/lib/actions/orders'
import type { CreateOrderState } from '@/lib/actions/orders'
import { formatARS } from '@/lib/products'
import { HARDY_BANK, HARDY_DEPOSITO } from '@/lib/hardy'

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

// ─── Opciones de envío ────────────────────────────────────────────────────────

const SHIPPING_OPTIONS = [
  {
    value:   'urgente_caba',
    emoji:   '🚀',
    label:   'URGENTE — CABA',
    sub:     'Entrega en 48-72hs hábiles',
    cost:    '$50.000 + IVA',
    tiers:   null,
  },
  {
    value:   'urgente_gba',
    emoji:   '🚀',
    label:   'URGENTE — GBA',
    sub:     'Entrega en 48-72hs hábiles',
    cost:    '$75.000 + IVA',
    tiers:   null,
  },
  {
    value:   'sin_urgencia_caba',
    emoji:   '⏳',
    label:   'SIN URGENCIA — CABA',
    sub:     'Entrega en 5 a 10 días hábiles',
    cost:    'Desde $15.000 + IVA',
    tiers:   [
      '1 a 14 cajas / 1 a 4 baldes → $15.000 + IVA',
      '15 a 25 cajas / 5 a 9 baldes → $25.000 + IVA',
      'Más de 25 cajas / más de 10 baldes → $35.000 + IVA',
    ],
  },
  {
    value:   'sin_urgencia_gba',
    emoji:   '⏳',
    label:   'SIN URGENCIA — GBA',
    sub:     'Entrega en 5 a 10 días hábiles',
    cost:    'Desde $25.000 + IVA',
    tiers:   [
      '1 a 14 cajas / 1 a 4 baldes → $25.000 + IVA',
      '15 a 25 cajas / 5 a 9 baldes → $35.000 + IVA',
      'Más de 25 cajas / más de 10 baldes → $45.000 + IVA',
    ],
  },
  {
    value:   'retiro_deposito',
    emoji:   '🏭',
    label:   'RETIRO EN DEPÓSITO',
    sub:     `${HARDY_DEPOSITO.direccion} · ${HARDY_DEPOSITO.horario}`,
    cost:    'Sin costo',
    tiers:   null,
  },
] as const

// ─── Opciones de pago ─────────────────────────────────────────────────────────

const PAYMENT_OPTIONS = [
  {
    value:      'transferencia',
    label:      'Transferencia bancaria',
    sub:        '50% anticipado + 50% contra entrega',
    showBank:   true,
  },
  {
    value:      'deposito_bancario',
    label:      'Depósito bancario',
    sub:        '50% anticipado + 50% contra entrega',
    showBank:   true,
  },
  {
    value:      'echeq_30',
    label:      'E-CHEQ 30 días',
    sub:        'Liberamos mercadería al recibir el E-CHEQ',
    showBank:   false,
  },
] as const

type ShippingValue = typeof SHIPPING_OPTIONS[number]['value']
type PaymentValue  = typeof PAYMENT_OPTIONS[number]['value']

const BANK_PAYMENT_VALUES: string[] = ['transferencia', 'deposito_bancario']

// ─── Component ────────────────────────────────────────────────────────────────

export default function NuevoPedidoForm({ productos, initialQtys }: Props) {
  const [state, action, isPending] = useActionState<CreateOrderState, FormData>(
    createPortalOrder,
    undefined,
  )

  const [qtys, setQtys] = useState<Record<string, number>>(
    Object.fromEntries(productos.map((p) => [p.id, initialQtys?.[p.id] ?? 0]))
  )

  const [selectedPayment, setSelectedPayment] = useState<string | null>(null)
  const [selectedShipping, setSelectedShipping] = useState<string | null>(null)

  const total = useMemo(
    () => productos.reduce((acc, p) => acc + (qtys[p.id] ?? 0) * p.b2bPrice, 0),
    [qtys, productos]
  )

  const hasItems = Object.values(qtys).some((q) => q > 0)

  function setQty(id: string, value: string) {
    const n = Math.max(0, parseInt(value, 10) || 0)
    setQtys((prev) => ({ ...prev, [id]: n }))
  }

  const showBankDetails = selectedPayment && BANK_PAYMENT_VALUES.includes(selectedPayment)
  const selectedShippingOpt = SHIPPING_OPTIONS.find((o) => o.value === selectedShipping)

  return (
    <form action={action}>

      {/* ── Productos ───────────────────────────────────────── */}
      <div className="bg-paper border border-ink/8 mb-6">
        <div className="px-5 py-3 border-b border-ink/8 grid gap-4" style={{ gridTemplateColumns: '1fr 80px 90px 80px' }}>
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Producto</span>
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 text-right">Precio</span>
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 text-center">Cantidad</span>
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 text-right">Subtotal</span>
        </div>

        {productos.map((p) => {
          const qty      = qtys[p.id] ?? 0
          const subtotal = qty * p.b2bPrice
          return (
            <div
              key={p.id}
              className="px-5 py-4 border-b border-ink/8 grid gap-4 items-center last:border-0"
              style={{ gridTemplateColumns: '1fr 80px 90px 80px' }}
            >
              <input type="hidden" name={`qty-${p.id}`} value={qty} />

              <div className="flex items-center gap-3 min-w-0">
                <Image src={p.image} alt={p.name} width={40} height={40} className="object-contain shrink-0" />
                <div className="min-w-0">
                  <div className="font-body font-semibold text-[13px] truncate">{p.name}</div>
                  <div className="font-mono text-[9px] tracking-[0.12em] text-red uppercase">
                    {p.variant} · {p.size}
                    {p.minQty > 1 && <span className="text-ink/30 ml-2">mín. {p.minQty}u</span>}
                  </div>
                </div>
              </div>

              <div className="font-mono text-[12px] text-ink/70 text-right">{formatARS(p.b2bPrice)}</div>

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

              <div className={`font-heading text-[16px] font-medium text-right ${subtotal > 0 ? 'text-ink' : 'text-ink/20'}`}>
                {subtotal > 0 ? formatARS(subtotal) : '—'}
              </div>
            </div>
          )
        })}

        <div className="px-5 py-4 bg-ink flex justify-between items-center">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-paper/50">Total estimado</span>
          <span className={`font-heading text-[26px] font-medium ${total > 0 ? 'text-paper' : 'text-paper/20'}`}>
            {total > 0 ? formatARS(total) : '$0'}
          </span>
        </div>
      </div>

      {/* ── Envío ───────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 mb-3">── Método de envío *</p>
        <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
          {SHIPPING_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={[
                'flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors',
                selectedShipping === opt.value ? 'bg-paper-2' : 'hover:bg-paper-2/60',
              ].join(' ')}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={opt.value}
                required
                onChange={() => setSelectedShipping(opt.value)}
                className="mt-1 shrink-0 accent-[#C0171E]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-[14px]">{opt.emoji}</span>
                  <span className="font-body font-semibold text-[14px]">{opt.label}</span>
                  <span className="font-mono text-[10px] tracking-[0.1em] text-red uppercase ml-auto">{opt.cost}</span>
                </div>
                <div className="font-body text-[12px] text-ink/50 mt-[2px]">{opt.sub}</div>
                {opt.tiers && selectedShipping === opt.value && (
                  <div className="mt-3 bg-ink/5 border border-ink/8 px-3 py-2 flex flex-col gap-1">
                    {opt.tiers.map((tier) => (
                      <p key={tier} className="font-mono text-[10px] tracking-[0.06em] text-ink/60">{tier}</p>
                    ))}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ── Pago ────────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 mb-3">── Forma de pago *</p>
        <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
          {PAYMENT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={[
                'flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors',
                selectedPayment === opt.value ? 'bg-paper-2' : 'hover:bg-paper-2/60',
              ].join(' ')}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={opt.value}
                required
                onChange={() => setSelectedPayment(opt.value)}
                className="mt-1 shrink-0 accent-[#C0171E]"
              />
              <div>
                <div className="font-body font-semibold text-[14px]">{opt.label}</div>
                <div className="font-body text-[12px] text-ink/50">{opt.sub}</div>
              </div>
            </label>
          ))}
        </div>

        {/* Datos bancarios — aparece al elegir transferencia/depósito */}
        {showBankDetails && (
          <div className="mt-3 bg-ink text-paper px-5 py-5">
            <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-red mb-4">── Datos para la transferencia</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 max-md:grid-cols-1">
              {[
                { label: 'Razón Social', value: HARDY_BANK.razonSocial },
                { label: 'Banco',        value: HARDY_BANK.banco        },
                { label: 'CBU',          value: HARDY_BANK.cbu          },
                { label: 'Alias',        value: HARDY_BANK.alias        },
                { label: 'CUIT',         value: HARDY_BANK.cuit         },
                { label: 'N° de cuenta', value: HARDY_BANK.cuenta       },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-paper/40 mb-[3px]">{label}</p>
                  <p className="font-mono text-[13px] text-paper font-medium tracking-[0.04em]">{value}</p>
                </div>
              ))}
            </div>
            <p className="font-mono text-[9px] tracking-[0.08em] text-paper/40 mt-4">
              Recordá enviar el comprobante por WhatsApp para agilizar la confirmación.
            </p>
          </div>
        )}
      </div>

      {/* ── Notas ───────────────────────────────────────────── */}
      <div className="mb-6">
        <label htmlFor="notes" className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 block mb-3">
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

      {/* ── Error ───────────────────────────────────────────── */}
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
        {isPending ? 'Confirmando pedido...' : `Confirmar pedido${total > 0 ? ` — ${formatARS(total)}` : ''} →`}
      </button>

      {!hasItems && (
        <p className="font-mono text-[10px] tracking-[0.1em] text-ink/40 uppercase text-center mt-3">
          Agregá al menos un producto para continuar
        </p>
      )}
    </form>
  )
}
