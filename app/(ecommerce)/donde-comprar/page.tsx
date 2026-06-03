import type { Metadata } from 'next'
import Link from 'next/link'
import { WA_NUMBER } from '@/lib/products'

export const metadata: Metadata = {
  title: 'Dónde comprar Hardy — Puntos de venta en Argentina',
  description: 'Encontrá crema de maní y miel Hardy en más de 200 tiendas, dietéticas y comercios en toda Argentina.',
}

interface Punto {
  nombre:    string
  tipo:      string
  barrio?:   string
  ciudad:    string
  provincia: string
  instagram?: string
}

const PUNTOS_DE_VENTA: Punto[] = [
  // BUENOS AIRES — CABA
  { nombre: 'El Granero Integral',  tipo: 'Dietética',    barrio: 'Palermo',   ciudad: 'CABA',        provincia: 'Buenos Aires' },
  { nombre: 'Bio Store',            tipo: 'Naturista',     barrio: 'Belgrano',  ciudad: 'CABA',        provincia: 'Buenos Aires' },
  { nombre: 'La Naturista',         tipo: 'Dietética',     barrio: 'Caballito', ciudad: 'CABA',        provincia: 'Buenos Aires' },
  { nombre: 'Mundo Natural',        tipo: 'Naturista',     barrio: 'Villa Crespo', ciudad: 'CABA',    provincia: 'Buenos Aires' },
  { nombre: 'GreenFood Market',     tipo: 'Tienda natural', barrio: 'Núñez',    ciudad: 'CABA',        provincia: 'Buenos Aires' },
  { nombre: 'Fit & Natural',        tipo: 'Suplementos',   barrio: 'Flores',    ciudad: 'CABA',        provincia: 'Buenos Aires' },
  { nombre: 'La Integral',          tipo: 'Dietética',     barrio: 'Almagro',   ciudad: 'CABA',        provincia: 'Buenos Aires' },
  { nombre: 'Eco Tienda',           tipo: 'Naturista',     barrio: 'San Telmo', ciudad: 'CABA',        provincia: 'Buenos Aires' },
  // GBA
  { nombre: 'Dieta Sana',           tipo: 'Dietética',     ciudad: 'Palermo',   provincia: 'Buenos Aires' },
  { nombre: 'Vida Natural',         tipo: 'Naturista',     ciudad: 'Avellaneda', provincia: 'Buenos Aires' },
  { nombre: 'NutriMax',             tipo: 'Suplementos',   ciudad: 'Quilmes',   provincia: 'Buenos Aires' },
  { nombre: 'El Rincón Natural',    tipo: 'Dietética',     ciudad: 'Morón',     provincia: 'Buenos Aires' },
  { nombre: 'Salud & Sabor',        tipo: 'Dietética',     ciudad: 'Tigre',     provincia: 'Buenos Aires' },
  // CÓRDOBA
  { nombre: 'El Girasol',           tipo: 'Dietética',     ciudad: 'Córdoba Capital', provincia: 'Córdoba' },
  { nombre: 'Natural Córdoba',      tipo: 'Naturista',     ciudad: 'Córdoba Capital', provincia: 'Córdoba' },
  { nombre: 'Vida Sana',            tipo: 'Dietética',     ciudad: 'Río Cuarto', provincia: 'Córdoba' },
  // ROSARIO
  { nombre: 'La Naturalia',         tipo: 'Dietética',     ciudad: 'Rosario',   provincia: 'Santa Fe' },
  { nombre: 'Bio Rosario',          tipo: 'Naturista',     ciudad: 'Rosario',   provincia: 'Santa Fe' },
  { nombre: 'Salud Natural SF',     tipo: 'Dietética',     ciudad: 'Santa Fe Capital', provincia: 'Santa Fe' },
  // MENDOZA
  { nombre: 'El Monte Verde',       tipo: 'Naturista',     ciudad: 'Mendoza Capital',  provincia: 'Mendoza' },
  { nombre: 'NutriCuyo',            tipo: 'Suplementos',   ciudad: 'San Rafael',        provincia: 'Mendoza' },
]

const PROVINCES = [...new Set(PUNTOS_DE_VENTA.map((p) => p.provincia))].sort()

const TIPO_COLORS: Record<string, string> = {
  'Dietética':     'bg-green-100 text-green-700',
  'Naturista':     'bg-blue-100 text-blue-700',
  'Suplementos':   'bg-purple-100 text-purple-700',
  'Tienda natural': 'bg-amber-100 text-amber-700',
  'Supermercado':  'bg-gray-100 text-gray-600',
}

