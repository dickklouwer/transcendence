import type { User, Friends, ChatsUsers, Chats, Messages } from './schema';
import { users, friends, chats, chatsUsers, games, messages } from './schema';
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'

export const createQueryClient = (input: string) => postgres(input);
export const createDrizzleClient = (client: ReturnType<typeof createQueryClient>) => drizzle(client);

type UserChats = {
	chatid: number;
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
	state: 'Online' | 'Offline' | 'In-Game' | 'Idle';
	image: string;
};

export type { User, Friends, ChatsUsers, UserChats, Chats, Messages, ExternalUser }
export { users, friends, chatsUsers, chats, games, messages };
