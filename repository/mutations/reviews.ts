'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { db } from '@/db'
import { profiles, productReviews } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

export type ReviewState = { error: string } | { success: true } | undefined

export async function submitProductReview(
  _prev: ReviewState,
  formData: FormData,
): Promise<ReviewState> {
  const productId    = (formData.get('productId')    as string)?.trim()
  const reviewerName = (formData.get('reviewerName') as string)?.trim()
  const ratingStr    = formData.get('rating') as string
  const comment      = (formData.get('comment')     as string)?.trim() || null

  if (!productId)    return { error: 'Producto requerido.' }
  if (!reviewerName) return { error: 'Tu nombre es requerido.' }

  const rating = parseInt(ratingStr, 10)
  if (isNaN(rating) || rating < 1 || rating > 5) return { error: 'Calificación inválida (1–5).' }

  await db.insert(productReviews).values({
    productId,
    reviewerName,
    rating,
    comment,
    isPublished: false, // pending admin approval
  })

  revalidatePath('/tienda')
  revalidatePath(`/tienda/${productId}`)
  return { success: true }
}

export async function publishReview(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (profile?.role !== 'admin') redirect('/portal')

  await db.update(productReviews)
    .set({ isPublished: true, updatedAt: new Date() })
    .where(eq(productReviews.id, id))

  revalidatePath('/tienda')
}

export async function deleteReview(id: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (profile?.role !== 'admin') redirect('/portal')

  await db.update(productReviews)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(eq(productReviews.id, id))

  revalidatePath('/tienda')
}
