import {
	serial,
	timestamp,
	text,
	integer,
	pgSchema,
	boolean,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { string, type z } from 'zod';


export const mySchema = pgSchema('pong');

export const user_state = mySchema.enum('user_state', [
  'Online',
  'Offline',
  'In-Game',
]);

export const users = mySchema.table('users', {
  intra_user_id: integer('intra_user_id').primaryKey(),
  user_name: text('user_name').notNull().unique(),
  nick_name: text('nick_name'),
  token: text('token'),
  email: text('email').notNull().unique(),
  password: text('password'),
  two_factor_secret: text('two_factor_secret'),
  is_two_factor_enabled: boolean('is_two_factor_enabled').default(false),
  state: user_state('state').notNull().default('Online'),
  image_url: text('image_url').notNull(),
  wins: integer('wins').default(0).notNull(),
  losses: integer('losses').default(0).notNull(),
});

export const friends = mySchema.table('friends', {
	friend_id: serial('friend_id').primaryKey(),
	user_id_send: integer('user_id_send').notNull().references(() => users.intra_user_id),
	user_id_receive: integer('user_id_receive').notNull().references(() => users.intra_user_id),
	is_approved: boolean('is_approved').notNull().default(false),
	invite_game: boolean('invite_game').default(false),
});

export const blocks = mySchema.table('blocks', {
	block_id: serial('block_id').primaryKey(),
	user_id: integer('user_id').notNull().references(() => users.intra_user_id),
	blocked_user_id: integer('blocked_user_id').notNull().references(() => users.intra_user_id),
});

export const games = mySchema.table('games', {
	game_id: serial('game_id').primaryKey(),
	player1_id: integer('player1_id').references(() => users.intra_user_id),
	player2_id: integer('player2_id').references(() => users.intra_user_id),
	player1_score: integer('player1_score'),
	player2_score: integer('player2_score'),
});

export const chats = mySchema.table('chats', {
	chat_id: serial('chat_id').primaryKey().notNull(),
	is_direct: boolean('is_direct').default(false),
	title: text('title').default(''),
	is_public: boolean('is_public').default(false),
	password: text('password'),
	image: text('image'),
	created_at: timestamp('created_at').defaultNow(),
});

export const chatsUsers = mySchema.table('chatsUsers', {
	chat_user_id: serial('chat_user_id').primaryKey(),		// Unique ID for this 
	chat_id: integer('chat_id').references(
		() => chats.chat_id,
	),
	intra_user_id: integer('intra_user_id').references(() => users.intra_user_id),
	is_owner: boolean('is_owner').notNull().default(false),
	is_admin: boolean('is_admin').notNull().default(false),
	is_banned: boolean('is_banned').notNull().default(false),
	mute_untill: timestamp('mute_untill'),
	joined: boolean('joined').notNull().default(false),
	joined_at: timestamp('joined_at').defaultNow(),
});

export const messages = mySchema.table('messages', {
	message_id: serial('message_id').primaryKey(),
	sender_id: integer('sender_id').notNull().references(() => users.intra_user_id),
	chat_id: integer('chat_id').notNull().references(
		() => chats.chat_id,
	),
	message: text('message').notNull(),
	sent_at: timestamp('sent_at').defaultNow().notNull(),
});

export const messageStatus = mySchema.table('messageStatus', {
	message_status_id: serial('message_status_id').primaryKey(),
	message_id: integer('message_id')
		.references(() => messages.message_id)
		.notNull(),
	chat_id: integer('chat_id').notNull().references(
		() => chats.chat_id,
	),
	receiver_id: integer('receiver_id')
		.references(() => users.intra_user_id)
		.notNull(),
	receivet_at: timestamp('receivet_at'),
	read_at: timestamp('read_at'),
});

export const userInsert = createInsertSchema(users);
export const userSelect = createSelectSchema(users);
export const friendsSelect = createSelectSchema(friends);
export const messagesInsert = createSelectSchema(messages);
export const chatSelect = createSelectSchema(chats);
export const chatsUsersSelect = createSelectSchema(chatsUsers);
export const messageStatusInsert = createSelectSchema(messageStatus);
export const blocksSelect = createSelectSchema(blocks);

export type Blocks = z.infer<typeof blocksSelect>;
export type User = z.infer<typeof userSelect>;
export type Friends = z.infer<typeof friendsSelect>;
export type Chats = z.infer<typeof chatSelect>;
export type ChatsUsers = z.infer<typeof chatsUsersSelect>;
export type Messages = z.infer<typeof messagesInsert>;
export type MessageStatus = z.infer<typeof messageStatusInsert>;
