import type { Product } from '@/types'

export const WA_NUMBER = 'https://wa.me/5491135736956'

export function formatARS(n: number): string {
  return '$' + n.toLocaleString('es-AR')
}

export function getProducts(): Product[] {
  return PRODUCTS
}

export function getProductById(id: string): Product | undefined {
  return PRODUCTS.find((p) => p.id === id)
}

export const PRODUCTS: Product[] = [
  {
    id: 'natural-380',
    name: 'Crema de Maní Natural',
    variant: 'Natural',
    size: '380g',
    line: 'frasco',
    desc: 'Maní tostado y procesado. Nada más.',
    image: '/products/natural-380-front.png',
    lifestyle: '/products/natural-380-open.png',
    price: 5200,
  },
  {
    id: 'crunchy-380',
    name: 'Crema de Maní Crunchy',
    variant: 'Crunchy',
    size: '380g',
    line: 'frasco',
    desc: 'Maní tostado con trozos enteros.',
    image: '/products/crunchy-380-front.png',
    lifestyle: '/products/crunchy-380-open.png',
    price: 5400,
  },
  {
    id: 'miel-liquida-500',
    name: 'Miel Líquida',
    variant: 'Líquida',
    size: '500g',
    line: 'frasco',
    desc: 'Miel pura de abeja, multifloral.',
    image: '/products/miel-liquida-front.png',
    lifestyle: '/products/miel-liquida-open.png',
    price: 4800,
  },
  {
    id: 'miel-solida-500',
    name: 'Miel Sólida',
    variant: 'Sólida',
    size: '500g',
    line: 'frasco',
    desc: 'Miel cristalizada naturalmente.',
    image: '/products/miel-solida-front.png',
    lifestyle: '/products/miel-solida-open.png',
    price: 4800,
  },
]
