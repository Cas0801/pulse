import { useDeferredValue, useMemo, useState } from 'react';
import { Search, Heart, ChevronRight } from 'lucide-react';
import type { DiscoverData } from '../types';
import { formatCompactCount } from '../lib/format';

interface DiscoverViewProps {
  discover: DiscoverData;
}

export default function DiscoverView({ discover }: DiscoverViewProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(discover.categories[0] ?? 'FOR_YOU');
  const [showAll, setShowAll] = useState(false);
  const deferredQuery = useDeferredValue(query);

  const filteredGalleries = useMemo(() => {
    const keyword = deferredQuery.trim().toLowerCase();

    return discover.galleries.filter((gallery) => {
      const matchesCategory = selectedCategory === 'FOR_YOU' || gallery.category === selectedCategory;
      const matchesKeyword =
        keyword.length === 0 ||
        `${gallery.title} ${gallery.category}`.toLowerCase().includes(keyword);

      return matchesCategory && matchesKeyword;
    });
  }, [deferredQuery, discover.galleries, selectedCategory]);

  const visibleGalleries = showAll ? filteredGalleries : filteredGalleries.slice(0, 3);

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
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </header>

      <main className="px-5 pt-5 pb-28">
        <div className="flex gap-2 mb-8 overflow-x-auto no-scrollbar">
          {discover.categories.map((cat, i) => (
            <button
              key={cat}
              onClick={() => {
                setSelectedCategory(cat);
                setShowAll(false);
              }}
              className={`ios-pill shrink-0 px-4 py-2.5 text-[12px] font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat || (i === 0 && selectedCategory === discover.categories[0])
                  ? 'bg-[#dcebff] text-accent'
                  : 'text-ink/65 hover:text-ink'
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
            <button
              className="flex items-center gap-1 text-[12px] font-medium text-accent"
              onClick={() => setShowAll((current) => !current)}
            >
              {showAll ? '收起' : '全部查看'} <ChevronRight size={14} className={`transition-transform ${showAll ? 'rotate-90' : ''}`} />
            </button>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {visibleGalleries.map((gallery) => (
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
            {visibleGalleries.length === 0 ? (
              <div className="ios-panel rounded-[24px] px-5 py-6 text-sm text-ink/55">
                当前筛选条件下还没有结果，试试切换分类或修改搜索词。
              </div>
            ) : null}
          </div>
        </section>
      </main>
    </div>
  );
}
