import type { User, Friends } from './schema';
import { users, messages, groupChats, friends, games } from './schema';
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




export type { User, UserChats, ExternalUser, Friends, MultiplayerMatches }
export { users, friends, messages, groupChats, games};
