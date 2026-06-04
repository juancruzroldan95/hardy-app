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

export async function createPreference(items: MPItem[]): Promise<MPPreference> {
  const preferenceItems = items.map((item) => ({
    title: item.name,
    quantity: Number(item.qty),
    unit_price: Number(item.price),
    currency_id: 'ARS',
  }))

  const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      items: preferenceItems,
      back_urls: {
        success: `${BASE_URL}/?payment=success`,
        failure: `${BASE_URL}/?payment=failure`,
        pending: `${BASE_URL}/?payment=pending`,
      },
      auto_return: 'approved',
      external_reference: `hardy-${Date.now()}`,
    }),
  })

  if (!response.ok) {
    const detail = await response.json()
    throw new Error(`MercadoPago error: ${JSON.stringify(detail)}`)
  }

  const data = await response.json()
  return {
    init_point: data.init_point,
    sandbox_init_point: data.sandbox_init_point,
  }
}
