import { db } from '@/db'
import { productReviews } from '@/db/schema'
import { eq, desc } from 'drizzle-orm'

export async function getAllReviews() {
  return db.query.productReviews.findMany({
    where: eq(productReviews.isDeleted, false),
    orderBy: [desc(productReviews.createdAt)],
  })
}
