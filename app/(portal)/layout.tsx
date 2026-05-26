import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/drizzle/schema'
import { eq } from 'drizzle-orm'
import PortalSidebar from '@/components/portal/PortalSidebar'
import type { UserRole } from '@/drizzle/schema'

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const profile = await db.query.profiles.findFirst({
    where: eq(profiles.id, user.id),
  })

  const role        = (profile?.role ?? 'consumer') as UserRole
  const displayName = profile?.displayName ?? ''

  return (
    <div className="min-h-screen bg-paper-2 flex max-md:flex-col">
      <PortalSidebar
        role={role}
        displayName={displayName}
        userEmail={user.email ?? ''}
      />
      <main className="flex-1 min-w-0 p-8 max-md:p-5">
        {children}
      </main>
    </div>
  )
}
