'use client'

import { useCart } from '@/lib/cart-context'
import Nav from '@/components/layout/Nav'

export default function StoreNavWrapper() {
  const { cartCount, openCart } = useCart()
  return <Nav cartCount={cartCount} onCartOpen={openCart} />
}
