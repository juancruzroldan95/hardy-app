import Link from 'next/link'
import { redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { formatARS, WA_NUMBER } from '@/consts/products'
import SolicitudForm from '@/components/mayoristas/SolicitudForm'

// ── §5: Pantalla pública de dos caminos para visitantes sin sesión ──────────
function PortalPublicLanding() {
  return (
    <div className="min-h-screen bg-paper text-ink">

      {/* Header mínimo de marca */}
      <div className="bg-ink text-paper px-10 py-5 flex items-center justify-between max-md:px-5">
        <Link href="/" className="font-display text-[22px] tracking-[0.08em] text-paper">
          HARDY
        </Link>
        <Link
          href="/tienda"
          className="font-mono text-[10px] tracking-[0.2em] uppercase text-paper/50 hover:text-paper transition-colors"
        >
          ← Volver a la tienda
        </Link>
      </div>

      {/* Intro */}
      <section className="py-16 px-10 bg-paper-2 border-b border-ink/10 max-md:px-5">
        <div className="max-w-[1100px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">── Portal Hardy · Clientes</p>
          <h1
            className="font-heading font-medium tracking-[-0.02em] m-0 mb-4"
            style={{ fontSize: 'clamp(32px, 5vw, 56px)', lineHeight: 1.1 }}
          >
            Acceso a tu <em className="not-italic text-red">lista de precios.</em>
          </h1>
          <p className="text-[15px] text-[#555] max-w-[600px] leading-[1.7] m-0">
            El portal es exclusivo para clientes mayoristas, gastronómicos y distribuidores.
            Cada cliente accede únicamente a la lista de precios que le corresponde,
            habilitada tras la validación de su cuenta.
          </p>
        </div>
      </section>

      {/* Dos caminos */}
      <section className="py-16 px-10 max-md:px-5">
        <div className="max-w-[1100px] mx-auto grid grid-cols-2 gap-[2px] max-md:grid-cols-1">

          {/* Camino 1 — Ya soy cliente */}
          <div className="bg-ink text-paper p-12 flex flex-col justify-between gap-10 max-md:p-8">
            <div>
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-red mb-4">── Camino 1</p>
              <h2
                className="font-heading font-medium leading-[1.1] m-0 mb-4 tracking-[-0.02em]"
                style={{ fontSize: 'clamp(26px, 3vw, 38px)' }}
              >
                Ya soy cliente.
                <br />
                <em className="not-italic text-red">Quiero entrar.</em>
              </h2>
              <p className="text-[14px] leading-[1.7]" style={{ color: 'rgba(250,250,248,0.65)' }}>
                Si ya tenés usuario y contraseña, accedé directo al portal para ver tu lista de precios, hacer pedidos y consultar tu cuenta.
              </p>
            </div>
            <Link
              href="/login"
              className="bg-red text-paper font-mono text-[12px] tracking-[0.18em] uppercase px-8 py-[18px] self-start inline-block"
            >
              INGRESAR AL PORTAL →
            </Link>
          </div>

          {/* Camino 2 — Soy nuevo */}
          <div className="bg-paper-2 p-12 flex flex-col gap-6 max-md:p-8">
            <div>
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-red mb-4">── Camino 2</p>
              <h2
                className="font-heading font-medium leading-[1.1] m-0 mb-4 tracking-[-0.02em]"
                style={{ fontSize: 'clamp(26px, 3vw, 38px)' }}
              >
                Soy nuevo.
                <br />
                <em className="not-italic text-red">Quiero acceder.</em>
              </h2>
              <p className="text-[14px] text-[#555] leading-[1.7] mb-2">
                Completá el formulario con los datos de tu negocio.
                Validamos tu cuenta y te habilitamos la lista de precios que te corresponde.
              </p>
              <div className="bg-ink text-paper px-5 py-3 mb-6 inline-block">
                <p className="font-mono text-[10px] tracking-[0.12em] uppercase text-paper/70 m-0">
                  ⏱ Validación: 24 a 48 horas hábiles.
                </p>
              </div>
            </div>

            <SolicitudForm />

            <p className="font-mono text-[10px] tracking-[0.1em] text-ink/40 uppercase">
              ¿Preferís escribirnos directo?{' '}
              <a
                href={`${WA_NUMBER}?text=Hola%20Hardy,%20quiero%20acceso%20al%20portal%20mayorista`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-ink border-b border-ink"
              >
                WhatsApp →
              </a>
            </p>
          </div>

        </div>
      </section>

    </div>
  )
}

export default async function PortalPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) return <PortalPublicLanding />

  redirect('/portal/perfil')
}
