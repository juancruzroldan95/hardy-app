import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getProducts } from '@/lib/products'
import { getRecetas } from '@/lib/recetas'

const PILLARS = [
  { title: '200+ tiendas', sub: 'En todo el país' },
  { title: 'Un solo ingrediente', sub: 'Maní o miel. Nada más.' },
  { title: 'Distribución nacional', sub: 'Dietéticas, gimnasios, cafés' },
  { title: '100% Natural', sub: 'Sin conservantes. Sin aditivos.' },
]

const FORMATS = [
  {
    label: 'Para tu negocio',
    sublabel: 'Mayoristas y distribuidores',
    desc: 'Sumá Hardy a tu dietética, gimnasio, cafetería o red de distribución. Cajas mayoristas con precio por volumen.',
    cta: 'Hablar con ventas',
    href: 'https://wa.me/5491135736956?text=Hola%2C+quiero+información+sobre+revender+Hardy',
    dark: true,
    image: '/lifestyle/caja-mayoristas.png',
    items: [
      'Dietéticas y tiendas naturales',
      'Gimnasios y centros de salud',
      'Cafeterías y restaurantes',
      'Distribuidores regionales',
    ],
  },
  {
    label: 'Para tu casa',
    sublabel: 'Consumidor final',
    desc: 'Hardy está en más de 200 tiendas de todo el país. Encontralo en tu dietética más cercana o pedilo online.',
    cta: 'Ver productos',
    href: '/tienda',
    dark: false,
    image: null,
    items: [
      'Crema de maní Natural 380g',
      'Crema de maní Crunchy 380g',
      'Miel Líquida 500g',
      'Miel Sólida 500g',
    ],
  },
  {
    label: 'A granel',
    sublabel: 'Uso profesional',
    desc: 'Baldes de 4.5kg y 23kg para gastronomía, repostería y producción. Mejor costo por kilo, consulta directa.',
    cta: 'Consultar volumen',
    href: 'https://wa.me/5491135736956?text=Hola%2C+quiero+información+sobre+Hardy+a+granel',
    dark: false,
    image: null,
    items: [
      'Baldes 4.5kg y 23kg disponibles',
      'Ideal para cocinas y producción',
      'Mejor costo por kg',
      'Crema de maní y miel',
    ],
  },
]

