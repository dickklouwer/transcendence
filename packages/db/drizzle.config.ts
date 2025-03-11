import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({
  path: '../../.env',
});

if (!process.env.DATABASE_URL_LOCAL) {
  throw new Error('cannot read .env OR DATABASE_URL_LOCAL is not set');
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