import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { getProfileByUserId, getAllClientsWithOrdersAndAlerts } from '@/repository/queries/profile'
import { getApprovedSolicitudesPendingAccess } from '@/repository/queries/solicitudes'
import { ROLE_LABELS } from '@/consts/roles'
import { formatARS } from '@/consts/products'
import {
  assignVendedor,
  createClientAlert,
  resolveClientAlert,
  deleteClientAlert,
  updateClientNotesAction,
  updateClientRole,
  deleteClient,
} from '@/repository/mutations/admin'
import DeleteButton from '@/components/portal/DeleteButton'

const ALERT_TIPO_LABELS = {
  reorder:    'Recompra',
  payment:    'Pago',
  inactivity: 'Inactividad',
  custom:     'Nota',
} as const

const ALERT_TIPO_COLORS = {
  reorder:    'text-blue-600   bg-blue-50   border-blue-200',
  payment:    'text-red        bg-[#fdecea] border-red/20',
  inactivity: 'text-amber-600  bg-amber-50  border-amber-200',
  custom:     'text-ink/60     bg-paper-2   border-ink/10',
} as const

function getDaysSinceLast(createdAt: Date | string): number {
  return Math.floor((Date.now() - new Date(createdAt).getTime()) / 86_400_000)
}

// ── Ciclo de vida del contacto ────────────────────────────────────────────────
// Derivado del historial de compras. Ventana de actividad: 120 días.
const ACTIVE_WINDOW_DAYS = 120

type Lifecycle = 'prospecto' | 'activo' | 'inactivo'

const LIFECYCLE_META: Record<Lifecycle, { label: string; desc: string; badge: string; card: string }> = {
  prospecto: {
    label: 'Prospecto',
    desc:  'Interesado · sin compras aún',
    badge: 'text-blue-700  bg-blue-50  border-blue-200',
    card:  'bg-blue-50 border-blue-200 text-blue-700',
  },
  activo: {
    label: 'Cliente activo',
    desc:  `Compró en los últimos ${ACTIVE_WINDOW_DAYS} días`,
    badge: 'text-[#2d6a35] bg-[#e8f4ea] border-[#c6dfc7]',
    card:  'bg-[#e8f4ea] border-[#c6dfc7] text-[#2d6a35]',
  },
  inactivo: {
    label: 'Cliente inactivo',
    desc:  `Sin compras hace +${ACTIVE_WINDOW_DAYS} días`,
    badge: 'text-amber-700 bg-amber-50 border-amber-200',
    card:  'bg-amber-50 border-amber-200 text-amber-700',
  },
}

function getLifecycle(daysSinceLast: number | null): Lifecycle {
  if (daysSinceLast === null) return 'prospecto'
  return daysSinceLast <= ACTIVE_WINDOW_DAYS ? 'activo' : 'inactivo'
}

// Tipos de cliente relevantes para segmentar (B2B)
const TIPO_FILTERS: { value: string; label: string }[] = [
  { value: '',             label: 'Todos los tipos' },
  { value: 'mayorista',    label: 'Mayoristas'      },
  { value: 'distribuidor', label: 'Distribuidores'  },
  { value: 'gastronomico', label: 'Gastronómicos'   },
  { value: 'productor',    label: 'Productores'     },
]

interface Props {
  searchParams: Promise<{ estado?: string; tipo?: string }>
}

