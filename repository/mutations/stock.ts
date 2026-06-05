'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { db } from '@/db'
import { profiles, productAvailability } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import type { StockStatus } from '@/db/schema'

export async function updateProductStock(
  productId: string,
  status:    StockStatus,
  notes:     string | null,
  stockQty?: number | null,
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (profile?.role !== 'admin') throw new Error('Unauthorized')

  // Auto-set status based on qty thresholds
  let resolvedStatus = status
  if (stockQty !== undefined && stockQty !== null) {
    if (stockQty === 0) resolvedStatus = 'out_of_stock'
    else if (stockQty <= 50 && status === 'available') resolvedStatus = 'low_stock'
  }

  const existing = await db.query.productAvailability.findFirst({
    where: eq(productAvailability.productId, productId),
  })

  if (existing) {
    await db.update(productAvailability)
      .set({
        status:          resolvedStatus,
        notes,
        stockQty:        stockQty ?? null,
        updatedByUserId: user.id,
        updatedAt:       new Date(),
      })
      .where(eq(productAvailability.productId, productId))
  } else {
    await db.insert(productAvailability).values({
      productId,
      status:          resolvedStatus,
      notes,
      stockQty:        stockQty ?? null,
      updatedByUserId: user.id,
    })
  }

  revalidatePath('/portal/admin/stock')
  revalidatePath('/portal/catalogo')
  revalidatePath('/portal/pedidos/nuevo')
}
