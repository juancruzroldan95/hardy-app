import { Suspense } from 'react'
import StoreNavWrapper from '@/components/layout/StoreNavWrapper'
import Footer from '@/components/layout/Footer'
import MayoristasBanner from '@/components/layout/MayoristasBanner'
import MetaPixel from '@/components/analytics/MetaPixel'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <MetaPixel />
      </Suspense>
      <StoreNavWrapper />
      <main className="flex-1">{children}</main>
      <Footer />
      <MayoristasBanner />
    </>
  )
}
