import { OpenAPIHono, createRoute, z } from '@hono/zod-openapi'
import { eq } from 'drizzle-orm'
import { createInsertSchema, createSelectSchema } from 'drizzle-zod'
import { menuCategories, menuItems } from '../db/schema'
import { createDb } from '../db'
import type { Env } from '../index'

// drizzle-zod génère ces schémas Zod automatiquement depuis le schéma Drizzle.
// On ne les écrit jamais à la main.
const MenuCategorySchema = createSelectSchema(menuCategories)
const InsertMenuCategorySchema = createInsertSchema(menuCategories).omit({
  id: true, createdAt: true, updatedAt: true,
})

const MenuItemSchema = createSelectSchema(menuItems)
const InsertMenuItemSchema = createInsertSchema(menuItems).omit({
  id: true, createdAt: true, updatedAt: true,
})
const UpdateMenuItemSchema = InsertMenuItemSchema.partial()

export const menuRouter = new OpenAPIHono<Env>()

menuRouter.openapi(
  createRoute({
    method: 'get', path: '/categories', tags: ['Menu'],
    summary: 'List all menu categories',
    responses: { 200: { content: { 'application/json': { schema: z.array(MenuCategorySchema) } }, description: 'OK' } },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    const categories = await db.select().from(menuCategories).orderBy(menuCategories.position)
    return c.json(categories)
  }
)

menuRouter.openapi(
  createRoute({
    method: 'post', path: '/categories', tags: ['Menu'],
    summary: 'Create a menu category',
    request: { body: { content: { 'application/json': { schema: InsertMenuCategorySchema } } } },
    responses: {
      201: { content: { 'application/json': { schema: MenuCategorySchema } }, description: 'Created' },
      400: { description: 'Invalid input' },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    const body = c.req.valid('json')
    const [category] = await db.insert(menuCategories).values(body).returning()
    return c.json(category, 201)
  }
)

menuRouter.openapi(
  createRoute({
    method: 'get', path: '/items', tags: ['Menu'],
    summary: 'List menu items',
    request: {
      query: z.object({
        categoryId: z.string().optional(),
        available: z.enum(['true', 'false']).optional(),
      }),
    },
    responses: { 200: { content: { 'application/json': { schema: z.array(MenuItemSchema) } }, description: 'OK' } },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    const { categoryId, available } = c.req.valid('query')
    let query = db.select().from(menuItems).$dynamic()
    if (categoryId) query = query.where(eq(menuItems.categoryId, categoryId))
    if (available !== undefined) query = query.where(eq(menuItems.available, available === 'true'))
    return c.json(await query)
  }
)

menuRouter.openapi(
  createRoute({
    method: 'post', path: '/items', tags: ['Menu'],
    summary: 'Create a menu item',
    request: { body: { content: { 'application/json': { schema: InsertMenuItemSchema } } } },
    responses: {
      201: { content: { 'application/json': { schema: MenuItemSchema } }, description: 'Created' },
      400: { description: 'Invalid input' },
      404: { description: 'Category not found' },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    const body = c.req.valid('json')
    const [category] = await db.select().from(menuCategories).where(eq(menuCategories.id, body.categoryId))
    if (!category) return c.json({ error: 'Category not found' }, 404)
    const [item] = await db.insert(menuItems).values(body).returning()
    return c.json(item, 201)
  }
)

menuRouter.openapi(
  createRoute({
    method: 'patch', path: '/items/{id}', tags: ['Menu'],
    summary: 'Update a menu item',
    request: {
      params: z.object({ id: z.string() }),
      body: { content: { 'application/json': { schema: UpdateMenuItemSchema } } },
    },
    responses: {
      200: { content: { 'application/json': { schema: MenuItemSchema } }, description: 'Updated' },
      404: { description: 'Not found' },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    const { id } = c.req.valid('param')
    const body = c.req.valid('json')
    const [item] = await db.update(menuItems).set({ ...body, updatedAt: new Date() }).where(eq(menuItems.id, id)).returning()
    if (!item) return c.json({ error: 'Item not found' }, 404)
    return c.json(item)
  }
)

menuRouter.openapi(
  createRoute({
    method: 'delete', path: '/items/{id}', tags: ['Menu'],
    summary: 'Delete a menu item',
    request: { params: z.object({ id: z.string() }) },
    responses: {
      204: { description: 'Deleted' },
      404: { description: 'Not found' },
      409: { description: 'Item is referenced by existing orders' },
    },
  }),
  async (c) => {
    const db = createDb(c.env.DATABASE_URL)
    const { id } = c.req.valid('param')
    try {
      const [item] = await db.delete(menuItems).where(eq(menuItems.id, id)).returning()
      if (!item) return c.json({ error: 'Item not found' }, 404)
      return c.body(null, 204)
    } catch (err: unknown) {
      // Un plat présent dans une commande ne peut pas être supprimé (clé étrangère).
      // On renvoie un 409 explicite plutôt qu'un 500 — l'UI peut alors suggérer
      // de le rendre indisponible (toggle) au lieu de le supprimer.
      if (err instanceof Error && /foreign key|violates/i.test(err.message)) {
        return c.json(
          { error: 'This item is used in existing orders. Set it as unavailable instead of deleting it.' },
          409
        )
      }
      throw err
    }
  }
)
