import {
  serial,
  timestamp,
  text,
  integer,
  pgSchema,
  boolean,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import type { z } from 'zod';


export const mySchema = pgSchema('pong');

export const user_state = mySchema.enum('user_state', [
  'Online',
  'Offline',
  'In-Game',
  'Idle',
]);

export const users = mySchema.table('users', {
  user_id: serial('user_id').primaryKey(),
  intra_user_id: integer('intra_user_id').notNull().unique(),
  user_name: text('user_name').notNull().unique(),
  nick_name: text('nick_name'),
  token: text('token'),
  email: text('email').notNull().unique(),
  password: text('password'),
  state: user_state('state').notNull().default('Online'),
  image: text('image_url').notNull(),
});

export const friends = mySchema.table('friends', {
  friend_id: serial('friend_id').primaryKey(),
  user_id_send: integer('user_id_send').notNull(),
  user_id_receive: integer('user_id_receive').notNull(),
  is_approved: boolean('is_approved').notNull().default(false),
});

export const games = mySchema.table('games', {
  game_id: serial('game_id').primaryKey(),
  player1_id: integer('player1_id').references(() => users.intra_user_id),
  player2_id: integer('player2_id').references(() => users.intra_user_id),
  player1_score: integer('player1_score'),
  player2_score: integer('player2_score'),
});

export const groupChats = mySchema.table('group_chats', {
  group_chat_id: serial('group_chat_id').primaryKey(),
  group_name: text('group_name').notNull(),
  group_is_public: boolean('group_is_public').default(false),
  group_password: text('group_password'),
  group_image: text('group_image'),
  created_at: timestamp('created_at').defaultNow(),
});

export const groupChatsUsers = mySchema.table('group_chats_users', {
  group_chat_user_id: serial('group_chat_user_id').primaryKey(),
  group_chat_id: integer('group_chat_id').references(
    () => groupChats.group_chat_id,
  ),
  intra_user_id: integer('intra_user_id').references(() => users.intra_user_id),
  is_owner: boolean('is_owner').notNull().default(false),
  is_admin: boolean('is_admin').notNull().default(false),
  is_banned: boolean('is_banned').notNull().default(false),
  mute_untill: timestamp('mute_untill'),
  joined_at: timestamp('joined_at').defaultNow(),
});

export const messages = mySchema.table('messages', {
  message_id: serial('message_id').primaryKey(),
  sender_id: integer('sender_id').references(() => users.intra_user_id),
  receiver_id: integer('receiver_id').references(() => users.intra_user_id),
  group_chat_id: integer('group_chat_id').references(
    () => groupChats.group_chat_id,
  ),
  message: text('message').notNull(),
  sent_at: timestamp('sent_at').defaultNow().notNull(),
});

export const messageStatus = mySchema.table('message_status', {
  message_status_id: serial('message_status_id').primaryKey(),
  message_id: integer('message_id')
    .references(() => messages.message_id)
    .notNull(),
  receiver_id: integer('receiver_id')
    .references(() => users.intra_user_id)
    .notNull(),
  receivet_at: timestamp('receivet_at'),
  read_at: timestamp('read_at'),
});

export const userInsert = createInsertSchema(users);
export const userSelect = createSelectSchema(users);
export const messagesInsert = createInsertSchema(messages);

export type User = z.infer<typeof userSelect>;
