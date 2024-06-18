import { Injectable, Inject } from '@nestjs/common';
import { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import * as schema from '../../drizzle/schema';
import { users } from '../../drizzle/schema';
import { NewUser } from '../auth/auth.service';
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
}
