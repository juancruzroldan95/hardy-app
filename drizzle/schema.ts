import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
  boolean,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ─── Enums ────────────────────────────────────────────────────────────────────

export const userRoleEnum = pgEnum('user_role', [
  'consumer',
  'mayorista',
  'gastronomico',
  'distribuidor',
  'productor',
  'admin',
])

export const orderStatusEnum = pgEnum('order_status', [
  'pending',
  'confirmed',
  'preparing',
  'shipped',
  'delivered',
  'cancelled',
])

export const paymentStatusEnum = pgEnum('payment_status', [
  'unpaid',
  'paid',
  'refunded',
  'failed',
])

export const shippingMethodEnum = pgEnum('shipping_method', [
  'coordinar_whatsapp',
  'andreani',
  'oca',
  'retiro_deposito',
  'urgente_caba',
  'urgente_gba',
  'sin_urgencia_caba',
  'sin_urgencia_gba',
])

export const paymentMethodEnum = pgEnum('payment_method', [
  'transferencia',
  'efectivo',
  'credito30',
  'credito60',
  'cheque',
  'deposito_bancario',
  'echeq_30',
])

export const tipoNegocioEnum = pgEnum('tipo_negocio', [
  'dietetica',
  'suplementos',
  'distribuidor',
  'cafeteria',
  'restaurante',
  'gimnasio',
  'almacen',
  'otro',
])

export const estadoSolicitudEnum = pgEnum('estado_solicitud', [
  'pendiente',
  'contactado',
  'aprobada',
  'rechazada',
])

export const alertTipoEnum = pgEnum('alert_tipo', [
  'reorder',
  'payment',
  'inactivity',
  'custom',
])

// ─── profiles ─────────────────────────────────────────────────────────────────

export const profiles = pgTable('profiles', {
  id:          uuid('id').primaryKey().defaultRandom(),
  userId:      uuid('user_id').notNull().unique(),
  role:        userRoleEnum('role').notNull().default('consumer'),
  displayName: text('display_name'),
  phone:       text('phone'),
  company:     text('company'),
  address:     text('address'),
  city:        text('city'),
  province:    text('province'),
  notes:            text('notes'),
  cuit:             text('cuit'),
  vendedorNombre:   text('vendedor_nombre'),
  vendedorWhatsapp: text('vendedor_whatsapp'),
  isActive:         boolean('is_active').notNull().default(true),
  isDeleted:   boolean('is_deleted').notNull().default(false),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

// ─── orders ───────────────────────────────────────────────────────────────────

export const orders = pgTable('orders', {
  id:              uuid('id').primaryKey().defaultRandom(),
  userId:          uuid('user_id').notNull(),
  status:          orderStatusEnum('status').notNull().default('pending'),
  paymentStatus:   paymentStatusEnum('payment_status').notNull().default('unpaid'),
  totalArs:        numeric('total_ars', { precision: 12, scale: 2 }).notNull(),
  shippingMethod:  shippingMethodEnum('shipping_method'),
  paymentMethod:   paymentMethodEnum('payment_method'),
  notes:           text('notes'),
  shippingAddress: text('shipping_address'),
  isActive:        boolean('is_active').notNull().default(true),
  isDeleted:       boolean('is_deleted').notNull().default(false),
  createdAt:       timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('orders_user_id_idx').on(table.userId),
  index('orders_status_idx').on(table.status),
  index('orders_created_at_idx').on(table.createdAt),
])

// ─── order_items ──────────────────────────────────────────────────────────────

export const orderItems = pgTable('order_items', {
  id:           uuid('id').primaryKey().defaultRandom(),
  orderId:      uuid('order_id').notNull(),
  productId:    text('product_id').notNull(),
  productName:  text('product_name').notNull(),
  variant:      text('variant').notNull(),
  size:         text('size').notNull(),
  unitPriceArs: numeric('unit_price_ars', { precision: 12, scale: 2 }).notNull(),
  qty:          integer('qty').notNull(),
  subtotalArs:  numeric('subtotal_ars', { precision: 12, scale: 2 }).notNull(),
  isActive:     boolean('is_active').notNull().default(true),
  isDeleted:    boolean('is_deleted').notNull().default(false),
}, (table) => [
  index('order_items_order_id_idx').on(table.orderId),
])

// ─── price_overrides ──────────────────────────────────────────────────────────

export const priceOverrides = pgTable('price_overrides', {
  id:        uuid('id').primaryKey().defaultRandom(),
  role:      userRoleEnum('role').notNull(),
  productId: text('product_id').notNull(),
  priceArs:  numeric('price_ars', { precision: 12, scale: 2 }).notNull(),
  minQty:    integer('min_qty').default(1).notNull(),
  isActive:  boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('price_overrides_role_product_idx').on(table.role, table.productId),
])

// ─── solicitudes ──────────────────────────────────────────────────────────────
// Registro de interesados en acceder al portal B2B.
// No crea usuario en Supabase — eso lo hace el admin manualmente tras verificar.

export const solicitudes = pgTable('solicitudes', {
  id:          uuid('id').primaryKey().defaultRandom(),
  nombre:      text('nombre').notNull(),
  empresa:     text('empresa').notNull(),
  tipoNegocio: tipoNegocioEnum('tipo_negocio').notNull(),
  email:       text('email').notNull(),
  whatsapp:    text('whatsapp').notNull(),
  ciudad:      text('ciudad').notNull(),
  provincia:   text('provincia').notNull(),
  cuit:        text('cuit'),
  mensaje:     text('mensaje'),
  notasAdmin:  text('notas_admin'),
  estado:      estadoSolicitudEnum('estado').notNull().default('pendiente'),
  isActive:    boolean('is_active').notNull().default(true),
  isDeleted:   boolean('is_deleted').notNull().default(false),
  createdAt:   timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:   timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('solicitudes_estado_idx').on(table.estado),
  index('solicitudes_email_idx').on(table.email),
])

// ─── novedades ────────────────────────────────────────────────────────────────
// Publicaciones internas del portal (avisos, promociones, actualizaciones).

export const novedades = pgTable('novedades', {
  id:        uuid('id').primaryKey().defaultRandom(),
  titulo:    text('titulo').notNull(),
  cuerpo:    text('cuerpo').notNull(),
  imageUrl:  text('image_url'),
  isActive:  boolean('is_active').notNull().default(true),
  isDeleted: boolean('is_deleted').notNull().default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('novedades_created_at_idx').on(table.createdAt),
])

// ─── client_alerts ────────────────────────────────────────────────────────────
// Alertas internas por cliente, creadas por admins.

export const clientAlerts = pgTable('client_alerts', {
  id:              uuid('id').primaryKey().defaultRandom(),
  profileId:       uuid('profile_id').notNull(),
  tipo:            alertTipoEnum('tipo').notNull().default('custom'),
  mensaje:         text('mensaje').notNull(),
  scheduledFor:    timestamp('scheduled_for', { withTimezone: true }),
  emailSentAt:     timestamp('email_sent_at',  { withTimezone: true }),
  isResolved:      boolean('is_resolved').notNull().default(false),
  resolvedAt:      timestamp('resolved_at', { withTimezone: true }),
  createdByUserId: uuid('created_by_user_id').notNull(),
  isActive:        boolean('is_active').notNull().default(true),
  isDeleted:       boolean('is_deleted').notNull().default(false),
  createdAt:       timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('client_alerts_profile_id_idx').on(table.profileId),
  index('client_alerts_is_resolved_idx').on(table.isResolved),
])

// ─── Relations ────────────────────────────────────────────────────────────────

export const profilesRelations = relations(profiles, ({ many }) => ({
  orders: many(orders),
  alerts: many(clientAlerts),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  profile: one(profiles, {
    fields:     [orders.userId],
    references: [profiles.userId],
  }),
  items: many(orderItems),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields:     [orderItems.orderId],
    references: [orders.id],
  }),
}))

