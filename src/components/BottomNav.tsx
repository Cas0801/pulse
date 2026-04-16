import { motion } from 'motion/react';
import { Home, Compass, Plus, User as UserIcon, MessageSquare } from 'lucide-react';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [
    { id: 'home', icon: Home, label: '首页' },
    { id: 'discover', icon: Compass, label: '发现' },
    { id: 'create', icon: Plus, label: '发布', isFab: true },
    { id: 'messages', icon: MessageSquare, label: '消息' },
    { id: 'profile', icon: UserIcon, label: '我的' },
  ];

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] z-50 flex border-t border-line bg-bg">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        if (tab.isFab) {
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="flex-1 border-r border-line py-3 flex items-center justify-center bg-ink text-bg hover:opacity-90 transition-opacity"
            >
              <Plus size={20} />
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 border-r last:border-r-0 border-line py-3 flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive ? 'bg-ink text-bg' : 'text-ink hover:bg-surface-container'
            }`}
          >
            <tab.icon size={16} />
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
