'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const TIPO_OPTIONS = [
  { value: '',           label: 'Todos los tipos' },
  { value: 'reorder',    label: 'Recompra' },
  { value: 'payment',    label: 'Pago' },
  { value: 'inactivity', label: 'Inactividad' },
  { value: 'custom',     label: 'Nota' },
]

type Client = { id: string; displayName: string | null; company: string | null }

const selectCls = 'bg-paper border border-ink/15 text-ink font-mono text-[10px] tracking-[0.1em] uppercase px-3 py-[7px] outline-none focus:border-ink transition-colors cursor-pointer'

export default function TareasFilters({ clients }: { clients: Client[] }) {
  const router      = useRouter()
  const params      = useSearchParams()

  const tipoActual    = params.get('tipo')    ?? ''
  const clienteActual = params.get('cliente') ?? ''
  const futurasActivo = params.get('futuras') === '1'
  const hayFiltros    = tipoActual || clienteActual || futurasActivo

  function update(key: string, value: string) {
    const next = new URLSearchParams(params.toString())
    if (value) next.set(key, value)
    else next.delete(key)
    router.push(`?${next.toString()}`)
  }

  return (
    <div className="flex flex-wrap gap-3 items-center mb-6">

      {/* Tipo */}
      <select
        value={tipoActual}
        onChange={(e) => update('tipo', e.target.value)}
        className={selectCls}
      >
        {TIPO_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>

      {/* Cliente */}
      <select
        value={clienteActual}
        onChange={(e) => update('cliente', e.target.value)}
        className={selectCls}
      >
        <option value="">Todos los clientes</option>
        {clients.map((c) => (
          <option key={c.id} value={c.id}>
            {c.company ?? c.displayName ?? c.id}
          </option>
        ))}
      </select>

      {/* Toggle futuras */}
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={futurasActivo}
          onChange={(e) => update('futuras', e.target.checked ? '1' : '')}
          className="accent-red w-3 h-3"
        />
        <span className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink/50">
          Incluir futuras
        </span>
      </label>

      {/* Limpiar */}
      {hayFiltros && (
        <button
          type="button"
          onClick={() => router.push('?')}
          className="font-mono text-[10px] tracking-[0.1em] uppercase text-red/70 hover:text-red transition-colors"
        >
          × Limpiar filtros
        </button>
      )}
    </div>
  )
}
