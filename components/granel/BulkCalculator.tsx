'use client'

import { useState } from 'react'
import { GRANEL_PRODUCTOS, DIFERENCIA_MINIMA_PCT, getTramo } from '@/consts/granel'
import type { Formato } from '@/consts/granel'
import { WA_NUMBER } from '@/consts/products'

function fmt(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

function calcFormato(formato: Formato, kgNecesarios: number) {
  const unidades  = Math.ceil(kgNecesarios / formato.kg)
  const tramo     = getTramo(formato.tramos, unidades)
  if (!tramo) return null
  const total        = unidades * tramo.precio_unidad
  const kgTotal      = unidades * formato.kg
  const sobrante     = kgTotal - kgNecesarios
  const precioKgReal = total / kgTotal
  return { unidades, total, kgTotal, sobrante, precioKgReal }
}

export default function BulkCalculator() {
  const [productoIdx, setProductoIdx] = useState(0)
  const [kg, setKg] = useState(20)

  const producto   = GRANEL_PRODUCTOS[productoIdx]
  const resultados = producto.formatos.map((f) => ({ formato: f, calc: calcFormato(f, kg) }))
  const totales    = resultados.map((r) => r.calc?.total ?? Infinity)
  const minTotal   = Math.min(...totales)
  const maxTotal   = Math.max(...totales.filter((t) => t !== Infinity))
  const diffAbs    = maxTotal - minTotal
  const diffPct    = minTotal > 0 ? (diffAbs / minTotal) * 100 : 0
  const esEmpate   = diffPct < DIFERENCIA_MINIMA_PCT && resultados.length === 2 && resultados.every((r) => r.calc)

  return (
    <div className="bg-paper-2">

      {/* Selector de producto */}
      <div className="flex border-b border-ink/10">
        {GRANEL_PRODUCTOS.map((p, i) => (
          <button
            key={p.id}
            type="button"
            onClick={() => setProductoIdx(i)}
            className={`flex-1 font-mono text-[11px] tracking-[0.15em] uppercase py-4 transition-colors ${
              i === productoIdx ? 'bg-ink text-paper' : 'text-ink/50 hover:text-ink'
            }`}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      <div className="p-6 md:p-8">

        {/* Input de kg */}
        <div className="mb-8">
          <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/60 block mb-3">
            ¿Cuántos kg necesitás?
          </label>
          <div className="flex items-center gap-5">
            <input
              type="range"
              min={5}
              max={150}
              step={5}
              value={kg}
              onChange={(e) => setKg(parseInt(e.target.value))}
              className="flex-1 accent-red h-[3px]"
            />
            <div className="flex items-center gap-2 flex-shrink-0">
              <input
                type="number"
                min={1}
                value={kg}
                onChange={(e) => setKg(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-20 text-center border border-ink/20 font-mono text-[18px] py-2 outline-none focus:border-ink bg-paper"
              />
              <span className="font-mono text-[11px] text-ink/50 uppercase">kg</span>
            </div>
          </div>
        </div>

        {/* Resultados por formato */}
        <div className="grid grid-cols-2 gap-[2px] max-md:grid-cols-1">
          {resultados.map(({ formato, calc }) => {
            if (!calc) return null
            const esMejor = !esEmpate && calc.total === minTotal
            const waText  = `Quiero cotizar ${calc.unidades} x ${formato.etiqueta} de ${producto.nombre}`

            return (
              <div
                key={formato.id}
                className={`p-5 flex flex-col gap-3 ${esMejor ? 'bg-ink text-paper' : 'bg-paper'}`}
              >
                {esMejor && (
                  <p className="font-mono text-[9px] tracking-[0.2em] text-red uppercase m-0">
                    ✓ Opción más económica
                  </p>
                )}

                <h4 className={`font-heading text-[20px] font-medium m-0 ${esMejor ? 'text-paper' : 'text-ink'}`}>
                  {formato.etiqueta}
                </h4>

                <div className={`flex flex-col gap-[6px] text-[13px] font-body ${esMejor ? 'text-paper/70' : 'text-ink/60'}`}>
                  <div className="flex justify-between">
                    <span>Unidades</span>
                    <span className="font-mono font-medium">
                      {calc.unidades} balde{calc.unidades !== 1 ? 's' : ''}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Kg total</span>
                    <span className="font-mono font-medium">
                      {calc.kgTotal} kg
                      {calc.sobrante > 0 && (
                        <span className={`ml-1 text-[11px] ${esMejor ? 'text-paper/40' : 'text-ink/35'}`}>
                          (+{calc.sobrante} sobrante)
                        </span>
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>$/kilo</span>
                    <span className="font-mono font-medium">{fmt(calc.precioKgReal)}</span>
                  </div>
                </div>

                <div className={`text-[28px] font-heading font-medium border-t pt-3 ${esMejor ? 'border-paper/15 text-paper' : 'border-ink/10 text-ink'}`}>
                  {fmt(calc.total)}
                </div>

                <a
                  href={`${WA_NUMBER}?text=${encodeURIComponent(waText)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`font-mono text-[10px] tracking-[0.15em] uppercase px-5 py-[12px] text-center transition-colors ${
                    esMejor
                      ? 'bg-red text-paper hover:opacity-90'
                      : 'border border-ink/25 text-ink hover:border-ink'
                  }`}
                >
                  Cotizar {calc.unidades} × {formato.etiqueta} →
                </a>
              </div>
            )
          })}
        </div>

        {esEmpate ? (() => {
          const [a, b] = resultados
          return (
            <p className="font-body text-[13px] text-ink/55 leading-[1.6] mt-4 m-0">
              Diferencia de {fmt(diffAbs)} ({diffPct.toFixed(1)}%) entre ambas opciones —{' '}
              {a.calc!.unidades} {a.formato.etiqueta} vs. {b.calc!.unidades} {b.formato.etiqueta}.{' '}
              La diferencia de costo es mínima; puede convenir priorizar según cuántos envases prefieras manejar.
            </p>
          )
        })() : (
          <p className="font-mono text-[9px] tracking-[0.1em] text-ink/35 uppercase mt-4 m-0">
            * Se recomienda la opción de menor costo total. El sobrante queda disponible para uso futuro.
          </p>
        )}
      </div>
    </div>
  )
}
