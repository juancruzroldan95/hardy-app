'use client'

import { useActionState, useState } from 'react'
import {
  createDeliveryAddress,
  deleteDeliveryAddress,
  setDefaultDeliveryAddress,
  type AddressState,
} from '@/repository/mutations/addresses'
import type { DeliveryAddress } from '@/db/schema'

interface Props {
  addresses: DeliveryAddress[]
}

export default function DeliveryAddressesSection({ addresses: initial }: Props) {
  const [addresses] = useState(initial)
  const [showForm, setShowForm] = useState(false)
  const [state, action, isPending] = useActionState<AddressState, FormData>(
    async (prev, fd) => {
      const result = await createDeliveryAddress(prev, fd)
      if (result && 'success' in result) {
        setShowForm(false)
        window.location.reload() // refresh server data
      }
      return result
    },
    undefined,
  )

  async function handleDelete(id: string) {
    await deleteDeliveryAddress(id)
    window.location.reload()
  }

  async function handleSetDefault(id: string) {
    await setDefaultDeliveryAddress(id)
    window.location.reload()
  }

  return (
    <div className="max-w-[640px]">
      {/* Address list */}
      {addresses.length > 0 && (
        <div className="bg-paper border border-ink/8 divide-y divide-ink/8 mb-4">
          {addresses.map((addr) => (
            <div key={addr.id} className="px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-body font-semibold text-[14px]">{addr.label}</span>
                  {addr.isDefault && (
                    <span className="font-mono text-[7px] tracking-[0.15em] uppercase bg-ink text-paper px-2 py-0.5">
                      Principal
                    </span>
                  )}
                </div>
                <p className="font-body text-[13px] text-ink/60">{addr.address}</p>
                {addr.city && (
                  <p className="font-body text-[12px] text-ink/40 mt-[2px]">
                    {addr.city}{addr.province ? `, ${addr.province}` : ''}{addr.postalCode ? ` (${addr.postalCode})` : ''}
                  </p>
                )}
                {addr.notes && (
                  <p className="font-mono text-[10px] text-ink/30 mt-1">{addr.notes}</p>
                )}
              </div>
              <div className="flex flex-col items-end gap-2 shrink-0">
                {!addr.isDefault && (
                  <button
                    onClick={() => handleSetDefault(addr.id)}
                    className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 hover:text-ink transition-colors"
                  >
                    Hacer principal
                  </button>
                )}
                <button
                  onClick={() => handleDelete(addr.id)}
                  className="font-mono text-[9px] tracking-[0.1em] uppercase text-red/50 hover:text-red transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add address */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink border border-ink/20 px-5 py-3 hover:bg-paper-2 transition-colors w-full"
        >
          + Agregar dirección de entrega
        </button>
      ) : (
        <form action={action} className="bg-paper border border-ink/8 p-5">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 mb-4">── Nueva dirección</p>
          <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
            <div className="col-span-2 max-md:col-span-1">
              <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50 block mb-1">
                Nombre de la dirección *
              </label>
              <input type="text" name="label" required placeholder="Ej: Depósito central, Local Palermo…"
                className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors" />
            </div>
            <div className="col-span-2 max-md:col-span-1">
              <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50 block mb-1">
                Dirección *
              </label>
              <input type="text" name="address" required placeholder="Calle y número"
                className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors" />
            </div>
            <div>
              <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50 block mb-1">Ciudad</label>
              <input type="text" name="city" placeholder="Ciudad"
                className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors" />
            </div>
            <div>
              <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50 block mb-1">Provincia</label>
              <input type="text" name="province" placeholder="Provincia"
                className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors" />
            </div>
            <div>
              <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50 block mb-1">Código postal</label>
              <input type="text" name="postalCode" placeholder="CP"
                className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors" />
            </div>
            <div>
              <label className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50 block mb-1">Notas (opcional)</label>
              <input type="text" name="notes" placeholder="Horario de recepción, etc."
                className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors" />
            </div>
          </div>

          <div className="flex items-center gap-2 mt-4">
            <input type="checkbox" id="isDefault" name="isDefault" value="true" className="accent-[#C0171E]" />
            <label htmlFor="isDefault" className="font-mono text-[10px] tracking-[0.08em] text-ink/60">
              Establecer como dirección principal
            </label>
          </div>

          {state && 'error' in state && (
            <p className="font-mono text-[11px] text-red mt-3">{state.error}</p>
          )}

          <div className="flex items-center gap-3 mt-5">
            <button type="submit" disabled={isPending}
              className="bg-ink text-paper font-mono text-[11px] tracking-[0.12em] uppercase px-6 py-3 hover:bg-ink/80 disabled:opacity-40 transition-all">
              {isPending ? 'Guardando…' : 'Guardar dirección'}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink/40 hover:text-ink transition-colors">
              Cancelar
            </button>
          </div>
        </form>
      )}
    </div>
  )
}
