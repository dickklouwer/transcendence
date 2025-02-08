import { ChatSettings, ChatsUsers } from '@repo/db';

enum Shifts {
  ADMIN = 0,
  OWNER = 1,
  BANNED = 3,
};

export function findChatsUsers(settings: ChatSettings, id: number): ChatsUsers | undefined {
  for (let i: number = 0; i < settings.userInfo.length; i++) {
    const chatUser = settings.userInfo[i];
    if (chatUser.intra_user_id === id) 
      return chatUser;
  }
  return undefined;
}

export function isOwner(settings: ChatSettings, id: number): boolean {
  const user : ChatsUsers = findChatsUsers(settings, id);
  return (user.is_owner);
}

export function isAdmin(settings: ChatSettings, id: number): boolean {
  const user : ChatsUsers = findChatsUsers(settings, id);
  return (user.is_admin);
}