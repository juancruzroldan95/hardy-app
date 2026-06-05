'use server'

import { db } from '@/db'
import { newsletterSubscribers } from '@/db/schema'
import { sql } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type NewsletterState =
  | { success: true }
  | { error: string }
  | undefined

export async function subscribeNewsletter(
  _prev: NewsletterState,
  formData: FormData,
): Promise<NewsletterState> {
  const email  = (formData.get('email')  as string)?.trim().toLowerCase()
  const name   = (formData.get('name')   as string)?.trim() || null
  const source = (formData.get('source') as string)?.trim() || 'footer'

  if (!email) return { error: 'Ingresá tu email.' }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: 'Ingresá un email válido.' }
  }

  try {
    // Si ya existe el email, no duplica: reactiva el registro si estaba borrado.
    await db
      .insert(newsletterSubscribers)
      .values({ email, name, source })
      .onConflictDoUpdate({
        target: newsletterSubscribers.email,
        set:    { isDeleted: false, isActive: true, updatedAt: new Date() },
      })

    revalidatePath('/portal/admin/suscriptores')
    return { success: true }
  } catch {
    return { error: 'No pudimos registrar tu email. Intentá de nuevo.' }
  }
}
