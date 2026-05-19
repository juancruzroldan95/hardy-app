import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getRecetaBySlug, getRecetas } from '@/lib/recetas'

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
  Fácil: '#16a34a',
  Medio: '#d97706',
  Difícil: '#dc2626',
}

export default async function RecetaDetallePage({ params }: Props) {
  const { slug } = await params
  const receta = getRecetaBySlug(slug)
  if (!receta) notFound()

  return (
    <div className="bg-paper min-h-screen">
      {/* Hero image */}
      <div className="relative h-[60vh] w-full overflow-hidden bg-ink max-md:h-[45vh]">
        <Image
          src={receta.imagen}
          alt={receta.titulo}
          fill
          priority
          className="object-cover opacity-90"
        />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(15,15,15,0.8) 0%, rgba(15,15,15,0.2) 60%, transparent 100%)' }}
        />
        <div className="absolute bottom-0 left-0 right-0 p-10 max-md:p-5">
          <div className="max-w-[1240px] mx-auto">
            <div className="inline-block bg-ink text-paper font-mono text-[9px] tracking-[0.15em] uppercase px-[10px] py-1 mb-4">
              {receta.categoria}
            </div>
            <h1
              className="font-heading font-medium text-paper m-0 tracking-[-0.02em]"
              style={{ fontSize: 'clamp(28px, 4vw, 48px)', lineHeight: 1.1 }}
            >
              {receta.titulo}
            </h1>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="py-16 px-10 max-md:px-5">
        <div className="max-w-[1240px] mx-auto grid grid-cols-[1fr_340px] gap-16 max-md:grid-cols-1 max-md:gap-10">

          {/* Main */}
          <div>
            {/* Meta */}
            <div className="flex gap-6 mb-10 pb-6 border-b border-ink/15 flex-wrap">
              <div>
                <div className="font-mono text-[9px] tracking-[0.2em] text-[#888] uppercase mb-1">Tiempo</div>
                <div className="font-mono text-[13px] font-medium">{receta.tiempo}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-[0.2em] text-[#888] uppercase mb-1">Porciones</div>
                <div className="font-mono text-[13px] font-medium">{receta.porciones}</div>
              </div>
              <div>
                <div className="font-mono text-[9px] tracking-[0.2em] text-[#888] uppercase mb-1">Dificultad</div>
                <div
                  className="font-mono text-[13px] font-medium"
                  style={{ color: DIFFICULTY_COLOR[receta.dificultad] ?? '#666' }}
                >
                  {receta.dificultad}
                </div>
              </div>
            </div>

            {/* Ingredients */}
            <div className="mb-10">
              <h2 className="font-mono text-[11px] tracking-[0.25em] uppercase text-red mb-5">── Ingredientes</h2>
              <ul className="m-0 p-0 list-none">
                {receta.ingredientes.map((ing, i) => (
                  <li key={i} className="flex items-start gap-3 py-3 border-b border-ink/10 text-[15px] leading-[1.5]">
                    <span className="text-red text-[10px] mt-[6px] flex-shrink-0">✓</span>
                    {ing}
                  </li>
                ))}
              </ul>
            </div>

            {/* Preparation */}
            <div>
              <h2 className="font-mono text-[11px] tracking-[0.25em] uppercase text-red mb-5">── Preparación</h2>
              <ol className="m-0 p-0 list-none">
                {receta.preparacion.map((step, i) => (
                  <li key={i} className="flex gap-4 mb-5 items-start">
                    <span className="font-mono text-[11px] text-red flex-shrink-0 mt-[4px]">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <p className="m-0 text-[15px] leading-[1.7] text-ink">{step}</p>
                  </li>
                ))}
              </ol>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Products used */}
            <div className="bg-paper-2 p-8 mb-6">
              <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-red mb-4">── Productos Hardy</div>
              {receta.productos.map((prod) => (
                <div key={prod} className="flex items-center gap-3 py-3 border-b border-ink/10 last:border-0">
                  <div className="w-2 h-2 bg-red flex-shrink-0" />
                  <span className="text-[14px]">{prod}</span>
                </div>
              ))}
              <Link
                href="/tienda"
                className="mt-6 w-full bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase py-[14px] text-center block"
              >
                Comprar ahora →
              </Link>
            </div>

            {/* Back */}
            <Link
              href="/recetas"
              className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink border-b border-ink pb-[1px]"
            >
              ← Volver a recetas
            </Link>
          </div>

        </div>
      </div>
    </div>
  )
}
