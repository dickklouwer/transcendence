import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import {
  users,
  friends,
  messages,
  messageStatus,
  games,
  chats,
  chatsUsers,
  createQueryClient,
  createDrizzleClient,
  blocks,
} from '@repo/db';
import type { FortyTwoUser } from 'src/auth/auth.service';
import type {
  MultiplayerMatches,
  User,
  UserChats,
  InvitedChats,
  ExternalUser,
  ChatMessages,
  ChatsUsers,
  DmInfo,
  MessageStatus,
  ChatSettings,
} from '@repo/db';
import { eq, or, not, and, desc, sql, isNull, count, ne } from 'drizzle-orm';
import * as bycrypt from 'bcrypt';

const dublicated_key = '23505';
const defaultUserImage =
  'https://static.vecteezy.com/system/resources/thumbnails/002/318/271/small/user-profile-icon-free-vector.jpg';

@Injectable()
export class DbService implements OnModuleInit {
  db: ReturnType<typeof createDrizzleClient>;
  constructor() {
    if (!process.env.DATABASE_URL_LOCAL) {
      throw Error('Env DATABASE_URL_LOCAL is undefined');
    }
    this.db = createDrizzleClient(createQueryClient(process.env.DATABASE_URL));
  }

  async onModuleInit() {
    try {
      await this.db.update(users).set({ state: 'Offline' });
      await this.db.update(friends).set({ invite_game: false });
    } catch (error) {
      console.log('Error on data reset in database: ', error);
    }
  }

  async getUserById(id: number): Promise<User | null> {
    const result = await this.db
      .select()
      .from(users)
      .where(eq(users.intra_user_id, id));
    return result.length > 0 ? result[0] : null;
  }

  async getChatUsers(id: number): Promise<number[] | null> {
    try {
      const userList = await this.db
        .select({ intra_user_id: chatsUsers.intra_user_id })
        .from(chatsUsers)
        .where(eq(chatsUsers.chat_id, id));

      return userList.map((user) => user.intra_user_id);
    } catch (error) {
      console.error('DB: getChatUsers Error: ', error);
      return null;
    }
  }

  async getExternalUser(id: number): Promise<ExternalUser | null> {
    try {
      const user = await this.db
        .select({
          intra_user_id: users.intra_user_id,
          user_name: users.user_name,
          nick_name: users.nick_name,
          email: users.email,
          state: users.state,
          image: users.image_url,
          wins: users.wins,
          losses: users.losses,
        })
        .from(users)
        .where(eq(users.intra_user_id, id))
        .limit(1);

      console.log(
        'DB - getExternalUser: ',
        user[0].user_name,
        user[0].intra_user_id,
      );

      return {
        ...user[0],
        blocked: false,
      };
    } catch (error) {
      console.error('DB: getExternalUser Error: ', error);
      return null;
    }
  }

  async getChatID(id: number) {
    try {
      const user = await this.db
        .select({
          intra_user_id: users.intra_user_id,
          user_name: users.user_name,
          nick_name: users.nick_name,
          email: users.email,
          state: users.state,
          image: users.image_url,
        })
        .from(users)
        .where(eq(users.intra_user_id, id));
      return user;
    } catch (error) {
      console.log('DB: getExternalUser Error: ', error);
      return null;
    }
  }

