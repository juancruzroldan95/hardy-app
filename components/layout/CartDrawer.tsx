'use client'

import Image from 'next/image'
import { useState, useRef } from 'react'
import { X, Plus, Minus, Loader2, ArrowLeft, Package, MapPin, CreditCard, Trash2 } from 'lucide-react'
import { useCart } from '@/components/contexts/cart-context'
import { trackInitiateCheckout } from '@/consts/meta-pixel'
import type { ShippingData } from '@/types'

// ─── Helpers ─────────────────────────────────────────────────────────────────

const PROVINCIAS = [
  'Buenos Aires', 'Ciudad Autónoma de Buenos Aires', 'Catamarca', 'Chaco', 'Chubut',
  'Córdoba', 'Corrientes', 'Entre Ríos', 'Formosa', 'Jujuy', 'La Pampa', 'La Rioja',
  'Mendoza', 'Misiones', 'Neuquén', 'Río Negro', 'Salta', 'San Juan', 'San Luis',
  'Santa Cruz', 'Santa Fe', 'Santiago del Estero', 'Tierra del Fuego', 'Tucumán',
]

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function isValidCP(v: string) {
  return /^\d{4,8}$/.test(v.trim())
}

// ─── Step 1: Formulario de datos de envío ────────────────────────────────────

interface Step1Props {
  cartItems: ReturnType<typeof useCart>['cartItems']
  cartTotal: number
  formatARS: (n: number) => string
  onConfirm: (data: ShippingData) => void
}

