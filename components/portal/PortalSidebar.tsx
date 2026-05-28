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
  vendedorNombre?: string
  vendedorWhatsapp?: string
}

const CLIENT_LINKS = [
  { href: '/portal',                label: 'Dashboard'     },
  { href: '/portal/catalogo',       label: 'Catálogo'      },
  { href: '/portal/pedidos/nuevo',  label: 'Nuevo Pedido'  },
  { href: '/portal/pedidos',        label: 'Mis Pedidos'   },
  { href: '/portal/cuenta',         label: 'Mi Cuenta'     },
  { href: '/portal/novedades',      label: 'Novedades'     },
  { href: '/portal/perfil',         label: 'Mi Perfil'     },
]

const ADMIN_LINKS = [
  { href: '/portal/admin/solicitudes', label: 'Solicitudes' },
  { href: '/portal/admin/pedidos',     label: 'Pedidos'     },
  { href: '/portal/admin/novedades',   label: 'Novedades'   },
  { href: '/portal/admin/clientes',    label: 'Clientes'    },
]

export default function PortalSidebar({
  role,
  displayName,
  userEmail,
  vendedorNombre,
  vendedorWhatsapp,
}: Props) {
  const pathname = usePathname()

  function isActive(href: string) {
    if (href === '/portal') return pathname === '/portal'
    return pathname.startsWith(href)
  }

  const isAdmin = role === 'admin'

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
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {CLIENT_LINKS.map(({ href, label }) => (
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

        {/* Admin section */}
        {isAdmin && (
          <div className="mt-6">
            <p className="px-3 mb-2 font-mono text-[8px] tracking-[0.25em] uppercase text-red/70">
              Admin
            </p>
            <ul className="flex flex-col gap-1">
              {ADMIN_LINKS.map(({ href, label }) => (
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
          </div>
        )}
      </nav>

      {/* Vendedor contact (only shown if assigned) */}
      {vendedorNombre && !isAdmin && (
        <div className="px-7 py-4 border-t border-[#2a2a2a]">
          <p className="font-mono text-[8px] tracking-[0.2em] uppercase text-paper/30 mb-1">
            Tu vendedor
          </p>
          <p className="font-body text-[13px] text-paper/80 mb-1">{vendedorNombre}</p>
          {vendedorWhatsapp && (
            <a
              href={`https://wa.me/${vendedorWhatsapp.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-[9px] tracking-[0.12em] uppercase text-red hover:text-paper transition-colors"
            >
              WhatsApp →
            </a>
          )}
        </div>
      )}

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
