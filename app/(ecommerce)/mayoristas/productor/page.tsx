import type { Metadata } from 'next'
import Image from 'next/image'
import { WA_NUMBER } from '@/lib/products'

export const metadata: Metadata = {
  title: 'Productores — Hardy',
  description:
    'Crema de maní y miel Hardy en formatos a granel para producción. Ingrediente limpio sin aditivos, sin azúcar agregada.',
}

const BENEFICIOS = [
  { n: '01', t: 'Máximo rendimiento', d: 'El mejor costo por kilo de todo nuestro portfolio. Para producción continua.' },
  { n: '02', t: 'Ingrediente limpio', d: 'Sin azúcar agregada, sin aceite, sin conservantes. Lo que dice la etiqueta es lo que hay adentro.' },
  { n: '03', t: 'Entrega coordinada', d: 'Coordinamos la logística según tu volumen y frecuencia de pedido.' },
]

export default function ProductorPage() {
  return (
    <div className="bg-paper text-ink">

      {/* HERO */}
      <section className="bg-ink text-paper pt-[100px] pb-20 px-10 max-md:px-6 max-md:pt-16">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-5">── Productores</p>
          <h1
            className="font-heading font-medium tracking-[-0.02em] leading-[1.05] m-0 mb-6"
            style={{ fontSize: 'clamp(42px,6vw,72px)' }}
          >
            Insumo de calidad<br />para tu <em className="not-italic text-red">producción.</em>
          </h1>
          <p className="text-[17px] text-[#bbb] max-w-[620px] leading-[1.7] mb-10">
            Crema de maní y miel pura en formatos a granel. El ingrediente limpio que tu elaboración
            necesita — sin aditivos, sin azúcar agregada, sin vueltas.
          </p>
          <a
            href={`${WA_NUMBER}?text=Hola%20Hardy,%20soy%20productor%20y%20quiero%20información%20de%20formatos%20a%20granel`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red text-paper font-mono text-[12px] tracking-[0.2em] uppercase px-8 py-4"
          >
            Consultar por WhatsApp →
          </a>
        </div>
      </section>

      {/* FORMATOS */}
      <section className="py-20 px-10 bg-paper-2 max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-8">── Formatos para producción</p>
          <div className="grid grid-cols-2 gap-[2px] max-md:grid-cols-1">
            {/* Crema de maní 23kg */}
            <div className="bg-ink text-paper overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden">
                <Image
                  src="/lifestyle/balde-23-open.png"
                  alt="Balde 23kg"
                  width={600}
                  height={450}
                  className="w-full h-full object-cover block"
                />
              </div>
              <div className="p-8">
                <p className="font-mono text-[10px] text-red tracking-[0.2em] uppercase mb-2">Crema de Maní · 23 kg</p>
                <h3 className="font-heading text-[26px] font-medium m-0 mb-3">Balde industrial</h3>
                <p className="text-[14px] text-[#bbb] leading-[1.6] m-0 mb-5">
                  Para fabricantes de barras, helados, repostería profesional y cualquier elaboración
                  a escala. Máximo rendimiento por kilo.
                </p>
                <a
                  href={`${WA_NUMBER}?text=Hola%20Hardy,%20quiero%20info%20del%20balde%20de%2023kg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-red tracking-[0.15em] uppercase border-b border-red pb-[2px]"
                >
                  Consultar precio →
                </a>
              </div>
            </div>
            {/* Miel granel */}
            <div className="bg-paper overflow-hidden border border-ink/10">
              <div className="aspect-[4/3] overflow-hidden">
                <Image
                  src="/lifestyle/miel-liquida-open.png"
                  alt="Miel granel"
                  width={600}
                  height={450}
                  className="w-full h-full object-cover block"
                />
              </div>
              <div className="p-8">
                <p className="font-mono text-[10px] text-red tracking-[0.2em] uppercase mb-2">Miel · Formato producción</p>
                <h3 className="font-heading text-[26px] font-medium m-0 mb-3">Miel a granel</h3>
                <p className="text-[14px] text-[#555] leading-[1.6] m-0 mb-5">
                  Miel pura multifloral para elaboración de productos. Sin aditivos, sin azúcar agregada.
                  Ingrediente limpio para tu receta.
                </p>
                <a
                  href={`${WA_NUMBER}?text=Hola%20Hardy,%20quiero%20info%20de%20miel%20a%20granel%20para%20producción`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-red tracking-[0.15em] uppercase border-b border-red pb-[2px]"
                >
                  Consultar precio →
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="py-20 px-10 bg-paper max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <div className="grid grid-cols-3 gap-[2px] max-md:grid-cols-1">
            {BENEFICIOS.map((f, i) => (
              <div key={i} className="bg-paper-2 p-8">
                <p className="font-mono text-[10px] text-red tracking-[0.2em] mb-4">{f.n}</p>
                <h3 className="font-heading text-[22px] font-medium m-0 mb-3">{f.t}</h3>
                <p className="text-[14px] text-[#555] leading-[1.6] m-0">{f.d}</p>
              </div>
            ))}
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
            ¿Usás crema de maní o miel en tu producción?
          </p>
          <p className="text-[#bbb] text-[16px] mb-8 leading-[1.6]">
            Hablemos de volumen, frecuencia y logística. Te armamos una propuesta para ambos productos.
          </p>
          <a
            href={`${WA_NUMBER}?text=Hola%20Hardy,%20soy%20productor%20y%20quiero%20una%20propuesta%20para%20crema%20de%20maní%20y%20miel`}
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
