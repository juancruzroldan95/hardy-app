// Categorías de costos — módulo neutro (sin 'use client') para que pueda
// importarse tanto desde server components como desde client components.

export const COST_CATEGORIES = [
  { value: 'materia_prima', label: 'Materia prima' },
  { value: 'produccion',    label: 'Producción'    },
  { value: 'logistica',     label: 'Logística / Envíos' },
  { value: 'packaging',     label: 'Packaging'     },
  { value: 'marketing',     label: 'Marketing'     },
  { value: 'sueldos',       label: 'Sueldos'       },
  { value: 'impuestos',     label: 'Impuestos'     },
  { value: 'servicios',     label: 'Servicios'     },
  { value: 'alquiler',      label: 'Alquiler'      },
  { value: 'otros',         label: 'Otros'         },
] as const
