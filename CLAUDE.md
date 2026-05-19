# Hardy App — Guía para Claude Code

Este proyecto es desarrollado por **dos personas**: un dueño de marca (no programador) que usa Claude Code para agregar features, y un software engineer que revisa y arquitecta. Toda instrucción aquí es para que Claude Code pueda trabajar autónomamente con criterio, sin necesitar supervisión técnica en cada tarea.

---

## CRÍTICO: Framework con breaking changes

**Este es Next.js 16 — distinto al Next.js 14/15 que conocés de tu training data.**

Antes de escribir cualquier código Next.js, leer el archivo relevante en:
```
node_modules/next/dist/docs/
```

### Paths críticos de documentación

```
node_modules/next/dist/docs/01-app/01-getting-started/05-server-and-client-components.md
node_modules/next/dist/docs/01-app/01-getting-started/06-fetching-data.md
node_modules/next/dist/docs/01-app/01-getting-started/07-mutating-data.md
node_modules/next/dist/docs/01-app/01-getting-started/08-caching.md
node_modules/next/dist/docs/01-app/01-getting-started/15-route-handlers.md
node_modules/next/dist/docs/01-app/02-guides/ai-agents.md
```

### Cambios breaking clave vs Next.js 15

| Lo viejo (≤15) | Lo nuevo (16) |
|---------------|---------------|
| `export const dynamic = 'force-dynamic'` | `use cache` directive + `cacheLife()` |
| `export const revalidate = 60` | `cacheLife({ revalidate: 60 })` |
| Webpack como bundler default | Turbopack (más rápido, puede diferir en edge cases) |
| ISR con `revalidate` en fetch | `use cache` en funciones y componentes |
| `next/headers` importado directamente | `connection()` para operaciones request-time |

### También: Tailwind v4 (distinto a v3)

```css
/* v4 — lo que usamos */
@import "tailwindcss";

@theme inline {
  --color-red: #C0171E;
}

/* v3 — NO usar */
@tailwind base;
@tailwind components;
@tailwind utilities;
```

No existe `tailwind.config.js` en v4. Toda la config va en `globals.css` con `@theme inline`.

---

## Proyecto: Hardy

Hardy es una marca argentina de crema de maní y miel 100% naturales. Fundada en 2015, presente en 200+ tiendas. Tagline: "Alimentá tu instinto".

### Segmentos de clientes

| Segmento | Ruta | Descripción |
|----------|------|-------------|
| **Consumidor** | `/tienda` | Frascos 380g–500g, compra individual con Mercado Pago |
| **Mayorista** | `/portal` (futuro) | Revendedores, desde 3 cajas, precio por volumen |
| **Gastronómico** | `/portal` (futuro) | Cocinas/cafés, baldes 4.5kg |
| **Distribuidor** | `/portal` (futuro) | Redes regionales, 30–100+ cajas |
| **Productor** | `/portal` (futuro) | Industria, baldes 23kg |

**Prioridad actual**: Consumidor final (B2C). El portal B2B se implementa en fases posteriores.

### Stack

- **Framework**: Next.js 16 (App Router)
- **Estilos**: Tailwind CSS v4 + CSS variables custom
- **Fuentes**: next/font/google — Anton, Fraunces, JetBrains Mono, Manrope
- **Pagos**: Mercado Pago (Argentina) vía Route Handler
- **Deploy**: Vercel
- **Lenguaje**: TypeScript strict
- **Auth** (futuro): Auth.js (NextAuth v5)
- **DB** (futuro): PostgreSQL + Prisma (Neon o Supabase)

---

## Arquitectura de carpetas

