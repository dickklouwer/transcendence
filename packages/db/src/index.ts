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
};

export type { User, UserChats, InvitedChats, ExternalUser, Friends, MultiplayerMatches, ChatMessages, ChatsUsers, Chats, Messages };
export { users, friends, messages, chats, games, chatsUsers};
