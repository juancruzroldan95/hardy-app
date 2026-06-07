'use client'

import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { formatARS } from '@/consts/products'

export interface SuggestedItem {
  productId:   string
  productName: string
  size:        string
  image:       string
  qty:         number
  isBalde:     boolean
}

export interface OrderSuggestion {
  type:       'hardy' | 'repeat' | 'similar'
  title:      string
  subtitle:   string
  items:      SuggestedItem[]
  totalLabel: string
  orderId?:   string  // for repeat: the orderId to link to
}

interface Props {
  suggestions: OrderSuggestion[]
  onSelectSuggestion: (items: Record<string, number>) => void
}

export default function SuggestionsPanel({ suggestions, onSelectSuggestion }: Props) {
  const router = useRouter()

  if (suggestions.length === 0) return null

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-red font-semibold">── Sugerencias de pedido</p>
        <span className="font-mono text-[8px] tracking-[0.1em] uppercase text-ink/30 border border-ink/15 px-1.5 py-0.5">
          Basado en tu perfil
        </span>
      </div>

      <div className={`grid gap-4 ${suggestions.length >= 3 ? 'grid-cols-3 max-md:grid-cols-1' : 'grid-cols-2 max-md:grid-cols-1'}`}>
        {suggestions.map((s) => (
          <div
            key={s.type}
            className={[
              'border bg-paper flex flex-col cursor-pointer hover:border-ink/30 transition-all group',
              s.type === 'hardy' ? 'border-red/30 bg-red/3' : 'border-ink/8',
            ].join(' ')}
          >
            {/* Header */}
            <div className={[
              'px-4 py-3 border-b',
              s.type === 'hardy' ? 'border-red/20 bg-red/5' : 'border-ink/8 bg-paper-2',
            ].join(' ')}>
              <p className={[
                'font-mono text-[9px] tracking-[0.15em] uppercase font-semibold',
                s.type === 'hardy' ? 'text-red' : 'text-ink/50',
              ].join(' ')}>
                {s.type === 'hardy' && '★ '}
                {s.title}
              </p>
              <p className="font-body text-[11px] text-ink/50 mt-[2px]">{s.subtitle}</p>
            </div>

            {/* Items */}
            <div className="px-4 py-3 flex-1 space-y-2">
              {s.items.slice(0, 4).map((item) => (
                <div key={item.productId} className="flex items-center gap-2">
                  <Image src={item.image} alt={item.productName} width={24} height={24} className="object-contain shrink-0" />
                  <div className="flex-1 min-w-0">
                    <span className="font-body text-[12px] text-ink truncate block">{item.productName}</span>
                    <span className="font-mono text-[8px] text-ink/40">{item.size}</span>
                  </div>
                  <span className="font-mono text-[11px] text-ink font-semibold shrink-0">
                    ×{item.qty} {item.isBalde ? 'ud.' : 'cj.'}
                  </span>
                </div>
              ))}
              {s.items.length > 4 && (
                <p className="font-mono text-[9px] text-ink/30">+{s.items.length - 4} más</p>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-ink/8 flex items-center justify-between">
              <span className="font-mono text-[9px] text-ink/40 uppercase tracking-[0.08em]">{s.totalLabel}</span>
              <button
                onClick={() => {
                  if (s.type === 'repeat' && s.orderId) {
                    router.push(`/portal/pedidos/nuevo?repeat=${s.orderId}`)
                  } else {
                    onSelectSuggestion(
                      Object.fromEntries(s.items.map((i) => [i.productId, i.qty]))
                    )
                  }
                }}
                className={[
                  'font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-1.5 transition-all',
                  s.type === 'hardy'
                    ? 'bg-red text-paper hover:bg-red/90'
                    : 'bg-ink text-paper hover:bg-ink/80',
                ].join(' ')}
              >
                Usar este →
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
