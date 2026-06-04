import { redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import MarginCalculator from './MarginCalculator'

export default async function CalculadoraPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-[700px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">── Herramienta</p>
      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-1">
        Calculadora de margen
      </h1>
      <p className="font-body text-[14px] text-ink/50 mb-8">
        Calculá tu rentabilidad por producto antes de fijar el precio de reventa.
      </p>
      <MarginCalculator />
    </div>
  )
}
