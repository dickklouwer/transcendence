import * as drizzle_orm_postgres_js from 'drizzle-orm/postgres-js';
import * as drizzle_orm_pg_core from 'drizzle-orm/pg-core';
import { z } from 'zod';
import postgres from 'postgres';

declare const users: drizzle_orm_pg_core.PgTableWithColumns<{
    name: "users";
    schema: "pong";
    columns: {
        intra_user_id: drizzle_orm_pg_core.PgColumn<{
            name: "intra_user_id";
            tableName: "users";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        user_name: drizzle_orm_pg_core.PgColumn<{
            name: "user_name";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        nick_name: drizzle_orm_pg_core.PgColumn<{
            name: "nick_name";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        token: drizzle_orm_pg_core.PgColumn<{
            name: "token";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        email: drizzle_orm_pg_core.PgColumn<{
            name: "email";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        password: drizzle_orm_pg_core.PgColumn<{
            name: "password";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        two_factor_secret: drizzle_orm_pg_core.PgColumn<{
            name: "two_factor_secret";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        is_two_factor_enabled: drizzle_orm_pg_core.PgColumn<{
            name: "is_two_factor_enabled";
            tableName: "users";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        state: drizzle_orm_pg_core.PgColumn<{
            name: "state";
            tableName: "users";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "Online" | "Offline" | "In-Game";
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["Online", "Offline", "In-Game"];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        image_url: drizzle_orm_pg_core.PgColumn<{
            name: "image_url";
            tableName: "users";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        wins: drizzle_orm_pg_core.PgColumn<{
            name: "wins";
            tableName: "users";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        losses: drizzle_orm_pg_core.PgColumn<{
            name: "losses";
            tableName: "users";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
declare const friends: drizzle_orm_pg_core.PgTableWithColumns<{
    name: "friends";
    schema: "pong";
    columns: {
        friend_id: drizzle_orm_pg_core.PgColumn<{
            name: "friend_id";
            tableName: "friends";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        user_id_send: drizzle_orm_pg_core.PgColumn<{
            name: "user_id_send";
            tableName: "friends";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        user_id_receive: drizzle_orm_pg_core.PgColumn<{
            name: "user_id_receive";
            tableName: "friends";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        is_approved: drizzle_orm_pg_core.PgColumn<{
            name: "is_approved";
            tableName: "friends";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        invite_game: drizzle_orm_pg_core.PgColumn<{
            name: "invite_game";
            tableName: "friends";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
declare const blocks: drizzle_orm_pg_core.PgTableWithColumns<{
    name: "blocks";
    schema: "pong";
    columns: {
        block_id: drizzle_orm_pg_core.PgColumn<{
            name: "block_id";
            tableName: "blocks";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        user_id: drizzle_orm_pg_core.PgColumn<{
            name: "user_id";
            tableName: "blocks";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        blocked_user_id: drizzle_orm_pg_core.PgColumn<{
            name: "blocked_user_id";
            tableName: "blocks";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
declare const games: drizzle_orm_pg_core.PgTableWithColumns<{
    name: "games";
    schema: "pong";
    columns: {
        game_id: drizzle_orm_pg_core.PgColumn<{
            name: "game_id";
            tableName: "games";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        player1_id: drizzle_orm_pg_core.PgColumn<{
            name: "player1_id";
            tableName: "games";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        player2_id: drizzle_orm_pg_core.PgColumn<{
            name: "player2_id";
            tableName: "games";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        player1_score: drizzle_orm_pg_core.PgColumn<{
            name: "player1_score";
            tableName: "games";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        player2_score: drizzle_orm_pg_core.PgColumn<{
            name: "player2_score";
            tableName: "games";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
declare const chats: drizzle_orm_pg_core.PgTableWithColumns<{
    name: "chats";
    schema: "pong";
    columns: {
        chat_id: drizzle_orm_pg_core.PgColumn<{
            name: "chat_id";
            tableName: "chats";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        is_direct: drizzle_orm_pg_core.PgColumn<{
            name: "is_direct";
            tableName: "chats";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        title: drizzle_orm_pg_core.PgColumn<{
            name: "title";
            tableName: "chats";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        is_public: drizzle_orm_pg_core.PgColumn<{
            name: "is_public";
            tableName: "chats";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        password: drizzle_orm_pg_core.PgColumn<{
            name: "password";
            tableName: "chats";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        image: drizzle_orm_pg_core.PgColumn<{
            name: "image";
            tableName: "chats";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        created_at: drizzle_orm_pg_core.PgColumn<{
            name: "created_at";
            tableName: "chats";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
declare const chatsUsers: drizzle_orm_pg_core.PgTableWithColumns<{
    name: "chatsUsers";
    schema: "pong";
    columns: {
        chat_user_id: drizzle_orm_pg_core.PgColumn<{
            name: "chat_user_id";
            tableName: "chatsUsers";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        chat_id: drizzle_orm_pg_core.PgColumn<{
            name: "chat_id";
            tableName: "chatsUsers";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        intra_user_id: drizzle_orm_pg_core.PgColumn<{
            name: "intra_user_id";
            tableName: "chatsUsers";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        is_owner: drizzle_orm_pg_core.PgColumn<{
            name: "is_owner";
            tableName: "chatsUsers";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        is_admin: drizzle_orm_pg_core.PgColumn<{
            name: "is_admin";
            tableName: "chatsUsers";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        is_banned: drizzle_orm_pg_core.PgColumn<{
            name: "is_banned";
            tableName: "chatsUsers";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        mute_untill: drizzle_orm_pg_core.PgColumn<{
            name: "mute_untill";
            tableName: "chatsUsers";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        joined: drizzle_orm_pg_core.PgColumn<{
            name: "joined";
            tableName: "chatsUsers";
            dataType: "boolean";
            columnType: "PgBoolean";
            data: boolean;
            driverParam: boolean;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        joined_at: drizzle_orm_pg_core.PgColumn<{
            name: "joined_at";
            tableName: "chatsUsers";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
declare const messages: drizzle_orm_pg_core.PgTableWithColumns<{
    name: "messages";
    schema: "pong";
    columns: {
        message_id: drizzle_orm_pg_core.PgColumn<{
            name: "message_id";
            tableName: "messages";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        sender_id: drizzle_orm_pg_core.PgColumn<{
            name: "sender_id";
            tableName: "messages";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        chat_id: drizzle_orm_pg_core.PgColumn<{
            name: "chat_id";
            tableName: "messages";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        message: drizzle_orm_pg_core.PgColumn<{
            name: "message";
            tableName: "messages";
            dataType: "string";
            columnType: "PgText";
            data: string;
            driverParam: string;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: [string, ...string[]];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        sent_at: drizzle_orm_pg_core.PgColumn<{
            name: "sent_at";
            tableName: "messages";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
declare const messageStatus: drizzle_orm_pg_core.PgTableWithColumns<{
    name: "messageStatus";
    schema: "pong";
    columns: {
        message_status_id: drizzle_orm_pg_core.PgColumn<{
            name: "message_status_id";
            tableName: "messageStatus";
            dataType: "number";
            columnType: "PgSerial";
            data: number;
            driverParam: number;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: true;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        message_id: drizzle_orm_pg_core.PgColumn<{
            name: "message_id";
            tableName: "messageStatus";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        chat_id: drizzle_orm_pg_core.PgColumn<{
            name: "chat_id";
            tableName: "messageStatus";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        receiver_id: drizzle_orm_pg_core.PgColumn<{
            name: "receiver_id";
            tableName: "messageStatus";
            dataType: "number";
            columnType: "PgInteger";
            data: number;
            driverParam: string | number;
            notNull: true;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        receivet_at: drizzle_orm_pg_core.PgColumn<{
            name: "receivet_at";
            tableName: "messageStatus";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        read_at: drizzle_orm_pg_core.PgColumn<{
            name: "read_at";
            tableName: "messageStatus";
            dataType: "date";
            columnType: "PgTimestamp";
            data: Date;
            driverParam: string;
            notNull: false;
            hasDefault: false;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: undefined;
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
    };
    dialect: "pg";
}>;
declare const userSelect: z.ZodObject<{
    intra_user_id: z.ZodNumber;
    user_name: z.ZodString;
    nick_name: z.ZodNullable<z.ZodString>;
    token: z.ZodNullable<z.ZodString>;
    email: z.ZodString;
    password: z.ZodNullable<z.ZodString>;
    two_factor_secret: z.ZodNullable<z.ZodString>;
    is_two_factor_enabled: z.ZodNullable<z.ZodBoolean>;
    state: z.ZodEnum<["Online", "Offline", "In-Game"]>;
    image_url: z.ZodString;
    wins: z.ZodNumber;
    losses: z.ZodNumber;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    password: string | null;
    intra_user_id: number;
    user_name: string;
    nick_name: string | null;
    token: string | null;
    email: string;
    two_factor_secret: string | null;
    is_two_factor_enabled: boolean | null;
    state: "Online" | "Offline" | "In-Game";
    image_url: string;
    wins: number;
    losses: number;
}, {
    password: string | null;
    intra_user_id: number;
    user_name: string;
    nick_name: string | null;
    token: string | null;
    email: string;
    two_factor_secret: string | null;
    is_two_factor_enabled: boolean | null;
    state: "Online" | "Offline" | "In-Game";
    image_url: string;
    wins: number;
    losses: number;
}>;
declare const friendsSelect: z.ZodObject<{
    friend_id: z.ZodNumber;
    user_id_send: z.ZodNumber;
    user_id_receive: z.ZodNumber;
    is_approved: z.ZodBoolean;
    invite_game: z.ZodNullable<z.ZodBoolean>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    friend_id: number;
    user_id_send: number;
    user_id_receive: number;
    is_approved: boolean;
    invite_game: boolean | null;
}, {
    friend_id: number;
    user_id_send: number;
    user_id_receive: number;
    is_approved: boolean;
    invite_game: boolean | null;
}>;
declare const messagesInsert: z.ZodObject<{
    message_id: z.ZodNumber;
    sender_id: z.ZodNumber;
    chat_id: z.ZodNumber;
    message: z.ZodString;
    sent_at: z.ZodDate;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    chat_id: number;
    message: string;
    message_id: number;
    sender_id: number;
    sent_at: Date;
}, {
    chat_id: number;
    message: string;
    message_id: number;
    sender_id: number;
    sent_at: Date;
}>;
declare const chatSelect: z.ZodObject<{
    chat_id: z.ZodNumber;
    is_direct: z.ZodNullable<z.ZodBoolean>;
    title: z.ZodNullable<z.ZodString>;
    is_public: z.ZodNullable<z.ZodBoolean>;
    password: z.ZodNullable<z.ZodString>;
    image: z.ZodNullable<z.ZodString>;
    created_at: z.ZodNullable<z.ZodDate>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    chat_id: number;
    is_direct: boolean | null;
    title: string | null;
    is_public: boolean | null;
    password: string | null;
    image: string | null;
    created_at: Date | null;
}, {
    chat_id: number;
    is_direct: boolean | null;
    title: string | null;
    is_public: boolean | null;
    password: string | null;
    image: string | null;
    created_at: Date | null;
}>;
declare const chatsUsersSelect: z.ZodObject<{
    chat_user_id: z.ZodNumber;
    chat_id: z.ZodNullable<z.ZodNumber>;
    intra_user_id: z.ZodNullable<z.ZodNumber>;
    is_owner: z.ZodBoolean;
    is_admin: z.ZodBoolean;
    is_banned: z.ZodBoolean;
    mute_untill: z.ZodNullable<z.ZodDate>;
    joined: z.ZodBoolean;
    joined_at: z.ZodNullable<z.ZodDate>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    chat_user_id: number;
    chat_id: number | null;
    intra_user_id: number | null;
    is_owner: boolean;
    is_admin: boolean;
    is_banned: boolean;
    mute_untill: Date | null;
    joined: boolean;
    joined_at: Date | null;
}, {
    chat_user_id: number;
    chat_id: number | null;
    intra_user_id: number | null;
    is_owner: boolean;
    is_admin: boolean;
    is_banned: boolean;
    mute_untill: Date | null;
    joined: boolean;
    joined_at: Date | null;
}>;
declare const messageStatusInsert: z.ZodObject<{
    message_status_id: z.ZodNumber;
    message_id: z.ZodNumber;
    chat_id: z.ZodNumber;
    receiver_id: z.ZodNumber;
    receivet_at: z.ZodNullable<z.ZodDate>;
    read_at: z.ZodNullable<z.ZodDate>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    chat_id: number;
    message_id: number;
    message_status_id: number;
    receiver_id: number;
    receivet_at: Date | null;
    read_at: Date | null;
}, {
    chat_id: number;
    message_id: number;
    message_status_id: number;
    receiver_id: number;
    receivet_at: Date | null;
    read_at: Date | null;
}>;
declare const blocksSelect: z.ZodObject<{
    block_id: z.ZodNumber;
    user_id: z.ZodNumber;
    blocked_user_id: z.ZodNumber;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    block_id: number;
    user_id: number;
    blocked_user_id: number;
}, {
    block_id: number;
    user_id: number;
    blocked_user_id: number;
}>;
type Blocks = z.infer<typeof blocksSelect>;
type User = z.infer<typeof userSelect>;
type Friends = z.infer<typeof friendsSelect>;
type Chats = z.infer<typeof chatSelect>;
type ChatsUsers = z.infer<typeof chatsUsersSelect>;
type Messages = z.infer<typeof messagesInsert>;
type MessageStatus = z.infer<typeof messageStatusInsert>;

declare const createQueryClient: (input: string) => postgres.Sql<{}>;
declare const createDrizzleClient: (client: ReturnType<typeof createQueryClient>) => drizzle_orm_postgres_js.PostgresJsDatabase<Record<string, never>>;
type UserChats = {
    chatid: number;
    title: string;
    image: string;
    lastMessage: string;
    nickName: string;
    time: Date;
    unreadMessages: number;
    hasPassword: boolean;
};
type InvitedChats = {
    chatid: number;
    title: string;
    image: string;
};
type ExternalUser = {
    intra_user_id: number;
    user_name: string;
    nick_name: string;
    email: string;
    state: 'Online' | 'Offline' | 'In-Game';
    image: string;
    wins: number;
    losses: number;
    blocked: boolean;
};
type MultiplayerMatches = {
    player1_id: number;
    player2_id: number;
    player1_score: number;
    player2_score: number;
    user_name: string;
    nick_name: string;
    image: string;
};
type ChatMessages = {
    message_id: number;
    chat_id: number;
    sender_id: number;
    sender_name: string;
    sender_image_url: string;
    message: string;
    sent_at: Date;
    is_muted: boolean;
};
type ChatInfo = {
    isDm: boolean;
    intraId: number | null;
    nickName: string | null;
    chatId: number | null;
    title: string | null;
    image: string | null;
};
type ChatSettings = {
    isPrivate: boolean;
    isDirect: boolean;
    userInfo: ChatsUsers[];
    title: string;
    password: string | null;
    image: string | null;
};

export { type Blocks, type ChatMessages, type ChatSettings, type Chats, type ChatsUsers, type ChatInfo as DmInfo, type ExternalUser, type Friends, type InvitedChats, type MessageStatus, type Messages, type MultiplayerMatches, type User, type UserChats, blocks, chats, chatsUsers, createDrizzleClient, createQueryClient, friends, games, messageStatus, messages, users };
