'use client'

import { useTransition, useState } from 'react'
import Image from 'next/image'
import { AlertTriangle } from 'lucide-react'
import { updateProductStock } from '@/lib/actions/stock'

type StockStatus = 'available' | 'low_stock' | 'out_of_stock' | 'preorder'

interface Item {
  id:        string
  name:      string
  variant:   string
  size:      string
  image:     string
  status:    string
  stockQty:  number | null
  notes:     string | null
  updatedAt: Date | null
}

const STATUS_OPTIONS: { value: StockStatus; label: string; color: string }[] = [
  { value: 'available',    label: 'Disponible',   color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'low_stock',    label: 'Stock bajo',   color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'out_of_stock', label: 'Sin stock',    color: 'bg-red/10 text-red border-red/20'             },
  { value: 'preorder',     label: 'Pre-venta',    color: 'bg-blue-100 text-blue-700 border-blue-200'    },
]

export function StockBadge({ status }: { status: string }) {
  const opt = STATUS_OPTIONS.find((o) => o.value === status)
  if (!opt) return null
  return (
    <span className={`font-mono text-[8px] tracking-[0.15em] uppercase px-2 py-1 border ${opt.color}`}>
      {opt.label}
    </span>
  )
}

export default function StockManager({ items }: { items: Item[] }) {
  const [isPending, startTransition] = useTransition()
  const [statuses, setStatuses] = useState<Record<string, string>>(
    Object.fromEntries(items.map((i) => [i.id, i.status]))
  )
  const [qtys, setQtys] = useState<Record<string, string>>(
    Object.fromEntries(items.map((i) => [i.id, i.stockQty != null ? String(i.stockQty) : '']))
  )
  const [notes, setNotes] = useState<Record<string, string>>(
    Object.fromEntries(items.map((i) => [i.id, i.notes ?? '']))
  )
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  function handleSave(productId: string) {
    startTransition(async () => {
      const rawQty = qtys[productId].trim()
      const parsedQty = rawQty === '' ? null : parseInt(rawQty, 10)
      await updateProductStock(
        productId,
        statuses[productId] as StockStatus,
        notes[productId] || null,
        isNaN(parsedQty as number) ? null : parsedQty,
      )
      setSaved((prev) => ({ ...prev, [productId]: true }))
      setTimeout(() => setSaved((prev) => ({ ...prev, [productId]: false })), 2000)
    })
  }

  return (
    <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
      {items.map((item) => {
        const qtyStr  = qtys[item.id]
        const qty     = qtyStr === '' ? null : parseInt(qtyStr, 10)
        const isLow   = qty !== null && !isNaN(qty) && qty > 0 && qty <= 50
        const isEmpty = qty !== null && !isNaN(qty) && qty === 0

        return (
          <div key={item.id} className="px-5 py-4 flex items-start gap-4">
            <Image src={item.image} alt={item.name} width={44} height={44} className="object-contain shrink-0 mt-1" />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="font-body font-semibold text-[13px]">{item.name}</span>
                <span className="font-mono text-[9px] tracking-[0.1em] text-red uppercase">{item.variant} · {item.size}</span>
                <StockBadge status={statuses[item.id]} />
              </div>

              {/* Stock qty */}
              <div className="mb-3">
                <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50 block mb-1">
                  Cantidad en stock (cajas/baldes)
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="number"
                    min={0}
                    value={qtyStr}
                    onChange={(e) => setQtys((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder="— sin definir"
                    className="w-[120px] bg-paper-2 border border-ink/15 font-mono text-[13px] px-3 py-2 outline-none focus:border-ink transition-colors text-center"
                  />
                  {isLow && (
                    <div className="flex items-center gap-1.5 text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1.5">
                      <AlertTriangle size={12} />
                      <span className="font-mono text-[9px] tracking-[0.1em] uppercase">Stock bajo (≤50)</span>
                    </div>
                  )}
                  {isEmpty && (
                    <div className="flex items-center gap-1.5 text-red bg-red/8 border border-red/20 px-3 py-1.5">
                      <AlertTriangle size={12} />
                      <span className="font-mono text-[9px] tracking-[0.1em] uppercase">Sin stock</span>
                    </div>
                  )}
                </div>
                <p className="font-mono text-[8px] text-ink/30 mt-1">
                  Al guardar: se marca automáticamente como "Stock bajo" si ≤50, "Sin stock" si 0.
                </p>
              </div>

              {/* Status selector */}
              <div className="flex items-center gap-2 flex-wrap mb-3">
                <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 mr-1">Estado manual:</span>
                {STATUS_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setStatuses((prev) => ({ ...prev, [item.id]: opt.value }))}
                    className={[
                      'font-mono text-[9px] tracking-[0.1em] uppercase px-3 py-1.5 border transition-all',
                      statuses[item.id] === opt.value
                        ? opt.color + ' font-semibold'
                        : 'bg-paper border-ink/15 text-ink/40 hover:text-ink',
                    ].join(' ')}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              {/* Notes */}
              <input
                type="text"
                value={notes[item.id]}
                onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                placeholder="Nota interna (opcional, no visible al cliente)"
                className="w-full bg-paper-2 border border-ink/15 font-body text-[12px] px-3 py-2 outline-none focus:border-ink transition-colors"
              />
            </div>

            <div className="flex flex-col items-end gap-2 shrink-0">
              <button
                onClick={() => handleSave(item.id)}
                disabled={isPending}
                className={[
                  'font-mono text-[10px] tracking-[0.12em] uppercase px-4 py-2 transition-all',
                  saved[item.id]
                    ? 'bg-green-600 text-white'
                    : 'bg-ink text-paper hover:bg-ink/80',
                ].join(' ')}
              >
                {saved[item.id] ? '✓ Guardado' : 'Guardar'}
              </button>
              {item.updatedAt && (
                <span className="font-mono text-[8px] text-ink/25 text-right">
                  {new Date(item.updatedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                </span>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
