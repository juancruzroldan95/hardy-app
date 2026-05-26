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
      {/* Hero */}
      <section className="bg-paper-2 py-20 px-10 pb-[60px] border-b border-ink/10 max-md:px-5 max-md:py-14">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">── Recetas</p>
          <h1
            className="font-heading font-medium tracking-[-0.02em] m-0 mb-4 leading-[1.05]"
            style={{ fontSize: 'clamp(40px,6vw,64px)' }}
          >
            Recetas con <em className="not-italic text-red">Hardy.</em>
          </h1>
          <p className="text-[16px] text-[#555] max-w-[560px] leading-[1.7] m-0">
            Desayunos, bowls, snacks y preparaciones simples con crema de maní y miel. Ideas para cada momento del día.
          </p>
        </div>
      </section>

      <RecipeFilter recetas={recetas} />
    </div>
  )
}
