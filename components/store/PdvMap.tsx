'use client'

import { useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import { PUNTOS_DE_VENTA, PDV_TIPO_LABEL, PDV_TIPO_COLOR } from '@/consts/pdv'
import type { PdvTipo } from '@/consts/pdv'

// Tipos presentes en los datos, en orden, para la leyenda
const TIPOS_EN_USO = Array.from(
  new Set(PUNTOS_DE_VENTA.map((p) => p.tipo)),
) as PdvTipo[]

export default function PdvMap() {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    let map: import('leaflet').Map | null = null
    let cancelled = false

    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled || !el) return

      map = L.map(el, {
        scrollWheelZoom: false,
        attributionControl: true,
      })

      // Tiles de OpenStreetMap (sin API key) — el filtro grayscale en globals.css
      // (.leaflet-tile-pane) les da el estilo neutro/minimalista de la marca.
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map)

      const points: [number, number][] = []
      for (const pdv of PUNTOS_DE_VENTA) {
        points.push([pdv.lat, pdv.lng])
        const color = PDV_TIPO_COLOR[pdv.tipo]
        const marker = L.circleMarker([pdv.lat, pdv.lng], {
          radius: 7,
          color: '#ffffff',
          weight: 2,
          fillColor: color,
          fillOpacity: 1,
        }).addTo(map!)

        const popup = `
          <div style="font-family: system-ui, sans-serif; min-width: 160px">
            <div style="font-weight: 700; font-size: 13px; color: #1a1a1a; margin-bottom: 4px">${escapeHtml(pdv.nombre)}</div>
            <div style="font-size: 12px; color: #555; line-height: 1.4">${escapeHtml(pdv.direccion)}<br/>${escapeHtml(pdv.ciudad)}</div>
            <div style="margin-top: 6px; display: inline-block; font-size: 9px; letter-spacing: 0.08em; text-transform: uppercase; color: #fff; background: ${color}; padding: 2px 7px; border-radius: 2px">${PDV_TIPO_LABEL[pdv.tipo]}</div>
          </div>`
        marker.bindPopup(popup)
      }

      // Encuadre que abarca de Ushuaia a Formosa
      const bounds = L.latLngBounds(points)
      map.fitBounds(bounds, { padding: [40, 40] })

      // Recalcular tamaño una vez montado (evita tiles grises si el contenedor
      // todavía no tenía su tamaño final al inicializar)
      map.whenReady(() => map?.invalidateSize())
      setTimeout(() => map?.invalidateSize(), 250)
    })()

    return () => {
      cancelled = true
      if (map) {
        map.remove()
        map = null
      }
    }
  }, [])

  return (
    <div>
      <div
        ref={containerRef}
        className="w-full h-[520px] max-md:h-[420px] bg-paper-2 border border-ink/10"
        style={{ zIndex: 0 }}
      />
      {/* Leyenda por tipo de comercio */}
      <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2">
        {TIPOS_EN_USO.map((tipo) => (
          <span key={tipo} className="flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#666]">
            <span
              className="w-[10px] h-[10px] rounded-full border border-white shrink-0"
              style={{ background: PDV_TIPO_COLOR[tipo] }}
            />
            {PDV_TIPO_LABEL[tipo]}
          </span>
        ))}
      </div>
    </div>
  )
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
