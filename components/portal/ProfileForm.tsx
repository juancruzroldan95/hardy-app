'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/repository/mutations/profile'
import type { Profile } from '@/db/schema'
import type { ProfileActionState } from '@/repository/mutations/profile'

interface Props {
  profile: Profile
}

function Field({
  label, name, value, type = 'text', placeholder,
}: {
  label: string
  name: string
  value: string
  type?: string
  placeholder?: string
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/50 block mb-2"
      >
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        defaultValue={value}
        placeholder={placeholder}
        className="w-full bg-paper-2 border border-ink/15 text-ink font-body text-[15px] px-4 py-3 outline-none focus:border-ink transition-colors"
      />
    </div>
  )
}

export default function ProfileForm({ profile }: Props) {
  const [state, action, isPending] = useActionState<ProfileActionState, FormData>(
    updateProfile,
    undefined
  )

  return (
    <form action={action} className="flex flex-col gap-5">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field
          label="Nombre"
          name="displayName"
          value={profile.displayName ?? ''}
          placeholder="Tu nombre"
        />
        <Field
          label="Teléfono"
          name="phone"
          value={profile.phone ?? ''}
          type="tel"
          placeholder="+54 11 ..."
        />
      </div>
      <Field
        label="Empresa / Negocio"
        name="company"
        value={profile.company ?? ''}
        placeholder="Nombre del negocio (opcional)"
      />
      <Field
        label="Dirección"
        name="address"
        value={profile.address ?? ''}
        placeholder="Calle y número"
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <Field
          label="Ciudad"
          name="city"
          value={profile.city ?? ''}
          placeholder="Ciudad"
        />
        <Field
          label="Provincia"
          name="province"
          value={profile.province ?? ''}
          placeholder="Provincia"
        />
      </div>

      {state && 'error' in state && (
        <p className="font-mono text-[11px] tracking-[0.1em] text-red">
          {state.error}
        </p>
      )}
      {state && 'success' in state && (
        <p className="font-mono text-[11px] tracking-[0.1em] text-[#2d6a35]">
          Cambios guardados correctamente.
        </p>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-ink text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[16px] disabled:opacity-50 transition-opacity"
        >
          {isPending ? 'Guardando...' : 'Guardar cambios →'}
        </button>
      </div>
    </form>
  )
}
