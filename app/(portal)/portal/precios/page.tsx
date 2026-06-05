import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles, priceOverrides } from '@/drizzle/schema'
import { and, eq } from 'drizzle-orm'
import { getProducts, formatARS } from '@/lib/products'
import { ROLE_LABELS } from '@/lib/roles'
import PrintButton from './PrintButton'

export default async function PreciosPage() {
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
  const displayName = profile?.displayName ?? user.email ?? 'Cliente'

  const products = getProducts()

  // Separar frascos de baldes
  const frascos = products.filter((p) => p.line === 'frasco')
  const baldes  = products.filter((p) => p.line === 'balde')

  // Filtrar overrides del rol del usuario, agrupar por productId
  const overridesByProduct: Record<string, Array<{ minQty: number; priceArs: number }>> = {}
  for (const o of overrides) {
    if (o.role !== role) continue
    if (!overridesByProduct[o.productId]) overridesByProduct[o.productId] = []
    overridesByProduct[o.productId].push({ minQty: o.minQty, priceArs: Number(o.priceArs) })
  }
  // Ordenar tiers por minQty ascendente
  for (const key of Object.keys(overridesByProduct)) {
    overridesByProduct[key].sort((a, b) => a.minQty - b.minQty)
  }

  const today = new Date().toLocaleDateString('es-AR', {
    day:   '2-digit',
    month: 'long',
    year:  'numeric',
  })

  function ProductRow({ product }: { product: ReturnType<typeof getProducts>[number] }) {
    const tiers = overridesByProduct[product.id] ?? []
    const basePrice = tiers.length > 0 ? tiers[0].priceArs : product.price

    return (
      <tr className="border-b border-ink/10 last:border-0">
        <td className="py-4 pr-6 align-top">
          <p className="font-heading text-[15px] font-medium text-ink leading-snug">
            {product.name}
          </p>
          <p className="font-mono text-[9px] tracking-[0.15em] text-ink/40 uppercase mt-0.5">
            {product.variant} · {product.size}
          </p>
        </td>
        <td className="py-4 pr-6 align-top font-mono text-[14px] text-ink">
          {formatARS(basePrice)}
        </td>
        <td className="py-4 align-top">
          {tiers.length > 1 ? (
            <div className="flex flex-col gap-1">
              {tiers.map((tier, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="font-mono text-[9px] tracking-[0.1em] text-ink/40 uppercase w-[80px]">
                    desde {tier.minQty} u.
                  </span>
                  <span className="font-mono text-[12px] text-ink">
                    {formatARS(tier.priceArs)}
                  </span>
                </div>
              ))}
            </div>
          ) : tiers.length === 1 ? (
            <span className="font-mono text-[9px] tracking-[0.1em] text-ink/30 uppercase">
              Precio único
            </span>
          ) : (
            <span className="font-mono text-[9px] tracking-[0.1em] text-ink/30 uppercase">
              Precio base
            </span>
          )}
        </td>
      </tr>
    )
  }

  return (
    <>
      {/* Estilos de impresión */}
      <style>{`
        @media print {
          @page { margin: 20mm; }
          aside, nav { display: none !important; }
        }
      `}</style>

      <div className="max-w-[800px]">

        {/* Header */}
        <div className="flex items-start justify-between mb-10 print:mb-6">
          <div>
            <div className="font-display text-[32px] tracking-[0.06em] text-ink leading-none mb-1">
              HARDY
            </div>
            <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-red">
              Lista de Precios
            </p>
          </div>
          <PrintButton />
        </div>

        {/* Info del cliente */}
        <div className="bg-paper-2 border border-ink/8 px-6 py-5 mb-8 print:bg-white">
          <div className="grid grid-cols-3 gap-4 max-md:grid-cols-1">
            <div>
              <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink/40 mb-1">
                Cliente
              </p>
              <p className="font-body text-[14px] text-ink font-medium">{displayName}</p>
            </div>
            <div>
              <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink/40 mb-1">
                Segmento
              </p>
              <p className="font-mono text-[12px] tracking-[0.1em] uppercase text-red">
                {ROLE_LABELS[role]}
              </p>
            </div>
            <div>
              <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink/40 mb-1">
                Fecha
              </p>
              <p className="font-body text-[14px] text-ink">{today}</p>
            </div>
          </div>
        </div>

        {/* Frascos */}
        <section className="mb-10">
          <h2 className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink/50 border-b border-ink/10 pb-3 mb-0">
            ── Frascos
          </h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/10">
                <th className="py-3 pr-6 text-left font-mono text-[8px] tracking-[0.2em] uppercase text-ink/30">
                  Producto
                </th>
                <th className="py-3 pr-6 text-left font-mono text-[8px] tracking-[0.2em] uppercase text-ink/30">
                  Precio
                </th>
                <th className="py-3 text-left font-mono text-[8px] tracking-[0.2em] uppercase text-ink/30">
                  Descuentos por volumen
                </th>
              </tr>
            </thead>
            <tbody>
              {frascos.map((p) => (
                <ProductRow key={p.id} product={p} />
              ))}
            </tbody>
          </table>
        </section>

        {/* Baldes */}
        <section className="mb-12">
          <h2 className="font-mono text-[10px] tracking-[0.25em] uppercase text-ink/50 border-b border-ink/10 pb-3 mb-0">
            ── Baldes
          </h2>
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink/10">
                <th className="py-3 pr-6 text-left font-mono text-[8px] tracking-[0.2em] uppercase text-ink/30">
                  Producto
                </th>
                <th className="py-3 pr-6 text-left font-mono text-[8px] tracking-[0.2em] uppercase text-ink/30">
                  Precio
                </th>
                <th className="py-3 text-left font-mono text-[8px] tracking-[0.2em] uppercase text-ink/30">
                  Descuentos por volumen
                </th>
              </tr>
            </thead>
            <tbody>
              {baldes.map((p) => (
                <ProductRow key={p.id} product={p} />
              ))}
            </tbody>
          </table>
        </section>

        {/* Footer */}
        <div className="border-t border-ink/10 pt-6">
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/30">
            Precios en ARS sin IVA · Válidos al {today} · Hardy — Alimentá tu instinto
          </p>
        </div>

      </div>
    </>
  )
}
