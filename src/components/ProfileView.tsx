import { useMemo, useState } from 'react';
import { Settings, Share2, Bookmark, Sparkles, Grid3X3, Tag } from 'lucide-react';
import type { Post, User } from '../types';
import { formatCompactCount } from '../lib/format';
import StateCard from './StateCard';
import MediaLightbox from './MediaLightbox';

interface ProfileViewProps {
  me: User;
  portfolioImages: string[];
  posts: Post[];
}

export default function ProfileView({ me, portfolioImages, posts }: ProfileViewProps) {
  const [activeTab, setActiveTab] = useState<'works' | 'saved' | 'tagged'>('works');
  const [banner, setBanner] = useState<string | null>(null);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [isViewerOpen, setIsViewerOpen] = useState(false);

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
    <div className="min-h-screen bg-transparent">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line/70 bg-white/88 px-5 py-4 backdrop-blur-xl lg:px-7">
        <div>
          <div className="section-label">个人主页</div>
          <div className="mt-1 text-[28px] font-semibold text-ink">用户主页</div>
        </div>
        <div className="flex items-center gap-2">
          <button className="ios-pill rounded-full p-2.5 text-ink/70 hover:text-accent transition-colors" onClick={() => void handleShare()}>
            <Share2 size={16} />
          </button>
          <button
            className="ios-pill rounded-full p-2.5 text-ink/70 hover:text-accent transition-colors"
            onClick={() => setBanner('设置功能开发中')}
          >
            <Settings size={16} />
          </button>
        </div>
      </header>

      <main className="px-4 pb-28 pt-5 lg:px-7 lg:pb-10">
        {banner ? (
          <section className="mb-4">
            <div className="ios-panel flex items-center justify-between gap-3 rounded-[20px] px-4 py-3">
              <span className="text-sm text-ink/70">{banner}</span>
              <button className="text-sm font-medium text-accent" onClick={() => setBanner(null)}>
                关闭
              </button>
            </div>
          </section>
        ) : null}

        <section className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="ios-card rounded-[30px] p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="rounded-[28px] border border-white/80 bg-bg p-1 shadow-sm">
                  <img alt="Profile" className="h-22 w-22 rounded-[24px] object-cover" src={me.avatar} referrerPolicy="no-referrer" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-[30px] font-semibold text-ink">{me.name}</h2>
                    <span className="rounded-full bg-[#eaf2ff] px-3 py-1 text-[11px] font-semibold text-accent">Creator</span>
                  </div>
                  <p className="mt-1 text-[14px] font-medium text-accent">{me.username}</p>
                  <p className="mt-4 max-w-xl text-[15px] leading-7 text-ink/74">{me.bio}</p>
                </div>
              </div>
              <div className="hidden rounded-full bg-[#eaf2ff] px-3 py-1 text-[11px] font-semibold text-accent lg:inline-flex">
                在线
              </div>
            </div>

            <div className="mt-6 grid grid-cols-3 gap-3">
              <div className="ios-panel rounded-[22px] p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-ink/42">Posts</div>
                <div className="mt-2 text-2xl font-semibold text-ink">{me.stats?.posts ?? 0}</div>
              </div>
              <div className="ios-panel rounded-[22px] p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-ink/42">Followers</div>
                <div className="mt-2 text-2xl font-semibold text-ink">{formatCompactCount(me.stats?.followers ?? 0)}</div>
              </div>
              <div className="ios-panel rounded-[22px] p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-ink/42">Following</div>
                <div className="mt-2 text-2xl font-semibold text-ink">{me.stats?.following ?? 0}</div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                className="ios-primary-btn flex-1"
                onClick={() => setBanner('编辑功能开发中')}
              >
                编辑资料
              </button>
              <button className="ios-secondary-btn px-6" onClick={() => void handleShare()}>
                分享主页
              </button>
            </div>
          </div>

          <div className="space-y-4">
            <div className="ios-card rounded-[30px] p-5">
              <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/42">
                <Sparkles size={14} />
                主页信息
              </div>
              <div className="mt-4 space-y-3 text-sm text-ink/62">
                <div className="ios-panel rounded-[20px] px-4 py-3">查看作品、收藏和常用标签。</div>
                <div className="ios-panel rounded-[20px] px-4 py-3">在这里管理你的公开主页内容。</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6">
          <div className="ios-panel grid grid-cols-3 gap-2 rounded-[26px] p-2">
            <button
              className={`inline-flex items-center justify-center gap-2 rounded-[16px] py-3 text-sm font-semibold ${activeTab === 'works' ? 'bg-accent text-white' : 'text-ink/55'}`}
              onClick={() => setActiveTab('works')}
            >
              <Grid3X3 size={15} />
              作品
            </button>
            <button
              className={`inline-flex items-center justify-center gap-2 rounded-[16px] py-3 text-sm font-semibold ${activeTab === 'saved' ? 'bg-accent text-white' : 'text-ink/55'}`}
              onClick={() => setActiveTab('saved')}
            >
              <Bookmark size={15} />
              收藏
            </button>
            <button
              className={`inline-flex items-center justify-center gap-2 rounded-[16px] py-3 text-sm font-semibold ${activeTab === 'tagged' ? 'bg-accent text-white' : 'text-ink/55'}`}
              onClick={() => setActiveTab('tagged')}
            >
              <Tag size={15} />
              标签
            </button>
          </div>

          {activeTab === 'works' ? (
            <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-3">
              {portfolioImages.length > 0 ? (
                portfolioImages.map((img, i) => (
                  <button
                    key={i}
                    className="ios-card group relative aspect-square overflow-hidden rounded-[24px] text-left"
                    onClick={() => {
                      setViewerIndex(i);
                      setIsViewerOpen(true);
                    }}
                  >
                    <img alt={`Works ${i}`} className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105" src={img} referrerPolicy="no-referrer" />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/55 to-transparent px-4 pb-4 pt-10">
                      <div className="text-sm font-semibold text-white">作品 {i + 1}</div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="col-span-full">
                  <StateCard
                    tone="empty"
                    eyebrow="暂无作品"
                    title="作品展示区还是空的"
                    description="上传一组作品图，或先发布一条内容。"
                  />
                </div>
              )}
            </div>
          ) : null}

          {activeTab === 'saved' ? (
            <div className="mt-4 grid gap-3">
              {savedPosts.length > 0 ? (
                savedPosts.map((post) => (
                  <div key={`${post.id}-saved`} className="ios-card rounded-[24px] px-4 py-4">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="text-sm font-semibold text-ink">{post.author.name}</div>
                        <div className="mt-1 text-[13px] text-ink/60 line-clamp-2">{post.content}</div>
                      </div>
                      <Bookmark size={16} className="shrink-0 text-accent" />
                    </div>
                  </div>
                ))
              ) : (
                <StateCard
                  tone="empty"
                  eyebrow="暂无收藏"
                  title="收藏夹还是空的"
                  description="你收藏的内容会显示在这里。"
                />
              )}
            </div>
          ) : null}

          {activeTab === 'tagged' ? (
            <div className="mt-4 grid grid-cols-1 gap-3 lg:grid-cols-2">
              {taggedPosts.length > 0 ? (
                taggedPosts.map((item) => (
                  <div key={item.id} className="ios-card rounded-[22px] px-4 py-4">
                    <div className="text-[11px] font-semibold text-accent">#{item.tag}</div>
                    <div className="mt-2 text-sm font-semibold text-ink">{item.post.author.name}</div>
                    <div className="mt-1 text-[13px] text-ink/60 line-clamp-2">{item.post.content}</div>
                  </div>
                ))
              ) : (
                <div className="col-span-full">
                  <StateCard
                    tone="empty"
                    eyebrow="暂无标签"
                    title="还没有带标签的内容"
                    description="带标签的内容会显示在这里。"
                  />
                </div>
              )}
            </div>
          ) : null}
        </section>
      </main>
      <MediaLightbox
        isOpen={isViewerOpen}
        items={portfolioImages.map((image, index) => ({
          id: `${me.id}-${index}`,
          url: image,
          title: `${me.name} · 作品 ${index + 1}`,
          subtitle: me.username,
          meta: '作品集',
        }))}
        activeIndex={viewerIndex}
        onNavigate={setViewerIndex}
        title={`${me.name} 的作品集`}
        description={me.bio}
        onClose={() => setIsViewerOpen(false)}
      />
    </div>
  );
}
