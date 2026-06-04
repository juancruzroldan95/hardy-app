import { Resend } from 'resend'
import type { OrderItem } from '@/db/schema'
import { formatARS } from '@/consts/products'

const resend = new Resend(process.env.RESEND_API_KEY || "re_REPLACE")

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

// ─── Helpers re-used across templates ────────────────────────────────────────

const ORDER_STATUS_LABELS: Record<string, string> = {
  pending:   'Pendiente',
  confirmed: 'Confirmado',
  preparing: 'En preparación',
  shipped:   'En camino',
  delivered: 'Entregado',
  cancelled: 'Cancelado',
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  pending:   '#888',
  confirmed: '#2d6a35',
  preparing: '#b35c00',
  shipped:   '#1a5fa6',
  delivered: '#2d6a35',
  cancelled: '#C0171E',
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

// ─── Order status update email ────────────────────────────────────────────────

export interface OrderStatusEmailData {
  orderId:     string
  orderDate:   Date
  clientName:  string
  clientEmail: string
  newStatus:   string
  totalArs:    number
}

export async function sendOrderStatusUpdate(data: OrderStatusEmailData): Promise<void> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_REPLACE')) {
    console.warn('[email] RESEND_API_KEY not configured — skipping status email')
    return
  }

  const statusLabel = ORDER_STATUS_LABELS[data.newStatus] ?? data.newStatus
  const statusColor = ORDER_STATUS_COLORS[data.newStatus] ?? '#888'
  const ref         = data.orderId.slice(-8).toUpperCase()

  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1efe9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1efe9;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr>
        <td style="background:#1a1a1a;padding:28px 36px;">
          <span style="font-family:'Courier New',monospace;font-size:22px;font-weight:900;letter-spacing:0.08em;color:#fafaf8;text-transform:uppercase;">HARDY</span>
          <br/>
          <span style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.25em;color:#C0171E;text-transform:uppercase;">── Actualización de pedido</span>
        </td>
      </tr>
      <tr>
        <td style="background:#fafaf8;padding:36px;">
          <p style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.2em;color:#C0171E;text-transform:uppercase;margin:0 0 8px 0;">── Estado actualizado</p>
          <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:600;color:#1a1a1a;margin:0 0 4px 0;">Tu pedido fue actualizado.</h1>
          <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#777;margin:0 0 28px 0;">
            Ref. #${ref} · ${new Date(data.orderDate).toLocaleDateString('es-AR', { day: '2-digit', month: 'long', year: 'numeric' })}
          </p>
          <div style="background:#1a1a1a;padding:20px 24px;margin-bottom:28px;display:flex;align-items:center;gap:16px;">
            <table width="100%"><tr>
              <td style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(250,250,248,0.5);">Estado</td>
              <td style="text-align:right;">
                <span style="font-family:'Courier New',monospace;font-size:13px;font-weight:700;color:${statusColor};letter-spacing:0.1em;text-transform:uppercase;">${statusLabel}</span>
              </td>
            </tr></table>
          </div>
          <table width="100%" style="border:1px solid #e8e6e2;margin-bottom:28px;">
            <tr>
              <td style="padding:10px 14px;font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#999;width:40%;background:#f1efe9;">Total del pedido</td>
              <td style="padding:10px 14px;font-family:Georgia,serif;font-size:16px;color:#1a1a1a;font-weight:600;">${formatARS(data.totalArs)}</td>
            </tr>
          </table>
          <div style="background:#f1efe9;border-left:3px solid #e8e6e2;padding:16px 20px;margin-bottom:28px;">
            <p style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#555;margin:0;line-height:1.6;">
              ${data.newStatus === 'shipped'
                ? 'Tu pedido está en camino. Te contactaremos para coordinar la entrega.'
                : data.newStatus === 'delivered'
                  ? '¡Tu pedido fue entregado! Gracias por elegirnos.'
                  : data.newStatus === 'confirmed'
                    ? 'Confirmamos tu pedido. Pronto comenzamos a prepararlo.'
                    : data.newStatus === 'cancelled'
                      ? 'Tu pedido fue cancelado. Comunicate con nosotros si tenés alguna consulta.'
                      : 'Actualizamos el estado de tu pedido. Ante cualquier consulta, escribinos por WhatsApp.'
              }
            </p>
          </div>
        </td>
      </tr>
      <tr>
        <td style="padding:20px 36px;background:#f1efe9;border-top:1px solid #e0ddd8;">
          <p style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#aaa;margin:0;">
            HARDY · Alimentá tu instinto · hardyfoods.com.ar
          </p>
        </td>
      </tr>
    </table>
  </td></tr>
