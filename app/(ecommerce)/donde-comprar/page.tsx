import type { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingBag, Store, Handshake } from 'lucide-react'
import { WA_NUMBER } from '@/consts/products'
import PdvMap from '@/components/store/PdvMap'
import WhatsAppLink from '@/components/analytics/WhatsAppLink'
import RevealSection from '@/components/ui/RevealSection'

export const metadata: Metadata = {
  title: 'Comprá Hardy',
  description: 'Comprá crema de maní y miel Hardy online o sumá la marca a tu negocio. Envíos a todo Argentina.',
  openGraph: {
    title: 'Comprá Hardy | HARDY',
    description: 'Comprá crema de maní y miel Hardy online o sumá la marca a tu negocio. Envíos a todo Argentina.',
  },
}

// primary: true → CTA con fondo rojo sólido (acción principal de la página)
// primary: false → CTA con borde rojo (acción secundaria)
const CARDS = [
  {
    Icon: ShoppingBag,
    title: 'Online — directo a tu casa',
    desc: 'Comprá en nuestra tienda con envío a todo el país. Pagás con Mercado Pago.',
    cta: 'Ir a la tienda →',
    href: '/tienda',
    external: false,
    primary: true,   // CTA principal de la página
  },
  {
    Icon: Store,
    title: 'Mayorista o gastronómico',
    desc: 'Si tenés un negocio, accedé a precios por volumen y formatos a granel.',
    cta: 'Acceder al portal →',
    href: '/portal',
    external: false,
    primary: false,
  },
  {
    Icon: Handshake,
    title: '¿Querés vender Hardy en tu local?',
    desc: 'Sumá Hardy a tu dietética, gimnasio, café o tienda. Te armamos una propuesta.',
    cta: 'Escribinos →',
    href: `${WA_NUMBER}?text=${encodeURIComponent('Hola Hardy, tengo un negocio y quiero vender sus productos')}`,
    external: true,
    primary: false,
  },
]

export default function DondeComprarPage() {
  return (
    <div className="min-h-screen bg-paper">

      {/* Hero */}
      <section className="bg-ink text-paper py-16 px-8 max-md:px-5">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">── Dónde comprar Hardy</p>
          <h1 className="font-heading text-[clamp(36px,5vw,56px)] font-medium leading-[1.1] tracking-[-0.02em] mb-4">
            Comprá <em className="not-italic text-red">HARDY.</em>
          </h1>
          <p className="font-body text-[16px] text-paper/60 max-w-[600px] leading-[1.7]">
            Hoy llegás a Hardy de tres formas. Elegí la que te quede mejor.
          </p>
        </div>
      </section>

      {/* Cards */}
      <section className="py-14 px-8 max-md:px-5">
        <div className="max-w-[1100px] mx-auto grid grid-cols-3 gap-[2px] max-md:grid-cols-1">
          {CARDS.map((c, i) => (
            <RevealSection key={c.title} delay={i * 100}>
              <div className="group transition-colors border-t-[3px] flex flex-col px-7 py-8 bg-paper-2 hover:bg-ink border-transparent hover:border-red h-full">
                <c.Icon size={24} className="mb-5 text-red" />
                <h2 className="font-heading text-[22px] font-medium leading-[1.15] m-0 mb-3 transition-colors group-hover:text-paper">
                  {c.title}
                </h2>
                <p className="font-body text-[14px] leading-[1.6] m-0 mb-7 flex-1 transition-colors text-[#666] group-hover:text-[#aaa]">
                  {c.desc}
                </p>
                {c.external ? (
                  <WhatsAppLink
                    href={c.href}
                    className="inline-block self-start font-mono text-[11px] tracking-[0.15em] uppercase px-5 py-[11px] transition-colors border border-red text-red group-hover:bg-red group-hover:text-paper"
                  >
                    {c.cta}
                  </WhatsAppLink>
                ) : (
                  <Link
                    href={c.href}
                    className="inline-block self-start font-mono text-[11px] tracking-[0.15em] uppercase px-5 py-[11px] transition-colors border border-red text-red group-hover:bg-red group-hover:text-paper"
                  >
                    {c.cta}
                  </Link>
                )}
              </div>
            </RevealSection>
          ))}
        </div>
      </section>

      {/* Presencia nacional — mapa de puntos de venta */}
      <section className="pb-20 px-8 max-md:px-5">
        <div className="max-w-[1100px] mx-auto">
          <RevealSection>
            <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">── Presencia nacional</p>
            <h2 className="font-heading text-[clamp(32px,4.5vw,52px)] font-medium leading-[1.1] tracking-[-0.02em] mb-4">
              De Ushuaia a <em className="not-italic text-red">Formosa.</em>
            </h2>
            <p className="font-body text-[16px] text-[#555] max-w-[600px] leading-[1.7] mb-9">
              Hardy está en dietéticas, gimnasios, distribuidoras y tiendas de todo el país. Y seguimos sumando.
            </p>
          </RevealSection>

          <PdvMap />

          {/* CTA — sumar puntos de venta */}
          <RevealSection delay={120} className="mt-10 bg-ink text-paper px-8 py-8 flex items-center justify-between gap-6 flex-wrap max-md:px-6">
            <p className="font-heading text-[clamp(20px,2.5vw,28px)] font-medium m-0 max-w-[520px] leading-[1.2]">
              ¿Querés ser punto de venta en tu zona?
            </p>
            <WhatsAppLink
              href={`${WA_NUMBER}?text=${encodeURIComponent('Hola Hardy, quiero ser punto de venta en mi zona')}`}
              className="bg-red text-paper font-mono text-[11px] tracking-[0.18em] uppercase px-7 py-[14px] whitespace-nowrap"
            >
              Escribinos →
            </WhatsAppLink>
          </RevealSection>
        </div>
      </section>
    </div>
  )
}
