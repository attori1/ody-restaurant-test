import { OpenAPIHono, createRoute } from '@hono/zod-openapi'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { restaurantSettings } from '../db/schema'
import { createDb } from '../db'
import type { Env } from '../index'

const SettingsSchema = createSelectSchema(restaurantSettings)
const UpdateSettingsSchema = createInsertSchema(restaurantSettings)
  .omit({ id: true, updatedAt: true })
  .partial()

export const settingsRouter = new OpenAPIHono<Env>()

settingsRouter.openapi(
  createRoute({
    method: 'get', path: '/', tags: ['Settings'],
    summary: 'Get restaurant settings',
    responses: { 200: { content: { 'application/json': { schema: SettingsSchema } }, description: 'OK' } },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    let [settings] = await db.select().from(restaurantSettings).limit(1)
    if (!settings) {
      const [created] = await db.insert(restaurantSettings).values({}).returning()
      settings = created
    }
    return c.json(settings)
  }
)

settingsRouter.openapi(
  createRoute({
    method: 'patch', path: '/', tags: ['Settings'],
    summary: 'Update restaurant settings',
    request: { body: { content: { 'application/json': { schema: UpdateSettingsSchema } } } },
    responses: { 200: { content: { 'application/json': { schema: SettingsSchema } }, description: 'Updated' } },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    const body = c.req.valid('json')
    let [settings] = await db.select().from(restaurantSettings).limit(1)
    if (!settings) {
      const [created] = await db.insert(restaurantSettings).values(body).returning()
      return c.json(created)
    }
    const [updated] = await db.update(restaurantSettings)
      .set({ ...body, updatedAt: new Date() })
      .returning()
    return c.json(updated)
  }
)