function CheckoutStep1({ cartItems, cartTotal, formatARS, onConfirm }: Step1Props) {
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '',
    calle: '', numero: '', cp: '', ciudad: '', provincia: 'Buenos Aires',
  })
  const [cotizando, setCotizando] = useState(false)
  const [cotizacion, setCotizacion] = useState<{ precio: number; diasHabiles: number; servicio: string } | null>(null)
  const [cotizError, setCotizError] = useState('')
  const cpRef = useRef<string>('')

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setForm((f) => ({ ...f, [key]: e.target.value }))
    }
  }

  async function cotizar(cp: string) {
    if (!isValidCP(cp) || cartItems.length === 0) return
    if (cpRef.current === cp && cotizacion) return  // misma cotización

    cpRef.current = cp
    setCotizando(true)
    setCotizError('')
    setCotizacion(null)

    try {
      const res = await fetch('/api/andreani/cotizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cpDestino: cp.trim(), items: cartItems }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al cotizar')
      setCotizacion(data)
    } catch (err) {
      setCotizError(err instanceof Error ? err.message : 'No pudimos calcular el envío')
    } finally {
      setCotizando(false)
    }
  }

  const isValid =
    form.nombre.trim() &&
    isValidEmail(form.email) &&
    form.telefono.trim() &&
    form.calle.trim() &&
    form.numero.trim() &&
    isValidCP(form.cp) &&
    form.ciudad.trim() &&
    form.provincia &&
    cotizacion !== null

  function handleSubmit() {
    if (!isValid || !cotizacion) return
    onConfirm({
      ...form,
      shippingCost: cotizacion.precio,
      diasHabiles:  cotizacion.diasHabiles,
      servicio:     cotizacion.servicio,
    })
  }

  const inputCls = 'w-full bg-paper-2 border border-ink/10 px-4 py-[10px] font-mono text-[12px] text-ink placeholder:text-ink/30 focus:outline-none focus:border-red transition-colors'
  const labelCls = 'block font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50 mb-[6px]'

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto px-7 py-5">
        <p className="font-mono text-[9px] tracking-[0.2em] text-red uppercase mb-4">
          Paso 1 de 2 — Datos de envío
        </p>

        <div className="space-y-[14px]">
          <div>
            <label className={labelCls}>Nombre completo *</label>
            <input className={inputCls} placeholder="María García" value={form.nombre} onChange={set('nombre')} />
          </div>
          <div className="grid grid-cols-2 gap-[10px]">
            <div>
              <label className={labelCls}>Email *</label>
              <input className={inputCls} type="email" placeholder="maria@email.com" value={form.email} onChange={set('email')} />
            </div>
            <div>
              <label className={labelCls}>Teléfono *</label>
              <input className={inputCls} placeholder="11 1234 5678" value={form.telefono} onChange={set('telefono')} />
            </div>
          </div>
          <div className="grid grid-cols-[1fr_80px] gap-[10px]">
            <div>
              <label className={labelCls}>Calle *</label>
              <input className={inputCls} placeholder="Av. Corrientes" value={form.calle} onChange={set('calle')} />
            </div>
            <div>
              <label className={labelCls}>Número *</label>
              <input className={inputCls} placeholder="1234" value={form.numero} onChange={set('numero')} />
            </div>
          </div>
          <div className="grid grid-cols-[120px_1fr] gap-[10px]">
            <div>
              <label className={labelCls}>Código postal *</label>
              <input
                className={inputCls}
                placeholder="1425"
                value={form.cp}
                onChange={set('cp')}
                onBlur={(e) => cotizar(e.target.value)}
              />
            </div>
            <div>
              <label className={labelCls}>Ciudad *</label>
              <input className={inputCls} placeholder="Buenos Aires" value={form.ciudad} onChange={set('ciudad')} />
            </div>
          </div>
          <div>
            <label className={labelCls}>Provincia *</label>
            <select className={inputCls} value={form.provincia} onChange={set('provincia')}>
              {PROVINCIAS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Cotización */}
        <div className="mt-5">
          {cotizando && (
            <div className="flex items-center gap-2 text-ink/50 font-mono text-[11px]">
              <Loader2 size={13} className="animate-spin" /> Calculando envío...
            </div>
          )}
          {cotizError && (
            <div className="text-red font-mono text-[11px]">{cotizError}</div>
          )}
          {cotizacion && !cotizando && (
            <div className="bg-paper-2 border-l-2 border-red px-4 py-3">
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-mono text-[9px] tracking-[0.12em] uppercase text-ink/40">Envío Andreani</div>
                  <div className="font-body text-[12px] text-ink/60">{cotizacion.servicio} · {cotizacion.diasHabiles} días hábiles</div>
                </div>
                <div className="font-heading text-[18px] font-medium text-red">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(cotizacion.precio)}
                </div>
              </div>
              <div className="mt-[10px] pt-[10px] border-t border-ink/10 flex justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink/50">Total con envío</span>
                <span className="font-heading font-medium text-[16px]">
                  {new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(cartTotal + cotizacion.precio)}
                </span>
              </div>
            </div>
          )}
          {!cotizacion && !cotizando && isValidCP(form.cp) && (
            <button
              onClick={() => cotizar(form.cp)}
              className="font-mono text-[10px] tracking-[0.12em] uppercase text-red border border-red px-4 py-2"
            >
              Calcular envío →
            </button>
          )}
          {!isValidCP(form.cp) && form.cp.length > 0 && (
            <div className="font-mono text-[11px] text-red/70">Ingresá un código postal válido (4 dígitos)</div>
          )}
        </div>
      </div>

      <div className="px-7 py-5 border-t border-ink/15">
        <button
          disabled={!isValid}
          onClick={handleSubmit}
          className="w-full bg-red text-paper font-mono text-[11px] tracking-[0.2em] uppercase py-[18px] disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          Continuar → Resumen
        </button>
      </div>
    </div>
  )
}

// ─── Step 2: Resumen y pago ───────────────────────────────────────────────────

interface Step2Props {
  cartItems: ReturnType<typeof useCart>['cartItems']
  shippingData: ShippingData
  formatARS: (n: number) => string
  onBack: () => void
  onPay: () => void
  paying: boolean
}

