# Producto — Hardy App

## La marca

Hardy es una marca argentina de crema de maní y miel 100% naturales. Fundada en 2015, presente en 200+ tiendas. Tagline: "Alimentá tu instinto".

---

## Segmentos de clientes

| Segmento | Ruta | Descripción |
|----------|------|-------------|
| **Consumidor** | `/tienda` | Frascos 380g–500g, compra individual con Mercado Pago |
| **Mayorista** | `/portal` | Revendedores, desde 3 cajas, precio por volumen |
| **Gastronómico** | `/portal` | Cocinas/cafés, baldes 4.5kg |
| **Distribuidor** | `/portal` | Redes regionales, 30–100+ cajas |
| **Productor** | `/portal` | Industria, baldes 23kg |

**Prioridad actual**: Consumidor final (B2C). El portal B2B está implementado en fase MVP.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 16 (App Router) |
| Estilos | Tailwind CSS v4 + CSS variables custom |
| Fuentes | next/font/google — Anton, Fraunces, JetBrains Mono, Manrope |
| Pagos | Mercado Pago (Argentina) vía Route Handler |
| Auth | Supabase Auth |
| DB | PostgreSQL (Supabase) + Drizzle ORM |
| Deploy | Vercel |
| Lenguaje | TypeScript |

---

## Pagos: Mercado Pago

El Route Handler vive en `app/api/mercadopago/create-preference/route.ts`.

```tsx
export async function POST(request: Request) {
  const { items } = await request.json()
  // crear preferencia con el SDK
  // retornar { init_point, sandbox_init_point }
}
```

Variable de entorno requerida: `MERCADOPAGO_ACCESS_TOKEN` (en `.env.local` para dev, Vercel para prod).

Las URLs de retorno deben apuntar al dominio correcto (actualizar cuando se defina el dominio de producción).
