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
  chats: () => chats,
  chatsUsers: () => chatsUsers,
  createDrizzleClient: () => createDrizzleClient,
  createQueryClient: () => createQueryClient,
  friends: () => friends,
  games: () => games,
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
  intra_user_id: (0, import_pg_core.integer)("intra_user_id").primaryKey(),
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
  user_id_send: (0, import_pg_core.integer)("user_id_send").notNull().references(() => users.intra_user_id),
  user_id_receive: (0, import_pg_core.integer)("user_id_receive").notNull().references(() => users.intra_user_id),
  is_approved: (0, import_pg_core.boolean)("is_approved").notNull().default(false)
});
var games = mySchema.table("games", {
  game_id: (0, import_pg_core.serial)("game_id").primaryKey(),
  player1_id: (0, import_pg_core.integer)("player1_id").references(() => users.intra_user_id),
  player2_id: (0, import_pg_core.integer)("player2_id").references(() => users.intra_user_id),
  player1_score: (0, import_pg_core.integer)("player1_score"),
  player2_score: (0, import_pg_core.integer)("player2_score")
});
var chats = mySchema.table("chats", {
  chat_id: (0, import_pg_core.serial)("chat_id").primaryKey(),
  is_direct: (0, import_pg_core.boolean)("is_direct").default(false),
  title: (0, import_pg_core.text)("title").notNull(),
  // NOTE:  @bprovos Should this be able to be NULL? when a non group message message we don't need a 
  is_public: (0, import_pg_core.boolean)("is_public").default(false),
  password: (0, import_pg_core.text)("password"),
  image: (0, import_pg_core.text)("image"),
  created_at: (0, import_pg_core.timestamp)("created_at").defaultNow()
});
var chatsUsers = mySchema.table("chatsUsers", {
  chat_user_id: (0, import_pg_core.serial)("chat_user_id").primaryKey(),
  //TODO: See if DB is workable without chat_user_id. rightnow it's only function is to have a primarykey (idk what that means).
  chat_id: (0, import_pg_core.integer)("chat_id").notNull().references(
    () => chats.chat_id
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
  chat_id: (0, import_pg_core.integer)("chat_id").references(
    () => chats.chat_id
  ),
  message: (0, import_pg_core.text)("message").notNull(),
  sent_at: (0, import_pg_core.timestamp)("sent_at").defaultNow().notNull()
});
var messageStatus = mySchema.table("messageStatus", {
  message_status_id: (0, import_pg_core.serial)("message_status_id").primaryKey(),
  message_id: (0, import_pg_core.integer)("message_id").references(() => messages.message_id).notNull(),
  receiver_id: (0, import_pg_core.integer)("receiver_id").references(() => users.intra_user_id).notNull(),
  receivet_at: (0, import_pg_core.timestamp)("receivet_at"),
  read_at: (0, import_pg_core.timestamp)("read_at")
});
var userInsert = (0, import_drizzle_zod.createInsertSchema)(users);
var userSelect = (0, import_drizzle_zod.createSelectSchema)(users);
var friendsSelect = (0, import_drizzle_zod.createSelectSchema)(friends);
var messagesInsert = (0, import_drizzle_zod.createInsertSchema)(messages);
var chatsSelect = (0, import_drizzle_zod.createSelectSchema)(chats);
var chatsUsersSelect = (0, import_drizzle_zod.createSelectSchema)(chatsUsers);

// src/index.ts
var import_postgres_js = require("drizzle-orm/postgres-js");
var import_postgres = __toESM(require("postgres"));
var createQueryClient = (input) => (0, import_postgres.default)(input);
var createDrizzleClient = (client) => (0, import_postgres_js.drizzle)(client);
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  chats,
  chatsUsers,
  createDrizzleClient,
  createQueryClient,
  friends,
  games,
  messages,
  users
});
