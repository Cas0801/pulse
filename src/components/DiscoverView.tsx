import { Search, Heart, ChevronRight } from 'lucide-react';
import type { DiscoverData } from '../types';
import { formatCompactCount } from '../lib/format';

interface DiscoverViewProps {
  discover: DiscoverData;
}

export default function DiscoverView({ discover }: DiscoverViewProps) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 w-full z-40 bg-white/55 backdrop-blur-2xl border-b border-line/70 px-5 pt-5 pb-4">
        <div className="section-label mb-3">Explore</div>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" size={16} />
          <input
            className="ios-input pl-11 pr-4"
            placeholder="搜索你感兴趣的作品、主题或作者"
            type="text"
          />
        </div>
      </header>

      <main className="px-5 pt-5 pb-28">
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
          {discover.categories.map((cat, i) => (
            <button
              key={cat}
              className={`ios-pill shrink-0 px-4 py-2.5 text-[12px] font-medium whitespace-nowrap transition-colors ${
                i === 0 ? 'bg-[#dcebff] text-accent' : 'text-ink/65 hover:text-ink'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="ios-card mb-10 rounded-[30px] relative group overflow-hidden">
          <div className="aspect-[16/9] overflow-hidden">
             <img 
               className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" 
               src={discover.hero.image} 
               alt={discover.hero.title}
               referrerPolicy="no-referrer"
             />
          </div>
          <div className="p-6 flex flex-col gap-2">
            <div className="flex justify-between items-center">
               <span className="rounded-full bg-[#dcebff] px-3 py-1 text-[11px] font-semibold text-accent">
                 {discover.hero.subtitle}
               </span>
               <div className="flex gap-1">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-line/80"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-line/80"></div>
               </div>
            </div>
            <h2 className="text-[28px] font-semibold text-ink leading-tight">
              {discover.hero.title}
            </h2>
          </div>
        </div>

        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <div>
              <div className="section-label">Curated</div>
              <h3 className="mt-1 text-[26px] font-semibold text-ink">精选画廊</h3>
            </div>
            <button className="flex items-center gap-1 text-[12px] font-medium text-accent">
              全部查看 <ChevronRight size={14} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {discover.galleries.map((gallery) => (
              <div key={gallery.id} className="ios-card rounded-[28px] flex flex-col group cursor-pointer overflow-hidden">
                <div className="aspect-video overflow-hidden bg-surface-container">
                  <img 
                    className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500" 
                    src={gallery.image} 
                    alt={gallery.title}
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="p-5 flex justify-between items-center transition-colors">
                  <p className="text-ink text-[15px] font-semibold">{gallery.title}</p>
                  <div className="flex items-center gap-2">
                    <Heart size={14} className="text-accent transition-colors" />
                    <span className="text-[13px] font-medium text-ink/60">{formatCompactCount(gallery.likes)}</span>
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
