import { defineConfig } from 'drizzle-kit'
import { config } from 'dotenv'

// Pour drizzle-kit, on lit le fichier .dev.vars (équivalent .env pour Cloudflare Workers)
config({ path: '.dev.vars' })

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
})
