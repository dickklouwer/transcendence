import { Injectable } from '@nestjs/common';
import * as schema from '@repo/db';
import type { FortyTwoUser } from 'src/auth/auth.service';
import { eq, or, not, and } from 'drizzle-orm';
import { channel } from 'diagnostics_channel';

const dublicated_key = '23505';
const defaultUserImage = 'https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg';

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
          title: chatinfo[0].title,
          image: chatinfo[0].image,
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
    console.log('chat_id: ', chat_id);
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

  async mockData(): Promise<boolean> {
    // Create Users
    try {
      await this.db.insert(schema.users).values({
        intra_user_id: 278,
        user_name: 'Bas_dev',
        email: 'Bas@dev.com',
        image: defaultUserImage,
      });
      console.log('User 2 Created!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('user Bas Already Created!');
      } else {
        console.log('Error: ', error);
      }
    }
    try {
      await this.db.insert(schema.users).values({
        intra_user_id: 372,
        user_name: 'Daan_dev',
        email: 'Daan@dev.com',
        image: defaultUserImage,
      });
      console.log('User 2 Created!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('user Daan Already Created!');
      } else {
        console.log('Error: ', error);
      }
    }
    try {
      await this.db.insert(schema.users).values({
        intra_user_id: 392,
        user_name: 'Kees_dev',
        email: 'Kees@dev.com',
        image: defaultUserImage,
      });
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('user Kees Already Created!');
      } else {
        console.log('Error: ', error);
      }
    }
    try {
      await this.db.insert(schema.users).values({
        intra_user_id: 77718,
        user_name: 'Bram',
        email: 'Bram@codam.com',
        image: defaultUserImage,
      });
      console.log('User Bram Created!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('user77718 Already Created!');
      } else {
        console.log('Error: ', error);
      }
    }
    // create groep chat
    try {
      await this.db.insert(schema.chats).values({
        chat_id: 1,
        title: 'Group Chat 1',
        image: '',
      });
      console.log('Group Chat Created!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('Group Chat 1 Already Created!');
      } else {
        console.log('Error: ', error);
      }
    }
    try {
      await this.db.insert(schema.chats).values({
        chat_id: 2,
        title: 'Bas Bram',
        image: '',
        is_direct: true,
      });
      console.log('Group Chat Created!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('Group Chat 2 Already Created!');
      } else {
        console.log('Error: ', error);
      }
    }
    // Add chat users
    try {
      await this.db.insert(schema.chatsUsers).values({
        chat_user_id: 1,
        chat_id: 1,
        intra_user_id: 278,
      });
      console.log('Chat User Bas Added!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('Chat users already added!');
      } else {
        console.log('Error: ', error);
      }
    }
    try {
      await this.db.insert(schema.chatsUsers).values({
        chat_user_id: 2,
        chat_id: 1,
        intra_user_id: 372,
        is_admin: true,
      });
      console.log('Chat User Daan Added!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('Chat users already added!');
      } else {
        console.log('Error: ', error);
      }
    }
    try {
      await this.db.insert(schema.chatsUsers).values({
        chat_user_id: 3,
        chat_id: 1,
        intra_user_id: 392,
        is_owner: true,
      });
      console.log('Chat User Kees Added!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('Chat users already added!');
      } else {
        console.log('Error: ', error);
      }
    }
    try {
      await this.db.insert(schema.chatsUsers).values({
        chat_user_id: 4,
        chat_id: 1,
        intra_user_id: 77718,
        is_owner: true,
        is_admin: true,
      });
      console.log('Chat User Bram Added!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('Chat users already added!');
      } else {
        console.log('Error: ', error);
      }
    }
    try {
      await this.db.insert(schema.chatsUsers).values({
        chat_user_id: 5,
        chat_id: 2,
        intra_user_id: 278,
      });
      console.log('Chat User Bas Added!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('Chat users already added!');
      } else {
        console.log('Error: ', error);
      }
    }
    try {
      await this.db.insert(schema.chatsUsers).values({
        chat_user_id: 6,
        chat_id: 2,
        intra_user_id: 77718,
      });
      console.log('Chat User Bram Added!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('Chat users already added!');
      } else {
        console.log('Error: ', error);
      }
    }
    // add messages
    try {
      await this.db.insert(schema.messages).values({
        message_id: 2,
        chat_id: 1,
        sender_id: 372,
        message: 'Hello from Daan',
      });
      console.log('Message 2 Added!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('Message already added!');
      } else {
        console.log('Error: ', error);
      }
    }
    try {
      await this.db.insert(schema.messages).values({
        message_id: 3,
        chat_id: 1,
        sender_id: 392,
        message: 'Hello from Kees',
      });
      console.log('Message 3 Added!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('Message already added!');
      } else {
        console.log('Error: ', error);
      }
    }
    try {
      await this.db.insert(schema.messages).values({
        message_id: 4,
        chat_id: 1,
        sender_id: 77718,
        message: 'Hello from Bram',
      });
      console.log('Message 3 Added!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('Message already added!');
      } else {
        console.log('Error: ', error);
      }
    }
    try {
      await this.db.insert(schema.messages).values({
        message_id: 5,
        chat_id: 2,
        sender_id: 278,
        message: 'Hello from Bas',
      });
      console.log('Message 5 Added!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('Message already added!');
      } else {
        console.log('Error: ', error);
      }
    }
    try {
      await this.db.insert(schema.messages).values({
        message_id: 6,
        chat_id: 2,
        sender_id: 77718,
        message: 'Hello from Bram',
      });
      console.log('Message 6 Added!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('Message already added!');
      } else {
        console.log('Error: ', error);
      }
    }
    return true;
  }
}
