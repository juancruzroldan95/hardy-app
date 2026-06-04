'use client'

import { useState, useActionState, useEffect } from 'react'
import { X } from 'lucide-react'
import { changePassword } from '@/lib/actions/profile'

function Field({
  label,
  name,
  placeholder,
}: {
  label: string
  name: string
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
        type="password"
        required
        placeholder={placeholder}
        className="w-full bg-paper-2 border border-ink/15 text-ink font-body text-[15px] px-4 py-3 outline-none focus:border-ink transition-colors"
      />
    </div>
  )
}

export default function PasswordChangeModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [state, action, isPending] = useActionState(changePassword, undefined)

  // Auto-close modal after success message
  useEffect(() => {
    if (state && 'success' in state) {
      const timer = setTimeout(() => {
        setIsOpen(false)
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [state])

  const closeModal = () => {
    if (!isPending) {
      setIsOpen(false)
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="text-ink font-mono text-[11px] tracking-[0.15em] uppercase border-b border-ink pb-0.5 hover:opacity-75 transition-opacity cursor-pointer"
      >
        Cambiar contraseña →
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-ink/80 z-[200] animate-fade-in"
            onClick={closeModal}
          />
          {/* Modal Container */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            <div className="bg-paper p-8 md:p-10 max-w-[440px] w-full border border-ink/10 relative shadow-2xl animate-zoom-in">
              {/* Close Button */}
              <button
                onClick={closeModal}
                disabled={isPending}
                className="absolute top-6 right-6 text-ink/40 hover:text-ink transition-colors cursor-pointer disabled:opacity-30"
                type="button"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>

              <p className="font-mono text-[10px] tracking-[0.25em] text-red uppercase mb-3">
                ── Seguridad
              </p>
              <h3 className="font-heading text-[22px] font-medium tracking-[-0.02em] mb-6">
                Cambiar contraseña
              </h3>

              <form action={action} className="flex flex-col gap-5">
                <Field
                  label="Contraseña actual"
                  name="currentPassword"
                  placeholder="••••••••"
                />

                <Field
                  label="Nueva contraseña"
                  name="newPassword"
                  placeholder="Mínimo 6 caracteres"
                />

                <Field
                  label="Confirmar nueva contraseña"
                  name="confirmPassword"
                  placeholder="Mínimo 6 caracteres"
                />

                {state && 'error' in state && (
                  <p className="font-mono text-[11px] tracking-[0.1em] text-red mt-1">
                    {state.error}
                  </p>
                )}

                {state && 'success' in state && (
                  <p className="font-mono text-[11px] tracking-[0.1em] text-[#2d6a35] mt-1">
                    Contraseña cambiada exitosamente. Cerrando...
                  </p>
                )}

                <div className="flex gap-4 mt-2">
                  <button
                    type="submit"
                    disabled={isPending || (state && 'success' in state)}
                    className="flex-1 bg-ink text-paper font-mono text-[11px] tracking-[0.15em] uppercase py-4 disabled:opacity-50 transition-opacity cursor-pointer"
                  >
                    {isPending ? 'Guardando...' : 'Guardar nueva contraseña →'}
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    disabled={isPending}
                    className="border border-ink/20 text-ink font-mono text-[11px] tracking-[0.15em] uppercase px-5 py-4 hover:bg-ink/5 disabled:opacity-50 transition-colors cursor-pointer"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </>
      )}
    </>
  )
}
