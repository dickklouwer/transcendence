import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../drizzle/schema';
import { users, messages } from '../../drizzle/schema';
import { NewUser, userChats } from '../auth/auth.service';
import { eq } from 'drizzle-orm';

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

  async getChatsFromDataBase(jwtToken: string): Promise<userChats | null> {
    try {
      console.log('in function getChatsFromDataBase');
      const user = await this.getUserFromDataBase(jwtToken);
      if (user) {
        if (!user.intra_user_id) console.log('id: none');
      } else {
        console.log('user: none');
      }
      const userMessages = await this.drizzleService
        .select()
        .from(messages)
        .where(eq(messages.sender_id, user.intra_user_id));
      if (userMessages) {
        console.log('userMessages: ', userMessages);
      } else {
        console.log('userMessages: none');
      }

      let result: userChats;
      result.lastMessage = userMessages[0].message;
      // fill result with data
      return result;
    } catch (error) {
      console.log('userMessages:', error);
      return null;
    }
  }
}
