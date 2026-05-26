import type { Metadata } from 'next'
import Link from 'next/link'
import { getProducts } from '@/lib/products'
import { WA_NUMBER } from '@/lib/products'
import ProductCard from '@/components/store/ProductCard'

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Comprar crema de maní y miel HARDY. Envíos a todo Argentina.',
}

export default function TiendaPage() {
  const products = getProducts()
  const frascos = products.filter((p) => p.line === 'frasco')
  const baldes = products.filter((p) => p.line === 'balde')

  return (
    <div className="bg-paper min-h-screen">
      {/* Hero */}
      <section className="bg-paper-2 py-[60px] px-10 pb-10 border-b border-ink/10 max-md:px-5 max-md:py-12">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">── Tienda</p>
          <h1
            className="font-heading font-medium tracking-[-0.02em] m-0"
            style={{ fontSize: 'clamp(36px,5vw,56px)', lineHeight: 1.1 }}
          >
            Comprá <em className="not-italic text-red">directo.</em>
          </h1>
          <p className="text-[#666] text-[16px] mt-3 mb-0">
            Enviamos a todo el país. Coordinamos el envío según tu zona y volumen. Pagás con Mercado Pago.
          </p>
        </div>
      </section>

      {/* Products */}
      <section className="py-[60px] px-10 bg-paper max-md:px-5 max-md:py-12">
        <div className="max-w-[1100px] mx-auto">

          {/* Frascos */}
          <div className="mb-5">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-red mb-1">── Frascos</div>
            <p className="text-[13px] text-[#888] m-0">Crema de maní y miel · 380g–500g · Por unidad</p>
          </div>
          <div className="grid grid-cols-4 gap-[2px] mb-[2px] max-md:grid-cols-2">
            {frascos.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Baldes */}
          <div className="mt-10 mb-5">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-red mb-1">── Baldes</div>
            <p className="text-[13px] text-[#888] m-0">Crema de maní a granel · Uso gastronómico, producción y reventa</p>
          </div>
          <div className="grid grid-cols-4 gap-[2px] max-md:grid-cols-2">
            {baldes.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

        </div>
      </section>

      {/* Envíos */}
      <section className="bg-ink text-paper py-16 px-10 max-md:px-5">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 gap-[60px] items-center max-md:grid-cols-1 max-md:gap-10">
          <div>
            <div className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">── Envíos</div>
            <h2
              className="font-heading font-medium m-0 mb-4 leading-[1.1]"
              style={{ fontSize: 'clamp(26px,4vw,40px)' }}
            >
              Coordinamos el envío <em className="not-italic text-red">para vos.</em>
            </h2>
            <p className="text-[15px] text-[#bbb] leading-[1.7] m-0 mb-3">
              Enviamos a todo el país. El costo y el tiempo de entrega dependen de tu zona, el volumen del pedido y la urgencia — por eso lo coordinamos personalmente.
            </p>
            <p className="text-[15px] text-[#bbb] leading-[1.7] m-0 mb-7">
              Antes de finalizar tu compra, escribinos y te damos el detalle exacto del envío sin sorpresas.
            </p>
            <a
              href={`${WA_NUMBER}?text=Hola%20Hardy!%20Quiero%20saber%20el%20costo%20de%20env%C3%ADo%20a%20mi%20zona`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-red text-paper font-mono text-[11px] tracking-[0.18em] uppercase px-7 py-[14px] no-underline whitespace-nowrap"
            >
              Consultar envío →
            </a>
          </div>
          <div className="flex flex-col gap-[2px]">
            {[
              { icon: '📍', t: 'Todo el país', d: 'Llegamos a cualquier provincia. Coordinamos directamente con vos.' },
              { icon: '⚡', t: 'Según tu urgencia', d: 'Si necesitás el pedido rápido, lo resolvemos. Hablamos y buscamos la mejor opción.' },
              { icon: '📦', t: 'Según tu volumen', d: 'El envío se calcula en función de lo que pedís — frascos, baldes o cajas mayoristas.' },
              { icon: '💬', t: 'Sin sorpresas', d: 'Te confirmamos el costo antes de que pagues. Nada oculto, todo claro.' },
            ].map((f, i) => (
              <div key={i} className="flex gap-[14px] items-start px-5 py-[18px]" style={{ background: 'rgba(255,255,255,0.05)' }}>
                <span className="text-[18px] flex-shrink-0 mt-[2px]">{f.icon}</span>
                <div>
                  <div className="font-body font-bold text-[14px] mb-1">{f.t}</div>
                  <div className="text-[13px] text-[#888] leading-[1.5]">{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