export const clientAlertsRelations = relations(clientAlerts, ({ one }) => ({
  profile: one(profiles, {
    fields:     [clientAlerts.profileId],
    references: [profiles.id],
  }),
}))

// ─── TypeScript types ─────────────────────────────────────────────────────────

export type Profile          = typeof profiles.$inferSelect
export type NewProfile       = typeof profiles.$inferInsert
export type Order            = typeof orders.$inferSelect
export type NewOrder         = typeof orders.$inferInsert
export type OrderItem        = typeof orderItems.$inferSelect
export type NewOrderItem     = typeof orderItems.$inferInsert
export type PriceOverride    = typeof priceOverrides.$inferSelect
export type Solicitud        = typeof solicitudes.$inferSelect
export type NewSolicitud     = typeof solicitudes.$inferInsert
export type Novedad          = typeof novedades.$inferSelect
export type NewNovedad       = typeof novedades.$inferInsert
export type UserRole         = (typeof userRoleEnum.enumValues)[number]
export type OrderStatus      = (typeof orderStatusEnum.enumValues)[number]
export type PaymentStatus    = (typeof paymentStatusEnum.enumValues)[number]
export type ShippingMethod   = (typeof shippingMethodEnum.enumValues)[number]
export type PaymentMethod    = (typeof paymentMethodEnum.enumValues)[number]
export type TipoNegocio      = (typeof tipoNegocioEnum.enumValues)[number]
export type EstadoSolicitud  = (typeof estadoSolicitudEnum.enumValues)[number]
export type AlertTipo        = (typeof alertTipoEnum.enumValues)[number]
export type ClientAlert      = typeof clientAlerts.$inferSelect
export type NewClientAlert   = typeof clientAlerts.$inferInsert
export type OrderWithItems   = Order & { items: OrderItem[] }
