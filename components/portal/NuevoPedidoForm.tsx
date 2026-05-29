'use client'

import { useActionState, useEffect, useMemo, useState } from 'react'
import Image from 'next/image'
import { Zap, Clock, Warehouse, ClipboardList, AlertTriangle, Info } from 'lucide-react'
import { createPortalOrder } from '@/lib/actions/orders'
import type { CreateOrderState } from '@/lib/actions/orders'
import { formatARS, WA_NUMBER } from '@/lib/products'
import { HARDY_BANK, HARDY_DEPOSITO } from '@/lib/hardy'

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PriceTier {
  minQty:       number
  pricePerUnit: number
  pricePerCaja: number
}

export interface ProductOrden {
  id:           string
  name:         string
  variant:      string
  size:         string
  image:        string
  b2bPrice:     number      // first tier price per unit (display only)
  b2bPriceCaja: number      // first tier price per caja (display only)
  unitsPerBox:  number      // 15 (maní) | 12 (miel) | 1 (baldes)
  priceTiers:   PriceTier[] // sorted by minQty ASC
  isBalde:      boolean
}

interface DeliveryAddressProp {
  id:        string
  label:     string
  address:   string
  city:      string | null
  province:  string | null
  isDefault: boolean
}

interface Props {
  productos:          ProductOrden[]
  initialQtys?:       Record<string, number>
  minTotalCajas:      number
  roleName:           string
  overrideAction?:    (prev: CreateOrderState, formData: FormData) => Promise<CreateOrderState>
  deliveryAddresses?: DeliveryAddressProp[]
  stockByProduct?:    Record<string, string>   // productId → 'available'|'low_stock'|'out_of_stock'|'preorder'
  userId?:            string                    // for localStorage draft key
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const IVA = 0.21

function getShippingCost(method: string, totalCajas: number): number {
  switch (method) {
    case 'urgente_caba':      return 50000
    case 'urgente_gba':       return 75000
    case 'sin_urgencia_caba': return totalCajas <= 14 ? 15000 : totalCajas <= 25 ? 25000 : 35000
    case 'sin_urgencia_gba':  return totalCajas <= 14 ? 25000 : totalCajas <= 25 ? 35000 : 45000
    case 'retiro_deposito':   return 0
    default:                  return 0
  }
}

function getActiveTier(tiers: PriceTier[], counter: number): PriceTier | null {
  if (!tiers.length) return null
  let active = tiers[0]
  for (const tier of tiers) {
    if (counter >= tier.minQty) active = tier
  }
  return active
}

function StockBadge({ status }: { status: string | undefined }) {
  if (!status || status === 'available') return null
  const map: Record<string, { label: string; cls: string }> = {
    low_stock:    { label: 'Stock bajo',  cls: 'bg-amber-100 text-amber-700 border-amber-200' },
    out_of_stock: { label: 'Sin stock',   cls: 'bg-red/10 text-red border-red/20'             },
    preorder:     { label: 'Pre-venta',   cls: 'bg-blue-100 text-blue-700 border-blue-200'    },
  }
  const s = map[status]
  if (!s) return null
  return (
    <span className={`font-mono text-[7px] tracking-[0.12em] uppercase px-1.5 py-0.5 border ${s.cls}`}>
      {s.label}
    </span>
  )
}

// Minimum date = tomorrow
function getTomorrow(): string {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  return d.toISOString().split('T')[0]
}

// ─── Options ──────────────────────────────────────────────────────────────────

// Shipping icon components (Lucide)
const SHIPPING_ICONS = {
  urgente_caba:      Zap,
  urgente_gba:       Zap,
  sin_urgencia_caba: Clock,
  sin_urgencia_gba:  Clock,
  retiro_deposito:   Warehouse,
} as const

const SHIPPING_OPTIONS = [
  {
    value: 'urgente_caba',
    label: 'URGENTE — CABA',
    sub:   'Entrega en 48-72hs hábiles',
    cost:  '$50.000 + IVA',
    tiers: null,
  },
  {
    value: 'urgente_gba',
    label: 'URGENTE — GBA',
    sub:   'Entrega en 48-72hs hábiles',
    cost:  '$75.000 + IVA',
    tiers: null,
  },
  {
    value: 'sin_urgencia_caba',
    label: 'SIN URGENCIA — CABA',
    sub:   'Entrega en 3 a 5 días hábiles',
    cost:  'Desde $15.000 + IVA',
    tiers: [
      { label: '1 a 14 cajas / 1 a 4 baldes',       cost: 15000 },
      { label: '15 a 25 cajas / 5 a 9 baldes',       cost: 25000 },
      { label: 'Más de 25 cajas / más de 10 baldes', cost: 35000 },
    ],
  },
  {
    value: 'sin_urgencia_gba',
    label: 'SIN URGENCIA — GBA',
    sub:   'Entrega en 3 a 5 días hábiles',
    cost:  'Desde $25.000 + IVA',
    tiers: [
      { label: '1 a 14 cajas / 1 a 4 baldes',       cost: 25000 },
      { label: '15 a 25 cajas / 5 a 9 baldes',       cost: 35000 },
      { label: 'Más de 25 cajas / más de 10 baldes', cost: 45000 },
    ],
  },
  {
    value: 'retiro_deposito',
    label: 'RETIRO EN DEPÓSITO',
    sub:   `${HARDY_DEPOSITO.direccion} · ${HARDY_DEPOSITO.horario}`,
    cost:  'Sin costo',
    tiers: null,
  },
] as const

const PAYMENT_OPTIONS = [
  { value: 'transferencia',   label: 'Transferencia bancaria', sub: '50% anticipado + 50% contra entrega',   showBank: true  },
  { value: 'deposito_bancario', label: 'Depósito bancario',   sub: '50% anticipado + 50% contra entrega',   showBank: true  },
  { value: 'echeq_30',        label: 'E-CHEQ 30 días',        sub: 'Liberamos mercadería al recibir el E-CHEQ', showBank: true },
] as const

const BANK_PAYMENT_VALUES = new Set(['transferencia', 'deposito_bancario', 'echeq_30'])

// ─── Pricing table helper ─────────────────────────────────────────────────────

interface TierGroup {
  label:    string
  sublabel: string
  tiers:    PriceTier[]
  isBalde:  boolean
}

function buildTierGroups(productos: ProductOrden[]): TierGroup[] {
  const groups: TierGroup[] = []
  const seen = new Set<string>()

  // Frasco groups: deduplicate by same tier structure
  // Natural + Crunchy typically share tiers, Miel Líquida + Sólida share tiers
  const frascoPairs = [
    { ids: ['natural-380', 'crunchy-380'],         label: 'Crema de Maní Natural / Crunchy', sublabel: 'Frasco 380g · Caja 15u' },
    { ids: ['miel-liquida-500', 'miel-solida-500'], label: 'Miel Natural Líquida / Sólida',   sublabel: 'Frasco 500g · Caja 12u' },
  ]
  for (const pair of frascoPairs) {
    const representative = productos.find((p) => pair.ids.includes(p.id) && p.priceTiers.length > 0)
    if (representative && !seen.has(pair.ids[0])) {
      groups.push({ label: pair.label, sublabel: pair.sublabel, tiers: representative.priceTiers, isBalde: false })
      pair.ids.forEach((id) => seen.add(id))
    }
  }

  // Balde products — each has individual tiers
  const baldeLabels: Record<string, { label: string; sublabel: string }> = {
    'balde-45':      { label: 'Balde Crema de Maní 4,5 kg', sublabel: 'Para uso profesional y gastronómico' },
    'balde-23':      { label: 'Balde Crema de Maní 23 kg',  sublabel: 'Formato industrial' },
    'miel-balde-6':  { label: 'Balde Miel Líquida 6 kg',    sublabel: 'Para uso profesional y gastronómico' },
    'miel-balde-30': { label: 'Balde Miel Líquida 30 kg',   sublabel: 'Formato industrial' },
  }
  for (const p of productos) {
    if (p.isBalde && p.priceTiers.length > 0 && !seen.has(p.id)) {
      const meta = baldeLabels[p.id] ?? { label: p.name, sublabel: p.size }
      groups.push({ label: meta.label, sublabel: meta.sublabel, tiers: p.priceTiers, isBalde: true })
      seen.add(p.id)
    }
  }

  return groups
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function NuevoPedidoForm({
  productos,
  initialQtys,
  minTotalCajas,
  roleName,
  overrideAction,
  deliveryAddresses = [],
  stockByProduct = {},
  userId,
}: Props) {
  const [state, action, isPending] = useActionState<CreateOrderState, FormData>(
    overrideAction ?? createPortalOrder,
    undefined,
  )

  const draftKey = userId ? `hardy-order-draft-${userId}` : null

  const [qtys, setQtys] = useState<Record<string, number>>(
    Object.fromEntries(productos.map((p) => [p.id, initialQtys?.[p.id] ?? 0]))
  )
  const [selectedPayment,   setSelectedPayment]   = useState<string | null>(null)
  const [selectedShipping,  setSelectedShipping]  = useState<string | null>(null)
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(
    deliveryAddresses.find((a) => a.isDefault)?.id ?? null
  )
  const [hasDraft, setHasDraft] = useState(false)

  // ── localStorage draft ───────────────────────────────────────────────────────

  // On mount: check if there's a draft (only when no initialQtys / repeat order)
  useEffect(() => {
    if (!draftKey || initialQtys) return
    try {
      const raw = localStorage.getItem(draftKey)
      if (!raw) return
      const draft = JSON.parse(raw) as Record<string, number>
      const hasContent = Object.values(draft).some((v) => v > 0)
      if (hasContent) setHasDraft(true)
    } catch {}
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Save draft on every qty change
  useEffect(() => {
    if (!draftKey || initialQtys) return
    try {
      localStorage.setItem(draftKey, JSON.stringify(qtys))
    } catch {}
  }, [qtys, draftKey]) // eslint-disable-line react-hooks/exhaustive-deps

  function restoreDraft() {
    if (!draftKey) return
    try {
      const raw = localStorage.getItem(draftKey)
      if (!raw) return
      const draft = JSON.parse(raw) as Record<string, number>
      setQtys((prev) => ({ ...prev, ...draft }))
    } catch {}
    setHasDraft(false)
  }

  function discardDraft() {
    if (draftKey) localStorage.removeItem(draftKey)
    setHasDraft(false)
  }

  function clearDraftOnSubmit() {
    if (draftKey) localStorage.removeItem(draftKey)
  }

  // ── Totals ──────────────────────────────────────────────────────────────────

  const totalFrascoCajas = useMemo(
    () => productos.filter((p) => !p.isBalde).reduce((s, p) => s + (qtys[p.id] ?? 0), 0),
    [qtys, productos],
  )
  const totalBaldes = useMemo(
    () => productos.filter((p) => p.isBalde).reduce((s, p) => s + (qtys[p.id] ?? 0), 0),
    [qtys, productos],
  )
  const totalCajas = totalFrascoCajas + totalBaldes

  // Dynamic price per product (tier changes as totalFrascoCajas / totalBaldes grows)
  const activePrices = useMemo(() => {
    const map = new Map<string, number>()
    for (const p of productos) {
      const counter = p.isBalde ? totalBaldes : totalFrascoCajas
      const tier    = getActiveTier(p.priceTiers, counter)
      map.set(p.id, tier ? tier.pricePerCaja : p.b2bPriceCaja)
    }
    return map
  }, [productos, totalFrascoCajas, totalBaldes])

  const total = useMemo(
    () => productos.reduce((acc, p) => acc + (qtys[p.id] ?? 0) * (activePrices.get(p.id) ?? p.b2bPriceCaja), 0),
    [qtys, productos, activePrices],
  )

  const productIVA   = Math.round(total * IVA)
  const totalConIVA  = total + productIVA
  const shippingCost = selectedShipping ? getShippingCost(selectedShipping, totalCajas) : 0
  const shippingIVA  = Math.round(shippingCost * IVA)
  const grandTotal   = totalConIVA + shippingCost + shippingIVA

  const hasItems       = totalCajas > 0
  const belowMinimum   = minTotalCajas > 1 && totalFrascoCajas > 0 && totalFrascoCajas < minTotalCajas
  const canSubmit      = hasItems && !belowMinimum

  // ── Shipping tier helper ─────────────────────────────────────────────────────

  function getActiveShippingTierIdx(tiers: readonly { cost: number; label: string }[]): number {
    if (totalCajas <= 14) return 0
    if (totalCajas <= 25) return 1
    return 2
  }

  // ── Tier groups for pricing table ────────────────────────────────────────────

  const tierGroups = useMemo(() => buildTierGroups(productos), [productos])

  function setQty(id: string, value: string) {
    const n = Math.max(0, parseInt(value, 10) || 0)
    setQtys((prev) => ({ ...prev, [id]: n }))
  }

  const showBankDetails      = selectedPayment && BANK_PAYMENT_VALUES.has(selectedPayment)
  const selectedShippingOpt  = SHIPPING_OPTIONS.find((o) => o.value === selectedShipping)

  // ── WA contact (consulta) ────────────────────────────────────────────────────

  const waContactText = encodeURIComponent(
    `Hola Hardy! Soy cliente ${roleName} y tengo una consulta sobre mi pedido.`
  )

  // ── WA share (resumen del pedido) ────────────────────────────────────────────

  const waShareText = useMemo(() => {
    const lines: string[] = [`Hola Hardy! 👋 Quiero realizar el siguiente pedido (${roleName}):\n`]
    let hasItems = false
    for (const p of productos) {
      const qty = qtys[p.id] ?? 0
      if (qty > 0) {
        hasItems = true
        const pricePerCaja = activePrices.get(p.id) ?? p.b2bPriceCaja
        lines.push(`• ${p.name} ${p.size} × ${qty} ${p.isBalde ? 'unidades' : 'cajas'} — ${formatARS(pricePerCaja)}/caja`)
      }
    }
    if (!hasItems) return null
    lines.push(`\n*Total estimado (c/IVA 21%):* ${formatARS(totalConIVA)}`)
    lines.push(`\n¿Pueden confirmar disponibilidad y coordinar el envío?`)
    return encodeURIComponent(lines.join('\n'))
  }, [qtys, productos, activePrices, totalConIVA, roleName])

  // Selected delivery address details
  const selectedAddress = deliveryAddresses.find((a) => a.id === selectedAddressId)

  return (
    <form action={action} onSubmit={clearDraftOnSubmit}>

      {/* ── Banner: borrador guardado ─────────────────────────────────── */}
      {hasDraft && (
        <div className="bg-amber-50 border border-amber-200 px-5 py-4 mb-6 flex items-center justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <ClipboardList size={16} className="text-amber-700 shrink-0" />
            <p className="font-mono text-[10px] tracking-[0.08em] text-amber-800">
              Tenés un borrador guardado de tu último pedido. ¿Lo restauramos?
            </p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={restoreDraft}
              className="font-mono text-[10px] tracking-[0.12em] uppercase bg-ink text-paper px-4 py-2 hover:bg-ink/80 transition-colors"
            >
              Restaurar →
            </button>
            <button
              type="button"
              onClick={discardDraft}
              className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink/40 hover:text-ink transition-colors px-2 py-2"
            >
              Descartar
            </button>
          </div>
        </div>
      )}

      {/* ── Tabla de precios por volumen ──────────────────────────────── */}
      {tierGroups.length > 0 && (
        <div className="mb-6 bg-paper border border-ink/8">
          <div className="px-5 py-3 border-b border-ink/8 flex items-center justify-between">
            <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold">── Precios por volumen</p>
            <p className="font-mono text-[9px] tracking-[0.1em] text-ink/60 uppercase">Base imponible · +IVA 21%</p>
          </div>

          {tierGroups.map((group) => {
            const counter   = group.isBalde ? totalBaldes : totalFrascoCajas
            const activeTierIdx = group.tiers.reduce((idx, tier, i) => counter >= tier.minQty ? i : idx, 0)

            return (
              <div key={group.label} className="px-5 py-4 border-b border-ink/8 last:border-0">
                <div className="mb-3">
                  <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink font-semibold">{group.label}</p>
                  <p className="font-mono text-[9px] tracking-[0.08em] text-ink/60 mt-[2px]">{group.sublabel}</p>
                </div>

                <div className="grid gap-[3px]">
                  {group.tiers.map((tier, i) => {
                    const isActive   = i === activeTierIdx && counter > 0
                    const isNext     = !isActive && i === activeTierIdx + 1 && counter > 0
                    const nextMin    = group.tiers[activeTierIdx + 1]?.minQty
                    const toUnlock   = nextMin ? nextMin - counter : null
                    const tierLabel  = i === group.tiers.length - 1
                      ? `${tier.minQty}+  ${group.isBalde ? 'baldes' : 'cajas'}`
                      : `${tier.minQty} – ${(group.tiers[i + 1]?.minQty ?? 99) - 1}  ${group.isBalde ? 'baldes' : 'cajas'}`

                    return (
                      <div
                        key={tier.minQty}
                        className={[
                          'flex items-center justify-between px-3 py-[7px] transition-colors rounded-[1px]',
                          isActive ? 'bg-ink text-paper' : 'bg-paper-2 text-ink',
                        ].join(' ')}
                      >
                        <div className="flex items-center gap-2">
                          {isActive && <span className="text-red text-[9px]">▶</span>}
                          <span className="font-mono text-[10px] tracking-[0.06em]">{tierLabel}</span>
                          {isActive && toUnlock !== null && toUnlock > 0 && (
                            <span className="font-mono text-[8px] text-red/70 ml-1">
                              ({toUnlock} más para bajar precio)
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={[
                            'font-mono text-[10px]',
                            isActive ? 'text-paper/70' : 'text-ink/60',
                          ].join(' ')}>
                            {formatARS(tier.pricePerUnit)}/u
                          </span>
                          <span className={[
                            'font-mono text-[13px] font-semibold tabular-nums',
                            isActive ? 'text-paper' : 'text-red',
                          ].join(' ')}>
                            {formatARS(tier.pricePerCaja)}/caja
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Progress nudge */}
                {counter > 0 && (() => {
                  const nextTier = group.tiers[activeTierIdx + 1]
                  if (!nextTier) return null
                  const diff = nextTier.minQty - counter
                  return (
                    <p className="font-mono text-[9px] text-red tracking-[0.06em] mt-2">
                      Sumá {diff} {group.isBalde ? 'balde' : 'caja'}{diff > 1 ? 's' : ''} más
                      y bajás a {formatARS(nextTier.pricePerCaja)}/caja
                    </p>
                  )
                })()}
              </div>
            )
          })}
        </div>
      )}

      {/* ── Mínimo de pedido ──────────────────────────────────────────── */}
      {minTotalCajas > 1 && (
        <div className={[
          'px-5 py-4 mb-6 border flex items-start gap-3',
          belowMinimum
            ? 'bg-red/8 border-red/20'
            : 'bg-paper-2 border-ink/8',
        ].join(' ')}>
          {belowMinimum
            ? <AlertTriangle size={15} className="text-red shrink-0 mt-[1px]" />
            : <Info size={15} className="text-ink/50 shrink-0 mt-[1px]" />
          }
          <p className="font-mono text-[10px] tracking-[0.08em] text-ink/70">
            {belowMinimum
              ? `Pedido mínimo para ${roleName}: ${minTotalCajas} cajas. Actualmente tenés ${totalFrascoCajas} caja${totalFrascoCajas !== 1 ? 's' : ''}.`
              : `Pedido mínimo para ${roleName}: ${minTotalCajas} cajas de frascos.`
            }
          </p>
        </div>
      )}

      {/* ── Productos ────────────────────────────────────────────────── */}
      <div className="bg-paper border border-ink/8 mb-6">
        <div
          className="px-5 py-3 border-b border-ink/8 grid gap-4"
          style={{ gridTemplateColumns: '1fr 120px 90px 80px' }}
        >
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/70">Producto</span>
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/70 text-right">Precio/caja</span>
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/70 text-center">Cajas</span>
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/70 text-right">Subtotal</span>
        </div>

        {productos.map((p) => {
          const qty           = qtys[p.id] ?? 0
          const pricePerCaja  = activePrices.get(p.id) ?? p.b2bPriceCaja
          const subtotal      = qty * pricePerCaja
          const counter       = p.isBalde ? totalBaldes : totalFrascoCajas
          const activeTier    = getActiveTier(p.priceTiers, counter)
          const baseTier      = p.priceTiers[0]
          const priceChanged  = activeTier && baseTier && activeTier.minQty !== baseTier.minQty
          const stockStatus   = stockByProduct[p.id]
          const isOutOfStock  = stockStatus === 'out_of_stock'

          return (
            <div
              key={p.id}
              className={[
                'px-5 py-4 border-b border-ink/8 grid gap-4 items-center last:border-0',
                isOutOfStock ? 'opacity-50' : '',
              ].join(' ')}
              style={{ gridTemplateColumns: '1fr 120px 90px 80px' }}
            >
              <input type="hidden" name={`qty-${p.id}`} value={isOutOfStock ? 0 : qty} />
              <input type="hidden" name={`upb-${p.id}`} value={p.unitsPerBox} />

              <div className="flex items-center gap-3 min-w-0">
                <Image src={p.image} alt={p.name} width={40} height={40} className="object-contain shrink-0" />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="font-body font-semibold text-[13px]">{p.name}</div>
                    <StockBadge status={stockStatus} />
                  </div>
                  <div className="font-mono text-[9px] tracking-[0.12em] text-red uppercase">
                    {p.variant} · {p.size}
                    {!p.isBalde && <span className="text-ink/40 ml-2">· caja {p.unitsPerBox}u</span>}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className={`font-mono text-[13px] font-semibold ${priceChanged ? 'text-red' : 'text-red'}`}>
                  {formatARS(pricePerCaja)}
                </div>
                <div className="font-mono text-[9px] text-ink/55">{p.isBalde ? 'por unidad' : 'por caja'}</div>
                {priceChanged && (
                  <div className="font-mono text-[8px] text-ink/40 line-through">
                    {formatARS(p.b2bPriceCaja)}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-center">
                {isOutOfStock ? (
                  <span className="font-mono text-[9px] text-ink/30 uppercase tracking-[0.08em]">No disp.</span>
                ) : (
                  <div className="relative">
                    <input
                      type="number"
                      min={0}
                      value={qty || ''}
                      placeholder="0"
                      onChange={(e) => setQty(p.id, e.target.value)}
                      className="w-[70px] text-center bg-paper-2 border border-ink/15 font-mono text-[13px] py-2 outline-none focus:border-ink transition-colors"
                    />
                    {!p.isBalde && qty > 0 && (
                      <div className="absolute -bottom-[16px] left-0 right-0 text-center font-mono text-[8px] text-ink/30 whitespace-nowrap">
                        {qty * p.unitsPerBox}u
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className={`font-heading text-[16px] font-medium text-right ${subtotal > 0 ? 'text-ink' : 'text-ink/20'}`}>
                {subtotal > 0 ? formatARS(subtotal) : '—'}
              </div>
            </div>
          )
        })}

        {/* Total productos con IVA */}
        {total > 0 ? (
          <div className="border-t border-ink/8">
            <div className="px-5 py-2 bg-paper-2 flex justify-between items-center">
              <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink/65">
                Subtotal sin IVA
              </span>
              <span className="font-mono text-[12px] text-ink/70">{formatARS(total)}</span>
            </div>
            <div className="px-5 py-2 bg-paper-2 flex justify-between items-center border-t border-ink/5">
              <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink/65">
                IVA 21%
              </span>
              <span className="font-mono text-[12px] text-ink/70">{formatARS(productIVA)}</span>
            </div>
            <div className="px-5 py-4 bg-ink flex justify-between items-center">
              <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-paper/70 font-semibold">
                Total productos c/IVA
              </span>
              <span className="font-heading text-[22px] font-medium text-paper">
                {formatARS(totalConIVA)}
              </span>
            </div>
          </div>
        ) : (
          <div className="px-5 py-4 bg-paper-2 border-t border-ink/8 flex justify-between items-center">
            <span className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink/40">Total</span>
            <span className="font-heading text-[22px] font-medium text-ink/20">$0</span>
          </div>
        )}
      </div>

      {/* ── Envío ────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold mb-3">── Método de envío *</p>
        <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
          {SHIPPING_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={[
                'flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors',
                selectedShipping === opt.value ? 'bg-paper-2' : 'hover:bg-paper-2/60',
              ].join(' ')}
            >
              <input
                type="radio"
                name="shippingMethod"
                value={opt.value}
                required
                onChange={() => setSelectedShipping(opt.value)}
                className="mt-1 shrink-0 accent-[#C0171E]"
              />
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  {(() => { const Icon = SHIPPING_ICONS[opt.value as keyof typeof SHIPPING_ICONS]; return <Icon size={15} className="text-red shrink-0" /> })()}
                  <span className="font-body font-semibold text-[14px]">{opt.label}</span>
                  <span className="font-mono text-[10px] tracking-[0.1em] text-red font-semibold uppercase ml-auto">{opt.cost}</span>
                </div>
                <div className="font-body text-[12px] text-ink/70 mt-[2px]">{opt.sub}</div>
                {opt.tiers && (
                  <div className="mt-3 bg-ink/5 border border-ink/8 px-3 py-2 flex flex-col gap-[3px]">
                    {opt.tiers.map((tier, ti) => {
                      const isActive = selectedShipping === opt.value && getActiveShippingTierIdx(opt.tiers!) === ti
                      return (
                        <div
                          key={ti}
                          className={[
                            'flex items-center justify-between font-mono text-[10px] tracking-[0.06em] transition-colors',
                            isActive ? 'text-ink font-semibold' : 'text-ink/60',
                          ].join(' ')}
                        >
                          <span>{isActive && '▶ '}{tier.label}</span>
                          <span>{isActive ? '→ ' : ''}{formatARS(tier.cost)} + IVA</span>
                        </div>
                      )
                    })}
                    {selectedShipping === opt.value && totalCajas > 0 && (
                      <p className="font-mono text-[9px] text-red mt-1 pt-1 border-t border-ink/10">
                        Con {totalCajas} {totalCajas > 1 ? 'unidades' : 'unidad'} seleccionada{totalCajas > 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </label>
          ))}
        </div>
      </div>

      {/* ── Resumen total con IVA ────────────────────────────────────── */}
      {selectedShipping && total > 0 && (
        <div className="mb-6 bg-ink text-paper px-5 py-5">
          <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-red mb-4">── Resumen del pedido</p>
          <div className="space-y-2">

            {/* Productos */}
            <div className="flex justify-between">
              <span className="font-mono text-[10px] tracking-[0.1em] text-paper/50 uppercase">Productos (sin IVA)</span>
              <span className="font-mono text-[13px] text-paper">{formatARS(total)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-mono text-[10px] tracking-[0.1em] text-paper/50 uppercase">IVA productos (21%)</span>
              <span className="font-mono text-[13px] text-paper">{formatARS(productIVA)}</span>
            </div>

            {/* Envío */}
            {shippingCost > 0 && (
              <>
                <div className="flex justify-between pt-2 border-t border-paper/10">
                  <span className="font-mono text-[10px] tracking-[0.1em] text-paper/50 uppercase">Envío (sin IVA)</span>
                  <span className="font-mono text-[13px] text-paper">{formatARS(shippingCost)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-mono text-[10px] tracking-[0.1em] text-paper/50 uppercase">IVA envío (21%)</span>
                  <span className="font-mono text-[13px] text-paper">{formatARS(shippingIVA)}</span>
                </div>
              </>
            )}

            {/* Grand total */}
            <div className="pt-3 border-t border-paper/15 flex justify-between items-baseline">
              <span className="font-mono text-[11px] tracking-[0.15em] text-paper/70 uppercase">
                Total{shippingCost === 0 ? ' · Retiro sin cargo' : ''}
              </span>
              <span className="font-heading text-[32px] font-medium text-paper">{formatARS(grandTotal)}</span>
            </div>
          </div>
          <p className="font-mono text-[8px] text-paper/30 mt-4 tracking-[0.05em]">
            IVA 21% incluido en productos y envío
          </p>
        </div>
      )}

      {/* ── Pago ──────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold mb-3">── Forma de pago *</p>
        <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
          {PAYMENT_OPTIONS.map((opt) => (
            <label
              key={opt.value}
              className={[
                'flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors',
                selectedPayment === opt.value ? 'bg-paper-2' : 'hover:bg-paper-2/60',
              ].join(' ')}
            >
              <input
                type="radio"
                name="paymentMethod"
                value={opt.value}
                required
                onChange={() => setSelectedPayment(opt.value)}
                className="mt-1 shrink-0 accent-[#C0171E]"
              />
              <div>
                <div className="font-body font-semibold text-[14px]">{opt.label}</div>
                <div className="font-body text-[12px] text-ink/70">{opt.sub}</div>
              </div>
            </label>
          ))}
        </div>

        {showBankDetails && (
          <div className="mt-3 bg-ink text-paper px-5 py-5">
            <p className="font-mono text-[9px] tracking-[0.25em] uppercase text-red mb-4">── Datos para la transferencia</p>
            <div className="grid grid-cols-2 gap-x-8 gap-y-3 max-md:grid-cols-1">
              {[
                { label: 'Razón Social', value: HARDY_BANK.razonSocial },
                { label: 'Banco',        value: HARDY_BANK.banco        },
                { label: 'CBU',          value: HARDY_BANK.cbu          },
                { label: 'Alias',        value: HARDY_BANK.alias        },
                { label: 'CUIT',         value: HARDY_BANK.cuit         },
                { label: 'N° de cuenta', value: HARDY_BANK.cuenta       },
              ].map(({ label, value }) => (
                <div key={label}>
                  <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-paper/40 mb-[3px]">{label}</p>
                  <p className="font-mono text-[13px] text-paper font-medium tracking-[0.04em]">{value}</p>
                </div>
              ))}
            </div>
            <p className="font-mono text-[9px] tracking-[0.08em] text-paper/40 mt-4">
              Recordá enviar el comprobante por WhatsApp para agilizar la confirmación.
            </p>
          </div>
        )}
      </div>

      {/* ── Dirección de entrega ─────────────────────────────────────── */}
      {deliveryAddresses.length > 0 && (
        <div className="mb-6">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold mb-3">── Dirección de entrega</p>
          <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
            {deliveryAddresses.map((addr) => (
              <label
                key={addr.id}
                className={[
                  'flex items-start gap-4 px-5 py-4 cursor-pointer transition-colors',
                  selectedAddressId === addr.id ? 'bg-paper-2' : 'hover:bg-paper-2/60',
                ].join(' ')}
              >
                <input
                  type="radio"
                  name="_addressId"
                  value={addr.id}
                  checked={selectedAddressId === addr.id}
                  onChange={() => setSelectedAddressId(addr.id)}
                  className="mt-1 shrink-0 accent-[#C0171E]"
                />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-body font-semibold text-[14px]">{addr.label}</span>
                    {addr.isDefault && (
                      <span className="font-mono text-[7px] tracking-[0.12em] uppercase bg-ink text-paper px-1.5 py-0.5">
                        Principal
                      </span>
                    )}
                  </div>
                  <div className="font-body text-[12px] text-ink/50 mt-[2px]">
                    {addr.address}{addr.city ? `, ${addr.city}` : ''}{addr.province ? `, ${addr.province}` : ''}
                  </div>
                </div>
              </label>
            ))}
          </div>
          {/* Hidden field sends selected address text to the action */}
          <input
            type="hidden"
            name="shippingAddress"
            value={selectedAddress
              ? `${selectedAddress.label}: ${selectedAddress.address}${selectedAddress.city ? `, ${selectedAddress.city}` : ''}${selectedAddress.province ? `, ${selectedAddress.province}` : ''}`
              : ''}
          />
        </div>
      )}

      {/* ── OC + Fecha de entrega ─────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-4 mb-6 max-md:grid-cols-1">
        <div>
          <label htmlFor="purchaseOrderNumber" className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold block mb-3">
            ── N° de Orden de Compra (opcional)
          </label>
          <input
            id="purchaseOrderNumber"
            name="purchaseOrderNumber"
            type="text"
            placeholder="Ej: OC-2025-0047"
            className="w-full bg-paper border border-ink/15 text-ink font-mono text-[13px] px-4 py-3 outline-none focus:border-ink transition-colors"
          />
          <p className="font-mono text-[9px] text-ink/55 mt-1 tracking-[0.06em]">
            Aparece en el remito y en el detalle del pedido.
          </p>
        </div>
        <div>
          <label htmlFor="requestedDeliveryDate" className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold block mb-3">
            ── Fecha de entrega deseada (opcional)
          </label>
          <input
            id="requestedDeliveryDate"
            name="requestedDeliveryDate"
            type="date"
            min={getTomorrow()}
            className="w-full bg-paper border border-ink/15 text-ink font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors"
          />
          <p className="font-mono text-[9px] text-ink/55 mt-1 tracking-[0.06em]">
            Nos ayuda a planificar la logística.
          </p>
        </div>
      </div>

      {/* ── Notas ────────────────────────────────────────────────────── */}
      <div className="mb-6">
        <label htmlFor="notes" className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink font-semibold block mb-3">
          ── Notas del pedido (opcional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={3}
          placeholder="Indicaciones especiales, horarios, referencias adicionales, etc."
          className="w-full bg-paper border border-ink/15 text-ink font-body text-[14px] px-4 py-3 outline-none focus:border-ink transition-colors resize-none"
        />
      </div>

      {/* ── Error ────────────────────────────────────────────────────── */}
      {state && 'error' in state && (
        <div className="bg-red/10 border border-red/20 px-5 py-4 mb-5">
          <p className="font-mono text-[11px] tracking-[0.1em] text-red">{state.error}</p>
        </div>
      )}

      {/* ── Botones ──────────────────────────────────────────────────── */}
      <button
        type="submit"
        disabled={isPending || !canSubmit}
        className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-10 py-[18px] disabled:opacity-40 transition-opacity w-full"
      >
        {isPending
          ? 'Confirmando pedido...'
          : canSubmit
            ? `Confirmar pedido${total > 0 ? ` — ${formatARS(selectedShipping ? grandTotal : totalConIVA)} c/IVA` : ''} →`
            : `Pedido mínimo: ${minTotalCajas} cajas`
        }
      </button>

      {!hasItems && (
        <p className="font-mono text-[10px] tracking-[0.1em] text-ink/40 uppercase text-center mt-3">
          Agregá al menos un producto para continuar
        </p>
      )}

      {/* ── Botones WA ───────────────────────────────────────────────── */}
      <div className="mt-4 grid grid-cols-2 gap-3 max-md:grid-cols-1">

        {/* Compartir resumen del pedido */}
        {waShareText ? (
          <a
            href={`${WA_NUMBER}?text=${waShareText}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-5 py-4 bg-[#f0faf0] border border-[#25D366]/30 hover:bg-[#e6f7e6] transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" className="shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink/80 font-semibold">Enviar resumen</p>
              <p className="font-mono text-[8px] text-ink/40 mt-[2px]">Coordiná antes de confirmar</p>
            </div>
            <span className="font-mono text-[11px] text-ink/40 shrink-0">→</span>
          </a>
        ) : (
          <div className="flex items-center gap-3 px-5 py-4 bg-paper-2 border border-ink/8 opacity-40">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="#25D366" className="shrink-0">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink/50">Agregá productos para compartir</p>
          </div>
        )}

        {/* Consultar */}
        <a
          href={`${WA_NUMBER}?text=${waContactText}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-3 px-5 py-4 border border-ink/8 bg-paper hover:bg-paper-2 transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" className="shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
          <div className="flex-1 min-w-0">
            <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink/60">Consultar a Hardy</p>
            <p className="font-mono text-[8px] text-ink/30 mt-[2px]">Dudas sobre envío o pago</p>
          </div>
          <span className="font-mono text-[11px] text-ink/30 shrink-0">→</span>
        </a>
      </div>
    </form>
  )
}
