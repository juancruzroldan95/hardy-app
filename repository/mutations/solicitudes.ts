'use server'

import { db } from '@/db'
import { solicitudes } from '@/db/schema'
import type { TipoNegocio } from '@/db/schema'

export type SolicitudState =
  | { success: true }
  | { error: string }
  | undefined

const TIPOS_NEGOCIO_VALIDOS: TipoNegocio[] = [
  'dietetica', 'suplementos', 'distribuidor', 'cafeteria',
  'restaurante', 'gimnasio', 'almacen', 'otro',
]


export async function submitSolicitud(
  _prev: SolicitudState,
  formData: FormData,
): Promise<SolicitudState> {
  const nombre    = (formData.get('nombre')      as string)?.trim()
  const empresa   = (formData.get('empresa')     as string)?.trim()
  const tipoRaw   = (formData.get('tipoNegocio') as string)?.trim()
  const email     = (formData.get('email')       as string)?.trim().toLowerCase()
  const whatsapp  = (formData.get('whatsapp')    as string)?.trim()
  const ciudad    = (formData.get('ciudad')      as string)?.trim()
  const provincia = (formData.get('provincia')   as string)?.trim()
  const cuit      = (formData.get('cuit')        as string)?.trim() || null
  const mensaje   = (formData.get('mensaje')     as string)?.trim() || null

  // Validaciones base
  if (!nombre || !empresa || !tipoRaw || !email || !whatsapp || !ciudad || !provincia) {
    return { error: 'Completá todos los campos obligatorios.' }
  }

  if (!TIPOS_NEGOCIO_VALIDOS.includes(tipoRaw as TipoNegocio)) {
    return { error: 'Tipo de negocio no válido.' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Ingresá un email válido.' }
  }

  const tipoNegocio = tipoRaw as TipoNegocio

  // Validación por segmento: distribuidor requiere CUIT
  if (tipoNegocio === 'distribuidor' && !cuit) {
    return { error: 'Los distribuidores deben ingresar su CUIT / CUIL.' }
  }

  try {
    await db.insert(solicitudes).values({
      nombre,
      empresa,
      tipoNegocio,
      email,
      whatsapp,
      ciudad,
      provincia,
      cuit,
      mensaje,
    })

    // Notificación interna al equipo Hardy
    const RESEND_API_KEY = process.env.RESEND_API_KEY
    const ADMIN_EMAIL    = process.env.ADMIN_EMAIL
    if (RESEND_API_KEY && ADMIN_EMAIL) {
      fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: {
          Authorization:  `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from:    'Hardy Portal <noreply@hardy.com.ar>',
          to:      ADMIN_EMAIL,
          subject: `Nueva solicitud de acceso — ${empresa}`,
          html: `
            <h2>Nueva solicitud de acceso al portal</h2>
            <p>Revisá los datos y, si corresponde, aprobá el acceso desde el panel de solicitudes.</p>
            <table>
              <tr><td><strong>Nombre:</strong></td><td>${nombre}</td></tr>
              <tr><td><strong>Empresa:</strong></td><td>${empresa}</td></tr>
              <tr><td><strong>Tipo:</strong></td><td>${tipoRaw}</td></tr>
              <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
              <tr><td><strong>WhatsApp:</strong></td><td>${whatsapp}</td></tr>
              <tr><td><strong>Ciudad:</strong></td><td>${ciudad}, ${provincia}</td></tr>
              ${cuit    ? `<tr><td><strong>CUIT:</strong></td><td>${cuit}</td></tr>` : ''}
              ${mensaje ? `<tr><td><strong>Mensaje:</strong></td><td>${mensaje}</td></tr>` : ''}
            </table>
            <p><a href="${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hardy.ar'}/portal/admin/solicitudes">
              Ver en el panel admin →
            </a></p>
          `,
        }),
      }).catch((e) => console.error('[Hardy] Email notification failed:', e))
    }

    return { success: true }
  } catch {
    return { error: 'Ocurrió un error al enviar la solicitud. Intentá de nuevo.' }
  }
}
