'use client'

import { createContext, useContext, useMemo, useState } from 'react'
import type { CartItem, CartState } from '@/types'
import { PRODUCTS, formatARS } from '@/lib/products'
import { trackAddToCart } from '@/lib/meta-pixel'

interface CartContextValue {
  cart: CartState
  cartItems: CartItem[]
  cartCount: number
  cartTotal: number
  cartOpen: boolean
  checkoutOpen: boolean
  addItem: (id: string) => void
  removeItem: (id: string) => void
  updateQty: (id: string, delta: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  openCheckout: () => void
  closeCheckout: () => void
  formatARS: (n: number) => string
}

const CartContext = createContext<CartContextValue | null>(null)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartState>({})
  const [cartOpen, setCartOpen] = useState(false)
  const [checkoutOpen, setCheckoutOpen] = useState(false)

  const cartItems = useMemo<CartItem[]>(() =>
    Object.entries(cart).flatMap(([id, qty]) => {
      const product = PRODUCTS.find((p) => p.id === id)
      if (!product) return []
      return [{ ...product, qty, subtotal: product.price * qty }]
    }),
    [cart]
  )

  const cartCount = useMemo(() => cartItems.reduce((s, i) => s + i.qty, 0), [cartItems])
  const cartTotal = useMemo(() => cartItems.reduce((s, i) => s + i.subtotal, 0), [cartItems])

  function addItem(id: string) {
    setCart((c) => ({ ...c, [id]: (c[id] ?? 0) + 1 }))
    setCartOpen(true)
    const product = PRODUCTS.find((p) => p.id === id)
    if (product) {
      trackAddToCart({ value: product.price, contentName: product.name, contentIds: [product.id] })
    }
  }

  function removeItem(id: string) {
    setCart((c) => {
      const next = { ...c }
      delete next[id]
      return next
    })
  }

  function updateQty(id: string, delta: number) {
    setCart((c) => {
      const next = { ...c }
      const newQty = (next[id] ?? 0) + delta
      if (newQty <= 0) delete next[id]
      else next[id] = newQty
      return next
    })
  }

  function clearCart() {
    setCart({})
  }

  return (
    <CartContext.Provider
      value={{
        cart,
        cartItems,
        cartCount,
        cartTotal,
        cartOpen,
        checkoutOpen,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        openCart: () => setCartOpen(true),
        closeCart: () => setCartOpen(false),
        openCheckout: () => { setCartOpen(false); setCheckoutOpen(true) },
        closeCheckout: () => setCheckoutOpen(false),
        formatARS,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
