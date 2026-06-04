'use client'

import { useActionState } from 'react'
import { createPortalOrderForClient } from '@/repository/mutations/orders'
import type { CreateOrderState } from '@/repository/mutations/orders'
import NuevoPedidoForm from '@/components/portal/NuevoPedidoForm'
import type { ProductOrden } from '@/components/portal/NuevoPedidoForm'

interface Props {
  clientUserId:  string
  productos:     ProductOrden[]
  minTotalCajas: number
  roleName:      string
}

export default function AdminOrderForm({ clientUserId, productos, minTotalCajas, roleName }: Props) {
  // Bind the clientUserId so it's baked into the action
  const boundAction = createPortalOrderForClient.bind(null, clientUserId)

  return (
    <NuevoPedidoForm
      productos={productos}
      minTotalCajas={minTotalCajas}
      roleName={roleName}
      overrideAction={boundAction}
    />
  )
}
