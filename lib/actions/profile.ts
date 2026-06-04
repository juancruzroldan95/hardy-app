'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'
import { revalidatePath } from 'next/cache'

export type ProfileActionState = { success: true } | { error: string } | undefined

export async function updateProfile(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'No autenticado.' }

  const displayName = (formData.get('displayName') as string).trim()
  const phone       = (formData.get('phone') as string).trim()
  const company     = (formData.get('company') as string).trim()
  const address     = (formData.get('address') as string).trim()
  const city        = (formData.get('city') as string).trim()
  const province    = (formData.get('province') as string).trim()

  await db.update(profiles)
    .set({
      displayName: displayName || null,
      phone:       phone       || null,
      company:     company     || null,
      address:     address     || null,
      city:        city        || null,
      province:    province    || null,
      updatedAt:   new Date(),
    })
    .where(and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)))

  revalidatePath('/portal/perfil')
  return { success: true }
}

export async function changePassword(
  _prevState: ProfileActionState,
  formData: FormData
): Promise<ProfileActionState> {
  const currentPassword = formData.get('currentPassword') as string
  const newPassword     = formData.get('newPassword') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!currentPassword || !newPassword || !confirmPassword) {
    return { error: 'Todos los campos son obligatorios.' }
  }

  if (newPassword.length < 6) {
    return { error: 'La nueva contraseña debe tener al menos 6 caracteres.' }
  }

  if (newPassword !== confirmPassword) {
    return { error: 'Las nuevas contraseñas no coinciden.' }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user || !user.email) {
    return { error: 'No autenticado.' }
  }

  // Verify the current password by signing in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  })

  if (signInError) {
    return { error: 'La contraseña actual es incorrecta.' }
  }

  // Update password in Supabase auth
  const { error: updateError } = await supabase.auth.updateUser({
    password: newPassword,
  })

  if (updateError) {
    return { error: updateError.message }
  }

  return { success: true }
}

