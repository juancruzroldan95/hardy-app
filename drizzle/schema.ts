import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  numeric,
  timestamp,
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

// ─── profiles ─────────────────────────────────────────────────────────────────
// id is the same UUID Supabase creates in auth.users.
// Admin creates the auth.users row via Supabase dashboard,
// then inserts the matching profiles row with the same UUID + role.

export const profiles = pgTable('profiles', {
  id:          uuid('id').primaryKey(),
  role:        userRoleEnum('role').notNull().default('consumer'),
  displayName: text('display_name'),
  phone:       text('phone'),
  company:     text('company'),
  address:     text('address'),
  city:        text('city'),
  province:    text('province'),
  notes:       text('notes'),
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
  notes:           text('notes'),
  shippingAddress: text('shipping_address'),
  createdAt:       timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt:       timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('orders_user_id_idx').on(table.userId),
  index('orders_status_idx').on(table.status),
  index('orders_created_at_idx').on(table.createdAt),
])

// ─── order_items ──────────────────────────────────────────────────────────────
// Stores a snapshot of product data at the time of the order.
// Products live in lib/products.ts as static data — there is no products table.
// Snapshotting preserves price history if the catalog changes later.

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
}, (table) => [
  index('order_items_order_id_idx').on(table.orderId),
])

// ─── price_overrides ──────────────────────────────────────────────────────────
// Per-role pricing for products. Admin manages these rows directly in the DB.
// If no row exists for a (role, productId) pair, falls back to the base price
// defined in lib/products.ts.

export const priceOverrides = pgTable('price_overrides', {
  id:        uuid('id').primaryKey().defaultRandom(),
  role:      userRoleEnum('role').notNull(),
  productId: text('product_id').notNull(),
  priceArs:  numeric('price_ars', { precision: 12, scale: 2 }).notNull(),
  minQty:    integer('min_qty').default(1).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
  index('price_overrides_role_product_idx').on(table.role, table.productId),
])

// ─── Relations ────────────────────────────────────────────────────────────────

export const profilesRelations = relations(profiles, ({ many }) => ({
  orders: many(orders),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  profile: one(profiles, {
    fields:     [orders.userId],
    references: [profiles.id],
  }),
  items: many(orderItems),
}))

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields:     [orderItems.orderId],
    references: [orders.id],
  }),
}))

// ─── TypeScript types ─────────────────────────────────────────────────────────

export type Profile        = typeof profiles.$inferSelect
export type NewProfile     = typeof profiles.$inferInsert
export type Order          = typeof orders.$inferSelect
export type NewOrder       = typeof orders.$inferInsert
export type OrderItem      = typeof orderItems.$inferSelect
export type NewOrderItem   = typeof orderItems.$inferInsert
export type PriceOverride  = typeof priceOverrides.$inferSelect
export type UserRole       = (typeof userRoleEnum.enumValues)[number]
export type OrderStatus    = (typeof orderStatusEnum.enumValues)[number]
export type PaymentStatus  = (typeof paymentStatusEnum.enumValues)[number]
export type OrderWithItems = Order & { items: OrderItem[] }
