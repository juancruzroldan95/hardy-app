/**
 * Helpers de eventos del Meta Pixel.
 *
 * Disparan eventos estándar de e-commerce que Meta usa para optimizar la pauta
 * por conversiones (no solo por clicks) y para armar públicos de retargeting.
 *
 * Seguros en SSR: si no hay `window.fbq` (píxel no cargado o sin ID), no hacen nada.
 */

type PixelParams = Record<string, unknown>

function track(event: string, params?: PixelParams) {
  if (typeof window === 'undefined') return
  window.fbq?.('track', event, params)
}

const CURRENCY = 'ARS'

export function trackViewContent(p: { value: number; contentName?: string; contentIds?: string[] }) {
  track('ViewContent', {
    currency: CURRENCY,
    value: p.value,
    content_name: p.contentName,
    content_ids: p.contentIds,
    content_type: 'product',
  })
}

export function trackAddToCart(p: { value: number; contentName?: string; contentIds?: string[] }) {
  track('AddToCart', {
    currency: CURRENCY,
    value: p.value,
    content_name: p.contentName,
    content_ids: p.contentIds,
    content_type: 'product',
  })
}

export function trackInitiateCheckout(p: { value: number; numItems: number; contentIds?: string[] }) {
  track('InitiateCheckout', {
    currency: CURRENCY,
    value: p.value,
    num_items: p.numItems,
    content_ids: p.contentIds,
    content_type: 'product',
  })
}

export function trackPurchase(p: { value: number; contentIds?: string[] }) {
  track('Purchase', {
    currency: CURRENCY,
    value: p.value,
    content_ids: p.contentIds,
    content_type: 'product',
  })
}
