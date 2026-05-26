'use client'

import { useState, useTransition } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = searchParams.get('next') ?? '/portal'

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const email    = formData.get('email') as string
    const password = formData.get('password') as string

    startTransition(async () => {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })

      if (error) {
        setError('Credenciales incorrectas. Revisá tu email y contraseña.')
        return
      }

      router.push(next)
      router.refresh()
    })
  }

  return (
    <div className="w-full max-w-[400px]">
      <div className="mb-10 text-center">
        <div className="font-display text-[40px] tracking-[0.04em] text-paper leading-none">
          HARDY
        </div>
        <div className="font-mono text-[9px] tracking-[0.3em] text-red uppercase mt-1">
          Portal de Clientes
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label
            htmlFor="email"
            className="font-mono text-[10px] tracking-[0.15em] uppercase text-paper/60 block mb-2"
          >
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            autoComplete="email"
            className="w-full bg-[#252525] border border-[#383838] text-paper font-body text-[15px] px-4 py-3 outline-none focus:border-red transition-colors"
          />
        </div>

        <div>
          <label
            htmlFor="password"
            className="font-mono text-[10px] tracking-[0.15em] uppercase text-paper/60 block mb-2"
          >
            Contraseña
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="w-full bg-[#252525] border border-[#383838] text-paper font-body text-[15px] px-4 py-3 outline-none focus:border-red transition-colors"
          />
        </div>

        {error && (
          <p className="font-mono text-[11px] tracking-[0.1em] text-red">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={isPending}
          className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[18px] mt-2 disabled:opacity-50 transition-opacity"
        >
          {isPending ? 'Ingresando...' : 'Ingresar →'}
        </button>
      </form>
    </div>
  )
}
