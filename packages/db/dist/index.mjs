// src/schema.ts
import {
  serial,
  timestamp,
  text,
  integer,
  pgSchema,
  boolean
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
var mySchema = pgSchema("pong");
var user_state = mySchema.enum("user_state", [
  "Online",
  "Offline",
  "In-Game",
  "Idle"
]);
var users = mySchema.table("users", {
  intra_user_id: integer("intra_user_id").primaryKey(),
  user_name: text("user_name").notNull().unique(),
  nick_name: text("nick_name"),
  token: text("token"),
  email: text("email").notNull().unique(),
  password: text("password"),
  two_factor_secret: text("two_factor_secret"),
  is_two_factor_enabled: boolean("is_two_factor_enabled").default(false),
  state: user_state("state").notNull().default("Online"),
  image: text("image_url").notNull()
});
var friends = mySchema.table("friends", {
  friend_id: serial("friend_id").primaryKey(),
  user_id_send: integer("user_id_send").notNull().references(() => users.intra_user_id),
  user_id_receive: integer("user_id_receive").references(() => users.intra_user_id),
  is_approved: boolean("is_approved").notNull().default(false)
});
var games = mySchema.table("games", {
  game_id: serial("game_id").primaryKey(),
  player1_id: integer("player1_id").references(() => users.intra_user_id),
  player2_id: integer("player2_id").references(() => users.intra_user_id),
  player1_score: integer("player1_score"),
  player2_score: integer("player2_score")
});
var groupChats = mySchema.table("group_chats", {
  group_chat_id: serial("group_chat_id").primaryKey(),
  group_name: text("group_name").notNull(),
  group_is_public: boolean("group_is_public").default(false),
  group_password: text("group_password"),
  group_image: text("group_image"),
  created_at: timestamp("created_at").defaultNow()
});
var groupChatsUsers = mySchema.table("group_chats_users", {
  group_chat_user_id: serial("group_chat_user_id").primaryKey(),
  group_chat_id: integer("group_chat_id").references(
    () => groupChats.group_chat_id
  ),
  intra_user_id: integer("intra_user_id").references(() => users.intra_user_id),
  is_owner: boolean("is_owner").notNull().default(false),
  is_admin: boolean("is_admin").notNull().default(false),
  is_banned: boolean("is_banned").notNull().default(false),
  mute_untill: timestamp("mute_untill"),
  joined_at: timestamp("joined_at").defaultNow()
});
var messages = mySchema.table("messages", {
  message_id: serial("message_id").primaryKey(),
  sender_id: integer("sender_id").references(() => users.intra_user_id),
  receiver_id: integer("receiver_id").references(() => users.intra_user_id),
  group_chat_id: integer("group_chat_id").references(
    () => groupChats.group_chat_id
  ),
  message: text("message").notNull(),
  sent_at: timestamp("sent_at").defaultNow().notNull()
});
var messageStatus = mySchema.table("message_status", {
  message_status_id: serial("message_status_id").primaryKey(),
  message_id: integer("message_id").references(() => messages.message_id).notNull(),
  receiver_id: integer("receiver_id").references(() => users.intra_user_id).notNull(),
  receivet_at: timestamp("receivet_at"),
  read_at: timestamp("read_at")
});
var userInsert = createInsertSchema(users);
var userSelect = createSelectSchema(users);
var friendsSelect = createSelectSchema(friends);
var messagesInsert = createInsertSchema(messages);

// src/index.ts
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
var createQueryClient = (input) => postgres(input);
var createDrizzleClient = (client) => drizzle(client);
export {
  createDrizzleClient,
  createQueryClient,
  friends,
  groupChats,
  messages,
  users
};
