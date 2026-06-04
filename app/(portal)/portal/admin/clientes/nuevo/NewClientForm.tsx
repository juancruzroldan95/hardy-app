'use client'

import { useActionState } from 'react'
import { createClientProfile } from '@/lib/actions/admin'
import type { CreateClientState } from '@/lib/actions/admin'

const ROLE_OPTIONS = [
  { value: 'mayorista',    label: 'Mayorista'     },
  { value: 'gastronomico', label: 'Gastronómico'  },
  { value: 'distribuidor', label: 'Distribuidor'  },
  { value: 'productor',    label: 'Productor'     },
  { value: 'consumer',     label: 'Consumidor'    },
  { value: 'admin',        label: 'Administrador' },
]

export default function NewClientForm() {
  const [state, action, isPending] = useActionState<CreateClientState, FormData>(
    createClientProfile,
    undefined,
  )

  return (
    <form action={action} className="space-y-5">
      {/* Email */}
      <div>
        <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
          Email del usuario *
        </label>
        <input
          type="email"
          name="email"
          required
          placeholder="cliente@empresa.com"
          className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
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
          defaultValue="mayorista"
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

      <button
        type="submit"
        disabled={isPending}
        className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[16px] disabled:opacity-40 transition-opacity w-full hover:bg-red/90 cursor-pointer"
      >
        {isPending ? 'Creando perfil...' : 'Crear perfil y dar acceso →'}
      </button>
    </form>
  )
}
