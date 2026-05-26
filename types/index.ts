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
}

export interface Receta {
  slug: string
  titulo: string
  descripcion: string
  tiempo: string
  porciones: string
  dificultad: 'Fácil' | 'Medio' | 'Difícil'
  categoria: 'Desayuno' | 'Fit' | 'Snacks'
  imagen: string
  productos: string[]
  ingredientes: string[]
  preparacion: string[]
  macros?: { kcal: number; proteinas: number; carbos: number; grasas: number }
}

export interface CartItem extends Product {
  qty: number
  subtotal: number
}

export type CartState = Record<string, number>
