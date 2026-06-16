import { redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { getProfileByUserId } from '@/repository/queries/profile'
import { getActivePriceOverrides } from '@/repository/queries/stock'
import { getProducts } from '@/consts/products'
import { ROLE_LABELS } from '@/consts/roles'

export default async function CatalogoPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error('Timeout al cargar catálogo')), 8_000)
  )
  const [profile, overrides] = await Promise.race([
    Promise.all([
      getProfileByUserId(user.id),
      getActivePriceOverrides(),
    ]),
    timeout,
  ])

  const role = profile?.role ?? 'consumer'

  const products = getProducts()

  // Mapa de overrides para el rol del usuario
  const overrideMap = new Map(
    overrides
      .filter((o) => o.role === role)
      .map((o) => [o.productId, { price: Number(o.priceArs), minQty: o.minQty }])
  )

  const productosCatalogo = products.map((p) => {
    const override = overrideMap.get(p.id)
    return {
      ...p,
      b2bPrice: override?.price ?? p.price,
      minQty: override?.minQty ?? 1,
      hasOverride: !!override,
    }
  })

  const frascos = productosCatalogo.filter((p) => p.line === 'frasco')
  const baldes  = productosCatalogo.filter((p) => p.line !== 'frasco')

  // Catálogo PDF por rol
  const catalogoPDF: Record<string, string | null> = {
    mayorista:    '/catalogos/catalogo-mayorista.pdf',
    gastronomico: '/catalogos/catalogo-gastronomico.pdf',
    distribuidor: '/catalogos/catalogo-distribuidor.pdf',
    productor:    '/catalogos/catalogo-distribuidor.pdf',
    consumer:     null,
    admin:        null,
  }
  const pdfUrl = catalogoPDF[role] ?? null

  return (
    <div className="max-w-[1000px]">
      <div className="flex items-center justify-between mb-2 flex-wrap gap-4">
        <div>
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">
            ── Catálogo B2B
          </p>
          <h1 className="font-heading text-[clamp(26px,3vw,38px)] font-medium leading-[1.1] tracking-[-0.02em]">
            Catálogo de productos
          </h1>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          {pdfUrl && (
            <a
              href={pdfUrl}
              download
              className="bg-paper-2 border border-ink/15 text-ink font-mono text-[11px] tracking-[0.15em] uppercase px-5 py-[12px] whitespace-nowrap hover:bg-paper transition-colors"
            >
              ↓ Descargar catálogo PDF
            </a>
          )}
          <Link
            href="/portal/pedidos/nuevo"
            className="bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[13px] whitespace-nowrap"
          >
            Hacer un pedido →
          </Link>
        </div>
      </div>
      <p className="font-mono text-[10px] tracking-[0.12em] text-ink/40 uppercase mb-10">
        Segmento: {ROLE_LABELS[role]} — Los precios se aplican al armar el pedido
      </p>

      {/* Frascos */}
      <div className="mb-10">
        <p className="font-mono text-[10px] tracking-[0.2em] text-ink/40 uppercase mb-3">
          ── Frascos
        </p>
        <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
          {frascos.map((p) => (
            <Link
              key={p.id}
              href={`/portal/catalogo/${p.id}`}
              className="flex items-center gap-5 px-5 py-4 hover:bg-paper-2 transition-colors group"
            >
              <Image
                src={p.image}
                alt={p.name}
                width={48}
                height={48}
                className="object-contain shrink-0"
              />
              <div className="flex-1 min-w-0">
                <div className="font-body font-semibold text-[14px] text-ink truncate">{p.name}</div>
                <div className={`font-mono text-[9px] tracking-[0.15em] uppercase mt-[2px] ${p.variant === 'Natural' ? 'text-red' : 'text-ink/50'}`}>
                  {p.variant} · {p.size}
                </div>
                {p.diferencial && (
                  <div className="font-mono text-[9px] tracking-[0.06em] text-ink/40 mt-[4px] truncate">
                    {p.diferencial}
                  </div>
                )}
              </div>
              <div className="font-mono text-[10px] tracking-[0.1em] text-ink/30 group-hover:text-ink/50 transition-colors shrink-0">
                Ver →
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Baldes / A granel */}
      {baldes.length > 0 && (
        <div className="mb-10">
          <p className="font-mono text-[10px] tracking-[0.2em] text-ink/40 uppercase mb-3">
            ── A granel
          </p>
          <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
            {baldes.map((p) => (
              <Link
                key={p.id}
                href={`/portal/catalogo/${p.id}`}
                className="flex items-center gap-5 px-5 py-4 hover:bg-paper-2 transition-colors group"
              >
                <Image
                  src={p.image}
                  alt={p.name}
                  width={48}
                  height={48}
                  className="object-contain shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-body font-semibold text-[14px] text-ink truncate">{p.name}</div>
                  <div className="font-mono text-[9px] tracking-[0.15em] text-ink/50 uppercase mt-[2px]">
                    {p.variant} · {p.size}
                  </div>
                  {p.diferencial && (
                    <div className="font-mono text-[9px] tracking-[0.06em] text-ink/40 mt-[4px] truncate">
                      {p.diferencial}
                    </div>
                  )}
                </div>
                <div className="font-mono text-[10px] tracking-[0.1em] text-ink/30 group-hover:text-ink/50 transition-colors shrink-0">
                  Ver →
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Note */}
      <div className="bg-ink/5 border border-ink/8 px-6 py-5">
        <p className="font-body text-[13px] text-ink/50 leading-[1.6]">
          Los precios incluyen el listado actualizado para tu segmento. Para consultar disponibilidad,
          condiciones de pago o coordinar un pedido especial, contactanos por{' '}
          <a
            href="https://wa.me/5491135736956"
            target="_blank"
            rel="noopener noreferrer"
            className="text-ink border-b border-ink/40"
          >
            WhatsApp
          </a>.
        </p>
      </div>
    </div>
  )
}
