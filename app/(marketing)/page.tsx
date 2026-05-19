import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { getProducts } from '@/lib/products'
import { getRecetas } from '@/lib/recetas'

const USES = [
  {
    title: 'Para arrancar el día',
    desc: 'Crema de maní natural sobre tostadas, en yogur, batidos o avena. La forma simple de empezar con energía.',
    image: '/lifestyle/use-desayuno.png',
    tag: 'Desayuno',
    product: 'Natural · 380g',
  },
  {
    title: 'Energía pre/post entreno',
    desc: 'Una cucharada de crunchy con banana, en shakes proteicos o barras caseras. Recuperación con un solo ingrediente.',
    image: '/lifestyle/use-fit.png',
    tag: 'Fit',
    product: 'Crunchy · 380g',
  },
  {
    title: 'Endulzá lo que comas',
    desc: 'Miel pura para tu café, té, repostería, panes o aderezos. Sin azúcar agregada, sabor genuino.',
    image: '/lifestyle/use-miel.png',
    tag: 'Sabor',
    product: 'Miel Líquida · 500g',
  },
]

const PILLARS = [
  { title: '100% Natural', sub: 'Sin conservantes. Sin aditivos.' },
  { title: 'Un solo ingrediente', sub: 'Maní o miel. Nada más.' },
  { title: 'Envíos Andreani', sub: 'A todo el país' },
  { title: 'Mayoristas desde 3 cajas', sub: 'Precio por volumen' },
]

const FORMATS = [
  {
    label: 'Para tu casa',
    sublabel: 'Consumidor final',
    desc: 'Frascos de crema de maní y miel para todos los días. Compra directa con envío Andreani.',
    cta: 'Comprar frascos',
    href: '/tienda',
    dark: true,
    items: ['Crema de maní Natural 380g', 'Crema de maní Crunchy 380g', 'Miel Líquida 500g', 'Miel Sólida 500g'],
  },
  {
    label: 'Para tu negocio',
    sublabel: 'Mayoristas',
    desc: 'Cajas mayoristas para dietéticas, gimnasios, tiendas, cafeterías y distribuidores.',
    cta: 'Consultar por WhatsApp',
    href: 'https://wa.me/5491135736956?text=Hola%20Hardy,%20quiero%20información%20sobre%20mayoristas',
    dark: false,
    items: ['Desde 3 cajas', 'Precio por volumen', 'Mix de crema de maní y miel', 'Reposición según stock disponible'],
  },
  {
    label: 'A granel',
    sublabel: 'A granel',
    desc: 'Formatos de mayor volumen para gastronomía, producción, repostería y uso profesional.',
    cta: 'Consultar por WhatsApp',
    href: 'https://wa.me/5491135736956?text=Hola%20Hardy,%20quiero%20información%20sobre%20productos%20a%20granel',
    dark: false,
    items: ['Crema de maní y miel a granel', 'Ideal para cocinas y producción', 'Mejor costo por kg', 'Consulta directa según volumen'],
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
        {/* Gradient overlay */}
        <div
          className="absolute inset-0 z-[1]"
          style={{
            background: 'linear-gradient(to right, rgba(15,15,15,0.95) 0%, rgba(15,15,15,0.82) 30%, rgba(15,15,15,0.45) 60%, rgba(15,15,15,0) 100%)',
          }}
        />
        {/* Red glow */}
        <div
          className="absolute right-[-150px] top-[-150px] w-[600px] h-[600px] z-[1] pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(192,23,30,0.12) 0%, transparent 65%)' }}
        />
        <div className="relative z-[2] px-16 max-w-[720px] max-md:px-6">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-7">
            ── 100% Natural · Sin aditivos
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
            Crema de maní y miel 100% naturales para tu rutina, tu negocio o tu producción.
            Un ingrediente. Sin aditivos. Envíos a todo el país.
          </p>
          <div className="mt-9 flex gap-3 flex-wrap">
            <Link
              href="/tienda"
              className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[18px] inline-flex items-center gap-[10px]"
            >
              Ver tienda <ArrowRight size={13} />
            </Link>
            <Link
              href="#formatos"
              className="text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[18px] border border-white/30"
              style={{ background: 'rgba(255,255,255,0.08)' }}
            >
              Elegir formato
            </Link>
          </div>
        </div>
      </section>

      {/* PILLARS */}
      <div className="bg-paper border-t border-ink/15 border-b border-ink/15">
        <div
          className="max-w-[1240px] mx-auto grid grid-cols-4 border-l border-ink/15 max-md:grid-cols-2"
        >
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
              Comprá según tu <em className="not-italic text-red">necesidad.</em>
            </h2>
            <p className="mt-4 text-[15px] text-[#555] max-w-[560px] leading-[1.6]">
              Frascos para tu casa, cajas para reventa o formatos a granel para uso profesional.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-[2px] max-md:grid-cols-1">
            {FORMATS.map((f) => (
              <div
                key={f.label}
                className={`p-10 flex flex-col ${f.dark ? 'bg-ink text-paper' : 'bg-paper-2 text-ink'}`}
              >
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
