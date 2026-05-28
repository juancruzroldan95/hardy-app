import { notFound, redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, solicitudes } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'
import { updateSolicitudEstado } from '@/lib/actions/admin'
import type { EstadoSolicitud } from '@/drizzle/schema'

const TIPO_LABELS: Record<string, string> = {
  dietetica:    'Dietética',
  suplementos:  'Suplementos',
  distribuidor: 'Distribuidor',
  cafeteria:    'Cafetería',
  restaurante:  'Restaurante',
  gimnasio:     'Gimnasio',
  almacen:      'Almacén',
  otro:         'Otro',
}

const ESTADO_OPTIONS: { value: EstadoSolicitud; label: string }[] = [
  { value: 'pendiente',  label: 'Pendiente'  },
  { value: 'contactado', label: 'Contactado' },
  { value: 'aprobada',   label: 'Aprobada'   },
  { value: 'rechazada',  label: 'Rechazada'  },
]

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminSolicitudDetailPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (profile?.role !== 'admin') redirect('/portal')

  const { id } = await params

  const solicitud = await db.query.solicitudes.findFirst({
    where: and(eq(solicitudes.id, id), eq(solicitudes.isDeleted, false)),
  })
  if (!solicitud) notFound()

  async function handleUpdate(formData: FormData) {
    'use server'
    const estado     = formData.get('estado') as EstadoSolicitud
    const notasAdmin = (formData.get('notasAdmin') as string)?.trim() || undefined
    if (!estado) return
    await updateSolicitudEstado(id, estado, notasAdmin)
  }

  return (
    <div className="max-w-[720px]">
      <Link
        href="/portal/admin/solicitudes"
        className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.12em] uppercase text-ink/40 hover:text-ink transition-colors mb-6"
      >
        ← Volver a solicitudes
      </Link>

      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">
        ── Solicitud de acceso
      </p>
      <h1 className="font-heading text-[clamp(22px,3vw,32px)] font-medium leading-[1.1] tracking-[-0.02em] mb-8">
        {solicitud.empresa}
      </h1>

      {/* Info grid */}
      <div className="bg-paper border border-ink/8 mb-6">
        <div className="px-5 py-4 border-b border-ink/8">
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-3">
            Datos de la solicitud
          </p>
          <dl className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            {[
              { label: 'Nombre',      value: solicitud.nombre },
              { label: 'Empresa',     value: solicitud.empresa },
              { label: 'Tipo',        value: TIPO_LABELS[solicitud.tipoNegocio] ?? solicitud.tipoNegocio },
              { label: 'Email',       value: solicitud.email },
              { label: 'WhatsApp',    value: solicitud.whatsapp },
              { label: 'Ciudad',      value: `${solicitud.ciudad}, ${solicitud.provincia}` },
              ...(solicitud.cuit ? [{ label: 'CUIT', value: solicitud.cuit }] : []),
              {
                label: 'Fecha',
                value: new Date(solicitud.createdAt).toLocaleDateString('es-AR', {
                  day: '2-digit', month: 'long', year: 'numeric',
                }),
              },
            ].map(({ label, value }) => (
              <div key={label}>
                <dt className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink/40 mb-[2px]">{label}</dt>
                <dd className="font-body text-[14px] text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </div>

        {solicitud.mensaje && (
          <div className="px-5 py-4">
            <p className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink/40 mb-2">Mensaje</p>
            <p className="font-body text-[14px] text-ink/70 leading-[1.6]">{solicitud.mensaje}</p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="bg-paper border border-ink/8 p-6">
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-5">
          Actualizar estado
        </p>
        <form action={handleUpdate} className="flex flex-col gap-4">
          <div>
            <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/60 block mb-2">
              Estado
            </label>
            <select
              name="estado"
              defaultValue={solicitud.estado}
              className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
            >
              {ESTADO_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/60 block mb-2">
              Notas internas (solo visible para admin)
            </label>
            <textarea
              name="notasAdmin"
              rows={3}
              defaultValue={solicitud.notasAdmin ?? ''}
              placeholder="Ej: Contactado por WA el 20/05, enviamos credenciales..."
              className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors resize-none"
            />
          </div>

          <button
            type="submit"
            className="bg-ink text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[13px] self-start hover:bg-ink/80 transition-colors"
          >
            Guardar cambios →
          </button>
        </form>
      </div>

      {/* Quick contact */}
      <div className="mt-6 flex gap-3 flex-wrap">
        <a
          href={`https://wa.me/${solicitud.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25d366] text-white font-mono text-[11px] tracking-[0.12em] uppercase px-5 py-[12px]"
        >
          WhatsApp →
        </a>
        <a
          href={`mailto:${solicitud.email}?subject=Acceso al portal Hardy&body=Hola ${solicitud.nombre},%0A%0A`}
          className="bg-paper border border-ink/15 text-ink font-mono text-[11px] tracking-[0.12em] uppercase px-5 py-[12px] hover:bg-paper-2 transition-colors"
        >
          Enviar email →
        </a>
      </div>
    </div>
  )
}
