/**
 * GET /api/admin/export?type=pedidos|clientes
 * Descarga un CSV de pedidos o clientes. Solo accesible para admins.
 */
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/services/supabase/server'
import { db } from '@/db'
import { orders, orderItems, profiles, newsletterSubscribers } from '@/db/schema'
import { and, eq, desc } from 'drizzle-orm'

function escapeCsv(value: string | number | null | undefined): string {
  const s = String(value ?? '')
  if (s.includes(',') || s.includes('"') || s.includes('\n')) {
    return `"${s.replace(/"/g, '""')}"`
  }
  return s
}

function row(cells: (string | number | null | undefined)[]): string {
  return cells.map(escapeCsv).join(',')
}

export async function GET(req: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
  })
  if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const type = req.nextUrl.searchParams.get('type') ?? 'pedidos'
  const now  = new Date().toISOString().slice(0, 10)

  if (type === 'clientes') {
    const allClients = await db.query.profiles.findMany({
      where: eq(profiles.isDeleted, false),
      orderBy: (p, { asc }) => [asc(p.displayName)],
    })

    const headers = ['Nombre', 'Empresa', 'Rol', 'Email (N/A)', 'Teléfono', 'Ciudad', 'Provincia', 'CUIT', 'Notas', 'Activo', 'Creado']
    const lines = [
      headers.join(','),
      ...allClients.map((c) => row([
        c.displayName,
        c.company,
        c.role,
        '—',
        c.phone,
        c.city,
        c.province,
        c.cuit,
        c.notes,
        c.isActive ? 'Sí' : 'No',
        c.createdAt.toLocaleDateString('es-AR'),
      ])),
    ]

    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="hardy-clientes-${now}.csv"`,
      },
    })
  }

  if (type === 'suscriptores') {
    const subs = await db.query.newsletterSubscribers.findMany({
      where:   eq(newsletterSubscribers.isDeleted, false),
      orderBy: [desc(newsletterSubscribers.createdAt)],
    })

    const headers = ['Email', 'Nombre', 'Origen', 'Activo', 'Fecha']
    const lines = [
      headers.join(','),
      ...subs.map((s) => row([
        s.email,
        s.name,
        s.source,
        s.isActive ? 'Sí' : 'No',
        s.createdAt.toLocaleDateString('es-AR'),
      ])),
    ]

    return new NextResponse(lines.join('\n'), {
      headers: {
        'Content-Type':        'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="hardy-suscriptores-${now}.csv"`,
      },
    })
  }

  // type === 'pedidos' (default)
  const allOrders = await db.query.orders.findMany({
    where:   eq(orders.isDeleted, false),
    orderBy: [desc(orders.createdAt)],
    with:    { items: { where: eq(orderItems.isDeleted, false) } },
  })

  const userIds    = [...new Set(allOrders.map((o) => o.userId))]
  const allProfiles = userIds.length > 0
    ? await db.query.profiles.findMany({ where: eq(profiles.isDeleted, false) })
    : []
  const profileMap = new Map(allProfiles.map((p) => [p.userId, p]))

  const headers = ['Fecha', 'N° Pedido', 'Cliente', 'Empresa', 'Rol', 'Estado', 'Pago', 'Envío', 'Tracking', 'Total ARS', 'Productos', 'Notas']
  const lines = [
    headers.join(','),
    ...allOrders.map((o) => {
      const p = profileMap.get(o.userId)
      const productos = o.items.map((i) => `${i.productName} x${i.qty}`).join(' | ')
      return row([
        o.createdAt.toLocaleDateString('es-AR'),
        o.id.slice(-8).toUpperCase(),
        p?.displayName,
        p?.company,
        p?.role,
        o.status,
        o.paymentStatus,
        o.shippingMethod,
        o.trackingNumber,
        Number(o.totalArs).toLocaleString('es-AR'),
        productos,
        o.notes,
      ])
    }),
  ]

  return new NextResponse(lines.join('\n'), {
    headers: {
      'Content-Type':        'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename="hardy-pedidos-${now}.csv"`,
    },
  })
}
