import Link from 'next/link'
import NewClientForm from '@/components/portal/NewClientForm'

interface PageProps {
  searchParams: Promise<{
    success?: string
    displayName?: string
    email?: string
    tempPassword?: string
    linkedExisting?: string
  }>
}

export default async function NuevoClientePage({ searchParams }: PageProps) {
  const params = await searchParams
  const isSuccess = params.success === 'true'

  if (isSuccess) {
    const displayName = params.displayName ?? ''
    const email = params.email ?? ''
    const tempPassword = params.tempPassword
    const isLinkedExisting = params.linkedExisting === 'true'

    return (
      <div className="max-w-[600px]">
        <div className="bg-[#f0f7f0] border border-[#c6dfc7] px-6 py-8 text-center">
          <p className="text-[32px] mb-4 text-[#2d6a35]">✓</p>
          <h2 className="font-heading text-[22px] font-medium mb-2 text-[#2d6a35]">
            Perfil creado exitosamente
          </h2>
          <p className="font-body text-[14px] text-ink/60 mb-6">
            <strong>{displayName}</strong> ya está registrado y tiene su perfil en el portal.
          </p>

          {/* Credenciales Temporales */}
          <div className="bg-paper border border-[#c6dfc7] text-left p-4 mb-6 space-y-2">
            <p className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40">Credenciales del cliente</p>
            <p className="font-body text-[13px] text-ink">
              <strong>Email:</strong> {email}
            </p>
            {tempPassword ? (
              <p className="font-body text-[13px] text-ink">
                <strong>Clave temporal:</strong> <code className="bg-paper-2 px-2 py-1 border border-ink/10 font-mono select-all">{tempPassword}</code>
              </p>
            ) : isLinkedExisting ? (
              <p className="font-body text-[13px] text-ink/60 italic">
                El usuario ya existía en Supabase Auth. Conserva su clave anterior.
              </p>
            ) : null}
          </div>

          <div className="flex gap-3 justify-center">
            <Link
              href="/portal/admin/clientes"
              className="bg-ink text-paper font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[12px] hover:bg-ink/80 transition-colors"
            >
              Ver clientes →
            </Link>
            <Link
              href="/portal/admin/clientes/nuevo"
              className="bg-paper-2 border border-ink/15 font-mono text-[11px] tracking-[0.15em] uppercase px-6 py-[12px] hover:bg-paper transition-colors"
            >
              + Agregar otro
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[700px]">
      <Link
        href="/portal/admin/clientes"
        className="font-mono text-[10px] tracking-[0.12em] uppercase text-ink/40 hover:text-ink transition-colors mb-6 block"
      >
        ← Volver a clientes
      </Link>

      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">── Admin · Nuevo cliente</p>
      <h1 className="font-heading text-[clamp(24px,3vw,34px)] font-medium leading-[1.1] tracking-[-0.02em] mb-2">
        Agregar cliente
      </h1>
      <p className="font-body text-[14px] text-ink/40 mb-8">
        Completá los datos del cliente. Se creará automáticamente su cuenta y su perfil en la base de datos.
      </p>

      <NewClientForm />
    </div>
  )
}
