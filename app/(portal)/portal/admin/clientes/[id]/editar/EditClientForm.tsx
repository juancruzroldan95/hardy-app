'use client'

import { useActionState } from 'react'
import Link from 'next/link'
import { updateClientProfileAdmin } from '@/lib/actions/admin'
import type { EditClientState } from '@/lib/actions/admin'
import type { Profile } from '@/drizzle/schema'

const ROLE_OPTIONS = [
  { value: 'mayorista',    label: 'Mayorista'     },
  { value: 'gastronomico', label: 'Gastronómico'  },
  { value: 'distribuidor', label: 'Distribuidor'  },
  { value: 'productor',    label: 'Productor'     },
  { value: 'consumer',     label: 'Consumidor'    },
  { value: 'admin',        label: 'Administrador' },
]

interface EditClientFormProps {
  client: Profile
  email: string
}

export default function EditClientForm({ client, email }: EditClientFormProps) {
  const updateAction = updateClientProfileAdmin.bind(null, client.id)
  const [state, action, isPending] = useActionState<EditClientState, FormData>(
    updateAction,
    undefined,
  )

  return (
    <form action={action} className="space-y-5">
      {/* Email (Read only) */}
      <div>
        <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
          Email del usuario (No editable)
        </label>
        <input
          type="email"
          disabled
          value={email}
          className="w-full bg-paper-2 border border-ink/10 text-ink/40 font-body text-[14px] px-4 py-3 outline-none cursor-not-allowed select-none"
        />
      </div>

      {/* Nombre + Empresa */}
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div>
          <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
            Nombre / Contacto *
          </label>
          <input
            type="text"
            name="displayName"
            required
            defaultValue={client.displayName ?? ''}
            placeholder="Ej: Carlos Fernández"
            className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
            Empresa / Negocio
          </label>
          <input
            type="text"
            name="company"
            defaultValue={client.company ?? ''}
            placeholder="Ej: Dietética Vida Sana"
            className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
          />
        </div>
      </div>

      {/* Rol */}
      <div>
        <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
          Rol / Segmento *
        </label>
        <select
          name="role"
          defaultValue={client.role}
          className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
        >
          {ROLE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* Teléfono + CUIT */}
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div>
          <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
            WhatsApp / Teléfono
          </label>
          <input
            type="text"
            name="phone"
            defaultValue={client.phone ?? ''}
            placeholder="5491155443322"
            className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
            CUIT
          </label>
          <input
            type="text"
            name="cuit"
            defaultValue={client.cuit ?? ''}
            placeholder="20-12345678-9"
            className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
          />
        </div>
      </div>

      {/* Ciudad + Provincia */}
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div>
          <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
            Ciudad
          </label>
          <input
            type="text"
            name="city"
            defaultValue={client.city ?? ''}
            placeholder="Ej: Buenos Aires"
            className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
            Provincia
          </label>
          <input
            type="text"
            name="province"
            defaultValue={client.province ?? ''}
            placeholder="Ej: CABA"
            className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
          />
        </div>
      </div>

      {/* Dirección */}
      <div>
        <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
          Dirección de entrega
        </label>
        <input
          type="text"
          name="address"
          defaultValue={client.address ?? ''}
          placeholder="Ej: Av. Corrientes 2300, CABA"
          className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
        />
      </div>

      {/* Error */}
      {state && 'error' in state && (
        <div className="bg-red/10 border border-red/20 px-5 py-4">
          <p className="font-mono text-[11px] tracking-[0.1em] text-red">{state.error}</p>
        </div>
      )}

      {/* Acciones */}
      <div className="flex gap-4 pt-4 max-md:flex-col">
        <Link
          href="/portal/admin/clientes"
          className="bg-paper border border-ink/15 text-ink font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[16px] text-center hover:bg-paper-2 transition-colors flex-1"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={isPending}
          className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[16px] disabled:opacity-40 transition-opacity flex-1 hover:bg-red/90"
        >
          {isPending ? 'Guardando...' : 'Guardar Cambios →'}
        </button>
      </div>
    </form>
  )
}
