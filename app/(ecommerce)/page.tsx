import Image from 'next/image'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { getRecetas } from '@/lib/recetas'
import { WA_NUMBER } from '@/lib/products'
import RevealSection from '@/components/ui/RevealSection'

// ── Quick pillars bar (no "+500" — that number lives only in stats)
const PILLARS = [
  { title: 'Presencia nacional', sub: 'Dietéticas, gimnasios, cafés' },
  { title: 'Un solo ingrediente', sub: 'Maní o miel. Nada más.' },
  { title: '10 años de marca', sub: 'Desde 2015 en Argentina' },
  { title: '100% Natural', sub: 'Sin conservantes. Sin aditivos.' },
]

// §4.3 — Columnas en orden: Negocio → A granel → Tu casa
// Default: todos en gris (bg-paper-2); hover: negro con botón rojo
const FORMATS = [
  {
    label: 'Para tu negocio',
    sublabel: 'Mayoristas y distribuidores',
    desc: 'Sumá Hardy a tu dietética, gimnasio, cafetería o red de distribución. Cajas mayoristas con precio por volumen.',
    cta: 'ACCEDER AL PORTAL',
    href: '/portal',
    items: [
      'Dietéticas y tiendas naturales',
      'Gimnasios y centros de salud',
      'Cafeterías y restaurantes',
      'Distribuidores regionales',
    ],
  },
  {
    label: 'A granel',
    sublabel: 'Uso profesional / Gastronómico',
    desc: 'Baldes de 4,5 kg, 6 kg, 23 kg y 30 kg para gastronomía, repostería y producción. Mejor costo por kilo.',
    cta: 'CONSULTAR A GRANEL',
    href: '/portal',
    items: [
      'Baldes crema de maní 4,5 kg y 23 kg',
      'Baldes miel líquida 6 kg y 30 kg',
      'Ideal para cocinas y producción',
      'Mejor costo por kg',
    ],
  },
  {
    label: 'Para tu casa',
    sublabel: 'Consumidor final',
    desc: 'Comprá directo online. Enviamos a todo el país. Pagás con Mercado Pago.',
    cta: 'COMPRAR EN LA TIENDA',
    href: '/tienda',
    items: [
      'Crema de maní Natural 380g',
      'Crema de maní Crunchy 380g',
      'Miel Líquida 500g',
      'Miel Sólida 500g',
    ],
  },
]

// §4.4 — Reemplazar "4 VARIEDADES" por "MEJOR PRECIO POR KG EN VOLUMEN"
// "+500" aparece UNA SOLA VEZ en toda la home — aquí
const STATS = [
  { num: '+500',  label: 'Puntos de venta' },
  { num: '10',    label: 'Años en el mercado' },
  { num: 'MEJOR', label: 'Precio por kg en volumen' },
  { num: '100%',  label: 'Industria argentina' },
]

const TESTIMONIALS = [
  {
    quote: 'Lo pedimos porque nuestros clientes ya lo conocían por Instagram. Se vende solo.',
    author: 'Dietética Raíces',
    location: 'Palermo, CABA',
    tipo: 'Revendedor',
  },
  {
    quote: 'Lo incorporamos al desayuno de la carta y no lo sacamos más. El crunchy con tostadas es el más pedido.',
    author: 'Café del Mercado',
    location: 'Belgrano, CABA',
    tipo: 'Gastronómico',
  },
  {
    quote: 'La crema de maní natural es lo que esperaba: maní, punto. Sin nada raro en la etiqueta.',
    author: 'Valentina R.',
    location: 'Buenos Aires',
    tipo: 'Consumidor',
  },
]

