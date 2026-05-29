import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, priceOverrides, orders, orderItems } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'
import { getProducts } from '@/lib/products'
import { ROLE_LABELS } from '@/lib/roles'
import NuevoPedidoForm from '@/components/portal/NuevoPedidoForm'
import type { ProductOrden } from '@/components/portal/NuevoPedidoForm'

// Products visible per role
const FRASCO_IDS  = new Set(['natural-380', 'crunchy-380', 'miel-liquida-500', 'miel-solida-500'])
const BALDE_IDS   = new Set(['balde-45', 'balde-23', 'miel-balde-6', 'miel-balde-30'])
const ROLE_VISIBLE: Record<string, Set<string>> = {
  mayorista:    FRASCO_IDS,
  gastronomico: BALDE_IDS,
  distribuidor: new Set([...FRASCO_IDS, ...BALDE_IDS]),
}

// Minimum total cajas per role (for frasco products)
const MIN_ORDER_CAJAS: Record<string, number> = {
  mayorista:    3,
  distribuidor: 20,
}

interface Props {
  searchParams: Promise<{ repeat?: string }>
}

export default async function NuevoPedidoPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { repeat: repeatOrderId } = await searchParams

  const [profile, allOverrides] = await Promise.all([
    db.query.profiles.findFirst({
      where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
    }),
    db.query.priceOverrides.findMany({
      where: and(eq(priceOverrides.isDeleted, false), eq(priceOverrides.isActive, true)),
    }),
  ])

  const role = profile?.role ?? 'consumer'

  // Group all tiers for this role by productId, sorted by minQty ascending
  const tiersByProduct = new Map<string, Array<{ minQty: number; pricePerUnit: number; pricePerCaja: number }>>()
  const products = getProducts()

  allOverrides
    .filter((o) => o.role === role)
    .sort((a, b) => a.minQty - b.minQty)
    .forEach((o) => {
      const product    = products.find((p) => p.id === o.productId)
      const upb        = product?.unitsPerBox ?? 1
      const perUnit    = Number(o.priceArs)
      if (!tiersByProduct.has(o.productId)) tiersByProduct.set(o.productId, [])
      tiersByProduct.get(o.productId)!.push({
        minQty:       o.minQty,
        pricePerUnit: perUnit,
        pricePerCaja: perUnit * upb,
      })
    })

  const minTotalCajas = MIN_ORDER_CAJAS[role] ?? 1
  const visibleIds    = ROLE_VISIBLE[role]

  const productosOrden: ProductOrden[] = products
    .filter((p) => !visibleIds || visibleIds.has(p.id))
    .map((p) => {
      const tiers      = tiersByProduct.get(p.id) ?? []
      const firstTier  = tiers[0]
      const upb        = p.unitsPerBox ?? 1
      const baseUnit   = firstTier?.pricePerUnit ?? p.price
      return {
        id:           p.id,
        name:         p.name,
        variant:      p.variant,
        size:         p.size,
        image:        p.image,
        b2bPrice:     baseUnit,
        b2bPriceCaja: baseUnit * upb,
        unitsPerBox:  upb,
        priceTiers:   tiers,
        isBalde:      BALDE_IDS.has(p.id),
      }
    })

  // Load previous order items if ?repeat= is present
  let initialQtys: Record<string, number> | undefined
  let isRepeatOrder = false

  if (repeatOrderId) {
    const prevOrder = await db.query.orders.findFirst({
      where: and(
        eq(orders.id, repeatOrderId),
        eq(orders.userId, user.id),
        eq(orders.isDeleted, false),
      ),
      with: {
        items: { where: eq(orderItems.isDeleted, false) },
      },
    })

    if (prevOrder?.items?.length) {
      initialQtys = Object.fromEntries(
        prevOrder.items.map((item) => [item.productId, item.qty])
      )
      isRepeatOrder = true
    }
  }

  return (
    <div className="max-w-[860px]">
      <Link
        href="/portal/pedidos"
        className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/40 hover:text-ink transition-colors mb-6 block"
      >
        ← Mis pedidos
      </Link>

      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">
        ── {isRepeatOrder ? 'Repetir pedido' : 'Nuevo pedido'}
      </p>
      <h1 className="font-heading text-[clamp(26px,3vw,38px)] font-medium leading-[1.1] tracking-[-0.02em] mb-1">
        {isRepeatOrder ? 'Repetí tu último pedido' : 'Armá tu pedido'}
      </h1>
      <p className="font-body text-[14px] text-ink/50 mb-8">
        Segmento: {ROLE_LABELS[role]} · Precios en ARS sin IVA
        {isRepeatOrder && ' · Cantidades pre-cargadas del pedido anterior'}
      </p>

      {isRepeatOrder && (
        <div className="bg-[#f0f7f0] border border-[#c6dfc7] px-5 py-4 mb-6 flex items-center gap-3">
          <span className="text-[#2d6a35] text-[18px]">↺</span>
          <p className="font-mono text-[11px] tracking-[0.08em] text-[#2d6a35]">
            Cantidades pre-cargadas del pedido anterior. Modificá lo que necesites antes de confirmar.
          </p>
        </div>
      )}

      <NuevoPedidoForm
        productos={productosOrden}
        initialQtys={initialQtys}
        minTotalCajas={minTotalCajas}
        roleName={ROLE_LABELS[role] ?? role}
      />
    </div>
  )
}
