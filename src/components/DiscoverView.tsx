import { useDeferredValue, useMemo, useState } from 'react';
import { Search, Heart, ChevronRight, Flame, Compass, Sparkles } from 'lucide-react';
import type { DiscoverData } from '../types';
import { formatCompactCount } from '../lib/format';
import StateCard from './StateCard';
import MediaLightbox from './MediaLightbox';

interface DiscoverViewProps {
  discover: DiscoverData;
}

const TREND_TAGS = ['设计系统', '创作者经济', '摄影灵感', '产品思考'];

export default function DiscoverView({ discover }: DiscoverViewProps) {
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(discover.categories[0] ?? 'FOR_YOU');
  const [showAll, setShowAll] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
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

  const visibleGalleries = showAll ? filteredGalleries : filteredGalleries.slice(0, 4);

  return (
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-40 border-b border-line/70 bg-white/88 px-5 pb-4 pt-4 backdrop-blur-xl lg:px-7">
        <div className="section-label">Discover Center</div>
        <div className="mt-2 flex items-end justify-between gap-4">
          <div>
            <h1 className="text-[28px] font-semibold text-ink">发现</h1>
            <p className="mt-1 text-sm text-ink/58">围绕主题、作者和趋势快速找到值得深入浏览的内容。</p>
          </div>
          <div className="hidden items-center gap-2 rounded-full bg-[#edf4ff] px-4 py-2 text-[12px] font-semibold text-accent lg:inline-flex">
            <Sparkles size={14} />
            Curated
          </div>
        </div>
        <div className="relative mt-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" size={16} />
          <input
            className="ios-input pl-11 pr-4"
            placeholder="搜索作品、主题、作者"
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
      </header>

      <main className="px-4 pb-28 pt-5 lg:px-7 lg:pb-10">
        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="ios-card overflow-hidden rounded-[28px]">
            <div className="aspect-[16/9] overflow-hidden">
              <img
                className="h-full w-full object-cover"
                src={discover.hero.image}
                alt={discover.hero.title}
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="p-6">
              <div className="mb-3 flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#e8f1ff] px-3 py-1 text-[11px] font-semibold text-accent">
                  {discover.hero.subtitle}
                </span>
                <span className="text-[11px] font-medium text-ink/42">Editor&apos;s pick</span>
              </div>
              <h2 className="text-[28px] font-semibold leading-tight text-ink">{discover.hero.title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-ink/60">
                聚焦创作趋势、视觉语言和内容热度，让发现页更像真实平台里的推荐工作台。
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="ios-card rounded-[28px] p-5">
              <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/42">
                <Flame size={14} />
                Trending
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {TREND_TAGS.map((tag) => (
                  <span key={tag} className="rounded-full bg-[#edf4ff] px-3 py-2 text-[12px] font-medium text-accent">
                    #{tag}
                  </span>
                ))}
              </div>
            </div>
            <div className="ios-card rounded-[28px] p-5">
              <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/42">
                <Compass size={14} />
                Explore Notes
              </div>
              <div className="mt-4 space-y-3 text-sm text-ink/62">
                <div className="ios-panel rounded-[20px] px-4 py-3">按分类、内容关键词和标签快速定位兴趣方向。</div>
                <div className="ios-panel rounded-[20px] px-4 py-3">发现页同时承担趋势看板和内容推荐的双重角色。</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="flex gap-2 overflow-x-auto no-scrollbar">
            {discover.categories.map((cat) => (
              <button
                key={cat}
                onClick={() => {
                  setSelectedCategory(cat);
                  setShowAll(false);
                }}
                className={`shrink-0 rounded-full px-4 py-2.5 text-[12px] font-medium transition-colors ${
                  selectedCategory === cat ? 'bg-accent text-white shadow-[0_10px_20px_rgba(22,119,255,0.18)]' : 'ios-pill text-ink/65 hover:text-ink'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </section>

        <section className="mt-7">
          <div className="mb-4 flex items-end justify-between gap-4 px-1">
            <div>
              <div className="section-label">Gallery Stream</div>
              <h3 className="mt-1 text-[24px] font-semibold text-ink">精选内容</h3>
              <p className="mt-1 text-[13px] text-ink/52">用更像真实社交发现页的方式组织推荐内容，而不是简单卡片堆叠。</p>
            </div>
            <button
              className="inline-flex items-center gap-1 text-[12px] font-semibold text-accent"
              onClick={() => setShowAll((current) => !current)}
            >
              {showAll ? '收起' : '查看全部'}
              <ChevronRight size={14} className={`transition-transform ${showAll ? 'rotate-90' : ''}`} />
            </button>
          </div>

          {visibleGalleries.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              {visibleGalleries.map((gallery, index) => (
                <button
                  key={gallery.id}
                  className={`ios-card overflow-hidden rounded-[28px] text-left ${index === 0 ? 'lg:col-span-2' : ''}`}
                  onClick={() => {
                    setViewerIndex(index);
                    setIsViewerOpen(true);
                  }}
                >
                  <div className={`overflow-hidden bg-surface-container ${index === 0 ? 'aspect-[16/8]' : index % 3 === 0 ? 'aspect-[4/5]' : 'aspect-[16/10]'}`}>
                    <img
                      className="h-full w-full object-cover transition-transform duration-500 hover:scale-[1.03]"
                      src={gallery.image}
                      alt={gallery.title}
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink/42">
                          {index === 0 ? 'Featured' : gallery.category}
                        </div>
                        <h4 className="mt-2 text-[18px] font-semibold text-ink">{gallery.title}</h4>
                      </div>
                      <div className="inline-flex items-center gap-2 rounded-full bg-[#edf4ff] px-3 py-2 text-[12px] font-medium text-accent">
                        <Heart size={14} />
                        {formatCompactCount(gallery.likes)}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <StateCard
              tone="empty"
              eyebrow="No Matches"
              title="当前筛选条件下没有结果"
              description="试试切换分类、清空搜索词，或者回到推荐流重新浏览正在上升的话题。"
            />
          )}
        </section>
      </main>
      <MediaLightbox
        isOpen={isViewerOpen}
        items={visibleGalleries.map((gallery) => ({
          id: gallery.id,
          url: gallery.image,
          title: gallery.title,
          subtitle: gallery.category,
          meta: 'Discover Selection',
        }))}
        activeIndex={viewerIndex}
        onNavigate={setViewerIndex}
        title="Discover"
        description="围绕作品质量、趋势热度和视觉语言构建的发现流，强调图像本身的表达力。"
        likesLabel={visibleGalleries[viewerIndex] ? formatCompactCount(visibleGalleries[viewerIndex].likes) : undefined}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
}
