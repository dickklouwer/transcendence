import { serial, text, pgTable, pgSchema } from 'drizzle-orm/pg-core';

export const mySchema = pgSchema('pong');

export const user = pgTable('user', {
  id: serial('user_id').primaryKey(),
  name: text('name').notNull().unique(),
  email: text('email').notNull().unique(),
  image: text('image_url'),
});
