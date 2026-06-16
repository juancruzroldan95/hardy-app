'use client'

import Image from 'next/image'
import { useState } from 'react'
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

const SHIPPING_OPTIONS = [
  { method: 'sin_urgencia_caba',  label: 'CABA — Sin urgencia',  desc: '3–5 días hábiles', price: 2500 },
  { method: 'urgente_caba',       label: 'CABA — Urgente',       desc: '24–48 hs',          price: 4500 },
  { method: 'sin_urgencia_gba',   label: 'GBA — Sin urgencia',   desc: '3–5 días hábiles', price: 3200 },
  { method: 'urgente_gba',        label: 'GBA — Urgente',        desc: '24–48 hs',          price: 5500 },
  { method: 'coordinar_whatsapp', label: 'Interior del país',    desc: 'A coordinar',       price: 0    },
  { method: 'retiro_deposito',    label: 'Retiro en depósito',   desc: 'CABA · sin costo',  price: 0    },
]

function isValidEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)
}

function fmtARS(n: number) {
  return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n)
}

// ─── Step 1: Formulario de datos de envío ────────────────────────────────────

interface Step1Props {
  cartItems: ReturnType<typeof useCart>['cartItems']
  cartTotal: number
  formatARS: (n: number) => string
  onConfirm: (data: ShippingData) => void
}

