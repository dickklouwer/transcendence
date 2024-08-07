import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  schema: './src/schema.ts',
  dialect: 'postgresql',
  dbCredentials: {
    url: "postgres://postgres:postgres@localhost:5432/postgres"
  },
  migrations: { schema: './drizzle' },
  verbose: true,
  strict: true,
});