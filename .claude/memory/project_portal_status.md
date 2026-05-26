---
name: project-portal-status
description: "Estado del portal de clientes Hardy — qué está implementado, cómo está estructurado, y qué falta"
metadata: 
  node_type: memory
  type: project
  originSessionId: b0c9c5cb-0985-40c1-b68c-a81b68c56466
---

Portal de clientes MVP implementado en mayo 2026. Usa Supabase Auth + Drizzle ORM + Next.js 16.

**Why:** Hardy necesita un portal privado para que sus clientes B2B y consumidores vean el historial y estado de sus pedidos. No hay self-registration — el admin crea usuarios manualmente en el dashboard de Supabase.

**How to apply:** Al trabajar en el portal, tener en cuenta que ya está la infraestructura completa. Nuevas features se agregan sobre esta base.

## Lo que está implementado

- `drizzle/schema.ts` — tablas: profiles, orders, order_items, price_overrides; enums: user_role, order_status, payment_status
- `drizzle.config.ts` — carga .env.local, apunta a drizzle/schema.ts
- `drizzle/migrations/0000_sturdy_payback.sql` — migración aplicada a Supabase
- `lib/db.ts` — cliente Drizzle singleton
- `lib/supabase/server.ts` — createClient() para Server Components y Server Actions
- `lib/supabase/client.ts` — createClient() para Client Components (browser)
- `lib/roles.ts` — ROLE_LABELS y ROLE_DESCRIPTIONS por UserRole
- `lib/actions/auth.ts` — logout() Server Action
- `lib/actions/profile.ts` — updateProfile() Server Action
- `proxy.ts` — auth guard (Next.js 16: middleware ahora se llama proxy)
- `app/auth/callback/route.ts` — callback para PKCE flow de Supabase
- `app/(auth)/layout.tsx + login/page.tsx` — página de login en /login
- `components/portal/LoginForm.tsx` — form de email+password con supabase browser client
- `app/(portal)/layout.tsx` — layout del portal con auth guard + sidebar
- `app/(portal)/portal/page.tsx` — dashboard con stats + pedidos recientes
- `app/(portal)/portal/pedidos/page.tsx` — lista de pedidos con filtros por status
- `app/(portal)/portal/pedidos/[id]/page.tsx` — detalle de pedido con timeline de estado
- `app/(portal)/portal/perfil/page.tsx` — perfil del usuario (read-only email, editable resto)
- `components/portal/PortalSidebar.tsx` — sidebar con nav, role badge, logout
- `components/portal/LogoutButton.tsx` — botón de logout
- `components/portal/OrderStatusBadge.tsx` — badge de estado de pedido
- `components/portal/ProfileForm.tsx` — formulario de edición de perfil con useActionState

## Roles disponibles
consumer | mayorista | gastronomico | distribuidor | productor

## Variables de entorno requeridas
- NEXT_PUBLIC_SUPABASE_URL ✅ en .env.local
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ✅ en .env.local (es la anon key, Supabase v2 la renombró)
- DATABASE_URL ✅ en .env.local

## Flujo admin para agregar un cliente
1. Crear usuario en Supabase Dashboard → Authentication → Users → Invite user
2. Insertar fila en public.profiles con el mismo UUID + el rol correspondiente

## Próximos pasos posibles
- Panel admin para que el dueño de Hardy cree pedidos y actualice estados (actualmente se hace directo en la DB)
- Notificaciones por email cuando cambia el estado de un pedido (Resend)
- Portal mayorista con catálogo y precios por rol usando price_overrides
