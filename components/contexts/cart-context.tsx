'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { CartItem, CartState, ShippingData } from '@/types'
import { PRODUCTS, formatARS } from '@/consts/products'
import { trackAddToCart } from '@/consts/meta-pixel'

interface CartContextValue {
  cart: CartState
  cartItems: CartItem[]
  cartCount: number
  cartTotal: number
  cartOpen: boolean
  checkoutOpen: boolean
  shippingData: ShippingData | null
  setShippingData: (data: ShippingData | null) => void
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
  const [shippingData, setShippingData] = useState<ShippingData | null>(null)

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
    const product = PRODUCTS.find((p) => p.id === id)
    const minQty  = product?.line === 'frasco' ? 2 : 1
    setCart((c) => {
      const current = c[id] ?? 0
      return { ...c, [id]: current === 0 ? minQty : current + 1 }
    })
    setCartOpen(true)
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
    const product = PRODUCTS.find((p) => p.id === id)
    const minQty  = product?.line === 'frasco' ? 2 : 1
    setCart((c) => {
      const next   = { ...c }
      const newQty = (next[id] ?? 0) + delta
      if (newQty < minQty) delete next[id]
      else next[id] = newQty
      return next
    })
  }

  useEffect(() => {
    const locked = cartOpen || checkoutOpen
    document.body.style.overflow = locked ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [cartOpen, checkoutOpen])

  function clearCart() {
    setCart({})
    setShippingData(null)
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
        shippingData,
        setShippingData,
        addItem,
        removeItem,
        updateQty,
        clearCart,
        openCart: () => setCartOpen(true),
        closeCart: () => setCartOpen(false),
        openCheckout: () => { setCartOpen(false); setCheckoutOpen(true) },
        closeCheckout: () => { setCheckoutOpen(false); setShippingData(null) },
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
