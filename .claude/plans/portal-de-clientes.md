# Plan: Portal de Clientes — Hardy

## Context

Hardy necesita un portal privado donde sus clientes B2B (y consumidores que el admin invite) puedan ver el estado e historial de sus pedidos. No hay self-registration: el admin crea usuarios desde el dashboard de Supabase manualmente y asigna el rol. Los pedidos también los crea el admin — el portal es read/write solo para perfil, read-only para pedidos.

Stack confirmado: Next.js 16, Supabase Auth + DB, Drizzle ORM, Tailwind v4.

---

## Breaking changes de Next.js 16 relevantes aquí

- `middleware.ts` → ahora es **`proxy.ts`** (renombrado en v16 — confirmado en `node_modules/next/dist/docs/01-app/01-getting-started/16-proxy.md`)
- `cookies()` de `next/headers` es **async** en v16 — siempre `await cookies()`
- No usar `use cache` en páginas del portal — los datos son user-specific y deben ser siempre frescos

---

## Archivos nuevos a crear

### Infraestructura DB

```
drizzle.config.ts
drizzle/schema.ts
lib/db.ts
```

### Clientes Supabase

```
lib/supabase/server.ts     ← usado en Server Components y Server Actions
lib/supabase/client.ts     ← usado solo en Client Components
```

### Auth guard

```
proxy.ts                   ← reemplaza middleware.ts en Next.js 16
app/auth/callback/route.ts ← callback para el PKCE flow de Supabase
```

### Login

```
app/(auth)/layout.tsx           ← layout vacío (aísla de nav/footer del ecommerce)
app/(auth)/login/page.tsx       ← Server Component con metadata
components/portal/LoginForm.tsx ← Client Component con el form
```

### Portal

```
app/(portal)/layout.tsx                        ← auth guard + sidebar
app/(portal)/portal/page.tsx                   ← dashboard
app/(portal)/portal/pedidos/page.tsx           ← lista de pedidos
app/(portal)/portal/pedidos/[id]/page.tsx      ← detalle de pedido
app/(portal)/portal/perfil/page.tsx            ← perfil + form de edición
```

### Componentes portal

```
components/portal/PortalSidebar.tsx    ← 'use client' (usePathname)
components/portal/LogoutButton.tsx     ← 'use client'
components/portal/OrderStatusBadge.tsx ← Server Component
components/portal/ProfileForm.tsx      ← 'use client' + useActionState
```

### Server Actions

```
lib/actions/auth.ts     ← logout()
lib/actions/profile.ts  ← updateProfile()
```

### Utilidades

```
lib/roles.ts            ← ROLE_LABELS, ROLE_DESCRIPTIONS
```

---

## Schema Drizzle (`drizzle/schema.ts`)

```ts
// Enums
userRoleEnum:      consumer | mayorista | gastronomico | distribuidor | productor
orderStatusEnum:   pending | confirmed | preparing | shipped | delivered | cancelled
paymentStatusEnum: unpaid | paid | refunded | failed

// Tablas
profiles {
  id uuid PK           -- mismo UUID que auth.users(id) de Supabase
  role userRoleEnum    -- default 'consumer'
  displayName text
  phone text
  company text         -- para roles B2B
  address, city, province text
  notes text           -- notas internas del admin
  createdAt, updatedAt timestamp
}

orders {
  id uuid PK
  userId uuid          -- FK → profiles(id)
  status orderStatusEnum
  paymentStatus paymentStatusEnum
  totalArs numeric(12,2)
  notes text
  shippingAddress text
  createdAt, updatedAt timestamp
  -- indexes: userId, status, createdAt
}

order_items {
  id uuid PK
  orderId uuid         -- FK → orders(id)
  productId text       -- snapshot del catálogo (ej: 'natural-380')
  productName text     -- snapshot al momento del pedido
  variant text         -- snapshot
  size text            -- snapshot
  unitPriceArs numeric(12,2)
  qty integer
  subtotalArs numeric(12,2)
  -- index: orderId
}

price_overrides {
  id uuid PK
  role userRoleEnum
  productId text
  priceArs numeric(12,2)
  minQty integer default 1
  createdAt timestamp
  -- index: (role, productId)
}
```

> **Por qué snapshot en order_items**: los productos viven en `lib/products.ts` como datos estáticos, no hay tabla de productos. El snapshot preserva precios históricos aunque cambie el catálogo.

---

## Auth Architecture

### Variables de entorno a agregar a `.env.local`

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
# DATABASE_URL ya está
```

### Flujo de autenticación

```
1. Admin crea user en Supabase Dashboard → fila en auth.users
2. Admin inserta fila en public.profiles con el mismo UUID + rol asignado

3. User abre /portal
   → proxy.ts intercepta → supabase.auth.getUser() → sin sesión
   → redirect a /login?next=/portal

