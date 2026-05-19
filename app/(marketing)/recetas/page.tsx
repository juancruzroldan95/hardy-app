import type { Metadata } from 'next'
import { getRecetas } from '@/lib/recetas'
import RecipeFilter from '@/components/recipes/RecipeFilter'

export const metadata: Metadata = {
  title: 'Recetas',
  description: 'Recetas con crema de maní y miel HARDY. Desayunos, snacks fit y más ideas simples y naturales.',
}

export default function RecetasPage() {
  const recetas = getRecetas()

  return (
    <div className="bg-paper min-h-screen">
      {/* Header */}
      <div className="py-16 px-10 border-b border-ink/15 max-md:px-5 max-md:py-10">
        <div className="max-w-[1240px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-[14px]">── Recetas</p>
          <h1
            className="font-heading font-medium tracking-[-0.02em] m-0"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1 }}
          >
            Ideas con <em className="not-italic text-red">Hardy.</em>
          </h1>
          <p className="mt-4 text-[15px] text-[#555] max-w-[520px] leading-[1.6]">
            {recetas.length} recetas simples para usar crema de maní y miel en tu día a día.
          </p>
        </div>
      </div>

      <RecipeFilter recetas={recetas} />
    </div>
  )
}
