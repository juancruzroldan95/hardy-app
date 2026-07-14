import { Suspense } from 'react'
import Nav from '@/components/layout/Nav'
import Footer from '@/components/layout/Footer'
import MayoristasBanner from '@/components/layout/MayoristasBanner'
import MetaPixel from '@/components/analytics/MetaPixel'
import PageTransition from '@/components/ui/PageTransition'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <MetaPixel />
      </Suspense>
      <Nav />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <MayoristasBanner />
    </>
  )
}
