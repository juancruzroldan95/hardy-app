export interface Product {
  id: string
  name: string
  variant: string
  size: string
  line: string
  desc: string
  image: string
  lifestyle: string
  price: number
  images?: string[]
  tagline?: string
  detail?: string
  diferencial?: string
  nutri?: [string, string][]
  nutriLabel?: string
  unitsPerBox?: number   // cajas de 15u (maní), 12u (miel), 1 (baldes)
}

export interface Receta {
  slug: string
  titulo: string
  descripcion: string
  tiempo: string
  porciones: string
  dificultad: 'Fácil' | 'Medio' | 'Difícil'
  categoria: 'Desayuno' | 'Entreno' | 'Snacks'
  imagen: string
  videoUrl?: string
  productos: string[]
  ingredientes: string[]
  preparacion: string[]
  macros?: { kcal: number; proteinas: number; carbos: number; grasas: number }
  /** Nota al pie opcional: puente B2C → granel/B2B */
  notaB2B?: { texto: string; cta: string; href: string }
}

export interface CartItem extends Product {
  qty: number
  subtotal: number
}

export type CartState = Record<string, number>
