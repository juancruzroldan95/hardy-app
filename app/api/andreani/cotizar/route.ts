import { cotizarEnvio, calcularPesoKg } from '@/services/andreani'
import type { CartItem } from '@/types'

export async function POST(request: Request): Promise<Response> {
  try {
    const body = await request.json()
    const { cpDestino, items }: { cpDestino: string; items: CartItem[] } = body

    if (!cpDestino || cpDestino.length < 4) {
      return Response.json({ error: 'Código postal inválido' }, { status: 400 })
    }
    if (!Array.isArray(items) || items.length === 0) {
      return Response.json({ error: 'Sin productos en el carrito' }, { status: 400 })
    }

    const totalUnidades = items.reduce((s, i) => s + i.qty, 0)
    const valorDeclarado = items.reduce((s, i) => s + i.subtotal, 0)
    const pesoKg = calcularPesoKg(totalUnidades)

    const cotizacion = await cotizarEnvio({ cpDestino, pesoKg, valorDeclarado })

    return Response.json(cotizacion)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado'
    console.error('[api/andreani/cotizar]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
