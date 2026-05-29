import { Resend } from 'resend'
import type { OrderItem } from '@/drizzle/schema'
import { formatARS } from '@/lib/products'

const resend = new Resend(process.env.RESEND_API_KEY)

// Hardy warehouse email that receives copies of all orders
const WAREHOUSE_EMAIL = process.env.HARDY_WAREHOUSE_EMAIL ?? 'guido.giambruni@gmail.com'

// From address — requires a verified domain in Resend.
// Use onboarding@resend.dev for testing until you verify hardyfoods.com.ar
const FROM_ADDRESS = 'Hardy <onboarding@resend.dev>'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface OrderEmailData {
  orderId:        string
  orderDate:      Date
  clientName:     string
  clientEmail:    string
  shippingMethod: string
  paymentMethod:  string
  notes:          string | null
  totalArs:       number
  items:          Pick<OrderItem, 'productName' | 'variant' | 'size' | 'qty' | 'unitPriceArs' | 'subtotalArs'>[]
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const SHIPPING_LABELS: Record<string, string> = {
  coordinar_whatsapp: 'Coordinar por WhatsApp',
  andreani:           'Andreani',
  oca:                'OCA',
  retiro_deposito:    'Retiro en depósito',
}

const PAYMENT_LABELS: Record<string, string> = {
  transferencia: 'Transferencia bancaria',
  efectivo:      'Efectivo al recibir',
  credito30:     'Crédito a 30 días',
  credito60:     'Crédito a 60 días',
  cheque:        'Cheque',
}

function formatDate(d: Date) {
  return d.toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })
}

// ─── HTML Template ────────────────────────────────────────────────────────────

