export type UserState = 'Online' | 'Offline' | 'In-Game' | 'Idle';

export interface User {
  user_id: number;
  intra_user_id: number;
  user_name: string;
  nick_name?: string;
  token?: string;
  two_factor_secret?: string;
  is_two_factor_enabled?: boolean;
  email: string;
  password?: string;
  state: 'Online' | 'Offline' | 'In-Game' | 'Idle';
  image_url?: string;
}
