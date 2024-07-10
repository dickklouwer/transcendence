import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../drizzle/schema';
import { users, messages } from '../../drizzle/schema';
import { NewUser, UserChats } from '../auth/auth.service';
import { eq, or } from 'drizzle-orm';

@Injectable()
export class DbService {
  constructor(
    @Inject('DB') private drizzleService: PostgresJsDatabase<typeof schema>,
  ) {}
  async createUserInDataBase(user: NewUser): Promise<boolean> {
    try {
      await this.drizzleService
        .insert(users)
        .values(user)
        .onConflictDoUpdate({
          target: [users.intra_user_id],
          set: { token: user.token },
        });
      console.log('User Created!');
      return true;
    } catch (error) {
      console.log('User Could be already Created!');
    }
  }

  async getUserFromDataBase(jwtToken: string): Promise<NewUser | null> {
    try {
      const user = await this.drizzleService
        .select()
        .from(users)
        .where(eq(users.token, jwtToken));

      console.log('User: ', user);
      return user[0];
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async getChatsFromDataBase(jwtToken: string): Promise<UserChats[] | null> {
    const result: UserChats[] = [];

    try {
      console.log('In function getChatsFromDataBase');
      const user = await this.getUserFromDataBase(jwtToken);
      if (user) {
        console.log('user: ', user);
      } else {
        console.log('user: none');
      }
      const userMessages = await this.drizzleService
        .select()
        .from(messages)
        .where(
          or(
            eq(messages.sender_id, user.intra_user_id),
            eq(messages.receiver_id, user.intra_user_id),
          ),
        );
      if (userMessages) {
        console.log('userMessages: ', userMessages);
      } else {
        console.log('userMessages: none');
      }

      for (let i = 0; i < userMessages.length; i++) {
        const message = userMessages[i];
        result.push({
          messageId: message.message_id,
          type: 'dm',
          title: user.user_name,
          image: user.image,
          lastMessage: message.message,
          time: message.sent_at,
          unreadMessages: i,
        });
        console.log('messages i: ', i);
      }
      console.log('result: ', result);
      return result;
    } catch (error) {
      console.log('userMessages:', error);
      return null;
    }
  }
}
