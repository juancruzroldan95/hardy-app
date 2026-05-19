import { CartProvider } from '@/lib/cart-context'
import StoreNavWrapper from '@/components/layout/StoreNavWrapper'
import Footer from '@/components/layout/Footer'
import CartDrawer from '@/components/layout/CartDrawer'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <StoreNavWrapper />
      <main className="flex-1">{children}</main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  )
}
