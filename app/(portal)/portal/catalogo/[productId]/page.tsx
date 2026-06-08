import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/services/supabase/server'
import { getProductById, formatARS, WA_NUMBER } from '@/consts/products'
import { getProfileByUserId } from '@/repository/queries/profile'
import { getActivePriceOverrides } from '@/repository/queries/stock'

interface Props {
  params: Promise<{ productId: string }>
}

export default async function ProductoDetailPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { productId } = await params
  const product = getProductById(productId)
  if (!product) notFound()

  const [profile, overrides] = await Promise.all([
    getProfileByUserId(user.id),
    getActivePriceOverrides(),
  ])

  const role = profile?.role ?? 'consumer'
  const roleOverrides = overrides.filter((o) => o.role === role && o.productId === product.id)
  roleOverrides.sort((a, b) => a.minQty - b.minQty)
  const baseOverride = roleOverrides[0] ?? null
  const b2bPrice = baseOverride ? Number(baseOverride.priceArs) : null

  const isBalde = product.line === 'balde'

  return (
    <div className="max-w-[860px]">
      <Link
        href="/portal/catalogo"
        className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/40 hover:text-ink transition-colors mb-6 block"
      >
        ← Volver al catálogo
      </Link>

      <div className="grid grid-cols-2 gap-10 mb-10 max-md:grid-cols-1 max-md:gap-6">
        {/* Imagen */}
        <div className="bg-paper-2 aspect-square flex items-center justify-center p-10">
          <Image
            src={product.image}
            alt={product.name}
            width={320}
            height={320}
            className="object-contain w-full h-full"
          />
        </div>

        {/* Info */}
        <div className="flex flex-col justify-center">
          <p className="font-mono text-[9px] tracking-[0.25em] text-red uppercase mb-2">
            {product.variant} · {product.size}
          </p>
          <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-3">
            {product.name}
          </h1>

          {product.tagline && (
            <p className="font-body text-[15px] text-ink/60 italic mb-5 leading-[1.6]">
              &ldquo;{product.tagline}&rdquo;
            </p>
          )}

          {product.detail && (
            <p className="font-body text-[14px] text-ink/70 leading-[1.7] mb-6">
              {product.detail}
            </p>
          )}

          {/* Diferencial tags */}
          {product.diferencial && (
            <div className="flex flex-wrap gap-2 mb-6">
              {product.diferencial.split(' · ').map((d) => (
                <span
                  key={d}
                  className="font-mono text-[9px] tracking-[0.12em] uppercase bg-paper-2 border border-ink/10 px-3 py-[5px] text-ink/60"
                >
                  {d}
                </span>
              ))}
            </div>
          )}

          {/* Precio B2B principal */}
          {b2bPrice ? (
            <div className="bg-ink text-paper px-5 py-4 mb-3">
              <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-paper/40 mb-1">
                Tu precio
              </p>
              <p className="font-heading text-[32px] font-medium">{formatARS(b2bPrice)}</p>
              <p className="font-mono text-[9px] tracking-[0.1em] text-paper/40 mt-[2px]">
                {isBalde ? 'por unidad' : 'por frasco · sin IVA'}
              </p>
              {!isBalde && product.unitsPerBox && (
                <p className="font-mono text-[10px] tracking-[0.1em] text-red mt-3">
                  Caja × {product.unitsPerBox} = {formatARS(b2bPrice * product.unitsPerBox)}
                </p>
              )}
            </div>
          ) : (
            <div className="bg-paper-2 border border-ink/10 px-5 py-4 mb-3">
              <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-ink/40 mb-1">
                Precio mayorista
              </p>
              <p className="font-body text-[15px] text-ink/60">Precio no configurado para tu segmento.</p>
              <a
                href={`${WA_NUMBER}?text=Hola%20Hardy%2C%20soy%20cliente%20del%20portal%20y%20quiero%20consultar%20el%20precio%20de%20${encodeURIComponent(product.name)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 font-mono text-[10px] tracking-[0.12em] uppercase text-red border-b border-red pb-[1px]"
              >
                Consultar por WhatsApp →
              </a>
            </div>
          )}

          {/* PVP — solo referencia para el revendedor */}
          <div className="bg-paper-2 border border-ink/8 px-5 py-3 mb-4">
            <p className="font-mono text-[8px] tracking-[0.15em] uppercase text-ink/30 mb-[2px]">
              PVP sugerido para reventa
            </p>
            <p className="font-mono text-[13px] text-ink/60">{formatARS(product.price)}</p>
          </div>

          {/* Escalas de precio por volumen */}
          {roleOverrides.length > 1 && (
            <div className="bg-paper border border-ink/8 px-5 py-3 mb-4">
              <p className="font-mono text-[8px] tracking-[0.15em] uppercase text-ink/40 mb-3">
                Descuentos por volumen
              </p>
              <div className="flex flex-col gap-2">
                {roleOverrides.map((tier, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <span className="font-mono text-[10px] text-ink/50">Desde {tier.minQty} u.</span>
                    <span className="font-mono text-[12px] text-ink font-medium">{formatARS(Number(tier.priceArs))}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Link
            href="/portal/pedidos/nuevo"
            className="bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[13px] text-center hover:bg-red/90 transition-colors"
          >
            Hacer un pedido →
          </Link>
        </div>
      </div>

      {/* Información nutricional */}
      {product.nutri && product.nutri.length > 0 && (
        <div className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/40 mb-4">
            ── Información nutricional
          </p>
          <div className="bg-paper border border-ink/8">
            {product.nutriLabel && (
              <div className="px-5 py-3 bg-paper-2 border-b border-ink/8">
                <p className="font-mono text-[10px] tracking-[0.1em] text-ink/50">
                  {product.nutriLabel}
                </p>
              </div>
            )}
            <div className="divide-y divide-ink/8">
              {product.nutri.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between px-5 py-3">
                  <span className="font-body text-[13px] text-ink/70">{label}</span>
                  <span className="font-mono text-[12px] text-ink font-medium">{value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lifestyle image */}
      {product.lifestyle && (
        <div className="bg-paper-2 overflow-hidden mb-6">
          <Image
            src={product.lifestyle}
            alt={`${product.name} — lifestyle`}
            width={860}
            height={400}
            className="w-full object-cover"
          />
        </div>
      )}
    </div>
  )
}
