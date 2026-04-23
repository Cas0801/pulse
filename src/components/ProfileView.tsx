import { useMemo, useState } from 'react';
import { Settings, Share2, Bookmark } from 'lucide-react';
import type { Post, User } from '../types';
import { formatCompactCount } from '../lib/format';

interface ProfileViewProps {
  me: User;
  portfolioImages: string[];
  posts: Post[];
}

export default function ProfileView({ me, portfolioImages, posts }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'works' | 'saved' | 'tagged'>('works');
  const [banner, setBanner] = useState<string | null>(null);

  const savedPosts = useMemo(
    () => posts.filter((post) => post.viewerHasBookmarked).slice(0, 6),
    [posts],
  );
  const taggedPosts = useMemo(
    () =>
      posts
        .filter((post) => post.tags.length > 0)
        .slice(0, 6)
        .flatMap((post) => post.tags.map((tag) => ({ id: `${post.id}-${tag}`, tag, post })))
        .slice(0, 6),
    [posts],
  );

  async function handleShare() {
    const shareText = `${me.name} · ${me.username}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
        setBanner('个人主页信息已复制到剪贴板');
        return;
      }
    } catch {
      // fall through to lightweight feedback
    }

    setBanner(`分享内容：${shareText}`);
  }

  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 w-full z-40 bg-white/55 backdrop-blur-2xl border-b border-line/70 flex justify-between items-center px-5 py-5">
        <div>
          <div className="section-label">Profile</div>
          <div className="mt-1 text-lg font-semibold">个人主页</div>
        </div>
        <div className="flex items-center gap-2">
           <button
            className="ios-pill rounded-full p-2.5 text-ink/70 hover:text-accent transition-colors"
            onClick={() => void handleShare()}
          >
            <Share2 size={16} />
          </button>
          <button
            className="ios-pill rounded-full p-2.5 text-ink/70 hover:text-accent transition-colors"
            onClick={() => setBanner('设置中心正在准备中，后续会接更多账号偏好项')}
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto pb-32">
        {banner ? (
          <section className="px-5 pt-4">
            <div className="ios-panel rounded-[20px] px-4 py-3 flex items-center justify-between gap-3">
              <span className="text-sm text-ink/70">{banner}</span>
              <button className="text-sm font-medium text-accent" onClick={() => setBanner(null)}>
                关闭
              </button>
            </div>
          </section>
        ) : null}
        <section className="px-5 py-6">
          <div className="ios-card rounded-[32px] p-6">
          <div className="flex items-start justify-between mb-6">
            <div className="w-22 h-22 rounded-[28px] border border-white/80 p-1 bg-bg shadow-sm">
              <img alt="Profile" className="w-20 h-20 rounded-[24px] object-cover" src={me.avatar} referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col items-end">
              <div className="ios-pill rounded-full px-3 py-1.5 flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                <span className="text-[11px] font-semibold text-accent">在线</span>
              </div>
              <span className="mt-2 text-[12px] text-ink/45">Pulse Creator</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-[30px] font-semibold text-ink">{me.name}</h2>
              <p className="text-[14px] font-medium text-accent">{me.username}</p>
            </div>
            
            <div className="ios-panel rounded-[24px] p-5 relative">
              <div className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center opacity-20">
                <Bookmark size={14} />
              </div>
              <p className="text-[15px] text-ink/80 leading-7">
                {me.bio}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="ios-panel rounded-[22px] p-4 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold text-ink leading-none">{me.stats?.posts ?? 0}</span>
              <span className="text-[11px] mt-1 text-ink/45">Posts</span>
            </div>
            <div className="ios-panel rounded-[22px] p-4 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold text-ink leading-none">{formatCompactCount(me.stats?.followers ?? 0)}</span>
              <span className="text-[11px] mt-1 text-ink/45">Followers</span>
            </div>
            <div className="ios-panel rounded-[22px] p-4 flex flex-col items-center justify-center">
              <span className="text-xl font-semibold text-ink leading-none">{me.stats?.following ?? 0}</span>
              <span className="text-[11px] mt-1 text-ink/45">Following</span>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button
              className="ios-primary-btn flex-1"
              onClick={() => setBanner('资料编辑入口已接通，当前可继续扩展成表单编辑页')}
            >
              编辑资料
            </button>
            <button className="ios-secondary-btn px-6" onClick={() => void handleShare()}>
              分享
            </button>
          </div>
          </div>
        </section>

        <section className="px-5">
          <div className="ios-panel rounded-[26px] p-2">
          <div className="grid grid-cols-3 gap-2">
            <button
              className={`rounded-[18px] py-3 text-sm font-semibold ${activeTab === 'works' ? 'text-accent bg-[#dcebff]' : 'text-ink/55'}`}
              onClick={() => setActiveTab('works')}
            >
              作品
            </button>
            <button
              className={`rounded-[18px] py-3 text-sm font-medium ${activeTab === 'saved' ? 'text-accent bg-[#dcebff]' : 'text-ink/55'}`}
              onClick={() => setActiveTab('saved')}
            >
              收藏
            </button>
            <button
              className={`rounded-[18px] py-3 text-sm font-medium ${activeTab === 'tagged' ? 'text-accent bg-[#dcebff]' : 'text-ink/55'}`}
              onClick={() => setActiveTab('tagged')}
            >
              被标记
            </button>
          </div>
          </div>

          {activeTab === 'works' ? (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {portfolioImages.map((img, i) => (
                <div key={i} className="aspect-square rounded-[22px] relative group overflow-hidden bg-surface-container ios-card">
                  <img alt={`Works ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" src={img} referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-ink/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity pointer-events-none">
                     <div className="text-[11px] text-white font-semibold">作品 {i + 1}</div>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {activeTab === 'saved' ? (
            <div className="mt-4 space-y-3">
              {savedPosts.length > 0 ? savedPosts.map((post) => (
                <div key={`${post.id}-saved`} className="ios-card rounded-[24px] px-4 py-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <div className="text-sm font-semibold text-ink">{post.author.name}</div>
                      <div className="mt-1 text-[13px] text-ink/60 line-clamp-2">{post.content}</div>
                    </div>
                    <Bookmark size={16} className="text-accent shrink-0" />
                  </div>
                </div>
              )) : (
                <div className="ios-panel rounded-[22px] px-4 py-5 text-sm text-ink/55">
                  你收藏的内容会显示在这里。
                </div>
              )}
            </div>
          ) : null}

          {activeTab === 'tagged' ? (
            <div className="grid grid-cols-2 gap-3 mt-4">
              {taggedPosts.map((item) => (
                <div key={item.id} className="ios-card rounded-[22px] px-4 py-4">
                  <div className="text-[11px] font-semibold text-accent">#{item.tag}</div>
                  <div className="mt-2 text-sm font-semibold text-ink">{item.post.author.name}</div>
                  <div className="mt-1 text-[13px] text-ink/60 line-clamp-2">{item.post.content}</div>
                </div>
              ))}
            </div>
          ) : null}
        </section>
      </main>
    </div>
  );
}
