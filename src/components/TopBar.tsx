import { useDeferredValue, useMemo, useState } from 'react';
import { Search, Bell, X, Sparkles, Users } from 'lucide-react';
import type { FeedMode, NotificationItem, Post } from '../types';

interface TopBarProps {
  source: 'supabase' | 'mock';
  posts: Post[];
  feedMode: FeedMode;
  onFeedModeChange: (mode: FeedMode) => void;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
}

export default function TopBar({
  source,
  posts,
  feedMode,
  onFeedModeChange,
  notifications,
  unreadNotificationCount,
}: TopBarProps) {
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

  const notificationPreview = useMemo(() => notifications.slice(0, 4), [notifications]);

  return (
    <header className="sticky top-0 w-full z-40 border-b border-line/70 bg-white/88 backdrop-blur-xl flex flex-col">
      <div className="flex justify-between items-center px-5 pt-4 pb-3 lg:px-7">
        <div className="min-w-0">
          <div className="section-label">Social Workspace</div>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-[28px] leading-none font-semibold text-ink">Pulse</h1>
            <span className={`hidden rounded-full px-3 py-1 text-[11px] font-semibold md:inline-flex ${source === 'supabase' ? 'bg-[#e7f1ff] text-accent' : 'bg-white text-ink/60'} ios-pill`}>
              {source === 'supabase' ? 'Live Cloud' : 'Demo Mode'}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-3">
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
            {unreadNotificationCount > 0 ? (
              <span className="absolute -right-1 -top-1 min-w-5 rounded-full bg-accent px-1.5 py-0.5 text-[10px] font-semibold text-white">
                {Math.min(unreadNotificationCount, 99)}
              </span>
            ) : null}
          </button>
        </div>
      </div>
      
      <div className="flex items-center justify-between gap-3 px-5 pb-4 lg:px-7">
        <div className="ios-panel inline-flex rounded-full p-1">
          <button
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${feedMode === 'for-you' ? 'bg-accent text-white shadow-[0_8px_20px_rgba(22,119,255,0.2)]' : 'text-ink/55'}`}
            onClick={() => onFeedModeChange('for-you')}
          >
            <Sparkles size={14} />
            推荐
          </button>
          <button
            className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-semibold transition-colors ${feedMode === 'following' ? 'bg-accent text-white shadow-[0_8px_20px_rgba(22,119,255,0.2)]' : 'text-ink/55'}`}
            onClick={() => onFeedModeChange('following')}
          >
            <Users size={14} />
            关注
          </button>
        </div>
        <div className="text-right">
          <div className="text-[13px] font-medium text-ink/72">今日灵感、动态与创作更新</div>
          <div className="mt-1 text-[11px] text-ink/46">为内容消费与互动场景优化的信息流布局</div>
        </div>
      </div>

      {isSearchOpen ? (
        <div className="px-5 pb-4 lg:px-7">
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
        <div className="px-5 pb-4 lg:px-7">
          <div className="ios-card rounded-[24px] p-4">
            <div className="section-label">Notifications</div>
            <div className="mt-3 space-y-3">
              {notificationPreview.length > 0 ? notificationPreview.map((item) => (
                <div key={item.id} className="ios-panel rounded-[20px] px-4 py-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-ink">{item.actor.name}</div>
                      <div className="mt-1 text-[13px] text-ink/60 line-clamp-2">{item.message}</div>
                    </div>
                    <span className="text-[11px] text-ink/45 whitespace-nowrap">{item.timestamp}</span>
                  </div>
                </div>
              )) : (
                <div className="ios-panel rounded-[20px] px-4 py-4 text-sm text-ink/55">
                  目前还没有新的互动通知，后续的点赞、评论和关注会出现在这里。
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
