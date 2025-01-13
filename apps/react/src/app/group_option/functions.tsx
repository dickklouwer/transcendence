import { ChatSettings } from '@repo/db';

export enum Permissions {
  BANNED = 0,
  ADMIN = 1,
  OWNER = 2,
};

export function isOwner(settings: ChatSettings, id: number): boolean {
  const idx: number = settings.userId.indexOf(id);
  return ((settings.userPermission[idx] >> Permissions.OWNER & 1) == 1);
}

export function isAdmin(settings: ChatSettings, id: number): boolean {
  if (settings === undefined) return false;
  const idx: number = settings.userId.indexOf(id);
  return ((settings.userPermission[idx] >> Permissions.ADMIN & 1) == 1);
}

export function toggleAdmin(
  id: number,
  settings: ChatSettings,
  update: React.Dispatch<React.SetStateAction<ChatSettings | undefined>>) {

  if (settings === null) return;

  const idx: number = settings.userId.indexOf(id);
  // Clone the object and update the permission
  console.log("perms: ", settings.userPermission[idx], toBinary(settings.userPermission[idx]));
  settings.userPermission[idx] >> 1 & 1 ?
    settings.userPermission[idx] = settings.userPermission[idx] & ~(1 << 1) :
    settings.userPermission[idx] = settings.userPermission[idx] | 1 << 1;
  console.log("perms: ", settings.userPermission[idx], toBinary(settings.userPermission[idx]));

  // isAdmin >> 1 & 1
  // ((isAdmin >> 1) | 1) = 1
  // isOwner >> 2 & 1
  // isOwner >> 2 
  // isBanned >> 3 & 1

  // value | 0010 // second bit true
  // value & 1101 // second bit false
  // value ! 1 >> 1 // secons bit true
  // vlaue & ~(1 >> 1) // second bit false

  // 1110
  // 1010
  // pers = pers & ~(1 << 2)
  // pers >> 2 & 1 = ``
  // 11

  // Update the state
  update(settings);
}

//TODO: remove this function
export function toBinary(n: number): string {
  n = Number(n);
  if (n == 0) return '0';
  var r = '';
  while (n != 0) {
    r = ((n & 1) ? '1' : '0') + r;
    n = n >>> 1;
  }
  return r;
}

