import { createStoreOrder } from '@/repository/mutations/storeOrders'
import type { CartItem, ShippingData } from '@/types'

export interface MPItem {
  name: string
  qty: number
  price: number
}

export interface MPPreference {
  init_point: string
  sandbox_init_point: string
}

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hardy.ar'

// ─── createPreferenceWithOrder ────────────────────────────────────────────────
// Usado por la tienda B2C. Crea la orden en DB y luego la preferencia en MP.

export async function createPreferenceWithOrder(
  items: CartItem[],
  shippingData: ShippingData
): Promise<MPPreference> {
  const productosTotal = items.reduce((s, i) => s + i.subtotal, 0)
  const totalArs       = productosTotal + shippingData.shippingCost

  // 1. Crear orden en DB antes de ir a MP (para tener el ID como external_reference)
  const orderId = await createStoreOrder({
    items: items.map((i) => ({
      productId:    i.id,
      productName:  i.name,
      variant:      i.variant,
      size:         i.size,
      qty:          i.qty,
      unitPriceArs: i.price,
    })),
    shippingData,
    shippingCost: shippingData.shippingCost,
    totalArs,
  })

  // 2. Armar ítems de MP (productos + costo de envío como ítem separado)
  const mpItems = [
    ...items.map((i) => ({
      title:      `${i.name} · ${i.variant} · ${i.size}`,
      quantity:   Number(i.qty),
      unit_price: Number(i.price),
      currency_id: 'ARS',
    })),
    ...(shippingData.shippingCost > 0
      ? [{
          title:      `Envío Andreani — ${shippingData.servicio}`,
          quantity:   1,
          unit_price: shippingData.shippingCost,
          currency_id: 'ARS',
        }]
      : []),
  ]

  // 3. Crear preferencia en MP
  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: mpItems,
      payer: {
        name:  shippingData.nombre,
        email: shippingData.email,
        phone: { number: shippingData.telefono },
      },
      back_urls: {
        success: `${BASE_URL}/gracias?payment=success&value=${totalArs}&order_id=${orderId}`,
        failure: `${BASE_URL}/gracias?payment=failure&order_id=${orderId}`,
        pending: `${BASE_URL}/gracias?payment=pending&order_id=${orderId}`,
      },
      auto_return:        'approved',
      external_reference: orderId,
      notification_url:   `${BASE_URL}/api/mercadopago/webhook`,
    }),
  })

  if (!response.ok) {
    const detail = await response.json()
    throw new Error(`MercadoPago error: ${JSON.stringify(detail)}`)
  }

  const data = await response.json()
  return {
    init_point:         data.init_point,
    sandbox_init_point: data.sandbox_init_point,
  }
}

// ─── createPreference (legacy — mantener para B2B si se usara en otro lugar) ──

export async function createPreference(items: MPItem[]): Promise<MPPreference> {
  const preferenceItems = items.map((item) => ({
    title:      item.name,
    quantity:   Number(item.qty),
    unit_price: Number(item.price),
    currency_id: 'ARS',
  }))

  const orderTotal = items.reduce((sum, item) => sum + Number(item.price) * Number(item.qty), 0)

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: preferenceItems,
      back_urls: {
        success: `${BASE_URL}/gracias?payment=success&value=${orderTotal}`,
        failure: `${BASE_URL}/gracias?payment=failure`,
        pending: `${BASE_URL}/gracias?payment=pending`,
      },
      auto_return:        'approved',
      external_reference: `hardy-${Date.now()}`,
    }),
  })

  if (!response.ok) {
    const detail = await response.json()
    throw new Error(`MercadoPago error: ${JSON.stringify(detail)}`)
  }

  const data = await response.json()
  return {
    init_point:         data.init_point,
    sandbox_init_point: data.sandbox_init_point,
  }
}
