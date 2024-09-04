import { Injectable } from '@nestjs/common';
import * as schema from '@repo/db';
import type { FortyTwoUser } from 'src/auth/auth.service';
import { eq, or, not, and } from 'drizzle-orm';

@Injectable()
export class DbService {
  db: ReturnType<typeof schema.createDrizzleClient>;
  constructor() {
    if (!process.env.DATABASE_URL_LOCAL) {
      throw Error('Env DATABASE_URL_LOCAL is undefined');
    }
    this.db = schema.createDrizzleClient(
      schema.createQueryClient(process.env.DATABASE_URL),
    );
  }

  async setUserTwoFactorEnabled(
    userId: number,
    enabled: boolean,
  ): Promise<void> {
    try {
      await this.db
        .update(schema.users)
        .set({ is_two_factor_enabled: enabled })
        .where(eq(schema.users.intra_user_id, userId));
      console.log('User 2FA status updated');
    } catch (error) {
      console.error('Error updating 2FA status:', error);
    }
  }

  async updateUserTwoFactorSecret(
    userId: number,
    secret: string,
  ): Promise<void> {
    try {
      await this.db
        .update(schema.users)
        .set({ two_factor_secret: secret })
        .where(eq(schema.users.intra_user_id, userId));
      console.log('User 2FA secret updated');
    } catch (error) {
      console.error('Error updating 2FA secret:', error);
    }
  }

  async upsertUserInDataBase(user: FortyTwoUser): Promise<boolean> {
    try {
      await this.db
        .insert(schema.users)
        .values(user)
        .onConflictDoUpdate({
          target: [schema.users.intra_user_id],
          set: { token: user.token },
        });
      console.log('User Created2!');
      return true;
    } catch (error) {
      console.log('User Could be already Created!', error);
    }
    return false;
  }

  async getUserFromDataBase(jwtToken: string): Promise<schema.User | null> {
    try {
      const user = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.token, jwtToken));

      return user[0];
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async getAnyUserFromDataBase(
    intra_user_id: number,
  ): Promise<schema.User | null> {
    try {
      const user = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.intra_user_id, intra_user_id));

