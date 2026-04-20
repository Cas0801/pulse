import { useState } from 'react';
import {
  X,
  Edit2,
  Camera,
  Layout,
  MapPin,
  Users,
  Calendar,
  FileText,
  ChevronRight,
  Plus,
  Terminal,
} from 'lucide-react';
import type { CreatePostInput, PostVisibility, User } from '../types';

interface CreateViewProps {
  onClose: () => void;
  me: User;
  isSubmitting: boolean;
  onSubmit: (input: CreatePostInput) => Promise<void>;
}

export default function CreateView({ onClose, me, isSubmitting, onSubmit }: CreateViewProps) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('design, visual');
  const [visibility, setVisibility] = useState<PostVisibility>('public');

  async function handleSubmit() {
    await onSubmit({
      content,
      image: image.trim() || undefined,
      visibility,
      location: location.trim() || undefined,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      type: image.trim() ? 'standard' : 'quote',
    });
    setContent('');
    setImage('');
    setLocation('');
    setTags('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[linear-gradient(180deg,#f7fbff_0%,#eef5ff_52%,#e7f0ff_100%)] flex flex-col overflow-hidden">
      <header className="sticky top-0 w-full z-40 bg-white/60 backdrop-blur-2xl border-b border-line/70 flex justify-between items-center px-5 py-4">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="ios-pill rounded-full p-2 text-ink hover:text-accent transition-all">
            <X size={20} />
          </button>
          <div>
            <div className="section-label">New Post</div>
            <div className="text-sm text-ink/65">分享你的最新灵感</div>
          </div>
        </div>
        <button
          className="ios-primary-btn px-6 py-2.5 text-sm"
          disabled={isSubmitting || content.trim().length < 3}
          onClick={() => void handleSubmit()}
        >
          {isSubmitting ? '发布中...' : '发布'}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-5 pb-24 pt-5 space-y-6">
        <section className="relative">
          <div className="ios-card w-full aspect-[4/5] overflow-hidden relative rounded-[30px]">
            <img 
              alt="Portrait" 
              className="w-full h-full object-cover" 
              src={me.avatar} 
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 left-4 rounded-full bg-white/80 px-3 py-1 text-[11px] font-medium text-ink/70 backdrop-blur-xl">
              当前账号头像
            </div>
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <button className="ios-pill rounded-full p-2.5 text-ink hover:text-accent transition-all shadow-sm">
                <Edit2 size={16} />
              </button>
              <button className="ios-pill rounded-full p-2.5 text-ink hover:text-accent transition-all shadow-sm">
                <Camera size={16} />
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="ios-card rounded-[28px] p-0 focus-within:ring-2 focus-within:ring-accent/20 transition-all">
            <div className="px-4 pt-4 flex justify-between">
              <span className="section-label">内容</span>
              <Terminal size={12} className="opacity-30" />
            </div>
            <textarea 
              className="w-full bg-transparent border-none focus:ring-0 text-[15px] min-h-[140px] p-4 resize-none placeholder:text-ink/28 outline-none" 
              placeholder="这一刻你想分享什么？"
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <input
              className="ios-input"
              placeholder="图片链接（可选）"
              value={image}
              onChange={(event) => setImage(event.target.value)}
            />
            <input
              className="ios-input"
              placeholder="位置（可选）"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
            <input
              className="ios-input"
              placeholder="标签：design, ui, photo"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['public', 'followers', 'private'] as const).map((value) => (
              <button
                key={value}
                className={`rounded-full px-4 py-2 text-[12px] font-medium ${
                  visibility === value
                    ? 'bg-[#dcebff] text-accent'
                    : 'ios-pill text-ink/65'
                }`}
                onClick={() => setVisibility(value)}
              >
                {value}
              </button>
            ))}
            <button className="ios-pill text-ink/65 px-4 py-2 rounded-full text-[12px] font-medium flex items-center gap-1.5">
              <Plus size={12} /> 添加标签
            </button>
          </div>
        </section>

        <section className="ios-card rounded-[28px] overflow-hidden space-y-0">
          <div className="px-4 py-4">
            <span className="section-label">更多设置</span>
          </div>
          
          <div className="flex items-center justify-between group cursor-pointer border-t border-line/60 p-4 hover:bg-white/40">
            <div className="flex items-center gap-3">
              <div className="ios-pill rounded-2xl p-2.5 text-ink">
                <Layout size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">内容分类</p>
                <p className="text-[12px] text-ink/55">选择作品的主题与展示方式</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[12px] font-medium text-accent">摄影</span>
              <ChevronRight size={14} className="opacity-40" />
            </div>
          </div>

          <div className="flex items-center justify-between group cursor-pointer border-t border-line/60 p-4 hover:bg-white/40">
            <div className="flex items-center gap-3">
              <div className="ios-pill rounded-2xl p-2.5 text-ink">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">地理位置</p>
                <p className="text-[12px] text-ink/55">为这条内容补充位置说明</p>
              </div>
            </div>
            <ChevronRight size={14} className="opacity-40" />
          </div>

          <div className="flex items-center justify-between group cursor-pointer border-t border-line/60 p-4 hover:bg-white/40">
            <div className="flex items-center gap-3">
              <div className="ios-pill rounded-2xl p-2.5 text-ink">
                <Users size={16} />
              </div>
              <div>
                <p className="text-sm font-semibold text-ink">可见范围</p>
                <p className="text-[12px] text-ink/55">决定谁可以看到这条内容</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[12px] font-medium text-accent">
                {visibility}
              </span>
              <ChevronRight size={14} className="opacity-40" />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-3">
          <button className="ios-panel rounded-[24px] p-5 flex flex-col items-center gap-2 transition-all">
            <Calendar size={20} />
            <span className="text-[12px] font-medium leading-none">定时发布</span>
          </button>
          <button className="ios-panel rounded-[24px] p-5 flex flex-col items-center gap-2 transition-all">
            <FileText size={20} />
            <span className="text-[12px] font-medium leading-none">保存草稿</span>
          </button>
        </div>
      </main>
    </div>
  );
}
