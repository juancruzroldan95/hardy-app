'use client'

import { logout } from '@/repository/mutations/auth'
import { useTransition } from 'react'

export default function LogoutButton() {
  const [isPending, startTransition] = useTransition()

  return (
    <button
      onClick={() => startTransition(() => logout())}
      disabled={isPending}
      className="font-mono text-[11px] tracking-[0.12em] uppercase text-paper/50 hover:text-paper disabled:opacity-40 transition-colors text-left"
    >
      {isPending ? 'Saliendo...' : 'Salir →'}
    </button>
  )
}
