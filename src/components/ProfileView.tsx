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
      <header className="sticky top-0 w-full z-40 bg-bg border-b border-line flex justify-between items-center px-6 py-4">
        <div className="font-serif italic text-xs opacity-70">User_Profile / System_Root</div>
        <div className="flex items-center gap-2">
           <button className="p-1 hover:bg-ink hover:text-bg transition-colors border border-transparent hover:border-line">
            <Share2 size={16} />
          </button>
          <button className="p-1 hover:bg-ink hover:text-bg transition-colors border border-transparent hover:border-line">
            <Settings size={16} />
          </button>
        </div>
      </header>

      <main className="max-w-screen-md mx-auto pb-32">
        <section className="px-6 py-8 border-b border-line bg-line/[0.02]">
          <div className="flex items-start justify-between mb-6">
            <div className="w-20 h-20 border border-line p-1 bg-bg shadow-sm">
              <img alt="Profile" className="w-full h-full object-cover grayscale" src={me.avatar} referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-accent"></span>
                <span className="font-mono text-[10px] font-bold">STATUS: ACTIVE</span>
              </div>
              <span className="font-mono text-[10px] opacity-60">ID: 0x77E4D</span>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tighter text-ink">{me.name}</h2>
              <p className="font-mono text-[11px] font-bold text-accent tracking-widest">{me.username}</p>
            </div>
            
            <div className="border border-line p-4 bg-bg relative">
              <div className="absolute top-0 right-0 w-8 h-8 flex items-center justify-center opacity-20">
                <Bookmark size={14} />
              </div>
              <p className="text-sm text-ink leading-relaxed font-serif italic opacity-80">
                {me.bio}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-3 border border-line mt-6 bg-line">
            <div className="bg-bg p-4 flex flex-col items-center justify-center border-r last:border-r-0 border-line">
              <span className="font-mono text-xl font-bold text-ink leading-none">{me.stats?.posts ?? 0}</span>
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold mt-1 opacity-50">Posts</span>
            </div>
            <div className="bg-bg p-4 flex flex-col items-center justify-center border-r last:border-r-0 border-line">
              <span className="font-mono text-xl font-bold text-ink leading-none">{formatCompactCount(me.stats?.followers ?? 0)}</span>
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold mt-1 opacity-50">Followers</span>
            </div>
            <div className="bg-bg p-4 flex flex-col items-center justify-center border-r last:border-r-0 border-line">
              <span className="font-mono text-xl font-bold text-ink leading-none">{me.stats?.following ?? 0}</span>
              <span className="text-[8px] uppercase tracking-[0.2em] font-bold mt-1 opacity-50">Following</span>
            </div>
          </div>

          <div className="flex gap-4 mt-6">
            <button className="flex-1 py-3 bg-ink text-bg font-mono text-[11px] font-bold uppercase tracking-widest hover:opacity-90 transition-opacity">
              Edit_System_Config
            </button>
            <button className="px-6 py-3 border border-line font-mono text-[11px] font-bold uppercase tracking-widest hover:bg-ink hover:text-bg transition-all">
              Share_Enc
            </button>
          </div>
        </section>

        <section>
          <div className="flex border-b border-line bg-line/[0.03]">
            <button className="flex-1 py-4 text-ink font-mono text-[10px] font-bold uppercase tracking-widest border-r border-line bg-ink text-bg">
              [ Works ]
            </button>
            <button className="flex-1 py-4 text-ink font-mono text-[10px] font-bold uppercase tracking-widest border-r border-line hover:bg-line/10 transition-colors">
              Saved_Data
            </button>
            <button className="flex-1 py-4 text-ink font-mono text-[10px] font-bold uppercase tracking-widest hover:bg-line/10 transition-colors">
              Tagged(_L)
            </button>
          </div>

          <div className="grid grid-cols-3 gap-0 border-b border-line">
            {portfolioImages.map((img, i) => (
              <div key={i} className="aspect-square border-r border-b border-line last:border-r-0 relative group overflow-hidden bg-surface-container">
                <img alt={`Works ${i}`} className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-700" src={img} referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-ink/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity border-4 border-accent/0 group-hover:border-accent/40 pointer-events-none">
                   <div className="font-mono text-[8px] text-bg font-bold">DATA_PTR: {i.toString(16).toUpperCase()}</div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
