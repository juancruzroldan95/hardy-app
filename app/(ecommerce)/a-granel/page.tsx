import type { Metadata } from 'next'
import Image from 'next/image'
import { MessageCircle } from 'lucide-react'
import { WA_NUMBER } from '@/consts/products'
import { GRANEL_PRODUCTOS } from '@/consts/granel'
import ProductCard from '@/components/granel/ProductCard'
import BulkCalculator from '@/components/granel/BulkCalculator'
import WhatsAppLink from '@/components/analytics/WhatsAppLink'

export const metadata: Metadata = {
  title: 'A Granel — Hardy',
  description:
    'Crema de maní y miel en volumen para gastronomía, repostería, cafeterías, producción e industria. Baldes de 4,5kg, 23kg, 6kg y 30kg.',
}

const PARA_QUIEN = [
  'Cafés y restaurants',
  'Reposterías',
  'Emprendedores',
  'Gimnasios y salud',
  'Industria alimentaria',
]

export default function AGranelPage() {
  return (
    <div className="bg-paper text-ink">

      {/* HERO */}
      <section className="bg-ink text-paper py-16 px-10 max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-5">── A granel</p>
          <h1
            className="font-heading font-medium tracking-[-0.02em] leading-[1.05] m-0"
            style={{ fontSize: 'clamp(36px,6vw,64px)' }}
          >
            Formatos a granel para<br /><em className="not-italic text-red">uso profesional.</em>
          </h1>
        </div>
      </section>

      {/* TARJETAS DE PRODUCTO CON PRECIO */}
      <section className="py-14 px-10 max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">── Productos y precios</p>
          <p className="font-body text-[14px] text-ink/50 mb-7">
            Precios por unidad. Descuentos por volumen aplicados automáticamente al cambiar la cantidad.
          </p>
          <div className="grid grid-cols-2 gap-[2px] max-md:grid-cols-1">
            {GRANEL_PRODUCTOS.map((p) => (
              <ProductCard key={p.id} producto={p} />
            ))}
          </div>
        </div>
      </section>

      {/* CALCULADORA */}
      <section className="py-14 px-10 bg-paper-2 max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">── Calculadora de compra</p>
          <p className="font-body text-[14px] text-ink/50 mb-7">
            Ingresá los kg que necesitás y comparamos qué formato te sale más económico en total.
          </p>
          <BulkCalculator />
        </div>
      </section>

      {/* PARA QUIÉN — chips */}
      <section className="py-12 px-10 max-md:px-6">
        <div className="max-w-[1100px] mx-auto flex flex-wrap gap-2 items-center">
          <span className="font-mono text-[9px] tracking-[0.2em] text-red uppercase mr-3">Para:</span>
          {PARA_QUIEN.map((label) => (
            <span
              key={label}
              className="bg-paper-2 border border-ink/10 font-mono text-[10px] tracking-[0.12em] uppercase text-ink/60 px-4 py-[6px]"
            >
              {label}
            </span>
          ))}
        </div>
      </section>

      {/* STORYTELLING — fotos de uso profesional */}
      <section className="bg-ink text-paper py-14 px-10 max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-8">── En tu cocina</p>
          <div className="grid grid-cols-2 gap-[2px] max-md:grid-cols-1">
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src="/lifestyle/granel-cocina.png"
                alt="Balde de crema de maní abierto en una cocina profesional"
                fill
                className="object-cover"
                sizes="(max-width: 900px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="font-heading text-[18px] font-medium text-paper m-0">Cocinas y cafeterías</p>
                <p className="font-body text-[12px] text-paper/70 m-0">Rendimiento y consistencia en cada preparación.</p>
              </div>
            </div>
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src="/lifestyle/granel-reposteria.png"
                alt="Chef de repostería incorporando crema de maní del balde a un bowl"
                fill
                className="object-cover"
                sizes="(max-width: 900px) 100vw, 50vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/70 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-5">
                <p className="font-heading text-[18px] font-medium text-paper m-0">Repostería y producción</p>
                <p className="font-body text-[12px] text-paper/70 m-0">El mejor costo por kilo para elaborar a escala.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA GLOBAL — hablar con ventas */}
      <section className="py-16 px-10 bg-paper text-center max-md:px-6">
        <div className="max-w-[420px] mx-auto">
          <p
            className="font-heading font-medium tracking-[-0.01em] mb-3"
            style={{ fontSize: 'clamp(20px,3vw,28px)' }}
          >
            ¿Industria, volúmenes grandes o condiciones especiales?
          </p>
          <p className="text-[14px] text-ink/50 mb-7 leading-[1.6]">
            Para cuentas de producción continua o acuerdos marco, hablá directamente con el equipo de ventas.
          </p>
          <WhatsAppLink
            href={`${WA_NUMBER}?text=${encodeURIComponent('Hola Hardy, quiero hablar con ventas sobre compras a granel en volumen')}`}
            className="bg-ink text-paper font-mono text-[11px] tracking-[0.18em] uppercase px-8 py-[16px] inline-flex items-center gap-2 mx-auto hover:opacity-80 transition-opacity"
            aria-label="Hablar con ventas por WhatsApp"
          >
            Hablar con ventas <MessageCircle size={14} />
          </WhatsAppLink>
        </div>
      </section>

    </div>
  )
}
