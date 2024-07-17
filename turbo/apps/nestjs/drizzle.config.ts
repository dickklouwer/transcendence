import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './drizzle/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_LOCAL,
  },
  migrations: { schema: './drizzle' },
  verbose: true,
  strict: true,
});