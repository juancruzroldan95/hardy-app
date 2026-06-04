'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/services/supabase/server'
import { db } from '@/db'
import { profiles, deliveryAddresses } from '@/db/schema'
import { and, eq } from 'drizzle-orm'

async function getAuthProfile() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')
  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (!profile) redirect('/login')
  return { user, profile }
}

export type AddressState = { error: string } | { success: true } | undefined

export async function createDeliveryAddress(
  _prev: AddressState,
  formData: FormData,
): Promise<AddressState> {
  const { profile } = await getAuthProfile()

  const label      = (formData.get('label')      as string)?.trim()
  const address    = (formData.get('address')    as string)?.trim()
  const city       = (formData.get('city')       as string)?.trim() || null
  const province   = (formData.get('province')   as string)?.trim() || null
  const postalCode = (formData.get('postalCode') as string)?.trim() || null
  const notes      = (formData.get('notes')      as string)?.trim() || null
  const isDefault  = formData.get('isDefault') === 'true'

  if (!label)   return { error: 'El nombre de la dirección es requerido.' }
  if (!address) return { error: 'La dirección es requerida.' }

  // If setting as default, unset existing default
  if (isDefault) {
    await db.update(deliveryAddresses)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(eq(deliveryAddresses.profileId, profile.id), eq(deliveryAddresses.isDefault, true)))
  }

  await db.insert(deliveryAddresses).values({
    profileId: profile.id,
    label,
    address,
    city,
    province,
    postalCode,
    notes,
    isDefault,
  })

  revalidatePath('/portal/perfil')
  return { success: true }
}

export async function updateDeliveryAddress(
  id: string,
  _prev: AddressState,
  formData: FormData,
): Promise<AddressState> {
  const { profile } = await getAuthProfile()

  const label      = (formData.get('label')      as string)?.trim()
  const address    = (formData.get('address')    as string)?.trim()
  const city       = (formData.get('city')       as string)?.trim() || null
  const province   = (formData.get('province')   as string)?.trim() || null
  const postalCode = (formData.get('postalCode') as string)?.trim() || null
  const notes      = (formData.get('notes')      as string)?.trim() || null
  const isDefault  = formData.get('isDefault') === 'true'

  if (!label)   return { error: 'El nombre es requerido.' }
  if (!address) return { error: 'La dirección es requerida.' }

  if (isDefault) {
    await db.update(deliveryAddresses)
      .set({ isDefault: false, updatedAt: new Date() })
      .where(and(eq(deliveryAddresses.profileId, profile.id), eq(deliveryAddresses.isDefault, true)))
  }

  await db.update(deliveryAddresses)
    .set({ label, address, city, province, postalCode, notes, isDefault, updatedAt: new Date() })
    .where(and(eq(deliveryAddresses.id, id), eq(deliveryAddresses.profileId, profile.id)))

  revalidatePath('/portal/perfil')
  return { success: true }
}

export async function deleteDeliveryAddress(id: string) {
  const { profile } = await getAuthProfile()
  await db.update(deliveryAddresses)
    .set({ isDeleted: true, updatedAt: new Date() })
    .where(and(eq(deliveryAddresses.id, id), eq(deliveryAddresses.profileId, profile.id)))
  revalidatePath('/portal/perfil')
}

export async function setDefaultDeliveryAddress(id: string) {
  const { profile } = await getAuthProfile()

  await db.update(deliveryAddresses)
    .set({ isDefault: false, updatedAt: new Date() })
    .where(and(eq(deliveryAddresses.profileId, profile.id), eq(deliveryAddresses.isDefault, true)))

  await db.update(deliveryAddresses)
    .set({ isDefault: true, updatedAt: new Date() })
    .where(and(eq(deliveryAddresses.id, id), eq(deliveryAddresses.profileId, profile.id)))

  revalidatePath('/portal/perfil')
}
