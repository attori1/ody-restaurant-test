import { pgTable, text, integer, numeric, boolean, timestamp, pgEnum } from 'drizzle-orm/pg-core'

// --- Enums ---
// Un enum = une liste de valeurs autorisées. On le définit une seule fois ici,
// et drizzle-zod va le transformer en validation automatiquement.

export const orderStatusEnum = pgEnum('order_status', [
  'pending',    // commande reçue, en attente de confirmation
  'confirmed',  // acceptée par le restaurant
  'preparing',  // en cours de préparation
  'ready',      // prête à être récupérée/livrée
  'delivered',  // livrée
  'cancelled',  // annulée
])

export const orderTypeEnum = pgEnum('order_type', [
  'dine_in',   // sur place
  'takeaway',  // à emporter
  'delivery',  // livraison
])

// --- Tables ---

export const menuCategories = pgTable('menu_categories', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  description: text('description'),
  position: integer('position').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const menuItems = pgTable('menu_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  categoryId: text('category_id').notNull().references(() => menuCategories.id),
  name: text('name').notNull(),
  description: text('description'),
  price: numeric('price', { precision: 10, scale: 2 }).notNull(),
  available: boolean('available').notNull().default(true),
  imageUrl: text('image_url'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const customers = pgTable('customers', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  phone: text('phone'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const orders = pgTable('orders', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  customerId: text('customer_id').references(() => customers.id),
  status: orderStatusEnum('status').notNull().default('pending'),
  type: orderTypeEnum('type').notNull().default('dine_in'),
  totalAmount: numeric('total_amount', { precision: 10, scale: 2 }).notNull(),
  notes: text('notes'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})

export const orderItems = pgTable('order_items', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  orderId: text('order_id').notNull().references(() => orders.id),
  menuItemId: text('menu_item_id').notNull().references(() => menuItems.id),
  quantity: integer('quantity').notNull(),
  unitPrice: numeric('unit_price', { precision: 10, scale: 2 }).notNull(),
  subtotal: numeric('subtotal', { precision: 10, scale: 2 }).notNull(),
})

export const restaurantSettings = pgTable('restaurant_settings', {
  id: text('id').primaryKey().$defaultFn(() => crypto.randomUUID()),
  prepTimeMinutes: integer('prep_time_minutes').notNull().default(20),
  autoAccept: boolean('auto_accept').notNull().default(false),
  serviceAvailable: boolean('service_available').notNull().default(true),
  openingTime: text('opening_time').notNull().default('09:00'),
  closingTime: text('closing_time').notNull().default('22:00'),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
})
