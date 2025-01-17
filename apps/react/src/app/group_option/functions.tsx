import { Permissions, ChatSettings } from '@repo/db';

export function isOwner(settings: ChatSettings, id: number): boolean {
  const idx: number = settings.userId.indexOf(id);
  return ((settings.userPermission[idx] >> Permissions.OWNER & 1) == 1);
}

export function isAdmin(settings: ChatSettings, id: number): boolean {
  if (settings === undefined) return false;
  const idx: number = settings.userId.indexOf(id);
  return ((settings.userPermission[idx] >> Permissions.ADMIN & 1) == 1);
}

