'use client'

import { useActionState, useEffect, useRef } from 'react'
import { createCost } from '@/lib/actions/finanzas'
import type { CostState } from '@/lib/actions/finanzas'
import { COST_CATEGORIES } from '@/lib/cost-categories'

function today(): string {
  return new Date().toISOString().split('T')[0]
}

export default function CostForm() {
  const [state, action, isPending] = useActionState<CostState, FormData>(createCost, undefined)
  const formRef = useRef<HTMLFormElement>(null)

  useEffect(() => {
    if (state && 'success' in state) formRef.current?.reset()
  }, [state])

  return (
    <form ref={formRef} action={action} className="bg-paper border border-ink/8 p-5">
      <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold mb-4">── Cargar costo</p>

      <div className="grid grid-cols-[1fr_160px_140px_150px] gap-3 items-end max-md:grid-cols-1">
        <div>
          <label htmlFor="concept" className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 block mb-1">Concepto *</label>
          <input
            id="concept"
            name="concept"
            type="text"
            required
            placeholder="Ej: Compra de maní — proveedor Córdoba"
            className="w-full bg-paper-2 border border-ink/15 font-body text-[13px] px-3 py-2 outline-none focus:border-ink transition-colors"
          />
        </div>
        <div>
          <label htmlFor="category" className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 block mb-1">Categoría</label>
          <select
            id="category"
            name="category"
            defaultValue="materia_prima"
            className="w-full bg-paper-2 border border-ink/15 font-body text-[13px] px-3 py-[9px] outline-none focus:border-ink transition-colors"
          >
            {COST_CATEGORIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="amount" className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 block mb-1">Monto (ARS) *</label>
          <input
            id="amount"
            name="amount"
            type="text"
            inputMode="decimal"
            required
            placeholder="150000"
            className="w-full bg-paper-2 border border-ink/15 font-mono text-[13px] px-3 py-2 outline-none focus:border-ink transition-colors"
          />
        </div>
        <div>
          <label htmlFor="costDate" className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 block mb-1">Fecha *</label>
          <input
            id="costDate"
            name="costDate"
            type="date"
            required
            defaultValue={today()}
            className="w-full bg-paper-2 border border-ink/15 font-mono text-[12px] px-3 py-[9px] outline-none focus:border-ink transition-colors"
          />
        </div>
      </div>

      {state && 'error' in state && (
        <p className="font-mono text-[11px] text-red mt-3">{state.error}</p>
      )}
      {state && 'success' in state && (
        <p className="font-mono text-[11px] text-[#2d6a35] mt-3">✓ Costo cargado.</p>
      )}

      <div className="mt-4">
        <button
          type="submit"
          disabled={isPending}
          className="bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[11px] hover:bg-red/90 transition-colors disabled:opacity-50"
        >
          {isPending ? 'Guardando...' : '+ Agregar costo'}
        </button>
      </div>
    </form>
  )
}
