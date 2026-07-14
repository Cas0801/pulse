import { Plus } from 'lucide-react';
import { PRIMARY_NAV_ITEMS } from '../lib/navigation';

interface BottomNavProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export default function BottomNav({ activeTab, onTabChange }: BottomNavProps) {
  const tabs = [PRIMARY_NAV_ITEMS[0], PRIMARY_NAV_ITEMS[1], { id: 'create' as const, icon: Plus, label: '发布', isFab: true }, PRIMARY_NAV_ITEMS[2], PRIMARY_NAV_ITEMS[3]];

  return (
    <nav className="fixed bottom-3 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-[398px] z-50 lg:hidden">
      <div className="ios-shell grid grid-cols-5 rounded-[24px] border border-white/75 px-2 py-2">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        
        if ('isFab' in tab && tab.isFab) {
          return (
            <button
              key={tab.id}
              aria-label="发布内容"
              onClick={() => onTabChange(tab.id)}
              className="mx-1 flex items-center justify-center rounded-[18px] bg-accent text-white shadow-[0_10px_22px_rgba(16,163,127,0.24)] transition-transform active:scale-95"
            >
              <Plus size={20} />
            </button>
          );
        }

        return (
            <button
              key={tab.id}
              aria-current={isActive ? 'page' : undefined}
            onClick={() => onTabChange(tab.id)}
            className={`mx-1 rounded-[20px] py-2.5 flex flex-col items-center justify-center gap-1 transition-colors ${
              isActive ? 'bg-[#eaf2ff] text-accent' : 'text-ink/55 hover:bg-white/60'
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
