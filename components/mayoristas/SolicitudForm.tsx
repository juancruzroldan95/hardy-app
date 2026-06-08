'use client'

import { useActionState, useEffect } from 'react'
import { submitSolicitud } from '@/repository/mutations/solicitudes'
import type { SolicitudState } from '@/repository/mutations/solicitudes'
import { trackLead } from '@/consts/meta-pixel'

const TIPOS = [
  { value: 'dietetica',    label: 'Dietética' },
  { value: 'suplementos',  label: 'Tienda de suplementos' },
  { value: 'distribuidor', label: 'Distribuidor' },
  { value: 'cafeteria',    label: 'Cafetería' },
  { value: 'restaurante',  label: 'Restaurante' },
  { value: 'gimnasio',     label: 'Gimnasio / Centro de salud' },
  { value: 'almacen',      label: 'Almacén / Dietética barrial' },
  { value: 'otro',         label: 'Otro' },
]

function Field({
  label, name, type = 'text', placeholder, required = true, children,
}: {
  label: string
  name: string
  type?: string
  placeholder?: string
  required?: boolean
  children?: React.ReactNode
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/60 block mb-2"
      >
        {label}{required && <span className="text-red ml-1">*</span>}
      </label>
      {children ?? (
        <input
          id={name}
          name={name}
          type={type}
          placeholder={placeholder}
          required={required}
          className="w-full bg-paper border border-ink/15 text-ink font-body text-[15px] px-4 py-3 outline-none focus:border-ink transition-colors"
        />
      )}
    </div>
  )
}

export default function SolicitudForm() {
  const [state, action, isPending] = useActionState<SolicitudState, FormData>(
    submitSolicitud,
    undefined,
  )

  // Disparar evento Lead en Meta Pixel al enviar con éxito
  useEffect(() => {
    if (state && 'success' in state) {
      trackLead({ contentName: 'Solicitud Mayorista' })
    }
  }, [state])

  if (state && 'success' in state) {
    return (
      <div className="bg-ink text-paper px-10 py-14 text-center max-w-[600px] mx-auto">
        <div className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-5">
          ── Solicitud recibida
        </div>
        <h3
          className="font-heading font-medium leading-[1.1] tracking-[-0.02em] mb-4"
          style={{ fontSize: 'clamp(24px, 3vw, 32px)' }}
        >
          Nos ponemos en contacto
          <br />
          en las próximas <em className="not-italic text-red">24-48hs.</em>
        </h3>
        <p className="font-body text-[14px] leading-[1.7]" style={{ color: 'rgba(250,250,248,0.65)' }}>
          Revisamos tu solicitud y te contactamos por WhatsApp y email con
          tu usuario y contraseña para acceder al portal.
        </p>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-5 max-w-[700px]">
      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        <Field label="Nombre y apellido" name="nombre" placeholder="Tu nombre completo" />
        <Field label="Empresa / Negocio" name="empresa" placeholder="Nombre del negocio" />
      </div>

      <Field label="Tipo de negocio" name="tipoNegocio">
        <select
          id="tipoNegocio"
          name="tipoNegocio"
          required
          className="w-full bg-paper border border-ink/15 text-ink font-body text-[15px] px-4 py-3 outline-none focus:border-ink transition-colors"
        >
          <option value="">Seleccioná una opción</option>
          {TIPOS.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>
      </Field>

      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        <Field label="Ciudad" name="ciudad" placeholder="Ciudad" />
        <Field label="Provincia" name="provincia" placeholder="Provincia" />
      </div>

      <div className="grid grid-cols-2 gap-5 max-md:grid-cols-1">
        <Field label="Email" name="email" type="email" placeholder="tu@email.com" />
        <Field label="WhatsApp" name="whatsapp" type="tel" placeholder="+54 11 ..." />
      </div>

      <Field label="CUIT / CUIL" name="cuit" placeholder="20-12345678-9" required={false} />

      <Field label="Mensaje adicional" name="mensaje" required={false}>
        <textarea
          id="mensaje"
          name="mensaje"
          rows={3}
          placeholder="Contanos más sobre tu negocio (opcional)"
          className="w-full bg-paper border border-ink/15 text-ink font-body text-[15px] px-4 py-3 outline-none focus:border-ink transition-colors resize-none"
        />
      </Field>

      {state && 'error' in state && (
        <p className="font-mono text-[11px] tracking-[0.1em] text-red">
          {state.error}
        </p>
      )}

      <div className="pt-2">
        <button
          type="submit"
          disabled={isPending}
          className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-10 py-[18px] disabled:opacity-50 transition-opacity inline-flex items-center gap-2"
        >
          {isPending ? 'Enviando...' : 'Enviar solicitud →'}
        </button>
      </div>

      <p className="font-mono text-[9px] tracking-[0.1em] text-ink/40 uppercase">
        * Campos obligatorios. No compartimos tu información con terceros.
      </p>
    </form>
  )
}
