'use client'

import { useActionState } from 'react'
import { updateClientEmailAdmin, updateClientPasswordAdmin } from '@/repository/mutations/admin'
import type { AdminAuthState } from '@/repository/mutations/admin'

interface Props {
  userId: string
  currentEmail: string
}

export default function ClientAuthForm({ userId, currentEmail }: Props) {
  const [emailState, emailAction, emailPending] = useActionState<AdminAuthState, FormData>(
    updateClientEmailAdmin,
    undefined,
  )
  const [passState, passAction, passPending] = useActionState<AdminAuthState, FormData>(
    updateClientPasswordAdmin,
    undefined,
  )

  return (
    <div className="space-y-8 pt-8 border-t border-ink/10">

      {/* Email */}
      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/40 mb-5">
          Cambiar email de acceso
        </p>
        <form action={emailAction} className="space-y-4">
          <input type="hidden" name="userId" value={userId} />
          <div>
            <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
              Nuevo email
            </label>
            <input
              type="email"
              name="email"
              required
              defaultValue={currentEmail}
              className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
            />
          </div>
          {emailState && 'error' in emailState && (
            <p className="font-mono text-[11px] tracking-[0.05em] text-red">{emailState.error}</p>
          )}
          {emailState && 'success' in emailState && (
            <p className="font-mono text-[11px] tracking-[0.05em] text-[#2d6a35]">✓ Email actualizado correctamente.</p>
          )}
          <button
            type="submit"
            disabled={emailPending}
            className="bg-ink text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-6 py-3 disabled:opacity-40 hover:bg-ink/80 transition-colors"
          >
            {emailPending ? 'Guardando...' : 'Cambiar email →'}
          </button>
        </form>
      </div>

      {/* Contraseña */}
      <div>
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/40 mb-5">
          Cambiar contraseña de acceso
        </p>
        <form action={passAction} className="space-y-4">
          <input type="hidden" name="userId" value={userId} />
          <div>
            <label className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/50 block mb-2">
              Nueva contraseña <span className="normal-case">(mín. 6 caracteres)</span>
            </label>
            <input
              type="password"
              name="password"
              required
              minLength={6}
              placeholder="Nueva contraseña"
              className="w-full bg-paper border border-ink/15 font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
            />
          </div>
          {passState && 'error' in passState && (
            <p className="font-mono text-[11px] tracking-[0.05em] text-red">{passState.error}</p>
          )}
          {passState && 'success' in passState && (
            <p className="font-mono text-[11px] tracking-[0.05em] text-[#2d6a35]">✓ Contraseña actualizada correctamente.</p>
          )}
          <button
            type="submit"
            disabled={passPending}
            className="bg-ink text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-6 py-3 disabled:opacity-40 hover:bg-ink/80 transition-colors"
          >
            {passPending ? 'Guardando...' : 'Cambiar contraseña →'}
          </button>
        </form>
      </div>

    </div>
  )
}
