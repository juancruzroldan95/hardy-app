import type { Product } from '@/types'

export interface Escala {
  name: string
  big: string
  sub: string
  target: string
}

export const ESCALAS: Escala[] = [
  { name: 'Entrada', big: '3 cajas', sub: '45 unidades', target: 'Para arrancar' },
  { name: 'Intermedio', big: '5 cajas', sub: '75 unidades', target: 'Tiendas / Gimnasios' },
  { name: 'Frecuente', big: '10 cajas', sub: '150 unidades', target: 'Dietéticas / Almacenes' },
  { name: 'Mayorista full', big: '15 cajas', sub: '225 unidades', target: 'Volumen regular' },
]

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
    images: [
      '/products/natural-380-front.png',
      '/products/natural-380-open.png',
      '/products/natural-380-back.png',
    ],
    tagline: 'Un ingrediente. Cero compromisos.',
    detail:
      '100% maní seleccionado de Córdoba. Sin azúcar agregada, sin aceites vegetales, sin conservantes. Lo que ves en la etiqueta es todo lo que hay adentro.',
    diferencial: '100% maní · Sin aditivos · Sin azúcar',
    unitsPerBox: 15,
    nutriLabel: 'Porción 20g (1 cucharada)',
    nutri: [
      ['Valor energético', '117 kcal / 485 kJ'],
      ['Carbohidratos', '2 g'],
      ['Proteínas', '5,2 g'],
      ['Grasas totales', '9,8 g'],
      ['— Grasas saturadas', '1,3 g'],
      ['— Grasas trans', '0 g'],
      ['Fibra alimentaria', '1,8 g'],
      ['Sodio', '0 mg'],
    ],
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
    price: 5200,
    images: [
      '/products/crunchy-380-front.png',
      '/products/crunchy-380-open.png',
      '/products/crunchy-380-back.png',
    ],
    tagline: 'Para los que saben lo que quieren.',
    detail:
      'La misma base 100% natural con trozos enteros de maní que te recuerdan de dónde viene cada cucharada. Textura que se siente — no se disimula.',
    diferencial: 'Con trozos enteros · Textura real · Sin aditivos',
    unitsPerBox: 15,
    nutriLabel: 'Porción 20g (1 cucharada)',
    nutri: [
      ['Valor energético', '117 kcal / 485 kJ'],
      ['Carbohidratos', '2 g'],
      ['Proteínas', '5,2 g'],
      ['Grasas totales', '9,8 g'],
      ['— Grasas saturadas', '1,3 g'],
      ['— Grasas trans', '0 g'],
      ['Fibra alimentaria', '1,8 g'],
      ['Sodio', '0 mg'],
    ],
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
    price: 6900,
    images: [
      '/products/miel-liquida-front.png',
      '/products/miel-liquida-open.png',
      '/products/miel-liquida-back.png',
    ],
    tagline: 'Miel como tiene que ser.',
    detail:
      'Multifloral, cruda y sin procesar. Del panal directo al frasco, sin calor ni filtros que comprometan sus enzimas naturales, su aroma y sus propiedades.',
    diferencial: 'Sin pasteurizar · Sin procesar · Cruda',
    unitsPerBox: 12,
    nutriLabel: 'Porción 20g (1 cucharada)',
    nutri: [
      ['Valor energético', '61 kcal / 255 kJ'],
      ['Carbohidratos', '16,4 g'],
      ['— Azúcares', '16,0 g'],
      ['Proteínas', '0,1 g'],
      ['Grasas totales', '0 g'],
      ['Fibra alimentaria', '0 g'],
      ['Sodio', '1 mg'],
    ],
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
    price: 6900,
    images: [
      '/products/miel-solida-front.png',
      '/products/miel-solida-open.png',
      '/products/miel-solida-back.png',
    ],
    tagline: 'La cristalización es una señal de calidad.',
    detail:
      'La miel que se vuelve sólida no está en mal estado — está en su estado más puro. Un proceso 100% natural que preserva enzimas, aromas y valor nutritivo intactos.',
    diferencial: 'Multifloral · Cristalización natural · 100% pura',
    unitsPerBox: 12,
    nutriLabel: 'Porción 20g (1 cucharada)',
    nutri: [
      ['Valor energético', '61 kcal / 255 kJ'],
      ['Carbohidratos', '16,4 g'],
      ['— Azúcares', '16,0 g'],
      ['Proteínas', '0,1 g'],
      ['Grasas totales', '0 g'],
      ['Fibra alimentaria', '0 g'],
      ['Sodio', '1 mg'],
    ],
  },
  {
    id: 'balde-45',
    name: 'Balde Crema de Maní',
    variant: 'Natural',
    size: '4,5 kg',
    line: 'balde',
    desc: 'Para cocinas, cafeterías y uso profesional.',
    image: '/products/balde-45-front.png',
    lifestyle: '/products/balde-45-open.png',
    price: 17708,
    images: [
      '/products/balde-45-front.png',
      '/products/balde-45-open.png',
      '/products/balde-45-back.png',
    ],
    tagline: 'Para quienes la consumen en serio.',
    detail:
      'El formato ideal para cocinas profesionales, cafeterías, gimnasios y revendedores que necesitan calidad constante sin pagar precio minorista. Mismo maní 100% natural, en volumen real.',
    diferencial: 'Sin aditivos · Precio mayorista · Ideal para reventa',
    unitsPerBox: 1,
  },
  {
    id: 'balde-23',
    name: 'Balde Crema de Maní',
    variant: 'Natural',
    size: '23 kg',
    line: 'balde',
    desc: 'Formato industrial para producción a escala.',
    image: '/products/balde-23-front.png',
    lifestyle: '/products/balde-23-open.png',
    price: 84750,
    images: [
      '/products/balde-23-front.png',
      '/products/balde-23-open.png',
      '/products/balde-23-back.png',
    ],
    tagline: 'Escala sin compromisos.',
    detail:
      'El formato para productores, distribuidores y fabricantes que necesitan crema de maní premium en volumen real. La misma calidad de siempre, pensada para producción a escala.',
    diferencial: 'Formato industrial · Producción a escala · Sin aditivos',
    unitsPerBox: 1,
  },
  {
    id: 'miel-balde-6',
    name: 'Balde Miel Líquida',
    variant: 'Líquida',
    size: '6 kg',
    line: 'balde',
    desc: 'Para cafeterías, restaurantes y pastelerías.',
    image: '/products/miel-balde-6-front.png',
    lifestyle: '/products/miel-balde-6-open.png',
    price: 40500,
    images: [
      '/products/miel-balde-6-front.png',
      '/products/miel-balde-6-open.png',
    ],
    tagline: 'Miel pura a granel para uso profesional.',
    detail:
      'Miel multifloral sin pasteurizar en formato balde para cocinas, cafeterías y repostería profesional. Sin azúcar agregada, sin procesar.',
    diferencial: 'Sin pasteurizar · Multifloral · Formato profesional',
    unitsPerBox: 1,
  },
  {
    id: 'miel-balde-30',
    name: 'Balde Miel Líquida',
    variant: 'Líquida',
    size: '30 kg',
    line: 'balde',
    desc: 'Formato industrial para producción a escala.',
    image: '/products/miel-balde-30-front.png',
    lifestyle: '/products/miel-balde-30-open.png',
    price: 180000,
    images: [
      '/products/miel-balde-30-front.png',
      '/products/miel-balde-30-open.png',
    ],
    tagline: 'Escala sin compromisos.',
    detail:
      'Miel multifloral para productores, panaderos y fabricantes que necesitan volumen real. La mejor relación costo por kg de toda la línea.',
    diferencial: 'Formato industrial · Sin pasteurizar · Mejor precio/kg',
    unitsPerBox: 1,
  },
]
