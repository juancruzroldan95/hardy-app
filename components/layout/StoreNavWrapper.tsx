'use client'

import { useCart } from '@/lib/cart-context'
import { usePathname } from 'next/navigation'
import Nav from '@/components/layout/Nav'

export default function StoreNavWrapper() {
  const { cartCount, openCart } = useCart()
  const pathname = usePathname()
  const isStorePage = pathname === '/tienda'

  return (
    <Nav
      cartCount={isStorePage ? cartCount : 0}
      onCartOpen={isStorePage ? openCart : undefined}
    />
  )
}
