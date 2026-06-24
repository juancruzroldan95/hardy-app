import { NextResponse } from 'next/server'
import { readFile } from 'fs/promises'
import path from 'path'
import { createClient } from '@/services/supabase/server'
import { db } from '@/db'
import { profiles } from '@/db/schema'
import { and, eq } from 'drizzle-orm'
import type { UserRole } from '@/db/schema'

interface CatalogDef {
  file:         string
  allowedRoles: UserRole[]
}

const CATALOG_MAP: Record<string, CatalogDef> = {
  mayorista: {
    file:         'HARDY_Catalogo_MAYORISTA.pdf',
    allowedRoles: ['admin', 'mayorista'],
  },
  distribuidor: {
    file:         'HARDY_Catalogo_DISTRIBUIDOR.pdf',
    allowedRoles: ['admin', 'distribuidor'],
  },
  gastronomico: {
    file:         'HARDY_Catalogo_GASTRONOMICA.pdf',
    allowedRoles: ['admin', 'gastronomico', 'productor'],
  },
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params
  const catalog = CATALOG_MAP[slug]
  if (!catalog) return new NextResponse('Not found', { status: 404 })

  // Auth
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return new NextResponse('Unauthorized', { status: 401 })

  // Role check
  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false)),
    columns: { role: true },
  })
  const role = (profile?.role ?? 'consumer') as UserRole
  if (!catalog.allowedRoles.includes(role)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // Serve file
  const filePath = path.join(process.cwd(), 'private', 'catalogos', catalog.file)
  try {
    const buffer = await readFile(filePath)
    return new NextResponse(buffer, {
      headers: {
        'Content-Type':        'application/pdf',
        'Content-Disposition': `inline; filename="${catalog.file}"`,
        'Cache-Control':       'private, no-store',
      },
    })
  } catch {
    return new NextResponse('Not found', { status: 404 })
  }
}
