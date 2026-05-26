import type { Metadata } from 'next'
import LoginForm from '@/components/portal/LoginForm'

export const metadata: Metadata = {
  title: 'HARDY — Ingresar',
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-ink flex items-center justify-center px-5">
      <LoginForm />
    </div>
  )
}
