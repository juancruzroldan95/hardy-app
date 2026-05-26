# Arquitectura de código — Hardy App

## Estructura de carpetas

```
hardy-app/
├── app/
│   ├── (ecommerce)/          # Ecommerce público: home, tienda, recetas
│   │   ├── layout.tsx        # Nav + Footer (Server Component)
│   │   ├── page.tsx          # Homepage
│   │   ├── tienda/
│   │   │   └── page.tsx      # Catálogo de productos
│   │   └── recetas/
│   │       ├── page.tsx      # Listado de recetas
│   │       └── [slug]/
│   │           └── page.tsx  # Detalle de receta
│   │
│   ├── (portal)/             # Portal B2B — clientes
│   │   └── portal/
│   │       ├── layout.tsx    # Sidebar nav, auth guard
│   │       ├── page.tsx      # Dashboard
│   │       ├── pedidos/
│   │       └── perfil/
│   │
│   ├── (auth)/               # Autenticación
│   │   └── login/page.tsx
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
│   ├── portal/               # Sidebar, OrderTable, etc.
│   └── ui/                   # Primitivos: Button, Tag, Badge, etc.
│
├── lib/
│   ├── products.ts           # Datos de productos + tipos TypeScript
│   ├── recetas.ts            # Datos de recetas + tipos TypeScript
│   ├── cart-context.tsx      # CartProvider (Client Component)
│   ├── mercadopago.ts        # SDK wrapper de Mercado Pago
│   ├── db.ts                 # Drizzle client singleton
│   ├── roles.ts              # ROLE_LABELS y ROLE_DESCRIPTIONS por UserRole
│   ├── supabase/
│   │   ├── server.ts         # createClient() para Server Components y Server Actions
│   │   └── client.ts         # createClient() para Client Components (browser)
│   └── actions/
│       ├── auth.ts           # logout() Server Action
│       └── profile.ts        # updateProfile() Server Action
│
├── drizzle/
│   ├── schema.ts             # Tablas, enums y relaciones Drizzle ORM
│   ├── migrations/           # SQL generado por drizzle-kit
│   └── drizzle.config.ts     # Config de drizzle-kit
│
├── types/
│   └── index.ts              # Tipos TypeScript globales compartidos
│
└── public/
    ├── products/             # Imágenes de frascos (front, open, back)
    └── lifestyle/            # Imágenes lifestyle, hero, recetas
```

### Regla sobre los route groups

Los `(parentheses)` en los nombres de carpeta crean route groups: agrupan páginas bajo un mismo layout sin afectar la URL. `/tienda` existe aunque esté dentro de `(ecommerce)/tienda/`.

---

## Componentes clave — guía rápida

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

## Portal B2B — estado y expansión futura

El portal ya tiene la infraestructura base implementada (Supabase Auth + Drizzle ORM). Ver `.claude/memory/project_portal_status.md` para el estado detallado.

**Próximas features posibles:**
- Panel admin para crear pedidos y actualizar estados (hoy se hace directo en la DB)
- Notificaciones por email cuando cambia el estado de un pedido (Resend)
- Portal mayorista con catálogo y precios por rol usando `price_overrides`

**Flujo admin para agregar un cliente:**
1. Crear usuario en Supabase Dashboard → Authentication → Users → Invite user
2. Insertar fila en `public.profiles` con `user_id` = UUID de Supabase + rol correspondiente
