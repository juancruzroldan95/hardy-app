'use server'

import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
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
    .where(eq(profiles.id, user.id))

  revalidatePath('/portal/perfil')
  return { success: true }
}
