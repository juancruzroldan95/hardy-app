'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState } from 'react'
import { ShoppingBag, Menu, X, MessageCircle } from 'lucide-react'
import { WA_NUMBER } from '@/lib/products'

interface NavProps {
  cartCount?: number
  onCartOpen?: () => void
}

const links = [
  { href: '/tienda', label: 'Tienda' },
  { href: '/mayoristas', label: 'Mayoristas' },
  { href: '/a-granel', label: 'A granel' },
  { href: '/recetas', label: 'Recetas' },
]

export default function Nav({ cartCount = 0, onCartOpen }: NavProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const pathname = usePathname()

  return (
    <>
      {/* Announcement bar */}
      <div className="bg-ink text-paper font-mono text-[11px] tracking-[0.2em] text-center py-[9px] px-4 uppercase">
        10 años haciendo Hardy · Crema de maní y miel · Envíos a todo el país
      </div>

      {/* Nav */}
      <nav className="bg-ink text-paper px-10 py-5 flex justify-between items-center border-b border-[#2a2a2a] sticky top-0 z-50 gap-5 max-md:px-5 max-md:py-4">
        {/* Logo */}
        <Link href="/" className="flex-shrink-0">
          <div className="font-display text-[32px] tracking-[0.04em] leading-none text-paper">HARDY</div>
          <div className="font-mono text-[9px] tracking-[0.3em] text-red mt-[3px]">ALIMENTÁ TU INSTINTO</div>
        </Link>

        {/* Desktop links */}
        <div className="flex gap-8 font-mono text-[12px] tracking-[0.12em] uppercase max-md:hidden">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`text-paper no-underline transition-opacity duration-200 pb-[2px] ${
                pathname === l.href
                  ? 'opacity-100 border-b border-red'
                  : 'opacity-75 hover:opacity-100'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-[10px] items-center flex-shrink-0">
          <Link
            href="/portal"
            className="border border-paper/30 text-paper font-mono text-[11px] tracking-[0.12em] uppercase px-5 py-[10px] max-md:hidden hover:border-red hover:text-red transition-colors"
          >
            Portal Cliente
          </Link>
          <a
            href={`${WA_NUMBER}?text=Hola%21%20Quiero%20lista%20de%20precios%20y%20condiciones%20mayoristas.`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-red text-paper font-mono text-[11px] tracking-[0.12em] uppercase px-5 py-[10px] flex items-center gap-2 max-md:hidden"
            aria-label="Contactar por WhatsApp"
          >
            Contactanos <MessageCircle size={14} />
          </a>

          {onCartOpen && (
            <button
              onClick={onCartOpen}
              className="text-paper border border-paper/30 font-mono text-[11px] tracking-[0.1em] uppercase px-[14px] py-[9px] flex items-center gap-[6px]"
            >
              <ShoppingBag size={13} />
              ({cartCount})
            </button>
          )}

          {/* Hamburger */}
          <button
            className="text-paper border border-paper/30 p-2 hidden max-md:block"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menú"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="bg-ink border-b border-[#2a2a2a] px-6 py-6 flex flex-col gap-5 font-mono text-[13px] tracking-[0.12em] uppercase">
          <Link href="/" className="text-paper" onClick={() => setMenuOpen(false)}>Inicio</Link>
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-paper" onClick={() => setMenuOpen(false)}>
              {l.label}
            </Link>
          ))}
          <Link href="/portal" className="text-red border-t border-paper/10 pt-4 mt-1" onClick={() => setMenuOpen(false)}>
            Portal Cliente →
          </Link>
        </div>
      )}
    </>
  )
}
