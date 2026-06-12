'use client'

import { useActionState, useEffect, useState } from 'react'
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

type Segmento = 'mayorista' | 'gastronomico' | 'distribuidor' | null

function resolveSegmento(tipo: string): Segmento {
  if (tipo === 'distribuidor') return 'distribuidor'
  if (tipo === 'cafeteria' || tipo === 'restaurante') return 'gastronomico'
  if (tipo) return 'mayorista'
  return null
}

const SEGMENTO_INFO: Record<NonNullable<Segmento>, { label: string; catalogo: string; color: string }> = {
  mayorista:    { label: 'Mayorista',    catalogo: 'Catálogo Mayorista',    color: '#4ade80' },
  gastronomico: { label: 'Gastronómico', catalogo: 'Catálogo Gastronómico', color: '#fb923c' },
  distribuidor: { label: 'Distribuidor', catalogo: 'Catálogo Distribuidor', color: '#60a5fa' },
}

const inputCls = 'w-full bg-[#252525] border border-[#383838] text-paper font-body text-[15px] px-4 py-3 outline-none focus:border-red transition-colors'
const labelCls = 'font-mono text-[10px] tracking-[0.15em] uppercase text-paper/60 block mb-2'

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
      <label htmlFor={name} className={labelCls}>
        {label}{required && <span className="text-red ml-1">*</span>}
      </label>
      {children ?? (
        <input
          id={name} name={name} type={type}
          placeholder={placeholder} required={required}
          className={inputCls}
        />
      )}
    </div>
  )
}

export default function RequestAccessForm({ onBack }: { onBack: () => void }) {
  const [state, action, isPending] = useActionState<SolicitudState, FormData>(
    submitSolicitud,
    undefined,
  )

  const [expandido, setExpandido]           = useState(false)
  const [nombre, setNombre]                 = useState('')
  const [whatsapp, setWhatsapp]             = useState('')
  const [tipoSeleccionado, setTipo]         = useState('')

  const segmento       = resolveSegmento(tipoSeleccionado)
  const paso1Completo  = nombre.trim() !== '' && whatsapp.trim() !== '' && tipoSeleccionado !== ''

  useEffect(() => {
    if (state && 'success' in state) {
      trackLead({ contentName: 'Solicitud Acceso Portal' })
    }
  }, [state])

  if (state && 'success' in state) {
    return (
      <div className="text-center py-6">
        <div className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">
          ── Solicitud recibida
        </div>
        <p className="font-body text-[15px] text-paper/80 leading-[1.7]">
          Nos ponemos en contacto en las próximas <strong className="text-paper">24-48hs</strong> por WhatsApp y email.
        </p>
        <button
          type="button"
          onClick={onBack}
          className="mt-6 font-mono text-[10px] tracking-[0.1em] text-paper/40 uppercase hover:text-paper/70 transition-colors"
        >
          ← Volver al login
        </button>
      </div>
    )
  }

  return (
    <form action={action} className="flex flex-col gap-4">

      {/* PASO 1 */}
      <Field label="Nombre y apellido" name="nombre">
        <input
          id="nombre" name="nombre" type="text"
          placeholder="Tu nombre completo" required
          value={nombre} onChange={(e) => setNombre(e.target.value)}
          className={inputCls}
        />
      </Field>

      <Field label="WhatsApp" name="whatsapp" type="tel">
        <input
          id="whatsapp" name="whatsapp" type="tel"
          placeholder="+54 11 ..." required
          value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)}
          className={inputCls}
        />
      </Field>

      <div>
        <Field label="Tipo de negocio" name="tipoNegocio">
          <select
            id="tipoNegocio" name="tipoNegocio" required
            value={tipoSeleccionado} onChange={(e) => setTipo(e.target.value)}
            className={`${inputCls} bg-[#252525]`}
          >
            <option value="">Seleccioná una opción</option>
            {TIPOS.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>

        {segmento && (
          <div
            className="mt-2 flex items-start gap-2 px-3 py-2 border-l-2"
            style={{ borderColor: SEGMENTO_INFO[segmento].color, background: 'rgba(255,255,255,0.04)' }}
          >
            <div>
              <span
                className="font-mono text-[9px] tracking-[0.15em] uppercase font-semibold"
                style={{ color: SEGMENTO_INFO[segmento].color }}
              >
                Segmento: {SEGMENTO_INFO[segmento].label}
              </span>
              <p className="font-body text-[12px] text-paper/40 mt-[2px]">
                Al enviar recibís el <strong className="text-paper/60">{SEGMENTO_INFO[segmento].catalogo}</strong> en tu email.
              </p>
            </div>
          </div>
        )}
      </div>

      {!expandido && (
        <div className="pt-1 flex flex-col gap-3">
          <button
            type="button"
            disabled={!paso1Completo}
            onClick={() => setExpandido(true)}
            className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[18px] disabled:opacity-40 transition-opacity"
          >
            Continuar →
          </button>
          <button
            type="button"
            onClick={onBack}
            className="font-mono text-[10px] tracking-[0.1em] text-paper/40 uppercase hover:text-paper/70 transition-colors self-start"
          >
            ← Ya tengo acceso
          </button>
        </div>
      )}

      {/* PASO 2 */}
      {expandido && (
        <>
          <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
            <Field label="Empresa / Negocio" name="empresa" placeholder="Nombre del negocio" />
            <Field label="Email" name="email" type="email" placeholder="tu@email.com" />
          </div>

          <div className="grid grid-cols-2 gap-4 max-[480px]:grid-cols-1">
            <Field label="Ciudad" name="ciudad" placeholder="Ciudad" />
            <Field label="Provincia" name="provincia" placeholder="Provincia" />
          </div>

          <Field label="Dirección" name="direccion" placeholder="Calle, número, piso/dpto." required={false} />

          <Field
            label="CUIT / CUIL"
            name="cuit"
            placeholder="20-12345678-9"
            required={tipoSeleccionado === 'distribuidor'}
          />

          <Field label="Mensaje adicional" name="mensaje" required={false}>
            <textarea
              id="mensaje" name="mensaje" rows={3}
              placeholder="Contanos más sobre tu negocio (opcional)"
              className="w-full bg-[#252525] border border-[#383838] text-paper font-body text-[15px] px-4 py-3 outline-none focus:border-red transition-colors resize-none"
            />
          </Field>

          {state && 'error' in state && (
            <p className="font-mono text-[11px] tracking-[0.1em] text-red">{state.error}</p>
          )}

          <div className="pt-1 flex items-center gap-4 flex-wrap">
            <button
              type="submit"
              disabled={isPending}
              className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[18px] disabled:opacity-50 transition-opacity inline-flex items-center gap-2"
            >
              {isPending ? 'Enviando...' : 'Enviar solicitud →'}
            </button>
            <button
              type="button"
              onClick={() => setExpandido(false)}
              className="font-mono text-[10px] tracking-[0.1em] text-paper/40 uppercase hover:text-paper/70 transition-colors"
            >
              ← Volver
            </button>
          </div>

          <p className="font-mono text-[9px] tracking-[0.1em] text-paper/30 uppercase">
            * Campos obligatorios. No compartimos tu información con terceros.
          </p>
        </>
      )}
    </form>
  )
}
