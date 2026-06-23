import { createPreferenceWithOrder } from '@/services/mercado-pago'
import type { CartItem, ShippingData } from '@/types'

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const items: CartItem[]    = body?.items
    const shippingData: ShippingData = body?.shippingData

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'No hay productos en la bolsa' }, { status: 400 })
    }

    if (!shippingData?.nombre || !shippingData?.email) {
      return Response.json({ error: 'Datos de envío incompletos' }, { status: 400 })
    }

    const preference = await createPreferenceWithOrder(items, shippingData)
    return Response.json(preference)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado'
    console.error('[api/mercadopago/create-preference]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
