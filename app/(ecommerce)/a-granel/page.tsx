import type { Metadata } from 'next'
import Image from 'next/image'
import { WA_NUMBER } from '@/lib/products'

export const metadata: Metadata = {
  title: 'A Granel — Hardy',
  description:
    'Crema de maní y miel en volumen para gastronomía, repostería, cafeterías, producción e industria. Baldes de 4,5kg, 23kg, 6kg y 30kg.',
}

const BALDES_MANI = [
  {
    tag: 'Crema de Maní · 4,5 kg',
    title: 'Balde 4,5 kg',
    img: '/products/balde-45-front.png',
    desc: 'Para cafeterías, cocinas, gimnasios y repostería. 100% maní seleccionado, sin azúcar, sin aceites, sin conservantes.',
    waText: 'Hola Hardy, quiero info del balde de crema de maní de 4.5kg',
  },
  {
    tag: 'Crema de Maní · 23 kg',
    title: 'Balde 23 kg',
    img: '/products/balde-23-front.png',
    desc: 'Para producción continua, barras energéticas, helados y panificados. Mejor costo por kg de la línea.',
    waText: 'Hola Hardy, quiero info del balde de crema de maní de 23kg',
  },
]

const BALDES_MIEL = [
  {
    tag: 'Miel Líquida · 6 kg',
    title: 'Balde 6 kg',
    img: '/lifestyle/balde-45-open.png',
    desc: 'Para cafeterías, restaurantes y pastelerías. Miel multifloral sin pasteurizar, sin procesar.',
    waText: 'Hola Hardy, quiero info de miel a granel 6kg',
  },
  {
    tag: 'Miel Líquida · 30 kg',
    title: 'Balde 30 kg',
    img: '/lifestyle/balde-23-open.png',
    desc: 'Para producción a escala. Panificados, barras energéticas, bebidas. La mejor relación costo por kg.',
    waText: 'Hola Hardy, quiero info de miel a granel 30kg',
  },
]

const USOS_MANI = ['Bowls', 'Toppings', 'Rellenos', 'Barras', 'Repostería', 'Heladería', 'Cocina profesional', 'Producción']
const USOS_MIEL = ['Endulzante natural', 'Panificados', 'Repostería', 'Bebidas', 'Salsas', 'Toppings', 'Producción']

const PARA_QUIEN = [
  { icon: '☕', t: 'Cafés y restaurants', d: 'Insumo para preparaciones, desayunos y carta.' },
  { icon: '🎂', t: 'Reposterías', d: 'Ingrediente para rellenos, coberturas y elaboraciones.' },
  { icon: '💪', t: 'Emprendedores', d: 'Barras, snacks proteicos y productos saludables.' },
  { icon: '🏭', t: 'Industria', d: 'Volúmenes altos para elaboración continua.' },
]

