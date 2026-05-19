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
}

export interface CartItem extends Product {
  qty: number
  subtotal: number
}

export type CartState = Record<string, number>