  async updateImage(id: number, image: string) {
    try {
      await this.db
        .update(users)
        .set({ image_url: image })
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

  async setBlockedUser(userId: number, blockedUserId: number) {
    try {
      await this.db.insert(blocks).values({
        user_id: userId,
        blocked_user_id: blockedUserId,
      });
      console.log('User blocked');
      return true;
    } catch (error) {
      console.error('Error blocking user:', error);
      return false;
    }
  }

  async removeBlockedUser(userId: number, blockedUserId: number) {
    try {
      await this.db
        .delete(blocks)
        .where(
          and(
            eq(blocks.user_id, userId),
            eq(blocks.blocked_user_id, blockedUserId),
          ),
        );
      console.log('User unblocked');
      return true;
    } catch (error) {
      console.error('Error unblocking user:', error);
      return false;
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
        image_url: fortyTwoUser.image_url,
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
      const res = await this.db
        .select({
          intra_user_id: users.intra_user_id,
          user_name: users.user_name,
          nick_name: users.nick_name,
          email: users.email,
          state: users.state,
          image: users.image_url,
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
      return res.map((user) => ({
        ...user,
        blocked: false,
      }));
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
          image: users.image_url,
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

  async getFriendsApprovedFromDataBaseById(intra_id: number) {
    try {
      const friendList = await this.db
        .select({
          intra_user_id: users.intra_user_id,
          user_name: users.user_name,
          nick_name: users.nick_name,
          email: users.email,
          state: users.state,
          image: users.image_url,
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
            not(eq(users.intra_user_id, intra_id)),
            or(
              eq(friends.user_id_send, intra_id),
              eq(friends.user_id_receive, intra_id),
            ),
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

      return await this.getFriendsApprovedFromDataBaseById(user.intra_user_id);
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
          image: users.image_url,
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
          image: users.image_url,
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

  async removeFriend(user_id: number, friend_id: number): Promise<boolean> {
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

  async setChatPassword(
    chat_id: number,
    password: string | null,
  ): Promise<boolean> {
    try {
      const chat = await this.db
        .select()
        .from(chats)
        .where(eq(chats.chat_id, chat_id));

      if (!chat) throw Error('Failed to fetch Chat!');

      if (!password) {
        await this.db
          .update(chats)
          .set({ password: null })
          .where(eq(chats.chat_id, chat_id));

        console.log('Chat Password Removed!');
        return true;
      }

      if (!process.env.SALT_ROUNDS) {
        console.log('Env SALT_ROUNDS is undefined');
        console.log('Chat Password Not Set!');
        return false;
      }
      const saltRounds = parseInt(process.env.SALT_ROUNDS);

      await this.db
        .update(chats)
        .set({ password: bycrypt.hashSync(password, saltRounds) })
        .where(eq(chats.chat_id, chat_id));

      console.log('Chat Password Set!');

      return true;
    } catch (error) {
      console.log('Error set chat password: ', error);
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
        return true;
      }

      if (bycrypt.compareSync(password, chat[0].password)) return true;
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
          image: users.image_url,
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
      // Check if user exists in DB
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      // Check if user is Banned
      await this.db
        .update(chatsUsers)
        .set({ joined: false })
        .where(
          and(eq(chatsUsers.is_banned, true), eq(chatsUsers.joined, true)),
        );

      // Get all chat_ids for the user
      const chat_ids = await this.db
        .select()
        .from(chatsUsers)
        .innerJoin(chats, eq(chatsUsers.chat_id, chats.chat_id))
        .where(
          and(
            eq(chatsUsers.intra_user_id, user.intra_user_id),
            or(eq(chats.is_direct, true), eq(chatsUsers.joined, true)),
          ),
        );

      for (let i = 0; i < chat_ids.length; i++) {
        // const chatsInfo = await this.db
        //   .select({
        //     isDirect: chats.is_direct,
        //     pass: chats.password,
        //     lastMessage: messages.message,
        //     time_sent: messages.sent_at,
        //     time_created: chats.created_at,
        //     groep_title: chats.title,
        //     groep_image: chats.image,
        //   })
        //   .from(chats)
        //   .fullJoin(messages, eq(chats.chat_id, messages.chat_id))
        //   .fullJoin(users, eq(messages.sender_id, users.intra_user_id))
        //   .where(eq(chats.chat_id, chat_ids[i].chats.chat_id))
        //   .orderBy(desc(messages.sent_at) ?? desc(chats.created_at))
        //   .limit(1);

        const chatsInfo = await this.db
          .select({
            chat_id: chats.chat_id,
            isDirect: chats.is_direct,
            pass: chats.password,
            lastMessage: messages.message,
            time_sent: messages.sent_at,
            time_created: chats.created_at,
            groep_title: chats.title,
            groep_image: chats.image,
            sender_id: users.intra_user_id,
            block_blocked_user_id: blocks.blocked_user_id,
            block_user_id: blocks.user_id,
          })
          .from(chats)
          .fullJoin(messages, eq(chats.chat_id, messages.chat_id))
          .fullJoin(users, eq(messages.sender_id, users.intra_user_id))
          .fullJoin(blocks, eq(users.intra_user_id, blocks.blocked_user_id))
          .where(
            and(
              eq(chats.chat_id, chat_ids[i].chats.chat_id),
              // ne(blocks.blocked_user_id, messages.sender_id),
            ),
          )
          .orderBy(desc(messages.sent_at) ?? desc(chats.created_at));

        console.log('Load chats => chatsInfo:', chatsInfo);

        // {
        //   chat_id: 34,
        //   isDirect: false,
        //   pass: null,
        //   lastMessage: 'Hi 3',
        //   time_sent: 2025-02-13T15:51:29.716Z,
        //   time_created: 2025-02-13T13:41:02.232Z,
        //   groep_title: 'BBD',
        //   groep_image: null,
        //   sender_id: 278,
        //   block_blocked_user_id: 278,
        //   block_user_id: 77718
        // },

        const otherUsers = await this.db
          .select({
            user_name: users.user_name,
            nick_name: users.nick_name,
            image: users.image_url,
          })
          .from(chatsUsers)
          .innerJoin(users, eq(chatsUsers.intra_user_id, users.intra_user_id))
          .where(
            and(
              eq(chatsUsers.chat_id, chat_ids[i].chats.chat_id),
              not(eq(users.token, jwtToken)),
            ),
          );

        const lastSenderName = await this.db
          .select({
            user_intra_id: users.intra_user_id,
            user_name: users.user_name,
            nick_name: users.nick_name,
          })
          .from(messages)
          .innerJoin(users, eq(messages.sender_id, users.intra_user_id))
          .where(eq(messages.chat_id, chat_ids[i].chats.chat_id))
          .orderBy(desc(messages.sent_at))
          .limit(1);

        const unreadMessages = await this.db
          .select({ count: count() })
          .from(messages)
          .innerJoin(
            messageStatus,
            eq(messages.message_id, messageStatus.message_id),
          )
          .where(
            and(
              eq(messages.chat_id, chat_ids[i].chats.chat_id),
              eq(messageStatus.receiver_id, user.intra_user_id),
              isNull(messageStatus.read_at),
            ),
          );

        if (chatsInfo.length === 0) {
          continue;
        }
               console.log('otherUsers:', otherUsers);
               console.log('lastSenderName:', lastSenderName);
        const field: UserChats = {
          chatid: chat_ids[i].chats.chat_id,
          title: chatsInfo[0].isDirect
            ? otherUsers[0].nick_name
              ? otherUsers[0].nick_name
              : otherUsers[0].user_name
            : chatsInfo[0].groep_title,
          image: chatsInfo[0].isDirect
            ? otherUsers[0].image
            : chatsInfo[0].groep_image,
          lastMessage: chatsInfo[0].pass
            ? 'Password protected'
            : chatsInfo[0].lastMessage,
          nickName:
            lastSenderName.length > 0
              ? user.intra_user_id === lastSenderName[0].user_intra_id
                ? 'You'
                : (lastSenderName[0].nick_name ?? lastSenderName[0].user_name)
              : '',
          time: chatsInfo[0].time_sent ?? chatsInfo[0].time_created,
          unreadMessages: unreadMessages[0].count,
          hasPassword: chatsInfo[0].pass ? true : false,
        };
        result.push(field);
      }

      return result;
    } catch (error) {
      console.log('userMessages:', error);
      return null;
    }
  }

  async getInvitedChatsFromDataBase(
    jwtToken: string,
  ): Promise<InvitedChats[] | null> {
    const result: InvitedChats[] = [];

    try {
      await this.db
        .update(chatsUsers)
        .set({ joined: false })
        .where(
          and(eq(chatsUsers.is_banned, true), eq(chatsUsers.joined, true)),
        );

      const chat_ids = await this.db
        .select({ chatid: chatsUsers.chat_id })
        .from(chatsUsers)
        .innerJoin(users, eq(chatsUsers.intra_user_id, users.intra_user_id))
        .innerJoin(chats, eq(chatsUsers.chat_id, chats.chat_id))
        .where(
          and(
            eq(users.token, jwtToken),
            and(eq(chatsUsers.joined, false), eq(chats.is_direct, false)),
          ),
        );

      // console.log('chat_ids:', chat_ids);

      for (let i = 0; i < chat_ids.length; i++) {
        const chatsInfo = await this.db
          .select()
          .from(chats)
          .where(eq(chats.chat_id, chat_ids[i].chatid));

        // console.log('chatsInfo:', chatsInfo);

        const field: InvitedChats = {
          chatid: chat_ids[i].chatid,
          title: chatsInfo[0].title,
          image: chatsInfo[0].image,
        };

        result.push(field);
      }

      // console.log('userMessages:', result);

      return result;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async checkIfUserIsBanned(
    jwtToken: string,
    chat_id: number,
  ): Promise<boolean> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const isBanned = await this.db
        .select()
        .from(chatsUsers)
        .where(
          and(
            eq(chatsUsers.chat_id, chat_id),
            eq(chatsUsers.intra_user_id, user.intra_user_id),
            eq(chatsUsers.is_banned, true),
          ),
        );

      if (isBanned.length > 0) {
        // console.log('User is banned');
        return true;
      }
      // console.log('User is not banned');
      return false;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  // TODO: function get ChatsUsers based on chat_id

  // /*
  async createChat(
    jwtToken: string,
    ChatSettings: ChatSettings,
  ): Promise<number> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);

      if (!process.env.SALT_ROUNDS) throw Error('Env SALT_ROUNDS is undefined');
      if (!user) throw Error('Failed to fetch User!');

      const saltRounds: number = parseInt(process.env.SALT_ROUNDS);
      const pwdHashed: string | null =
        ChatSettings.password == null
          ? null
          : bycrypt.hashSync(ChatSettings.password, saltRounds);

      const chat = await this.db
        .insert(chats)
        .values({
          title: ChatSettings.title,
          is_direct: ChatSettings.isDirect,
          is_public: !ChatSettings.isPrivate,
          image: ChatSettings.image,
          password: pwdHashed,
        })
        .returning({ chat_id: chats.chat_id });

      console.log('DB - Chat Created: ', chat[0].chat_id);
      return chat[0].chat_id;
    } catch (error) {
      console.log('Error: ', error);
      return 0;
    }
  }

  async getChatSettings(
    jwtToken: string,
    chat_id: number,
  ): Promise<ChatSettings | null> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const chat = await this.db
        .select({
          chat_id: chats.chat_id,
          title: chats.title,
          is_direct: chats.is_direct,
          is_public: chats.is_public,
          image: chats.image,
          password: chats.password,
        })
        .from(chats)
        .where(eq(chats.chat_id, chat_id))
        .limit(1);
      if (chat.length === 0) throw Error('Failed to fetch Chat!');

      const users: ChatsUsers[] = await this.db
        .select({
          chat_user_id: chatsUsers.chat_user_id,
          chat_id: chatsUsers.chat_id,
          intra_user_id: chatsUsers.intra_user_id,
          is_owner: chatsUsers.is_owner,
          is_admin: chatsUsers.is_admin,
          is_banned: chatsUsers.is_banned,
          mute_untill: chatsUsers.mute_untill,
          joined: chatsUsers.joined,
          joined_at: chatsUsers.joined_at,
        })
        .from(chatsUsers)
        .where(eq(chatsUsers.chat_id, chat_id));
      if (users.length === 0) throw Error('Failed to fetch Chatusers!');
      console.log('DB - users: ', users);

      const settings: ChatSettings = {
        title: chat[0].title,
        userInfo: users,
        isDirect: chat[0].is_direct,
        isPrivate: !chat[0].is_public,
        image: chat[0].image,
        password: chat[0].password,
      };
      console.log('DB - settingsz: ', settings);
      return settings;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async createChatUsers(
    jwtToken: string,
    chatId: number,
    UserInfo: ChatsUsers,
  ): Promise<boolean> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      await this.db.insert(chatsUsers).values({
        intra_user_id: UserInfo.intra_user_id,
        chat_id: chatId,
        is_owner: UserInfo.is_owner,
        is_admin: UserInfo.is_admin,
        is_banned: false,
        joined: UserInfo.joined,
      });
      console.log(
        `DB - created ChatsUser (${UserInfo.joined ? 'Host' : 'User'}): `,
        UserInfo.intra_user_id,
      );

      return true;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  async joinChat(jwtToken: string, chat_id: number): Promise<boolean> {
    try {
      // Check if user exists in DB
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      // Check if user is Banned
      const isBanned = await this.checkIfUserIsBanned(jwtToken, chat_id);
      if (isBanned) {
        console.log('User is banned');
        return false;
      }

      await this.db
        .update(chatsUsers)
        .set({ joined: true })
        .where(
          and(
            eq(chatsUsers.chat_id, chat_id),
            eq(chatsUsers.intra_user_id, user.intra_user_id),
          ),
        );

      console.log('Joined ', user.intra_user_id, ' to chat ', chat_id);
      return true;
    } catch (error) {
      console.log('Error: ', error);
      return false;
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
  ): Promise<ChatMessages[] | boolean> {
    const user = await this.getUserFromDataBase(jwtToken);
    /* Check if user is in the chat */
    try {
      const isUserInChat = await this.db
        .select()
        .from(chatsUsers)
        .innerJoin(chats, eq(chatsUsers.chat_id, chats.chat_id))
        .where(
          and(
            eq(chatsUsers.intra_user_id, user.intra_user_id),
            eq(chatsUsers.chat_id, chat_id),
            or(eq(chats.is_direct, true), eq(chatsUsers.joined, true)),
          ),
        );
      if (isUserInChat.length === 0) {
        console.log('User not in chat');
        return false;
      }
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }

    try {
      const dbMessages = await this.db
        .select()
        .from(messages)
        .where(eq(messages.chat_id, chat_id));

      const chatMessages: ChatMessages[] = [];
      for (let i = 0; i < dbMessages.length; i++) {
        const sender = await this.getAnyUserFromDataBase(
          dbMessages[i].sender_id,
        );
        if (!sender) throw Error('Failed to fetch User!');

        const isBlocked = await this.checkIfUserIsBlocked(
          dbMessages[i].sender_id,
          user.intra_user_id,
        );

        if (isBlocked) continue;

        const field: ChatMessages = {
          message_id: dbMessages[i].message_id,
          chat_id: dbMessages[i].chat_id,
          sender_id: dbMessages[i].sender_id,
          sender_name: sender.nick_name ?? sender.user_name,
          sender_image_url: sender.image_url,
          message: dbMessages[i].message,
          sent_at: dbMessages[i].sent_at,
          is_muted: false,
        };
        chatMessages.push(field);
      }

      return chatMessages;
    } catch (error) {
      console.log('Error messags: ', error);
      return false;
    }
  }

  async getMessageStatus(
    jwtToken: string,
    message_id: number,
  ): Promise<MessageStatus[] | null> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const messageStatusResult = await this.db
        .select()
        .from(messageStatus)
        .where(
          and(
            eq(messageStatus.message_id, message_id),
            not(eq(messageStatus.receiver_id, user.intra_user_id)),
          ),
        );

      // console.log('MessageStatus:', messageStatusResult);

      return messageStatusResult;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async getChatInfo(jwtToken: string, chat_id: number): Promise<DmInfo> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const chatInfo = await this.db
        .select({
          intra_id: chatsUsers.intra_user_id,
          user_name: users.user_name,
          nick_name: users.nick_name,
          title: chats.title,
          groep_image: chats.image,
          user_image: users.image_url,
        })
        .from(chatsUsers)
        .innerJoin(users, eq(chatsUsers.intra_user_id, users.intra_user_id))
        .innerJoin(chats, eq(chatsUsers.chat_id, chats.chat_id))
        .where(eq(chatsUsers.chat_id, chat_id));

      if (chatInfo.length !== 2) {
        return {
          isDm: false,
          intraId: null,
          nickName: null,
          chatId: chat_id,
          title: chatInfo[0].title,
          image: chatInfo[0].groep_image,
        };
      }

      for (let i = 0; i < chatInfo.length; i++) {
        if (chatInfo[i].intra_id !== user.intra_user_id) {
          return {
            isDm: true,
            intraId: chatInfo[i].intra_id,
            nickName: chatInfo[i].nick_name ?? chatInfo[i].user_name,
            chatId: chat_id,
            title: chatInfo[i].title,
            image: chatInfo[i].user_image,
          };
        }
      }
    } catch (error) {
      console.log('Error: ', error);
      return {
        isDm: false,
        intraId: null,
        nickName: null,
        chatId: null,
        title: null,
        image: null,
      };
    }
    return {
      isDm: false,
      intraId: null,
      nickName: null,
      chatId: null,
      title: null,
      image: null,
    };
  }

  async updateStatusReceivedMessages(
    chat_id: number,
    user_user_id: number,
  ): Promise<boolean> {
    try {
      const currentTime = new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Amsterdam',
      });

      await this.db
        .update(messageStatus)
        .set({ read_at: new Date(new Date(currentTime).getTime()) })
        .where(
          and(
            eq(messageStatus.chat_id, chat_id),
            eq(messageStatus.receiver_id, user_user_id),
            isNull(messageStatus.read_at),
          ),
        );

      return true;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  async getNumberOfUnreadChats(jwtToken: string): Promise<number> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const result = await this.db
        .select({ count: count() })
        .from(chatsUsers)
        .innerJoin(messages, eq(chatsUsers.chat_id, messages.chat_id))
        .innerJoin(
          messageStatus,
          eq(messages.message_id, messageStatus.message_id),
        )
        .where(
          and(
            eq(chatsUsers.intra_user_id, user.intra_user_id),
            eq(messageStatus.receiver_id, user.intra_user_id),
            isNull(messageStatus.read_at),
          ),
        );

      return result[0].count;
    } catch (error) {
      console.log('Error: ', error);
      return 0;
    }
  }

  async checkIfUserIsMuted(chat_id: number, user_id: number): Promise<boolean> {
    try {
      const testSetMute = false;
      const currentTime = new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Amsterdam',
      });

      if (testSetMute) {
        await this.db
          .update(chatsUsers)
          .set({
            mute_untill: new Date(new Date(currentTime).getTime() + 60000), // 1 minute
          })
          .where(
            and(
              eq(chatsUsers.chat_id, chat_id),
              eq(chatsUsers.intra_user_id, user_id),
            ),
          );
        return true;
      }

      const result: ChatsUsers[] = await this.db
        .select()
        .from(chatsUsers)
        .where(
          and(
            eq(chatsUsers.chat_id, chat_id),
            eq(chatsUsers.intra_user_id, user_id),
          ),
        );

      // console.log('Mute_untill:', result);

      if (result[0].mute_untill === null) {
        // console.log('user has no mute_untill');
        return false;
      }

      // console.log('user has mute_untill');

      const muteUntill = new Date(result[0].mute_untill);

      console.log('currentTime:', new Date(currentTime));
      console.log('muteUntill: ', muteUntill);
      if (new Date(currentTime) < muteUntill) {
        // console.log('User is muted');
        return true;
      }

      // console.log('User is not muted');
      await this.db
        .update(chatsUsers)
        .set({ mute_untill: null })
        .where(
          and(
            eq(chatsUsers.chat_id, chat_id),
            eq(chatsUsers.intra_user_id, user_id),
          ),
        );

      return false;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  async checkIfDirectMessage(chat_id: number): Promise<boolean> {
    try {
      const result = await this.db
        .select()
        .from(chats)
        .where(eq(chats.chat_id, chat_id));

      return result[0].is_direct;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  async checkIfUserIsBlocked(
    blockedId: number,
    receiverId: number,
  ): Promise<boolean> {
    try {
      const result = await this.db
        .select()
        .from(blocks)
        .where(eq(blocks.blocked_user_id, blockedId));
      for (let i = 0; i < result.length; i++) {
        if (result[i].user_id === receiverId) {
          console.log('User is blocked');
          return true;
        }
      }
      return false;
    } catch (error) {
      console.log('Error: ', error);
    }
  }

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

      const chatUsers = await this.db
        .select({ user_id: chatsUsers.intra_user_id })
        .from(chatsUsers)
        .where(eq(chatsUsers.chat_id, payload.chat_id));

      for (let i = 0; i < chatUsers.length; i++) {
        await this.db.insert(messageStatus).values({
          message_id: result[0].message_id,
          chat_id: payload.chat_id,
          receiver_id: chatUsers[i].user_id,
          receivet_at: null,
          read_at: null,
        });
      }

      const sender = await this.getAnyUserFromDataBase(payload.sender_id);
      if (!sender) throw Error('Failed to fetch User!');
      const field: ChatMessages = {
        message_id: result[0].message_id,
        chat_id: result[0].chat_id,
        sender_id: result[0].sender_id,
        sender_name: sender.nick_name ?? sender.user_name,
        sender_image_url: sender.image_url,
        message: result[0].message,
        sent_at: result[0].sent_at,
        is_muted: false,
      };
      return field;
    } catch (error) {
      console.error('Error saving message:', error);
      return null;
    }
  }

  async updateMessageStatusReceived(user_intra_id: number): Promise<boolean> {
    try {
      await this.db
        .update(messageStatus)
        .set({ receivet_at: new Date(new Date().getTime()) })
        .where(eq(messageStatus.receiver_id, user_intra_id));

      return true;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  async getAmountGameInvites(jwtToken: string): Promise<number> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const result = await this.db
        .select({ count: count() })
        .from(friends)
        .where(
          and(
            or(
              eq(friends.user_id_send, user.intra_user_id),
              eq(friends.user_id_receive, user.intra_user_id),
            ),
            eq(friends.invite_game, true),
          ),
        );

      return result[0].count;
    } catch (error) {
      console.log('Error: ', error);
      return null;
    }
  }

  async checkIfInvidedForGame(
    jwtToken: string,
    other_intra_id: number,
  ): Promise<boolean> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const result = await this.db
        .select()
        .from(friends)
        .where(
          and(
            or(
              eq(friends.user_id_send, user.intra_user_id),
              eq(friends.user_id_receive, user.intra_user_id),
            ),
            or(
              eq(friends.user_id_send, other_intra_id),
              eq(friends.user_id_receive, other_intra_id),
            ),
          ),
        );

      if (result.length === 0) {
        return false;
      }
      return result[0].invite_game;
    } catch (error) {
      console.log('Error!: ', error);
      return false;
    }
  }

  async getChatIdOfDm(
    jwtToken: string,
    other_intra_id: number,
  ): Promise<number> {
    try {
      // console.log('DB - groepChatUsers');
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

      const chat_data = await this.db
        .select({
          chat_id: chatsUsers.chat_id,
          intra_user_id: chatsUsers.intra_user_id,
        })
        .from(chatsUsers)
        .innerJoin(chats, eq(chatsUsers.chat_id, chats.chat_id))
        .where(
          and(
            or(
              eq(chatsUsers.intra_user_id, user.intra_user_id),
              eq(chatsUsers.intra_user_id, other_intra_id),
            ),
            eq(chats.is_direct, true),
          ),
        );

      // console.log('chat_data:', chat_data);

      if (chat_data.length === 0) {
        return -1;
      }

      const userIds = new Set([Number(other_intra_id), user.intra_user_id]);
      // const userIds1 = new Set([other_intra_id, user.intra_user_id]);

      // console.log('userIds:', userIds);
      // console.log('userIds1:', userIds1);
      // console.log('user_intra_id: ', user.intra_user_id);
      // console.log('other_intra_id: ', other_intra_id);

      const groupedChats = chat_data.reduce(
        (acc, { chat_id, intra_user_id }) => {
          acc[chat_id] = acc[chat_id] || new Set();
          acc[chat_id].add(intra_user_id);
          return acc;
        },
        {} as Record<number, Set<number>>,
      );

      const validChatIds = Object.entries(groupedChats)
        .filter(
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          ([_, users]) =>
            userIds.size === users.size &&
            [...userIds].every((id) => users.has(id)),
        )
        .map(([chat_id]) => Number(chat_id));

      console.log(validChatIds);

      if (validChatIds.length === 0) {
        return -1;
      }
      return validChatIds[0];
    } catch (error) {
      console.log('Error: ', error);
      return 0;
    }
  }

  async inviteForGame(
    sender_id: number,
    receiver_id: number,
    invite: boolean,
  ): Promise<boolean> {
    console.log(
      `Set invite game from ${sender_id} to ${receiver_id} is ${invite}`,
    );
    try {
      await this.db
        .update(friends)
        .set({ invite_game: invite })
        .where(
          or(
            and(
              eq(friends.user_id_send, sender_id),
              eq(friends.user_id_receive, receiver_id),
            ),
            and(
              eq(friends.user_id_send, receiver_id),
              eq(friends.user_id_receive, sender_id),
            ),
          ),
        );
      return true;
    } catch (error) {
      console.log('Error: ', error);
      return false;
    }
  }

  async mockData(): Promise<boolean> {
    // Create Users
    try {
      await this.db.insert(users).values({
        intra_user_id: 278,
        user_name: 'Bas_dev',
        email: 'Bas@dev.com',
        image_url: defaultUserImage,
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
        image_url: defaultUserImage,
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
        image_url: defaultUserImage,
      });
    } catch (error) {
      if (error.code === dublicated_key) {
        console.log('user Kees Already Created!');
      } else {
        console.log('Error: ', error);
      }
    }
    // date from yesterday
    try {
      await this.db.insert(users).values({
        intra_user_id: 77718,
        user_name: 'Bram',
        email: 'Bram@codam.com',
        image_url: defaultUserImage,
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
        title: 'Pass 123',
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
    // set password
    this.setChatPassword(1, '123');
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
