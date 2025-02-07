import { ChatSettings } from '@repo/db';

enum Shifts {
  ADMIN = 0,
  OWNER = 1,
  BANNED = 3,
};

export function isOwner(settings: ChatSettings, id: number): boolean {
  const idx: number = settings.userId.indexOf(id);
  return ((settings.userPermission[idx] >> Shifts.OWNER & 1) == 1);
}

export function isAdmin(settings: ChatSettings, id: number): boolean {
  if (settings === undefined) return false;
  const idx: number = settings.userId.indexOf(id);
  return ((settings.userPermission[idx] >> Shifts.ADMIN & 1) == 1);
}

