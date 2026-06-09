'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'

const STORAGE_KEY = 'hardy-mayorista-banner-dismissed'

export default function MayoristasBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const dismissed = sessionStorage.getItem(STORAGE_KEY)
    if (dismissed) return
    const timer = setTimeout(() => setVisible(true), 20000)
    return () => clearTimeout(timer)
  }, [])

  function dismiss() {
    sessionStorage.setItem(STORAGE_KEY, '1')
    setVisible(false)
  }

  return (
    <div
      className={`fixed bottom-6 left-6 z-[80] w-[360px] max-w-[calc(100vw-2rem)] bg-ink text-paper border-t-[3px] border-red shadow-[0_8px_30px_rgba(0,0,0,0.35)] transition-all duration-500 max-md:left-4 max-md:bottom-[92px] ${
        visible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0 pointer-events-none'
      }`}
      aria-hidden={!visible}
    >
      {/* Close */}
      <button
        onClick={dismiss}
        className="absolute top-3 right-3 text-paper/40 hover:text-paper transition-colors p-1"
        aria-label="Cerrar"
      >
        <X size={15} />
      </button>

      <div className="px-6 py-5 max-md:px-5 max-md:py-4">
        <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-red mb-3 max-md:mb-2">
          ── ¿Comprás para revender?
        </p>
        <p className="font-heading text-[19px] font-medium leading-[1.2] text-paper mb-2 pr-4 max-md:text-[16px] max-md:mb-3">
          Accedé a precios mayoristas.
        </p>
        <p className="font-body text-[12px] text-paper/55 leading-[1.6] mb-5 max-md:hidden">
          Lista de precios exclusiva por volumen para revendedores, gastronómicos y distribuidores.
        </p>
        <Link
          href="/mayoristas#solicitar"
          className="inline-flex items-center gap-2 bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-5 py-[11px] hover:opacity-90 transition-opacity max-md:py-[9px]"
          onClick={dismiss}
        >
          Ver precios →
        </Link>
      </div>
    </div>
  )
}
