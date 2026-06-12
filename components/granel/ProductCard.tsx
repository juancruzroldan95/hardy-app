'use client'

import { useState } from 'react'
import Image from 'next/image'
import { getTramo } from '@/consts/granel'
import type { ProductoGranel } from '@/consts/granel'
import { WA_NUMBER } from '@/consts/products'

function fmt(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export default function ProductCard({ producto }: { producto: ProductoGranel }) {
  const [formatoIdx, setFormatoIdx] = useState(0)
  const [qty, setQty] = useState(1)

  const formato = producto.formatos[formatoIdx]
  const tramo   = getTramo(formato.tramos, qty)!
  const precioUnit = tramo.precio_unidad
  const precioKg   = precioUnit / formato.kg
  const total      = precioUnit * qty

  // Nudge: si el tramo actual tiene techo y faltan ≤ 2 unidades para el siguiente
  const nudge = (() => {
    if (tramo.max === null) return null
    const extra = tramo.max - qty
    if (extra > 2) return null
    const nextTramo = getTramo(formato.tramos, tramo.max + 1)
    if (!nextTramo) return null
    const unidadesExtra = extra + 1
    const totalNuevo = (qty + unidadesExtra) * nextTramo.precio_unidad
    const totalSiSiguieraEnTramoActual = (qty + unidadesExtra) * tramo.precio_unidad
    const ahorro = totalSiSiguieraEnTramoActual - totalNuevo
    return {
      unidadesExtra,
      precioKgNext: nextTramo.precio_unidad / formato.kg,
      ahorro,
    }
  })()

  function changeFormato(idx: number) {
    setFormatoIdx(idx)
    setQty(1)
  }

  function changeQty(val: number) {
    setQty(Math.max(1, val))
  }

  const waText = `Quiero cotizar ${qty} x ${formato.etiqueta} de ${producto.nombre}`

  return (
    <div className="bg-paper-2 flex flex-col">

      {/* Selector de formato */}
      <div className="flex border-b border-ink/10">
        {producto.formatos.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => changeFormato(i)}
            className={`flex-1 font-mono text-[10px] tracking-[0.15em] uppercase py-3 px-4 transition-colors ${
              i === formatoIdx
                ? 'bg-ink text-paper'
                : 'text-ink/50 hover:text-ink'
            }`}
          >
            {f.etiqueta}
          </button>
        ))}
      </div>

      {/* Imagen */}
      <div className="aspect-square overflow-hidden bg-[#e8e6e2]">
        <Image
          src={formato.img}
          alt={formato.etiqueta}
          width={400}
          height={400}
          className="w-full h-full object-contain p-8"
        />
      </div>

      {/* Contenido */}
      <div className="p-6 flex flex-col gap-4 flex-1">

        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] text-red uppercase mb-1">{producto.nombre}</p>
          <h3 className="font-heading text-[22px] font-medium m-0">{formato.etiqueta}</h3>
        </div>

        {/* Precio principal */}
        <div className="bg-paper px-4 py-3 border border-ink/10">
          <div className="font-heading text-[30px] font-medium leading-none">{fmt(precioUnit)}</div>
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 mt-1">
            por unidad · {fmt(precioKg)}/kg
          </div>
        </div>

        {/* Tramos */}
        <div className="flex flex-col gap-[3px]">
          {formato.tramos.map((t) => {
            const activo = t === tramo
            return (
              <div
                key={t.min}
                className={`flex justify-between px-3 py-[6px] font-mono text-[10px] tracking-[0.1em] transition-colors ${
                  activo ? 'bg-ink text-paper' : 'text-ink/40'
                }`}
              >
                <span>
                  {t.max === null ? `${t.min}+ unidades` : `${t.min}–${t.max} unidades`}
                </span>
                <span>{fmt(t.precio_unidad)}/u · {fmt(t.precio_unidad / formato.kg)}/kg</span>
              </div>
            )
          })}
        </div>

        {/* Cantidad */}
        <div>
          <label className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/60 block mb-2">
            Cantidad
          </label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => changeQty(qty - 1)}
              className="w-10 h-10 border border-ink/20 font-mono text-[18px] flex items-center justify-center hover:border-ink transition-colors"
            >
              −
            </button>
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => changeQty(parseInt(e.target.value) || 1)}
              className="w-16 text-center border border-ink/20 font-mono text-[16px] py-2 outline-none focus:border-ink bg-paper"
            />
            <button
              type="button"
              onClick={() => changeQty(qty + 1)}
              className="w-10 h-10 border border-ink/20 font-mono text-[18px] flex items-center justify-center hover:border-ink transition-colors"
            >
              +
            </button>
            <span className="font-mono text-[10px] text-ink/40 uppercase tracking-[0.1em] ml-1">
              unidades
            </span>
          </div>
        </div>

        {/* Total */}
        <div className="flex items-baseline justify-between border-t border-ink/10 pt-3">
          <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/50">Total estimado</span>
          <span className="font-heading text-[24px] font-medium">{fmt(total)}</span>
        </div>

        {/* Nudge */}
        {nudge && (
          <div className="bg-[#f0fdf4] border-l-2 border-[#16a34a] px-3 py-[10px] text-[12px] font-body text-[#15803d] leading-[1.55]">
            Comprando {nudge.unidadesExtra} unidad{nudge.unidadesExtra > 1 ? 'es' : ''} más, el precio baja a{' '}
            <strong>{fmt(nudge.precioKgNext)}/kg</strong> en todo el pedido
            (ahorro de <strong>{fmt(nudge.ahorro)}</strong>).
          </div>
        )}

        {/* CTA */}
        <a
          href={`${WA_NUMBER}?text=${encodeURIComponent(waText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[14px] text-center hover:opacity-90 transition-opacity mt-auto"
        >
          Cotizar este pedido →
        </a>

      </div>
    </div>
  )
}
