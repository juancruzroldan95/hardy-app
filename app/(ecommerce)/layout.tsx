import StoreNavWrapper from '@/components/layout/StoreNavWrapper'
import Footer from '@/components/layout/Footer'
import MayoristasBanner from '@/components/layout/MayoristasBanner'

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StoreNavWrapper />
      <main className="flex-1">{children}</main>
      <Footer />
      <MayoristasBanner />
    </>
  )
}
