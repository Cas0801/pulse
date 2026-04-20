import { Settings, Grid, Share2, Bookmark, Tag } from 'lucide-react';
import type { User } from '../types';
import { formatCompactCount } from '../lib/format';

interface ProfileViewProps {
  me: User;
  portfolioImages: string[];
}

export default function ProfileView({ me, portfolioImages }: ProfileViewProps) {
  return (
    <div className="min-h-screen bg-bg">
      <header className="sticky top-0 w-full z-40 bg-white/55 backdrop-blur-2xl border-b border-line/70 flex justify-between items-center px-5 py-5">
        <div>
          <div className="section-label">Profile</div>
          <div className="mt-1 text-lg font-semibold">个人主页</div>
        </div>
        <div className="flex items-center gap-2">
           <button className="ios-pill rounded-full p-2.5 text-ink/70 hover:text-accent transition-colors">
            <Share2 size={16} />
          </button>
          <button className="ios-pill rounded-full p-2.5 text-ink/70 hover:text-accent transition-colors">
            <Settings size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto pb-32">
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
            <button className="ios-primary-btn flex-1">
              编辑资料
            </button>
            <button className="ios-secondary-btn px-6">
              分享
            </button>
          </div>
          </div>
        </section>

        <section className="px-5">
          <div className="ios-panel rounded-[26px] p-2">
          <div className="grid grid-cols-3 gap-2">
            <button className="rounded-[18px] py-3 text-accent text-sm font-semibold bg-[#dcebff]">
              作品
            </button>
            <button className="rounded-[18px] py-3 text-ink/55 text-sm font-medium">
              收藏
            </button>
            <button className="rounded-[18px] py-3 text-ink/55 text-sm font-medium">
              被标记
            </button>
          </div>
          </div>

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
        </section>
      </main>
    </div>
  );
}
