import { createClient } from '@/services/supabase/server'
import { db } from '@/db'
import { profiles, orders, solicitudes } from '@/db/schema'
import { and, eq, gt } from 'drizzle-orm'
import PortalSidebar from '@/components/portal/PortalSidebar'
import type { UserRole } from '@/db/schema'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // §5 — /portal es público: muestra landing de dos caminos cuando no hay sesión.
  // Los subpages del portal (pedidos, perfil, admin, etc.) tienen su propio guard
  // con redirect('/login') — este layout ya no bloquea a visitantes anónimos.
  if (!user) {
    return (
      <div className="min-h-screen bg-paper">
        {children}
      </div>
    )
  }

  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })

  const role             = (profile?.role ?? 'consumer') as UserRole
  const displayName      = profile?.displayName ?? ''
  const vendedorNombre   = profile?.vendedorNombre ?? undefined
  const vendedorWhatsapp = profile?.vendedorWhatsapp ?? undefined

  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const recentlyUpdated = await db.query.orders.findMany({
    where: and(
      eq(orders.userId, user.id),
      eq(orders.isDeleted, false),
      gt(orders.updatedAt, sevenDaysAgo),
    ),
    columns: { id: true, status: true, updatedAt: true },
  })
  const notifCount = recentlyUpdated.filter(o => o.status !== 'pending').length

  // Solicitudes pendientes — solo relevante para admin
  let pendingSolicitudesCount = 0
  if (role === 'admin') {
    const pending = await db.query.solicitudes.findMany({
      where: and(eq(solicitudes.estado, 'pendiente'), eq(solicitudes.isDeleted, false)),
      columns: { id: true },
    })
    pendingSolicitudesCount = pending.length
  }

  return (
    <div className="min-h-screen bg-paper-2 flex max-md:flex-col">
      <PortalSidebar
        role={role}
        displayName={displayName}
        userEmail={user.email ?? ''}
        vendedorNombre={vendedorNombre}
        vendedorWhatsapp={vendedorWhatsapp}
        notifCount={notifCount}
        pendingSolicitudesCount={pendingSolicitudesCount}
      />
      <main className="flex-1 min-w-0 p-8 max-md:p-5">
        {children}
      </main>
    </div>
  )
}
