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
        image: drizzle_orm_pg_core.PgColumn<{
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
declare const groupChats: drizzle_orm_pg_core.PgTableWithColumns<{
    name: "group_chats";
    schema: "pong";
    columns: {
        group_chat_id: drizzle_orm_pg_core.PgColumn<{
            name: "group_chat_id";
            tableName: "group_chats";
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
        group_name: drizzle_orm_pg_core.PgColumn<{
            name: "group_name";
            tableName: "group_chats";
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
        group_is_public: drizzle_orm_pg_core.PgColumn<{
            name: "group_is_public";
            tableName: "group_chats";
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
        group_password: drizzle_orm_pg_core.PgColumn<{
            name: "group_password";
            tableName: "group_chats";
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
        group_image: drizzle_orm_pg_core.PgColumn<{
            name: "group_image";
            tableName: "group_chats";
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
            tableName: "group_chats";
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
            notNull: false;
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
            tableName: "messages";
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
        group_chat_id: drizzle_orm_pg_core.PgColumn<{
            name: "group_chat_id";
            tableName: "messages";
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
    image: z.ZodString;
    wins: z.ZodNumber;
    losses: z.ZodNumber;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    intra_user_id: number;
    user_name: string;
    nick_name: string | null;
    token: string | null;
    email: string;
    password: string | null;
    two_factor_secret: string | null;
    is_two_factor_enabled: boolean | null;
    state: "Online" | "Offline" | "In-Game";
    image: string;
    wins: number;
    losses: number;
}, {
    intra_user_id: number;
    user_name: string;
    nick_name: string | null;
    token: string | null;
    email: string;
    password: string | null;
    two_factor_secret: string | null;
    is_two_factor_enabled: boolean | null;
    state: "Online" | "Offline" | "In-Game";
    image: string;
    wins: number;
    losses: number;
}>;
declare const friendsSelect: z.ZodObject<{
    friend_id: z.ZodNumber;
    user_id_send: z.ZodNumber;
    user_id_receive: z.ZodNumber;
    is_approved: z.ZodBoolean;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    friend_id: number;
    user_id_send: number;
    user_id_receive: number;
    is_approved: boolean;
}, {
    friend_id: number;
    user_id_send: number;
    user_id_receive: number;
    is_approved: boolean;
}>;
type User = z.infer<typeof userSelect>;
type Friends = z.infer<typeof friendsSelect>;

declare const createQueryClient: (input: string) => postgres.Sql<{}>;
declare const createDrizzleClient: (client: ReturnType<typeof createQueryClient>) => drizzle_orm_postgres_js.PostgresJsDatabase<Record<string, never>>;
type UserChats = {
    messageId: number;
    type: string;
    title: string;
    image: string;
    lastMessage: string;
    time: Date;
    unreadMessages: number;
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

export { type ExternalUser, type Friends, type MultiplayerMatches, type User, type UserChats, createDrizzleClient, createQueryClient, friends, games, groupChats, messages, users };
