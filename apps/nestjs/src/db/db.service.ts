import { Injectable } from '@nestjs/common';
import {
  users,
  friends,
  messages,
  games,
  chats,
  chatsUsers,
  createQueryClient,
  createDrizzleClient,
} from '@repo/db';
import type { FortyTwoUser } from 'src/auth/auth.service';
import type {
  MultiplayerMatches,
  User,
  UserChats,
  ExternalUser,
  Messages,
  Chats,
  ChatMessages,
} from '@repo/db';
import { eq, or, not, and, desc, sql } from 'drizzle-orm';

const dublicated_key = '23505';
const defaultUserImage =
  'https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg';

@Injectable()
export class DbService {
  db: ReturnType<typeof createDrizzleClient>;
  constructor() {
    if (!process.env.DATABASE_URL_LOCAL) {
      throw Error('Env DATABASE_URL_LOCAL is undefined');
    }
    this.db = createDrizzleClient(createQueryClient(process.env.DATABASE_URL));
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.intra_user_id, id));
    return result.length > 0 ? result[0] : null;
  }

  async updateImage(id: number, image: string) {
    try {
      await this.db
        .update(users)
        .set({ image: image })
        .where(eq(users.intra_user_id, id));
      console.log('Image updated');
    } catch (error) {
      console.error('Error updating image:', error);
    }
  }

  async setUserTwoFactorEnabled(userId: number, enabled: boolean) {
    try {
      await this.db
        .update(users)
        .set({ is_two_factor_enabled: enabled })
        .where(eq(users.intra_user_id, userId));
      console.log('User 2FA status updated');
    } catch (error) {
      console.error('Error updating 2FA status:', error);
    }
  }

  async updateUserTwoFactorSecret(userId: number, secret: string) {
    try {
      await this.db
        .update(users)
        .set({ two_factor_secret: secret })
        .where(eq(users.intra_user_id, userId));
      console.log('User 2FA secret updated');
    } catch (error) {
      console.error('Error updating 2FA secret:', error);
    }
  }

  async upsertUserInDataBase(fortyTwoUser: FortyTwoUser): Promise<User> {
    const result = await this.db
      .insert(users)
      .values({
        intra_user_id: fortyTwoUser.intra_user_id,
        user_name: fortyTwoUser.user_name,
        nick_name: fortyTwoUser.user_name,
        email: fortyTwoUser.email,
        state: fortyTwoUser.state,
        image: fortyTwoUser.image,
        token: fortyTwoUser.token,
      })
      .onConflictDoUpdate({
        target: users.intra_user_id,
        set: {
          token: fortyTwoUser.token,
        },
      })
      .returning();

    return result[0];
  }

  async getUserFromDataBase(jwtToken: string) {
    try {
      const user = await this.db
        .select()
        .from(users)
        .where(eq(users.token, jwtToken));

      return user[0];
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async getAnyUserFromDataBase(intra_user_id: number) {
    try {
      const user = await this.db
        .select()
        .from(users)
        .where(eq(users.intra_user_id, intra_user_id));

      return user[0];
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async getLeaderboardFromDataBase() {
    try {
      const res: ExternalUser[] = await this.db
        .select({
          intra_user_id: users.intra_user_id,
          user_name: users.user_name,
          nick_name: users.nick_name,
          email: users.email,
          state: users.state,
          image: users.image,
          wins: users.wins,
          losses: users.losses,
        })
        .from(users)
        .where(or(not(eq(users.wins, 0)), not(eq(users.losses, 0))))
        .orderBy(sql`
          CASE 
            WHEN ${users.losses} = 0 THEN ${users.wins} 
            ELSE (CAST(${users.wins} AS FLOAT) / ${users.losses}) 
          END DESC
        `);

      // console.log(sql<number>`sum(${users.wins} / ${users.losses})`);
      return res;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async CheckNicknameIsUnque(nickname: string): Promise<boolean> {
    try {
      const user = await this.db
        .select()
        .from(users)
        .where(eq(users.nick_name, nickname));

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
        .update(users)
        .set({ nick_name: nickname })
        .where(eq(users.token, jwtToken));

      console.log('Nickname Set!');
      return true;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  async setUserState(
    intra_user_id: number,
    state: 'Online' | 'Offline' | 'In-Game',
  ): Promise<boolean> {
    try {
      await this.db
        .update(users)
        .set({ state: state })
        .where(eq(users.intra_user_id, intra_user_id));

      console.log('State Set! for', intra_user_id, 'to', state);
      return true;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  async getAllExternalUsers(jwtToken: string) {
    try {
      const user = await this.db
        .select({
          intra_user_id: users.intra_user_id,
          user_name: users.user_name,
          nick_name: users.nick_name,
          email: users.email,
          state: users.state,
          image: users.image,
          wins: users.wins,
          losses: users.losses,
        })
        .from(users)
        .where(not(eq(users.token, jwtToken)));

      return user;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }
  async getFriendsNotApprovedFromDataBase(jwtToken: string) {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const friendList = await this.db
        .select()
        .from(friends)
        .where(
          and(
            or(
              eq(friends.user_id_send, user.intra_user_id),
              eq(friends.user_id_receive, user.intra_user_id),
            ),
            eq(friends.is_approved, false),
          ),
        );
      return friendList;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async getFriendsApprovedFromDataBase(jwtToken: string) {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const friendList = await this.db
        .select({
          intra_user_id: users.intra_user_id,
          user_name: users.user_name,
          nick_name: users.nick_name,
          email: users.email,
          state: users.state,
          image: users.image,
          friend_id: friends.friend_id,
        })
        .from(friends)
        .innerJoin(
          users,
          or(
            eq(users.intra_user_id, friends.user_id_send),
            eq(users.intra_user_id, friends.user_id_receive),
          ),
        )
        .where(
          and(
            eq(friends.is_approved, true),
            not(eq(users.intra_user_id, user.intra_user_id)),
            or(
              eq(friends.user_id_send, user.intra_user_id),
              eq(friends.user_id_receive, user.intra_user_id),
            ),
          ),
        );

      return friendList;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async getAnyApprovedFriends(intra_user_id: number) {
    try {
      const friendList = await this.db
        .select({
          intra_user_id: users.intra_user_id,
          user_name: users.user_name,
          nick_name: users.nick_name,
          email: users.email,
          state: users.state,
          image: users.image,
        })
        .from(friends)
        .innerJoin(
          users,
          or(
            eq(users.intra_user_id, friends.user_id_send),
            eq(users.intra_user_id, friends.user_id_receive),
          ),
        )
        .where(
          and(
            eq(friends.is_approved, true),
            not(eq(users.intra_user_id, intra_user_id)),
            or(
              eq(friends.user_id_send, intra_user_id),
              eq(friends.user_id_receive, intra_user_id),
            ),
          ),
        );

      return friendList;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async getIncomingFriendRequests(jwtToken: string) {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const friendList = await this.db
        .select({
          intra_user_id: users.intra_user_id,
          user_name: users.user_name,
          nick_name: users.nick_name,
          email: users.email,
          state: users.state,
          image: users.image,
        })
        .from(friends)
        .innerJoin(
          users,
          or(
            eq(users.intra_user_id, friends.user_id_send),
            eq(users.intra_user_id, friends.user_id_receive),
          ),
        )
        .where(
          and(
            eq(friends.is_approved, false),
            not(eq(users.intra_user_id, user.intra_user_id)),
            eq(friends.user_id_receive, user.intra_user_id),
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

      await this.db.insert(friends).values({
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
    user_id: number,
    friend_id: number,
  ): Promise<boolean> {
    try {
      await this.db
        .update(friends)
        .set({ is_approved: true })
        .where(
          and(
            or(
              eq(friends.user_id_send, friend_id),
              eq(friends.user_id_receive, friend_id),
            ),
            or(
              eq(friends.user_id_send, user_id),
              eq(friends.user_id_receive, user_id),
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
    user_id: number,
    friend_id: number,
  ): Promise<boolean> {
    try {
      await this.db
        .delete(friends)
        .where(
          and(
            or(
              eq(friends.user_id_send, friend_id),
              eq(friends.user_id_receive, friend_id),
            ),
            or(
              eq(friends.user_id_send, user_id),
              eq(friends.user_id_receive, user_id),
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

  async chatHasPassword(jwtToken: string, chat_id: number): Promise<boolean> {
    try {
      const chat = await this.db
        .select()
        .from(chats)
        .where(eq(chats.chat_id, chat_id));

      if (chat[0].password) {
        return true;
      }
      return false;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  async isValidChatPassword(
    jwtToken: string,
    chat_id: number,
    password: string,
  ): Promise<boolean> {
    try {
      const chat = await this.db
        .select()
        .from(chats)
        .where(eq(chats.chat_id, chat_id));

      if (!chat[0].password) {
        console.log('Chat has no password!');
        return true;
      }

      if (chat[0].password === password) {
        console.log('Password is correct!');
        return true;
      }
      console.log('Password is incorrect!');
      return false;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  async getYourGames(jwtToken: string) {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const res: MultiplayerMatches[] = await this.db
        .select({
          player1_id: games.player1_id,
          player2_id: games.player2_id,
          player1_score: games.player1_score,
          player2_score: games.player2_score,
          user_name: users.user_name,
          nick_name: users.nick_name,
          image: users.image,
        })
        .from(games)
        .orderBy(desc(games.game_id))
        .innerJoin(
          users,
          and(
            or(
              eq(games.player1_id, user.intra_user_id),
              eq(games.player2_id, user.intra_user_id),
            ),
            or(
              eq(users.intra_user_id, games.player1_id),
              eq(users.intra_user_id, games.player2_id),
            ),
          ),
        )
        .where(not(eq(users.intra_user_id, user.intra_user_id)));

      console.log('Games: ', res);

      return res;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async getChatsFromDataBase(jwtToken: string): Promise<UserChats[] | null> {
    const result: UserChats[] = [];

    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');
      const dbChatID = await this.db
        .select()
        .from(chatsUsers)
        .where(eq(chatsUsers.intra_user_id, user.intra_user_id));
      if (!dbChatID) throw Error('failed to fetch dbChatID');

      for (let i = 0; i < dbChatID.length; i++) {
        //NOTE: Can't get Chats type to be propperly used. something wrong with index.ts @bprovos
        const chatinfo: Chats[] = await this.db
          .select()
          .from(chats)
          .where(eq(chats.chat_id, dbChatID[i].chat_id));

        // get last message and time form chat_id
        const idMessages: Messages[] = await this.db
          .select()
          .from(messages)
          .where(eq(messages.chat_id, dbChatID[i].chat_id));

        // console.log('' dbChatID[i]);
        console.log('chatinfo: created ', chatinfo[0].created_at);

        const lastMessage: Messages = idMessages[idMessages.length - 1]
          ? idMessages[idMessages.length - 1]
          : {
              message_id: 0,
              chat_id: dbChatID[i].chat_id,
              sender_id: 0,
              message: '',
              sent_at: chatinfo[0].created_at,
            };

        //NOTE: @bprovos Should we do new request into DB to get this info, is it smart?
        const field: UserChats = {
          chatid: dbChatID[i].chat_id,
          title: chatinfo[0].title,
          image: chatinfo[0].image,
          lastMessage: lastMessage.message,
          time: lastMessage.sent_at,
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
        .from(chatsUsers)
        .where(eq(chatsUsers.intra_user_id, user.intra_user_id));

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
  ): Promise<ChatMessages[] | null> {
    const user = await this.getUserFromDataBase(jwtToken);
    /* Check if user is in the chat */
    try {
      const isUserInChat = await this.db
        .select()
        .from(chatsUsers)
        .where(
          and(
            eq(chatsUsers.chat_id, chat_id),
            eq(chatsUsers.intra_user_id, user?.intra_user_id),
          ),
        );
      if (isUserInChat.length === 0) {
        console.log('User not in chat');
        return null;
      }
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
    /* Get the messages */
    try {
      const dbMessages = await this.db
        .select()
        .from(messages)
        .where(eq(messages.chat_id, chat_id));

      // set dbMessages to ChatMessages
      const chatMessages: ChatMessages[] = [];
      for (let i = 0; i < dbMessages.length; i++) {
        const sender = await this.getAnyUserFromDataBase(
          dbMessages[i].sender_id,
        );
        if (!sender) throw Error('Failed to fetch User!');

        const field: ChatMessages = {
          message_id: dbMessages[i].message_id,
          chat_id: dbMessages[i].chat_id,
          sender_id: dbMessages[i].sender_id,
          sender_name: sender.nick_name ?? sender.user_name,
          sender_image_url: sender.image,
          message: dbMessages[i].message,
          sent_at: dbMessages[i].sent_at,
        };
        chatMessages.push(field);
      }

      return chatMessages;
    } catch (error) {
      console.log('Error messags: ', error);
      return null;
    }
  }

  // async saveMessage(payload: ChatMessages) {
  //   try {
  //     await this.db
  //       .insert(messages)
  //       .values({
  //         chat_id: payload.chat_id,
  //         sender_id: payload.sender_id,
  //         message: payload.message,
  //       })
  //       .returning();
  //     console.log('Message saved');
  //   } catch (error) {
  //     console.error('Error saving message:', error);
  //   }
  // }

  // save message to database and return the returning message
  async saveMessage(payload: ChatMessages): Promise<ChatMessages> {
    try {
      const result = await this.db
        .insert(messages)
        .values({
          chat_id: payload.chat_id,
          sender_id: payload.sender_id,
          message: payload.message,
        })
        .returning();
      console.log('Message saved');

      const sender = await this.getAnyUserFromDataBase(payload.sender_id);
      if (!sender) throw Error('Failed to fetch User!');
      const field: ChatMessages = {
        message_id: result[0].message_id,
        chat_id: result[0].chat_id,
        sender_id: result[0].sender_id,
        sender_name: sender.nick_name ?? sender.user_name,
        sender_image_url: sender.image,
        message: result[0].message,
        sent_at: result[0].sent_at,
      };
      return field;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  }

  async mockData(): Promise<boolean> {
    // Create Users
    try {
      await this.db.insert(users).values({
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
      await this.db.insert(users).values({
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
      await this.db.insert(users).values({
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
    }// date from yesterday
    try {
      await this.db.insert(users).values({
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
      await this.db.insert(chats).values({
        chat_id: 1,
        title: 'Group Chat 1',
        image: '',
        password: '123',
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
      await this.db.insert(chats).values({
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
      await this.db.insert(chatsUsers).values({
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
      await this.db.insert(chatsUsers).values({
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
      await this.db.insert(chatsUsers).values({
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
      await this.db.insert(chatsUsers).values({
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
      await this.db.insert(chatsUsers).values({
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
      await this.db.insert(chatsUsers).values({
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
      await this.db.insert(messages).values({
        chat_id: 1,
        sender_id: 278,
        message: 'Hello from Bas',
        sent_at: new Date(Date.now() - 6 * 60000),
      });
      console.log('Message 1 Added!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('Message already added!');
      } else {
        console.log('Error: ', error);
      }
    }
    try {
      await this.db.insert(messages).values({
        chat_id: 1,
        sender_id: 372,
        message: 'Hello from Daan',
        sent_at: new Date(Date.now() - 5 * 60000),
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
      await this.db.insert(messages).values({
        chat_id: 1,
        sender_id: 392,
        message: 'Hello from Kees',
        sent_at: new Date(Date.now() - 4 * 60000),
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
      await this.db.insert(messages).values({
        chat_id: 1,
        sender_id: 77718,
        message: 'Hello from Bram',
        sent_at: new Date(Date.now() - 0 * 60000),
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
      await this.db.insert(messages).values({
        chat_id: 2,
        sender_id: 278,
        message: 'Hello from Bas',
        sent_at: new Date(Date.now() - 3 * 60000),
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
      await this.db.insert(messages).values({
        chat_id: 2,
        sender_id: 77718,
        message: 'Hello from Bram',
        sent_at: new Date(Date.now() - 2 * 60000),
      });
      console.log('Message 6 Added!');
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('Message already added!');
      } else {
        console.log('Error: ', error);
      }
    }
    try {
      await this.db.insert(messages).values({
        chat_id: 2,
        sender_id: 278,
        message: 'Hi Bram',
        sent_at: new Date(Date.now() - 1 * 60000),
      });
      console.log('Message 7 Added!');
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