// Usos / a quién le sirve — fotos reales con overlay de caso de uso
const USOS = [
  {
    src: '/lifestyle/uso-desayuno-miel.png',
    alt: 'Desayuno con tostadas, banana, miel Hardy y café',
    eyebrow: 'Tu desayuno',
    title: 'Tostadas y frutas',
    desc: 'Tostadas, frutas, café. El clásico que nunca falla.',
  },
  {
    src: '/lifestyle/uso-fit-natural.png',
    alt: 'Mujer atlética agregando crema de maní Hardy a un bowl de proteína',
    eyebrow: 'Tu entrenamiento',
    title: 'Proteína natural',
    desc: 'Pre y post entrenamiento. Energía real.',
  },
  {
    src: '/lifestyle/uso-miel-bowl.png',
    alt: 'Miel Hardy cayendo sobre un bowl de yogurt y granola',
    eyebrow: 'Tu cocina',
    title: 'Bowls y recetas',
    desc: 'Bowls, yogures, recetas. Endulzá natural.',
  },
]

const PHILOSOPHY = [
  { n: '01', title: 'Un ingrediente, sin excepciones.', desc: 'Maní seleccionado. Miel pura. Nada más.' },
  { n: '02', title: 'Calidad controlada, lote a lote.', desc: 'Trabajamos con estándares claros para cuidar cada producto.' },
  { n: '03', title: 'Calidad sobre tendencia.', desc: 'Si un agregado no mejora el producto, no entra.' },
  { n: '04', title: 'Sin azúcar. Sin aceite. Sin conservantes.', desc: 'Lo que dice la etiqueta es lo que hay adentro.' },
]

