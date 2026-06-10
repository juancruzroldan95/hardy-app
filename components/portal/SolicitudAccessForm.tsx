'use client'

import { useActionState } from 'react'
import { createPortalAccessFromSolicitud } from '@/repository/mutations/admin'
import type { CreateAccessState } from '@/repository/mutations/admin'

const ROLE_OPTIONS = [
  { value: 'mayorista',    label: 'Mayorista'     },
  { value: 'gastronomico', label: 'Gastronómico'  },
  { value: 'distribuidor', label: 'Distribuidor'  },
  { value: 'productor',    label: 'Productor'     },
  { value: 'consumer',     label: 'Consumidor'    },
]

interface Props {
  solicitudId: string
  defaultEmail:    string
  defaultNombre:   string
  defaultEmpresa:  string
  defaultPhone:    string
  defaultCuit:     string | null
  defaultCity:     string
  defaultProvince: string
  defaultRole:     string
}

export default function SolicitudAccessForm({
  solicitudId,
  defaultEmail,
  defaultNombre,
  defaultEmpresa,
  defaultPhone,
  defaultCuit,
  defaultCity,
  defaultProvince,
  defaultRole,
}: Props) {
  const boundAction = createPortalAccessFromSolicitud.bind(null, solicitudId)
  const [state, action, isPending] = useActionState<CreateAccessState, FormData>(
    boundAction,
    undefined,
  )

  // Éxito: mostrar credenciales
  if (state && 'success' in state) {
    return (
      <div className="bg-[#f0f7f0] border border-[#c6dfc7] p-6">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#2d6a35] mb-3">
          ✓ Acceso creado correctamente
        </p>
        <p className="font-body text-[14px] text-[#2d6a35] mb-4">
          El usuario <strong>{state.displayName}</strong> ya puede ingresar al portal con:
        </p>
        <div className="bg-white border border-[#c6dfc7] px-4 py-3 font-mono text-[13px] space-y-1">
          <div><span className="text-ink/40">Email:</span> <strong>{state.email}</strong></div>
          <div><span className="text-ink/40">Contraseña:</span> <strong>{state.tempPassword}</strong></div>
        </div>
        <p className="font-mono text-[10px] text-ink/40 mt-3">
          Compartí estas credenciales con el cliente por WhatsApp o email.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div>
          <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
            Email *
          </label>
          <input
            type="email"
            name="email"
            required
            defaultValue={defaultEmail}
            className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
            Nombre / Contacto *
          </label>
          <input
            type="text"
            name="displayName"
            required
            defaultValue={defaultNombre}
            className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div>
          <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
            Empresa
          </label>
          <input
            type="text"
            name="company"
            defaultValue={defaultEmpresa}
            className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
          />
        </div>
        <div>
          <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
            Rol / Segmento *
          </label>
          <select
            name="role"
            defaultValue={defaultRole}
            className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
          >
            {ROLE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div>
          <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
            WhatsApp
          </label>
          <input
            type="text"
            name="phone"
            defaultValue={defaultPhone}
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
            defaultValue={defaultCuit ?? ''}
            className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1">
        <div>
          <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
            Ciudad
          </label>
          <input
            type="text"
            name="city"
            defaultValue={defaultCity}
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
            defaultValue={defaultProvince}
            className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
          />
        </div>
      </div>

      {/* Contraseña */}
      <div>
        <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
          Contraseña *
        </label>
        <input
          type="text"
          name="password"
          required
          minLength={6}
          placeholder="Ej: Hardy2026 o el nombre del negocio"
          className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
        />
        <p className="font-mono text-[9px] tracking-[0.08em] text-ink/30 mt-1">
          Mínimo 6 caracteres. Elegí algo fácil de recordar para el cliente.
        </p>
      </div>

      {state && 'error' in state && (
        <div className="bg-red/10 border border-red/20 px-5 py-4">
          <p className="font-mono text-[11px] tracking-[0.1em] text-red">{state.error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="bg-[#2d6a35] text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[13px] self-start hover:bg-[#2d6a35]/80 transition-colors disabled:opacity-40"
      >
        {isPending ? 'Creando acceso...' : 'Crear acceso al portal →'}
      </button>
    </form>
  )
}
