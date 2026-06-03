/**
 * GET /api/alerts/check
 *
 * Cron endpoint — se ejecuta diariamente a las 8:00 AM (configurado en vercel.json).
 * Busca alertas programadas cuya fecha ya llegó, envía email al admin y marca emailSentAt.
 *
 * Protegido con CRON_SECRET para que solo pueda ejecutarse desde Vercel Cron.
 */

import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { clientAlerts, profiles } from '@/drizzle/schema'
import { and, eq, isNull, lte, isNotNull } from 'drizzle-orm'
import { sendAlertReminder } from '@/lib/email'
import type { AlertReminderData } from '@/lib/email'

export async function GET(request: Request) {
  // Verificar secret (Vercel Cron pasa el header Authorization)
  const authHeader = request.headers.get('Authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const now = new Date()

    // Buscar alertas programadas que ya llegaron, no resueltas, y sin email enviado
    const dueAlerts = await db.query.clientAlerts.findMany({
      where: and(
        eq(clientAlerts.isDeleted, false),
        eq(clientAlerts.isResolved, false),
        isNotNull(clientAlerts.scheduledFor),
        isNull(clientAlerts.emailSentAt),
        lte(clientAlerts.scheduledFor, now),
      ),
    })

    if (dueAlerts.length === 0) {
      return NextResponse.json({ sent: 0, message: 'No hay alertas programadas para hoy.' })
    }

    // Obtener perfiles de los clientes
    const profileIds = [...new Set(dueAlerts.map((a) => a.profileId))]
    const profileList = await db.query.profiles.findMany({
      where: and(eq(profiles.isDeleted, false)),
    })
    const profileMap = new Map(profileList.map((p) => [p.id, p]))

    // Armar datos para el email
    const alertData: AlertReminderData[] = dueAlerts.map((a) => {
      const profile = profileMap.get(a.profileId)
      return {
        profileId:    a.profileId,
        clientName:   profile?.company ?? profile?.displayName ?? 'Cliente desconocido',
        alertTipo:    a.tipo,
        mensaje:      a.mensaje,
        scheduledFor: a.scheduledFor!,
      }
    })

    // Enviar email de recordatorio
    await sendAlertReminder(alertData)

    // Marcar emailSentAt en todas las alertas procesadas
    await Promise.all(
      dueAlerts.map((a) =>
        db.update(clientAlerts)
          .set({ emailSentAt: now, updatedAt: now })
          .where(eq(clientAlerts.id, a.id))
      )
    )

    return NextResponse.json({
      sent:    dueAlerts.length,
      message: `Email enviado con ${dueAlerts.length} alerta${dueAlerts.length > 1 ? 's' : ''}.`,
    })
  } catch (error) {
    console.error('[cron/alerts] Error:', error)
    return NextResponse.json({ error: 'Error interno' }, { status: 500 })
  }
}
