var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/index.ts
var src_exports = {};
__export(src_exports, {
  createDrizzleClient: () => createDrizzleClient,
  createQueryClient: () => createQueryClient,
  groupChats: () => groupChats,
  messages: () => messages,
  users: () => users
});
module.exports = __toCommonJS(src_exports);

// src/schema.ts
var import_pg_core = require("drizzle-orm/pg-core");
var import_drizzle_zod = require("drizzle-zod");
var mySchema = (0, import_pg_core.pgSchema)("pong");
var user_state = mySchema.enum("user_state", [
  "Online",
  "Offline",
  "In-Game",
  "Idle"
]);
var users = mySchema.table("users", {
  user_id: (0, import_pg_core.serial)("user_id").primaryKey(),
  intra_user_id: (0, import_pg_core.integer)("intra_user_id").notNull().unique(),
  user_name: (0, import_pg_core.text)("user_name").notNull().unique(),
  nick_name: (0, import_pg_core.text)("nick_name"),
  token: (0, import_pg_core.text)("token"),
  email: (0, import_pg_core.text)("email").notNull().unique(),
  password: (0, import_pg_core.text)("password"),
  two_factor_secret: (0, import_pg_core.text)("two_factor_secret"),
  is_two_factor_enabled: (0, import_pg_core.boolean)("is_two_factor_enabled").default(false),
  state: user_state("state").notNull().default("Online"),
  image: (0, import_pg_core.text)("image_url").notNull()
});
var friends = mySchema.table("friends", {
  friend_id: (0, import_pg_core.serial)("friend_id").primaryKey(),
  user_id_send: (0, import_pg_core.integer)("user_id_send").notNull(),
  user_id_receive: (0, import_pg_core.integer)("user_id_receive").notNull(),
  is_approved: (0, import_pg_core.boolean)("is_approved").notNull().default(false)
});
var games = mySchema.table("games", {
  game_id: (0, import_pg_core.serial)("game_id").primaryKey(),
  player1_id: (0, import_pg_core.integer)("player1_id").references(() => users.intra_user_id),
  player2_id: (0, import_pg_core.integer)("player2_id").references(() => users.intra_user_id),
  player1_score: (0, import_pg_core.integer)("player1_score"),
  player2_score: (0, import_pg_core.integer)("player2_score")
});
var groupChats = mySchema.table("group_chats", {
  group_chat_id: (0, import_pg_core.serial)("group_chat_id").primaryKey(),
  group_name: (0, import_pg_core.text)("group_name").notNull(),
  group_is_public: (0, import_pg_core.boolean)("group_is_public").default(false),
  group_password: (0, import_pg_core.text)("group_password"),
  group_image: (0, import_pg_core.text)("group_image"),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var groupChatsUsers = mySchema.table("group_chats_users", {
  group_chat_user_id: (0, import_pg_core.serial)("group_chat_user_id").primaryKey(),
  group_chat_id: (0, import_pg_core.integer)("group_chat_id").references(
    () => groupChats.group_chat_id
  ),
  intra_user_id: (0, import_pg_core.integer)("intra_user_id").references(() => users.intra_user_id),
  is_owner: (0, import_pg_core.boolean)("is_owner").notNull().default(false),
  is_admin: (0, import_pg_core.boolean)("is_admin").notNull().default(false),
  is_banned: (0, import_pg_core.boolean)("is_banned").notNull().default(false),
  mute_untill: (0, import_pg_core.timestamp)("mute_untill"),
  joined_at: (0, import_pg_core.timestamp)("joined_at").defaultNow()
});
var messages = mySchema.table("messages", {
  message_id: (0, import_pg_core.serial)("message_id").primaryKey(),
  sender_id: (0, import_pg_core.integer)("sender_id").references(() => users.intra_user_id),
  receiver_id: (0, import_pg_core.integer)("receiver_id").references(() => users.intra_user_id),
  group_chat_id: (0, import_pg_core.integer)("group_chat_id").references(
    () => groupChats.group_chat_id
  ),
  message: (0, import_pg_core.text)("message").notNull(),
  sent_at: (0, import_pg_core.timestamp)("sent_at").defaultNow().notNull()
});
var messageStatus = mySchema.table("message_status", {
  message_status_id: (0, import_pg_core.serial)("message_status_id").primaryKey(),
  message_id: (0, import_pg_core.integer)("message_id").references(() => messages.message_id).notNull(),
  receiver_id: (0, import_pg_core.integer)("receiver_id").references(() => users.intra_user_id).notNull(),
  receivet_at: (0, import_pg_core.timestamp)("receivet_at"),
  read_at: (0, import_pg_core.timestamp)("read_at")
});
var userInsert = (0, import_drizzle_zod.createInsertSchema)(users);
var userSelect = (0, import_drizzle_zod.createSelectSchema)(users);
var messagesInsert = (0, import_drizzle_zod.createInsertSchema)(messages);

// src/index.ts
var import_postgres_js = require("drizzle-orm/postgres-js");
var import_postgres = __toESM(require("postgres"));
var createQueryClient = (input) => (0, import_postgres.default)(input);
var createDrizzleClient = (client) => (0, import_postgres_js.drizzle)(client);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  createDrizzleClient,
  createQueryClient,
  groupChats,
  messages,
  users
});
