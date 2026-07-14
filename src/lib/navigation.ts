import { Compass, Home, MessageSquare, User as UserIcon, type LucideIcon } from 'lucide-react';

export interface NavigationItem {
  id: 'home' | 'discover' | 'messages' | 'profile';
  label: string;
  icon: LucideIcon;
}

export const PRIMARY_NAV_ITEMS: NavigationItem[] = [
  { id: 'home', label: '首页', icon: Home },
  { id: 'discover', label: '发现', icon: Compass },
  { id: 'messages', label: '消息', icon: MessageSquare },
  { id: 'profile', label: '我的', icon: UserIcon },
];