function CheckoutStep1({ cartTotal, formatARS, onConfirm }: Step1Props) {
  const [form, setForm] = useState({
    nombre: '', email: '', telefono: '',
    calle: '', numero: '', cp: '', ciudad: '', provincia: 'Buenos Aires',
    shippingMethod: '',
  })
  const [errors, setErrors]           = useState<Record<string, string>>({})
  const [triedToAdvance, setTried]    = useState(false)

  function set(key: keyof typeof form) {
    return (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const val = e.target.value
      setForm((f) => ({ ...f, [key]: val }))
      if (triedToAdvance) setErrors((prev) => ({ ...prev, [key]: '' }))
    }
  }

  function validate() {
    const e: Record<string, string> = {}
    if (!form.nombre.trim())          e.nombre         = 'Requerido'
    if (!form.email.trim())           e.email          = 'Requerido'
    else if (!isValidEmail(form.email)) e.email        = 'Email inválido'
    if (!form.telefono.trim())        e.telefono       = 'Requerido'
    if (!form.calle.trim())           e.calle          = 'Requerido'
    if (!form.numero.trim())          e.numero         = 'Requerido'
    if (!form.cp.trim())              e.cp             = 'Requerido'
    if (!form.ciudad.trim())          e.ciudad         = 'Requerido'
    if (!form.provincia)              e.provincia      = 'Requerido'
    if (!form.shippingMethod)         e.shippingMethod = 'Seleccioná un método de envío'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  function handleSubmit() {
    setTried(true)
    if (!validate()) return
    const opt = SHIPPING_OPTIONS.find((o) => o.method === form.shippingMethod)!
    onConfirm({
      nombre:         form.nombre,
      email:          form.email,
      telefono:       form.telefono,
      calle:          form.calle,
      numero:         form.numero,
      cp:             form.cp,
      ciudad:         form.ciudad,
      provincia:      form.provincia,
      shippingMethod: form.shippingMethod,
      shippingCost:   opt.price,
    })
  }

  const inputCls = (field: string) =>
    `w-full bg-paper-2 border px-4 py-[10px] font-mono text-[12px] text-ink placeholder:text-ink/30 focus:outline-none transition-colors ${
      triedToAdvance && errors[field] ? 'border-red' : 'border-ink/10 focus:border-red'
    }`
  const labelCls  = 'block font-mono text-[9px] tracking-[0.15em] uppercase text-ink/50 mb-[6px]'
  const errorCls  = 'font-mono text-[9px] text-red mt-[4px]'

  const selectedOpt = SHIPPING_OPTIONS.find((o) => o.method === form.shippingMethod)
  const totalConEnvio = cartTotal + (selectedOpt?.price ?? 0)

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-auto px-7 py-5">
        <p className="font-mono text-[9px] tracking-[0.2em] text-red uppercase mb-4">
          Paso 1 de 2 — Datos de envío
        </p>

        <div className="space-y-[14px]">
          <div>
            <label htmlFor="checkout-nombre" className={labelCls}>Nombre completo *</label>
            <input
              id="checkout-nombre"
              name="nombre"
              autoComplete="name"
              className={inputCls('nombre')}
              placeholder="María García"
              value={form.nombre}
              onChange={set('nombre')}
            />
            {triedToAdvance && errors.nombre && <p className={errorCls}>{errors.nombre}</p>}
          </div>

          <div className="grid grid-cols-2 gap-[10px]">
            <div>
              <label htmlFor="checkout-email" className={labelCls}>Email *</label>
              <input
                id="checkout-email"
                name="email"
                type="email"
                autoComplete="email"
                className={inputCls('email')}
                placeholder="maria@email.com"
                value={form.email}
                onChange={set('email')}
              />
              {triedToAdvance && errors.email && <p className={errorCls}>{errors.email}</p>}
            </div>
            <div>
              <label htmlFor="checkout-telefono" className={labelCls}>Teléfono *</label>
              <input
                id="checkout-telefono"
                name="telefono"
                type="tel"
                autoComplete="tel"
                className={inputCls('telefono')}
                placeholder="11 1234 5678"
                value={form.telefono}
                onChange={set('telefono')}
              />
              {triedToAdvance && errors.telefono && <p className={errorCls}>{errors.telefono}</p>}
            </div>
          </div>

          <div className="grid grid-cols-[1fr_80px] gap-[10px]">
            <div>
              <label htmlFor="checkout-calle" className={labelCls}>Calle *</label>
              <input
                id="checkout-calle"
                name="calle"
                autoComplete="address-line1"
                className={inputCls('calle')}
                placeholder="Av. Corrientes"
                value={form.calle}
                onChange={set('calle')}
              />
              {triedToAdvance && errors.calle && <p className={errorCls}>{errors.calle}</p>}
            </div>
            <div>
              <label htmlFor="checkout-numero" className={labelCls}>Número *</label>
              <input
                id="checkout-numero"
                name="numero"
                autoComplete="address-line2"
                className={inputCls('numero')}
                placeholder="1234"
                value={form.numero}
                onChange={set('numero')}
              />
              {triedToAdvance && errors.numero && <p className={errorCls}>{errors.numero}</p>}
            </div>
          </div>

          <div className="grid grid-cols-[120px_1fr] gap-[10px]">
            <div>
              <label htmlFor="checkout-cp" className={labelCls}>Cód. postal *</label>
              <input
                id="checkout-cp"
                name="cp"
                autoComplete="postal-code"
                className={inputCls('cp')}
                placeholder="1425"
                value={form.cp}
                onChange={set('cp')}
              />
              {triedToAdvance && errors.cp && <p className={errorCls}>{errors.cp}</p>}
            </div>
            <div>
              <label htmlFor="checkout-ciudad" className={labelCls}>Ciudad *</label>
              <input
                id="checkout-ciudad"
                name="ciudad"
                autoComplete="address-level2"
                className={inputCls('ciudad')}
                placeholder="Buenos Aires"
                value={form.ciudad}
                onChange={set('ciudad')}
              />
              {triedToAdvance && errors.ciudad && <p className={errorCls}>{errors.ciudad}</p>}
            </div>
          </div>

          <div>
            <label htmlFor="checkout-provincia" className={labelCls}>Provincia *</label>
            <select
              id="checkout-provincia"
              name="provincia"
              autoComplete="address-level1"
              className={inputCls('provincia')}
              value={form.provincia}
              onChange={set('provincia')}
            >
              {PROVINCIAS.map((p) => <option key={p}>{p}</option>)}
            </select>
          </div>
        </div>

        {/* Método de envío */}
        <div className="mt-5">
          <p className={`${labelCls} mb-3`}>Método de envío *</p>
          <div className="flex flex-col gap-[6px]">
            {SHIPPING_OPTIONS.map((opt) => {
              const active = form.shippingMethod === opt.method
              return (
                <button
                  key={opt.method}
                  type="button"
                  onClick={() => {
                    setForm((f) => ({ ...f, shippingMethod: opt.method }))
                    if (triedToAdvance) setErrors((prev) => ({ ...prev, shippingMethod: '' }))
                  }}
                  className={`flex items-center justify-between px-4 py-[10px] border text-left transition-colors ${
                    active
                      ? 'bg-ink text-paper border-ink'
                      : 'bg-paper-2 border-ink/10 hover:border-ink/30'
                  }`}
                >
                  <div>
                    <div className={`font-mono text-[11px] ${active ? 'text-paper' : 'text-ink'}`}>{opt.label}</div>
                    <div className={`font-mono text-[9px] ${active ? 'text-paper/50' : 'text-ink/40'}`}>{opt.desc}</div>
                  </div>
                  <div className={`font-heading text-[14px] font-medium ${active ? 'text-paper' : 'text-ink'}`}>
                    {opt.price > 0 ? fmtARS(opt.price) : 'Gratis'}
                  </div>
                </button>
              )
            })}
          </div>
          {triedToAdvance && errors.shippingMethod && (
            <p className={errorCls}>{errors.shippingMethod}</p>
          )}
        </div>

        {/* Total preview */}
        {selectedOpt && (
          <div className="mt-4 pt-4 border-t border-ink/10 flex justify-between items-center">
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink/50">Total estimado</span>
            <span className="font-heading font-medium text-[16px]">{formatARS(totalConEnvio)}</span>
          </div>
        )}
      </div>

      <div className="px-7 py-5 border-t border-ink/15">
        <button
          onClick={handleSubmit}
          className="w-full bg-red text-paper font-mono text-[11px] tracking-[0.2em] uppercase py-[18px] transition-opacity"
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
  const opt            = SHIPPING_OPTIONS.find((o) => o.method === shippingData.shippingMethod)

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
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink/50 self-center">Envío</span>
            <span className="font-medium">
              {shippingData.shippingCost > 0 ? formatARS(shippingData.shippingCost) : 'Gratis'}
            </span>
          </div>
          {opt && <div className="font-mono text-[10px] text-ink/40">{opt.label} · {opt.desc}</div>}
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
                  Mercado Pago · Envío a todo el país
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
