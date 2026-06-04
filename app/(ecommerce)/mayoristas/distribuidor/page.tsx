import type { Metadata } from 'next'
import { WA_NUMBER } from '@/consts/products'

export const metadata: Metadata = {
  title: 'Distribuidores — Hardy',
  description:
    'Distribuí crema de maní y miel Hardy en tu zona. Dos productos premium, una sola marca, precio competitivo por volumen.',
}

const ESCALA_DIST = [
  { l: 'Entrada distribuidor', v: '30 cajas', s: '450 unidades' },
  { l: 'Volumen medio', v: '60 cajas', s: '900 unidades' },
  { l: 'Volumen alto', v: '+100 cajas', s: 'Precio a negociar' },
]

export default function DistribuidorPage() {
  return (
    <div className="bg-paper text-ink">

      {/* HERO */}
      <section className="bg-ink text-paper pt-[100px] pb-20 px-10 max-md:px-6 max-md:pt-16">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-5">── Distribuidores</p>
          <h1
            className="font-heading font-medium tracking-[-0.02em] leading-[1.05] m-0 mb-6"
            style={{ fontSize: 'clamp(42px,6vw,72px)' }}
          >
            Distribuí Hardy<br /><em className="not-italic text-red">en tu zona.</em>
          </h1>
          <p className="text-[17px] text-[#bbb] max-w-[620px] leading-[1.7] mb-10">
            Crema de maní y miel Hardy para tu portfolio de distribución. Dos productos premium,
            una sola marca, precio competitivo por volumen.
          </p>
          <a
            href={`${WA_NUMBER}?text=Hola%20Hardy,%20soy%20distribuidor%20y%20quiero%20información`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red text-paper font-mono text-[12px] tracking-[0.2em] uppercase px-8 py-4"
          >
            Consultar por WhatsApp →
          </a>
        </div>
      </section>

      {/* QUÉ DISTRIBUÍS + ESCALA */}
      <section className="py-20 px-10 bg-paper-2 max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-8">── Qué distribuís</p>
          <div className="grid grid-cols-2 gap-[2px] mb-12 max-md:grid-cols-1">
            <div className="bg-ink text-paper p-10">
              <p className="font-mono text-[10px] text-red tracking-[0.2em] uppercase mb-3">Crema de Maní</p>
              <h3 className="font-heading text-[26px] font-medium m-0 mb-3">Natural y Crunchy</h3>
              <p className="text-[14px] text-[#bbb] leading-[1.6] m-0">
                Frascos 380g y baldes 4,5kg y 23kg. El producto más vendido de la línea.
                Alta rotación en dietéticas, gimnasios y tiendas naturales.
              </p>
            </div>
            <div className="bg-paper p-10 border border-ink/10">
              <p className="font-mono text-[10px] text-red tracking-[0.2em] uppercase mb-3">Miel</p>
              <h3 className="font-heading text-[26px] font-medium m-0 mb-3">Líquida y Sólida</h3>
              <p className="text-[14px] text-[#555] leading-[1.6] m-0">
                Frascos 500g y formatos a granel. Miel pura multifloral, sin aditivos.
                Complemento natural de la crema de maní en el mismo cliente.
              </p>
            </div>
          </div>

          {/* Escala distribuidor */}
          <div className="bg-paper p-10 border-t-4 border-red">
            <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-[#666] mb-8">Escala para distribuidores</p>
            <div className="grid grid-cols-3 gap-8 max-md:grid-cols-1">
              {ESCALA_DIST.map((t, i) => (
                <div key={i}>
                  <p className="font-mono text-[10px] text-red tracking-[0.2em] uppercase mb-2">{t.l}</p>
                  <p className="font-heading text-[32px] font-medium leading-none m-0">{t.v}</p>
                  <p className="text-[13px] text-[#888] mt-1">{t.s}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-10 bg-ink text-paper text-center max-md:px-6">
        <div className="max-w-[600px] mx-auto">
          <p
            className="font-heading font-medium mb-4"
            style={{ fontSize: 'clamp(24px,4vw,36px)' }}
          >
            Hablemos de tu zona
          </p>
          <p className="text-[#bbb] text-[16px] mb-8 leading-[1.6]">
            Cada zona es distinta. Contactanos y armamos una propuesta personalizada
            para crema de maní y miel.
          </p>
          <a
            href={`${WA_NUMBER}?text=Hola%20Hardy,%20quiero%20ser%20distribuidor%20de%20crema%20de%20maní%20y%20miel`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red text-paper font-mono text-[12px] tracking-[0.2em] uppercase px-10 py-4"
          >
            Escribir por WhatsApp →
          </a>
        </div>
      </section>

    </div>
  )
}
