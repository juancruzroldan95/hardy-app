import type { Metadata } from 'next'
import { Anton, Fraunces, JetBrains_Mono, Manrope } from 'next/font/google'
import { CartProvider } from '@/lib/cart-context'
import CartDrawer from '@/components/layout/CartDrawer'
import './globals.css'

const anton = Anton({
  weight: '400',
  variable: '--font-anton',
  subsets: ['latin'],
})

const fraunces = Fraunces({
  variable: '--font-fraunces',
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
})

const manrope = Manrope({
  variable: '--font-manrope',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: {
    default: 'HARDY — Crema de Maní y Miel',
    template: '%s | HARDY',
  },
  description:
    'Crema de maní y miel 100% naturales. Un ingrediente, sin aditivos. Envíos a todo el país.',
  keywords: ['crema de maní', 'miel', 'natural', 'sin aditivos', 'Argentina', 'Hardy'],
  openGraph: {
    siteName: 'HARDY',
    locale: 'es_AR',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html
      lang="es-AR"
      className={`${anton.variable} ${fraunces.variable} ${jetbrainsMono.variable} ${manrope.variable}`}
    >
      <body className="min-h-screen flex flex-col font-body bg-paper text-ink">
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
