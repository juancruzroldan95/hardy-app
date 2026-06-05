'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import type { Receta } from '@/types'
import { CATEGORIAS } from '@/lib/recetas'

export default function RecipeFilter({ recetas }: { recetas: Receta[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('Todas')

  const filtered = activeCategory === 'Todas'
    ? recetas
    : recetas.filter((r) => r.categoria === activeCategory)

  return (
    <>
      {/* Filter bar — sticky just below the nav */}
      <section className="sticky top-[99px] z-40 bg-paper border-b border-ink/10">
        <div className="max-w-[1100px] mx-auto px-10 max-md:px-5 flex gap-[2px]">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-6 py-4 font-mono text-[11px] tracking-[0.15em] uppercase border-none cursor-pointer transition-all duration-200 flex-shrink-0 ${
                activeCategory === cat
                  ? 'bg-ink text-paper'
                  : 'bg-transparent text-[#555] hover:bg-ink/5'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </section>

      {/* Recipe grid */}
      <section className="py-[60px] px-10 bg-paper max-md:px-5 max-md:py-12">
        <div className="max-w-[1100px] mx-auto">
          <div className="font-mono text-[11px] text-[#888] tracking-[0.1em] mb-6">
            {filtered.length} recetas
          </div>
          <div className="grid grid-cols-3 gap-6 max-md:grid-cols-2 max-[600px]:grid-cols-1">
            {filtered.map((r, i) => (
              <div
                key={r.slug}
                className="group bg-paper border border-ink/10 overflow-hidden flex flex-col cursor-pointer transition-colors duration-300 hover:bg-ink hover:shadow-[0_8px_32px_rgba(0,0,0,0.2)]"
              >
                <div className="overflow-hidden aspect-[4/3]">
                  <Image
                    src={r.imagen}
                    alt={r.titulo}
                    width={600}
                    height={450}
                    priority={i < 3}
                    sizes="(max-width: 600px) 100vw, (max-width: 900px) 50vw, 33vw"
                    className="w-full h-full object-cover block transition-transform duration-[400ms] group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-4 flex flex-col flex-1">
                  {/* Meta */}
                  <div className="flex gap-2 mb-3 flex-wrap items-center">
                    <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-red group-hover:text-red">
                      {r.categoria}
                    </span>
                    <span className="text-[#ccc] text-[10px]">·</span>
                    <span className="font-mono text-[10px] text-[#888] group-hover:text-[#666]">⏱ {r.tiempo}</span>
                    <span className="text-[#ccc] text-[10px]">·</span>
                    <span className="font-mono text-[10px] text-[#888] group-hover:text-[#666]">👤 {r.porciones}</span>
                  </div>
                  <h3 className="font-heading text-[20px] font-medium m-0 mb-2 leading-[1.2] group-hover:text-paper transition-colors duration-300">
                    {r.titulo}
                  </h3>
                  <p className="text-[13px] text-[#555] group-hover:text-[#aaa] leading-[1.6] m-0 mb-4 flex-1 transition-colors duration-300">
                    {r.descripcion}
                  </p>
                  {/* Product chips */}
                  <div className="mb-4 flex flex-wrap gap-[6px]">
                    {r.productos.map((p, i) => (
                      <span
                        key={i}
                        className="bg-paper-2 group-hover:bg-[#2a2a2a] px-[10px] py-1 font-mono text-[9px] tracking-[0.1em] uppercase text-[#666] group-hover:text-[#aaa] transition-colors duration-300"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                  <Link
                    href={`/recetas/${r.slug}`}
                    className="block bg-ink group-hover:bg-red text-paper text-center font-mono text-[11px] tracking-[0.15em] uppercase py-[14px] px-5 no-underline transition-colors duration-300"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Ver receta →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  )
}
