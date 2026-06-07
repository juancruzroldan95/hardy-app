import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://hardy.ar'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/portal/admin/',
          '/portal/perfil',
          '/portal/cuenta',
          '/portal/pedidos/',
          '/portal/precios',
          '/portal/materiales',
          '/portal/novedades',
          '/portal/catalogo',
          '/api/',
          '/gracias',
        ],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  }
}
