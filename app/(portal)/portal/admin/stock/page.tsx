import { redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { getProfileByUserId } from '@/repository/queries/profile'
import { getAllStockRecords } from '@/repository/queries/stock'
import { getProducts } from '@/consts/products'
import StockManager from './StockManager'

export default async function AdminStockPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfileByUserId(user.id)
  if (profile?.role !== 'admin') redirect('/portal')

  const products = getProducts()

  // Load all availability records
  const records = await getAllStockRecords()
  const recordMap = new Map(records.map((r) => [r.productId, r]))

  const items = products.map((p) => ({
    id:       p.id,
    name:     p.name,
    variant:  p.variant,
    size:     p.size,
    image:    p.image,
    status:   (recordMap.get(p.id)?.status ?? 'available') as string,
    notes:    recordMap.get(p.id)?.notes ?? null,
    updatedAt: recordMap.get(p.id)?.updatedAt ?? null,
  }))

  return (
    <div className="max-w-[860px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">── Admin</p>
      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-1">
        Gestión de stock
      </h1>
      <p className="font-body text-[14px] text-ink/50 mb-8">
        Controlá la disponibilidad de cada producto. El estado se muestra en el catálogo y en el formulario de pedidos.
      </p>
      <StockManager items={items} />
    </div>
  )
}
