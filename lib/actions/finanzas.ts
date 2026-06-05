'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, costs } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'

async function getAdminUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (profile?.role !== 'admin') redirect('/portal')
  return user
}

export type CostState = { error: string } | { success: true } | undefined

export async function createCost(_prev: CostState, formData: FormData): Promise<CostState> {
  const user = await getAdminUser()

  const concept  = (formData.get('concept')  as string)?.trim()
  const category = (formData.get('category') as string)?.trim() || null
  const amountRaw = (formData.get('amount')  as string)?.trim()
  const costDate = (formData.get('costDate') as string)?.trim()
  const notes    = (formData.get('notes')    as string)?.trim() || null

  if (!concept)  return { error: 'Ingresá el concepto del costo.' }
  if (!costDate) return { error: 'Ingresá la fecha del costo.' }

  const amount = Number(amountRaw?.replace(/\./g, '').replace(',', '.'))
  if (!amount || isNaN(amount) || amount <= 0) {
    return { error: 'Ingresá un monto válido.' }
  }

  await db.insert(costs).values({
    concept,
    category,
    amountArs:       amount.toFixed(2),
    costDate,
    notes,
    createdByUserId: user.id,
  })

  revalidatePath('/portal/admin/finanzas')
  return { success: true }
}

export async function deleteCost(id: string) {
  await getAdminUser()
  await db.update(costs)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(costs.id, id))
  revalidatePath('/portal/admin/finanzas')
}
