import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad · Hardy',
  description: 'Cómo Hardy recopila, usa y protege tus datos personales.',
}

const sections = [
  {
    title: '¿Quiénes somos?',
    content:
      'Hardy es una marca argentina de crema de maní y miel 100% naturales. El responsable del tratamiento de tus datos personales es Hardy Argentina. Para cualquier consulta podés escribirnos a hola@hardy.ar.',
  },
  {
    title: '¿Qué datos recopilamos?',
    content:
      'Recopilamos los datos que nos proporcionás al comprar o solicitar acceso al portal mayorista: nombre completo, dirección de correo electrónico y número de teléfono. También recopilamos tu dirección de envío cuando realizás una compra, y guardamos el historial de tus pedidos para poder brindarte un mejor servicio.',
  },
  {
    title: '¿Para qué los usamos?',
    content:
      'Usamos tus datos para procesar tus pedidos y coordinar los envíos, comunicarnos con vos sobre el estado de tu compra, y mejorar nuestros productos y servicios. No vendemos, cedemos ni compartimos tus datos personales con terceros con fines comerciales.',
  },
  {
    title: '¿Cómo protegemos tus datos?',
    content:
      'Almacenamos tu información en servidores seguros provistos por Supabase y Vercel, con encriptación en tránsito y en reposo. Los pagos son procesados íntegramente por MercadoPago — Hardy Argentina no almacena ni tiene acceso a tus datos de tarjeta de crédito o débito.',
  },
  {
    title: 'Tus derechos (Ley 25.326)',
    content:
      'De acuerdo con la Ley 25.326 de Protección de Datos Personales de la República Argentina, tenés derecho a acceder a tus datos personales, rectificarlos o solicitar su eliminación. Para ejercer estos derechos escribinos a hola@hardy.ar con el asunto "Datos personales".',
  },
  {
    title: 'Cookies',
    content:
      'Usamos únicamente cookies técnicas necesarias para el correcto funcionamiento del sitio (sesión, autenticación). No utilizamos cookies de rastreo de terceros ni plataformas de publicidad comportamental.',
  },
  {
    title: 'Contacto',
    content:
      'Para consultas sobre privacidad y tratamiento de datos podés escribirnos a hola@hardy.ar o contactarnos por WhatsApp. Respondemos dentro de las 48 horas hábiles.',
  },
]

export default function PrivacidadPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-ink text-paper px-10 max-md:px-5 pt-24 pb-20 max-md:pt-16 max-md:pb-12">
        <div className="max-w-[720px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-5">
            ── Legal
          </p>
          <h1 className="font-heading text-[clamp(36px,5vw,56px)] font-medium leading-[1.1] tracking-[-0.02em] mb-5">
            Política de Privacidad
          </h1>
          <p className="font-body text-[15px] text-paper/60 leading-[1.7]">
            Última actualización: mayo de 2026
          </p>
        </div>
      </section>

      {/* Content */}
      <section className="bg-paper px-10 max-md:px-5 py-20 max-md:py-12">
        <div className="max-w-[720px] mx-auto">
          {sections.map((section, i) => (
            <div key={section.title}>
              {i > 0 && <div className="border-t border-ink/8 my-10" />}
              <p className="font-mono text-[10px] tracking-[0.25em] uppercase text-red mb-3">
                {section.title}
              </p>
              <p className="font-body text-[14px] leading-[1.8] text-ink/70">
                {section.content}
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
