import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { eq, gte, sql } from 'drizzle-orm'
import { orders, orderItems, menuItems } from '../db/schema'
import { createDb } from '../db'
import type { Env } from '../index'

const KpiSchema = z.object({
  totalOrders: z.number(),
  totalRevenue: z.string(),
  pendingOrders: z.number(),
  todayOrders: z.number(),
  todayRevenue: z.string(),
  popularItems: z.array(z.object({
    id: z.string(),
    name: z.string(),
    totalSold: z.number(),
  })),
})

export const analyticsRouter = new OpenAPIHono<Env>()

analyticsRouter.openapi(
  createRoute({
    method: 'get', path: '/kpis', tags: ['Analytics'],
    summary: 'Dashboard KPIs',
    responses: { 200: { content: { 'application/json': { schema: KpiSchema } }, description: 'OK' } },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    const todayStart = new Date()
    todayStart.setHours(0, 0, 0, 0)

    const [totals] = await db.select({
      totalOrders: sql<number>`count(*)::int`,
      totalRevenue: sql<string>`coalesce(sum(${orders.totalAmount}), 0)::text`,
      pendingOrders: sql<number>`count(*) filter (where ${orders.status} = 'pending')::int`,
    }).from(orders)

    const [today] = await db.select({
      todayOrders: sql<number>`count(*)::int`,
      todayRevenue: sql<string>`coalesce(sum(${orders.totalAmount}), 0)::text`,
    }).from(orders).where(gte(orders.createdAt, todayStart))

    const popularItems = await db
      .select({
        id: menuItems.id, name: menuItems.name,
        totalSold: sql<number>`sum(${orderItems.quantity})::int`,
      })
      .from(orderItems)
      .innerJoin(menuItems, eq(orderItems.menuItemId, menuItems.id))
      .groupBy(menuItems.id, menuItems.name)
      .orderBy(sql`sum(${orderItems.quantity}) desc`)
      .limit(5)

    return c.json({
      totalOrders: totals?.totalOrders ?? 0,
      totalRevenue: totals?.totalRevenue ?? '0',
      pendingOrders: totals?.pendingOrders ?? 0,
      todayOrders: today?.todayOrders ?? 0,
      todayRevenue: today?.todayRevenue ?? '0',
      popularItems,
    })
  }
)
