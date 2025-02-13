import { ChatSettings, ChatsUsers } from '@repo/db';

enum Shifts {
  ADMIN = 0,
  OWNER = 1,
  BANNED = 3,
};

// find the correct ChatsUsers in from the ChatSettings
export function findChatsUsers(settings: ChatSettings, id: number): ChatsUsers {
  let chatUser: ChatsUsers = settings.userInfo[0];

  for (let i: number = 0; i < settings.userInfo.length; i++) {
    chatUser = settings.userInfo[i];
    if (chatUser.intra_user_id === id) break;
  }
  return chatUser;
}

// check if user is owner
export function isOwner(settings: ChatSettings, id: number): boolean {
  const user : ChatsUsers = findChatsUsers(settings, id);
  return (user.is_owner);
}

// check if user is admin
export function isAdmin(settings: ChatSettings, id: number): boolean {
  const user : ChatsUsers = findChatsUsers(settings, id);
  return (user.is_admin);
}

// Check if user is allowed to edit group
export function isEditor(settings: ChatSettings, id: number): boolean {
  if (isOwner(settings, id) || isAdmin(settings, id)) return true;
  return false;
}
