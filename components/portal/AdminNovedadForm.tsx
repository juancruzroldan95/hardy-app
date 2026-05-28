'use client'

import { useActionState } from 'react'
import type { NovedadState } from '@/lib/actions/admin'

interface Props {
  action: (prevState: NovedadState, formData: FormData) => Promise<NovedadState>
  defaultValues?: {
    titulo:   string
    cuerpo:   string
    imageUrl: string
  }
  submitLabel?: string
}

export default function AdminNovedadForm({
  action,
  defaultValues,
  submitLabel = 'Publicar novedad →',
}: Props) {
  const [state, formAction, isPending] = useActionState<NovedadState, FormData>(
    action,
    undefined,
  )

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <div>
        <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/60 block mb-2">
          Título *
        </label>
        <input
          type="text"
          name="titulo"
          required
          defaultValue={defaultValues?.titulo}
          placeholder="Ej: Nuevos precios para mayoristas — Junio 2026"
          className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
        />
      </div>

      <div>
        <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/60 block mb-2">
          Cuerpo *
        </label>
        <textarea
          name="cuerpo"
          rows={6}
          required
          defaultValue={defaultValues?.cuerpo}
          placeholder="Escribí el contenido de la novedad..."
          className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors resize-none"
        />
      </div>

      <div>
        <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/60 block mb-2">
          URL de imagen (opcional)
        </label>
        <input
          type="url"
          name="imageUrl"
          defaultValue={defaultValues?.imageUrl}
          placeholder="https://..."
          className="w-full bg-paper-2 border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
        />
        <p className="font-mono text-[9px] tracking-[0.1em] text-ink/30 mt-1">
          URL pública de una imagen (jpg, png). Se mostrará arriba del texto.
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
        className="bg-ink text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[16px] disabled:opacity-40 transition-opacity self-start"
      >
        {isPending ? 'Guardando...' : submitLabel}
      </button>
    </form>
  )
}