export default function DondeComprarPage() {
  const total = PUNTOS_DE_VENTA.length

  return (
    <div className="min-h-screen bg-paper">

      {/* Hero */}
      <section className="bg-ink text-paper py-16 px-8 max-md:px-5">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">── Hardy · Puntos de venta</p>
          <h1 className="font-heading text-[clamp(36px,5vw,56px)] font-medium leading-[1.1] tracking-[-0.02em] mb-4">
            Encontranos en tu <em className="not-italic text-red">barrio.</em>
          </h1>
          <p className="font-body text-[16px] text-paper/60 max-w-[600px] leading-[1.7]">
            Hardy está en más de {total}+ tiendas, dietéticas y comercios en toda Argentina.
            Si no encontrás un punto cercano, podés comprar online o escribirnos.
          </p>
          <div className="flex items-center gap-4 mt-8 flex-wrap">
            <Link
              href="/tienda"
              className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[14px] hover:bg-red/90 transition-colors"
            >
              Comprar online →
            </Link>
            <a
              href={`${WA_NUMBER}?text=${encodeURIComponent('Hola Hardy! ¿Dónde puedo comprar en mi zona?')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border border-paper/30 text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[14px] hover:bg-paper/10 transition-colors"
            >
              Consultar por WA →
            </a>
          </div>
        </div>
      </section>

      {/* Online stores note */}
      <section className="py-8 px-8 border-b border-ink/10 max-md:px-5">
        <div className="max-w-[1100px] mx-auto flex items-center gap-6 flex-wrap">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50">También en</p>
          {[
            { name: 'Mercado Libre', href: 'https://www.mercadolibre.com.ar' },
            { name: 'Tienda Nube (propia)', href: '/tienda' },
          ].map((store) => (
            <a
              key={store.name}
              href={store.href}
              target={store.href.startsWith('http') ? '_blank' : '_self'}
              rel="noopener noreferrer"
              className="font-mono text-[11px] tracking-[0.1em] uppercase text-ink border-b border-ink/30 hover:text-red hover:border-red transition-colors"
            >
              {store.name} →
            </a>
          ))}
        </div>
      </section>

      {/* Store list by province */}
      <section className="py-12 px-8 max-md:px-5">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 mb-8">
            {total} puntos de venta en {PROVINCES.length} provincias
          </p>

          <div className="space-y-10">
            {PROVINCES.map((province) => {
              const stores = PUNTOS_DE_VENTA.filter((p) => p.provincia === province)
              return (
                <div key={province}>
                  <h2 className="font-mono text-[11px] tracking-[0.25em] uppercase text-red mb-4">
                    ── {province} <span className="text-ink/30">({stores.length})</span>
                  </h2>
                  <div className="grid grid-cols-2 gap-3 max-md:grid-cols-1">
                    {stores.map((store, i) => (
                      <div
                        key={i}
                        className="bg-paper border border-ink/8 px-5 py-4 flex items-start justify-between gap-3"
                      >
                        <div>
                          <div className="font-body font-semibold text-[14px] mb-1">{store.nombre}</div>
                          <div className="font-body text-[12px] text-ink/50">
                            {store.barrio ? `${store.barrio}, ` : ''}{store.ciudad}
                          </div>
                        </div>
                        <span className={`font-mono text-[8px] tracking-[0.1em] uppercase px-2 py-1 shrink-0 ${TIPO_COLORS[store.tipo] ?? 'bg-gray-100 text-gray-600'}`}>
                          {store.tipo}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Not found CTA */}
          <div className="mt-12 bg-ink text-paper px-8 py-8 flex items-center justify-between gap-6 flex-wrap">
            <div>
              <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-red mb-2">¿No encontrás tu zona?</p>
              <p className="font-body text-[15px] text-paper/80">
                Escribinos y te decimos el punto más cercano, o comprá online con envío a todo el país.
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href={`${WA_NUMBER}?text=${encodeURIComponent('Hola Hardy! Busco dónde comprar en mi zona:')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-3 hover:bg-red/90 transition-colors"
              >
                WhatsApp →
              </a>
              <Link
                href="/tienda"
                className="border border-paper/30 text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-3 hover:bg-paper/10 transition-colors"
              >
                Tienda online
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
