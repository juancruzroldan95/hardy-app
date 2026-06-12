import type { Metadata } from 'next'
import Link from 'next/link'
import { MessageCircle } from 'lucide-react'
import { WA_NUMBER, ESCALAS } from '@/consts/products'
import SolicitudForm from '@/components/mayoristas/SolicitudForm'
import WhatsAppLink from '@/components/analytics/WhatsAppLink'
import RevealSection from '@/components/ui/RevealSection'
import ContactForm from '@/components/store/ContactForm'

export const metadata: Metadata = {
  title: 'Mayoristas — Hardy',
  description:
    'Cajas mayoristas de crema de maní y miel Hardy para dietéticas, gimnasios, cafeterías y distribuidores. Precios escalonados desde 3 cajas.',
}

const PRODUCTOS = [
  {
    tag: 'Crema de Maní',
    title: 'Natural y Crunchy',
    desc: 'Frascos 380g en cajas de 15u. Alta rotación en dietéticas y gimnasios.',
    sub: '2 variedades · 380g · 15u/caja',
  },
  {
    tag: 'Miel',
    title: 'Líquida y Sólida',
    desc: 'Frascos 500g de miel pura multifloral. Sin azúcar agregada, sin aditivos.',
    sub: '2 variedades · 500g · 12u/caja',
  },
]

const BENEFICIOS = [
  { n: '01', t: 'Precio escalonado', d: 'Más cantidad, mejor precio por unidad.' },
  { n: '02', t: 'Reposición rápida', d: '48-72hs. Coordinamos el envío según tu necesidad.' },
  { n: '03', t: 'Soporte directo', d: 'Un contacto para pedidos y logística.' },
  { n: '04', t: 'Un solo proveedor', d: 'Crema de maní y miel del mismo lugar.' },
  { n: '05', t: 'Marca con recorrido', d: '10 años en el mercado. Un producto que se explica solo: un ingrediente.' },
]