export default async function AdminClientesPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminProfile = await getProfileByUserId(user.id)
  const { estado: estadoFilter, tipo: tipoFilter } = await searchParams

  if (adminProfile?.role !== 'admin') redirect('/portal')

  // ── Fetch all non-admin clients with their orders + alerts ──────────────────
  const [allProfiles, solicitudesPendientes] = await Promise.all([
    getAllClientsWithOrdersAndAlerts(),
    getApprovedSolicitudesPendingAccess(),
  ])

  // Enriquecer cada contacto con su ciclo de vida (derivado del último pedido)
  const enriched = allProfiles
    .filter((p) => p.role !== 'admin')
    .map((p) => {
      const lastOrder = (p.orders ?? [])[0] ?? null
      const daysSinceLast = lastOrder
        ? Math.floor((Date.now() - new Date(lastOrder.createdAt).getTime()) / 86_400_000)
        : null
      return { ...p, lifecycle: getLifecycle(daysSinceLast) }
    })

  // Conteos por ciclo de vida (sobre el universo completo, respetando el filtro de tipo)
  const tipoScoped = tipoFilter
    ? enriched.filter((c) => c.role === tipoFilter)
    : enriched
  const counts = {
    prospecto: tipoScoped.filter((c) => c.lifecycle === 'prospecto').length + (!tipoFilter ? solicitudesPendientes.length : 0),
    activo:    tipoScoped.filter((c) => c.lifecycle === 'activo').length,
    inactivo:  tipoScoped.filter((c) => c.lifecycle === 'inactivo').length,
  }

  // Aplicar filtros (estado + tipo)
  const clients = enriched.filter((c) => {
    if (estadoFilter && c.lifecycle !== estadoFilter) return false
    if (tipoFilter && c.role !== tipoFilter) return false
    return true
  })

  // Helper para construir URLs de filtro preservando el otro parámetro
  function filterUrl(next: { estado?: string; tipo?: string }) {
    const params = new URLSearchParams()
    const e = next.estado !== undefined ? next.estado : (estadoFilter ?? '')
    const t = next.tipo   !== undefined ? next.tipo   : (tipoFilter ?? '')
    if (e) params.set('estado', e)
    if (t) params.set('tipo', t)
    const qs = params.toString()
    return qs ? `/portal/admin/clientes?${qs}` : '/portal/admin/clientes'
  }

  return (
    <div className="max-w-[1000px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">── Admin · CRM</p>
      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-2">
        Clientes ({clients.length})
      </h1>
      <p className="font-body text-[14px] text-ink/40 mb-6">
        Historial de compras, alertas y gestión de cuenta por cliente.
      </p>

      {/* ── Segmentación por ciclo de vida ──────────────────────────── */}
      <div className="grid grid-cols-3 gap-3 mb-5 max-md:grid-cols-1">
        {(['prospecto', 'activo', 'inactivo'] as const).map((stage) => {
          const meta     = LIFECYCLE_META[stage]
          const isActive = estadoFilter === stage
          return (
            <Link
              key={stage}
              href={filterUrl({ estado: isActive ? '' : stage })}
              className={[
                'border p-4 transition-all',
                isActive ? meta.card + ' ring-1 ring-current' : 'bg-paper border-ink/8 hover:border-ink/25',
              ].join(' ')}
            >
              <div className="flex items-center justify-between mb-1">
                <p className={`font-mono text-[9px] tracking-[0.15em] uppercase ${isActive ? '' : 'text-ink/40'}`}>
                  {meta.label}
                </p>
                {isActive && <span className="font-mono text-[8px] uppercase tracking-[0.1em]">● Filtrando</span>}
              </div>
              <p className={`font-heading text-[28px] font-medium leading-none ${isActive ? '' : 'text-ink'}`}>
                {counts[stage]}
              </p>
              <p className={`font-mono text-[8px] tracking-[0.06em] mt-1 ${isActive ? 'opacity-70' : 'text-ink/35'}`}>
                {meta.desc}
              </p>
            </Link>
          )
        })}
      </div>

      {/* ── Filtro por tipo de cliente ──────────────────────────────── */}
      <div className="flex items-center gap-2 flex-wrap mb-6">
        <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mr-1">Tipo:</span>
        {TIPO_FILTERS.map((opt) => {
          const isActive = (tipoFilter ?? '') === opt.value
          return (
            <Link
              key={opt.value}
              href={filterUrl({ tipo: opt.value })}
              className={[
                'font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-1.5 border transition-all',
                isActive
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-paper border-ink/15 text-ink/50 hover:text-ink hover:border-ink/40',
              ].join(' ')}
            >
              {opt.label}
            </Link>
          )
        })}
        {(estadoFilter || tipoFilter) && (
          <Link
            href="/portal/admin/clientes"
            className="font-mono text-[9px] tracking-[0.1em] uppercase text-red hover:text-ink transition-colors ml-1"
          >
            × Limpiar filtros
          </Link>
        )}
      </div>

      <div className="flex justify-end mb-6">
        <Link
          href="/portal/admin/clientes/nuevo"
          className="bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-5 py-[11px] hover:bg-red/90 transition-colors"
        >
          + Agregar cliente
        </Link>
      </div>

      {clients.length === 0 ? (
        <div className="bg-paper border border-ink/8 p-10 text-center">
          <p className="font-body text-[14px] text-ink/40">
            {estadoFilter || tipoFilter
              ? 'No hay contactos que coincidan con este segmento.'
              : 'No hay clientes registrados todavía.'}
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">

          {/* ── Solicitudes aprobadas sin acceso creado (prospectos) ────────── */}
          {!estadoFilter || estadoFilter === 'prospecto' ? solicitudesPendientes
            .filter(() => !tipoFilter)
            .map((sol) => (
              <div key={sol.id} className="bg-paper border border-blue-200 relative">
                <div className="absolute top-0 left-0 right-0 h-[3px] bg-blue-400" />
                <div className="px-6 py-5 border-b border-ink/8 flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-body font-semibold text-[15px] text-ink">{sol.empresa}</span>
                      <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-blue-700 bg-blue-50 border border-blue-200 px-2 py-[3px]">
                        Prospecto
                      </span>
                      <span className="font-mono text-[8px] tracking-[0.12em] uppercase text-[#2d6a35] bg-[#e8f4ea] border border-[#c6dfc7] px-2 py-[3px]">
                        Aprobada · sin acceso
                      </span>
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      <span className="font-mono text-[10px] tracking-[0.08em] text-ink/40">{sol.nombre}</span>
                      <span className="font-mono text-[10px] tracking-[0.08em] text-ink/40">{sol.ciudad}, {sol.provincia}</span>
                      {sol.whatsapp && (
                        <a
                          href={`https://wa.me/${sol.whatsapp.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] tracking-[0.08em] text-red"
                        >
                          {sol.whatsapp}
                        </a>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 items-start flex-wrap">
                    <Link
                      href={`/portal/admin/solicitudes/${sol.id}`}
                      className="font-mono text-[9px] tracking-[0.12em] uppercase text-[#2d6a35] hover:text-[#2d6a35]/70 border border-[#c6dfc7] hover:border-[#2d6a35] px-3 py-[7px] transition-colors"
                    >
                      Crear acceso →
                    </Link>
                    <span className="font-mono text-[9px] tracking-[0.1em] text-ink/30 uppercase self-center">
                      Aprobada {new Date(sol.updatedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>
                <div className="px-6 py-3 bg-blue-50/50">
                  <p className="font-mono text-[9px] tracking-[0.1em] text-blue-600/70 uppercase">
                    Solicitud aprobada — el acceso al portal todavía no fue creado.
                    <Link href={`/portal/admin/solicitudes/${sol.id}`} className="underline ml-1 hover:text-blue-800 transition-colors">
                      Crear acceso →
                    </Link>
                  </p>
                </div>
              </div>
            )) : null}

          {clients.map((client) => {
            const clientOrders   = client.orders ?? []
            const clientAlertsList = client.alerts ?? []

            const lastOrder      = clientOrders[0] ?? null
            const totalSpent     = clientOrders.reduce((s, o) => s + Number(o.totalArs), 0)
            const totalItems     = clientOrders
              .flatMap((o) => o.items)
              .reduce((s, item) => s + item.qty, 0)
            const pendingAlerts  = clientAlertsList.filter((a) => !a.isResolved)
            const daysSinceLast  = lastOrder
              ? getDaysSinceLast(lastOrder.createdAt)
              : null

            return (
              <div key={client.id} className="bg-paper border border-ink/8">

                {/* ── Header row ─────────────────────────────────────── */}
                <div className="px-6 py-5 border-b border-ink/8 flex items-start justify-between gap-4 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1 flex-wrap">
                      <span className="font-body font-semibold text-[15px] text-ink">
                        {client.company ?? client.displayName ?? '—'}
                      </span>
                      <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-red bg-[#fdecea] px-2 py-[3px]">
                        {ROLE_LABELS[client.role]}
                      </span>
                      <span className={`font-mono text-[8px] tracking-[0.12em] uppercase border px-2 py-[3px] ${LIFECYCLE_META[client.lifecycle].badge}`}>
                        {LIFECYCLE_META[client.lifecycle].label}
                      </span>
                      {pendingAlerts.length > 0 && (
                        <span className="font-mono text-[8px] tracking-[0.12em] uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-[3px]">
                          {pendingAlerts.length} alerta{pendingAlerts.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <div className="flex gap-4 flex-wrap">
                      {client.city && (
                        <span className="font-mono text-[10px] tracking-[0.08em] text-ink/40">
                          {client.city}{client.province ? `, ${client.province}` : ''}
                        </span>
                      )}
                      {client.phone && (
                        <a
                          href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-mono text-[10px] tracking-[0.08em] text-red"
                        >
                          {client.phone}
                        </a>
                      )}
                      {client.cuit && (
                        <span className="font-mono text-[10px] tracking-[0.08em] text-ink/40">
                          CUIT: {client.cuit}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex gap-3 items-start">
                    <Link
                      href={`/portal/admin/clientes/${client.id}/editar`}
                      className="font-mono text-[9px] tracking-[0.12em] uppercase text-red hover:text-red/80 border border-red/20 hover:border-red/40 px-3 py-[7px] transition-colors"
                    >
                      Editar perfil
                    </Link>
                    <Link
                      href={`/portal/admin/pedidos?userId=${client.userId}`}
                      className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink/40 hover:text-ink border border-ink/15 hover:border-ink px-3 py-[7px] transition-colors"
                    >
                      Ver pedidos →
                    </Link>
                    <span className="font-mono text-[9px] tracking-[0.1em] text-ink/30 uppercase self-center">
                      Desde {new Date(client.createdAt).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
                    </span>
                  </div>
                </div>

                {/* ── Stats strip ────────────────────────────────────── */}
                <div className="grid grid-cols-4 divide-x divide-ink/8 border-b border-ink/8 max-md:grid-cols-2 max-md:divide-y">
                  <div className="px-5 py-4">
                    <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-1">Pedidos</p>
                    <p className="font-heading text-[22px] font-medium text-ink">{clientOrders.length}</p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-1">Total comprado</p>
                    <p className="font-heading text-[22px] font-medium text-ink">
                      {totalSpent > 0 ? formatARS(totalSpent) : '—'}
                    </p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-1">Unidades totales</p>
                    <p className="font-heading text-[22px] font-medium text-ink">
                      {totalItems > 0 ? `${totalItems}u` : '—'}
                    </p>
                  </div>
                  <div className="px-5 py-4">
                    <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-1">Último pedido</p>
                    {lastOrder ? (
                      <>
                        <p className="font-heading text-[22px] font-medium text-ink">
                          {daysSinceLast === 0 ? 'Hoy' : `${daysSinceLast}d`}
                        </p>
                        <p className="font-mono text-[9px] tracking-[0.08em] text-ink/40 mt-[2px]">
                          {new Date(lastOrder.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </p>
                      </>
                    ) : (
                      <p className="font-heading text-[22px] font-medium text-ink/20">—</p>
                    )}
                  </div>
                </div>

                {/* ── Last order quick view ──────────────────────────── */}
                {lastOrder && (
                  <div className="px-6 py-3 border-b border-ink/8 bg-paper-2 flex items-center justify-between gap-4 flex-wrap">
                    <div>
                      <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink/40 mr-3">Último pedido</span>
                      <span className="font-mono text-[11px] text-ink">
                        {lastOrder.items.length} {lastOrder.items.length === 1 ? 'producto' : 'productos'} · {formatARS(Number(lastOrder.totalArs))}
                      </span>
                    </div>
                    {daysSinceLast !== null && daysSinceLast > 60 && (
                      <span className="font-mono text-[9px] tracking-[0.1em] uppercase text-amber-700 bg-amber-50 border border-amber-200 px-2 py-1">
                        ⚠ Sin compras hace {daysSinceLast} días
                      </span>
                    )}
                  </div>
                )}

                {/* ── Active alerts ──────────────────────────────────── */}
                {pendingAlerts.length > 0 && (
                  <div className="px-6 py-4 border-b border-ink/8">
                    <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-3">Alertas activas</p>
                    <div className="flex flex-col gap-2">
                      {pendingAlerts.map((alert) => (
                        <div
                          key={alert.id}
                          className="flex items-start gap-3 bg-paper-2 border border-ink/8 px-4 py-3"
                        >
                          <span className={`font-mono text-[8px] tracking-[0.12em] uppercase border px-2 py-[3px] shrink-0 mt-[1px] ${ALERT_TIPO_COLORS[alert.tipo]}`}>
                            {ALERT_TIPO_LABELS[alert.tipo]}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-body text-[13px] text-ink">{alert.mensaje}</p>
                            {alert.scheduledFor && (
                              <p className="font-mono text-[9px] tracking-[0.08em] text-amber-600 mt-[3px]">
                                📅 Programada: {new Date(alert.scheduledFor).toLocaleDateString('es-AR', { weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' })}
                                {alert.emailSentAt && (
                                  <span className="text-[#2d6a35] ml-2">✓ Email enviado</span>
                                )}
                              </p>
                            )}
                          </div>
                          <span className="font-mono text-[9px] text-ink/30 shrink-0">
                            {new Date(alert.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })}
                          </span>
                          <div className="flex gap-2 shrink-0">
                            <form action={async () => { 'use server'; await resolveClientAlert(alert.id) }}>
                              <button
                                type="submit"
                                className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#2d6a35] hover:text-[#2d6a35]/70 transition-colors"
                              >
                                ✓ Resolver
                              </button>
                            </form>
                            <DeleteButton
                              action={async () => { 'use server'; await deleteClientAlert(alert.id) }}
                              confirm="¿Estás seguro que deseás eliminar esta alerta?"
                              className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/30 hover:text-red transition-colors"
                            >
                              × Borrar
                            </DeleteButton>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Resolved alerts history ───────────────────────── */}
                {(() => {
                  const resolved = clientAlertsList.filter((a) => a.isResolved)
                  if (resolved.length === 0) return null
                  return (
                    <div className="px-6 py-4 border-b border-ink/8">
                      <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/30 mb-3">
                        Historial de alertas resueltas ({resolved.length})
                      </p>
                      <div className="flex flex-col gap-2">
                        {resolved.map((alert) => (
                          <div key={alert.id} className="flex items-start gap-3 px-3 py-2 border border-ink/5 bg-paper-2/50 opacity-60">
                            <span className="font-mono text-[7px] tracking-[0.12em] uppercase text-ink/30 border border-ink/10 px-2 py-[2px] shrink-0 mt-[1px]">
                              {ALERT_TIPO_LABELS[alert.tipo]}
                            </span>
                            <p className="font-body text-[12px] text-ink/60 flex-1 line-through">{alert.mensaje}</p>
                            <span className="font-mono text-[9px] text-ink/20 shrink-0 whitespace-nowrap">
                              ✓ {alert.resolvedAt
                                ? new Date(alert.resolvedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })
                                : new Date(alert.updatedAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' })
                              }
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                })()}

                {/* ── Add alert form ─────────────────────────────────── */}
                <div className="px-6 py-4 border-b border-ink/8">
                  <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-3">Nueva alerta</p>
                  <form
                    action={async (formData: FormData) => {
                      'use server'
                      const tipo         = (formData.get('alertTipo')    as string) ?? 'custom'
                      const mensaje      = (formData.get('alertMensaje') as string) ?? ''
                      const scheduledFor = (formData.get('scheduledFor') as string) || null
                      await createClientAlert(
                        client.id,
                        tipo as 'reorder' | 'payment' | 'inactivity' | 'custom',
                        mensaje,
                        scheduledFor,
                      )
                    }}
                    className="flex items-end gap-3 flex-wrap"
                  >
                    <div>
                      <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 block mb-1">Tipo</label>
                      <select
                        name="alertTipo"
                        className="bg-paper-2 border border-ink/15 font-body text-[13px] px-3 py-[9px] outline-none focus:border-ink transition-colors"
                      >
                        <option value="custom">Nota</option>
                        <option value="reorder">Recompra</option>
                        <option value="payment">Pago</option>
                        <option value="inactivity">Inactividad</option>
                      </select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 block mb-1">Mensaje</label>
                      <input
                        type="text"
                        name="alertMensaje"
                        required
                        placeholder="Ej: Llamar para coordinar próximo pedido"
                        className="w-full bg-paper-2 border border-ink/15 font-body text-[13px] px-3 py-2 outline-none focus:border-ink transition-colors"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 block mb-1">
                        Fecha programada
                      </label>
                      <input
                        type="date"
                        name="scheduledFor"
                        className="bg-paper-2 border border-ink/15 font-mono text-[12px] px-3 py-[9px] outline-none focus:border-ink transition-colors w-[150px]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-red text-paper font-mono text-[10px] tracking-[0.12em] uppercase px-4 py-[9px] hover:bg-red/90 transition-colors shrink-0"
                    >
                      + Crear alerta
                    </button>
                  </form>
                </div>

                {/* ── Notes ─────────────────────────────────────────── */}
                <div className="px-6 py-4 border-b border-ink/8">
                  <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-3">Notas internas</p>
                  <form action={updateClientNotesAction} className="flex items-end gap-3 flex-wrap">
                    <input type="hidden" name="profileId" value={client.id} />
                    <textarea
                      name="notes"
                      rows={2}
                      defaultValue={client.notes ?? ''}
                      placeholder="Notas privadas sobre este cliente..."
                      className="flex-1 bg-paper-2 border border-ink/15 font-body text-[13px] px-3 py-2 outline-none focus:border-ink transition-colors resize-none"
                    />
                    <button
                      type="submit"
                      className="bg-ink text-paper font-mono text-[10px] tracking-[0.12em] uppercase px-4 py-[9px] hover:bg-ink/80 transition-colors shrink-0"
                    >
                      Guardar →
                    </button>
                  </form>
                </div>

                {/* ── Cambiar rol ───────────────────────────────────── */}
                <div className="px-6 py-4 border-b border-ink/8">
                  <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-3">Rol / acceso</p>
                  <form
                    action={async (formData: FormData) => {
                      'use server'
                      const role = (formData.get('role') as string) ?? client.role
                      await updateClientRole(client.id, role as 'consumer' | 'mayorista' | 'gastronomico' | 'distribuidor' | 'productor' | 'admin')
                    }}
                    className="flex items-end gap-3 flex-wrap"
                  >
                    <div>
                      <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 block mb-1">Segmento</label>
                      <select
                        name="role"
                        defaultValue={client.role}
                        className="bg-paper-2 border border-ink/15 font-body text-[13px] px-3 py-[9px] outline-none focus:border-ink transition-colors"
                      >
                        <option value="consumer">Consumidor</option>
                        <option value="mayorista">Mayorista</option>
                        <option value="gastronomico">Gastronómico</option>
                        <option value="distribuidor">Distribuidor</option>
                        <option value="productor">Productor</option>
                        <option value="admin">Administrador</option>
                      </select>
                    </div>
                    <button
                      type="submit"
                      className="bg-ink text-paper font-mono text-[10px] tracking-[0.12em] uppercase px-4 py-[9px] hover:bg-ink/80 transition-colors"
                    >
                      Cambiar rol →
                    </button>
                  </form>
                </div>

                {/* ── Vendedor ───────────────────────────────────────── */}
                <div className="px-6 py-4">
                  <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-3">Vendedor asignado</p>
                  <form
                    action={async (formData: FormData) => {
                      'use server'
                      const nombre   = (formData.get('vendedorNombre')   as string)?.trim()
                      const whatsapp = (formData.get('vendedorWhatsapp') as string)?.trim()
                      await assignVendedor(client.id, nombre, whatsapp)
                    }}
                    className="flex items-end gap-3 flex-wrap"
                  >
                    <div>
                      <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 block mb-1">Nombre</label>
                      <input
                        type="text"
                        name="vendedorNombre"
                        defaultValue={client.vendedorNombre ?? ''}
                        placeholder="Ej: Martín García"
                        className="bg-paper-2 border border-ink/15 font-body text-[13px] px-3 py-2 outline-none focus:border-ink transition-colors w-[200px]"
                      />
                    </div>
                    <div>
                      <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 block mb-1">WhatsApp</label>
                      <input
                        type="text"
                        name="vendedorWhatsapp"
                        defaultValue={client.vendedorWhatsapp ?? ''}
                        placeholder="5491112345678"
                        className="bg-paper-2 border border-ink/15 font-body text-[13px] px-3 py-2 outline-none focus:border-ink transition-colors w-[180px]"
                      />
                    </div>
                    <button
                      type="submit"
                      className="bg-ink text-paper font-mono text-[10px] tracking-[0.12em] uppercase px-4 py-[9px] hover:bg-ink/80 transition-colors"
                    >
                      Asignar →
                    </button>
                    {client.vendedorNombre && (
                      <span className="font-mono text-[9px] tracking-[0.1em] text-[#2d6a35] uppercase">
                        ✓ {client.vendedorNombre}
                      </span>
                    )}
                  </form>
                </div>

                {/* ── Eliminar cliente ──────────────────────────────── */}
                <div className="px-6 py-4 border-t border-red/10 bg-red/[0.02]">
                  <DeleteButton
                    action={async () => {
                      'use server'
                      await deleteClient(client.id)
                    }}
                    confirm={`¿Estás seguro que deseás eliminar a ${client.company ?? client.displayName}? Esta acción no se puede deshacer.`}
                    className="font-mono text-[10px] tracking-[0.12em] uppercase text-red/50 hover:text-red hover:bg-red/8 border border-red/15 hover:border-red/30 px-4 py-[8px] transition-colors flex items-center gap-2"
                  >
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                    </svg>
                    Eliminar cliente
                  </DeleteButton>
                </div>

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
