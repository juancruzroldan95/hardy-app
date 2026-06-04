import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { getProfileByUserId } from '@/repository/queries/profile'
import { getAllSolicitudes } from '@/repository/queries/solicitudes'

const ESTADO_LABELS = {
  pendiente:  { label: 'Pendiente',   bg: 'bg-[#fff3e0]', text: 'text-[#8b4513]' },
  contactado: { label: 'Contactado',  bg: 'bg-[#e3f2fd]', text: 'text-[#1a5276]' },
  aprobada:   { label: 'Aprobada',    bg: 'bg-[#e8f4ea]', text: 'text-[#2d6a35]' },
  rechazada:  { label: 'Rechazada',   bg: 'bg-[#fdecea]', text: 'text-red'       },
}

const TIPO_LABELS: Record<string, string> = {
  dietetica:   'Dietética',
  suplementos: 'Suplementos',
  distribuidor: 'Distribuidor',
  cafeteria:   'Cafetería',
  restaurante: 'Restaurante',
  gimnasio:    'Gimnasio',
  almacen:     'Almacén',
  otro:        'Otro',
}

export default async function AdminSolicitudesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfileByUserId(user.id)
  if (profile?.role !== 'admin') redirect('/portal')

  const items = await getAllSolicitudes()

  const pendientes  = items.filter((s) => s.estado === 'pendiente').length
  const contactados = items.filter((s) => s.estado === 'contactado').length
  const aprobadas   = items.filter((s) => s.estado === 'aprobada').length
  const rechazadas  = items.filter((s) => s.estado === 'rechazada').length

  return (
    <div className="max-w-[1000px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">
        ── Admin
      </p>
      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-8">
        Solicitudes de acceso
      </h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3 mb-8 max-md:grid-cols-2">
        {[
          { label: 'Pendientes',   value: pendientes,  highlight: pendientes > 0 },
          { label: 'Contactados',  value: contactados, highlight: false },
          { label: 'Aprobadas',    value: aprobadas,   highlight: false },
          { label: 'Rechazadas',   value: rechazadas,  highlight: false },
        ].map(({ label, value, highlight }) => (
          <div key={label} className={`border p-4 ${highlight ? 'bg-[#fff3e0] border-[#f0b050]/30' : 'bg-paper border-ink/8'}`}>
            <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-1">{label}</p>
            <p className={`font-heading text-[28px] font-medium leading-none ${highlight ? 'text-[#8b4513]' : 'text-ink'}`}>
              {value}
            </p>
          </div>
        ))}
      </div>

      {/* Table */}
      {items.length === 0 ? (
        <div className="bg-paper border border-ink/8 p-10 text-center">
          <p className="font-body text-[14px] text-ink/40">No hay solicitudes todavía.</p>
        </div>
      ) : (
        <div className="bg-paper border border-ink/8">
          <div className="px-5 py-3 border-b border-ink/8 bg-paper-2 grid gap-4"
               style={{ gridTemplateColumns: '1fr 120px 100px 90px 40px' }}>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Empresa / Contacto</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Tipo</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Fecha</span>
            <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40">Estado</span>
            <span />
          </div>

          <div className="divide-y divide-ink/8">
            {items.map((s) => {
              const est = ESTADO_LABELS[s.estado]
              return (
                <div
                  key={s.id}
                  className="px-5 py-4 grid gap-4 items-center"
                  style={{ gridTemplateColumns: '1fr 120px 100px 90px 40px' }}
                >
                  <div>
                    <div className="font-body font-semibold text-[14px] text-ink">{s.empresa}</div>
                    <div className="font-mono text-[10px] tracking-[0.08em] text-ink/40 mt-[2px]">
                      {s.nombre} · {s.email}
                    </div>
                  </div>
                  <span className="font-mono text-[10px] tracking-[0.08em] text-ink/60">
                    {TIPO_LABELS[s.tipoNegocio] ?? s.tipoNegocio}
                  </span>
                  <span className="font-mono text-[10px] tracking-[0.08em] text-ink/40">
                    {new Date(s.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                  </span>
                  <span className={`${est.bg} ${est.text} font-mono text-[9px] tracking-[0.1em] uppercase px-2 py-[4px] whitespace-nowrap justify-self-start`}>
                    {est.label}
                  </span>
                  <Link
                    href={`/portal/admin/solicitudes/${s.id}`}
                    className="font-mono text-[11px] text-red hover:text-ink transition-colors"
                  >
                    →
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
