import type { OrderStatus } from '@/drizzle/schema'

const STATUS_CONFIG: Record<OrderStatus, { label: string; bg: string; text: string }> = {
  pending:   { label: 'Pendiente',       bg: 'bg-paper-2',     text: 'text-ink/50'        },
  confirmed: { label: 'Confirmado',      bg: 'bg-[#e8f4ea]',   text: 'text-[#2d6a35]'    },
  preparing: { label: 'En preparación', bg: 'bg-[#fff3e0]',   text: 'text-[#8b4513]'    },
  shipped:   { label: 'En camino',      bg: 'bg-[#e3f2fd]',   text: 'text-[#1a5276]'    },
  delivered: { label: 'Entregado',      bg: 'bg-[#e8f4ea]',   text: 'text-[#2d6a35]'    },
  cancelled: { label: 'Cancelado',      bg: 'bg-[#fdecea]',   text: 'text-red'           },
}

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const { label, bg, text } = STATUS_CONFIG[status]
  return (
    <span className={`${bg} ${text} font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-[5px] whitespace-nowrap`}>
      {label}
    </span>
  )
}
