import { ChatSettings } from '@repo/db';

export function isOwner(settings: ChatSettings, id: number): boolean {
  const idx: number = settings.userId.indexOf(id);
  return settings.userPermission[idx] >= 2;
}

export function isAdmin(settings: ChatSettings, id: number): boolean {
  const idx: number = settings.userId.indexOf(id);
  return settings.userPermission[idx] == 1 ||
    settings.userPermission[idx] == 3;
}


