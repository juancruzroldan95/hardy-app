import { redirect } from 'next/navigation'
import { createClient } from '@/services/supabase/server'
import { getProfileByUserId, getDeliveryAddressesByProfileId } from '@/repository/queries/profile'
import { ROLE_LABELS, ROLE_DESCRIPTIONS } from '@/consts/roles'
import ProfileForm from '@/components/portal/ProfileForm'
import DeliveryAddressesSection from '@/components/portal/DeliveryAddressesSection'
import PasswordChangeModal from '@/components/portal/PasswordChangeModal'


export default async function PerfilPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const profile = await getProfileByUserId(user.id)

  if (!profile) redirect('/portal')

  const myAddresses = await getDeliveryAddressesByProfileId(profile.id)

  return (
    <div className="max-w-[640px]">
      <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">
        ── Mi perfil
      </p>
      <h1 className="font-heading text-[clamp(24px,3vw,36px)] font-medium leading-[1.1] tracking-[-0.02em] mb-1">
        Datos de cuenta
      </h1>

      {/* Role badge — read-only, managed by admin */}
      <div className="flex items-center gap-3 mb-8">
        <span className="font-mono text-[9px] tracking-[0.15em] uppercase text-red bg-[#fdecea] px-3 py-[5px]">
          {ROLE_LABELS[profile.role]}
        </span>
        <span className="font-body text-[13px] text-ink/40">
          {ROLE_DESCRIPTIONS[profile.role]}
        </span>
      </div>

      {/* Email — read-only, owned by Supabase auth */}
      <div className="bg-paper border border-ink/8 p-5 mb-8">
        <p className="font-mono text-[9px] tracking-[0.15em] uppercase text-ink/40 mb-1">
          Email
        </p>
        <p className="font-body text-[15px] text-ink">{user.email}</p>
        <p className="font-mono text-[9px] tracking-[0.1em] text-ink/30 mt-1">
          Para cambiar el email, contactá a Hardy.
        </p>
        <div className="mt-4 pt-4 border-t border-ink/8 flex justify-start">
          <PasswordChangeModal />
        </div>
      </div>

      <ProfileForm profile={profile} />

      {/* Delivery addresses */}
      <div className="mt-10">
        <p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-3">── Direcciones de entrega</p>
        <h2 className="font-heading text-[22px] font-medium tracking-[-0.02em] mb-6">
          Mis direcciones
        </h2>
        <DeliveryAddressesSection addresses={myAddresses} />
      </div>
    </div>
  )
}
