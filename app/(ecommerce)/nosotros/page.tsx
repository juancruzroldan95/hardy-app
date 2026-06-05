import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Nuestra historia · Hardy',
  description:
    'Desde 2015 hacemos crema de maní con un solo ingrediente. La historia de Hardy, una marca argentina que nunca agregó lo que no hacía falta.',
  openGraph: {
    title: 'Nuestra historia · Hardy',
    description:
      'Desde 2015 hacemos crema de maní con un solo ingrediente. La historia de Hardy, una marca argentina que nunca agregó lo que no hacía falta.',
    images: [
      {
        url: '/lifestyle/og-nosotros.png',
        width: 1200,
        height: 630,
        alt: 'Hardy — Nuestra historia',
      },
    ],
  },
}

const TIMELINE = [
  {
    year: '2015',
    desc: 'Hardy nace en Buenos Aires. Un emprendimiento con una obsesión: maní sin aditivos.',
  },
  {
    year: '2017',
    desc: 'Primeras 50 dietéticas. El boca en boca empieza a funcionar.',
  },
  {
    year: '2019',
    desc: 'Lanzamiento de la línea Miel. Miel cruda argentina sin pasteurizar.',
  },
  {
    year: '2021',
    desc: 'Expansión nacional. Más de 100 puntos de venta en todo el país.',
  },
  {
    year: '2023',
    desc: 'Línea A Granel. Baldes para gastronomía, repostería e industria.',
  },
  {
    year: '2025',
    desc: '+500 puntos de venta. Portal para clientes mayoristas. Hardy sigue siendo Hardy.',
  },
]

const VALORES = [
  {
    title: 'Un ingrediente',
    desc: 'Maní. Nada más. La etiqueta dice todo lo que hay adentro.',
  },
  {
    title: 'Sin concesiones',
    desc: 'Sin azúcar agregada. Sin aceite de palma. Sin conservantes. Nunca.',
  },
  {
    title: 'Hecho acá',
    desc: 'Maní seleccionado de Córdoba. Procesado en Argentina. Para Argentina y el mundo.',
  },
]

const STATS = [
  { num: '10 años', label: 'de marca' },
  { num: '+500', label: 'puntos de venta' },
  { num: '1', label: 'ingrediente' },
  { num: '100%', label: 'natural' },
]

export default function NosotrosPage() {
  return (
    <main>
      {/* §1 — HERO */}
      <section className="bg-ink text-paper px-6 py-24 md:py-36">
        <div className="max-w-4xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-6">
            ── Nuestra historia
          </p>
          <h1 className="font-heading text-[clamp(40px,6vw,80px)] font-medium leading-[1.05] tracking-[-0.02em] mb-8">
            10 años haciendo lo mismo.{' '}
            <em className="not-italic text-red">Bien.</em>
          </h1>
          <p className="font-body text-[clamp(16px,2vw,20px)] text-paper/70 max-w-xl leading-relaxed">
            Desde 2015 hacemos crema de maní con un solo ingrediente. Maní. Nada más.
          </p>
        </div>
      </section>

      {/* §1.5 — Producto en contexto */}
      <section className="bg-paper-2">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 max-md:grid-cols-1">
          <div className="relative aspect-square overflow-hidden bg-[#e8e4de]">
            <Image
              src="/lifestyle/nosotros-fundador.png"
              alt="Fundador de Hardy en su taller"
              fill
              className="object-cover"
              sizes="(max-width: 900px) 100vw, 50vw"
            />
          </div>
          <div className="bg-ink text-paper flex flex-col justify-center px-12 py-16 max-md:px-8 max-md:py-10">
            <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">── La idea</p>
            <p className="font-heading text-[clamp(22px,3vw,34px)] font-medium leading-[1.2] tracking-[-0.02em] text-paper mb-4">
              Un frasco con un solo ingrediente puede cambiar lo que desayunás.
            </p>
            <p className="font-body text-[14px] text-paper/60 leading-[1.7]">
              Eso fue todo lo que necesitamos para arrancar en 2015. La misma idea sigue siendo la misma hoy.
            </p>
          </div>
        </div>
      </section>

      {/* §2 — TIMELINE */}
      <section className="bg-paper px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-12">
            ── Desde el principio
          </p>
          <div className="relative pl-8 border-l-2 border-red flex flex-col gap-10">
            {TIMELINE.map(({ year, desc }) => (
              <div key={year} className="relative">
                {/* dot */}
                <span className="absolute -left-[41px] top-[3px] w-3 h-3 rounded-full bg-red" />
                <p className="font-mono text-[11px] tracking-[0.2em] text-red uppercase mb-2">
                  {year}
                </p>
                <p className="font-body text-ink text-base leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* §3 — VALORES */}
      <section className="bg-paper-2 px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">
            ── Lo que nos define
          </p>
          <h2 className="font-heading text-[clamp(28px,4vw,44px)] font-medium leading-[1.1] tracking-[-0.02em] text-ink mb-14">
            Principios que no negociamos.
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {VALORES.map(({ title, desc }) => (
              <div key={title} className="border-t-2 border-ink pt-6">
                <h3 className="font-heading text-[22px] font-medium text-ink mb-3">
                  {title}
                </h3>
                <p className="font-body text-ink/70 text-base leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* §4 — STATS */}
      <section className="bg-ink text-paper px-6 py-20 md:py-28">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
            {STATS.map(({ num, label }) => (
              <div key={label} className="flex flex-col gap-2">
                <span className="font-display text-[clamp(36px,5vw,60px)] leading-none text-red">
                  {num}
                </span>
                <span className="font-mono text-[11px] tracking-[0.2em] text-paper/60 uppercase">
                  {label}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-16 grid grid-cols-2 gap-[2px] max-md:grid-cols-1">
            {[
              { src: '/lifestyle/proceso-molino.png', alt: 'Proceso de elaboración Hardy' },
              { src: '/lifestyle/mani-crudo.png', alt: 'Maní seleccionado de Córdoba' },
            ].map((img) => (
              <div key={img.src} className="relative aspect-[16/10] bg-[#1a1a1a] overflow-hidden">
                <Image
                  src={img.src}
                  alt={img.alt}
                  fill
                  className="object-cover"
                  sizes="(max-width: 900px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* §5 — CTA */}
      <section className="bg-red text-paper px-6 py-20 md:py-28">
        <div className="max-w-3xl mx-auto">
          <h2 className="font-heading text-[clamp(28px,4vw,48px)] font-medium leading-[1.1] tracking-[-0.02em] mb-4">
            ¿Querés trabajar con nosotros?
          </h2>
          <p className="font-body text-paper/80 text-base md:text-lg leading-relaxed mb-10 max-w-xl">
            Somos una marca en crecimiento. Abiertos a nuevos distribuidores,
            gastronómicos y colaboraciones.
          </p>
          <Link
            href="https://wa.me/5491135736956"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-paper text-ink font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[18px] hover:bg-ink hover:text-paper transition-colors duration-200"
          >
            Escribinos por WhatsApp →
          </Link>
        </div>
      </section>
    </main>
  )
}
