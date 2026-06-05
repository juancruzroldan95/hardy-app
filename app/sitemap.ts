import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hardy.ar'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticRoutes = [
    '',
    '/tienda',
    '/tienda/resenas',
    '/mayoristas',
    '/mayoristas/distribuidor',
    '/mayoristas/gastronomico',
    '/mayoristas/productor',
    '/a-granel',
    '/recetas',
    '/donde-comprar',
    '/nosotros',
    '/faq',
    '/privacidad',
    '/terminos',
    '/gracias',
  ]

  return staticRoutes.map((route) => ({
    url: `${BASE_URL}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '' ? 'weekly' : 'monthly',
    priority: route === '' ? 1 : route === '/tienda' ? 0.9 : 0.7,
  }))
}
