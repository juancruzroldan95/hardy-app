'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { ProductoGranel } from '@/consts/granel'

function fmt(n: number) {
  return n.toLocaleString('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 })
}

export default function ProductCard({ producto }: { producto: ProductoGranel }) {
  const [formatoIdx, setFormatoIdx] = useState(0)

  const formato    = producto.formatos[formatoIdx]
  const tramoBase  = formato.tramos[0]
  const precioUnit = tramoBase.precio_unidad
  const precioKg   = precioUnit / formato.kg

  // ID del producto en tienda derivado del id de granel
  // mani → balde-45 / balde-23 ; miel → miel-balde-6 / miel-balde-30
  const tiendaId = (() => {
    const ids: Record<string, string> = {
      mani_4_5kg: 'balde-45',
      mani_23kg:  'balde-23',
      miel_6kg:   'miel-balde-6',
      miel_30kg:  'miel-balde-30',
    }
    return ids[formato.id] ?? null
  })()

  return (
    <div className="bg-paper-2 flex flex-col">

      {/* Selector de formato */}
      <div className="flex border-b border-ink/10">
        {producto.formatos.map((f, i) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFormatoIdx(i)}
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

        {/* Precio público (fijo = tramo 1-4) */}
        <div className="bg-paper px-4 py-3 border border-ink/10">
          <div className="font-heading text-[30px] font-medium leading-none">{fmt(precioUnit)}</div>
          <div className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 mt-1">
            por unidad · {fmt(precioKg)}/kg
          </div>
        </div>

        {/* Tramos — tramo 0 con precios, tramos 1+ con % */}
        <div className="flex flex-col gap-[3px]">
          {formato.tramos.map((t, idx) => {
            const activo = idx === 0
            const pct = Math.round((1 - t.precio_unidad / tramoBase.precio_unidad) * 100)
            return (
              <div
                key={t.min}
                className={`flex justify-between px-3 py-[6px] font-mono text-[10px] tracking-[0.1em] ${
                  activo ? 'bg-ink text-paper' : 'text-ink/40'
                }`}
              >
                <span>
                  {t.max === null ? `${t.min}+ unidades` : `${t.min}–${t.max} unidades`}
                </span>
                <span>
                  {idx === 0
                    ? `${fmt(t.precio_unidad)}/u · ${fmt(t.precio_unidad / formato.kg)}/kg`
                    : `-${pct}% sobre el $/kg`}
                </span>
              </div>
            )
          })}
        </div>

        {/* Nota de portal */}
        <p className="font-mono text-[9px] tracking-[0.08em] text-ink/45 leading-[1.6] m-0">
          ¿Compra recurrente o pedido especial?{' '}
          <a href="/mayoristas#solicitar" className="underline text-ink/60 hover:text-ink transition-colors">
            En el Portal Cliente
          </a>{' '}
          accedés a precios preferenciales adicionales, condiciones de pago y envío programado.
        </p>

        {/* CTA — comprar en tienda (1-4 u.) */}
        {tiendaId && (
          <Link
            href={`/tienda?producto=${tiendaId}`}
            className="bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[14px] text-center hover:opacity-90 transition-opacity mt-auto"
          >
            Comprar en tienda →
          </Link>
        )}

      </div>
    </div>
  )
}
