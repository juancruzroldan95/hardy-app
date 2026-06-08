import { createClient } from '@/services/supabase/server'
import { getEtiqueta } from '@/services/andreani'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ nroEnvio: string }> }
): Promise<Response> {
  try {
    // Solo admins pueden descargar etiquetas
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return Response.json({ error: 'No autorizado' }, { status: 401 })
    }

    const profile = await db.query.profiles.findFirst({
      where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
    })

    if (!profile || profile.role !== 'admin') {
      return Response.json({ error: 'Sin permisos' }, { status: 403 })
    }

    const { nroEnvio } = await params
    const blob = await getEtiqueta(nroEnvio)
    const buffer = await blob.arrayBuffer()

    return new Response(buffer, {
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `attachment; filename="etiqueta-${nroEnvio}.pdf"`,
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Error inesperado'
    console.error('[api/andreani/etiqueta]', message)
    return Response.json({ error: message }, { status: 500 })
  }
}
