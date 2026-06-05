'use client'

import { useEffect } from 'react'
import { trackPurchase } from '@/consts/meta-pixel'

/**
 * Dispara el evento Purchase del Meta Pixel al llegar a la pantalla de éxito.
 * Usa sessionStorage para no duplicar el evento si el usuario recarga la página.
 */
export default function PurchaseTracker({
  value,
  dedupeKey,
}: {
  value: number
  dedupeKey?: string
}) {
  useEffect(() => {
    const key = `hardy_purchase_${dedupeKey || String(value)}`
    if (sessionStorage.getItem(key)) return
    sessionStorage.setItem(key, '1')
    trackPurchase({ value })
  }, [value, dedupeKey])

  return null
}