function CheckoutStep2({ cartItems, shippingData, formatARS, onBack, onPay, paying }: Step2Props) {
  const productosTotal = cartItems.reduce((s, i) => s + i.subtotal, 0)
  const total          = productosTotal + shippingData.shippingCost

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto px-7 py-5">
        <p className="font-mono text-[9px] tracking-[0.2em] text-red uppercase mb-4">
          Paso 2 de 2 — Resumen
        </p>

        {/* Productos */}
        <div className="mb-4">
          <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-2">Productos</p>
          {cartItems.map((item) => (
            <div key={item.id} className="flex justify-between py-[6px] border-b border-ink/8 text-[13px]">
              <span>{item.name} · {item.variant} · {item.size} × {item.qty}</span>
              <span className="font-medium">{formatARS(item.subtotal)}</span>
            </div>
          ))}
        </div>

        {/* Envío */}
        <div className="bg-paper-2 px-4 py-3 mb-4">
          <div className="flex justify-between text-[13px] mb-1">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink/50 self-center">Envío Andreani</span>
            <span className="font-medium">{formatARS(shippingData.shippingCost)}</span>
          </div>
          <div className="font-mono text-[10px] text-ink/40">{shippingData.servicio} · {shippingData.diasHabiles} días hábiles</div>
        </div>

        {/* Total */}
        <div className="bg-ink text-paper px-4 py-4 mb-5 flex justify-between items-center">
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-paper/50">Total</span>
          <span className="font-heading font-medium text-[24px]">{formatARS(total)}</span>
        </div>

        {/* Datos de envío */}
        <div className="border border-ink/10 divide-y divide-ink/8 text-[12px]">
          <div className="px-4 py-[10px] flex gap-3">
            <MapPin size={14} className="text-red flex-shrink-0 mt-[1px]" />
            <span>{shippingData.calle} {shippingData.numero}, {shippingData.ciudad} ({shippingData.cp}), {shippingData.provincia}</span>
          </div>
          <div className="px-4 py-[10px] flex gap-3">
            <Package size={14} className="text-red flex-shrink-0 mt-[1px]" />
            <span>{shippingData.nombre} · {shippingData.telefono}</span>
          </div>
          <div className="px-4 py-[10px] flex gap-3">
            <CreditCard size={14} className="text-red flex-shrink-0 mt-[1px]" />
            <span>{shippingData.email}</span>
          </div>
        </div>
      </div>

      <div className="px-7 py-5 border-t border-ink/15 flex gap-3">
        <button
          onClick={onBack}
          disabled={paying}
          className="bg-paper-2 text-ink font-mono text-[10px] tracking-[0.15em] uppercase px-5 py-[16px] flex items-center gap-2 disabled:opacity-40"
        >
          <ArrowLeft size={13} /> Volver
        </button>
        <button
          onClick={onPay}
          disabled={paying}
          className="flex-1 bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase py-[16px] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {paying ? (
            <><Loader2 size={14} className="animate-spin" /> Procesando...</>
          ) : (
            'Pagar con Mercado Pago →'
          )}
        </button>
      </div>
    </div>
  )
}

// ─── CartDrawer ───────────────────────────────────────────────────────────────

