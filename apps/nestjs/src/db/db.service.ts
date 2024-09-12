import { Injectable } from '@nestjs/common';
// import * as schema from '@repo/db/src';
import {
  users,
  friends,
  messages,
  groupChats,
  games,
  createQueryClient,
  createDrizzleClient,
} from '@repo/db';
import type { FortyTwoUser } from 'src/auth/auth.service';
import type { MultiplayerMatches, User, UserChats } from '@repo/db';
import { eq, or, not, and } from 'drizzle-orm';

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

      console.log('User from id: ', user);
      return user[0];
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
    jwtToken: string,
    friend_id: number,
  ): Promise<boolean> {
    try {
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');

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
              eq(friends.user_id_send, user.intra_user_id),
              eq(friends.user_id_receive, user.intra_user_id),
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
        .delete(friends)
        .where(
          and(
            or(
              eq(friends.user_id_send, friend_id),
              eq(friends.user_id_receive, friend_id),
            ),
            or(
              eq(friends.user_id_send, user.intra_user_id),
              eq(friends.user_id_receive, user.intra_user_id),
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
      console.log('In function getChatsFromDataBase');
      const user = await this.getUserFromDataBase(jwtToken);
      if (!user) throw Error('Failed to fetch User!');
      const dbMessages = await this.db
        .select()
        .from(messages)
        .where(
          or(
            eq(messages.sender_id, user.intra_user_id),
            eq(messages.receiver_id, user.intra_user_id),
          ),
        );
      if (!dbMessages) throw Error('failed to fetch dbMessages');

      for (let i = 0; i < dbMessages.length; i++) {
        const message = dbMessages[i];
        const isGroupChat = message.group_chat_id !== null;
        const field: UserChats = {
          messageId: 0,
          type: '',
          title: '',
          image: '',
          lastMessage: '',
          time: new Date(),
          unreadMessages: 0,
        };

        if (!isGroupChat) {
          const otherUserId =
            message.sender_id === user.intra_user_id
              ? message.receiver_id
              : message.sender_id;
          if (!otherUserId) throw Error('otherUserId is Invalid');
          const otherUser: User =
            await this.getAnyUserFromDataBase(otherUserId);
          if (!otherUser) {
            continue;
          }

          field.messageId = message.message_id;
          field.type = 'dm';
          field.title = otherUser.nick_name
            ? otherUser.nick_name
            : otherUser.user_name;
          field.image = otherUser.image;
          field.lastMessage = message.message;
          field.time = message.sent_at;
          field.unreadMessages = 0;
        }
        if (isGroupChat) {
          const groupChat = await this.db
            .select()
            .from(groupChats)
            .where(
              eq(
                groupChats.group_chat_id,
                message.group_chat_id === null ? -1 : message.group_chat_id,
              ),
            );
          if (!groupChat) {
            continue;
          }

          field.messageId = message.message_id;
          field.type = 'gm';
          field.title = groupChat[0].group_name;
          field.image = groupChat[0].group_image || '';
          field.lastMessage = message.message;
          field.time = message.sent_at;
          field.unreadMessages = 0;
        }
        result.push(field);
      }
      console.log('result: ', result);
      return result;
    } catch (error) {
      console.log('userMessages:', error);
      return null;
    }
  }

  async mockData(own_intra_id: number): Promise<boolean> {
    // Create Users
    try {
      await this.db.insert(users).values({
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
      await this.db.insert(users).values({
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
      await this.db.insert(users).values({
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
      await this.db.insert(messages).values({
        sender_id: 1,
        receiver_id: own_intra_id,
        message: 'Hello from user 1',
      });
      console.log('Message 1 Created!');
    } catch (error) {
      console.log('Error: ', error);
    }
    try {
      await this.db.insert(messages).values({
        sender_id: 2,
        receiver_id: own_intra_id,
        message: 'Hello from User 2',
      });
      console.log('Message 2 Created!');
    } catch (error) {
      console.log('Error: ', error);
    }
    return true;
  }
}