      console.log('User from id: ', user);
      return user[0];
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async CheckNicknameIsUnque(nickname: string): Promise<boolean> {
    try {
      const user: schema.User[] = await this.db
        .select()
        .from(schema.users)
        .where(eq(schema.users.nick_name, nickname));

      if (user.length === 0) {
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  async setUserNickname(jwtToken: string, nickname: string): Promise<boolean> {
    try {
      await this.db
        .update(schema.users)
        .set({ nick_name: nickname })
        .where(eq(schema.users.token, jwtToken));

      console.log('Nickname Set!');
      return true;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  async getAllExternalUsers(
    jwtToken: string,
  ): Promise<schema.ExternalUser[] | null> {
    try {
      const user: schema.ExternalUser[] = await this.db
        .select({
          intra_user_id: schema.users.intra_user_id,
          user_name: schema.users.user_name,
          nick_name: schema.users.nick_name,
          email: schema.users.email,
          state: schema.users.state,
          image: schema.users.image,
        })
        .from(schema.users)
        .where(not(eq(schema.users.token, jwtToken)));

      return user;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }
  async getFriendsNotApprovedFromDataBase(
    jwtToken: string,
  ): Promise<schema.Friends[] | null> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const friendList: schema.Friends[] = await this.db
        .select()
        .from(schema.friends)
        .where(
          and(
            or(
              eq(schema.friends.user_id_send, user.intra_user_id),
              eq(schema.friends.user_id_receive, user.intra_user_id),
            ),
            eq(schema.friends.is_approved, false),
          ),
        );
      return friendList;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async getFriendsApprovedFromDataBase(
    jwtToken: string,
  ): Promise<schema.ExternalUser[] | null> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const friendList = await this.db
        .select({
          intra_user_id: schema.users.intra_user_id,
          user_name: schema.users.user_name,
          nick_name: schema.users.nick_name,
          email: schema.users.email,
          state: schema.users.state,
          image: schema.users.image,
          friend_id: schema.friends.friend_id,
        })
        .from(schema.friends)
        .innerJoin(
          schema.users,
          or(
            eq(schema.users.intra_user_id, schema.friends.user_id_send),
            eq(schema.users.intra_user_id, schema.friends.user_id_receive),
          ),
        )
        .where(
          and(
            eq(schema.friends.is_approved, true),
            not(eq(schema.users.intra_user_id, user.intra_user_id)),
            or(
              eq(schema.friends.user_id_send, user.intra_user_id),
              eq(schema.friends.user_id_receive, user.intra_user_id),
            ),
          ),
        );

      return friendList;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async getIncomingFriendRequests(
    jwtToken: string,
  ): Promise<schema.ExternalUser[] | null> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const friendList: schema.ExternalUser[] = await this.db
        .select({
          intra_user_id: schema.users.intra_user_id,
          user_name: schema.users.user_name,
          nick_name: schema.users.nick_name,
          email: schema.users.email,
          state: schema.users.state,
          image: schema.users.image,
        })
        .from(schema.friends)
        .innerJoin(
          schema.users,
          or(
            eq(schema.users.intra_user_id, schema.friends.user_id_send),
            eq(schema.users.intra_user_id, schema.friends.user_id_receive),
          ),
        )
        .where(
          and(
            eq(schema.friends.is_approved, false),
            not(eq(schema.users.intra_user_id, user.intra_user_id)),
            eq(schema.friends.user_id_receive, user.intra_user_id),
          ),
        );

      return friendList;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async sendFriendRequest(jwtToken: string, userId: number): Promise<boolean> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);

      if (!user) throw Error('Failed to fetch User!');

      await this.db.insert(schema.friends).values({
        user_id_send: user.intra_user_id,
        user_id_receive: userId,
        is_approved: false,
      });
      console.log('Friend Request Sent!');
      return true;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  async acceptFriendRequest(
    jwtToken: string,
    friend_id: number,
  ): Promise<boolean> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      await this.db
        .update(schema.friends)
        .set({ is_approved: true })
        .where(
          and(
            or(
              eq(schema.friends.user_id_send, friend_id),
              eq(schema.friends.user_id_receive, friend_id),
            ),
            or(
              eq(schema.friends.user_id_send, user.intra_user_id),
              eq(schema.friends.user_id_receive, user.intra_user_id),
            ),
          ),
        );
      console.log('Friend Request Accepted!');
      return true;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  async declineFriendRequest(
    jwtToken: string,
    friend_id: number,
  ): Promise<boolean> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      await this.db
        .delete(schema.friends)
        .where(
          and(
            or(
              eq(schema.friends.user_id_send, friend_id),
              eq(schema.friends.user_id_receive, friend_id),
            ),
            or(
              eq(schema.friends.user_id_send, user.intra_user_id),
              eq(schema.friends.user_id_receive, user.intra_user_id),
            ),
          ),
        );
      console.log('Friend Request Declined!');
      return true;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  //Suggest:	async getChatOverviewfromDB(jwtToken: string): Promise<UserChats[] | null> {
  async getChatsFromDataBase(
    jwtToken: string,
  ): Promise<schema.UserChats[] | null> {
    const result: schema.UserChats[] = [];

    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');
      const dbChatID = await this.db
        .select()
        .from(schema.chatsUsers)
        .where(eq(schema.chatsUsers.intra_user_id, user.intra_user_id));
      if (!dbChatID) throw Error('failed to fetch dbChatID');

      for (let i = 0; i < dbChatID.length; i++) {
        //NOTE: Can't get Chats type to be propperly used. something wrong with index.ts @bprovos
        const chatinfo: schema.Chats[] = await this.db
          .select()
          .from(schema.chats)
          .where(eq(schema.chats.chat_id, dbChatID[i].chat_id));

        //NOTE: @bprovos Should we do new request into DB to get this info, is it smart?
        const field: schema.UserChats = {
          chatid: dbChatID[i].chat_id,
          title: chatinfo[i].title,
          image: chatinfo[i].image,
          lastMessage: '',
          time: new Date(),
          unreadMessages: 0,
        };

        result.push(field);
      }
      console.log('result: ', result);
      return result;
    } catch (error) {
      console.log('userMessages:', error);
      return null;
    }
  }

  async getChatIdsFromUser(jwtToken: string): Promise<number[] | null> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const dbChatID = await this.db
        .select()
        .from(schema.chatsUsers)
        .where(eq(schema.chatsUsers.intra_user_id, user.intra_user_id));

      const result: number[] = [];
      for (let i = 0; i < dbChatID.length; i++) {
        result.push(dbChatID[i].chat_id);
      }
      console.log('result: ', result);
      return result;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async getMessagesFromDataBase(
    jwtToken: string,
    chat_id: number,
  ): Promise<schema.Messages[] | null> {
    try {
      const res = await this.db
        .select()
        .from(schema.messages)
        .where(eq(schema.messages.chat_id, chat_id));

      console.log('Messages: ', res);
      return res;
    } catch (error) {
      console.log('Error messags: ', error);
      return null;
    }
  }

  async mockData(own_intra_id: number): Promise<boolean> {
    // Create Users
    try {
      await this.db.insert(schema.users).values({
        intra_user_id: 1,
        user_name: 'user 1',
        email: 'user1@user.com',
        image: '',
      });
      console.log('User 1 Created!');
    } catch (error) {
      console.log('Error: ', error);
    }
    try {
      await this.db.insert(schema.users).values({
        intra_user_id: 2,
        user_name: 'user 2',
        email: 'user2@user.com',
        image: '',
      });
      console.log('User 2 Created!');
    } catch (error) {
      console.log('Error: ', error);
    }
    try {
      await this.db.insert(schema.users).values({
        intra_user_id: 3,
        user_name: 'user 3',
        email: 'user3@user.com',
        image: '',
      });
      console.log('User 3 Created!');
    } catch (error) {
      console.log('Error: ', error);
    }
    // Create Messages
    try {
      await this.db.insert(schema.messages).values({
        sender_id: own_intra_id,
        message: 'Hello from user 1',
        chat_id: 1,
      });
      console.log('Message 1 Created!');
    } catch (error) {
      console.log('Error: ', error);
    }
    try {
      await this.db.insert(schema.messages).values({
        sender_id: 2,
        chat_id: 1,
        message: 'Hello from User 2',
      });
      console.log('Message 2 Created!');
    } catch (error) {
      console.log('Error: ', error);
    }
    return true;
  }
}
