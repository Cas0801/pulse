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
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[398px] z-50 lg:hidden">
      <div className="ios-shell grid grid-cols-5 rounded-[28px] border border-white/75 px-2 py-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        if (tab.isFab) {
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className="mx-1 flex items-center justify-center rounded-[20px] bg-accent text-white shadow-[0_12px_24px_rgba(10,132,255,0.35)] transition-transform active:scale-95"
            >
              <Plus size={20} />
            </button>
          );
        }

        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`mx-1 rounded-[20px] py-2.5 flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive ? 'bg-[#dcebff] text-accent' : 'text-ink/55 hover:bg-white/60'
            }`}
          >
            <tab.icon size={16} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
      </div>
    </nav>
  );
}
