import { defineConfig } from 'drizzle-kit';

if (!process.env.DATABASE_URL_LOCAL) {
  throw new Error('DATABASE_URL_LOCAL not found in environment');
}

export default defineConfig({
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL_LOCAL,
  },
  migrations: { schema: './drizzle' },
  verbose: true,
  strict: true,
});