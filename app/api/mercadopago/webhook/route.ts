import { updateOrderPaymentStatus } from '@/repository/mutations/storeOrders'
import { getStoreOrderById } from '@/repository/queries/storeOrders'

/**
 * Webhook de Mercado Pago.
 *
 * MP envía un POST cuando cambia el estado de un pago.
 * La firma HMAC se valida usando MERCADOPAGO_WEBHOOK_SECRET (configurar en el panel MP).
 *
 * Docs: https://www.mercadopago.com.ar/developers/es/docs/your-integrations/notifications/webhooks
 */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hardy.ar'

async function verifySignature(request: Request, rawBody: string): Promise<boolean> {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  if (!secret) {
    // Si no hay secret configurado, aceptamos (development / onboarding)
    console.warn('[webhook/mp] MERCADOPAGO_WEBHOOK_SECRET no configurado — saltando verificación de firma')
    return true
  }

  const xSignature    = request.headers.get('x-signature')
  const xRequestId    = request.headers.get('x-request-id')
  const urlSearchParams = new URL(request.url).searchParams
  const dataId        = urlSearchParams.get('data.id')

  if (!xSignature) return false

  // Formato: "ts=...,v1=..."
  const parts = Object.fromEntries(
    xSignature.split(',').map((p) => p.split('=') as [string, string])
  )
  const ts      = parts['ts']
  const v1Hash  = parts['v1']

  if (!ts || !v1Hash) return false

  // Mensaje a firmar: "id:{data_id};request-id:{x_request_id};ts:{ts};"
  const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`

  const encoder  = new TextEncoder()
  const keyData  = encoder.encode(secret)
  const msgData  = encoder.encode(manifest)

  const cryptoKey = await crypto.subtle.importKey(
    'raw', keyData, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, msgData)
  const signatureHex    = Array.from(new Uint8Array(signatureBuffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')

  return signatureHex === v1Hash
}

export async function POST(request: Request): Promise<Response> {
  try {
    const rawBody = await request.text()
    const isValid = await verifySignature(request, rawBody)

    if (!isValid) {
      return Response.json({ error: 'Firma inválida' }, { status: 401 })
    }

    const event = JSON.parse(rawBody)

    // Solo procesamos eventos de pagos
    if (event?.type !== 'payment') {
      return Response.json({ ok: true })
    }

    const paymentId = String(event?.data?.id ?? '')
    if (!paymentId) {
      return Response.json({ ok: true })
    }

    // Consultar el pago a la API de MP para obtener el estado real
    const mpRes = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
      headers: { Authorization: `Bearer ${process.env.MERCADOPAGO_ACCESS_TOKEN}` },
    })

    if (!mpRes.ok) {
      console.error('[webhook/mp] No se pudo obtener el pago de MP:', paymentId)
      return Response.json({ ok: true }) // Devolver 200 igual para que MP no reintente
    }

    const payment = await mpRes.json()
    const externalRef = String(payment?.external_reference ?? '')
    const status      = String(payment?.status ?? '')

    if (!externalRef) {
      return Response.json({ ok: true })
    }

    // Verificar que la orden existe en DB y pertenece al canal B2C
    const order = await getStoreOrderById(externalRef)
    if (!order || order.channel !== 'b2c') {
      return Response.json({ ok: true })
    }

    if (status === 'approved') {
      await updateOrderPaymentStatus(externalRef, 'paid', paymentId)

      // Crear el envío en Andreani de forma asíncrona
      // (llamada interna al route handler dedicado)
      fetch(`${SITE_URL}/api/andreani/orden`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ orderId: externalRef }),
      }).catch((err) => {
        console.error('[webhook/mp] Error disparando orden Andreani:', err)
      })
    } else if (status === 'rejected' || status === 'cancelled') {
      await updateOrderPaymentStatus(externalRef, 'failed', paymentId)
    }

    return Response.json({ ok: true })
  } catch (error) {
    console.error('[webhook/mp]', error)
    // Siempre devolver 200 para que MP no reintente indefinidamente
    return Response.json({ ok: true })
  }
}
