import type { Metadata } from 'next'
import { getProducts } from '@/consts/products'
import { WA_NUMBER } from '@/consts/products'
import Image from 'next/image'
import Link from 'next/link'
import { MapPin, Zap, Package, MessageCircle } from 'lucide-react'
import { and, eq } from 'drizzle-orm'
import { db } from '@/db'
import { productReviews } from '@/db/schema'
import ProductCard from '@/components/store/ProductCard'
import type { ProductRating } from '@/components/store/ProductCard'

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Comprar crema de maní y miel HARDY. Envíos a todo Argentina.',
  openGraph: {
    title: 'Tienda — Hardy',
    description: 'Comprá crema de maní y miel 100% naturales. Envíos a todo Argentina.',
    images: [
      {
        url: '/lifestyle/og-tienda.png',
        width: 1200,
        height: 630,
        alt: 'Hardy — Tienda',
      },
    ],
  },
}

export default async function TiendaPage() {
  const products = getProducts()
  const frascos = products.filter((p) => p.line === 'frasco')

  // Agregados de reseñas publicadas por producto
  const reviews = await db.query.productReviews.findMany({
    where: and(eq(productReviews.isPublished, true), eq(productReviews.isDeleted, false)),
    columns: { productId: true, rating: true },
  })
  const ratingByProduct = new Map<string, ProductRating>()
  const acc = new Map<string, { sum: number; count: number }>()
  for (const r of reviews) {
    const cur = acc.get(r.productId) ?? { sum: 0, count: 0 }
    cur.sum += r.rating
    cur.count += 1
    acc.set(r.productId, cur)
  }
  for (const [pid, { sum, count }] of acc) {
    ratingByProduct.set(pid, { avg: sum / count, count })
  }

  return (
    <div className="bg-paper min-h-screen">
      {/* Hero */}
      <section className="bg-paper-2 border-b border-ink/10">
        <div className="max-w-[1240px] mx-auto grid grid-cols-2 items-center max-md:grid-cols-1">
          {/* Texto */}
          <div className="px-10 py-[72px] max-md:px-5 max-md:py-12 max-md:order-2">
            <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">── Tienda</p>
            <h1
              className="font-heading font-medium tracking-[-0.02em] m-0"
              style={{ fontSize: 'clamp(36px,5vw,56px)', lineHeight: 1.1 }}
            >
              Comprá <em className="not-italic text-red">directo.</em>
            </h1>
            <p className="text-[#666] text-[16px] mt-3 mb-0 max-w-[420px] leading-[1.6]">
              Enviamos a todo el país. Coordinamos el envío según tu zona y volumen. Pagás con Mercado Pago.
            </p>
          </div>
          {/* Imagen colección */}
          <div className="relative aspect-[16/10] max-md:order-1 overflow-hidden">
            <Image
              src="/lifestyle/tienda-hero-natural-miel.png"
              alt="HARDY — Crema de maní Natural y Miel Líquida"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>
        </div>
      </section>

      {/* Products */}
      <section className="py-[60px] px-10 bg-paper max-md:px-5 max-md:py-12">
        <div className="max-w-[1100px] mx-auto">

          {/* Frascos */}
          <div className="mb-5">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-red mb-1">── Frascos</div>
            <p className="text-[13px] text-[#888] m-0">Crema de maní y miel · 380g–500g · Por unidad</p>
          </div>
          <div className="grid grid-cols-4 gap-[2px] mb-[2px] max-md:grid-cols-2">
            {frascos.map((p) => (
              <ProductCard key={p.id} product={p} rating={ratingByProduct.get(p.id)} />
            ))}
          </div>

          {/* Baldes a granel — viven en /a-granel con "Consultar precio".
              Ver correcciones web HARDY P1.2: la tienda pública queda solo con frascos. */}
          <div className="mt-10 border border-ink/10 bg-paper-2 px-6 py-7 flex items-center justify-between gap-6 max-md:flex-col max-md:items-start">
            <div>
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-red mb-1">── A Granel · Baldes</div>
              <p className="text-[14px] text-ink m-0 max-w-[520px] leading-[1.6]">
                Crema de maní y miel en baldes de 4,5 kg, 6 kg, 23 kg y 30 kg. Para uso gastronómico, producción y reventa — con precio por volumen.
              </p>
            </div>
            <Link
              href="/a-granel"
              className="inline-block bg-ink text-paper font-mono text-[11px] tracking-[0.18em] uppercase px-7 py-[14px] no-underline whitespace-nowrap"
            >
              Ver a granel →
            </Link>
          </div>

        </div>
      </section>

      {/* JSON-LD structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'ItemList',
            name: 'Productos Hardy',
            description: 'Crema de maní y miel 100% naturales',
            itemListElement: frascos.map((p, i) => ({
              '@type': 'ListItem',
              position: i + 1,
              item: {
                '@type': 'Product',
                name: `Hardy ${p.name}`,
                description: p.desc,
                brand: { '@type': 'Brand', name: 'Hardy' },
                offers: {
                  '@type': 'Offer',
                  priceCurrency: 'ARS',
                  price: p.price,
                  availability: 'https://schema.org/InStock',
                  seller: { '@type': 'Organization', name: 'Hardy' },
                },
              },
            })),
          }),
        }}
      />

      {/* Banda editorial — Crunchy */}
      <section className="bg-ink">
        <div className="max-w-[1240px] mx-auto grid grid-cols-2 items-stretch max-md:grid-cols-1 md:[&>*:first-child]:order-2 md:[&>*:last-child]:order-1">
          <div className="relative aspect-[3/2] max-md:aspect-[16/10] overflow-hidden">
            <Image
              src="/lifestyle/tienda-crunchy-block.png"
              alt="Crema de maní HARDY Crunchy untada en tostada — textura con trozos visibles de maní"
              fill
              className="object-cover"
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-col justify-center px-10 py-14 max-md:px-5 max-md:py-12">
            <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">── Crunchy</p>
            <h2
              className="font-heading font-medium tracking-[-0.02em] text-paper m-0 mb-4 leading-[1.1]"
              style={{ fontSize: 'clamp(28px,4vw,44px)' }}
            >
              Con trozos de <em className="not-italic text-red">maní real.</em>
            </h2>
            <p className="font-body text-[14px] text-paper/60 leading-[1.7] max-w-[400px]">
              Mismo maní tostado de Córdoba, ahora con textura. Trozos crocantes en cada cucharada. Un ingrediente, dos personalidades.
            </p>
          </div>
        </div>
      </section>

      {/* Texturas reales */}
      <section className="bg-paper-2 py-[60px] px-10 max-md:px-5 max-md:py-12">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">── Textura real</p>
          <h2
            className="font-heading font-medium tracking-[-0.02em] m-0 mb-8 leading-[1.1]"
            style={{ fontSize: 'clamp(28px,4vw,44px)' }}
          >
            Se nota lo que <em className="not-italic text-red">no</em> tiene.
          </h2>
          <div className="grid grid-cols-3 gap-[2px] max-md:grid-cols-1">
            <div className="relative aspect-square overflow-hidden">
              <Image
                src="/lifestyle/tienda-textura-natural.png"
                alt="Crema de maní HARDY Natural — frasco abierto con cuchara"
                fill
                className="object-cover"
                sizes="(max-width: 900px) 100vw, 33vw"
              />
            </div>
            <div className="relative aspect-square overflow-hidden">
              <Image
                src="/lifestyle/tienda-textura-crunchy.png"
                alt="Crema de maní HARDY Crunchy — untada en tostada de pan integral"
                fill
                className="object-cover"
                sizes="(max-width: 900px) 100vw, 33vw"
              />
            </div>
            <div className="relative aspect-square overflow-hidden">
              <Image
                src="/lifestyle/tienda-textura-miel.png"
                alt="Miel líquida HARDY — chorreado de miel desde cucharón de madera"
                fill
                className="object-cover"
                sizes="(max-width: 900px) 100vw, 33vw"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Envíos */}
      <section className="bg-ink text-paper py-16 px-10 max-md:px-5">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 gap-[60px] items-center max-md:grid-cols-1 max-md:gap-10">
          <div>
            <div className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">── Envíos</div>
            <h2
              className="font-heading font-medium m-0 mb-4 leading-[1.1]"
              style={{ fontSize: 'clamp(26px,4vw,40px)' }}
            >
              Coordinamos el envío <em className="not-italic text-red">para vos.</em>
            </h2>
            <p className="text-[15px] text-[#bbb] leading-[1.7] m-0 mb-3">
              Enviamos a todo el país. El costo y el tiempo de entrega dependen de tu zona, el volumen del pedido y la urgencia — por eso lo coordinamos personalmente.
            </p>
            <p className="text-[15px] text-[#bbb] leading-[1.7] m-0 mb-7">
              Antes de finalizar tu compra, escribinos y te damos el detalle exacto del envío sin sorpresas.
            </p>
            <a
              href={`${WA_NUMBER}?text=Hola%20Hardy!%20Quiero%20saber%20el%20costo%20de%20env%C3%ADo%20a%20mi%20zona`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-red text-paper font-mono text-[11px] tracking-[0.18em] uppercase px-7 py-[14px] no-underline whitespace-nowrap"
            >
              Consultar envío →
            </a>
          </div>
          <div className="flex flex-col gap-[2px]">
            {[
              { Icon: MapPin,        t: 'Todo el país',     d: 'Llegamos a cualquier provincia. Coordinamos directamente con vos.' },
              { Icon: Zap,          t: 'Según tu urgencia', d: 'Si necesitás el pedido rápido, lo resolvemos. Hablamos y buscamos la mejor opción.' },
              { Icon: Package,      t: 'Según tu volumen',  d: 'El envío se calcula en función de lo que pedís — frascos, baldes o cajas mayoristas.' },
              { Icon: MessageCircle, t: 'Sin sorpresas',    d: 'Te confirmamos el costo antes de que pagues. Nada oculto, todo claro.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-[14px] items-start px-5 py-[18px]" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <f.Icon size={18} className="flex-shrink-0 mt-[2px] text-red" />
                <div>
                  <div className="font-body font-bold text-[14px] mb-1">{f.t}</div>
                  <div className="text-[13px] text-[#888] leading-[1.5]">{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
