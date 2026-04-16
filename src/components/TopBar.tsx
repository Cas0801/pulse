import { Search, Bell } from 'lucide-react';

interface TopBarProps {
  source: 'supabase' | 'mock';
}

export default function TopBar({ source }: TopBarProps) {
  return (
    <header className="sticky top-0 w-full z-40 bg-bg border-b border-line flex flex-col">
      <div className="flex justify-between items-center px-6 py-3 border-b border-line">
        <h1 className="text-xl font-black tracking-tighter text-ink uppercase">Pulse</h1>
        <div className="flex items-center gap-4">
          <button className="p-1 hover:bg-ink hover:text-bg transition-colors border border-transparent hover:border-line">
            <Search size={18} />
          </button>
          <button className="relative p-1 hover:bg-ink hover:text-bg transition-colors border border-transparent hover:border-line">
            <Bell size={18} />
            <span className="absolute top-0 right-0 w-1.5 h-1.5 bg-accent rounded-full border border-bg"></span>
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center px-6 py-2 bg-surface-container/30">
        <div className="font-serif italic text-xs opacity-70">
          Pulse / Main / Feed_Overview
        </div>
        <div className="flex gap-6">
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase opacity-60 leading-none">Status</span>
            <span className="font-mono text-[10px] font-bold">{source === 'supabase' ? 'SYNCED' : 'MOCK'}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[8px] uppercase opacity-60 leading-none">Uptime</span>
            <span className="font-mono text-[10px] font-bold">1,422H</span>
          </div>
        </div>
      </div>
    </header>
  );
}
