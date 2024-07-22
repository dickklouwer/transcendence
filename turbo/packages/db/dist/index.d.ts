import type { NewUser } from './schema.ts';
import { users, messages } from './schema.ts';
declare const db: import("drizzle-orm/postgres-js").PostgresJsDatabase<Record<string, never>>;
type UserChats = {
    messageId: number;
    type: string;
    title: string;
    image: string;
    lastMessage: string;
    time: Date;
    unreadMessages: number;
};
export type { NewUser, UserChats };
export { users, db, messages };
//# sourceMappingURL=index.d.ts.map