function buildOrderHtml(data: OrderEmailData, isWarehouseCopy: boolean): string {
  const { orderId, orderDate, clientName, clientEmail, shippingMethod, paymentMethod, notes, totalArs, items } = data

  const itemRows = items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #e8e6e2;">
      <td style="padding: 10px 0; font-family: 'Courier New', monospace; font-size: 13px; color: #1a1a1a;">
        ${item.productName} · ${item.variant} · ${item.size}
      </td>
      <td style="padding: 10px 0; font-family: 'Courier New', monospace; font-size: 13px; text-align: center; color: #555;">
        ${item.qty}
      </td>
      <td style="padding: 10px 0; font-family: 'Courier New', monospace; font-size: 13px; text-align: right; color: #555;">
        ${formatARS(Number(item.unitPriceArs))}
      </td>
      <td style="padding: 10px 0; font-family: 'Courier New', monospace; font-size: 13px; text-align: right; color: #1a1a1a; font-weight: 600;">
        ${formatARS(Number(item.subtotalArs))}
      </td>
    </tr>`
    )
    .join('')

  const subjectPrefix = isWarehouseCopy ? `[Nuevo pedido] ${clientName} — ` : ''

  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subjectPrefix}Pedido Hardy #${orderId.slice(-8).toUpperCase()}</title>
</head>
<body style="margin: 0; padding: 0; background: #f1efe9; font-family: 'Helvetica Neue', Arial, sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="background: #f1efe9; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="max-width: 600px; width: 100%;">

          <!-- Header -->
          <tr>
            <td style="background: #1a1a1a; padding: 28px 36px;">
              <span style="font-family: 'Courier New', monospace; font-size: 22px; font-weight: 900; letter-spacing: 0.08em; color: #fafaf8; text-transform: uppercase;">HARDY</span>
              <br />
              <span style="font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 0.25em; color: #C0171E; text-transform: uppercase;">
                ── Confirmación de pedido
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background: #fafaf8; padding: 36px;">

              ${isWarehouseCopy ? `
              <div style="background: #fdecea; border-left: 3px solid #C0171E; padding: 12px 16px; margin-bottom: 24px; font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 0.12em; color: #C0171E; text-transform: uppercase;">
                Copia interna — cliente: ${clientName} &lt;${clientEmail}&gt;
              </div>` : ''}

              <p style="font-family: 'Courier New', monospace; font-size: 11px; letter-spacing: 0.2em; color: #C0171E; text-transform: uppercase; margin: 0 0 8px 0;">
                ── Pedido recibido
              </p>
              <h1 style="font-family: Georgia, serif; font-size: 26px; font-weight: 600; color: #1a1a1a; margin: 0 0 4px 0; letter-spacing: -0.01em;">
                Tu pedido fue confirmado.
              </h1>
              <p style="font-family: Helvetica, Arial, sans-serif; font-size: 14px; color: #777; margin: 0 0 28px 0;">
                ${formatDate(orderDate)} · Ref. #${orderId.slice(-8).toUpperCase()}
              </p>

              <!-- Items table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="border-top: 2px solid #1a1a1a; margin-bottom: 0;">
                <thead>
                  <tr style="border-bottom: 1px solid #e8e6e2;">
                    <th style="padding: 8px 0; font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #999; text-align: left; font-weight: 400;">Producto</th>
                    <th style="padding: 8px 0; font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #999; text-align: center; font-weight: 400;">Cant.</th>
                    <th style="padding: 8px 0; font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #999; text-align: right; font-weight: 400;">Precio u.</th>
                    <th style="padding: 8px 0; font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #999; text-align: right; font-weight: 400;">Subtotal</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemRows}
                </tbody>
              </table>

              <!-- Total -->
              <div style="background: #1a1a1a; padding: 16px 20px; display: flex; justify-content: space-between; margin-bottom: 28px;">
                <table width="100%">
                  <tr>
                    <td style="font-family: 'Courier New', monospace; font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: rgba(250,250,248,0.5);">Total</td>
                    <td style="font-family: Georgia, serif; font-size: 22px; font-weight: 600; color: #fafaf8; text-align: right;">${formatARS(totalArs)}</td>
                  </tr>
                </table>
              </div>

              <!-- Info rows -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 28px; border: 1px solid #e8e6e2;">
                <tr style="border-bottom: 1px solid #e8e6e2;">
                  <td style="padding: 10px 14px; font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #999; width: 40%; background: #f1efe9;">Envío</td>
                  <td style="padding: 10px 14px; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #1a1a1a;">${SHIPPING_LABELS[shippingMethod] ?? shippingMethod}</td>
                </tr>
                <tr style="border-bottom: 1px solid #e8e6e2;">
                  <td style="padding: 10px 14px; font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #999; background: #f1efe9;">Pago</td>
                  <td style="padding: 10px 14px; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #1a1a1a;">${PAYMENT_LABELS[paymentMethod] ?? paymentMethod}</td>
                </tr>
                ${notes ? `
                <tr>
                  <td style="padding: 10px 14px; font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #999; background: #f1efe9;">Notas</td>
                  <td style="padding: 10px 14px; font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #555;">${notes}</td>
                </tr>` : ''}
              </table>

              ${!isWarehouseCopy ? `
              <div style="background: #f1efe9; border-left: 3px solid #e8e6e2; padding: 16px 20px; margin-bottom: 28px;">
                <p style="font-family: Helvetica, Arial, sans-serif; font-size: 13px; color: #555; margin: 0; line-height: 1.6;">
                  Nos ponemos en contacto para coordinar el envío y confirmar los datos de pago.
                  Cualquier consulta, escribinos por WhatsApp.
                </p>
              </div>
              ` : ''}

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding: 20px 36px; background: #f1efe9; border-top: 1px solid #e0ddd8;">
              <p style="font-family: 'Courier New', monospace; font-size: 9px; letter-spacing: 0.15em; text-transform: uppercase; color: #aaa; margin: 0;">
                HARDY · Alimentá tu instinto · hardyfoods.com.ar
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
}

// ─── Send order confirmation ──────────────────────────────────────────────────

export async function sendOrderConfirmation(data: OrderEmailData): Promise<void> {
  // Don't throw if Resend is not configured — just log and skip
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_REPLACE')) {
    console.warn('[email] RESEND_API_KEY not configured — skipping email send')
    return
  }

  const subject = `Hardy — Pedido recibido #${data.orderId.slice(-8).toUpperCase()}`

  await Promise.allSettled([
    // Client confirmation
    resend.emails.send({
      from:    FROM_ADDRESS,
      to:      data.clientEmail,
      subject,
      html:    buildOrderHtml(data, false),
    }),
    // Warehouse copy
    resend.emails.send({
      from:    FROM_ADDRESS,
      to:      WAREHOUSE_EMAIL,
      subject: `[Pedido] ${data.clientName} — ${subject}`,
      html:    buildOrderHtml(data, true),
    }),
  ])
}
