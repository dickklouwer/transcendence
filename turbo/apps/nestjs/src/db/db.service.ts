import { Injectable, Inject } from '@nestjs/common';
import * as schema from '@repo/db/src';
import { users, messages, db } from '@repo/db/src';
import type { NewUser, UserChats } from '@repo/db/src';
import { eq, or } from 'drizzle-orm';

@Injectable()
export class DbService {
  constructor(
  ) {}
  async createUserInDataBase(user: NewUser): Promise<boolean> {
    try {
      await db
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
      const user = await db
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

  async getAnyUserFromDataBase(intra_user_id: number): Promise<NewUser | null> {
    try {
      const user = await db
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
      const user = await db
        .select()
        .from(users)
        .where(eq(users.nick_name, nickname));

      console.log('Nickname: ', user);
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
      await db
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
  async getChatsFromDataBase(jwtToken: string): Promise<UserChats[] | null> {
    const result: UserChats[] = [];

    try {
      console.log('In function getChatsFromDataBase');
      const user = await this.getUserFromDataBase(jwtToken);
      if (user) {
        console.log('user: availeble');
      } else {
        console.log('user: none');
      }
      const dbMessages = await db
        .select()
        .from(messages)
        .where(
          or(
            eq(messages.sender_id, user.intra_user_id),
            eq(messages.receiver_id, user.intra_user_id),
          ),
        );
      if (dbMessages) {
        console.log('userMessages: availeble');
      } else {
        console.log('userMessages: none');
      }

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
          const otherUser = await this.getAnyUserFromDataBase(otherUserId);
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
          const groupChat = await db
            .select()
            .from(schema.groupChats)
            .where(eq(schema.groupChats.group_chat_id, message.group_chat_id));
          if (!groupChat) {
            continue;
          }

          field.messageId = message.message_id;
          field.type = 'gm';
          field.title = groupChat[0].group_name;
          field.image = groupChat[0].group_image;
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
}
