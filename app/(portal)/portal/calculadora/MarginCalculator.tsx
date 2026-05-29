'use client'

import { useState, useMemo } from 'react'
import { formatARS } from '@/lib/products'

interface ProductConfig {
  id:          string
  label:       string
  unitsPerBox: number
  pvpSugerido: number
}

const PRODUCTS: ProductConfig[] = [
  { id: 'natural',  label: 'Crema de Maní Natural 380g',  unitsPerBox: 15, pvpSugerido: 5200 },
  { id: 'crunchy',  label: 'Crema de Maní Crunchy 380g',  unitsPerBox: 15, pvpSugerido: 5200 },
  { id: 'miel-liq', label: 'Miel Líquida 500g',           unitsPerBox: 12, pvpSugerido: 6900 },
  { id: 'miel-sol', label: 'Miel Sólida 500g',            unitsPerBox: 12, pvpSugerido: 6900 },
  { id: 'balde-45', label: 'Balde Crema de Maní 4,5 kg',  unitsPerBox: 1,  pvpSugerido: 0    },
  { id: 'balde-23', label: 'Balde Crema de Maní 23 kg',   unitsPerBox: 1,  pvpSugerido: 0    },
]

function pct(margin: number): string {
  return `${margin.toFixed(1)}%`
}

function marginColor(margin: number): string {
  if (margin >= 35) return 'text-green-600'
  if (margin >= 20) return 'text-amber-600'
  return 'text-red'
}

