import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { createClient } from '@/services/supabase/server'
import { getProfileByUserId, getAllPendingAlerts, getAllClients } from '@/repository/queries/profile'
import { resolveClientAlert, deleteClientAlert } from '@/repository/mutations/admin'
import type { AlertTipo } from '@/db/schema'
import DeleteButton from '@/components/portal/DeleteButton'
import TareasFilters from '@/components/portal/TareasFilters'
import Link from 'next/link'

const TIPO_LABELS: Record<AlertTipo, string> = {
  reorder:    'Recompra',
  payment:    'Pago',
  inactivity: 'Inactividad',
  custom:     'Nota',
}

const TIPO_COLORS: Record<AlertTipo, string> = {
  reorder:    'text-blue-600   bg-blue-50   border-blue-200',
  payment:    'text-red        bg-[#fdecea] border-red/20',
  inactivity: 'text-amber-600  bg-amber-50  border-amber-200',
  custom:     'text-ink/60     bg-paper-2   border-ink/10',
}

const ALERT_TIPOS: AlertTipo[] = ['reorder', 'payment', 'inactivity', 'custom']

export default async function AdminTareasPage({
  searchParams,
}: {
  searchParams: Promise<{ tipo?: string; cliente?: string; futuras?: string }>
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfileByUserId(user.id)
  if (profile?.role !== 'admin') redirect('/portal')

  const sp            = await searchParams
  const tipoRaw       = sp.tipo
  const tipo          = ALERT_TIPOS.includes(tipoRaw as AlertTipo) ? (tipoRaw as AlertTipo) : undefined
  const profileId     = sp.cliente || undefined
  const incluirFuturas = sp.futuras === '1'

  const [alerts, clients] = await Promise.all([
    getAllPendingAlerts({ tipo, profileId, incluirFuturas }),
    getAllClients(),
  ])

  // Agrupar por cliente
  const byClient = new Map<string, typeof alerts>()
  for (const alert of alerts) {
    const key = alert.profileId
    if (!byClient.has(key)) byClient.set(key, [])
    byClient.get(key)!.push(alert)
  }

  const groups = Array.from(byClient.entries()).map(([, items]) => ({
    profile: items[0].profile,
    alerts:  items,
  }))

  groups.sort((a, b) => {
    const aDate = a.alerts.find((al) => al.scheduledFor)?.scheduledFor
    const bDate = b.alerts.find((bl) => bl.scheduledFor)?.scheduledFor
    if (aDate && bDate) return new Date(aDate).getTime() - new Date(bDate).getTime()
    if (aDate) return -1
    if (bDate) return  1
    return 0
  })

  const hayFiltros = tipo || profileId || incluirFuturas

  return (
    <div className="max-w-[820px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">── Admin · CRM</p>
      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-2">
        Tareas pendientes
      </h1>
      <p className="font-body text-[14px] text-ink/40 mb-6">
        {alerts.length === 0
          ? hayFiltros ? 'Sin tareas para los filtros aplicados.' : 'No hay tareas para hoy.'
          : `${alerts.length} ${alerts.length === 1 ? 'tarea' : 'tareas'} en ${groups.length} ${groups.length === 1 ? 'cliente' : 'clientes'}.`}
        {!incluirFuturas && !hayFiltros && (
          <span className="ml-2 text-ink/30">Solo hoy y anteriores.</span>
        )}
      </p>

      {/* Filtros */}
      <Suspense>
        <TareasFilters clients={clients} />
      </Suspense>

      {alerts.length === 0 ? (
        <div className="bg-paper border border-ink/8 p-12 text-center">
          <p className="font-mono text-[11px] tracking-[0.1em] text-ink/30 uppercase">Sin tareas pendientes ✓</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {groups.map(({ profile: clientProfile, alerts: clientAlerts }) => (
            <div key={clientProfile.id} className="bg-paper border border-ink/8">
              {/* Header cliente */}
              <div className="px-6 py-4 border-b border-ink/8 flex items-center justify-between gap-4">
                <div>
                  <p className="font-body font-semibold text-[14px] text-ink">
                    {clientProfile.company ?? clientProfile.displayName}
                  </p>
                  {clientProfile.company && clientProfile.displayName && (
                    <p className="font-mono text-[9px] tracking-[0.1em] text-ink/40 mt-[2px]">
                      {clientProfile.displayName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-[8px] tracking-[0.12em] uppercase text-red border border-red/20 px-2 py-1">
                    {clientAlerts.length} {clientAlerts.length === 1 ? 'tarea' : 'tareas'}
                  </span>
                  <Link
                    href={`/portal/admin/clientes`}
                    className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 hover:text-ink transition-colors"
                  >
                    Ver cliente →
                  </Link>
                </div>
              </div>

              {/* Alertas del cliente */}
              <div className="divide-y divide-ink/5">
                {clientAlerts.map((alert) => (
                  <div key={alert.id} className="px-6 py-4 flex items-start gap-4">
                    <span className={`font-mono text-[8px] tracking-[0.12em] uppercase border px-2 py-[3px] shrink-0 mt-[2px] ${TIPO_COLORS[alert.tipo]}`}>
                      {TIPO_LABELS[alert.tipo]}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="font-body text-[14px] text-ink">{alert.mensaje}</p>
                      {alert.scheduledFor && (
                        <p className="font-mono text-[9px] tracking-[0.08em] text-amber-600 mt-1">
                          📅 Programada: {new Date(alert.scheduledFor).toLocaleDateString('es-AR', {
                            weekday: 'short', day: '2-digit', month: 'short', year: 'numeric',
                          })}
                        </p>
                      )}
                      <p className="font-mono text-[9px] text-ink/25 mt-1">
                        Creada {new Date(alert.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short', year: 'numeric' })}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <form action={async () => {
                        'use server'
                        await resolveClientAlert(alert.id)
                      }}>
                        <button
                          type="submit"
                          className="font-mono text-[9px] tracking-[0.1em] uppercase text-[#2d6a35] hover:text-[#2d6a35]/70 transition-colors"
                        >
                          ✓ Resolver
                        </button>
                      </form>
                      <DeleteButton
                        action={async () => {
                          'use server'
                          await deleteClientAlert(alert.id)
                        }}
                        confirm="¿Estás seguro que deseás eliminar esta tarea?"
                        className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/25 hover:text-red transition-colors"
                      >
                        × Borrar
                      </DeleteButton>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
