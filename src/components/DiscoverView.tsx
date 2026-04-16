import { Search, Heart, ChevronRight } from 'lucide-react';
import type { DiscoverData } from '../types';
import { formatCompactCount } from '../lib/format';

interface DiscoverViewProps {
  discover: DiscoverData;
}

export default function DiscoverView({ discover }: DiscoverViewProps) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 w-full z-40 bg-bg border-b border-line px-6 py-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink/40" size={16} />
          <input
            className="w-full bg-line/[0.05] border border-line rounded-none pl-10 pr-4 py-2 text-ink font-mono text-xs focus:ring-1 focus:ring-line focus:bg-bg outline-none"
            placeholder="Search_Pulse_Registry"
            type="text"
          />
        </div>
      </header>

      <main className="px-6 pt-6 pb-24">
        <div className="flex border border-line bg-line mb-8 overflow-x-auto no-scrollbar">
          {discover.categories.map((cat, i) => (
            <button
              key={cat}
              className={`flex-1 px-4 py-3 font-mono text-[9px] font-bold whitespace-nowrap border-r last:border-r-0 border-line transition-colors ${
                i === 0 ? 'bg-ink text-bg' : 'bg-bg text-ink hover:bg-line/[0.05]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mb-10 border border-line relative group overflow-hidden bg-bg">
          <div className="aspect-[16/9] border-b border-line overflow-hidden">
             <img 
               className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-1000" 
               src={discover.hero.image} 
               alt={discover.hero.title}
               referrerPolicy="no-referrer"
             />
          </div>
          <div className="p-6 bg-bg flex flex-col gap-2">
            <div className="flex justify-between items-center">
               <span className="font-mono text-[10px] text-accent font-bold uppercase tracking-widest leading-none">
                 [ {discover.hero.subtitle} ]
               </span>
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-line/20"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-line/20"></div>
               </div>
            </div>
            <h2 className="text-2xl font-black uppercase tracking-tighter text-ink leading-tight">
              {discover.hero.title}
            </h2>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4 pb-2 border-b-2 border-line">
            <h3 className="font-serif italic text-lg text-ink">Curated_Galleries</h3>
            <button className="flex items-center gap-1 font-mono text-[9px] font-bold opacity-60 hover:opacity-100">
              VIEW_ALL <ChevronRight size={10} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {discover.galleries.map((gallery) => (
              <div key={gallery.id} className="border border-line bg-line/[0.02] flex flex-col group cursor-pointer hover:bg-line/[0.05] transition-colors">
                <div className="aspect-video border-b border-line overflow-hidden bg-surface-container">
                  <img 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500" 
                    src={gallery.image} 
                    alt={gallery.title}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-4 flex justify-between items-center bg-bg group-hover:bg-transparent transition-colors">
                  <p className="text-ink font-mono text-[11px] font-bold uppercase">{gallery.title}</p>
                  <div className="flex items-center gap-2">
                    <Heart size={14} className="text-ink group-hover:text-accent transition-colors" />
                    <span className="font-mono text-[10px] font-bold text-ink/60">{formatCompactCount(gallery.likes)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