```
hardy-app/
├── app/
│   ├── (marketing)/          # Páginas públicas: home, recetas
│   │   ├── layout.tsx        # Nav + Footer (Server Component)
│   │   ├── page.tsx          # Homepage
│   │   └── recetas/
│   │       ├── page.tsx      # Listado de recetas
│   │       └── [slug]/
│   │           └── page.tsx  # Detalle de receta
│   │
│   ├── (store)/              # Tienda consumer
│   │   ├── layout.tsx        # Nav + Footer + CartProvider + CartDrawer
│   │   └── tienda/
│   │       └── page.tsx      # Catálogo de productos
│   │
│   ├── (portal)/             # FUTURO: Portal B2B
│   │   └── portal/
│   │       ├── layout.tsx    # Sidebar nav, auth guard
│   │       ├── page.tsx      # Dashboard
│   │       ├── pedidos/
│   │       └── perfil/
│   │
│   ├── (auth)/               # FUTURO: Autenticación
│   │   ├── login/page.tsx
│   │   └── registro/page.tsx
│   │
│   ├── api/
│   │   └── mercadopago/
│   │       └── create-preference/
│   │           └── route.ts  # POST — crea preferencia de pago
│   │
│   ├── layout.tsx            # Root layout (fonts, metadata, lang="es-AR")
│   └── globals.css           # Tailwind v4 @theme + Hardy tokens
│
├── components/
│   ├── layout/               # Nav, Footer, CartDrawer
│   ├── store/                # ProductCard, CartItem, CheckoutModal
│   ├── recipes/              # RecipeCard, RecipeFilter
│   ├── portal/               # FUTURO: Sidebar, OrderTable, etc.
│   └── ui/                   # Primitivos: Button, Tag, Badge, etc.
│
├── lib/
│   ├── products.ts           # Datos de productos + tipos TypeScript
│   ├── recetas.ts            # Datos de recetas + tipos TypeScript
│   ├── cart-context.tsx      # CartProvider (Client Component)
│   ├── mercadopago.ts        # SDK wrapper de Mercado Pago
│   ├── auth.ts               # FUTURO: Auth.js config
│   └── db.ts                 # FUTURO: Prisma client
│
├── types/
│   └── index.ts              # Tipos TypeScript globales compartidos
│
├── public/
│   ├── products/             # Imágenes de frascos (front, open, back)
│   └── lifestyle/            # Imágenes lifestyle, hero, recetas
│
├── CLAUDE.md                 # Este archivo
└── DESIGN.md                 # Sistema de diseño de Hardy (leer siempre)
```

### Regla sobre los route groups

Los `(parentheses)` en los nombres de carpeta crean route groups: agrupan páginas bajo un mismo layout sin afectar la URL. `/tienda` existe aunque esté dentro de `(store)/tienda/`.

---

## Convenciones de código

### TypeScript

- `strict: true` siempre
- No usar `any` — si no sabés el tipo, inferirlo o crear una interface
- Los tipos de dominio van en `types/index.ts`
- Los tipos específicos de un módulo pueden vivir en el mismo archivo

### Server vs Client Components

**Por defecto: Server Component** (no requiere ningún marcador).

```tsx
// Server Component — default, no se marca
export default async function ProductPage() {
  const products = await getProducts() // fetch directo, async/await ok
  return <div>...</div>
}

// Client Component — solo cuando se necesita:
// - useState, useEffect, useRef, context
// - event handlers (onClick, onChange, etc.)
// - browser APIs (localStorage, window, etc.)
'use client'
export default function ProductCard({ product }) {
  const [added, setAdded] = useState(false)
  ...
}
```

**Regla práctica**: Si podés hacerlo sin `useState` o event handlers, hacelo Server Component.

### Caching con `use cache` (Next.js 16)

```tsx
// Cachear datos estáticos (productos, recetas)
async function getProducts() {
  'use cache'
  // fetch o acceso a datos aquí
  return products
}

// Con duración específica
import { cacheLife } from 'next/cache'

async function getProducts() {
  'use cache'
  cacheLife({ revalidate: 3600 }) // revalidar cada hora
  return products
}
```

### Server Actions para mutaciones

```tsx
// lib/actions/orders.ts
'use server'

export async function createOrder(formData: FormData) {
  // lógica de servidor
  revalidatePath('/portal/pedidos')
}
```

### Importaciones — NO usar barrel files

```tsx
// MAL — no hacer esto
import { Button, Input, Card } from '@/components/ui'

// BIEN — importar directamente
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
```

### Path aliases

```tsx
@/components/...   → components/
@/lib/...          → lib/
@/types/...        → types/
@/app/...          → app/
```

---

## Design system

**Siempre leer `DESIGN.md` antes de escribir estilos.**

### Tokens Tailwind (resumen rápido)

```
Colores:    bg-red, bg-ink, bg-paper, bg-paper-2
            text-red, text-ink, text-paper, text-paper-2
Fuentes:    font-display (Anton), font-heading (Fraunces),
            font-mono (JetBrains Mono), font-body (Manrope)
Breakpoint: md: aplica a partir de 900px
```

