import { createRequire as _createRequire } from "module";
const __require = _createRequire(import.meta.url);
import { users, messages } from './schema.ts';
import { drizzle } from 'drizzle-orm/postgres-js';
const postgres = __require("postgres");
if (!process.env.DATABASE_URL_LOCAL) {
    throw new Error('DATABASE_URL_LOCAL must be set');
}
const queryClient = postgres(process.env.DATABASE_URL_LOCAL);
const db = drizzle(queryClient);
export { users, db, messages };
