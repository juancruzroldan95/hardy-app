import type { PaymentStatus } from '@/db/schema'

const STATUS_CONFIG: Record<PaymentStatus, { label: string; bg: string; text: string }> = {
  unpaid:   { label: 'Sin pagar',   bg: 'bg-[#fdecea]', text: 'text-red'        },
  paid:     { label: 'Pagado',      bg: 'bg-[#e8f4ea]', text: 'text-[#2d6a35]' },
  refunded: { label: 'Reintegrado', bg: 'bg-paper-2',   text: 'text-ink/50'    },
  failed:   { label: 'Fallido',     bg: 'bg-[#fdecea]', text: 'text-red'       },
}

export default function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const { label, bg, text } = STATUS_CONFIG[status]
  return (
    <span className={`${bg} ${text} font-mono text-[9px] tracking-[0.12em] uppercase px-3 py-[5px] whitespace-nowrap`}>
      {label}
    </span>
  )
}
