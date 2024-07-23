import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_LOCAL as string,
  },
  migrations: { schema: './migrations' },
  verbose: true,
  strict: true,
});