export default function MarginCalculator() {
  const [selectedId,  setSelectedId]  = useState<string>('natural')
  const [buyPrice,    setBuyPrice]    = useState<string>('57000') // price per caja
  const [sellPrice,   setSellPrice]   = useState<string>('')
  const [usePerUnit,  setUsePerUnit]  = useState(false)   // show per-unit breakdown

  const product = PRODUCTS.find((p) => p.id === selectedId)!

  const buy    = parseFloat(buyPrice) || 0
  const sell   = parseFloat(sellPrice) || 0

  const results = useMemo(() => {
    if (!buy || !sell || !product) return null

    const isBalde = product.unitsPerBox === 1

    // Interpret buy as per-CAJA, sell as per-UNIDAD (typical retail scenario)
    const buyCostPerUnit   = isBalde ? buy : buy / product.unitsPerBox
    const sellPricePerUnit = sell

    const grossMarginArs   = sellPricePerUnit - buyCostPerUnit
    const grossMarginPct   = (grossMarginArs / sellPricePerUnit) * 100
    const markup           = (grossMarginArs / buyCostPerUnit) * 100

    // Revenue per box
    const revenuePerBox    = isBalde ? sell : sell * product.unitsPerBox
    const profitPerBox     = revenuePerBox - buy

    return {
      buyCostPerUnit,
      sellPricePerUnit,
      grossMarginArs,
      grossMarginPct,
      markup,
      revenuePerBox,
      profitPerBox,
      isBalde,
    }
  }, [buy, sell, product])

  return (
    <div>
      {/* Product selector */}
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 mb-3">── Producto</p>
        <div className="grid grid-cols-2 gap-2 max-md:grid-cols-1">
          {PRODUCTS.map((p) => (
            <button
              key={p.id}
              onClick={() => setSelectedId(p.id)}
              className={[
                'px-4 py-3 border text-left transition-colors',
                selectedId === p.id
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper border-ink/15 text-ink hover:bg-paper-2',
              ].join(' ')}
            >
              <div className="font-body text-[13px] font-medium">{p.label}</div>
              {p.unitsPerBox > 1 && (
                <div className="font-mono text-[9px] text-inherit opacity-50 mt-[2px] uppercase tracking-[0.08em]">
                  Caja × {p.unitsPerBox}u
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Inputs */}
      <div className="bg-paper border border-ink/8 mb-6">
        <div className="px-5 py-4 border-b border-ink/8">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 mb-4">── Precios</p>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div>
              <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50 block mb-2">
                Precio de compra (por {product.unitsPerBox > 1 ? 'caja' : 'unidad'}) *
              </label>
              <div className="flex items-center border border-ink/15 bg-paper-2 focus-within:border-ink transition-colors">
                <span className="px-3 font-mono text-[13px] text-ink/40">$</span>
                <input
                  type="number"
                  value={buyPrice}
                  onChange={(e) => setBuyPrice(e.target.value)}
                  placeholder="0"
                  className="flex-1 py-3 pr-3 bg-transparent font-mono text-[14px] outline-none"
                />
              </div>
              {product.pvpSugerido > 0 && (
                <p className="font-mono text-[9px] text-ink/30 mt-1">
                  PVP sugerido al consumidor: {formatARS(product.pvpSugerido)}/u
                </p>
              )}
            </div>
            <div>
              <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50 block mb-2">
                Precio de venta al público (por unidad) *
              </label>
              <div className="flex items-center border border-ink/15 bg-paper-2 focus-within:border-ink transition-colors">
                <span className="px-3 font-mono text-[13px] text-ink/40">$</span>
                <input
                  type="number"
                  value={sellPrice}
                  onChange={(e) => setSellPrice(e.target.value)}
                  placeholder="0"
                  className="flex-1 py-3 pr-3 bg-transparent font-mono text-[14px] outline-none"
                />
              </div>
              {product.pvpSugerido > 0 && (
                <button
                  onClick={() => setSellPrice(String(product.pvpSugerido))}
                  className="font-mono text-[9px] text-red underline mt-1 hover:no-underline"
                >
                  Usar PVP sugerido ({formatARS(product.pvpSugerido)})
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Results */}
        {results ? (
          <div className="px-5 py-5">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 mb-4">── Resultado</p>
            <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">

              <div className="bg-ink text-paper p-4 text-center">
                <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-paper/40 mb-2">
                  Margen bruto
                </p>
                <p className={`font-heading text-[28px] font-medium ${marginColor(results.grossMarginPct).replace('text-', 'text-')}`}
                   style={{ color: results.grossMarginPct >= 35 ? '#16a34a' : results.grossMarginPct >= 20 ? '#d97706' : '#C0171E' }}>
                  {pct(results.grossMarginPct)}
                </p>
                <p className="font-mono text-[9px] text-paper/40 mt-1">
                  {formatARS(results.grossMarginArs)}/u
                </p>
              </div>

              <div className="bg-paper-2 p-4 text-center border border-ink/8">
                <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink/40 mb-2">
                  Ganancia / {results.isBalde ? 'unidad' : 'caja'}
                </p>
                <p className="font-heading text-[22px] font-medium text-ink">
                  {formatARS(results.profitPerBox)}
                </p>
                <p className="font-mono text-[9px] text-ink/40 mt-1">
                  Ingreso: {formatARS(results.revenuePerBox)}
                </p>
              </div>

              <div className="bg-paper-2 p-4 text-center border border-ink/8">
                <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink/40 mb-2">
                  Markup
                </p>
                <p className="font-heading text-[22px] font-medium text-ink">
                  {pct(results.markup)}
                </p>
                <p className="font-mono text-[9px] text-ink/40 mt-1">
                  sobre costo
                </p>
              </div>
            </div>

            {/* Breakdown */}
            <div className="mt-4 bg-paper-2 border border-ink/8 px-4 py-3 space-y-2">
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-ink/50">Costo por unidad</span>
                <span className="text-ink">{formatARS(Math.round(results.buyCostPerUnit))}</span>
              </div>
              <div className="flex justify-between font-mono text-[11px]">
                <span className="text-ink/50">Venta por unidad</span>
                <span className="text-ink">{formatARS(Math.round(results.sellPricePerUnit))}</span>
              </div>
              <div className="flex justify-between font-mono text-[11px] pt-2 border-t border-ink/10">
                <span className="text-ink/50">Ganancia por unidad</span>
                <span className="font-semibold text-ink">{formatARS(Math.round(results.grossMarginArs))}</span>
              </div>
            </div>

            {/* Advice */}
            <div className={`mt-4 px-4 py-3 border font-mono text-[10px] tracking-[0.06em] ${
              results.grossMarginPct >= 35
                ? 'bg-green-50 border-green-200 text-green-700'
                : results.grossMarginPct >= 20
                  ? 'bg-amber-50 border-amber-200 text-amber-700'
                  : 'bg-red/5 border-red/20 text-red'
            }`}>
              {results.grossMarginPct >= 35
                ? '✓ Excelente margen. Muy por encima del promedio del canal.'
                : results.grossMarginPct >= 20
                  ? '⚡ Margen aceptable. Considerá negociar precio o ajustar el PVP.'
                  : '⚠ Margen bajo. Revisá el precio de compra o el precio de venta sugerido.'}
            </div>
          </div>
        ) : (
          <div className="px-5 py-8 text-center">
            <p className="font-mono text-[11px] text-ink/30 uppercase tracking-[0.1em]">
              Completá los precios para ver el resultado
            </p>
          </div>
        )}
      </div>

      <p className="font-mono text-[9px] text-ink/30 tracking-[0.06em]">
        Los cálculos son orientativos. No incluyen costos de distribución, almacenamiento ni IVA.
      </p>
    </div>
  )
}
