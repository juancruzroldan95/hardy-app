import { createPreference } from '@/lib/mercadopago'
import type { MPItem } from '@/lib/mercadopago'

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const items: MPItem[] = body?.items

    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'No hay productos en la bolsa' }, { status: 400 })
    }

    const preference = await createPreference(items)
    return Response.json(preference)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado'
    return Response.json({ error: message }, { status: 500 })
  }
}
