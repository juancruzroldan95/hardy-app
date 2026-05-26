# Convenciones de código — Hardy App

## CRÍTICO: Next.js 16 (breaking changes vs 14/15)

Antes de escribir cualquier código Next.js, leer el archivo relevante en `node_modules/next/dist/docs/`.

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

---

## CRÍTICO: Tailwind v4 (distinto a v3)

### Reglas globales deben ir en `@layer base`

En Tailwind v4 las utilities viven en `@layer utilities`. Las reglas CSS definidas **fuera de cualquier layer** tienen mayor prioridad en la cascade que las reglas dentro de un layer — por lo tanto sobreescriben las clases de Tailwind sin importar la especificidad.

**Síntoma típico**: una clase como `text-paper` en un `<a>` no tiene efecto porque `a { color: inherit }` en `globals.css` la pisa.

**Regla**: todos los resets y estilos base en `globals.css` deben estar envueltos en `@layer base`:

```css
/* MAL — pisa las utilities de Tailwind */
a {
  color: inherit;
  text-decoration: none;
}

/* BIEN — respeta la cascade de Tailwind */
@layer base {
  a {
    color: inherit;
    text-decoration: none;
  }
}
```

---

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

## TypeScript

- `strict: true` siempre
- No usar `any` — si no sabés el tipo, inferirlo o crear una interface
- Los tipos de dominio van en `types/index.ts`
- Los tipos específicos de un módulo pueden vivir en el mismo archivo

---

## Server vs Client Components

**Por defecto: Server Component** (no requiere ningún marcador).

```tsx
// Server Component — default, no se marca
export default async function ProductPage() {
  const products = await getProducts()
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

---

## Caching con `use cache` (Next.js 16)

```tsx
async function getProducts() {
  'use cache'
  return products
}

// Con duración específica
import { cacheLife } from 'next/cache'

async function getProducts() {
  'use cache'
  cacheLife({ revalidate: 3600 })
  return products
}
```

---

## Server Actions para mutaciones

```tsx
// lib/actions/orders.ts
'use server'

export async function createOrder(formData: FormData) {
  // lógica de servidor
  revalidatePath('/portal/pedidos')
}
```

---

## Importaciones — NO usar barrel files

```tsx
// MAL
import { Button, Input, Card } from '@/components/ui'

// BIEN
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
```

---

## Path aliases

```
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

## Convenciones de base de datos

### Estructura obligatoria de toda tabla

**Toda tabla nueva debe tener estas columnas — sin excepción:**

```ts
id:        uuid('id').primaryKey().defaultRandom(),  // PK interna auto-generada
isActive:  boolean('is_active').notNull().default(true),
isDeleted: boolean('is_deleted').notNull().default(false),
createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
```

Cuando la tabla representa un usuario/cliente, agregar también:

```ts
userId: uuid('user_id').notNull().unique(),  // UUID de Supabase auth.users
```

El `id` es el PK interno de la DB. El `userId` es el UUID que genera Supabase al crear el usuario en Auth.

### Soft delete — NUNCA borrar registros

**Nunca usar `db.delete()`**. Siempre hacer un update de `is_deleted = true`:

```ts
// MAL
await db.delete(orders).where(eq(orders.id, id))

// BIEN
await db.update(orders)
  .set({ isDeleted: true })
  .where(eq(orders.id, id))
```

### Todas las queries de fetch filtran is_deleted

**Siempre incluir `eq(tabla.isDeleted, false)` en el WHERE:**

```ts
// Una condición sola — usar and()
db.query.orders.findFirst({
  where: and(eq(orders.id, id), eq(orders.isDeleted, false)),
})

// Con relaciones anidadas — filtrar también los items
db.query.orders.findMany({
  where: and(eq(orders.userId, user.id), eq(orders.isDeleted, false)),
  with: { items: { where: eq(orderItems.isDeleted, false) } },
})
```

### Buscar profiles por userId (no por id)

El `id` de `profiles` es un UUID interno. Para buscar el perfil de un usuario autenticado, siempre usar `userId`:

```ts
// MAL — profiles.id es el PK interno, no el UUID de Supabase
where: eq(profiles.id, user.id)

// BIEN
where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false))
```
