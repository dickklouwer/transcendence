import { z } from 'zod';
export declare const mySchema: import("drizzle-orm/pg-core").PgSchema<"pong">;
export declare const user_state: import("drizzle-orm/pg-core").PgEnum<["Online", "Offline", "In-Game", "Idle"]>;
export declare const users: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "users";
    schema: "pong";
    columns: {
        user_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "user_id";
            tableName: "users";
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
        intra_user_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "intra_user_id";
            tableName: "users";
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
        user_name: import("drizzle-orm/pg-core").PgColumn<{
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
        nick_name: import("drizzle-orm/pg-core").PgColumn<{
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
        token: import("drizzle-orm/pg-core").PgColumn<{
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
        email: import("drizzle-orm/pg-core").PgColumn<{
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
        password: import("drizzle-orm/pg-core").PgColumn<{
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
        state: import("drizzle-orm/pg-core").PgColumn<{
            name: "state";
            tableName: "users";
            dataType: "string";
            columnType: "PgEnumColumn";
            data: "Online" | "Offline" | "In-Game" | "Idle";
            driverParam: string;
            notNull: true;
            hasDefault: true;
            isPrimaryKey: false;
            isAutoincrement: false;
            hasRuntimeDefault: false;
            enumValues: ["Online", "Offline", "In-Game", "Idle"];
            baseColumn: never;
            generated: undefined;
        }, {}, {}>;
        image: import("drizzle-orm/pg-core").PgColumn<{
            name: "image_url";
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
    };
    dialect: "pg";
}>;
export declare const friends: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "friends";
    schema: "pong";
    columns: {
        friend_id: import("drizzle-orm/pg-core").PgColumn<{
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
        user_id_send: import("drizzle-orm/pg-core").PgColumn<{
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
        user_id_receive: import("drizzle-orm/pg-core").PgColumn<{
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
        is_approved: import("drizzle-orm/pg-core").PgColumn<{
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
export declare const games: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "games";
    schema: "pong";
    columns: {
        game_id: import("drizzle-orm/pg-core").PgColumn<{
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
        player1_id: import("drizzle-orm/pg-core").PgColumn<{
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
        player2_id: import("drizzle-orm/pg-core").PgColumn<{
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
        player1_score: import("drizzle-orm/pg-core").PgColumn<{
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
        player2_score: import("drizzle-orm/pg-core").PgColumn<{
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
export declare const groupChats: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "group_chats";
    schema: "pong";
    columns: {
        group_chat_id: import("drizzle-orm/pg-core").PgColumn<{
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
        group_name: import("drizzle-orm/pg-core").PgColumn<{
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
        group_is_public: import("drizzle-orm/pg-core").PgColumn<{
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
        group_password: import("drizzle-orm/pg-core").PgColumn<{
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
        group_image: import("drizzle-orm/pg-core").PgColumn<{
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
        created_at: import("drizzle-orm/pg-core").PgColumn<{
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
export declare const groupChatsUsers: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "group_chats_users";
    schema: "pong";
    columns: {
        group_chat_user_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "group_chat_user_id";
            tableName: "group_chats_users";
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
        group_chat_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "group_chat_id";
            tableName: "group_chats_users";
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
        intra_user_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "intra_user_id";
            tableName: "group_chats_users";
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
        is_owner: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_owner";
            tableName: "group_chats_users";
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
        is_admin: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_admin";
            tableName: "group_chats_users";
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
        is_banned: import("drizzle-orm/pg-core").PgColumn<{
            name: "is_banned";
            tableName: "group_chats_users";
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
        mute_untill: import("drizzle-orm/pg-core").PgColumn<{
            name: "mute_untill";
            tableName: "group_chats_users";
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
        joined_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "joined_at";
            tableName: "group_chats_users";
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
export declare const messages: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "messages";
    schema: "pong";
    columns: {
        message_id: import("drizzle-orm/pg-core").PgColumn<{
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
        sender_id: import("drizzle-orm/pg-core").PgColumn<{
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
        receiver_id: import("drizzle-orm/pg-core").PgColumn<{
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
        group_chat_id: import("drizzle-orm/pg-core").PgColumn<{
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
        message: import("drizzle-orm/pg-core").PgColumn<{
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
        sent_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "sent_at";
            tableName: "messages";
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
export declare const messageStatus: import("drizzle-orm/pg-core").PgTableWithColumns<{
    name: "message_status";
    schema: "pong";
    columns: {
        message_status_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "message_status_id";
            tableName: "message_status";
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
        message_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "message_id";
            tableName: "message_status";
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
        receiver_id: import("drizzle-orm/pg-core").PgColumn<{
            name: "receiver_id";
            tableName: "message_status";
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
        receivet_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "receivet_at";
            tableName: "message_status";
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
        read_at: import("drizzle-orm/pg-core").PgColumn<{
            name: "read_at";
            tableName: "message_status";
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
export declare const userInsert: z.ZodObject<{
    user_id: z.ZodOptional<z.ZodNumber>;
    intra_user_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    user_name: z.ZodString;
    nick_name: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    token: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    email: z.ZodString;
    password: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    state: z.ZodOptional<z.ZodEnum<["Online", "Offline", "In-Game", "Idle"]>>;
    image: z.ZodOptional<z.ZodNullable<z.ZodString>>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    user_name: string;
    email: string;
    user_id?: number | undefined;
    intra_user_id?: number | null | undefined;
    nick_name?: string | null | undefined;
    token?: string | null | undefined;
    password?: string | null | undefined;
    state?: "Online" | "Offline" | "In-Game" | "Idle" | undefined;
    image?: string | null | undefined;
}, {
    user_name: string;
    email: string;
    user_id?: number | undefined;
    intra_user_id?: number | null | undefined;
    nick_name?: string | null | undefined;
    token?: string | null | undefined;
    password?: string | null | undefined;
    state?: "Online" | "Offline" | "In-Game" | "Idle" | undefined;
    image?: string | null | undefined;
}>;
export declare const userSelect: z.ZodObject<{
    user_id: z.ZodNumber;
    intra_user_id: z.ZodNullable<z.ZodNumber>;
    user_name: z.ZodString;
    nick_name: z.ZodNullable<z.ZodString>;
    token: z.ZodNullable<z.ZodString>;
    email: z.ZodString;
    password: z.ZodNullable<z.ZodString>;
    state: z.ZodEnum<["Online", "Offline", "In-Game", "Idle"]>;
    image: z.ZodNullable<z.ZodString>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    user_id: number;
    intra_user_id: number | null;
    user_name: string;
    nick_name: string | null;
    token: string | null;
    email: string;
    password: string | null;
    state: "Online" | "Offline" | "In-Game" | "Idle";
    image: string | null;
}, {
    user_id: number;
    intra_user_id: number | null;
    user_name: string;
    nick_name: string | null;
    token: string | null;
    email: string;
    password: string | null;
    state: "Online" | "Offline" | "In-Game" | "Idle";
    image: string | null;
}>;
export declare const messagesInsert: z.ZodObject<{
    group_chat_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    message_id: z.ZodOptional<z.ZodNumber>;
    sender_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    receiver_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    message: z.ZodString;
    sent_at: z.ZodOptional<z.ZodNullable<z.ZodDate>>;
}, z.UnknownKeysParam, z.ZodTypeAny, {
    message: string;
    group_chat_id?: number | null | undefined;
    message_id?: number | undefined;
    sender_id?: number | null | undefined;
    receiver_id?: number | null | undefined;
    sent_at?: Date | null | undefined;
}, {
    message: string;
    group_chat_id?: number | null | undefined;
    message_id?: number | undefined;
    sender_id?: number | null | undefined;
    receiver_id?: number | null | undefined;
    sent_at?: Date | null | undefined;
}>;
export type NewUser = z.infer<typeof userInsert>;
//# sourceMappingURL=schema.d.ts.map