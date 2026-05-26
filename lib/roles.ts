import type { UserRole } from '@/drizzle/schema'

export const ROLE_LABELS: Record<UserRole, string> = {
  consumer:     'Consumidor',
  mayorista:    'Mayorista',
  gastronomico: 'Gastronómico',
  distribuidor: 'Distribuidor',
  productor:    'Productor',
}

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  consumer:     'Compra directa',
  mayorista:    'Revendedor · desde 3 cajas',
  gastronomico: 'Cocinas y cafés · baldes 4.5kg',
  distribuidor: 'Red regional · 30–100+ cajas',
  productor:    'Industria · baldes 23kg',
}
