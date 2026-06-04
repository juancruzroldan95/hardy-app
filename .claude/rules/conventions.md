# Convenciones de Código — Hardy App

Este documento establece las convenciones de desarrollo y estilo de código del proyecto Hardy App. Nos basamos estrictamente en las directrices recomendadas por los skills de **Vercel React Best Practices** y **Supabase**, adaptándolas a nuestro flujo de trabajo.

---

## 1. Convenciones de Vercel React & Next.js

Adherimos a las directrices de optimización y desarrollo contenidas en el skill de Vercel React:
*Directorio de referencia:* `file:///.claude/skills/vercel-react-best-practices/` (especialmente `AGENTS.md` con reglas de rendimiento y optimización).

### Ruteo y Renderizado (Server vs Client)
- **Páginas (`page.tsx`):**
  - **Prohibido `'use client'`:** Todos los archivos `page.tsx` deben ser **Server Components** puros. No se permite el uso de event handlers, hooks de React (`useState`, `useEffect`, etc.) o APIs de navegador directamente en ellos.
  - **Interactividad en Componentes:** Delegue la interactividad a componentes especializados ubicados bajo la carpeta `components/` y márquelos con `'use client'` sólo cuando sea necesario.
- **Evitar Waterfalls (`async-parallel`):**
  - Al realizar lecturas múltiples e independientes en Server Components, ejecútelas en paralelo con `Promise.all()` en lugar de secuenciarlas con múltiples `await` consecutivos.

### Optimización de Bundle y Carga
- **Prohibido el uso de Barrel Files (`bundle-barrel-imports`):**
  - Evite la creación de archivos `index.ts` que re-exportan múltiples módulos (barrel files) en carpetas de componentes o utilidades. Esto genera dependencias circulares y aumenta el tamaño del bundle cargado.
  - Realice importaciones directas al archivo del componente:
    ```tsx
    // BIEN
    import Button from '@/components/ui/Button'
    // MAL
    import { Button } from '@/components/ui'
    ```
- **Carga Diferida (`bundle-dynamic-imports`):**
  - Use `next/dynamic` para componentes pesados de la UI que no son críticos para el renderizado inicial en pantalla (fold).

### Caching en Next.js 16
- **Directiva `use cache`:**
  - Aplique la directiva `'use cache'` en funciones que realizan lecturas estáticas o de larga duración.
  - Para refrescar los datos, combine su uso con `cacheLife` y establezca tiempos de expiración acordes a los requerimientos de negocio:
    ```tsx
    import { cacheLife } from 'next/cache'

    async function getStaticProducts() {
      'use cache'
      cacheLife({ revalidate: 3600 }) // 1 hora
      return products
    }
    ```
- **Deduplicación por Request (`server-cache-react`):**
  - Envuelva las llamadas repetitivas dentro de una misma solicitud en `React.cache()` para evitar llamadas duplicadas a bases de datos o APIs durante el ciclo de vida del renderizado de la página.

---

## 2. Convenciones de Supabase & Base de Datos

Adherimos a las directrices de seguridad, integración y base de datos contenidas en el skill de Supabase:
*Directorios de referencia:* `file:///.claude/skills/supabase/` y `file:///.claude/skills/supabase-postgres-best-practices/`.

### Instanciación de Clientes Supabase
- **Cliente Centralizado:** Nunca use `createClient` directo de `@supabase/supabase-js` o `@supabase/ssr` en componentes de presentación. Utilice siempre los clientes configurados en la capa de servicios (`@/services/supabase/`):
  - `createClient()` (cliente del lado de cliente)
  - `createServerClient()` (cliente del lado del servidor)

### Seguridad, Auth y Roles
- **Información Segura del Usuario:**
  - Use siempre `supabase.auth.getUser()` para obtener el usuario autenticado del servidor. Evite `supabase.auth.getSession()`, ya que la información del session puede ser modificada por el cliente y no valida la integridad en el backend.
- **Autorización Segura (RLS):**
  - **No usar `user_metadata`:** Está prohibido tomar decisiones de autorización o lógica RLS basadas en `raw_user_meta_data` (JWT), ya que es editable por el usuario. Use `app_metadata` o mapee roles mediante la tabla interna `profiles` en la base de datos PostgreSQL.
  - **Seguridad en Vistas:** Recuerde que las vistas de Postgres bypassan RLS por defecto. Use `security_invoker = true` al declararlas.

### Diseño y Estructura de Tablas (Drizzle ORM)
Toda tabla en el esquema (`db/schema.ts`) debe cumplir con los siguientes campos estándar:
```ts
id:        uuid('id').primaryKey().defaultRandom(),  // PK interno generado
isActive:  boolean('is_active').notNull().default(true),
isDeleted: boolean('is_deleted').notNull().default(false), // Eliminación lógica
createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
```
- **Mapeo de Usuarios:** Para tablas que representen perfiles o registros pertenecientes a un usuario de Supabase, declare `userId` como UUID único o FK relacionado:
  ```ts
  userId: uuid('user_id').notNull().unique(), // Vinculado a auth.users de Supabase
  ```

### Eliminación Lógica (Soft Delete)
- **Prohibido `db.delete()`:** Está prohibido eliminar físicamente registros de la base de datos. Toda eliminación debe ser lógica, actualizando `isDeleted: true`:
  ```ts
  await db.update(orders)
    .set({ isDeleted: true })
    .where(eq(orders.id, id))
  ```
- **Filtro Obligatorio:** Todas las consultas de lectura (`repository/queries/`) deben incluir explícitamente el filtro `eq(tabla.isDeleted, false)` en sus condiciones de búsqueda, tanto para la tabla principal como en sus relaciones:
  ```ts
  db.query.orders.findMany({
    where: and(eq(orders.userId, userId), eq(orders.isDeleted, false)),
    with: { items: { where: eq(orderItems.isDeleted, false) } }
  })
  ```
- **Búsqueda de Profiles:** Para buscar el perfil de un usuario autenticado de Supabase, siempre filtre por `userId` (el UID de la sesión) y no por `id` (el PK interno autogenerado):
  ```ts
  where: and(eq(profiles.userId, supabaseUserId), eq(profiles.isDeleted, false))
  ```

---

## 3. Estilos y Tailwind CSS v4

- **Cascada CSS en Tailwind v4:**
  - Dado que Tailwind v4 maneja de forma distinta la prioridad de la cascada, todas las reglas base y overrides personalizados en `globals.css` deben estar envueltos en `@layer base` para evitar pisar las clases utilitarias de Tailwind.
  ```css
  @layer base {
    body {
      background-color: var(--color-paper);
      color: var(--color-ink);
    }
  }
  ```
- **Evitar Estilos en Línea:** Utilice siempre las variables de tema y clases utilitarias configuradas en `@theme` en `globals.css` (colores como `red`, `ink`, `paper`, tipografías como `font-display`, `font-body`).

---

## 4. TypeScript y Tipado

- **Tipado Estricto (`strict: true`):**
  - Está prohibido el uso del tipo `any`. Si el tipo de una variable o retorno es complejo o dinámico, defina interfaces genéricas o use tipos derivados.
  - Los tipos de datos globales y de base de datos compartidos se centralizan en `types/index.ts`.
