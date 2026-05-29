'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, productAvailability } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'
import type { StockStatus } from '@/drizzle/schema'

export async function updateProductStock(
  productId: string,
  status:    StockStatus,
  notes:     string | null,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  // Upsert: update if exists, insert if not
  const existing = await db.query.productAvailability.findFirst({
    where: eq(productAvailability.productId, productId),
  })

  if (existing) {
    await db.update(productAvailability)
      .set({ status, notes, updatedByUserId: user.id, updatedAt: new Date() })
      .where(eq(productAvailability.productId, productId))
  } else {
    await db.insert(productAvailability).values({
      productId,
      status,
      notes,
      updatedByUserId: user.id,
    })
  }

  revalidatePath('/portal/admin/stock')
  revalidatePath('/portal/catalogo')
  revalidatePath('/portal/pedidos/nuevo')
}