export default function HomePage() {
  const recetas  = getRecetas()
  const featuredRecetas = recetas.slice(0, 3)

  return (
    <div className="bg-paper text-ink">

      {/* ── 1. HERO (B2B primario) ─────────────────────────────────── */}
      {/* §4.2 — nuevo eyebrow/copy/CTAs, sin "+500" aquí */}
      <section
        className="relative min-h-screen w-full flex items-center overflow-hidden text-paper"
        style={{
          backgroundImage: "url('/lifestyle/hero-duo-v2.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center right',
        }}
      >
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background:
              'linear-gradient(to right, rgba(15,15,15,0.95) 0%, rgba(15,15,15,0.82) 30%, rgba(15,15,15,0.45) 60%, rgba(15,15,15,0) 100%)',
          }}
        />
        <div
          className="absolute right-[-150px] top-[-150px] w-[600px] h-[600px] z-[1] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(192,23,30,0.12) 0%, transparent 65%)' }}
        />
        <div className="relative z-[2] px-16 max-w-[720px] max-md:px-6">
          {/* §4.2 eyebrow — nombra compradores B2B, no incluye "+500" */}
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-7">
            ── ELEGIDA POR DIETÉTICAS, GIMNASIOS Y CAFÉS · ARGENTINA
          </p>
          <h1
            className="font-heading font-medium tracking-[-0.02em] m-0 text-paper"
            style={{ fontSize: 'clamp(52px, 8vw, 112px)', lineHeight: 0.92 }}
          >
            Alimentá tu
            <br />
            <em className="not-italic text-red">instinto.</em>
          </h1>
          {/* §4.2 subhead */}
          <p className="mt-8 text-[17px] leading-[1.6] max-w-[480px] text-[#d0d0d0] font-light">
            Crema de maní y miel 100% naturales. Un solo ingrediente, sin aditivos. Hecha en Argentina.
          </p>
          <div className="mt-9 flex gap-3 flex-wrap">
            {/* §4.2 CTA primario → /portal */}
            <Link
              href="/portal"
              className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[18px] inline-flex items-center gap-[10px]"
            >
              CONSULTAR PRECIO MAYORISTA →
            </Link>
            {/* §4.2 CTA secundario → /tienda */}
            <Link
              href="/tienda"
              className="text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[18px] border border-white/30"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              VER PRODUCTOS →
            </Link>
          </div>
        </div>
      </section>

      {/* ── PILLARS (barra rápida sin "+500") ─────────────────────── */}
      <div className="bg-paper border-t border-ink/15 border-b border-ink/15">
        <div className="max-w-[1240px] mx-auto grid grid-cols-4 border-l border-ink/15 max-md:grid-cols-2">
          {PILLARS.map((p) => (
            <div key={p.title} className="px-8 py-7 border-r border-ink/15 flex gap-[14px] items-center">
              <div className="w-2 h-2 bg-red flex-shrink-0" />
              <div>
                <div className="font-body font-bold text-[14px]">{p.title}</div>
                <div className="text-[12px] text-[#666] mt-[2px]">{p.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── 2. "UN PRODUCTO PARA CADA ESCALA" — SUBE después del hero ── */}
      {/* §4.3 — Columnas reordenadas: Negocio (dark) → A Granel (dark) → Tu Casa (light) */}
      <section id="formatos" className="py-20 px-10 bg-paper max-md:px-5">
        <div className="max-w-[1240px] mx-auto">
          <RevealSection>
            <div className="mb-12">
              <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-[14px]">── Un producto para cada escala</p>
              <h2
                className="font-heading font-medium tracking-[-0.02em] m-0"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1 }}
              >
                Elegí tu <em className="not-italic text-red">formato Hardy.</em>
              </h2>
              <p className="mt-4 text-[15px] text-[#555] max-w-[560px] leading-[1.6]">
                Desde el frasco para tu casa hasta la caja mayorista o el balde para producción.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-3 gap-[2px] max-md:grid-cols-1">
            {FORMATS.map((f, i) => (
              <RevealSection
                key={f.label}
                delay={i * 80}
                className="group flex flex-col transition-colors duration-200 border-t-[3px] border-transparent bg-paper-2 text-ink hover:bg-ink hover:text-paper hover:border-red"
              >
                <div className="p-10 flex flex-col flex-1">
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-red mb-[10px]">{f.sublabel}</div>
                  <div className="font-heading text-[28px] font-medium mb-3 leading-[1.1]">{f.label}</div>
                  <div className="text-[14px] leading-[1.6] mb-6 transition-colors text-[#555] group-hover:text-paper/70">
                    {f.desc}
                  </div>
                  <ul className="m-0 p-0 list-none mb-7">
                    {f.items.map((it) => (
                      <li
                        key={it}
                        className="text-[13px] pb-2 mb-2 flex items-center gap-2 border-b transition-colors text-ink/70 group-hover:text-paper/70 border-ink/15 group-hover:border-white/10"
                      >
                        <span className="text-red text-[10px]">✓</span> {it}
                      </li>
                    ))}
                  </ul>
                  <div className="flex-1" />
                  <Link
                    href={f.href}
                    className="text-center font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[14px] text-paper transition-colors bg-ink group-hover:bg-red"
                  >
                    {f.cta} →
                  </Link>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── 3. PRUEBA SOCIAL — stats + testimonios ──────────────────── */}
      {/* §4.4 — "+500" SOLO AQUÍ en toda la home; "4 VARIEDADES" eliminado */}
      <section className="py-20 px-10 bg-paper-2 max-md:px-5">
        <div className="max-w-[1240px] mx-auto">

          <RevealSection className="mb-12">
            <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-[14px]">── Quienes eligen Hardy</p>
            <h2
              className="font-heading font-medium tracking-[-0.02em] m-0"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1 }}
            >
              La marca que ya tiene
              <br />
              las tiendas de tu <em className="not-italic text-red">barrio.</em>
            </h2>
          </RevealSection>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-[2px] mb-[2px] max-md:grid-cols-2">
            {STATS.map((s, i) => (
              <RevealSection
                key={s.label}
                delay={i * 70}
                className="bg-ink px-8 py-8 flex flex-col items-center justify-center text-center"
              >
                <div
                  className="font-heading font-medium text-red leading-none mb-2"
                  style={{ fontSize: s.num.length > 4 ? 'clamp(24px, 3vw, 36px)' : 'clamp(40px, 5vw, 64px)' }}
                >
                  {s.num}
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-paper/60">
                  {s.label}
                </div>
              </RevealSection>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-3 gap-[2px] max-md:grid-cols-1">
            {TESTIMONIALS.map((t, i) => (
              <RevealSection
                key={t.author}
                delay={i * 80}
                className="bg-paper px-8 py-9 flex flex-col"
              >
                <div className="font-mono text-[9px] tracking-[0.2em] text-red uppercase mb-5">
                  {t.tipo}
                </div>
                <blockquote
                  className="font-heading font-medium m-0 mb-7 flex-1 leading-[1.3]"
                  style={{ fontSize: 'clamp(17px, 2vw, 21px)' }}
                >
                  &ldquo;{t.quote}&rdquo;
                </blockquote>
                <div className="pt-5 border-t border-ink/15">
                  <div className="font-body font-bold text-[13px]">{t.author}</div>
                  <div className="font-mono text-[10px] tracking-[0.1em] text-[#888] uppercase mt-[2px]">
                    {t.location}
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>

          {/* Store types footer */}
          <div className="mt-[2px] bg-ink px-8 py-5 flex flex-wrap items-center gap-x-6 gap-y-2">
            <span className="font-mono text-[10px] tracking-[0.2em] text-red uppercase">Presente en</span>
            {['Dietéticas', 'Gimnasios', 'Cafeterías', 'Restaurantes', 'Distribuidores'].map((tipo, i, arr) => (
              <span key={tipo} className="font-mono text-[11px] tracking-[0.1em] text-paper/70 uppercase">
                {tipo}{i < arr.length - 1 && <span className="text-red mx-3">·</span>}
              </span>
            ))}
          </div>

        </div>
      </section>

      {/* ── 4. LANZAMIENTO CRUNCHY — BAJA debajo de prueba social ──── */}
      {/* §4.5 — sección intacta en contenido y diseño */}
      {/* Imagen como fondo full-bleed con background-blend-mode para mimetizar con bg-ink */}
      <section
        className="relative text-paper overflow-hidden"
        style={{
          backgroundImage: "url('/lifestyle/crunchy-380-open.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'right center',
          backgroundBlendMode: 'multiply',
          backgroundColor: '#1A1A1A',
        }}
      >
        {/* Gradiente: oscuro a la izquierda (texto), abre a la derecha (foto) */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(to right, rgba(26,26,26,1) 0%, rgba(26,26,26,0.97) 40%, rgba(26,26,26,0.55) 70%, rgba(26,26,26,0) 100%)' }}
        />
        <div className="relative z-[1] max-w-[1240px] mx-auto px-16 py-20 max-w-[640px] max-md:px-6 max-md:py-12">
          <div className="absolute top-8 right-8 max-md:top-5 max-md:right-5">
            <span className="bg-red text-paper font-mono text-[10px] tracking-[0.2em] uppercase px-3 py-[6px]">
              Nuevo
            </span>
          </div>
          <RevealSection>
            <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-5">
              ── Lanzamiento · Crema de Maní
            </p>
            <h2
              className="font-heading font-medium leading-[1.05] m-0 mb-5 tracking-[-0.02em]"
              style={{ fontSize: 'clamp(38px, 5vw, 64px)' }}
            >
              Crunchy.
              <br />
              <em className="not-italic text-red">Con textura real.</em>
            </h2>
            <p className="text-[15px] leading-[1.8] mb-8 text-paper/65 max-w-[480px]">
              La misma base 100% natural con trozos enteros de maní que te recuerdan de dónde viene cada cucharada. Sin aditivos. Sin aceite. Sin azúcar. Solo maní — pero que se siente.
            </p>
            <div className="flex gap-[2px] mb-8 flex-wrap">
              {['100% Maní', 'Trozos enteros', 'Sin aditivos', '380g'].map((tag) => (
                <span key={tag} className="bg-paper/8 font-mono text-[9px] tracking-[0.15em] uppercase px-3 py-[6px] text-paper/60">
                  {tag}
                </span>
              ))}
            </div>
            <Link
              href="/tienda"
              className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[16px] self-start inline-block"
            >
              Comprar Crunchy →
            </Link>
          </RevealSection>
        </div>
      </section>

      {/* ── A GRANEL spotlight — todos los formatos ──────────────────── */}
      {/* CTAs → /portal per §2: "CONSULTAR PRECIO en baldes → el CTA lleva al portal" */}
      <section className="py-20 px-10 bg-paper-2 max-md:px-5">
        <div className="max-w-[1240px] mx-auto">
          <RevealSection>
            <div className="flex justify-between items-end mb-10 flex-wrap gap-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-[14px]">── A Granel · Uso profesional</p>
                <h2
                  className="font-heading font-medium tracking-[-0.02em] m-0"
                  style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.1 }}
                >
                  Volumen para <em className="not-italic text-red">profesionales.</em>
                </h2>
                <p className="mt-3 text-[15px] text-[#555] max-w-[520px] leading-[1.6]">
                  Baldes de crema de maní y miel para gastronomía, repostería y producción. El mismo producto — mejor precio por kilo.
                </p>
              </div>
              <Link
                href="/a-granel"
                className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink border-b border-ink pb-[2px] whitespace-nowrap"
              >
                Ver todos los formatos →
              </Link>
            </div>
          </RevealSection>

          {/* Layout: imagen genérica izquierda + listado de todos los formatos derecha */}
          {/* NOTA: guardar la foto de los baldes en /public/lifestyle/baldes-duo.png */}
          <RevealSection className="grid grid-cols-2 gap-[2px] max-md:grid-cols-1">
            {/* Imagen — background-blend-mode:multiply para mimetizar con bg-paper-2 */}
            <div
              style={{
                minHeight: '420px',
                backgroundImage: "url('/products/balde-23-front.png')",
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
                backgroundBlendMode: 'multiply',
                backgroundColor: '#F1EFE9',
              }}
            />

            {/* Todos los formatos */}
            <div className="bg-paper px-10 py-10 flex flex-col justify-between max-md:px-6 max-md:py-8">
              <div>
                <p className="font-mono text-[10px] tracking-[0.2em] text-red uppercase mb-6">── Todos los formatos disponibles</p>

                {/* Crema de Maní */}
                <div className="mb-7">
                  <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#888] mb-3">Crema de Maní</p>
                  <div className="flex flex-col gap-[2px]">
                    {[
                      { size: '4,5 kg', uso: 'Cafeterías · Cocinas profesionales' },
                      { size: '23 kg',  uso: 'Producción · Distribución · Industria' },
                    ].map((f) => (
                      <div key={f.size} className="flex items-center justify-between bg-paper-2 px-5 py-4">
                        <span className="font-heading text-[22px] font-medium">{f.size}</span>
                        <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[#888] text-right">{f.uso}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Miel */}
                <div className="mb-8">
                  <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#888] mb-3">Miel Líquida</p>
                  <div className="flex flex-col gap-[2px]">
                    {[
                      { size: '6 kg',   uso: 'Cafeterías · Repostería · Restaurantes' },
                      { size: '30 kg',  uso: 'Producción · Panadería · Industria' },
                    ].map((f) => (
                      <div key={f.size} className="flex items-center justify-between bg-paper-2 px-5 py-4">
                        <span className="font-heading text-[22px] font-medium">{f.size}</span>
                        <span className="font-mono text-[9px] tracking-[0.12em] uppercase text-[#888] text-right">{f.uso}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 flex-wrap items-center">
                <Link
                  href="/portal"
                  className="bg-ink text-paper font-mono text-[11px] tracking-[0.18em] uppercase px-7 py-[14px] inline-block hover:bg-red transition-colors"
                >
                  Portal Cliente →
                </Link>
                <a
                  href={`${WA_NUMBER}?text=Hola%20Hardy,%20quiero%20consultar%20por%20volumen%20a%20granel`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-ink text-paper font-mono text-[11px] tracking-[0.18em] uppercase px-7 py-[14px] flex items-center gap-2 hover:bg-red transition-colors"
                  aria-label="Consultar por WhatsApp"
                >
                  Contactanos <MessageCircle size={14} />
                </a>
              </div>
            </div>
          </RevealSection>
        </div>
      </section>

      {/* ── 5. RECETAS — BAJA debajo de Crunchy ─────────────────────── */}
      {/* §4.5 — sección intacta en contenido y diseño */}
      <section className="py-20 px-10 bg-paper max-md:px-5">
        <div className="max-w-[1240px] mx-auto">
          <RevealSection>
            <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
              <div>
                <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-[14px]">── Recetas</p>
                <h2
                  className="font-heading font-medium tracking-[-0.02em] m-0"
                  style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1 }}
                >
                  Recetas con <em className="not-italic text-red">Hardy.</em>
                </h2>
                <p className="mt-[14px] text-[15px] text-[#555] max-w-[520px] leading-[1.6]">
                  Ideas simples para usar crema de maní y miel en desayunos, bowls, snacks y cocina diaria.
                </p>
              </div>
              <Link
                href="/recetas"
                className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink border-b border-ink pb-[2px] whitespace-nowrap"
              >
                Ver todas las recetas →
              </Link>
            </div>
          </RevealSection>

          <div className="grid grid-cols-3 gap-[2px] max-md:grid-cols-1">
            {featuredRecetas.map((r, i) => (
              <RevealSection
                key={r.slug}
                delay={i * 70}
                className="bg-paper-2 overflow-hidden flex flex-col group"
              >
                <div className="relative aspect-[4/3] overflow-hidden">
                  <div className="absolute top-[14px] left-[14px] z-[2] bg-ink text-paper font-mono text-[9px] tracking-[0.15em] uppercase px-[10px] py-1">
                    {r.categoria}
                  </div>
                  {r.videoUrl && (
                    <div className="absolute top-[14px] right-[14px] z-[2] bg-red text-paper font-mono text-[9px] tracking-[0.1em] uppercase px-[10px] py-1">
                      ▶ Video
                    </div>
                  )}
                  <Image
                    src={r.imagen}
                    alt={r.titulo}
                    fill
                    sizes="(max-width: 900px) 100vw, 33vw"
                    className="object-cover transition-transform duration-[400ms] group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-6 pb-7 flex-1 flex flex-col">
                  <div className="font-mono text-[9px] tracking-[0.15em] text-red uppercase mb-2">
                    {r.productos[0]}
                  </div>
                  <h3 className="font-heading text-[18px] font-medium m-0 mb-2 leading-[1.2]">{r.titulo}</h3>
                  <p className="text-[13px] text-[#666] leading-[1.5] m-0 mb-5 flex-1">{r.descripcion}</p>
                  <Link
                    href={`/recetas/${r.slug}`}
                    className="font-mono text-[10px] tracking-[0.15em] uppercase text-ink border-b border-ink pb-[1px] self-start"
                  >
                    Ver receta →
                  </Link>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── USOS — a quién le sirve / para cada momento ─────────────── */}
      <section className="py-20 px-10 bg-paper-2 max-md:px-5">
        <div className="max-w-[1240px] mx-auto">
          <RevealSection>
            <div className="mb-12">
              <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-[14px]">── Un producto, mil usos</p>
              <h2
                className="font-heading font-medium tracking-[-0.02em] m-0"
                style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1 }}
              >
                Hardy va con <em className="not-italic text-red">todo.</em>
              </h2>
              <p className="mt-4 text-[15px] text-[#555] max-w-[560px] leading-[1.6]">
                Del desayuno al post entreno, de la cocina al bowl de media tarde. Un solo ingrediente para cada momento del día.
              </p>
            </div>
          </RevealSection>

          <div className="grid grid-cols-3 gap-[2px] max-md:grid-cols-1">
            {USOS.map((u, i) => (
              <RevealSection key={u.src} delay={i * 80}>
                <div className="relative aspect-[4/5] overflow-hidden group">
                  <Image
                    src={u.src}
                    alt={u.alt}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                    sizes="(max-width: 900px) 100vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 p-6">
                    <p className="font-mono text-[10px] tracking-[0.2em] uppercase text-red mb-1">── {u.eyebrow}</p>
                    <h3 className="font-heading text-[20px] font-medium text-paper mb-1">{u.title}</h3>
                    <p className="font-body text-[12px] text-paper/70 leading-[1.5]">{u.desc}</p>
                  </div>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ── FILOSOFÍA (brand story, retención) ──────────────────────── */}
      {/* "+500" removido de aquí — solo vive en stats §4.4 */}
      <section className="bg-ink text-paper py-20 px-10 max-md:px-5">
        <div className="max-w-[1240px] mx-auto grid grid-cols-2 gap-20 items-start max-md:grid-cols-1 max-md:gap-10">
          <RevealSection>
            <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-5">── Filosofía · Desde 2015</p>
            <h2
              className="font-heading font-medium leading-[1.1] m-0 mb-5 tracking-[-0.02em]"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}
            >
              Nacimos en un gimnasio.
              <br />
              Hoy estamos en <em className="not-italic text-red">todo el país.</em>
            </h2>
            <p className="text-[15px] leading-[1.8] m-0 text-paper/65">
              HARDY empezó en Buenos Aires con una idea simple: hacer productos nobles, de pocos ingredientes y sin vueltas. Diez años después llega a dietéticas, cafés, restaurantes y negocios de todo el país. La marca creció. La obsesión por lo simple, no.
            </p>
          </RevealSection>
          <RevealSection delay={120}>
            {PHILOSOPHY.map((v) => (
              <div
                key={v.n}
                className="py-5 border-b border-white/10 grid gap-3 items-start"
                style={{ gridTemplateColumns: '40px 1fr' }}
              >
                <span className="font-mono text-[11px] text-red pt-[3px]">{v.n}</span>
                <div>
                  <div className="font-body text-[15px] font-bold mb-1">{v.title}</div>
                  <div className="text-[13px] leading-[1.6] text-paper/55">{v.desc}</div>
                </div>
              </div>
            ))}
          </RevealSection>
        </div>
      </section>

      {/* ── 6. BANDA PORTAL — último empujón B2B antes del footer ──── */}
      {/* §4.6 — ambos CTAs → /portal */}
      <section className="bg-red text-paper py-16 px-10 max-md:px-5">
        <RevealSection>
          <div className="max-w-[1240px] mx-auto flex items-center justify-between gap-8 flex-wrap">
            <div>
              <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-paper/60 mb-2">── Portal Hardy</p>
              <h2
                className="font-heading font-medium leading-[1.1] m-0 tracking-[-0.02em]"
                style={{ fontSize: 'clamp(24px, 3vw, 36px)' }}
              >
                ¿Sos cliente mayorista?
                <br />
                Accedé a tu portal.
              </h2>
            </div>
            <div className="flex gap-3 flex-wrap shrink-0">
              <Link
                href="/portal"
                className="bg-paper text-ink font-mono text-[11px] tracking-[0.18em] uppercase px-8 py-[16px] inline-block"
              >
                ACCEDER AL PORTAL →
              </Link>
              <Link
                href="/portal"
                className="border border-paper/40 text-paper font-mono text-[11px] tracking-[0.18em] uppercase px-8 py-[16px] inline-block"
              >
                SOLICITAR ACCESO →
              </Link>
            </div>
          </div>
        </RevealSection>
      </section>

    </div>
  )
}
