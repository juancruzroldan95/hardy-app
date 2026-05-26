# Hardy App — Guía para Claude Code

Este proyecto es desarrollado por **dos personas**: un dueño de marca (no programador) que usa Claude Code para agregar features, y un software engineer que revisa y arquitecta.

**Rama de trabajo**: siempre `develop`. Nunca commitear ni pushear a `master`.

---

## Documentación por área

Antes de trabajar en cualquier área, leer el archivo correspondiente:

| Área | Archivo |
|------|---------|
| Convenciones de código, Next.js 16, Tailwind v4, DB | `.claude/rules/conventions.md` |
| Arquitectura de carpetas, componentes, skills | `.claude/rules/architecture.md` |
| Producto, marca, stack, Mercado Pago | `.claude/rules/product.md` |
| Sistema de diseño, tokens, patrones visuales | `DESIGN.md` |
| Estado del portal B2B | `.claude/memory/project_portal_status.md` |

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
