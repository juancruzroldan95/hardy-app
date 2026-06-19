'use client'

import { useEffect, useState } from 'react'
import NuevoPedidoForm from './NuevoPedidoForm'
import SuggestionsPanel from './SuggestionsPanel'
import type { ProductOrden } from './NuevoPedidoForm'
import type { OrderSuggestion } from './SuggestionsPanel'
import type { CreateOrderState } from '@/repository/mutations/orders'

interface Props {
  productos:          ProductOrden[]
  initialQtys?:       Record<string, number>
  minTotalCajas:      number
  roleName:           string
  overrideAction?:    (prev: CreateOrderState, formData: FormData) => Promise<CreateOrderState>
  deliveryAddresses?: { id: string; label: string; address: string; city: string | null; province: string | null; isDefault: boolean }[]
  stockByProduct?:    Record<string, string>
  stockQtyByProduct?: Record<string, number | null>
  userId?:            string
  suggestions:        OrderSuggestion[]
}

export default function NuevoPedidoFormWithSuggestions({
  productos,
  initialQtys,
  minTotalCajas,
  roleName,
  overrideAction,
  deliveryAddresses,
  stockByProduct,
  stockQtyByProduct,
  userId,
  suggestions,
}: Props) {
  const [appliedQtys, setAppliedQtys] = useState<Record<string, number> | undefined>(initialQtys)
  const [suggestionApplied, setSuggestionApplied] = useState(Boolean(initialQtys))

  // initialQtys cambia cuando se navega a ?repeat=<id> desde el panel de
  // sugerencias sin remontar este componente (misma ruta, nuevos searchParams).
  useEffect(() => {
    if (!initialQtys) return
    setAppliedQtys(initialQtys)
    setSuggestionApplied(true)
  }, [initialQtys])

  function handleSelectSuggestion(qtys: Record<string, number>) {
    setAppliedQtys(qtys)
    setSuggestionApplied(true)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <>
      {!suggestionApplied && (
        <SuggestionsPanel
          suggestions={suggestions}
          onSelectSuggestion={handleSelectSuggestion}
        />
      )}

      {suggestionApplied && (
        <div className="bg-[#f0f7f0] border border-[#c6dfc7] px-5 py-4 mb-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[#2d6a35] text-[18px]">✓</span>
            <p className="font-mono text-[11px] tracking-[0.08em] text-[#2d6a35]">
              Pedido sugerido cargado. Ajustá las cantidades si lo necesitás.
            </p>
          </div>
          <button
            onClick={() => { setAppliedQtys(undefined); setSuggestionApplied(false) }}
            className="font-mono text-[9px] text-[#2d6a35]/60 hover:text-[#2d6a35] uppercase tracking-[0.1em] transition-colors shrink-0"
          >
            Ver sugerencias
          </button>
        </div>
      )}

      <NuevoPedidoForm
        productos={productos}
        initialQtys={appliedQtys}
        minTotalCajas={minTotalCajas}
        roleName={roleName}
        overrideAction={overrideAction}
        deliveryAddresses={deliveryAddresses}
        stockByProduct={stockByProduct}
        stockQtyByProduct={stockQtyByProduct}
        userId={userId}
      />
    </>
  )
}
