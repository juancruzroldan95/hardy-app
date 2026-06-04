import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getRecetaBySlug, getRecetas } from '@/consts/recetas'

interface Props {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return getRecetas().map((r) => ({ slug: r.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const receta = getRecetaBySlug(slug)
  if (!receta) return {}
  return {
    title: receta.titulo,
    description: receta.descripcion,
  }
}

const DIFFICULTY_COLOR: Record<string, string> = {
  Fácil: '#22c55e',
  Medio: '#d97706',
  Difícil: '#dc2626',
}

export default async function RecetaDetallePage({ params }: Props) {
  const { slug } = await params
  const receta = getRecetaBySlug(slug)
  if (!receta) notFound()

  return (
    <div className="bg-paper min-h-screen">
      {/* Volver bar */}
      <div className="bg-paper-2 px-10 py-[14px] border-b border-ink/10 max-md:px-5">
        <Link
          href="/recetas"
          className="font-mono text-[11px] tracking-[0.15em] uppercase text-[#666] no-underline"
        >
          ← Volver a recetas
        </Link>
      </div>

      {/* Hero — 2 column */}
      <section className="py-14 px-10 bg-paper max-md:px-5 max-md:py-10">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 gap-[60px] items-start max-md:grid-cols-1 max-md:gap-8">

          {/* Left: recipe info */}
          <div>
            <div className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">
              ── {receta.categoria}
            </div>
            <h1
              className="font-heading font-medium tracking-[-0.02em] m-0 mb-4 leading-[1.1]"
              style={{ fontSize: 'clamp(30px,4vw,52px)' }}
            >
              {receta.titulo}
            </h1>
            <p className="text-[15px] text-[#555] leading-[1.7] m-0 mb-6">{receta.descripcion}</p>

            {/* Meta */}
            <div className="flex gap-5 flex-wrap mb-7 pb-6 border-b border-ink/10">
              {[
                { icon: '⏱', label: 'Tiempo', val: receta.tiempo, color: undefined },
                { icon: '👤', label: 'Porciones', val: receta.porciones, color: undefined },
                { icon: '📊', label: 'Dificultad', val: receta.dificultad, color: DIFFICULTY_COLOR[receta.dificultad] },
              ].map((m, i) => (
                <div key={i} className="flex gap-2 items-center">
                  <span className="text-[16px]">{m.icon}</span>
                  <div>
                    <div className="font-mono text-[9px] text-[#888] tracking-[0.1em] uppercase">{m.label}</div>
                    <div
                      className="font-body font-bold text-[14px]"
                      style={{ color: m.color ?? '#1a1a1a' }}
                    >
                      {m.val}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Productos Hardy */}
            <div className="bg-ink text-paper px-7 py-6">
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-red mb-[14px]">
                Productos Hardy
              </div>
              {receta.productos.map((p, i) => (
                <div key={i} className="font-body font-semibold text-[14px] text-paper mb-[6px] flex items-center gap-[10px]">
                  <span className="text-red text-[11px]">✓</span>
                  {p}
                </div>
              ))}
              <Link
                href="/tienda"
                className="block bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase text-center py-[13px] px-5 no-underline mt-[18px]"
              >
                Ver productos →
              </Link>
            </div>
          </div>

          {/* Right: macros + image */}
          <div>
            {/* Macros panel */}
            {receta.macros && (
              <div className="bg-ink px-6 py-5 mb-4">
                <div className="font-mono text-[9px] tracking-[0.2em] text-red uppercase mb-3 w-full">
                  ── Macros aprox. por porción*
                </div>
                <div className="flex">
                  {[
                    { label: 'Calorías', val: String(receta.macros.kcal), unit: 'kcal' },
                    { label: 'Proteínas', val: `${receta.macros.proteinas} g`, unit: undefined },
                    { label: 'Carbos', val: `${receta.macros.carbos} g`, unit: undefined },
                    { label: 'Grasas', val: `${receta.macros.grasas} g`, unit: undefined },
                  ].map((m, i, arr) => (
                    <div
                      key={i}
                      className="flex-1 text-center px-2"
                      style={{ borderRight: i < arr.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none' }}
                    >
                      <div className="font-heading text-[20px] font-medium text-paper leading-none">{m.val}</div>
                      {m.unit && (
                        <div className="font-mono text-[9px] text-[#aaa] tracking-[0.1em]">{m.unit}</div>
                      )}
                      <div className="font-mono text-[9px] text-[#666] tracking-[0.1em] uppercase mt-1">{m.label}</div>
                    </div>
                  ))}
                </div>
                <div className="font-body text-[10px] text-[#555] mt-[10px]">* Valores estimados.</div>
              </div>
            )}
            <Image
              src={receta.imagen}
              alt={receta.titulo}
              width={700}
              height={525}
              className="w-full object-cover block"
              style={{ aspectRatio: '4/3' }}
            />
          </div>

        </div>
      </section>

      {/* Ingredientes y Preparación */}
      <section className="py-14 px-10 bg-paper-2 max-md:px-5 max-md:py-10">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 gap-[60px] max-md:grid-cols-1 max-md:gap-10">

          {/* Ingredientes */}
          <div>
            <div className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-6">── Ingredientes</div>
            <ul className="m-0 p-0 list-none">
              {receta.ingredientes.map((ing, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 py-3 border-b border-ink/15 text-[15px]"
                >
                  <span
                    className="flex-shrink-0 bg-red"
                    style={{ width: '8px', height: '8px', display: 'inline-block' }}
                  />
                  {ing}
                </li>
              ))}
            </ul>
          </div>

          {/* Preparación */}
          <div>
            <div className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-6">── Preparación</div>
            <ol className="m-0 p-0 list-none">
              {receta.preparacion.map((paso, i) => (
                <li
                  key={i}
                  className="py-4 border-b border-ink/15 grid gap-3 items-start"
                  style={{ gridTemplateColumns: '40px 1fr' }}
                >
                  <span className="font-heading text-[26px] font-medium text-red leading-none">
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <p className="m-0 text-[15px] leading-[1.6] pt-1">{paso}</p>
                </li>
              ))}
            </ol>
          </div>

        </div>
      </section>

      {/* Video UGC */}
      {receta.videoUrl && (
        <section className="py-14 px-10 bg-ink max-md:px-5">
          <div className="max-w-[1100px] mx-auto">
            <div className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-6">── En video</div>
            <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
              <iframe
                src={receta.videoUrl}
                title={receta.titulo}
                className="absolute inset-0 w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          </div>
        </section>
      )}

      {/* Más recetas CTA */}
      <section className="py-14 px-10 bg-paper text-center max-md:px-5">
        <div className="max-w-[500px] mx-auto">
          <div
            className="font-heading font-medium mb-[14px]"
            style={{ fontSize: 'clamp(22px,4vw,28px)' }}
          >
            ¿Querés más ideas?
          </div>
          <p className="text-[#555] text-[14px] mb-6 m-0">
            Explorá todas las recetas con crema de maní y miel Hardy.
          </p>
          <Link
            href="/recetas"
            className="inline-block bg-ink text-paper font-mono text-[11px] tracking-[0.15em] uppercase py-[13px] px-7 no-underline whitespace-nowrap"
          >
            Ver todas las recetas →
          </Link>
        </div>
      </section>
    </div>
  )
}