function BaldeCard({
  tag, title, img, desc, waText,
}: {
  tag: string
  title: string
  img: string
  desc: string
  waText: string
}) {
  return (
    <div className="group bg-paper-2 hover:bg-ink flex flex-col transition-colors border-t-[3px] border-transparent hover:border-red cursor-default">
      <div className="aspect-square overflow-hidden bg-[#e8e6e2] group-hover:bg-[#111] transition-colors">
        <Image
          src={img}
          alt={title}
          width={400}
          height={400}
          className="w-full h-full object-contain p-6"
        />
      </div>
      <div className="p-6">
        <p className="font-mono text-[9px] tracking-[0.2em] text-red uppercase mb-2">{tag}</p>
        <h3 className="font-heading text-[20px] font-medium m-0 mb-[10px] group-hover:text-paper transition-colors">{title}</h3>
        <p className="text-[13px] text-[#666] group-hover:text-[#aaa] leading-[1.55] m-0 mb-5 transition-colors">{desc}</p>
        <a
          href={`${WA_NUMBER}?text=${encodeURIComponent(waText)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block border border-red text-red group-hover:bg-red group-hover:text-paper font-mono text-[10px] tracking-[0.15em] uppercase px-[18px] py-[9px] transition-colors"
        >
          Consultar precio →
        </a>
      </div>
    </div>
  )
}

export default function AGranelPage() {
  return (
    <div className="bg-paper text-ink">

      {/* HERO */}
      <section className="bg-ink text-paper py-20 px-10 max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-5">── A granel</p>
          <h1
            className="font-heading font-medium tracking-[-0.02em] leading-[1.05] m-0 mb-5"
            style={{ fontSize: 'clamp(38px,6vw,68px)' }}
          >
            Formatos a granel para<br /><em className="not-italic text-red">uso profesional.</em>
          </h1>
          <p className="text-[16px] text-[#bbb] max-w-[560px] leading-[1.7] mb-9">
            Crema de maní y miel en volumen para gastronomía, repostería, cafeterías, producción e industria.
          </p>
          <a
            href={`${WA_NUMBER}?text=Hola%20Hardy,%20quiero%20información%20de%20productos%20a%20granel`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red text-paper font-mono text-[11px] tracking-[0.18em] uppercase px-7 py-[13px]"
          >
            Consultar por WhatsApp →
          </a>
        </div>
      </section>

      {/* PARA QUIÉN */}
      <section className="py-14 px-10 bg-paper-2 max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-6">── ¿Para quién es?</p>
          <div className="grid grid-cols-4 gap-[2px] max-md:grid-cols-2">
            {PARA_QUIEN.map((c, i) => (
              <div
                key={i}
                className="group bg-paper hover:bg-ink transition-colors border-t-[3px] border-transparent hover:border-red px-5 py-6 cursor-default"
              >
                <div className="text-[22px] mb-3">{c.icon}</div>
                <h3 className="font-heading text-[16px] font-medium m-0 mb-[6px] group-hover:text-paper transition-colors">{c.t}</h3>
                <p className="text-[12px] text-[#666] group-hover:text-[#aaa] leading-[1.5] m-0 transition-colors">{c.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CREMA DE MANÍ A GRANEL */}
      <section className="py-14 px-10 bg-paper max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[10px] tracking-[0.25em] text-red uppercase mb-[6px]">── Crema de maní a granel</p>
          <p className="text-[13px] text-[#888] m-0 mb-7">Para cocinas, cafeterías, repostería, heladerías y producción a escala.</p>
          <div className="grid grid-cols-2 gap-[2px] mb-[2px] max-md:grid-cols-1">
            {BALDES_MANI.map((b, i) => (
              <BaldeCard key={i} {...b} />
            ))}
          </div>
          <div className="bg-paper-2 px-6 py-5 flex flex-wrap gap-2 items-center">
            <span className="font-mono text-[9px] tracking-[0.2em] text-red uppercase mr-2">Usos:</span>
            {USOS_MANI.map((u, i) => (
              <span key={i} className="bg-paper px-3 py-1 font-mono text-[9px] tracking-[0.12em] uppercase text-[#666]">{u}</span>
            ))}
          </div>
        </div>
      </section>

      {/* MIEL A GRANEL */}
      <section className="py-14 px-10 bg-paper-2 max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[10px] tracking-[0.25em] text-red uppercase mb-[6px]">── Miel a granel</p>
          <p className="text-[13px] text-[#888] m-0 mb-7">Para gastronomía, cafeterías, pastelería, producción y uso profesional.</p>
          <div className="grid grid-cols-2 gap-[2px] mb-[2px] max-md:grid-cols-1">
            {BALDES_MIEL.map((b, i) => (
              <BaldeCard key={i} {...b} />
            ))}
          </div>
          <div className="bg-paper px-6 py-5 flex flex-wrap gap-2 items-center">
            <span className="font-mono text-[9px] tracking-[0.2em] text-red uppercase mr-2">Usos:</span>
            {USOS_MIEL.map((u, i) => (
              <span key={i} className="bg-paper-2 px-3 py-1 font-mono text-[9px] tracking-[0.12em] uppercase text-[#666]">{u}</span>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 px-10 bg-ink text-paper text-center max-md:px-6">
        <div className="max-w-[480px] mx-auto">
          <p
            className="font-heading font-medium mb-[14px]"
            style={{ fontSize: 'clamp(22px,4vw,32px)' }}
          >
            ¿Querés consultar por volumen?
          </p>
          <p className="text-[#bbb] text-[14px] mb-7 leading-[1.6]">
            Te asesoramos según el producto, el formato y la cantidad que necesitás.
          </p>
          <a
            href={`${WA_NUMBER}?text=Hola%20Hardy,%20quiero%20consultar%20por%20volumen%20a%20granel`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block bg-red text-paper font-mono text-[11px] tracking-[0.18em] uppercase px-7 py-[13px]"
          >
            Consultar por WhatsApp →
          </a>
        </div>
      </section>

    </div>
  )
}
