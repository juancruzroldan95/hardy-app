import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { getProfileByUserId, getAllClientsWithOrdersAndAlerts } from '@/repository/queries/profile'
import { ROLE_LABELS } from '@/consts/roles'
import { formatARS } from '@/consts/products'
import {
  assignVendedor,
  createClientAlert,
  resolveClientAlert,
  deleteClientAlert,
  updateClientNotes,
  updateClientRole,
} from '@/repository/mutations/admin'

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

export default async function AdminClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminProfile = await getProfileByUserId(user.id)
  if (adminProfile?.role !== 'admin') redirect('/portal')

  // ── Fetch all non-admin clients with their orders + alerts ──────────────────
  const allProfiles = await getAllClientsWithOrdersAndAlerts()

  const clients = allProfiles.filter((p) => p.role !== 'admin')

  return (
    <div className="max-w-[1000px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">── Admin · CRM</p>
      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-2">
        Clientes ({clients.length})
      </h1>
      <p className="font-body text-[14px] text-ink/40 mb-6">
        Historial de compras, alertas y gestión de cuenta por cliente.
      </p>
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
          <p className="font-body text-[14px] text-ink/40">No hay clientes registrados todavía.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-6">
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
                            <form action={async () => { 'use server'; await deleteClientAlert(alert.id) }}>
                              <button
                                type="submit"
                                className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/30 hover:text-red transition-colors"
                              >
                                × Borrar
                              </button>
                            </form>
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
                  <form
                    action={async (formData: FormData) => {
                      'use server'
                      const notes = (formData.get('notes') as string) ?? ''
                      await updateClientNotes(client.id, notes)
                    }}
                    className="flex items-end gap-3 flex-wrap"
                  >
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

              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
