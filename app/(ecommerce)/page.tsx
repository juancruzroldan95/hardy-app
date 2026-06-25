import Image from 'next/image'
import Link from 'next/link'
import { formatARS, PRODUCTS } from '@/consts/products'

const FRASCO_PRODUCTS = PRODUCTS.filter((p) => p.line === 'frasco')

export default function HomePage() {
  return (
    <div className="bg-paper text-ink">

      {/* ── 01 HERO ──────────────────────────────────────────────── */}
      <section
        className="flex items-center min-h-screen bg-ink px-[6vw] gap-16 max-md:flex-col max-md:justify-center max-md:px-6 max-md:pt-24 max-md:pb-12"
      >
        {/* Copy */}
        <div className="flex-1 max-w-[480px] max-md:max-w-full max-md:text-center">
          <p className="font-mono text-[11px] tracking-[0.12em] uppercase text-red mb-6">
            Crema de maní · Miel natural
          </p>
          <h1
            className="font-display text-paper m-0 mb-5"
            style={{ fontSize: 'clamp(52px, 7vw, 96px)', lineHeight: 1.0 }}
          >
            Maní. Miel.<br />Nada más.
          </h1>
          <p className="font-body text-[16px] leading-[1.6] text-paper/60 mb-10">
            Sin aditivos. Sin azúcar. Sin conservantes.
          </p>
          <div className="flex gap-3 flex-wrap max-md:justify-center">
            <Link
              href="/tienda"
              className="font-body text-[14px] font-semibold px-7 py-3 bg-paper text-ink rounded-[4px] transition-opacity hover:opacity-85"
            >
              Comprar
            </Link>
            <Link
              href="/mayoristas#solicitar"
              className="font-body text-[14px] font-medium px-7 py-3 bg-transparent text-paper/70 border border-paper/25 rounded-[4px] transition-all hover:border-paper/60 hover:text-paper"
            >
              Quiero vender HARDY
            </Link>
          </div>
        </div>

        {/* Imagen */}
        <div className="flex-1 flex justify-center items-center max-md:order-first max-md:max-w-[280px] max-md:w-full max-md:mx-auto">
          <Image
            src="/products/natural-380-front.png"
            alt="HARDY Crema de Maní Natural 380g"
            width={600}
            height={600}
            className="w-full max-w-[600px] h-auto object-contain"
            priority
          />
        </div>
      </section>

      {/* ── 02 FILOSOFÍA ─────────────────────────────────────────── */}
      <section className="bg-paper py-32 px-[6vw] flex justify-center max-md:py-20 max-md:px-6">
        <div className="max-w-[640px] text-center">
          <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-red block mb-10">
            La fórmula
          </span>
          <p
            className="font-display text-ink m-0 mb-2"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.15 }}
          >
            Desde hace más de 10 años la fórmula no cambió.
          </p>
          <p
            className="font-display text-ink m-0 mb-6"
            style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.15 }}
          >
            Porque no hay nada que cambiar.
          </p>
          <p
            className="font-heading italic text-ink/55 m-0 mt-6"
            style={{ fontSize: 'clamp(20px, 2.5vw, 32px)', lineHeight: 1.2 }}
          >
            Maní molido. Miel pura.<br />El mismo producto desde el primer día.
          </p>
        </div>
      </section>

      {/* ── 03 PRODUCTOS ─────────────────────────────────────────── */}
      <section className="bg-paper py-24 px-[6vw] border-t border-ink/[0.08] max-md:px-6 max-md:py-16">
        <div className="mb-12">
          <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-ink/40">
            El producto
          </span>
        </div>
        <div className="grid grid-cols-4 gap-8 max-md:grid-cols-2 max-md:gap-4">
          {FRASCO_PRODUCTS.map((p) => (
            <Link
              key={p.id}
              href="/tienda"
              className="flex flex-col gap-4 no-underline transition-opacity hover:opacity-75"
            >
              <div className="bg-white rounded-[8px] px-6 py-8 aspect-square flex items-center justify-center">
                <Image
                  src={p.image}
                  alt={`HARDY ${p.name}`}
                  width={200}
                  height={200}
                  className="w-full max-h-[200px] object-contain"
                />
              </div>
              <div className="flex flex-col gap-[2px]">
                <span className="font-body text-[15px] font-semibold text-ink">{p.name}</span>
                <span className="font-mono text-[11px] text-ink/40 tracking-[0.06em]">{p.size}</span>
                <span className="font-body text-[15px] font-medium text-ink mt-1">{formatARS(p.price)}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 04 LEÉ LA ETIQUETA ───────────────────────────────────── */}
      <section className="bg-ink flex items-center gap-24 py-32 px-[6vw] max-md:flex-col max-md:py-20 max-md:px-6 max-md:gap-12">
        {/* Texto */}
        <div className="flex-1">
          <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-red block mb-10">
            Leé la etiqueta
          </span>
          <p className="font-body text-paper/45 leading-[1.65] mb-8 max-w-[400px]"
            style={{ fontSize: 'clamp(16px, 1.8vw, 20px)' }}
          >
            La mayoría de las cremas de maní tienen aceite de palma, azúcar, sal o estabilizantes.
          </p>
          <p
            className="font-display text-paper m-0 mb-1"
            style={{ fontSize: 'clamp(40px, 5vw, 72px)', lineHeight: 1.0 }}
          >
            HARDY tiene maní.
          </p>
          <p
            className="font-heading italic text-paper/40 m-0"
            style={{ fontSize: 'clamp(28px, 3.5vw, 52px)', lineHeight: 1.1 }}
          >
            Nada más.
          </p>
        </div>

        {/* Imagen */}
        <div className="flex-1 max-w-[480px] max-md:max-w-full max-md:w-full">
          <Image
            src="/products/natural-380-open.png"
            alt="Crema de maní Hardy — ingrediente natural"
            width={480}
            height={480}
            className="w-full aspect-square object-cover rounded-[8px]"
          />
        </div>
      </section>

      {/* ── 05 PORTAL MAYORISTA ──────────────────────────────────── */}
      <section className="bg-ink border-t border-paper/[0.08] py-32 px-[6vw] max-md:py-20 max-md:px-6">
        <div className="max-w-[680px]">
          <span className="font-mono text-[11px] tracking-[0.12em] uppercase text-red block mb-8">
            Canal mayorista
          </span>
          <h2
            className="font-display text-paper m-0 mb-8"
            style={{ fontSize: 'clamp(40px, 5.5vw, 80px)', lineHeight: 1.0 }}
          >
            ¿Vendés<br />alimentación saludable?
          </h2>
          <p className="font-body text-[16px] text-paper/55 leading-[1.75] mb-8 max-w-[520px]">
            HARDY trabaja con dietéticas, gimnasios, distribuidores y profesionales de la gastronomía.
            Frascos para retail. Baldes para elaboración y servicio (4,5 kg y 23 kg).
            Precios por volumen, condiciones claras, entrega en CABA y GBA.
          </p>
          <div className="flex flex-wrap gap-2 mb-10">
            {['Dietéticas', 'Gimnasios', 'Gastronomía', 'Distribuidores', 'Suplementos'].map((c) => (
              <span
                key={c}
                className="font-mono text-[11px] tracking-[0.06em] px-[14px] py-[5px] border border-paper/[0.18] rounded-[20px] text-paper/50"
              >
                {c}
              </span>
            ))}
          </div>
          <Link
            href="/mayoristas#solicitar"
            className="font-body text-[14px] font-semibold inline-block px-8 py-[14px] bg-red text-paper rounded-[4px] transition-opacity hover:opacity-85"
          >
            Ver condiciones mayoristas
          </Link>
        </div>
      </section>

    </div>
  )
}
