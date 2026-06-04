import { redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { WA_NUMBER } from '@/consts/products'

interface Material {
  id:       string
  label:    string
  sub:      string
  type:     string
  size:     string
  href:     string | null   // null = solicitar por WA
  isNew?:   boolean
}

const MATERIALS: { section: string; items: Material[] }[] = [
  {
    section: 'Catálogos de precios',
    items: [
      {
        id:    'catalogo-mayorista',
        label: 'Catálogo Mayorista',
        sub:   'Lista de precios por volumen · Canal revendedor',
        type:  'PDF',
        size:  '2 MB',
        href:  '/catalogos/catalogo-mayorista.pdf',
      },
      {
        id:    'catalogo-distribuidor',
        label: 'Catálogo Distribuidor',
        sub:   'Lista de precios · Canal distribución',
        type:  'PDF',
        size:  '16 MB',
        href:  '/catalogos/catalogo-distribuidor.pdf',
      },
      {
        id:    'catalogo-gastronomico',
        label: 'Catálogo Gastronómico',
        sub:   'Baldes y formatos profesionales',
        type:  'PDF',
        size:  '1.7 MB',
        href:  '/catalogos/catalogo-gastronomico.pdf',
      },
    ],
  },
  {
    section: 'Imágenes de producto',
    items: [
      {
        id:    'fotos-frasco-natural',
        label: 'Fotos Frasco Natural 380g',
        sub:   'Fondo blanco · Alta resolución · Uso en e-commerce y góndola',
        type:  'JPG/PNG',
        size:  'Pack',
        href:  null, // solicitar por WA
        isNew: false,
      },
      {
        id:    'fotos-frasco-crunchy',
        label: 'Fotos Frasco Crunchy 380g',
        sub:   'Fondo blanco · Alta resolución',
        type:  'JPG/PNG',
        size:  'Pack',
        href:  null,
      },
      {
        id:    'fotos-miel',
        label: 'Fotos Miel Líquida y Sólida 500g',
        sub:   'Fondo blanco · Alta resolución',
        type:  'JPG/PNG',
        size:  'Pack',
        href:  null,
      },
      {
        id:    'fotos-lifestyle',
        label: 'Fotos Lifestyle',
        sub:   'Uso en RRSS · Estilo editorial · Varios formatos',
        type:  'JPG',
        size:  'Pack',
        href:  null,
      },
    ],
  },
  {
    section: 'Material para redes sociales',
    items: [
      {
        id:    'rrss-feed',
        label: 'Pack de feed para Instagram',
        sub:   'Plantillas editables · Tamaño 1080×1080',
        type:  'PNG/Canva',
        size:  'Pack',
        href:  null,
      },
      {
        id:    'rrss-stories',
        label: 'Pack de stories',
        sub:   'Plantillas editables · 1080×1920',
        type:  'PNG/Canva',
        size:  'Pack',
        href:  null,
      },
    ],
  },
  {
    section: 'Fichas técnicas',
    items: [
      {
        id:    'ficha-natural',
        label: 'Ficha técnica — Crema de Maní Natural',
        sub:   'Información nutricional, ingredientes, shelf life',
        type:  'PDF',
        size:  '250 KB',
        href:  null,
      },
      {
        id:    'ficha-miel',
        label: 'Ficha técnica — Miel Natural',
        sub:   'Información nutricional, origen, análisis',
        type:  'PDF',
        size:  '250 KB',
        href:  null,
      },
    ],
  },
]

const waMsg = encodeURIComponent('Hola Hardy! Soy cliente del portal y necesito materiales de marca. ¿Me pueden enviar el pack?')

export default async function MaterialesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  return (
    <div className="max-w-[860px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-2">── Recursos</p>
      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-1">
        Materiales de marca
      </h1>
      <p className="font-body text-[14px] text-ink/50 mb-8">
        Catálogos, fotos y recursos para usar en tu canal. Los archivos marcados con &ldquo;Solicitar&rdquo; se envían por WhatsApp.
      </p>

      {/* WA banner */}
      <div className="bg-[#25D366]/10 border border-[#25D366]/30 px-5 py-4 mb-8 flex items-center justify-between gap-4 flex-wrap">
        <div>
          <p className="font-mono text-[10px] tracking-[0.1em] uppercase text-ink/60 mb-1">¿Necesitás todo el pack?</p>
          <p className="font-body text-[13px] text-ink/70">
            Escribinos y te mandamos todos los materiales en un link de descarga.
          </p>
        </div>
        <a
          href={`${WA_NUMBER}?text=${waMsg}`}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-[#25D366] text-white font-mono text-[11px] tracking-[0.15em] uppercase px-5 py-3 hover:bg-[#1ebe5b] transition-colors shrink-0"
        >
          Solicitar pack completo →
        </a>
      </div>

      {/* Materials by section */}
      {MATERIALS.map((section) => (
        <div key={section.section} className="mb-8">
          <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-ink/50 mb-3">
            ── {section.section}
          </p>
          <div className="bg-paper border border-ink/8 divide-y divide-ink/8">
            {section.items.map((item) => (
              <div key={item.id} className="flex items-center gap-4 px-5 py-4">
                {/* Icon */}
                <div className="w-10 h-10 bg-paper-2 border border-ink/8 flex items-center justify-center shrink-0">
                  <span className="font-mono text-[8px] tracking-[0.1em] text-ink/40 uppercase">{item.type.split('/')[0]}</span>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-body font-semibold text-[13px]">{item.label}</span>
                    {item.isNew && (
                      <span className="font-mono text-[7px] tracking-[0.15em] uppercase bg-red text-paper px-1.5 py-0.5">
                        Nuevo
                      </span>
                    )}
                  </div>
                  <div className="font-body text-[11px] text-ink/50 mt-[2px]">{item.sub}</div>
                  <div className="font-mono text-[9px] text-ink/30 mt-[2px]">{item.type} · {item.size}</div>
                </div>

                {/* Action */}
                {item.href ? (
                  <a
                    href={item.href}
                    download
                    className="font-mono text-[10px] tracking-[0.12em] uppercase text-paper bg-red px-4 py-2 hover:bg-red/90 transition-colors shrink-0"
                  >
                    Descargar
                  </a>
                ) : (
                  <a
                    href={`${WA_NUMBER}?text=${encodeURIComponent(`Hola Hardy! Soy cliente del portal y necesito: ${item.label}`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink border border-ink/20 px-4 py-2 hover:bg-paper-2 transition-colors shrink-0"
                  >
                    Solicitar →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
