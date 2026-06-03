import { OpenAPIHono } from '@hono/zod-openapi'
import { swaggerUI } from '@hono/swagger-ui'
import { cors } from 'hono/cors'
import { menuRouter } from './routes/menu'
import { ordersRouter } from './routes/orders'
import { customersRouter } from './routes/customers'
import { settingsRouter } from './routes/settings'
import { analyticsRouter } from './routes/analytics'

// Les bindings sont les variables d'environnement injectées par Cloudflare Workers.
// En local, elles viennent du fichier .dev.vars
export type Env = {
  Bindings: {
    DATABASE_URL: string
  }
}

const app = new OpenAPIHono<Env>()

// CORS : autorise le dashboard (autre port) à appeler cette API
app.use('*', cors({ origin: '*' }))

app.route('/api/menu', menuRouter)
app.route('/api/orders', ordersRouter)
app.route('/api/customers', customersRouter)
app.route('/api/settings', settingsRouter)
app.route('/api/analytics', analyticsRouter)

// Le schéma OpenAPI — Orval le lit pour générer les types et hooks frontend
app.doc('/openapi.json', {
  openapi: '3.0.0',
  info: {
    title: 'Ody Restaurant API',
    version: '1.0.0',
    description: 'Restaurant operations API',
  },
})

// Interface Swagger pour tester l'API dans le navigateur : http://localhost:8787/docs
app.get('/docs', swaggerUI({ url: '/openapi.json' }))

app.get('/', (c) => c.json({ status: 'ok', message: 'Ody Restaurant API' }))

export default app