### Patrones de estilo frecuentes

```tsx
// Eyebrow label (sobre headings)
<p className="font-mono text-[11px] tracking-[0.25em] text-red uppercase mb-4">
  ── Categoría
</p>

// Heading principal
<h2 className="font-heading text-[clamp(36px,5vw,56px)] font-medium leading-[1.1] tracking-[-0.02em]">
  Texto <em className="not-italic text-red">énfasis.</em>
</h2>

// Botón CTA primario
<button className="bg-red text-paper font-mono text-[12px] tracking-[0.15em] uppercase px-8 py-[18px]">
  Acción →
</button>

// Tag de producto
<span className="font-mono text-[9px] tracking-[0.2em] text-red uppercase">
  Natural · 380g
</span>
```

---

## Pagos: Mercado Pago

El Route Handler vive en `app/api/mercadopago/create-preference/route.ts`.

```tsx
// Patrón del Route Handler
export async function POST(request: Request) {
  const { items } = await request.json()
  // crear preferencia con el SDK
  // retornar { init_point, sandbox_init_point }
}
```

Variable de entorno requerida: `MERCADOPAGO_ACCESS_TOKEN` (en `.env.local` para dev, Vercel para prod).

Las URLs de retorno deben apuntar al dominio correcto (actualizar cuando se defina el dominio de producción).

---

## Componentes: guía rápida

### `components/layout/Nav.tsx` — `'use client'`
- Props: `cartCount: number`, `onCartOpen: () => void`
- Sticky, fondo INK, logo HARDY (Anton), links, cart badge, hamburger mobile

### `components/layout/Footer.tsx` — Server Component
- Sin props
- Logo, columnas de links, WhatsApp flotante, copyright

### `components/layout/CartDrawer.tsx` — `'use client'`
- Props: usa `useCart()` del context
- Slide-out desde la derecha, overlay, qty controls, checkout button

### `lib/cart-context.tsx` — `'use client'`
- Exporta `CartProvider` y `useCart()`
- Estado: `Record<string, number>` (productId → qty)
- Acciones: `addItem(id)`, `removeItem(id)`, `updateQty(id, delta)`, `clearCart()`

### `lib/products.ts`
- Exporta `PRODUCTS: Product[]` con `use cache`
- Tipo `Product`: `{ id, name, variant, size, line, desc, image, lifestyle, price }`

### `lib/recetas.ts`
- Exporta `RECETAS: Receta[]` y `CATEGORIAS: string[]` con `use cache`
- Tipo `Receta`: `{ slug, titulo, descripcion, tiempo, porciones, dificultad, categoria, imagen, productos, ingredientes, preparacion }`

---

## Skills activos

Este proyecto tiene instalado el skill de Vercel React Best Practices (70+ reglas). Leer cuando se trabaja en performance, data fetching, o optimización de re-renders:

```
.claude/skills/vercel-react-best-practices/AGENTS.md
```

Reglas críticas (CRITICAL impact):
- `async-parallel` — usar `Promise.all()` para fetches independientes
- `bundle-barrel-imports` — no usar barrel files, importar directamente
- `bundle-dynamic-imports` — `next/dynamic` para componentes pesados
- `server-cache-react` — `React.cache()` para deduplicación por request

---

## Portal B2B (futuro — no implementar aún)

Cuando se implemente el portal:

1. Crear `app/(portal)/` con su propio layout (sidebar nav, auth guard via middleware)
2. Configurar `lib/auth.ts` con Auth.js (NextAuth v5)
3. Crear `lib/db.ts` con Prisma client
4. Schema mínimo: `User` (con `type`: consumer/mayorista/gastronomico/distribuidor/productor), `Order`, `OrderItem`, `Product`
5. Precios diferenciados por tipo de usuario en `lib/pricing.ts` (server-side)
6. Emails transaccionales con Resend para confirmaciones

El portal vive en `/portal` — cada tipo de usuario B2B ve el mismo portal pero con datos y precios según su `user.type`.

---

## Comandos útiles

```bash
npm run dev    # Desarrollo con Turbopack (bundler default en Next.js 16)
npm run build  # Build de producción
npm run start  # Servidor de producción local
npm run lint   # ESLint (ya NO corre automático en build en Next.js 16)
```
