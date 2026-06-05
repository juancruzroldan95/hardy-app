'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X } from 'lucide-react'
import { ROLE_LABELS } from '@/lib/roles'
import LogoutButton from '@/components/portal/LogoutButton'
import type { UserRole } from '@/drizzle/schema'

interface Props {
  role: UserRole
  displayName: string
  userEmail: string
  vendedorNombre?: string
  vendedorWhatsapp?: string
  notifCount?: number
}

const CLIENT_LINKS = [
  { href: '/portal',                label: 'Dashboard'    },
  { href: '/portal/catalogo',       label: 'Catálogo'     },
  { href: '/portal/pedidos/nuevo',  label: 'Nuevo Pedido' },
  { href: '/portal/pedidos',        label: 'Mis Pedidos'  },
  { href: '/portal/precios',        label: 'Lista de Precios' },
  { href: '/portal/cuenta',         label: 'Mi Cuenta'    },
  { href: '/portal/materiales',     label: 'Materiales'   },
  { href: '/portal/novedades',      label: 'Novedades'    },
  { href: '/portal/perfil',         label: 'Mi Perfil'    },
]

const ADMIN_LINKS = [
  { href: '/portal/admin',              label: 'Dashboard'   },
  { href: '/portal/admin/solicitudes',  label: 'Solicitudes' },
  { href: '/portal/admin/pedidos',      label: 'Pedidos'     },
  { href: '/portal/admin/clientes',     label: 'Clientes'    },
  { href: '/portal/admin/suscriptores', label: 'Suscriptores' },
  { href: '/portal/admin/stock',        label: 'Stock'       },
  { href: '/portal/admin/finanzas',     label: 'Finanzas'    },
  { href: '/portal/admin/resenas',      label: 'Reseñas'     },
  { href: '/portal/admin/novedades',    label: 'Novedades'   },
]

export default function PortalSidebar({
  role,
  displayName,
  userEmail,
  vendedorNombre,
  vendedorWhatsapp,
  notifCount,
}: Props) {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  function isActive(href: string) {
    if (href === '/portal') return pathname === '/portal'
    if (href === '/portal/admin') return pathname === '/portal/admin'
    // "Nuevo Pedido" solo activo en esa ruta exacta
    if (href === '/portal/pedidos/nuevo') return pathname === '/portal/pedidos/nuevo'
    // "Mis Pedidos": activo en /portal/pedidos y /portal/pedidos/[id], pero NO en /nuevo
    if (href === '/portal/pedidos') {
      return pathname === '/portal/pedidos' ||
        (pathname.startsWith('/portal/pedidos/') && !pathname.startsWith('/portal/pedidos/nuevo'))
    }
    return pathname.startsWith(href)
  }

  const isAdmin = role === 'admin'

  return (
    <aside className="w-[240px] max-md:w-full shrink-0 bg-ink flex flex-col min-h-screen max-md:min-h-0 max-md:sticky max-md:top-0 max-md:z-40">
      {/* Logo + hamburger (mobile) */}
      <div className="px-7 pt-8 pb-6 border-b border-[#2a2a2a] max-md:py-4 max-md:flex max-md:items-center max-md:justify-between">
        <div>
          <Link href="/portal" className="block" onClick={() => setOpen(false)}>
            <div className="font-display text-[28px] tracking-[0.04em] text-paper leading-none max-md:text-[24px]">
              HARDY
            </div>
            <div className="font-mono text-[8px] tracking-[0.25em] text-red uppercase mt-1">
              Portal
            </div>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 mt-4 max-md:hidden font-mono text-[9px] tracking-[0.15em] uppercase text-paper/40 hover:text-paper transition-colors"
          >
            ← Volver al sitio
          </Link>
        </div>
        {/* Hamburger — solo mobile */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="hidden max-md:flex items-center justify-center w-10 h-10 border border-[#2a2a2a] text-paper"
          aria-label={open ? 'Cerrar menú' : 'Abrir menú'}
          aria-expanded={open}
        >
          {open ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Contenido colapsable en mobile */}
      <div className={`flex flex-col flex-1 ${open ? '' : 'max-md:hidden'}`}>

      {/* Volver al sitio — dentro del menú en mobile */}
      <Link
        href="/"
        onClick={() => setOpen(false)}
        className="hidden max-md:flex items-center gap-1.5 px-7 py-3 border-b border-[#2a2a2a] font-mono text-[9px] tracking-[0.15em] uppercase text-paper/40 hover:text-paper transition-colors"
      >
        ← Volver al sitio
      </Link>

      {/* Nav */}
      <nav className="flex-1 px-4 py-6 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {CLIENT_LINKS.map(({ href, label }) => (
            <li key={href}>
              <Link
                href={href}
                onClick={() => setOpen(false)}
                className={[
                  'flex items-center justify-between px-3 py-2 font-mono text-[11px] tracking-[0.12em] uppercase transition-colors',
                  isActive(href)
                    ? 'text-paper bg-[#2a2a2a]'
                    : 'text-paper/60 hover:text-paper',
                ].join(' ')}
              >
                <span>{isActive(href) ? '── ' : ''}{label}</span>
                {href === '/portal/pedidos' && notifCount && notifCount > 0 ? (
                  <span className="bg-red text-paper font-mono text-[8px] w-4 h-4 rounded-full flex items-center justify-center shrink-0">
                    {notifCount > 9 ? '9+' : notifCount}
                  </span>
                ) : null}
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
                    onClick={() => setOpen(false)}
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

      {/* WhatsApp consulta general — solo para no-admins */}
      {!isAdmin && (
        <div className="px-4 mt-4 mb-2">
          <a
            href="https://wa.me/5491135736956?text=Hola%20Hardy%2C%20tengo%20una%20consulta%20sobre%20mi%20cuenta"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 font-mono text-[10px] tracking-[0.12em] uppercase text-[#25D366] border border-[#25D366]/30 hover:bg-[#25D366]/10 transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="#25D366">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            Consultanos
          </a>
        </div>
      )}

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

      </div>{/* fin contenido colapsable */}
    </aside>
  )
}
