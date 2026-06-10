import { Suspense } from 'react'
import StoreNavWrapper from '@/components/layout/StoreNavWrapper'
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
      <StoreNavWrapper />
      <main className="flex-1">
        <PageTransition>{children}</PageTransition>
      </main>
      <Footer />
      <MayoristasBanner />
    </>
  )
}
