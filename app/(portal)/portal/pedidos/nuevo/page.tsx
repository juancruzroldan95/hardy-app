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

interface Props {
  searchParams: Promise<{ repeat?: string }>
}

export default async function NuevoPedidoPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { repeat: repeatOrderId } = await searchParams

  const [profile, overrides] = await Promise.all([
    db.query.profiles.findFirst({
      where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
    }),
    db.query.priceOverrides.findMany({
      where: and(eq(priceOverrides.isDeleted, false), eq(priceOverrides.isActive, true)),
    }),
  ])

  const role = profile?.role ?? 'consumer'

  const overrideMap = new Map(
    overrides
      .filter((o) => o.role === role)
      .map((o) => [o.productId, { price: Number(o.priceArs), minQty: o.minQty }])
  )

  const products     = getProducts()
  const productosOrden: ProductOrden[] = products.map((p) => {
    const override      = overrideMap.get(p.id)
    const unitPrice     = override?.price ?? p.price
    const unitsPerBox   = p.unitsPerBox ?? 1
    return {
      id:           p.id,
      name:         p.name,
      variant:      p.variant,
      size:         p.size,
      image:        p.image,
      b2bPrice:     unitPrice,
      b2bPriceCaja: unitPrice * unitsPerBox,
      unitsPerBox,
      minQty:       override?.minQty ?? 1,
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

      <NuevoPedidoForm productos={productosOrden} initialQtys={initialQtys} />
    </div>
  )
}
