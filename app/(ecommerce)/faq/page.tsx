import type { Metadata } from 'next'
import Link from 'next/link'
import WhatsAppLink from '@/components/analytics/WhatsAppLink'

export const metadata: Metadata = {
  title: 'Preguntas frecuentes · Hardy',
  description:
    'Respondemos las preguntas más frecuentes sobre nuestros productos, ingredientes, envíos y compras mayoristas.',
  openGraph: {
    title: 'Preguntas frecuentes · Hardy',
    description:
      'Respondemos las preguntas más frecuentes sobre nuestros productos, ingredientes, envíos y compras mayoristas.',
    images: [
      {
        url: '/lifestyle/hero-duo-v2.png',
        width: 1200,
        height: 630,
        alt: 'Hardy — Preguntas frecuentes',
      },
    ],
  },
}

const WA_URL = 'https://wa.me/5491155244283'

const sections = [
  {
    label: 'Productos',
    items: [
      {
        q: '¿Qué ingredientes tiene la crema de maní?',
        a: 'Solo maní tostado seleccionado de Córdoba. Sin azúcar agregada, sin aceites vegetales, sin conservantes. Un solo ingrediente.',
      },
      {
        q: '¿Cuál es la diferencia entre Natural y Crunchy?',
        a: 'Natural es completamente cremosa y homogénea. Crunchy tiene trozos de maní que aportan textura y crocancia.',
      },
      {
        q: '¿La miel es pasteurizada?',
        a: 'No. Es miel cruda multifloral argentina, sin procesar ni pasteurizar para conservar todas sus propiedades.',
      },
      {
        q: '¿Tienen gluten?',
        a: 'No. Todos nuestros productos son libres de gluten.',
      },
      {
        q: '¿Son aptos para veganos?',
        a: 'Sí, la crema de maní es 100% vegana. La miel no es considerada vegana según algunas definiciones.',
      },
    ],
  },
  {
    label: 'Conservación',
    items: [
      {
        q: '¿Cómo conservo la crema de maní?',
        a: 'A temperatura ambiente, con el frasco bien cerrado y alejado de la luz directa. El aceite natural puede separarse — es completamente normal, solo revolvé antes de usar.',
      },
      {
        q: '¿Cuánto dura el producto?',
        a: '6 meses desde la fecha de elaboración indicada en el frasco.',
      },
      {
        q: '¿Necesita refrigeración?',
        a: 'No es necesario. De hecho, la refrigeración puede endurecer la crema y dificultar su uso.',
      },
    ],
  },
  {
    label: 'Envíos y compras',
    items: [
      {
        q: '¿Hacen envíos a todo el país?',
        a: 'Sí, despachamos por Andreani y OCA a todo Argentina. CABA y GBA en 48–72 hs hábiles, interior en 3–7 días hábiles.',
      },
      {
        q: '¿Cuánto cuesta el envío?',
        a: 'El costo depende del destino y el tamaño del pedido. Se calcula al momento del checkout.',
      },
      {
        q: '¿Cómo puedo comprar al por mayor?',
        a: 'A través de nuestro Portal Cliente. Podés solicitar acceso desde el portal y habilitamos tu cuenta según tu tipo de negocio.',
      },
      {
        q: '¿Tienen devoluciones?',
        a: 'Sí. Si recibís un producto defectuoso o dañado, contactanos dentro de los 10 días de recibido y lo solucionamos.',
      },
    ],
  },
  {
    label: 'Precio y marca',
    items: [
      {
        q: '¿Por qué Hardy tiene mejor precio que otras cremas de maní naturales?',
        a: 'Porque trabajamos directo con productores y sin intermediarios. Hardy es 100% maní — sin azúcar, sin aceites vegetales, sin emulsionantes. Sin relleno que encarezca el proceso y encarezca el producto. Obtenés más maní real por el mismo precio.',
      },
      {
        q: '¿Hardy tiene alguna relación con otra marca anterior?',
        a: 'Hardy es una marca independiente fundada en 2015. Arrancamos en Córdoba, hoy estamos en más de 200 puntos de venta en todo el país. No hay versión anterior ni marca paraguas — lo que ves es lo que es desde el día uno.',
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="bg-paper min-h-screen">
      {/* Hero */}
      <section className="bg-ink py-[80px] px-10 max-md:px-5 max-md:py-16">
        <div className="max-w-[800px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">
            ── Preguntas frecuentes
          </p>
          <h1
            className="font-heading font-medium text-paper tracking-[-0.02em] m-0"
            style={{ fontSize: 'clamp(36px,5vw,56px)', lineHeight: 1.1 }}
          >
            Todo lo que querés{' '}
            <em className="not-italic text-red">saber.</em>
          </h1>
          <p className="font-body text-paper/60 text-[16px] leading-[1.6] mt-4 mb-0 max-w-[520px]">
            Respondemos las dudas más comunes sobre nuestros productos, ingredientes,
            conservación y formas de compra.
          </p>
        </div>
      </section>

      {/* Secciones */}
      <section className="px-10 py-[80px] max-md:px-5 max-md:py-14">
        <div className="max-w-[800px] mx-auto space-y-[64px]">
          {sections.map((section) => (
            <div key={section.label}>
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-red mb-6">
                {section.label}
              </p>
              <div className="space-y-3">
                {section.items.map((item) => (
                  <div
                    key={item.q}
                    className="bg-paper border border-ink/8 px-7 py-6 max-md:px-5"
                  >
                    <h2 className="font-heading text-[17px] font-medium text-ink leading-[1.3] mb-2">
                      {item.q}
                    </h2>
                    <p className="font-body text-[14px] text-ink/70 leading-[1.7] m-0">
                      {item.a}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="bg-paper-2 border-t border-ink/10 px-10 py-[64px] max-md:px-5 max-md:py-12">
        <div className="max-w-[800px] mx-auto">
          <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-red mb-4">
            ── Contacto
          </p>
          <h2
            className="font-heading font-medium text-ink tracking-[-0.02em] mb-3"
            style={{ fontSize: 'clamp(24px,3.5vw,36px)', lineHeight: 1.15 }}
          >
            ¿Tu pregunta no está acá?
          </h2>
          <p className="font-body text-[15px] text-ink/60 leading-[1.6] mb-7 max-w-[480px]">
            Escribinos por WhatsApp y te respondemos a la brevedad.
          </p>
          <WhatsAppLink
            href={WA_URL}
            className="inline-block bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[18px] hover:opacity-90 transition-opacity"
          >
            Escribinos →
          </WhatsAppLink>
        </div>
      </section>
    </div>
  )
}
