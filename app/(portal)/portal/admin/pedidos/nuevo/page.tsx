import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, priceOverrides } from '@/drizzle/schema'
import { and, eq, ne } from 'drizzle-orm'
import { getProducts } from '@/lib/products'
import { ROLE_LABELS } from '@/lib/roles'
import AdminOrderForm from './AdminOrderForm'
import type { ProductOrden } from '@/components/portal/NuevoPedidoForm'

const FRASCO_IDS  = new Set(['natural-380', 'crunchy-380', 'miel-liquida-500', 'miel-solida-500'])
const BALDE_IDS   = new Set(['balde-45', 'balde-23', 'miel-balde-6', 'miel-balde-30'])
const ROLE_VISIBLE: Record<string, Set<string>> = {
  mayorista:    FRASCO_IDS,
  gastronomico: BALDE_IDS,
  distribuidor: new Set([...FRASCO_IDS, ...BALDE_IDS]),
  productor:    BALDE_IDS,
}
const MIN_ORDER_CAJAS: Record<string, number> = {
  mayorista:    3,
  distribuidor: 20,
}

interface Props {
  searchParams: Promise<{ clientId?: string }>
}

export default async function AdminNuevoPedidoPage({ searchParams }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminProfile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (adminProfile?.role !== 'admin') redirect('/portal')

  const { clientId } = await searchParams

  // ── Client list (always load for the selector) ──────────────────────────────
  const allClients = await db.query.profiles.findMany({
    where: and(
      eq(profiles.isDeleted, false),
      eq(profiles.isActive, true),
      ne(profiles.role, 'admin'),
    ),
    orderBy: (profiles, { asc }) => [asc(profiles.displayName)],
  })

  // ── If no client selected, show selector ────────────────────────────────────
  if (!clientId) {
    return (
      <div className="max-w-[600px]">
        <Link
          href="/portal/admin/pedidos"
          className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/40 hover:text-ink transition-colors mb-6 block"
        >
          ← Pedidos
        </Link>

        <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">── Admin</p>
        <h1 className="font-heading text-[clamp(26px,3vw,38px)] font-medium leading-[1.1] tracking-[-0.02em] mb-1">
          Crear pedido para cliente
        </h1>
        <p className="font-body text-[14px] text-ink/50 mb-8">
          Seleccioná el cliente para quien vas a cargar el pedido.
        </p>

        <div className="bg-paper border border-ink/8">
          {allClients.length === 0 ? (
            <p className="px-5 py-6 font-mono text-[11px] text-ink/40 text-center">
              No hay clientes disponibles.
            </p>
          ) : (
            allClients.map((c) => (
              <Link
                key={c.id}
                href={`/portal/admin/pedidos/nuevo?clientId=${c.id}`}
                className="flex items-center justify-between px-5 py-4 border-b border-ink/8 last:border-0 hover:bg-paper-2 transition-colors group"
              >
                <div>
                  <div className="font-body font-semibold text-[14px] group-hover:text-red transition-colors">
                    {c.displayName ?? c.company ?? 'Sin nombre'}
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.12em] text-red uppercase mt-[2px]">
                    {ROLE_LABELS[c.role] ?? c.role}
                    {c.company && ` · ${c.company}`}
                    {c.city && ` · ${c.city}`}
                  </div>
                </div>
                <span className="font-mono text-[10px] text-ink/30 group-hover:text-red transition-colors">→</span>
              </Link>
            ))
          )}
        </div>
      </div>
    )
  }

  // ── Load selected client ─────────────────────────────────────────────────────
  const clientProfile = allClients.find((c) => c.id === clientId)
  if (!clientProfile) redirect('/portal/admin/pedidos/nuevo')

  const role = clientProfile.role

  // Load price overrides for client's role
  const allOverrides = await db.query.priceOverrides.findMany({
    where: and(eq(priceOverrides.isDeleted, false), eq(priceOverrides.isActive, true)),
  })

  const products = getProducts()

  // Build tier map
  const tiersByProduct = new Map<string, Array<{ minQty: number; pricePerUnit: number; pricePerCaja: number }>>()
  allOverrides
    .filter((o) => o.role === role)
    .sort((a, b) => a.minQty - b.minQty)
    .forEach((o) => {
      const product = products.find((p) => p.id === o.productId)
      const upb = product?.unitsPerBox ?? 1
      const perUnit = Number(o.priceArs)
      if (!tiersByProduct.has(o.productId)) tiersByProduct.set(o.productId, [])
      tiersByProduct.get(o.productId)!.push({
        minQty:       o.minQty,
        pricePerUnit: perUnit,
        pricePerCaja: perUnit * upb,
      })
    })

  const visibleIds    = ROLE_VISIBLE[role] ?? new Set([...FRASCO_IDS, ...BALDE_IDS])
  const minTotalCajas = MIN_ORDER_CAJAS[role] ?? 1

  const productosOrden: ProductOrden[] = products
    .filter((p) => visibleIds.has(p.id))
    .map((p) => {
      const tiers    = tiersByProduct.get(p.id) ?? []
      const upb      = p.unitsPerBox ?? 1
      const baseUnit = tiers[0]?.pricePerUnit ?? p.price
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

  return (
    <div className="max-w-[860px]">
      <Link
        href="/portal/admin/pedidos/nuevo"
        className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/40 hover:text-ink transition-colors mb-6 block"
      >
        ← Cambiar cliente
      </Link>

      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">── Admin · Nuevo pedido</p>
      <h1 className="font-heading text-[clamp(26px,3vw,38px)] font-medium leading-[1.1] tracking-[-0.02em] mb-1">
        Pedido para {clientProfile.displayName ?? clientProfile.company ?? 'cliente'}
      </h1>
      <p className="font-body text-[14px] text-ink/50 mb-8">
        Segmento: {ROLE_LABELS[role]} · Precios en ARS sin IVA
      </p>

      {/* Client info banner */}
      <div className="bg-ink text-paper px-5 py-4 mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-red mb-1">── Cliente</p>
          <p className="font-body font-semibold text-[15px]">
            {clientProfile.displayName ?? clientProfile.company ?? 'Sin nombre'}
          </p>
          {clientProfile.company && clientProfile.displayName && (
            <p className="font-mono text-[11px] text-paper/50">{clientProfile.company}</p>
          )}
        </div>
        <div className="text-right">
          {clientProfile.phone && (
            <p className="font-mono text-[11px] text-paper/50">{clientProfile.phone}</p>
          )}
          {clientProfile.city && (
            <p className="font-mono text-[11px] text-paper/50">{clientProfile.city}{clientProfile.province ? `, ${clientProfile.province}` : ''}</p>
          )}
        </div>
      </div>

      <AdminOrderForm
        clientUserId={clientProfile.userId}
        clientPhone={clientProfile.phone}
        clientName={clientProfile.displayName ?? clientProfile.company}
        productos={productosOrden}
        minTotalCajas={minTotalCajas}
        roleName={ROLE_LABELS[role] ?? role}
      />
    </div>
  )
}
