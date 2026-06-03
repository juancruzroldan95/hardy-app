'use client'

import { useActionState } from 'react'
import Link from 'next/link'
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

export default function NuevoClientePage() {
  const [state, action, isPending] = useActionState<CreateClientState, FormData>(
    createClientProfile,
    undefined,
  )

  if (state && 'success' in state) {
    return (
      <div className="max-w-[600px]">
        <div className="bg-[#f0f7f0] border border-[#c6dfc7] px-6 py-8 text-center">
          <p className="text-[32px] mb-4">✓</p>
          <h2 className="font-heading text-[22px] font-medium mb-2 text-[#2d6a35]">
            Perfil creado exitosamente
          </h2>
          <p className="font-body text-[14px] text-ink/60 mb-6">
            <strong>{state.displayName}</strong> ya tiene acceso al portal con el rol asignado.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              href="/portal/admin/clientes"
              className="bg-ink text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[12px] hover:bg-ink/80 transition-colors"
            >
              Ver clientes →
            </Link>
            <Link
              href="/portal/admin/clientes/nuevo"
              className="bg-paper-2 border border-ink/15 font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[12px] hover:bg-paper transition-colors"
            >
              + Agregar otro
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[700px]">
      <Link
        href="/portal/admin/clientes"
        className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/40 hover:text-ink transition-colors mb-6 block"
      >
        ← Volver a clientes
      </Link>

      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">── Admin · Nuevo cliente</p>
      <h1 className="font-heading text-[clamp(24px,3vw,34px)] font-medium leading-[1.1] tracking-[-0.02em] mb-2">
        Agregar cliente
      </h1>
      <p className="font-body text-[14px] text-ink/40 mb-8">
        El usuario debe estar invitado en Supabase antes de crear su perfil.
      </p>

      {/* Aviso de flujo */}
      <div className="bg-amber-50 border border-amber-200 px-5 py-4 mb-8">
        <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-amber-700 mb-2">⚠ Paso previo requerido</p>
        <p className="font-body text-[13px] text-amber-800 leading-[1.6]">
          Antes de crear el perfil, el usuario debe existir en Supabase Auth.
          Invitalo desde{' '}
          <a
            href="https://supabase.com/dashboard/project/jveyfjoeavsbfwfrtpnd/auth/users"
            target="_blank"
            rel="noopener noreferrer"
            className="underline font-semibold"
          >
            Dashboard → Authentication → Users → Invite user
          </a>
          , esperá que acepte la invitación, y luego completá este formulario.
        </p>
      </div>

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
          <p className="font-mono text-[9px] tracking-[0.08em] text-ink/30 mt-1">
            Debe coincidir exactamente con el email de Supabase Auth
          </p>
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
          className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[16px] disabled:opacity-40 transition-opacity w-full hover:bg-red/90"
        >
          {isPending ? 'Creando perfil...' : 'Crear perfil y dar acceso →'}
        </button>
      </form>
    </div>
  )
}
