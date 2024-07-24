"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.messagesInsert = exports.userSelect = exports.userInsert = exports.messageStatus = exports.messages = exports.groupChatsUsers = exports.groupChats = exports.games = exports.friends = exports.users = exports.user_state = exports.mySchema = void 0;
var pg_core_1 = require("drizzle-orm/pg-core");
var drizzle_zod_1 = require("drizzle-zod");
exports.mySchema = (0, pg_core_1.pgSchema)('pong');
exports.user_state = exports.mySchema.enum('user_state', [
    'Online',
    'Offline',
    'In-Game',
    'Idle',
]);
exports.users = exports.mySchema.table('users', {
    user_id: (0, pg_core_1.serial)('user_id').primaryKey(),
    intra_user_id: (0, pg_core_1.integer)('intra_user_id').notNull().unique(),
    user_name: (0, pg_core_1.text)('user_name').notNull().unique(),
    nick_name: (0, pg_core_1.text)('nick_name'),
    token: (0, pg_core_1.text)('token'),
    email: (0, pg_core_1.text)('email').notNull().unique(),
    password: (0, pg_core_1.text)('password'),
    state: (0, exports.user_state)('state').notNull().default('Online'),
    image: (0, pg_core_1.text)('image_url').notNull(),
});
exports.friends = exports.mySchema.table('friends', {
    friend_id: (0, pg_core_1.serial)('friend_id').primaryKey(),
    user_id_send: (0, pg_core_1.integer)('user_id_send').notNull(),
    user_id_receive: (0, pg_core_1.integer)('user_id_receive').notNull(),
    is_approved: (0, pg_core_1.boolean)('is_approved').notNull().default(false),
});
exports.games = exports.mySchema.table('games', {
    game_id: (0, pg_core_1.serial)('game_id').primaryKey(),
    player1_id: (0, pg_core_1.integer)('player1_id').references(function () { return exports.users.intra_user_id; }),
    player2_id: (0, pg_core_1.integer)('player2_id').references(function () { return exports.users.intra_user_id; }),
    player1_score: (0, pg_core_1.integer)('player1_score'),
    player2_score: (0, pg_core_1.integer)('player2_score'),
});
exports.groupChats = exports.mySchema.table('group_chats', {
    group_chat_id: (0, pg_core_1.serial)('group_chat_id').primaryKey(),
    group_name: (0, pg_core_1.text)('group_name').notNull(),
    group_is_public: (0, pg_core_1.boolean)('group_is_public').default(false),
    group_password: (0, pg_core_1.text)('group_password'),
    group_image: (0, pg_core_1.text)('group_image'),
    created_at: (0, pg_core_1.timestamp)('created_at').defaultNow(),
});
exports.groupChatsUsers = exports.mySchema.table('group_chats_users', {
    group_chat_user_id: (0, pg_core_1.serial)('group_chat_user_id').primaryKey(),
    group_chat_id: (0, pg_core_1.integer)('group_chat_id').references(function () { return exports.groupChats.group_chat_id; }),
    intra_user_id: (0, pg_core_1.integer)('intra_user_id').references(function () { return exports.users.intra_user_id; }),
    is_owner: (0, pg_core_1.boolean)('is_owner').notNull().default(false),
    is_admin: (0, pg_core_1.boolean)('is_admin').notNull().default(false),
    is_banned: (0, pg_core_1.boolean)('is_banned').notNull().default(false),
    mute_untill: (0, pg_core_1.timestamp)('mute_untill'),
    joined_at: (0, pg_core_1.timestamp)('joined_at').defaultNow(),
});
exports.messages = exports.mySchema.table('messages', {
    message_id: (0, pg_core_1.serial)('message_id').primaryKey(),
    sender_id: (0, pg_core_1.integer)('sender_id').references(function () { return exports.users.intra_user_id; }),
    receiver_id: (0, pg_core_1.integer)('receiver_id').references(function () { return exports.users.intra_user_id; }),
    group_chat_id: (0, pg_core_1.integer)('group_chat_id').references(function () { return exports.groupChats.group_chat_id; }),
    message: (0, pg_core_1.text)('message').notNull(),
    sent_at: (0, pg_core_1.timestamp)('sent_at').defaultNow().notNull(),
});
exports.messageStatus = exports.mySchema.table('message_status', {
    message_status_id: (0, pg_core_1.serial)('message_status_id').primaryKey(),
    message_id: (0, pg_core_1.integer)('message_id')
        .references(function () { return exports.messages.message_id; })
        .notNull(),
    receiver_id: (0, pg_core_1.integer)('receiver_id')
        .references(function () { return exports.users.intra_user_id; })
        .notNull(),
    receivet_at: (0, pg_core_1.timestamp)('receivet_at'),
    read_at: (0, pg_core_1.timestamp)('read_at'),
});
exports.userInsert = (0, drizzle_zod_1.createInsertSchema)(exports.users);
exports.userSelect = (0, drizzle_zod_1.createSelectSchema)(exports.users);
exports.messagesInsert = (0, drizzle_zod_1.createInsertSchema)(exports.messages);
