import { Search, Bell } from 'lucide-react';

interface TopBarProps {
  source: 'supabase' | 'mock';
}

export default function TopBar({ source }: TopBarProps) {
  return (
    <header className="sticky top-0 w-full z-40 bg-white/55 backdrop-blur-2xl border-b border-line/70 flex flex-col">
      <div className="flex justify-between items-center px-6 pt-5 pb-3">
        <div>
          <div className="section-label">For You</div>
          <h1 className="mt-1 text-[30px] leading-none font-semibold text-ink">Pulse</h1>
        </div>
        <div className="flex items-center gap-4">
          <button className="ios-pill rounded-full p-2.5 text-ink/80 hover:text-accent transition-colors">
            <Search size={18} />
          </button>
          <button className="relative ios-pill rounded-full p-2.5 text-ink/80 hover:text-accent transition-colors">
            <Bell size={18} />
            <span className="absolute top-2 right-2 w-2 h-2 bg-accent rounded-full border border-white"></span>
          </button>
        </div>
      </div>
      
      <div className="flex justify-between items-center px-6 pb-4">
        <div className="text-sm text-ink/65">
          今日灵感、动态与创作更新
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${source === 'supabase' ? 'bg-[#dff0ff] text-accent' : 'bg-white text-ink/70'} ios-pill`}>
          {source === 'supabase' ? 'Cloud Live' : 'Demo'}
        </span>
      </div>
    </header>
  );
}
