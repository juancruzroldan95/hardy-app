import { crearOrden, calcularPesoKg } from '@/services/andreani'
import { updateOrderAndreani } from '@/repository/mutations/storeOrders'
import { getStoreOrderById } from '@/repository/queries/storeOrders'
import { sendStoreOrderConfirmation } from '@/services/resend'

export async function POST(request: Request): Promise<Response> {
  try {
    const { orderId }: { orderId: string } = await request.json()

    if (!orderId) {
      return Response.json({ error: 'orderId requerido' }, { status: 400 })
    }

    const order = await getStoreOrderById(orderId)
    if (!order) {
      return Response.json({ error: 'Orden no encontrada' }, { status: 404 })
    }

    if (!order.guestName || !order.guestEmail || !order.shippingAddress || !order.shippingCp) {
      return Response.json({ error: 'La orden no tiene datos de envío completos' }, { status: 400 })
    }

    // Parsear dirección (formato: "Calle Número, Ciudad, Provincia")
    const [calleNumero, ciudad = '', provincia = ''] = order.shippingAddress.split(',').map((s) => s.trim())
    const [calle, ...numeroParts] = calleNumero.split(' ')
    const numero = numeroParts.join(' ') || 'S/N'

    const totalUnidades = order.items.reduce((s, i) => s + i.qty, 0)
    const valorDeclarado = Number(order.totalArs) - Number(order.shippingCost ?? 0)
    const pesoKg = calcularPesoKg(totalUnidades)

    const { nroEnvio } = await crearOrden({
      nroPedido: order.id,
      destinatario: {
        nombre:   order.guestName,
        email:    order.guestEmail,
        telefono: order.guestPhone ?? '',
        calle,
        numero,
        cp:       order.shippingCp,
        ciudad,
        provincia,
      },
      bultos: [{ pesoKg, valorDeclarado }],
    })

    await updateOrderAndreani(order.id, nroEnvio)

    // Enviar email de confirmación con tracking
    await sendStoreOrderConfirmation({
      to:            order.guestEmail,
      orderNumber:   order.id.slice(-8).toUpperCase(),
      guestName:     order.guestName,
      items:         order.items.map((i) => ({
        productName:  i.productName,
        variant:      i.variant,
        size:         i.size,
        qty:          i.qty,
        subtotalArs:  Number(i.subtotalArs),
      })),
      shippingAddress: order.shippingAddress,
      shippingCp:      order.shippingCp,
      nroEnvio,
      total:        Number(order.totalArs),
      shippingCost: Number(order.shippingCost ?? 0),
    })

    return Response.json({ nroEnvio })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado'
    console.error('[api/andreani/orden]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