4. User llena LoginForm → supabase.auth.signInWithPassword()
   → sesión escrita en cookies por @supabase/ssr
   → router.push('/portal') + router.refresh()

5. /portal request llega con cookies
   → proxy.ts valida JWT contra Supabase (getUser, no getSession)
   → NextResponse.next() con tokens refrescados en response cookies

6. app/(portal)/layout.tsx (Server Component)
   → createClient() lee cookies de next/headers
   → getUser() confirma sesión
   → db.query.profiles.findFirst() carga rol + displayName
   → renderiza PortalSidebar + children
```

> **getUser() no getSession()**: `getSession()` solo lee el JWT del cookie sin validarlo contra Supabase — no es seguro para decisiones de auth. `getUser()` valida contra el servidor de Supabase en cada request.

---

## Detalle de implementación clave

### `proxy.ts` (auth guard)

```ts
export async function proxy(request: NextRequest) {
  // Crear supabase client con setAll en request Y response cookies
  // (crítico para que @supabase/ssr refresque tokens correctamente)
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (request.nextUrl.pathname.startsWith('/portal') && !user)
    return redirect('/login?next=<pathname>')
  
  if (request.nextUrl.pathname === '/login' && user)
    return redirect('/portal')
  
  return response
}
export const config = { matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg)$).*)', ] }
```

### `app/(portal)/layout.tsx`

- Segunda línea de defensa después de `proxy.ts`
- Fetch en paralelo: `Promise.all([getUser(), getProfile()])` 
- Renderiza `<PortalSidebar role={role} displayName={displayName} />`

### `app/(portal)/portal/page.tsx` (Dashboard)

- `Promise.all([getProfile(), getRecentOrders(5), getOrderCount()])`
- Muestra: bienvenida con nombre + role badge, stats de pedidos, últimos 5 pedidos

### `app/(portal)/portal/pedidos/page.tsx`

- Acepta `searchParams.status` para filtrar por estado
- Tabla con: fecha, nro de pedido, total, status badge, link a detalle

### `app/(portal)/portal/pedidos/[id]/page.tsx`

- Fetch con `db.query.orders.findFirst({ with: { items: true } })`
- Verificar `order.userId === user.id` antes de renderizar (autorización)
- Lista de line items + status actual del pedido

### `components/portal/PortalSidebar.tsx` — `'use client'`

- `usePathname()` para marcar link activo
- Role badge con `ROLE_LABELS[role]`
- `<LogoutButton />` abajo del sidebar
- Desktop: panel fijo izquierdo `w-[240px]`, bg-ink
- Mobile: top bar colapsable

### `lib/actions/profile.ts`

```ts
'use server'
export async function updateProfile(prevState, formData) {
  const user = await getUser() // via createClient()
  if (!user) return { error: 'No autenticado.' }
  await db.update(profiles).set({ ...fields }).where(eq(profiles.id, user.id))
  revalidatePath('/portal/perfil')
  return { success: true }
}
```

---

## Orden de implementación

1. **`drizzle/schema.ts`** + **`drizzle.config.ts`** → correr `npx drizzle-kit generate` + `npx drizzle-kit migrate`
2. **`lib/db.ts`** + **`lib/supabase/server.ts`** + **`lib/supabase/client.ts`**
3. **`proxy.ts`** — testear que `/portal` redirige a `/login` antes de seguir
4. **`lib/actions/auth.ts`** (logout)
5. **`app/(auth)/layout.tsx`** + **`app/(auth)/login/page.tsx`** + **`components/portal/LoginForm.tsx`**
6. **`app/(portal)/layout.tsx`** + **`components/portal/PortalSidebar.tsx`** + **`components/portal/LogoutButton.tsx`**
7. **`app/(portal)/portal/page.tsx`** (dashboard)
8. **`components/portal/OrderStatusBadge.tsx`**
9. **`app/(portal)/portal/pedidos/page.tsx`** + **`/[id]/page.tsx`**
10. **`components/portal/ProfileForm.tsx`** + **`lib/actions/profile.ts`** + **`app/(portal)/portal/perfil/page.tsx`**
11. **`app/auth/callback/route.ts`** (para futuros magic links / OAuth)
12. **`lib/roles.ts`**

---

## Verificación

1. Correr `npm run dev`, navegar a `/portal` → debe redirigir a `/login`
2. Login con credenciales de un user de prueba creado en Supabase dashboard → llega a `/portal`
3. Insertar un pedido de prueba en la DB con `userId` del user → aparece en `/portal/pedidos`
4. Abrir `/portal/pedidos/<id>` → muestra items del pedido
5. Editar perfil → cambios persisten, `revalidatePath` refrescar la página
6. Click en "Salir" → redirige a `/login`, session cerrada
7. Intentar acceder a `/portal/pedidos/<id-de-otro-usuario>` → no debe mostrar datos
8. `npm run build` sin errores TypeScript
