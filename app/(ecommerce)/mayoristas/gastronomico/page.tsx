import type { Metadata } from 'next'
import Image from 'next/image'
import { WA_NUMBER } from '@/consts/products'

export const metadata: Metadata = {
  title: 'Gastronómico — Hardy',
  description:
    'Crema de maní y miel Hardy en formato balde para cafés, restaurants y reposterías. Menor costo por kilo, calidad constante, sin aditivos.',
}

const BENEFICIOS = [
  { n: '01', t: 'Menor costo por kilo', d: 'Comprás más y pagás menos por unidad. El formato ideal para uso frecuente.' },
  { n: '02', t: 'Sin aditivos, siempre', d: '100% maní o miel pura. Sin azúcar, sin aceite, sin conservantes. Lo mismo de siempre.' },
  { n: '03', t: 'Reposición rápida', d: 'Pedidos en 48-72hs hábiles. Coordinamos el envío según tu necesidad.' },
]

export default function GastronomicoPage() {
  return (
    <div className="bg-paper text-ink">

      {/* HERO */}
      <section className="bg-ink text-paper pt-[100px] pb-20 px-10 max-md:px-6 max-md:pt-16">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-5">── Gastronómico</p>
          <h1
            className="font-heading font-medium tracking-[-0.02em] leading-[1.05] m-0 mb-6"
            style={{ fontSize: 'clamp(42px,6vw,72px)' }}
          >
            Para cafés, restaurants<br />y <em className="not-italic text-red">reposterías.</em>
          </h1>
          <p className="text-[17px] text-[#bbb] max-w-[620px] leading-[1.7] mb-10">
            Crema de maní y miel en formato balde. Menor costo por kilo, calidad constante, sin aditivos.
            El insumo que tu cocina necesita.
          </p>
          <a
            href={`${WA_NUMBER}?text=Hola%20Hardy,%20tengo%20un%20negocio%20gastronómico%20y%20quiero%20información`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red text-paper font-mono text-[12px] tracking-[0.2em] uppercase px-8 py-4"
          >
            Consultar por WhatsApp →
          </a>
        </div>
      </section>

      {/* PRODUCTOS */}
      <section className="py-20 px-10 bg-paper-2 max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-8">── Nuestros formatos para vos</p>
          <div className="grid grid-cols-2 gap-[2px] max-md:grid-cols-1">
            {/* Crema de maní */}
            <div className="bg-ink text-paper overflow-hidden">
              <div className="aspect-[4/3] overflow-hidden">
                <Image
                  src="/lifestyle/balde-45-open.png"
                  alt="Balde Crema de Maní 4,5kg"
                  width={600}
                  height={450}
                  className="w-full h-full object-cover block"
                />
              </div>
              <div className="p-8">
                <p className="font-mono text-[10px] text-red tracking-[0.2em] uppercase mb-2">Crema de Maní · 4,5 kg</p>
                <h3 className="font-heading text-[26px] font-medium m-0 mb-3">Balde mediano</h3>
                <p className="text-[14px] text-[#bbb] leading-[1.6] m-0 mb-5">
                  Para cocinas, cafeterías y pastelerías con consumo regular.
                  Crema de maní 100% natural, sin azúcar ni aditivos.
                </p>
                <a
                  href={`${WA_NUMBER}?text=Hola%20Hardy,%20quiero%20info%20del%20balde%20de%20crema%20de%20maní%204.5kg`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-[11px] text-red tracking-[0.15em] uppercase border-b border-red pb-[2px]"
                >
                  Consultar precio →
                </a>
              </div>
            </div>
            {/* Miel */}
            <div className="bg-paper overflow-hidden border border-ink/10">
              <div className="aspect-[4/3] overflow-hidden">
                <Image
                  src="/lifestyle/miel-liquida-open.png"
                  alt="Miel Hardy"
                  width={600}
                  height={450}
                  className="w-full h-full object-cover block"
                />
              </div>
              <div className="p-8">
                <p className="font-mono text-[10px] text-red tracking-[0.2em] uppercase mb-2">Miel · Formato gastronómico</p>
                <h3 className="font-heading text-[26px] font-medium m-0 mb-3">Miel pura</h3>
                <p className="text-[14px] text-[#555] leading-[1.6] m-0 mb-5">
                  Miel multifloral 100% pura. Ideal para repostería, aderezos, tés y café.
                  Sin azúcar agregada, sabor genuino.
                </p>
                <a
                  href={`${WA_NUMBER}?text=Hola%20Hardy,%20quiero%20info%20de%20miel%20en%20formato%20gastronómico`}
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
          <h2
            className="font-heading font-medium m-0 mb-12"
            style={{ fontSize: 'clamp(28px,4vw,40px)' }}
          >
            ¿Por qué elegir Hardy?
          </h2>
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
            ¿Tu negocio usa crema de maní o miel?
          </p>
          <p className="text-[#bbb] text-[16px] mb-8 leading-[1.6]">
            Contactanos y te armamos una propuesta según tu volumen de consumo.
          </p>
          <a
            href={`${WA_NUMBER}?text=Hola%20Hardy,%20tengo%20un%20negocio%20gastronómico%20y%20quiero%20una%20propuesta`}
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
