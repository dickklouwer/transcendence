import { is } from 'drizzle-orm';
import {
  serial,
  timestamp,
  text,
  integer,
  pgSchema,
  boolean,
} from 'drizzle-orm/pg-core';

export const mySchema = pgSchema('pong');

const user_state = mySchema.enum('user_state', [
  'Online',
  'Offline',
  'In-Game',
  'Idle',
]);
jfslkdj fdsjlfjdslfjdsljfdsjlkfsjdlkfjdslk
export const users = mySchema.table('user', {
  intra_user_id: integer('intra_user_id').primaryKey(),
  name: text('name').notNull().unique(),
  token: text('token').notNull().unique(),
  email: text('email').notNull().unique(),
  state: user_state('state').notNull().default('Online'),
  image: text('image_url'),
});

export const friends = mySchema.table('friends', {
  user_id_one: integer('user_id_one').notNull(),
  user_id_two: integer('user_id_two').notNull(),
  is_approved: boolean('is_approved').notNull().default(false), 
});

export const groupChats = mySchema.table('group_chats', {
  group_chat_id: serial('group_chat_id').primaryKey(),
  group_name: text('group_name').notNull(),
  group_password: text('group_password').notNull(),
  created_at: timestamp('created_at').defaultNow(),
});

export const UserGroupChats = mySchema.table('user_group_chats', {
  group_chat_id: integer('group_chat_id')
    .primaryKey()
    .references(() => groupChats.group_chat_id),
  intra_user_id: integer('intra_user_id').references(() => users.intra_user_id),
  is_owner: boolean('is_owner').notNull().default(false),
  is_admin: boolean('is_admin').notNull().default(false),
  is_banned: boolean('is_banned').notNull().default(false),
  mute_untill: timestamp('mute_untill').default(null),
  joined_at: timestamp('joined_at').defaultNow(),
});

export const Messages = mySchema.table('messages', {
  message_id: serial('message_id').primaryKey(),
  sender_id: integer('sender_id').references(() => users.intra_user_id),
  reciever_id: integer('reciever_id'),
  group_chat_id: integer('group_chat_id'),
  message: text('message').notNull(),
  sent_at: timestamp('sent_at').defaultNow(),
});

