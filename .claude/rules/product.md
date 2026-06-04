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

---

## Roles y Lógica de Precios (B2B)

El portal B2B utiliza los roles definidos en `public.profiles.role` para segmentar clientes y aplicarles listas de precios personalizadas a través de la tabla `price_overrides`.

### Matriz de Roles y Capacidades

- **`admin`**: Acceso completo al panel de administración (`/portal/admin/*`). Puede gestionar el CRM de clientes (crear nuevos directamente con clave temporal, editar sus perfiles), modificar estados y tracking de pedidos, gestionar stock, redactar novedades y chatear internamente con clientes en sus pedidos.
- **Roles de Cliente B2B** (`mayorista`, `gastronomico`, `distribuidor`, `productor`, `consumer`): Acceso al panel B2B estándar (`/portal/*`). Pueden ver el catálogo de productos con precios personalizados para su rol, realizar pedidos, editar sus datos de perfil (salvo el email que es inmutable), ver novedades y chatear con administración.

### Aplicación de Precios (`price_overrides`)

Los precios que ve cada cliente autenticado en el catálogo o al realizar pedidos están condicionados por:
1. Su rol (`profiles.role`).
2. Las reglas de la tabla `price_overrides` para ese rol y producto.
3. La cantidad mínima de compra (`minQty`) requerida para calificar al descuento.

