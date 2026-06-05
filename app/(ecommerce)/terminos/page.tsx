import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos y Condiciones · Hardy',
  description: 'Términos y condiciones de compra y uso del sitio Hardy.',
}

const sections = [
  {
    title: 'Alcance',
    content:
      'Al comprar en este sitio o acceder al portal mayorista aceptás estos términos y condiciones. Son aplicables tanto a compras B2C realizadas a través de la tienda online como al acceso y operación del portal mayorista.',
  },
  {
    title: 'Productos',
    content:
      'Las imágenes de los productos son referenciales y pueden diferir levemente del producto final. Nos reservamos el derecho de modificar precios, presentaciones y disponibilidad sin previo aviso. Todos los precios publicados en la tienda incluyen IVA, salvo que se indique lo contrario.',
  },
  {
    title: 'Proceso de compra',
    content:
      'Un pedido se considera confirmado una vez que recibimos el pago correspondiente y emitimos la confirmación por correo electrónico. Para compras mayoristas realizadas a través del portal, la confirmación es manual y será comunicada por nuestro equipo.',
  },
  {
    title: 'Envíos',
    content:
      'Despachamos a todo el país a través de Andreani y OCA. Los tiempos de entrega son estimativos y pueden verse afectados por la operatoria del courier. Hardy Argentina no se responsabiliza por demoras, extravíos o daños ocurridos durante el transporte una vez entregado el paquete al servicio de logística.',
  },
  {
    title: 'Devoluciones',
    content:
      'Aceptamos devoluciones dentro de los 10 días corridos de recibido el producto, siempre que esté sin abrir y en sus condiciones originales de empaque. En caso de producto defectuoso o error en el despacho, la reposición o el reembolso es sin cargo. Para iniciar una devolución escribinos a hola@hardy.ar.',
  },
  {
    title: 'Pagos',
    content:
      'Los pagos en la tienda online son procesados íntegramente por MercadoPago. Hardy Argentina no almacena ni tiene acceso a los datos de tus tarjetas u otros medios de pago. Para el portal mayorista se pueden acordar otras modalidades de pago con el equipo comercial.',
  },
  {
    title: 'Propiedad intelectual',
    content:
      'Todo el contenido de este sitio — incluyendo textos, imágenes, fotografías, logotipos y la marca HARDY — es propiedad exclusiva de Hardy Argentina. Queda prohibida su reproducción, distribución o uso comercial sin autorización escrita previa.',
  },
  {
    title: 'Jurisdicción',
    content:
      'Estos términos y condiciones se rigen por las leyes de la República Argentina. Ante cualquier conflicto o controversia, las partes se someten a la jurisdicción de los tribunales ordinarios de la Ciudad Autónoma de Buenos Aires.',
  },
  {
    title: 'Contacto',
    content:
      'Para consultas sobre estos términos podés escribirnos a hola@hardy.ar. Respondemos dentro de las 48 horas hábiles.',
  },
]

export default function TerminosPage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-ink text-paper px-10 max-md:px-5 pt-24 pb-20 max-md:pt-16 max-md:pb-12">
        <div className="max-w-[720px] mx-auto">
          <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-5">
            ── Legal
          </p>
          <h1 className="font-heading text-[clamp(36px,5vw,56px)] font-medium leading-[1.1] tracking-[-0.02em] mb-5">
            Términos y Condiciones
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
