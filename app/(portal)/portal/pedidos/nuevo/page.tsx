import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, priceOverrides } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'
import { getProducts } from '@/lib/products'
import { ROLE_LABELS } from '@/lib/roles'
import NuevoPedidoForm from '@/components/portal/NuevoPedidoForm'
import type { ProductOrden } from '@/components/portal/NuevoPedidoForm'

export default async function NuevoPedidoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

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
    const override = overrideMap.get(p.id)
    return {
      id:       p.id,
      name:     p.name,
      variant:  p.variant,
      size:     p.size,
      image:    p.image,
      b2bPrice: override?.price ?? p.price,
      minQty:   override?.minQty ?? 1,
    }
  })

  return (
    <div className="max-w-[860px]">
      <Link
        href="/portal/catalogo"
        className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/40 hover:text-ink transition-colors mb-6 block"
      >
        ← Ver catálogo
      </Link>

      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">
        ── Nuevo pedido
      </p>
      <h1 className="font-heading text-[clamp(26px,3vw,38px)] font-medium leading-[1.1] tracking-[-0.02em] mb-1">
        Armá tu pedido
      </h1>
      <p className="font-body text-[14px] text-ink/50 mb-8">
        Segmento: {ROLE_LABELS[role]} · Precios en ARS sin IVA
      </p>

      <NuevoPedidoForm productos={productosOrden} />
    </div>
  )
}
