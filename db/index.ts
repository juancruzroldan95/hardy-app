import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import * as schema from '@/db/schema'

const client = postgres(process.env.DATABASE_URL!, {
  prepare: false,
  max:     process.env.NODE_ENV === 'production' ? 5 : 1,
})

export const db = drizzle(client, { schema })
