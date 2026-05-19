'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Receta } from '@/types'
import { CATEGORIAS } from '@/lib/recetas'

export default function RecipeFilter({ recetas }: { recetas: Receta[] }) {
  const [activeCategory, setActiveCategory] = useState<string>('Todas')

  const filtered = activeCategory === 'Todas'
    ? recetas
    : recetas.filter((r) => r.categoria === activeCategory)

  return (
    <>
      {/* Filter bar */}
      <div className="sticky top-[0px] z-40 bg-paper border-b border-ink/15 py-4 px-10 max-md:px-5">
        <div className="max-w-[1240px] mx-auto flex gap-2 overflow-x-auto">
          {CATEGORIAS.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`font-mono text-[11px] tracking-[0.15em] uppercase px-5 py-[10px] flex-shrink-0 transition-colors duration-200 ${
                activeCategory === cat
                  ? 'bg-ink text-paper'
                  : 'bg-paper-2 text-ink hover:bg-ink/10'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Recipe grid */}
      <div className="py-16 px-10 max-md:px-5 max-md:py-10">
        <div className="max-w-[1240px] mx-auto">
          <div className="grid grid-cols-3 gap-[2px] max-md:grid-cols-1">
            {filtered.map((r) => (
              <div key={r.slug} className="bg-paper-2 overflow-hidden flex flex-col group">
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="absolute top-[14px] left-[14px] z-[2] bg-ink text-paper font-mono text-[9px] tracking-[0.15em] uppercase px-[10px] py-1">
                    {r.categoria}
                  </div>
                  <Image
                    src={r.imagen}
                    alt={r.titulo}
                    fill
                    className="object-cover transition-transform duration-[400ms] group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-6 pb-7 flex-1 flex flex-col">
                  <div className="flex gap-3 mb-2 flex-wrap">
                    <span className="font-mono text-[9px] tracking-[0.15em] text-red uppercase">{r.tiempo}</span>
                    <span className="font-mono text-[9px] tracking-[0.15em] text-[#888] uppercase">{r.dificultad}</span>
                  </div>
                  <h3 className="font-heading text-[18px] font-medium m-0 mb-2 leading-[1.2]">{r.titulo}</h3>
                  <p className="text-[13px] text-[#666] leading-[1.5] m-0 mb-5 flex-1">{r.descripcion}</p>
                  <Link
                    href={`/recetas/${r.slug}`}
                    className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink border-b border-ink pb-[1px] self-start"
                  >
                    Ver receta →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}
