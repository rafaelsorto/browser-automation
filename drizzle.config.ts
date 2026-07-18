import { config } from 'dotenv'
import { defineConfig } from 'drizzle-kit'

config({ path: '.env' })

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL

if (!url) {
  throw new Error('DATABASE_URL (or DATABASE_URL_UNPOOLED) is not set in .env')
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url,
  },
})
