'use client'

import { createPortalOrderForClient } from '@/repository/mutations/orders'
import NuevoPedidoForm from '@/components/portal/NuevoPedidoForm'
import type { ProductOrden } from '@/components/portal/NuevoPedidoForm'

interface Props {
  clientUserId:  string
  clientPhone?:  string | null
  clientName?:   string | null
  productos:     ProductOrden[]
  minTotalCajas: number
  roleName:      string
}

export default function AdminOrderForm({
  clientUserId,
  clientPhone,
  clientName,
  productos,
  minTotalCajas,
  roleName,
}: Props) {
  const boundAction = createPortalOrderForClient.bind(null, clientUserId)

  return (
    <NuevoPedidoForm
      productos={productos}
      minTotalCajas={minTotalCajas}
      roleName={roleName}
      overrideAction={boundAction}
      clientPhone={clientPhone ?? undefined}
      clientName={clientName ?? undefined}
    />
  )
}
