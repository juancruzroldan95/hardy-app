# Reglas de Seguridad — Hardy App

Este documento establece las directrices de seguridad obligatorias para el desarrollo de Hardy App, con el fin de evitar la introducción de vulnerabilidades críticas en el código fuente.

---

## 1. Prohibido Hardcodear Credenciales y Secretos

**REGLA CRÍTICA:** Bajo ninguna circunstancia se deben escribir credenciales, contraseñas, tokens, API keys o URLs de conexión a bases de datos directamente en el código fuente.

* **Causa común:** Scripts de utilidad, semillas de bases de datos (seeds), configuraciones de testeo rápidas o integraciones de APIs.
* **Solución obligatoria:** Cargar las variables desde archivos de entorno locales (como `.env.local`) utilizando librerías como `dotenv` y accediendo a través de `process.env`.
* **Ejemplo incorrecto:**
  ```javascript
  // MAL: Expone la contraseña de superusuario en el repositorio
  const DB_URL = 'postgresql://postgres.jveyfjoeavsbfwfrtpnd:HikGJ6SAZWMIrH7y@aws-1-sa-east-1.pooler.supabase.com:6543/postgres'
  const sql = postgres(DB_URL)
  ```
* **Ejemplo correcto:**
  ```javascript
  // BIEN: Lee la configuración de forma segura desde las variables de entorno
  import dotenv from 'dotenv'
  dotenv.config({ path: '.env.local' })
  
  const DB_URL = process.env.DATABASE_URL
  if (!DB_URL) {
    throw new Error('Falta la variable DATABASE_URL en las variables de entorno')
  }
  const sql = postgres(DB_URL)
  ```

---

## 2. Gestión de Claves y Variables de Entorno (Supabase / APIs)

* **Prefijo `NEXT_PUBLIC_`**: Solo las variables que sean seguras de exponer en el navegador (como la clave pública de Supabase `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`) deben llevar este prefijo.
* **Claves de Servicio (`SUPABASE_SERVICE_ROLE_KEY`)**: Esta clave permite saltarse todas las políticas de seguridad de Supabase (RLS). **NUNCA** debe exponerse al lado del cliente (frontend) ni llevar el prefijo `NEXT_PUBLIC_`. Solo debe usarse en Server Components, Server Actions o Route Handlers seguros.
* **Archivo `.gitignore`**: Verifica siempre que `.env`, `.env.local` y cualquier archivo con extensión `.env.*` estén incluidos en el archivo `.gitignore` para evitar subidas accidentales.

---

## 3. Scripts Administrativos y de Utilidad

Si creas scripts en la carpeta `scripts/` o similares:
1. Deben seguir la **Regla 1** (cargar variables de entorno).
2. Deben estar diseñados para ser ejecutados de forma manual y controlada (CLI), validando la existencia de los entornos necesarios.
3. No deben ser incluidos en paquetes compilados de producción del frontend, a menos que sea estrictamente necesario.

---

## 4. Control de Accesos y Roles (Autorización)

No confíes en que el frontend oculta botones o secciones para proteger rutas administrativas:
* **Validación en el Servidor**: En todos los Server Actions o API Routes que manejen información sensible, se debe verificar activamente el rol de la sesión actual consultando el perfil del usuario en la base de datos (`public.profiles`).
* **Ejemplo de validación obligatoria:**
  ```typescript
  // En un Server Action o API Route:
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error("No autorizado")
  }
  
  // Consultar rol en base de datos
  const profile = await db.query.profiles.findFirst({
    where: and(eq(profiles.userId, user.id), eq(profiles.isDeleted, false))
  })
  
  if (!profile || profile.role !== 'admin') {
    throw new Error("No tienes permisos suficientes")
  }
  ```

---

## 5. Prevención de Inyección SQL

* **Uso de ORM (Drizzle)**: Utilizar las funciones de consulta preparadas de Drizzle ORM en lugar de construir strings SQL concatenados de manera directa.
* **Uso de PostgreSQL Raw**: Si es estrictamente necesario escribir consultas en crudo (usando `postgres` o similar), utilizar interpolación de parámetros de la librería (como `sql` tagged template literals) que escapen los datos de forma segura, y **nunCA** concatenar variables con plantillas de texto estándar (`${}`).
  ```javascript
  // MAL (Vulnerable a inyección):
  await sql(`SELECT * FROM profiles WHERE display_name = '${name}'`)
  
  // BIEN (Seguro, escapa el parámetro de manera automática):
  await sql`SELECT * FROM profiles WHERE display_name = ${name}`
  ```

---

## 6. Seguridad en Server Actions (`'use server'`)

Cualquier archivo o función que declare la directiva `'use server'` es expuesto por Next.js como un endpoint HTTP POST público. Es fundamental seguir estas directrices para evitar brechas de seguridad:

1. **Autenticación y Autorización Interna**:
   - Nunca confíes en que una Server Action es segura simplemente porque se ejecuta tras un componente protegido en el cliente o no se renderiza en la UI.
   - Valida la sesión activa (`supabase.auth.getUser()`) y el rol del usuario (`profiles.role`) **dentro** de cada Server Action que requiera privilegios.
   - **Ejemplo Incorrecto:**
     ```typescript
     // MAL: Cualquiera que conozca la firma de la Server Action y un id puede ejecutarla
     export async function createPortalOrderForClient(clientUserId: string, formData: FormData) {
       return _createOrderForUser({ userId: clientUserId, ... })
     }
     ```
   - **Ejemplo Correcto:**
     ```typescript
     // BIEN: Valida de manera explícita que la sesión pertenezca a un administrador
     export async function createPortalOrderForClient(clientUserId: string, formData: FormData) {
       await getAdminUser() // Lanza error o redirige si no es admin
       return _createOrderForUser({ userId: clientUserId, ... })
     }
     ```

2. **Evitar `'use server'` en Consultas Innecesarias**:
   - Si una función de lectura de base de datos (por ejemplo, en `repository/queries/`) solo se consume en React Server Components (páginas o layouts de servidor), **NO** declares `'use server'` en su cabecera.
   - Mantener estas funciones puras y ejecutadas únicamente del lado del servidor elimina la posibilidad de que sean invocadas remotamente como endpoints HTTP públicos.