export default function MayoristasPage() {
  return (
    <div className="bg-paper text-ink">

      {/* HERO */}
      <section className="bg-ink text-paper py-20 px-10 max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-5">── Mayoristas y distribuidores</p>
          <h1
            className="font-heading font-medium tracking-[-0.02em] leading-[1.05] m-0 mb-6"
            style={{ fontSize: 'clamp(42px,6vw,72px)' }}
          >
            Sumá Hardy<br /><em className="not-italic text-red">a tu negocio.</em>
          </h1>
          <p className="text-[16px] text-[#bbb] max-w-[560px] leading-[1.7] mb-9">
            Cajas de crema de maní y miel para dietéticas, gimnasios, cafeterías, tiendas y distribuidores.
            Precios escalonados desde 3 cajas.
          </p>
          <div className="flex gap-3 flex-wrap">
            <a
              href="#solicitar"
              className="inline-block bg-red text-paper font-mono text-[11px] tracking-[0.18em] uppercase px-7 py-[14px]"
            >
              Solicitar acceso a Portal Cliente →
            </a>
            <Link
              href="/portal"
              className="inline-block bg-paper/10 border border-white/20 text-paper font-mono text-[11px] tracking-[0.18em] uppercase px-7 py-[14px]"
            >
              Acceder a Portal Cliente →
            </Link>
          </div>
        </div>
      </section>

      {/* QUÉ VENDÉS */}
      <section className="py-16 px-10 bg-paper-2 max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <RevealSection>
            <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-6">── Qué vendés</p>
          </RevealSection>
          <div className="grid grid-cols-2 gap-[2px] max-md:grid-cols-1">
            {PRODUCTOS.map((p, i) => (
              <RevealSection key={i} delay={i * 100}>
                <div className="group bg-paper-2 hover:bg-ink transition-colors border-t-[3px] border-transparent hover:border-red p-8 cursor-default">
                  <p className="font-mono text-[10px] text-red tracking-[0.2em] uppercase mb-[10px]">{p.tag}</p>
                  <h3 className="font-heading text-[26px] font-medium m-0 mb-3 group-hover:text-paper transition-colors">{p.title}</h3>
                  <p className="text-[13px] text-[#555] group-hover:text-[#bbb] leading-[1.6] m-0 mb-4 transition-colors">{p.desc}</p>
                  <p className="font-mono text-[10px] text-[#999] group-hover:text-[#888] tracking-[0.15em] uppercase transition-colors">{p.sub}</p>
                </div>
              </RevealSection>
            ))}
          </div>
        </div>
      </section>

      {/* ESCALAS */}
      <section className="py-16 px-10 bg-paper max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <RevealSection>
            <div className="flex justify-between items-baseline mb-8 flex-wrap gap-3">
              <div>
                <p className="font-mono text-[11px] tracking-[0.25em] uppercase text-red mb-2">── Escalas</p>
                <h2
                  className="font-heading font-medium m-0"
                  style={{ fontSize: 'clamp(24px,4vw,36px)' }}
                >
                  Precios por volumen
                </h2>
              </div>
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#999]">1 caja = 15 unidades</span>
            </div>
          </RevealSection>
          <div className="grid grid-cols-4 gap-[2px] max-md:grid-cols-2">
            {ESCALAS.map((s, i) => (
              <RevealSection key={i} delay={i * 80}>
                <div className="group bg-paper-2 hover:bg-ink transition-colors border-t-[3px] border-transparent hover:border-red px-5 py-7 text-center cursor-default">
                  <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-[#999] group-hover:text-red mb-[10px] transition-colors">Desde</p>
                  <p className="font-heading text-[32px] font-medium leading-none mb-1 group-hover:text-paper transition-colors">{s.big}</p>
                  <p className="font-mono text-[10px] text-[#888] mb-4 group-hover:text-[#bbb] transition-colors">{s.sub}</p>
                  <div className="w-6 h-[2px] bg-ink/30 group-hover:bg-red mx-auto mb-[14px] transition-colors" />
                  <p className="font-heading text-[15px] font-medium group-hover:text-paper transition-colors">{s.name}</p>
                  <p className="text-[11px] text-[#777] mt-1 leading-[1.4] group-hover:text-[#bbb] transition-colors">{s.target}</p>
                </div>
              </RevealSection>
            ))}
          </div>
          <RevealSection delay={120} className="mt-1 px-5 py-4 bg-paper-2 text-[13px] text-[#555] text-center leading-[1.5]">
            <em>Más volumen = mejor precio por unidad. ¿Movés mucho? <strong className="text-ink">Hablemos.</strong></em>
          </RevealSection>
        </div>
      </section>

      {/* RESEÑAS Y CONSULTAS */}
      <section className="py-20 px-10 bg-ink text-paper max-md:px-6">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 gap-16 items-start max-md:grid-cols-1 max-md:gap-8">
          <RevealSection>
            <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">── Tu opinión importa</p>
            <h2
              className="font-heading font-medium m-0 mb-4 leading-[1.1] tracking-[-0.02em] text-paper"
              style={{ fontSize: 'clamp(26px,4vw,40px)' }}
            >
              Dejanos tu reseña <em className="not-italic text-red">o consulta.</em>
            </h2>
            <p className="font-body text-[15px] text-paper/55 leading-[1.7] max-w-[420px]">
              ¿Tenés una pregunta sobre nuestros productos o querés contarnos tu experiencia? Nos llega directo y te respondemos.
            </p>
          </RevealSection>
          <RevealSection delay={80}>
            <ContactForm />
          </RevealSection>
        </div>
      </section>

      {/* DISTRIBUIDORES */}
      <section className="py-16 px-10 bg-paper-2 max-md:px-6">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 gap-10 items-start max-md:grid-cols-1 max-md:gap-6">
          <div>
            <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">── Para distribuidores</p>
            <h2
              className="font-heading font-medium m-0 mb-3 leading-[1.1]"
              style={{ fontSize: 'clamp(24px,4vw,36px)' }}
            >
              Distribuí Hardy en tu zona
            </h2>
            <p className="text-[14px] text-[#555] leading-[1.6] mb-5">
              Si ya tenés una red de distribución, Hardy es el complemento ideal. Dos productos de alta demanda, una sola marca.
            </p>
            <div className="grid grid-cols-2 gap-3">
              {[{ v: '20 cajas', l: 'Volumen entrada' }, { v: '30+ cajas', l: 'Volumen creciente' }].map((t, i) => (
                <div key={i} className="bg-paper px-4 py-[14px]">
                  <p className="font-heading text-[20px] font-medium m-0">{t.v}</p>
                  <p className="font-mono text-[10px] text-[#888] tracking-[0.15em] uppercase mt-1 m-0">{t.l}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-ink text-paper px-10 py-10 text-center">
            <p className="font-heading text-[24px] font-medium mb-3">¿Listo para vender Hardy?</p>
            <p className="text-[13px] text-[#bbb] mb-6 leading-[1.6]">
              Solicitá tu acceso al portal de clientes y realizá tu compra o contactanos por WhatsApp.
            </p>
            <div className="flex gap-3 flex-wrap justify-center">
              <Link
                href="/portal"
                className="inline-block bg-red text-paper font-mono text-[11px] tracking-[0.18em] uppercase px-6 py-[14px]"
              >
                Portal Cliente →
              </Link>
              <WhatsAppLink
                href={`${WA_NUMBER}?text=Hola%20Hardy,%20quiero%20información%20mayorista`}
                className="bg-paper/10 border border-white/20 text-paper font-mono text-[11px] tracking-[0.18em] uppercase px-6 py-[14px] flex items-center gap-2"
                aria-label="WhatsApp"
              >
                Contactanos <MessageCircle size={14} />
              </WhatsAppLink>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFICIOS */}
      <section className="py-16 px-10 bg-paper max-md:px-6">
        <div className="max-w-[1100px] mx-auto">
          <h2
            className="font-heading font-medium m-0 mb-8"
            style={{ fontSize: 'clamp(22px,4vw,30px)' }}
          >
            Beneficios al sumarte:
          </h2>
          <div className="grid grid-cols-3 gap-[2px] max-md:grid-cols-1">
            {BENEFICIOS.map((f, i) => (
              <div
                key={i}
                className="group bg-paper-2 hover:bg-ink transition-colors border-t-[3px] border-transparent hover:border-red p-6 cursor-default"
              >
                <p className="font-mono text-[10px] text-red tracking-[0.2em] mb-[10px]">{f.n}</p>
                <h3 className="font-heading text-[16px] font-medium m-0 mb-2 group-hover:text-paper transition-colors">{f.t}</h3>
                <p className="text-[13px] text-[#555] group-hover:text-[#bbb] leading-[1.5] m-0 transition-colors">{f.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FORMULARIO DE SOLICITUD */}
      <section id="solicitar" className="py-20 px-10 bg-paper-2 max-md:px-5">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 gap-20 items-start max-md:grid-cols-1 max-md:gap-10">

          <div className="sticky top-[100px] max-md:static">
            <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-[14px]">
              ── Solicitar acceso
            </p>
            <h2
              className="font-heading font-medium tracking-[-0.02em] m-0 mb-5"
              style={{ fontSize: 'clamp(28px, 3vw, 42px)', lineHeight: 1.1 }}
            >
              Completá el formulario.
              <br />
              <em className="not-italic text-red">Nos ponemos en contacto.</em>
            </h2>
            <p className="font-body text-[15px] text-ink/60 leading-[1.7] mb-6">
              Revisamos tu información y te contactamos por WhatsApp y email
              con tu usuario y contraseña para acceder al portal. Proceso de
              verificación de 24 a 48 horas.
            </p>
            <div className="space-y-3 mb-8">
              {[
                '✓ Acceso al portal de pedidos',
                '✓ Lista de precios según tu segmento',
                '✓ Coordinación de envíos directo',
                '✓ Soporte por WhatsApp',
              ].map((item) => (
                <p key={item} className="font-mono text-[11px] tracking-[0.1em] text-ink/60">
                  {item}
                </p>
              ))}
            </div>
            <p className="font-mono text-[10px] tracking-[0.1em] text-ink/40 uppercase">
              ¿Preferís escribirnos directo?{' '}
              <WhatsAppLink
                href={`${WA_NUMBER}?text=Hola%20Hardy,%20quiero%20acceso%20al%20portal%20mayorista`}
                className="text-ink inline-flex items-center gap-1 align-middle border-b border-ink"
                aria-label="WhatsApp"
              >
                Contactanos <MessageCircle size={12} className="inline" />
              </WhatsAppLink>
            </p>
          </div>

          <div className="bg-paper border border-ink/8 p-8 max-md:p-5">
            <SolicitudForm />
          </div>

        </div>
      </section>

    </div>
  )
}
