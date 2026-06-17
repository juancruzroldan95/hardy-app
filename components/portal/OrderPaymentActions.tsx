'use client'

import { useActionState, useEffect, useRef, useState, useTransition } from 'react'
import { uploadPaymentProof, createMpPreferenceForExistingOrder } from '@/repository/mutations/paymentProof'
import type { PaymentProofState } from '@/repository/mutations/paymentProof'

interface Props {
  orderId:        string
  paymentMethod:  string | null
  paymentStatus:  string
  paymentProofUrl: string | null  // path in storage (null = no comprobante yet)
  proofSignedUrl?: string         // signed URL generated server-side, if proof exists
}

// ─── MercadoPago pay button ───────────────────────────────────────────────────

function MercadoPagoPayButton({ orderId }: { orderId: string }) {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [, startTransition]   = useTransition()

  function handlePay() {
    setLoading(true)
    setError(null)
    startTransition(async () => {
      const result = await createMpPreferenceForExistingOrder(orderId)
      if ('error' in result) {
        setError(result.error)
        setLoading(false)
      } else {
        window.location.href = result.initPoint
      }
    })
  }

  return (
    <div className="bg-paper border border-ink/8 p-5">
      <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-3">Pago pendiente</p>
      <p className="font-body text-[13px] text-ink/70 mb-4">
        Este pedido aún no fue pagado. Hacé clic para abonar con tarjeta o saldo de Mercado Pago.
      </p>
      {error && (
        <p className="font-mono text-[11px] text-red mb-3">{error}</p>
      )}
      <button
        onClick={handlePay}
        disabled={loading}
        className="font-mono text-[10px] tracking-[0.12em] uppercase bg-red text-paper px-5 py-3 hover:bg-red/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Generando link...' : 'Pagar ahora →'}
      </button>
    </div>
  )
}

// ─── Upload proof form ────────────────────────────────────────────────────────

function UploadProofForm({ orderId, proofSignedUrl }: { orderId: string; proofSignedUrl?: string }) {
  const [state, action, isPending] = useActionState<PaymentProofState, FormData>(uploadPaymentProof, undefined)
  const [fileName, setFileName]    = useState<string | null>(null)
  const inputRef                   = useRef<HTMLInputElement>(null)

  const succeeded = state && 'success' in state

  return (
    <div className="bg-paper border border-ink/8 p-5">
      <p className="font-mono text-[9px] tracking-[0.2em] uppercase text-ink/40 mb-3">Comprobante de pago</p>

      {proofSignedUrl ? (
        <div className="mb-4">
          <div className="flex items-center gap-3 bg-[#f0f7f0] border border-[#c6dfc7] px-4 py-3">
            <span className="text-[18px]">✓</span>
            <div className="flex-1 min-w-0">
              <p className="font-mono text-[11px] text-[#2d6a35]">Comprobante cargado</p>
              <a
                href={proofSignedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-[10px] text-[#2d6a35]/70 underline hover:text-[#2d6a35] truncate block"
              >
                Ver comprobante →
              </a>
            </div>
          </div>
          <p className="font-body text-[12px] text-ink/50 mt-2">
            Podés reemplazarlo subiendo un nuevo archivo.
          </p>
        </div>
      ) : (
        <p className="font-body text-[13px] text-ink/70 mb-4">
          Adjuntá el comprobante de tu transferencia o depósito para que podamos confirmar tu pago.
          Aceptamos imágenes (PNG, JPG) o PDF, hasta 10 MB.
        </p>
      )}

      {succeeded ? (
        <div className="flex items-center gap-3 bg-[#f0f7f0] border border-[#c6dfc7] px-4 py-3">
          <span className="text-[18px]">✓</span>
          <p className="font-mono text-[11px] text-[#2d6a35]">
            Comprobante enviado. Te avisaremos cuando confirmemos el pago.
          </p>
        </div>
      ) : (
        <form action={action} className="flex flex-col gap-3">
          <input type="hidden" name="orderId" value={orderId} />

          <div
            className="border-2 border-dashed border-ink/15 p-5 text-center cursor-pointer hover:border-ink/30 transition-colors"
            onClick={() => inputRef.current?.click()}
          >
            <input
              ref={inputRef}
              type="file"
              name="file"
              accept="image/png,image/jpeg,image/webp,application/pdf"
              className="hidden"
              onChange={(e) => setFileName(e.target.files?.[0]?.name ?? null)}
            />
            {fileName ? (
              <p className="font-mono text-[11px] text-ink">{fileName}</p>
            ) : (
              <>
                <p className="font-mono text-[11px] text-ink/40 mb-1">Tocá para seleccionar archivo</p>
                <p className="font-mono text-[9px] text-ink/25 uppercase tracking-[0.08em]">PNG · JPG · PDF · máx. 10 MB</p>
              </>
            )}
          </div>

          {state && 'error' in state && (
            <p className="font-mono text-[11px] text-red">{state.error}</p>
          )}

          <button
            type="submit"
            disabled={isPending || !fileName}
            className="font-mono text-[10px] tracking-[0.12em] uppercase bg-ink text-paper px-5 py-3 hover:bg-ink/80 transition-colors disabled:opacity-40 disabled:cursor-not-allowed self-start"
          >
            {isPending ? 'Subiendo...' : 'Enviar comprobante →'}
          </button>
        </form>
      )}
    </div>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function OrderPaymentActions({
  orderId,
  paymentMethod,
  paymentStatus,
  paymentProofUrl,
  proofSignedUrl,
}: Props) {
  if (paymentStatus === 'paid') return null

  if (paymentMethod === 'mercadopago') {
    return <MercadoPagoPayButton orderId={orderId} />
  }

  if (paymentMethod === 'transferencia' || paymentMethod === 'deposito_bancario') {
    return (
      <UploadProofForm
        orderId={orderId}
        proofSignedUrl={proofSignedUrl}
      />
    )
  }

  return null
}
