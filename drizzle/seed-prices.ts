/**
 * Seed script — precios B2B por rol y volumen
 * Ejecutar: npx tsx drizzle/seed-prices.ts
 *
 * Todos los precios son POR UNIDAD (sin IVA).
 * La app calcula precio/caja = priceArs × unitsPerBox.
 *
 * minQty = umbral TOTAL de cajas/baldes del pedido para activar el tier.
 *  - Frascos: se cuenta totalFrascoCajas (suma de cajas de todos los frascos)
 *  - Baldes:  se cuenta totalBaldes (suma de baldes de todos los tamaños)
 */
import 'dotenv/config'
import postgres from 'postgres'
import { drizzle } from 'drizzle-orm/postgres-js'
import { sql } from 'drizzle-orm'
import * as schema from './schema'

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) throw new Error('DATABASE_URL is required in .env.local')

const client = postgres(DATABASE_URL, { prepare: false, max: 1 })
const db = drizzle(client, { schema })

type Role = 'mayorista' | 'gastronomico' | 'distribuidor'

interface Tier {
  role: Role
  productId: string
  minQty: number
  priceArs: string // per-unit price
}

const TIERS: Tier[] = [
  // ── MAYORISTA — frascos ────────────────────────────────────────────────────────
  // Crema de Maní Natural/Crunchy · Frasco 380g · Caja x15u
  { role: 'mayorista', productId: 'natural-380',      minQty: 3,  priceArs: '3800' },
  { role: 'mayorista', productId: 'natural-380',      minQty: 5,  priceArs: '3600' },
  { role: 'mayorista', productId: 'natural-380',      minQty: 10, priceArs: '3300' },
  { role: 'mayorista', productId: 'natural-380',      minQty: 15, priceArs: '3000' },
  { role: 'mayorista', productId: 'crunchy-380',      minQty: 3,  priceArs: '3800' },
  { role: 'mayorista', productId: 'crunchy-380',      minQty: 5,  priceArs: '3600' },
  { role: 'mayorista', productId: 'crunchy-380',      minQty: 10, priceArs: '3300' },
  { role: 'mayorista', productId: 'crunchy-380',      minQty: 15, priceArs: '3000' },
  // Miel Líquida/Sólida · Frasco 500g · Caja x12u
  { role: 'mayorista', productId: 'miel-liquida-500', minQty: 3,  priceArs: '5000' },
  { role: 'mayorista', productId: 'miel-liquida-500', minQty: 5,  priceArs: '4700' },
  { role: 'mayorista', productId: 'miel-liquida-500', minQty: 10, priceArs: '4300' },
  { role: 'mayorista', productId: 'miel-liquida-500', minQty: 15, priceArs: '3900' },
  { role: 'mayorista', productId: 'miel-solida-500',  minQty: 3,  priceArs: '5000' },
  { role: 'mayorista', productId: 'miel-solida-500',  minQty: 5,  priceArs: '4700' },
  { role: 'mayorista', productId: 'miel-solida-500',  minQty: 10, priceArs: '4300' },
  { role: 'mayorista', productId: 'miel-solida-500',  minQty: 15, priceArs: '3900' },

  // ── DISTRIBUIDOR — frascos ─────────────────────────────────────────────────────
  { role: 'distribuidor', productId: 'natural-380',      minQty: 20, priceArs: '2700' },
  { role: 'distribuidor', productId: 'natural-380',      minQty: 30, priceArs: '2400' },
  { role: 'distribuidor', productId: 'crunchy-380',      minQty: 20, priceArs: '2700' },
  { role: 'distribuidor', productId: 'crunchy-380',      minQty: 30, priceArs: '2400' },
  { role: 'distribuidor', productId: 'miel-liquida-500', minQty: 20, priceArs: '3700' },
  { role: 'distribuidor', productId: 'miel-liquida-500', minQty: 30, priceArs: '3400' },
  { role: 'distribuidor', productId: 'miel-solida-500',  minQty: 20, priceArs: '3700' },
  { role: 'distribuidor', productId: 'miel-solida-500',  minQty: 30, priceArs: '3400' },
  // DISTRIBUIDOR — baldes (precio por balde)
  { role: 'distribuidor', productId: 'balde-45',      minQty: 1,  priceArs: '17708'  },
  { role: 'distribuidor', productId: 'balde-45',      minQty: 5,  priceArs: '16823'  },
  { role: 'distribuidor', productId: 'balde-45',      minQty: 10, priceArs: '15937'  },
  { role: 'distribuidor', productId: 'balde-23',      minQty: 1,  priceArs: '84750'  },
  { role: 'distribuidor', productId: 'balde-23',      minQty: 5,  priceArs: '80513'  },
  { role: 'distribuidor', productId: 'balde-23',      minQty: 10, priceArs: '76275'  },
  { role: 'distribuidor', productId: 'miel-balde-6',  minQty: 1,  priceArs: '40500'  },
  { role: 'distribuidor', productId: 'miel-balde-6',  minQty: 5,  priceArs: '38475'  },
  { role: 'distribuidor', productId: 'miel-balde-6',  minQty: 10, priceArs: '36450'  },
  { role: 'distribuidor', productId: 'miel-balde-30', minQty: 1,  priceArs: '180000' },
  { role: 'distribuidor', productId: 'miel-balde-30', minQty: 5,  priceArs: '171000' },
  { role: 'distribuidor', productId: 'miel-balde-30', minQty: 10, priceArs: '162000' },

  // ── GASTRONÓMICO — baldes (precio por balde) ───────────────────────────────────
  { role: 'gastronomico', productId: 'balde-45',      minQty: 1,  priceArs: '17708'  },
  { role: 'gastronomico', productId: 'balde-45',      minQty: 5,  priceArs: '16823'  },
  { role: 'gastronomico', productId: 'balde-45',      minQty: 10, priceArs: '15937'  },
  { role: 'gastronomico', productId: 'balde-23',      minQty: 1,  priceArs: '84750'  },
  { role: 'gastronomico', productId: 'balde-23',      minQty: 5,  priceArs: '80513'  },
  { role: 'gastronomico', productId: 'balde-23',      minQty: 10, priceArs: '76275'  },
  { role: 'gastronomico', productId: 'miel-balde-6',  minQty: 1,  priceArs: '40500'  },
  { role: 'gastronomico', productId: 'miel-balde-6',  minQty: 5,  priceArs: '38475'  },
  { role: 'gastronomico', productId: 'miel-balde-6',  minQty: 10, priceArs: '36450'  },
  { role: 'gastronomico', productId: 'miel-balde-30', minQty: 1,  priceArs: '180000' },
  { role: 'gastronomico', productId: 'miel-balde-30', minQty: 5,  priceArs: '171000' },
  { role: 'gastronomico', productId: 'miel-balde-30', minQty: 10, priceArs: '162000' },
]

async function main() {
  console.log('🗑  Soft-deleting existing price overrides...')
  await db.execute(sql`UPDATE price_overrides SET is_deleted = true, is_active = false`)

  console.log(`📦 Inserting ${TIERS.length} price tiers...`)
  await db.insert(schema.priceOverrides).values(
    TIERS.map((t) => ({
      role:      t.role,
      productId: t.productId,
      priceArs:  t.priceArs,
      minQty:    t.minQty,
    }))
  )

  console.log(`✅ Seeded ${TIERS.length} price tiers.`)
  await client.end()
}

main().catch((e) => { console.error(e); process.exit(1) })