</table>
</body>
</html>`

  await resend.emails.send({
    from:    FROM_ADDRESS,
    to:      data.clientEmail,
    subject: `Hardy — Pedido #${ref}: ${statusLabel}`,
    html,
  })
}

// ─── Scheduled alert reminder email (to admins) ───────────────────────────────

export interface AlertReminderData {
  profileId:   string
  clientName:  string
  alertTipo:   string
  mensaje:     string
  scheduledFor: Date
}

const ALERT_TIPO_LABELS: Record<string, string> = {
  reorder:    'Recompra',
  payment:    'Pago',
  inactivity: 'Inactividad',
  custom:     'Nota',
}

export async function sendAlertReminder(alerts: AlertReminderData[]): Promise<void> {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_REPLACE')) {
    console.warn('[email] RESEND_API_KEY not configured — skipping alert reminder')
    return
  }

  const rows = alerts.map((a) => `
    <tr style="border-bottom:1px solid #e8e6e2;">
      <td style="padding:10px 12px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#1a1a1a;font-weight:600;">${a.clientName}</td>
      <td style="padding:10px 12px;font-family:'Courier New',monospace;font-size:10px;text-transform:uppercase;color:#C0171E;">${ALERT_TIPO_LABELS[a.alertTipo] ?? a.alertTipo}</td>
      <td style="padding:10px 12px;font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#555;">${a.mensaje}</td>
    </tr>`
  ).join('')

  const html = `<!DOCTYPE html>
<html lang="es"><head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f1efe9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1efe9;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#1a1a1a;padding:28px 36px;">
        <span style="font-family:'Courier New',monospace;font-size:22px;font-weight:900;letter-spacing:0.08em;color:#fafaf8;text-transform:uppercase;">HARDY</span>
        <br/><span style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.25em;color:#C0171E;text-transform:uppercase;">── Alertas del día</span>
      </td></tr>
      <tr><td style="background:#fafaf8;padding:36px;">
        <p style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.2em;color:#C0171E;text-transform:uppercase;margin:0 0 8px 0;">── Recordatorio CRM</p>
        <h1 style="font-family:Georgia,serif;font-size:24px;font-weight:600;color:#1a1a1a;margin:0 0 24px 0;">Tenés ${alerts.length} alerta${alerts.length > 1 ? 's' : ''} para hoy.</h1>
        <table width="100%" style="border-top:2px solid #1a1a1a;">
          <thead><tr>
            <th style="padding:8px 12px;font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#999;text-align:left;font-weight:400;">Cliente</th>
            <th style="padding:8px 12px;font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#999;text-align:left;font-weight:400;">Tipo</th>
            <th style="padding:8px 12px;font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#999;text-align:left;font-weight:400;">Mensaje</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div style="margin-top:24px;background:#f1efe9;border-left:3px solid #e8e6e2;padding:14px 18px;">
          <p style="font-family:Helvetica,Arial,sans-serif;font-size:13px;color:#555;margin:0;line-height:1.6;">
            Accedé al portal para gestionar estas alertas: <strong>hardyfoods.com.ar/portal/admin/clientes</strong>
          </p>
        </div>
      </td></tr>
      <tr><td style="padding:20px 36px;background:#f1efe9;border-top:1px solid #e0ddd8;">
        <p style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#aaa;margin:0;">HARDY · Portal Admin</p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`

  await resend.emails.send({
    from:    FROM_ADDRESS,
    to:      WAREHOUSE_EMAIL,
    subject: `Hardy CRM — ${alerts.length} alerta${alerts.length > 1 ? 's' : ''} programada${alerts.length > 1 ? 's' : ''} para hoy`,
    html,
  })
}
