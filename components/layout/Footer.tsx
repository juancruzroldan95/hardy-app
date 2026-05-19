import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { WA_NUMBER } from '@/lib/products'

interface FooterLink {
  label: string
  href: string
  external?: boolean
}

const columns: { title: string; links: FooterLink[] }[] = [
  {
    title: 'Tienda',
    links: [
      { label: 'Para tu casa', href: '/tienda' },
      { label: 'Recetas', href: '/recetas' },
    ],
  },
  {
    title: 'Marca',
    links: [
      { label: 'Filosofía', href: '/' },
      { label: 'Productos', href: '/tienda' },
    ],
  },
  {
    title: 'Contacto',
    links: [
      { label: 'Instagram', href: 'https://www.instagram.com/hardy.arg/', external: true },
      { label: 'WhatsApp', href: WA_NUMBER, external: true },
      { label: 'TikTok', href: 'https://www.tiktok.com/@hardy.arg', external: true },
    ],
  },
]

export default function Footer() {
  return (
    <>
      <footer className="bg-[#111] text-paper pt-[60px] pb-8 px-10 max-md:px-5">
        <div className="max-w-[1240px] mx-auto">
          {/* Top grid */}
          <div className="grid grid-cols-[2fr_1fr_1fr_1fr] gap-10 mb-12 max-md:grid-cols-2">
            {/* Brand */}
            <div>
              <div className="font-display text-[36px] tracking-[0.04em] leading-none">HARDY</div>
              <div className="font-mono text-[9px] tracking-[0.3em] text-red mt-1">ALIMENTÁ TU INSTINTO</div>
              <p className="mt-5 text-[#777] text-[13px] leading-[1.6] max-w-[280px]">
                Crema de maní y miel de un solo ingrediente. Hecho en Argentina.
              </p>
            </div>

            {/* Columns */}
            {columns.map((col) => (
              <div key={col.title}>
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-red mb-[18px]">
                  {col.title}
                </div>
                {col.links.map((l) =>
                  l.external ? (
                    <a
                      key={l.label}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-[#888] text-[13px] mb-[10px] hover:text-paper transition-colors"
                    >
                      {l.label}
                    </a>
                  ) : (
                    <Link
                      key={l.label}
                      href={l.href}
                      className="block text-[#888] text-[13px] mb-[10px] hover:text-paper transition-colors"
                    >
                      {l.label}
                    </Link>
                  )
                )}
              </div>
            ))}
          </div>

          {/* Bottom bar */}
          <div className="border-t border-[#222] pt-6 flex justify-between items-center text-[#555] text-[11px] font-mono tracking-[0.1em] flex-wrap gap-3">
            <div>© 2026 HARDY · hardy.ar</div>
            <div>UN INGREDIENTE. HECHO EN ARGENTINA.</div>
          </div>
        </div>
      </footer>

      {/* WhatsApp floating button */}
      <a
        href={`${WA_NUMBER}?text=Hola%20Hardy,%20quiero%20saber%20qué%20formato%20me%20conviene%20comprar`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[90] w-14 h-14 rounded-full bg-[#25D366] flex items-center justify-center shadow-[0_4px_16px_rgba(0,0,0,0.3)]"
        aria-label="Contactar por WhatsApp"
      >
        <MessageCircle size={24} fill="#fff" strokeWidth={0} />
      </a>
    </>
  )
}
