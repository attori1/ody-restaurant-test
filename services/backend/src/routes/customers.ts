import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { eq, desc, sql } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { customers, orders } from '../db/schema'
import { createDb } from '../db'
import type { Env } from '../index'

const CustomerSchema = createSelectSchema(customers)
const InsertCustomerSchema = createInsertSchema(customers).omit({
  id: true, createdAt: true, updatedAt: true,
})

const CustomerWithStatsSchema = CustomerSchema.extend({
  orderCount: z.number(),
  totalSpend: z.string(),
  lastOrderAt: z.string().nullable(),
})

export const customersRouter = new OpenAPIHono<Env>()

customersRouter.openapi(
  createRoute({
    method: 'get', path: '/', tags: ['Customers'],
    summary: 'List customers with order stats',
    responses: { 200: { content: { 'application/json': { schema: z.array(CustomerWithStatsSchema) } }, description: 'OK' } },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    const result = await db
      .select({
        id: customers.id, name: customers.name, email: customers.email,
        phone: customers.phone, createdAt: customers.createdAt, updatedAt: customers.updatedAt,
        orderCount: sql<number>`count(${orders.id})::int`,
        totalSpend: sql<string>`coalesce(sum(${orders.totalAmount}), 0)::text`,
        lastOrderAt: sql<string | null>`max(${orders.createdAt})::text`,
      })
      .from(customers)
      .leftJoin(orders, eq(orders.customerId, customers.id))
      .groupBy(customers.id)
      .orderBy(desc(customers.createdAt))
    return c.json(result)
  }
)

customersRouter.openapi(
  createRoute({
    method: 'get', path: '/:id', tags: ['Customers'],
    summary: 'Get customer with order history',
    request: { params: z.object({ id: z.string() }) },
    responses: {
      200: {
        content: {
          'application/json': {
            schema: CustomerWithStatsSchema.extend({ recentOrders: z.array(createSelectSchema(orders)) }),
          },
        },
        description: 'OK',
      },
      404: { description: 'Not found' },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    const { id } = c.req.valid('param')
    const [customer] = await db.select().from(customers).where(eq(customers.id, id))
    if (!customer) return c.json({ error: 'Customer not found' }, 404)

    const recentOrders = await db.select().from(orders)
      .where(eq(orders.customerId, id))
      .orderBy(desc(orders.createdAt))
      .limit(10)

    const [stats] = await db
      .select({
        orderCount: sql<number>`count(${orders.id})::int`,
        totalSpend: sql<string>`coalesce(sum(${orders.totalAmount}), 0)::text`,
        lastOrderAt: sql<string | null>`max(${orders.createdAt})::text`,
      })
      .from(orders)
      .where(eq(orders.customerId, id))

    return c.json({ ...customer, ...stats, recentOrders })
  }
)

customersRouter.openapi(
  createRoute({
    method: 'post', path: '/', tags: ['Customers'],
    summary: 'Create a customer',
    request: { body: { content: { 'application/json': { schema: InsertCustomerSchema } } } },
    responses: {
      201: { content: { 'application/json': { schema: CustomerSchema } }, description: 'Created' },
      409: { description: 'Email already exists' },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    const body = c.req.valid('json')
    try {
      const [customer] = await db.insert(customers).values(body).returning()
      return c.json(customer, 201)
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('unique')) {
        return c.json({ error: 'Email already exists' }, 409)
      }
      throw err
    }
  }
)
