import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { db } from '@/lib/db'
import { profiles } from '@/drizzle/schema'
import { and, eq, desc } from 'drizzle-orm'
import { ROLE_LABELS } from '@/lib/roles'
import { assignVendedor } from '@/lib/actions/admin'

export default async function AdminClientesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const adminProfile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (adminProfile?.role !== 'admin') redirect('/portal')

  const allProfiles = await db.query.profiles.findMany({
    where:   and(eq(profiles.isDeleted, false), eq(profiles.isActive, true)),
    orderBy: [desc(profiles.createdAt)],
  })

  // Exclude admin accounts from client list
  const clients = allProfiles.filter((p) => p.role !== 'admin')

  return (
    <div className="max-w-[1000px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">── Admin</p>
      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-8">
        Clientes ({clients.length})
      </h1>

      {clients.length === 0 ? (
        <div className="bg-paper border border-ink/8 p-10 text-center">
          <p className="font-body text-[14px] text-ink/40">No hay clientes registrados todavía.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {clients.map((client) => (
            <div key={client.id} className="bg-paper border border-ink/8">
              {/* Client info */}
              <div className="px-6 py-5 border-b border-ink/8 flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-body font-semibold text-[15px] text-ink">
                      {client.company ?? client.displayName ?? '—'}
                    </span>
                    <span className="font-mono text-[8px] tracking-[0.15em] uppercase text-red bg-[#fdecea] px-2 py-[3px]">
                      {ROLE_LABELS[client.role]}
                    </span>
                  </div>
                  <div className="flex gap-4 flex-wrap">
                    {client.city && (
                      <span className="font-mono text-[10px] tracking-[0.08em] text-ink/40">
                        {client.city}{client.province ? `, ${client.province}` : ''}
                      </span>
                    )}
                    {client.phone && (
                      <a
                        href={`https://wa.me/${client.phone.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="font-mono text-[10px] tracking-[0.08em] text-red"
                      >
                        {client.phone}
                      </a>
                    )}
                    {client.cuit && (
                      <span className="font-mono text-[10px] tracking-[0.08em] text-ink/40">
                        CUIT: {client.cuit}
                      </span>
                    )}
                  </div>
                </div>
                <span className="font-mono text-[9px] tracking-[0.1em] text-ink/30 uppercase">
                  Desde {new Date(client.createdAt).toLocaleDateString('es-AR', { month: 'short', year: 'numeric' })}
                </span>
              </div>

              {/* Vendedor assignment */}
              <div className="px-6 py-4">
                <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-3">
                  Vendedor asignado
                </p>
                <form
                  action={async (formData: FormData) => {
                    'use server'
                    const nombre   = (formData.get('vendedorNombre')   as string)?.trim()
                    const whatsapp = (formData.get('vendedorWhatsapp') as string)?.trim()
                    await assignVendedor(client.id, nombre, whatsapp)
                  }}
                  className="flex items-end gap-3 flex-wrap"
                >
                  <div>
                    <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 block mb-1">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="vendedorNombre"
                      defaultValue={client.vendedorNombre ?? ''}
                      placeholder="Ej: Martín García"
                      className="bg-paper-2 border border-ink/15 font-body text-[13px] px-3 py-2 outline-none focus:border-ink transition-colors w-[200px]"
                    />
                  </div>
                  <div>
                    <label className="font-mono text-[9px] tracking-[0.1em] uppercase text-ink/40 block mb-1">
                      WhatsApp
                    </label>
                    <input
                      type="text"
                      name="vendedorWhatsapp"
                      defaultValue={client.vendedorWhatsapp ?? ''}
                      placeholder="5491112345678"
                      className="bg-paper-2 border border-ink/15 font-body text-[13px] px-3 py-2 outline-none focus:border-ink transition-colors w-[180px]"
                    />
                  </div>
                  <button
                    type="submit"
                    className="bg-ink text-paper font-mono text-[10px] tracking-[0.12em] uppercase px-4 py-[9px] hover:bg-ink/80 transition-colors"
                  >
                    Asignar →
                  </button>
                  {client.vendedorNombre && (
                    <span className="font-mono text-[9px] tracking-[0.1em] text-[#2d6a35] uppercase">
                      ✓ {client.vendedorNombre}
                    </span>
                  )}
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
