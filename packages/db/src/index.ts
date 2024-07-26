import type { User } from './schema';
import { users, messages, groupChats } from './schema';
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

export const createQueryClient = (input: string) => postgres(input);
export const createDrizzleClient = (client: ReturnType<typeof createQueryClient>) => drizzle(client);

type UserChats = {
    messageId: number;
    type: string;
    title: string;
    image: string;
    lastMessage: string;
    time: Date;
    unreadMessages: number;
  };

export type { User, UserChats }
export { users, messages, groupChats};
