import { useDeferredValue, useMemo, useState } from 'react';
import { Search, Bell, X } from 'lucide-react';
import type { Post } from '../types';

interface TopBarProps {
  source: 'supabase' | 'mock';
  posts: Post[];
}

export default function TopBar({ source, posts }: TopBarProps) {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNoticeOpen, setIsNoticeOpen] = useState(false);
  const [query, setQuery] = useState('');
  const deferredQuery = useDeferredValue(query);

  const filteredPosts = useMemo(() => {
    const keyword = deferredQuery.trim().toLowerCase();

    if (!keyword) {
      return posts.slice(0, 4);
    }

    return posts.filter((post) => {
      const haystack = [
        post.author.name,
        post.author.username,
        post.content,
        post.location ?? '',
        ...post.tags,
      ]
        .join(' ')
        .toLowerCase();

      return haystack.includes(keyword);
    });
  }, [deferredQuery, posts]);

  const notifications = useMemo(
    () =>
      posts.slice(0, 3).map((post, index) => ({
        id: `${post.id}-notice`,
        title: index === 0 ? '你的内容正在获得新的关注' : `${post.author.name} 的动态值得一看`,
        body: post.content,
        timestamp: post.timestamp,
      })),
    [posts],
  );

  return (
    <header className="sticky top-0 w-full z-40 bg-white/55 backdrop-blur-2xl border-b border-line/70 flex flex-col">
      <div className="flex justify-between items-center px-6 pt-5 pb-3">
        <div>
          <div className="section-label">For You</div>
          <h1 className="mt-1 text-[30px] leading-none font-semibold text-ink">Pulse</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="ios-pill rounded-full p-2.5 text-ink/80 hover:text-accent transition-colors"
            onClick={() => {
              setIsSearchOpen((current) => !current);
              setIsNoticeOpen(false);
            }}
          >
            <Search size={18} />
          </button>
          <button
            className="relative ios-pill rounded-full p-2.5 text-ink/80 hover:text-accent transition-colors"
            onClick={() => {
              setIsNoticeOpen((current) => !current);
              setIsSearchOpen(false);
            }}
          >
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

      {isSearchOpen ? (
        <div className="px-5 pb-4">
          <div className="ios-card rounded-[24px] p-4">
            <div className="flex items-center gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-ink/35" size={16} />
                <input
                  className="ios-input pl-11 pr-10"
                  placeholder="搜索作者、内容、地点或标签"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
                {query ? (
                  <button
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-ink/35"
                    onClick={() => setQuery('')}
                  >
                    <X size={14} />
                  </button>
                ) : null}
              </div>
            </div>

            <div className="mt-4 space-y-3">
              {filteredPosts.length > 0 ? (
                filteredPosts.slice(0, 4).map((post) => (
                  <div key={`${post.id}-search`} className="ios-panel rounded-[20px] px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-ink">{post.author.name}</div>
                        <div className="mt-1 text-[13px] text-ink/60 line-clamp-2">{post.content}</div>
                      </div>
                      <span className="text-[11px] text-ink/45 whitespace-nowrap">{post.timestamp}</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="ios-panel rounded-[20px] px-4 py-4 text-sm text-ink/55">
                  没有找到匹配的动态，可以换个关键词试试。
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}

      {isNoticeOpen ? (
        <div className="px-5 pb-4">
          <div className="ios-card rounded-[24px] p-4">
            <div className="section-label">Notifications</div>
            <div className="mt-3 space-y-3">
              {notifications.map((item) => (
                <div key={item.id} className="ios-panel rounded-[20px] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-ink">{item.title}</div>
                      <div className="mt-1 text-[13px] text-ink/60 line-clamp-2">{item.body}</div>
                    </div>
                    <span className="text-[11px] text-ink/45 whitespace-nowrap">{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
