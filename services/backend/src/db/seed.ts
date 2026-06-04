import { config } from 'dotenv'
import { neon } from '@neondatabase/serverless'
import { drizzle } from 'drizzle-orm/neon-http'
import * as schema from './schema'

config({ path: '.dev.vars' })

const sql = neon(process.env.DATABASE_URL!)
const db = drizzle(sql, { schema })

async function seed() {
  console.log('🌱 Seeding database...')

  // On vide d'abord les tables pour que le seed soit idempotent (relançable sans erreur).
  // L'ordre respecte les clés étrangères : les enfants avant les parents.
  console.log('🧹 Clearing existing data...')
  await db.delete(schema.orderItems)
  await db.delete(schema.orders)
  await db.delete(schema.menuItems)
  await db.delete(schema.menuCategories)
  await db.delete(schema.customers)
  await db.delete(schema.restaurantSettings)

  // Categories
  const [starters, mains, desserts, drinks] = await db
    .insert(schema.menuCategories)
    .values([
      { name: 'Starters', description: 'Light bites to begin', position: 1 },
      { name: 'Main Course', description: 'Hearty mains', position: 2 },
      { name: 'Desserts', description: 'Sweet endings', position: 3 },
      { name: 'Drinks', description: 'Beverages', position: 4 },
    ])
    .returning()

  // Menu items
  const [bruschetta, soup] = await db
    .insert(schema.menuItems)
    .values([
      { categoryId: starters.id, name: 'Bruschetta', description: 'Toasted bread with tomatoes and basil', price: '8.50', available: true },
      { categoryId: starters.id, name: 'French Onion Soup', description: 'Classic with gruyère crust', price: '10.00', available: true },
      { categoryId: mains.id, name: 'Grilled Salmon', description: 'With lemon butter sauce and vegetables', price: '24.00', available: true },
      { categoryId: mains.id, name: 'Beef Burger', description: '180g beef, cheddar, caramelized onions', price: '18.50', available: true },
      { categoryId: mains.id, name: 'Truffle Pasta', description: 'Tagliatelle with black truffle cream', price: '22.00', available: true },
      { categoryId: desserts.id, name: 'Crème Brûlée', description: 'Classic French dessert', price: '8.00', available: true },
      { categoryId: desserts.id, name: 'Chocolate Fondant', description: 'Warm with vanilla ice cream', price: '9.50', available: true },
      { categoryId: drinks.id, name: 'Still Water', description: '75cl', price: '3.50', available: true },
      { categoryId: drinks.id, name: 'House Red Wine', description: 'Glass 15cl', price: '7.00', available: true },
      { categoryId: drinks.id, name: 'Lemonade', description: 'Fresh squeezed', price: '4.50', available: true },
    ])
    .returning()

  // Customers
  const [alice, bob, carol] = await db
    .insert(schema.customers)
    .values([
      { name: 'Alice Martin', email: 'alice@example.com', phone: '+33 6 12 34 56 78' },
      { name: 'Bob Dupont', email: 'bob@example.com', phone: '+33 6 98 76 54 32' },
      { name: 'Carol Lemaire', email: 'carol@example.com', phone: '+33 7 11 22 33 44' },
    ])
    .returning()

  // Settings
  await db.insert(schema.restaurantSettings).values({
    prepTimeMinutes: 20,
    autoAccept: false,
    serviceAvailable: true,
    openingTime: '12:00',
    closingTime: '22:30',
  })

  // Sample orders
  const allItems = await db.select().from(schema.menuItems)
  const getItem = (name: string) => allItems.find((i) => i.name === name)!

  const order1Items = [
    { menuItemId: getItem('Bruschetta').id, quantity: 2 },
    { menuItemId: getItem('Grilled Salmon').id, quantity: 1 },
    { menuItemId: getItem('House Red Wine').id, quantity: 2 },
  ]
  const total1 = order1Items.reduce((s, i) => s + parseFloat(getItem(allItems.find(a => a.id === i.menuItemId)!.name).price) * i.quantity, 0)

  const [order1] = await db.insert(schema.orders).values({
    customerId: alice.id,
    type: 'dine_in',
    status: 'delivered',
    totalAmount: total1.toFixed(2),
    notes: 'Window table please',
  }).returning()

  await db.insert(schema.orderItems).values(
    order1Items.map((i) => ({
      orderId: order1.id,
      menuItemId: i.menuItemId,
      quantity: i.quantity,
      unitPrice: allItems.find((a) => a.id === i.menuItemId)!.price,
      subtotal: (parseFloat(allItems.find((a) => a.id === i.menuItemId)!.price) * i.quantity).toFixed(2),
    }))
  )

  const order2Items = [
    { menuItemId: getItem('Beef Burger').id, quantity: 2 },
    { menuItemId: getItem('Lemonade').id, quantity: 2 },
  ]

  const [order2] = await db.insert(schema.orders).values({
    customerId: bob.id,
    type: 'takeaway',
    status: 'confirmed',
    totalAmount: (18.5 * 2 + 4.5 * 2).toFixed(2),
  }).returning()

  await db.insert(schema.orderItems).values(
    order2Items.map((i) => ({
      orderId: order2.id,
      menuItemId: i.menuItemId,
      quantity: i.quantity,
      unitPrice: allItems.find((a) => a.id === i.menuItemId)!.price,
      subtotal: (parseFloat(allItems.find((a) => a.id === i.menuItemId)!.price) * i.quantity).toFixed(2),
    }))
  )

  const [_order3] = await db.insert(schema.orders).values({
    customerId: carol.id,
    type: 'delivery',
    status: 'pending',
    totalAmount: (22 + 8).toFixed(2),
    notes: 'Ring the bell twice',
  }).returning()

  await db.insert(schema.orderItems).values([
    {
      orderId: _order3.id,
      menuItemId: getItem('Truffle Pasta').id,
      quantity: 1,
      unitPrice: '22.00',
      subtotal: '22.00',
    },
    {
      orderId: _order3.id,
      menuItemId: getItem('Crème Brûlée').id,
      quantity: 1,
      unitPrice: '8.00',
      subtotal: '8.00',
    },
  ])

  console.log('✅ Seed complete!')
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err)
  process.exit(1)
})
