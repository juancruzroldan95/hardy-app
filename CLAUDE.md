# Hardy App — Guía para Claude Code

**Rama de trabajo**: siempre `develop`. Nunca commitear ni pushear a `master`. Nunca crear ramas, siempre trabajar sobre `develop`.

Leer y respetar fuertemente todas las rules mencionadas en **.claude > rules** antes de codear.

**Git workflow**: Ir haciendo commits por feature/task. Cuando detectes que el usuario pide cambios de algo diferente, hacer un git add y un git commit antes de avanzar con el siguiente cambio.

---

## Documentación por área

Antes de trabajar en cualquier área, leer el archivo correspondiente:

| Área                                                | Archivo                         |
| --------------------------------------------------- | ------------------------------- |
| Convenciones de código, Next.js 16, Tailwind v4, DB | `.claude/rules/conventions.md`  |
| Arquitectura de carpetas, componentes, skills       | `.claude/rules/architecture.md` |
| Producto, marca, stack, Mercado Pago                | `.claude/rules/product.md`      |
| Cuestiones de seguridad                             | `.claude/rules/security.md`     |
| Sistema de diseño, tokens, patrones visuales        | `DESIGN.md`                     |

---

## Comandos útiles

```bash
npm run dev    # Desarrollo con Turbopack (bundler default en Next.js 16)
npm run build  # Build de producción
npm run start  # Servidor de producción local
npm run lint   # ESLint (ya NO corre automático en build en Next.js 16)

npx drizzle-kit generate   # Generar migración a partir del schema
npx drizzle-kit migrate    # Aplicar migraciones pendientes en Supabase
```
