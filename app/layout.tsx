import type { Metadata } from 'next'
import { Anton, Fraunces, JetBrains_Mono, Manrope } from 'next/font/google'
import { CartProvider } from '@/components/contexts/cart-context'
import CartDrawer from '@/components/layout/CartDrawer'
import MetaPixel from '@/components/analytics/MetaPixel'
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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hardy.ar'),
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
    title: 'HARDY — Crema de Maní y Miel Natural',
    description:
      'Crema de maní y miel 100% naturales. Un ingrediente. Sin azúcar, sin conservantes. Envíos a todo el país.',
    images: [
      {
        url: '/lifestyle/og-home.png',
        width: 1200,
        height: 630,
        alt: 'Hardy — Crema de Maní y Miel Natural',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'HARDY — Crema de Maní y Miel Natural',
    description: 'Un ingrediente. Sin azúcar, sin conservantes. Hecho en Argentina.',
    images: ['/lifestyle/og-home.png'],
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
        <MetaPixel />
        <CartProvider>
          {children}
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  )
}
