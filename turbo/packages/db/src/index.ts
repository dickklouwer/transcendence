import type { NewUser } from './schema.ts';
import { users, messages, groupChats } from './schema.ts';
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres = require('postgres');

if (!process.env.DATABASE_URL_LOCAL) {
    throw new Error('DATABASE_URL_LOCAL must be set');
  }

const queryClient = postgres(process.env.DATABASE_URL_LOCAL);
const db = drizzle(queryClient);


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
export { users, db, messages, groupChats };
