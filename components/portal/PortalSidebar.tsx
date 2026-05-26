'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ROLE_LABELS } from '@/lib/roles'
import LogoutButton from '@/components/portal/LogoutButton'
import type { UserRole } from '@/drizzle/schema'

interface Props {
  role: UserRole
  displayName: string
  userEmail: string
}

const NAV_LINKS = [
  { href: '/portal',          label: 'Dashboard'   },
  { href: '/portal/pedidos',  label: 'Mis Pedidos' },
  { href: '/portal/perfil',   label: 'Mi Perfil'   },
]

export default function PortalSidebar({ role, displayName, userEmail }: Props) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/portal') return pathname === '/portal'
    return pathname.startsWith(href)
  }

  return (
    <aside className="w-[240px] max-md:w-full shrink-0 bg-ink flex flex-col min-h-screen max-md:min-h-0">
      {/* Logo */}
      <div className="px-7 pt-8 pb-6 border-b border-[#2a2a2a]">
        <Link href="/portal" className="block">
          <div className="font-display text-[28px] tracking-[0.04em] text-paper leading-none">
            HARDY
          </div>
          <div className="font-mono text-[8px] tracking-[0.25em] text-red uppercase mt-1">
            Portal
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6">
        <ul className="flex flex-col gap-1">
          {NAV_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                className={[
                  'block px-3 py-2 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors',
                  isActive(href)
                    ? 'text-paper bg-[#2a2a2a]'
                    : 'text-paper/60 hover:text-paper',
                ].join(' ')}
              >
                {isActive(href) ? '── ' : ''}{label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      {/* User info + logout */}
      <div className="px-7 py-6 border-t border-[#2a2a2a]">
        <div className="mb-1">
          <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-red">
            {ROLE_LABELS[role]}
          </span>
        </div>
        <div className="font-body text-[13px] text-white truncate mb-3">
          {displayName || userEmail}
        </div>
        <LogoutButton />
      </div>
    </aside>
  )
}
