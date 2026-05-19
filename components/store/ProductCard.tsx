'use client'

import Image from 'next/image'
import { useCart } from '@/lib/cart-context'
import type { Product } from '@/types'

export default function ProductCard({ product }: { product: Product }) {
  const { addItem, formatARS } = useCart()

  return (
    <div className="bg-paper overflow-hidden flex flex-col group">
      <div className="aspect-square overflow-hidden bg-ink">
        <Image
          src={product.lifestyle}
          alt={product.name}
          width={500}
          height={500}
          className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.04]"
        />
      </div>
      <div className="p-5 pb-6 flex flex-col flex-1">
        <div className="font-mono text-[9px] tracking-[0.2em] text-red uppercase mb-1">
          {product.variant} · {product.size}
        </div>
        <div className="font-heading text-[18px] font-medium leading-[1.2]">{product.name}</div>
        <div className="text-[13px] text-[#666] mt-1 leading-[1.5]">{product.desc}</div>
        <div className="flex-1" />
        <div className="mt-4 pt-[14px] border-t border-ink/15 flex justify-between items-center">
          <div className="font-heading text-[22px] font-medium">{formatARS(product.price)}</div>
          <button
            onClick={() => addItem(product.id)}
            className="bg-ink text-paper font-mono text-[10px] tracking-[0.12em] uppercase px-[14px] py-[10px] hover:bg-red transition-colors duration-200"
          >
            + Agregar
          </button>
        </div>
      </div>
    </div>
  )
}
