export type Tramo = { min: number; max: number | null; precio_unidad: number }

export type Formato = {
  id: string
  etiqueta: string
  kg: number
  img: string
  tramos: Tramo[]
}

export type ProductoGranel = {
  id: string
  nombre: string
  formatos: Formato[]
}

export function getTramo(tramos: Tramo[], qty: number): Tramo | null {
  return tramos.find((t) => qty >= t.min && (t.max === null || qty <= t.max)) ?? null
}

export const GRANEL_PRODUCTOS: ProductoGranel[] = [
  {
    id: 'mani',
    nombre: 'Crema de maní natural',
    formatos: [
      {
        id: 'mani_4_5kg',
        etiqueta: 'Balde 4,5 kg',
        kg: 4.5,
        img: '/products/balde-45-open.png',
        tramos: [
          { min: 1,  max: 4,    precio_unidad: 17708 },
          { min: 5,  max: 9,    precio_unidad: 16823 },
          { min: 10, max: null, precio_unidad: 15937 },
        ],
      },
      {
        id: 'mani_23kg',
        etiqueta: 'Balde 23 kg',
        kg: 23,
        img: '/products/balde-23-open.png',
        tramos: [
          { min: 1,  max: 4,    precio_unidad: 84750 },
          { min: 5,  max: 9,    precio_unidad: 80513 },
          { min: 10, max: null, precio_unidad: 76275 },
        ],
      },
    ],
  },
  {
    id: 'miel',
    nombre: 'Miel líquida multifloral',
    formatos: [
      {
        id: 'miel_6kg',
        etiqueta: 'Balde 6 kg',
        kg: 6,
        img: '/products/miel-balde-6-front.png',
        tramos: [
          { min: 1,  max: 4,    precio_unidad: 40500  },
          { min: 5,  max: 9,    precio_unidad: 38475  },
          { min: 10, max: null, precio_unidad: 36450  },
        ],
      },
      {
        id: 'miel_30kg',
        etiqueta: 'Balde 30 kg',
        kg: 30,
        img: '/products/miel-balde-30-front.png',
        tramos: [
          { min: 1,  max: 4,    precio_unidad: 180000 },
          { min: 5,  max: 9,    precio_unidad: 171000 },
          { min: 10, max: null, precio_unidad: 162000 },
        ],
      },
    ],
  },
]
