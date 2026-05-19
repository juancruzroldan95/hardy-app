'use client'

import Image from 'next/image'
import { X, Plus, Minus } from 'lucide-react'
import { useCart } from '@/lib/cart-context'

export default function CartDrawer() {
  const {
    cartItems,
    cartCount,
    cartTotal,
    cartOpen,
    checkoutOpen,
    closeCart,
    openCheckout,
    closeCheckout,
    updateQty,
    formatARS,
  } = useCart()

  const handleCheckout = async () => {
    try {
      const res = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items: cartItems }),
      })
      const data = await res.json()
      if (!res.ok) { alert('No pudimos iniciar el checkout.'); return }
      window.location.href = data.init_point
    } catch {
      alert('Error iniciando Mercado Pago.')
    }
  }

  return (
    <>
      {/* Cart drawer */}
      {cartOpen && (
        <>
          <div
            className="fixed inset-0 bg-black/50 z-[100]"
            onClick={closeCart}
          />
          <aside className="fixed right-0 top-0 bottom-0 w-[min(420px,100vw)] bg-paper z-[101] flex flex-col">
            {/* Header */}
            <div className="bg-ink text-paper px-7 py-5 flex justify-between items-center">
              <div className="font-display text-[20px] tracking-[0.04em]">TU BOLSA</div>
              <button onClick={closeCart} className="text-paper">
                <X size={20} />
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-auto px-7 py-5">
              {cartItems.length === 0 && (
                <div className="text-center text-[#888] py-[60px] font-mono text-[11px] tracking-[0.15em] uppercase">
                  Tu bolsa está vacía
                </div>
              )}
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-[14px] pb-[18px] mb-[18px] border-b border-ink/15"
                >
                  {/* Product image */}
                  <div className="w-16 h-16 bg-paper-2 flex-shrink-0 overflow-hidden flex items-center justify-center">
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={56}
                      height={56}
                      className="object-contain"
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <div className="font-mono text-[9px] tracking-[0.15em] text-red uppercase">
                      {item.variant} · {item.size}
                    </div>
                    <div className="font-heading text-[15px] font-medium mt-[2px]">{item.name}</div>
                    <div className="mt-2 flex items-center gap-2">
                      <button
                        onClick={() => updateQty(item.id, -1)}
                        className="w-[22px] h-[22px] bg-paper-2 flex items-center justify-center"
                      >
                        <Minus size={11} />
                      </button>
                      <span className="font-mono text-[12px] min-w-[18px] text-center">{item.qty}</span>
                      <button
                        onClick={() => updateQty(item.id, 1)}
                        className="w-[22px] h-[22px] bg-paper-2 flex items-center justify-center"
                      >
                        <Plus size={11} />
                      </button>
                    </div>
                  </div>

                  {/* Subtotal */}
                  <div className="font-heading font-medium text-[14px]">
                    {formatARS(item.subtotal)}
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            {cartItems.length > 0 && (
              <div className="px-7 py-5 border-t border-ink/15">
                <div className="flex justify-between mb-4">
                  <span className="font-mono text-[11px] tracking-[0.15em] uppercase">Total</span>
                  <span className="font-heading text-[26px] font-medium">{formatARS(cartTotal)}</span>
                </div>
                <button
                  onClick={openCheckout}
                  className="w-full bg-red text-paper font-mono text-[11px] tracking-[0.2em] uppercase py-[18px]"
                >
                  Finalizar compra →
                </button>
                <div className="text-center mt-[10px] text-[10px] text-[#888] font-mono tracking-[0.1em]">
                  Mercado Pago · Envío Andreani
                </div>
              </div>
            )}
          </aside>
        </>
      )}

      {/* Checkout modal */}
      {checkoutOpen && (
        <div className="fixed inset-0 bg-ink/95 z-[200] flex items-center justify-center p-10">
          <div className="bg-paper p-14 max-w-[480px] w-full text-center">
            <div className="font-mono text-[10px] tracking-[0.25em] text-red uppercase mb-[10px]">
              ── Checkout
            </div>
            <h3 className="font-heading text-[28px] font-medium mb-5">Finalizá tu compra</h3>
            <div className="bg-paper-2 p-4 font-mono text-[12px] text-left mb-6 leading-[1.8]">
              Total: <strong>{formatARS(cartTotal)}</strong>
              <br />
              Envío: Andreani (calculado en el checkout)
              <br />
              Método: Mercado Pago
            </div>
            <div className="flex gap-[10px] justify-center flex-wrap">
              <button
                onClick={handleCheckout}
                className="bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-7 py-[14px]"
              >
                Pagar con Mercado Pago
              </button>
              <button
                onClick={closeCheckout}
                className="bg-ink text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-7 py-[14px]"
              >
                Volver
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
