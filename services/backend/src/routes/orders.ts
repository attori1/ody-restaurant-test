import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { eq, inArray, desc, and } from 'drizzle-orm'
import { createSelectSchema } from 'drizzle-zod'
import { orders, orderItems, menuItems, customers } from '../db/schema'
import { createDb } from '../db'
import { canTransition, validateAndPriceOrder, VALID_TRANSITIONS, type OrderStatus } from '../lib/orders-logic'
import type { Env } from '../index'

const OrderSchema = createSelectSchema(orders)
const OrderItemSchema = createSelectSchema(orderItems)

const CreateOrderSchema = z.object({
  customerId: z.string().optional(),
  type: z.enum(['dine_in', 'takeaway', 'delivery']),
  notes: z.string().optional(),
  items: z.array(z.object({
    menuItemId: z.string(),
    quantity: z.number().int().min(1),
  })).min(1),
})

const OrderWithItemsSchema = OrderSchema.extend({
  items: z.array(OrderItemSchema.extend({ menuItem: createSelectSchema(menuItems) })),
  customer: createSelectSchema(customers).nullable(),
})

export const ordersRouter = new OpenAPIHono<Env>()

ordersRouter.openapi(
  createRoute({
    method: 'get', path: '/', tags: ['Orders'],
    summary: 'List orders',
    request: {
      query: z.object({
        status: z.enum(['pending','confirmed','preparing','ready','delivered','cancelled']).optional(),
        customerId: z.string().optional(),
        limit: z.string().optional(),
        offset: z.string().optional(),
      }),
    },
    responses: { 200: { content: { 'application/json': { schema: z.array(OrderSchema) } }, description: 'OK' } },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    const { status, customerId, limit, offset } = c.req.valid('query')
    const conditions = []
    if (status) conditions.push(eq(orders.status, status))
    if (customerId) conditions.push(eq(orders.customerId, customerId))
    const result = await db.select().from(orders)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(desc(orders.createdAt))
      .limit(limit ? parseInt(limit) : 50)
      .offset(offset ? parseInt(offset) : 0)
    return c.json(result)
  }
)

ordersRouter.openapi(
  createRoute({
    method: 'get', path: '/{id}', tags: ['Orders'],
    summary: 'Get order with items',
    request: { params: z.object({ id: z.string() }) },
    responses: {
      200: { content: { 'application/json': { schema: OrderWithItemsSchema } }, description: 'OK' },
      404: { description: 'Not found' },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    const { id } = c.req.valid('param')
    const [order] = await db.select().from(orders).where(eq(orders.id, id))
    if (!order) return c.json({ error: 'Order not found' }, 404)

    const items = await db
      .select({ orderItem: orderItems, menuItem: menuItems })
      .from(orderItems)
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .where(eq(orderItems.orderId, id))

    let customer = null
    if (order.customerId) {
      const [cust] = await db.select().from(customers).where(eq(customers.id, order.customerId))
      customer = cust ?? null
    }

    return c.json({
      ...order,
      customer,
      items: items.map(({ orderItem, menuItem }) => ({ ...orderItem, menuItem })),
    })
  }
)

ordersRouter.openapi(
  createRoute({
    method: 'post', path: '/', tags: ['Orders'],
    summary: 'Create order (server validates items and calculates total)',
    request: { body: { content: { 'application/json': { schema: CreateOrderSchema } } } },
    responses: {
      201: { content: { 'application/json': { schema: OrderSchema } }, description: 'Created' },
      400: { description: 'Invalid input or unavailable items' },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    const body = c.req.valid('json')

    // Récupérer tous les items en une requête
    const menuItemIds = body.items.map((i) => i.menuItemId)
    const foundItems = await db.select().from(menuItems).where(inArray(menuItems.id, menuItemIds))

    // Valider + calculer le total via la logique métier pure (testée unitairement)
    const result = validateAndPriceOrder(body.items, foundItems)
    if (!result.ok) {
      return c.json({ error: result.error }, 400)
    }

    const [order] = await db.insert(orders).values({
      customerId: body.customerId,
      type: body.type,
      notes: body.notes,
      totalAmount: result.totalAmount,
      status: 'pending',
    }).returning()

    await db.insert(orderItems).values(
      result.lines.map((line) => ({ orderId: order.id, ...line }))
    )

    return c.json(order, 201)
  }
)

ordersRouter.openapi(
  createRoute({
    method: 'post', path: '/{id}/status', tags: ['Orders'],
    summary: 'Update order status (enforces valid state transitions)',
    request: {
      params: z.object({ id: z.string() }),
      body: {
        content: {
          'application/json': {
            schema: z.object({ status: z.enum(['confirmed','preparing','ready','delivered','cancelled']) }),
          },
        },
      },
    },
    responses: {
      200: { content: { 'application/json': { schema: OrderSchema } }, description: 'Updated' },
      400: { description: 'Invalid transition' },
      404: { description: 'Not found' },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    const { id } = c.req.valid('param')
    const { status: newStatus } = c.req.valid('json')

    const [order] = await db.select().from(orders).where(eq(orders.id, id))
    if (!order) return c.json({ error: 'Order not found' }, 404)

    if (!canTransition(order.status as OrderStatus, newStatus as OrderStatus)) {
      const allowed = VALID_TRANSITIONS[order.status as OrderStatus] ?? []
      return c.json({
        error: `Cannot transition from "${order.status}" to "${newStatus}". Allowed: ${allowed.join(', ') || 'none'}`,
      }, 400)
    }

    const [updated] = await db.update(orders)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(orders.id, id))
      .returning()

    return c.json(updated)
  }
)
