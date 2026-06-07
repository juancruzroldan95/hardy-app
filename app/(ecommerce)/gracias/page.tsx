import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import PurchaseTracker from '@/components/analytics/PurchaseTracker'

export const metadata: Metadata = {
  title: 'Gracias por tu compra · Hardy',
  robots: { index: false },
}

interface Props {
  searchParams: Promise<{
    payment?: string
    collection_status?: string
    value?: string
    payment_id?: string
  }>
}

export default async function GraciasPage({ searchParams }: Props) {
  const { payment, collection_status, value, payment_id } = await searchParams
  const status = payment ?? collection_status ?? 'success'

  const isSuccess  = status === 'success'  || status === 'approved'
  const isPending  = status === 'pending'
  const isFailure  = status === 'failure'  || status === 'rejected'

  return (
    <div className="min-h-screen bg-ink text-paper flex items-center justify-center px-6 py-20">
      {isSuccess && (
        <PurchaseTracker value={Number(value) || 0} dedupeKey={payment_id ?? ''} />
      )}
      <div className="max-w-[560px] w-full text-center">

        {/* Icon */}
        <div className="flex justify-center mb-8">
          {isSuccess && <CheckCircle size={64} color="#22c55e" strokeWidth={1.5} />}
          {isPending  && <Clock      size={64} color="#d97706" strokeWidth={1.5} />}
          {isFailure  && <XCircle    size={64} color="#C0171E" strokeWidth={1.5} />}
        </div>

        {/* Eyebrow */}
        <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">
          {isSuccess && '── Pedido recibido'}
          {isPending  && '── Pago en proceso'}
          {isFailure  && '── Error en el pago'}
        </p>

        {/* Title */}
        <h1 className="font-heading text-[clamp(32px,5vw,52px)] font-medium leading-[1.1] tracking-[-0.02em] mb-5">
          {isSuccess && (
            <><em className="not-italic text-red">¡Gracias</em> por tu compra!</>
          )}
          {isPending  && 'Tu pago está siendo procesado.'}
          {isFailure  && 'Hubo un problema con el pago.'}
        </h1>

        {/* Body */}
        <p className="font-body text-[15px] text-paper/70 leading-[1.7] mb-8 max-w-[460px] mx-auto">
          {isSuccess && 'Recibimos tu pago. En las próximas horas te enviamos la confirmación y los detalles del envío por email.'}
          {isPending  && 'MercadoPago está verificando el pago. Recibirás una confirmación por email en breve.'}
          {isFailure  && 'No pudimos procesar el pago. Podés intentarlo de nuevo o contactarnos por WhatsApp.'}
        </p>

        {/* Important box (only on success) */}
        {isSuccess && (
          <div className="bg-paper/10 border border-paper/15 px-5 py-4 mb-10 text-left">
            <p className="font-body text-[13px] text-paper/60 leading-[1.6]">
              <span className="text-paper/90 font-semibold">Recordá:</span>{' '}
              Guardá el número de transacción de MercadoPago como comprobante.
            </p>
          </div>
        )}

        {/* CTAs */}
        <div className="flex flex-wrap gap-3 justify-center mt-2">
          {(isSuccess || isPending) && (
            <>
              <Link
                href="/tienda"
                className="bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-8 py-[16px] hover:bg-red/90 transition-colors"
              >
                Ver la tienda →
              </Link>
              <Link
                href="/"
                className="border border-paper/30 text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-8 py-[16px] hover:bg-paper/8 transition-colors"
              >
                Volver al inicio
              </Link>
            </>
          )}
          {isFailure && (
            <>
              <Link
                href="/tienda"
                className="bg-red text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-8 py-[16px] hover:bg-red/90 transition-colors"
              >
                Intentar de nuevo →
              </Link>
              <a
                href="https://wa.me/5491135736956"
                target="_blank"
                rel="noopener noreferrer"
                className="border border-paper/30 text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-8 py-[16px] hover:bg-paper/8 transition-colors"
              >
                Contactar por WhatsApp →
              </a>
            </>
          )}
        </div>

      </div>
    </div>
  )
}
