import type { Metadata } from 'next'
import { getProducts } from '@/lib/products'
import ProductCard from '@/components/store/ProductCard'

export const metadata: Metadata = {
  title: 'Tienda',
  description: 'Comprar crema de maní y miel HARDY. Envíos a todo Argentina con Andreani.',
}

export default function TiendaPage() {
  const products = getProducts()

  return (
    <div className="bg-paper min-h-screen">
      {/* Header */}
      <div className="py-16 px-10 border-b border-ink/15 max-md:px-5 max-md:py-10">
        <div className="max-w-[1240px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-[14px]">── Tienda</p>
          <h1
            className="font-heading font-medium tracking-[-0.02em] m-0"
            style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1 }}
          >
            Crema de maní y miel <em className="not-italic text-red">Hardy.</em>
          </h1>
          <p className="mt-4 text-[15px] text-[#555] max-w-[520px] leading-[1.6]">
            Productos 100% naturales. Un solo ingrediente, sin aditivos. Envíos con Andreani a todo el país.
          </p>
        </div>
      </div>

      {/* Products grid */}
      <div className="py-16 px-10 max-md:px-5 max-md:py-10">
        <div className="max-w-[1240px] mx-auto">
          <div className="grid grid-cols-4 gap-[2px] max-md:grid-cols-2">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {/* Shipping info */}
          <div className="mt-10 p-8 bg-paper-2 grid grid-cols-3 gap-8 max-md:grid-cols-1">
            {[
              { title: 'Envío Andreani', desc: 'Calculado en el checkout según tu ubicación.' },
              { title: 'Mercado Pago', desc: 'Tarjeta, débito, transferencia o efectivo.' },
              { title: 'Mayoristas', desc: 'Desde 3 cajas. Consultanos por WhatsApp.' },
            ].map((item) => (
              <div key={item.title} className="flex gap-4 items-start">
                <div className="w-2 h-2 bg-red flex-shrink-0 mt-[6px]" />
                <div>
                  <div className="font-body font-bold text-[14px]">{item.title}</div>
                  <div className="text-[13px] text-[#666] mt-[2px] leading-[1.5]">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