const STATS = [
  { num: '200+', label: 'Puntos de venta' },
  { num: '10', label: 'Años en el mercado' },
  { num: '4', label: 'Variedades' },
  { num: '100%', label: 'Industria argentina' },
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

const PHILOSOPHY = [
  { n: '01', title: 'Un ingrediente, sin excepciones.', desc: 'Maní seleccionado. Miel pura. Nada más.' },
  { n: '02', title: 'Calidad controlada, lote a lote.', desc: 'Trabajamos con estándares claros para cuidar cada producto.' },
  { n: '03', title: 'Calidad sobre tendencia.', desc: 'Si un agregado no mejora el producto, no entra.' },
  { n: '04', title: 'Sin azúcar. Sin aceite. Sin conservantes.', desc: 'Lo que dice la etiqueta es lo que hay adentro.' },
]

export default function HomePage() {
  const products = getProducts()
  const recetas = getRecetas()
  const featuredRecetas = recetas.slice(0, 3)

  return (
    <div className="bg-paper text-ink">

      {/* HERO */}
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
            background: 'linear-gradient(to right, rgba(15,15,15,0.95) 0%, rgba(15,15,15,0.82) 30%, rgba(15,15,15,0.45) 60%, rgba(15,15,15,0) 100%)',
          }}
        />
        <div
          className="absolute right-[-150px] top-[-150px] w-[600px] h-[600px] z-[1] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(192,23,30,0.12) 0%, transparent 65%)' }}
        />
        <div className="relative z-[2] px-16 max-w-[720px] max-md:px-6">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-7">
            ── Presente en 200+ puntos de venta · Argentina
          </p>
          <h1
            className="font-heading font-medium tracking-[-0.02em] m-0 text-paper"
            style={{ fontSize: 'clamp(52px, 8vw, 112px)', lineHeight: 0.92 }}
          >
            Alimentá tu
            <br />
            <em className="not-italic text-red">instinto.</em>
          </h1>
          <p className="mt-8 text-[17px] leading-[1.6] max-w-[480px] text-[#d0d0d0] font-light">
            Crema de maní y miel 100% naturales. Un ingrediente, sin aditivos. Ya en más de 200 tiendas del país.
          </p>
          <div className="mt-9 flex gap-3 flex-wrap">
            <a
              href="#formatos"
              className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[18px] inline-flex items-center gap-[10px]"
            >
              Revendé Hardy <ArrowRight size={13} />
            </a>
            <Link
              href="/tienda"
              className="text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[18px] border border-white/30"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              Ver productos
            </Link>
          </div>
        </div>
      </section>

      {/* PILLARS */}
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

      {/* FORMATOS */}
      <section id="formatos" className="py-20 px-10 bg-paper max-md:px-5">
        <div className="max-w-[1240px] mx-auto">
          <div className="mb-12">
            <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-[14px]">── Elegí tu formato Hardy</p>
            <h2
              className="font-heading font-medium tracking-[-0.02em] m-0"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1 }}
            >
              Un producto para cada <em className="not-italic text-red">escala.</em>
            </h2>
            <p className="mt-4 text-[15px] text-[#555] max-w-[560px] leading-[1.6]">
              Desde el frasco para tu casa hasta la caja mayorista o el balde para producción.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-[2px] max-md:grid-cols-1">
            {FORMATS.map((f) => (
              <div
                key={f.label}
                className={`flex flex-col ${f.dark ? 'bg-ink text-paper' : 'bg-paper-2 text-ink'}`}
              >
                {f.image && (
                  <div className="aspect-[4/3] overflow-hidden">
                    <Image
                      src={f.image}
                      alt={f.label}
                      width={600}
                      height={450}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                <div className="p-10 flex flex-col flex-1">
                  <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-red mb-[10px]">{f.sublabel}</div>
                  <div className="font-heading text-[28px] font-medium mb-3 leading-[1.1]">{f.label}</div>
                  <div className="text-[14px] opacity-70 leading-[1.6] mb-6">{f.desc}</div>
                  <ul className="m-0 p-0 list-none mb-7">
                    {f.items.map((it) => (
                      <li
                        key={it}
                        className={`text-[13px] opacity-80 pb-2 mb-2 flex items-center gap-2 border-b ${f.dark ? 'border-white/10' : 'border-ink/15'}`}
                      >
                        <span className="text-red text-[10px]">✓</span> {it}
                      </li>
                    ))}
                  </ul>
                  <div className="flex-1" />
                  {f.href.startsWith('/') ? (
                    <Link
                      href={f.href}
                      className={`text-center font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[14px] text-paper ${f.dark ? 'bg-red' : 'bg-ink'}`}
                    >
                      {f.cta} →
                    </Link>
                  ) : (
                    <a
                      href={f.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`text-center font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[14px] text-paper ${f.dark ? 'bg-red' : 'bg-ink'}`}
                    >
                      {f.cta} →
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* PRODUCTOS DESTACADOS */}
      <section className="py-20 px-10 bg-paper-2 max-md:px-5">
        <div className="max-w-[1240px] mx-auto">
          <div className="flex justify-between items-end mb-12 flex-wrap gap-4">
            <div>
              <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-[14px]">── Tienda</p>
              <h2
                className="font-heading font-medium tracking-[-0.02em] m-0"
                style={{ fontSize: 'clamp(32px, 4vw, 48px)', lineHeight: 1.1 }}
              >
                Los más <em className="not-italic text-red">elegidos.</em>
              </h2>
            </div>
            <Link
              href="/tienda"
              className="font-mono text-[11px] tracking-[0.15em] uppercase text-ink border-b border-ink pb-[2px]"
            >
              Ver todos →
            </Link>
          </div>

          <div className="grid grid-cols-4 gap-[2px] max-md:grid-cols-2">
            {products.map((p) => (
              <div key={p.id} className="bg-paper overflow-hidden flex flex-col group">
                <div className="aspect-square overflow-hidden bg-ink">
                  <Image
                    src={p.lifestyle}
                    alt={p.name}
                    width={400}
                    height={400}
                    className="w-full h-full object-cover transition-transform duration-[400ms] group-hover:scale-[1.04]"
                  />
                </div>
                <div className="p-5 pb-6 flex flex-col flex-1">
                  <div className="font-mono text-[9px] tracking-[0.2em] text-red uppercase mb-1">
                    {p.variant} · {p.size}
                  </div>
                  <div className="font-heading text-[18px] font-medium leading-[1.2]">{p.name}</div>
                  <div className="flex-1" />
                  <div className="mt-4 pt-[14px] border-t border-ink/15 flex justify-between items-center">
                    <div className="font-heading text-[22px] font-medium">
                      ${p.price.toLocaleString('es-AR')}
                    </div>
                    <Link
                      href="/tienda"
                      className="bg-ink text-paper font-mono text-[10px] tracking-[0.12em] uppercase px-[14px] py-[10px]"
                    >
                      Ver tienda
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* RECETAS */}
      <section className="py-20 px-10 bg-paper max-md:px-5">
        <div className="max-w-[1240px] mx-auto">
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

          <div className="grid grid-cols-3 gap-[2px] max-md:grid-cols-1">
            {featuredRecetas.map((r) => (
              <div key={r.slug} className="bg-paper-2 overflow-hidden flex flex-col group">
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
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="py-20 px-10 bg-paper-2 max-md:px-5">
        <div className="max-w-[1240px] mx-auto">

          <div className="mb-12">
            <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-[14px]">── Quienes eligen Hardy</p>
            <h2
              className="font-heading font-medium tracking-[-0.02em] m-0"
              style={{ fontSize: 'clamp(36px, 5vw, 56px)', lineHeight: 1.1 }}
            >
              La marca que ya tiene
              <br />
              las tiendas de tu <em className="not-italic text-red">barrio.</em>
            </h2>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-[2px] mb-[2px] max-md:grid-cols-2">
            {STATS.map((s) => (
              <div
                key={s.label}
                className="bg-ink px-8 py-8 flex flex-col items-center justify-center text-center"
              >
                <div
                  className="font-heading font-medium text-red leading-none mb-2"
                  style={{ fontSize: 'clamp(40px, 5vw, 64px)' }}
                >
                  {s.num}
                </div>
                <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-paper/60">
                  {s.label}
                </div>
              </div>
            ))}
          </div>

          {/* Testimonials */}
          <div className="grid grid-cols-3 gap-[2px] max-md:grid-cols-1">
            {TESTIMONIALS.map((t) => (
              <div key={t.author} className="bg-paper px-8 py-9 flex flex-col">
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
              </div>
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

      {/* FILOSOFÍA */}
      <section className="bg-ink text-paper py-20 px-10 max-md:px-5">
        <div className="max-w-[1240px] mx-auto grid grid-cols-2 gap-20 items-start max-md:grid-cols-1 max-md:gap-10">
          <div>
            <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-5">── Filosofía · Desde 2015</p>
            <h2
              className="font-heading font-medium leading-[1.1] m-0 mb-5 tracking-[-0.02em]"
              style={{ fontSize: 'clamp(32px, 4vw, 48px)' }}
            >
              Nacimos en un gimnasio.
              <br />
              Hoy estamos en <em className="not-italic text-red">200+ tiendas.</em>
            </h2>
            <p className="text-[15px] leading-[1.8] m-0" style={{ color: 'rgba(250,250,248,0.65)' }}>
              HARDY empezó en Buenos Aires con una idea simple: hacer productos nobles, de pocos ingredientes y sin vueltas. Diez años después llega a dietéticas, cafés, restaurantes y negocios de todo el país. La marca creció. La obsesión por lo simple, no.
            </p>
          </div>
          <div>
            {PHILOSOPHY.map((v) => (
              <div
                key={v.n}
                className="py-5 border-b border-white/10 grid gap-3 items-start"
                style={{ gridTemplateColumns: '40px 1fr' }}
              >
                <span className="font-mono text-[11px] text-red pt-[3px]">{v.n}</span>
                <div>
                  <div className="font-body text-[15px] font-bold mb-1">{v.title}</div>
                  <div className="text-[13px] leading-[1.6]" style={{ color: 'rgba(250,250,248,0.55)' }}>{v.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  )
}
