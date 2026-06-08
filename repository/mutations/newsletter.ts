'use server'

import { db } from '@/db'
import { newsletterSubscribers } from '@/db/schema'
import { revalidatePath } from 'next/cache'

export type NewsletterState =
  | { success: true }
  | { error: string }
  | undefined

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email  = (formData.get('email')  as string)?.trim().toLowerCase()
  const name   = (formData.get('name')   as string)?.trim() || null
  const source = (formData.get('source') as string)?.trim() || 'footer'

  if (!email) return { error: 'Ingresá tu email.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Ingresá un email válido.' }
  }

  try {
    // Si ya existe el email, no duplica: reactiva el registro si estaba borrado.
    await db
      .insert(newsletterSubscribers)
      .values({ email, name, source })
      .onConflictDoUpdate({
        target: newsletterSubscribers.email,
        set:    { isDeleted: false, isActive: true, updatedAt: new Date() },
      })

    revalidatePath('/portal/admin/suscriptores')

    // Email de bienvenida (fire-and-forget)
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const SITE_URL       = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hardy.ar'
    if (RESEND_API_KEY && !RESEND_API_KEY.startsWith('re_REPLACE')) {
      fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:    'Hardy <noreply@hardy.com.ar>',
          to:      email,
          subject: 'Hardy — Ya sos parte.',
          html: `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/></head>
<body style="margin:0;padding:0;background:#f1efe9;font-family:'Helvetica Neue',Arial,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f1efe9;padding:40px 20px;">
  <tr><td align="center">
    <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">
      <tr><td style="background:#1a1a1a;padding:28px 36px;">
        <span style="font-family:'Courier New',monospace;font-size:22px;font-weight:900;letter-spacing:0.08em;color:#fafaf8;text-transform:uppercase;">HARDY</span>
        <br/>
        <span style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.25em;color:#C0171E;text-transform:uppercase;">── Alimentá tu instinto</span>
      </td></tr>
      <tr><td style="background:#fafaf8;padding:36px;">
        <p style="font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.2em;color:#C0171E;text-transform:uppercase;margin:0 0 8px 0;">── Suscripción confirmada</p>
        <h1 style="font-family:Georgia,serif;font-size:28px;font-weight:600;color:#1a1a1a;margin:0 0 16px 0;letter-spacing:-0.01em;">
          Ya sos parte de Hardy.
        </h1>
        <p style="font-family:Helvetica,Arial,sans-serif;font-size:15px;color:#555;line-height:1.7;margin:0 0 24px 0;">
          De vez en cuando te vamos a contar sobre nuevos productos, recetas y promos exclusivas.
          Sin spam, sin relleno — igual que nuestros productos.
        </p>
        <div style="background:#f1efe9;border-left:3px solid #C0171E;padding:14px 20px;margin-bottom:28px;">
          <p style="font-family:'Courier New',monospace;font-size:10px;letter-spacing:0.15em;text-transform:uppercase;color:#C0171E;margin:0 0 4px 0;">Mientras tanto</p>
          <p style="font-family:Helvetica,Arial,sans-serif;font-size:14px;color:#1a1a1a;margin:0;">
            Explorá la tienda y probá la combinación que más te guste.
          </p>
        </div>
        <div style="text-align:center;">
          <a href="${SITE_URL}/tienda"
             style="display:inline-block;background:#C0171E;color:#fafaf8;font-family:'Courier New',monospace;font-size:11px;letter-spacing:0.18em;text-transform:uppercase;padding:14px 32px;text-decoration:none;">
            Ver la tienda →
          </a>
        </div>
      </td></tr>
      <tr><td style="padding:20px 36px;background:#f1efe9;border-top:1px solid #e0ddd8;">
        <p style="font-family:'Courier New',monospace;font-size:9px;letter-spacing:0.15em;text-transform:uppercase;color:#aaa;margin:0;">
          HARDY · hardy.ar · Para darte de baja, respondé este email.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body></html>`,
        }),
      }).catch((e) => console.error('[newsletter] Error al enviar bienvenida:', e))
    }

    return { success: true }
  } catch {
    return { error: 'No pudimos registrar tu email. Intentá de nuevo.' }
  }
}