export default function CartDrawer() {
  const {
    cartItems,
    cartTotal,
    cartOpen,
    checkoutOpen,
    shippingData,
    setShippingData,
    closeCart,
    openCheckout,
    closeCheckout,
    updateQty,
    removeItem,
    formatARS,
    clearCart,
  } = useCart()

  const [checkoutStep, setCheckoutStep] = useState<1 | 2>(1)
  const [paying, setPaying] = useState(false)

  function handleOpenCheckout() {
    setCheckoutStep(1)
    setShippingData(null)
    trackInitiateCheckout({
      value:    cartTotal,
      numItems: cartItems.length,
      contentIds: cartItems.map((i) => i.id),
    })
    openCheckout()
  }

  function handleShippingConfirmed(data: ShippingData) {
    setShippingData(data)
    setCheckoutStep(2)
  }

  async function handlePay() {
    if (!shippingData) return
    setPaying(true)
    try {
      const res = await fetch('/api/mercadopago/create-preference', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ items: cartItems, shippingData }),
      })
      const data = await res.json()
      if (!res.ok) {
        alert(data.error ?? 'No pudimos iniciar el checkout.')
        setPaying(false)
        return
      }
      clearCart()
      window.location.href = data.init_point
    } catch {
      alert('Error iniciando Mercado Pago.')
      setPaying(false)
    }
  }

  function handleCloseCheckout() {
    closeCheckout()
    setCheckoutStep(1)
  }

  return (
    <>
      {/* Cart drawer */}
      {cartOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[100]" onClick={closeCart} />
          <aside className="fixed right-0 top-0 bottom-0 w-[min(420px,100vw)] bg-paper z-[101] flex flex-col">
            {/* Header */}
            <div className="bg-ink text-paper px-7 py-5 flex justify-between items-center">
              <div className="font-display text-[20px] tracking-[0.04em]">TU BOLSA</div>
              <button onClick={closeCart} className="text-paper"><X size={20} /></button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-auto px-7 py-5">
              {cartItems.length === 0 && (
                <div className="text-center text-[#888] py-[60px] font-mono text-[11px] tracking-[0.15em] uppercase">
                  Tu bolsa está vacía
                </div>
              )}
              {cartItems.map((item) => (
                <div key={item.id} className="flex gap-[14px] pb-[18px] mb-[18px] border-b border-ink/15">
                  <div className="w-16 h-16 bg-paper-2 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <Image src={item.image} alt={item.name} width={56} height={56} className="object-contain" />
                  </div>
                  <div className="flex-1">
                    <div className="font-mono text-[9px] tracking-[0.15em] text-red uppercase">{item.variant} · {item.size}</div>
                    <div className="font-heading text-[15px] font-medium mt-[2px]">{item.name}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-[22px] h-[22px] bg-paper-2 flex items-center justify-center">
                        <Minus size={11} />
                      </button>
                      <span className="font-mono text-[12px] min-w-[18px] text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-[22px] h-[22px] bg-paper-2 flex items-center justify-center">
                        <Plus size={11} />
                      </button>
                      <button
                        onClick={() => { if (window.confirm(`¿Estás seguro que deseás eliminar "${item.name}" del carrito?`)) removeItem(item.id) }}
                        className="w-[22px] h-[22px] ml-1 text-ink/30 hover:text-red transition-colors flex items-center justify-center"
                        title="Eliminar"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                  <div className="font-heading font-medium text-[14px]">{formatARS(item.subtotal)}</div>
                </div>
              ))}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="px-7 py-5 border-t border-ink/15">
                <div className="flex justify-between mb-4">
                  <span className="font-mono text-[11px] tracking-[0.15em] uppercase">Subtotal</span>
                  <span className="font-heading text-[26px] font-medium">{formatARS(cartTotal)}</span>
                </div>
                <button
                  onClick={handleOpenCheckout}
                  className="w-full bg-red text-paper font-mono text-[11px] tracking-[0.2em] uppercase py-[18px]"
                >
                  Finalizar compra →
                </button>
                <div className="text-center mt-[10px] text-[10px] text-[#888] font-mono tracking-[0.1em]">
                  Mercado Pago · Envío por Andreani
                </div>
              </div>
            )}
          </aside>
        </>
      )}

      {/* Checkout wizard modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-ink/95 z-[200] flex items-start justify-end max-md:items-end max-md:justify-stretch">
          <aside className="w-[min(480px,100vw)] h-full max-md:h-[92dvh] bg-paper flex flex-col">
            {/* Header */}
            <div className="bg-ink text-paper px-7 py-5 flex justify-between items-center flex-shrink-0">
              <div>
                <div className="font-display text-[18px] tracking-[0.04em]">CHECKOUT</div>
                <div className="font-mono text-[9px] tracking-[0.15em] text-red uppercase mt-[2px]">
                  {checkoutStep === 1 ? 'Datos de envío' : 'Resumen del pedido'}
                </div>
              </div>
              <button onClick={handleCloseCheckout} className="text-paper"><X size={20} /></button>
            </div>

            {/* Steps */}
            <div className="flex-1 min-h-0 overflow-hidden flex flex-col">
              {checkoutStep === 1 && (
                <CheckoutStep1
                  cartItems={cartItems}
                  cartTotal={cartTotal}
                  formatARS={formatARS}
                  onConfirm={handleShippingConfirmed}
                />
              )}
              {checkoutStep === 2 && shippingData && (
                <CheckoutStep2
                  cartItems={cartItems}
                  shippingData={shippingData}
                  formatARS={formatARS}
                  onBack={() => setCheckoutStep(1)}
                  onPay={handlePay}
                  paying={paying}
                />
              )}
            </div>
          </aside>
        </div>
      )}
    </>
  )
}
