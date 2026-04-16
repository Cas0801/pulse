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
    <div className="fixed inset-0 z-[60] bg-bg flex flex-col overflow-hidden">
      <header className="sticky top-0 w-full z-40 bg-bg border-b-2 border-line flex justify-between items-center px-6 py-5">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="text-ink hover:bg-ink hover:text-bg transition-all p-1 border border-transparent hover:border-line">
            <X size={20} />
          </button>
          <div className="font-serif italic text-sm opacity-70">Initialize_New_Packet / Transmission_UI</div>
        </div>
        <button
          className="bg-ink text-bg font-mono text-xs font-bold px-6 py-2 border border-line hover:bg-accent transition-colors disabled:opacity-50"
          disabled={isSubmitting || content.trim().length < 3}
          onClick={() => void handleSubmit()}
        >
          {isSubmitting ? 'SENDING...' : 'EXECUTE_CMD'}
        </button>
      </header>

      <main className="flex-1 overflow-y-auto no-scrollbar px-6 pb-24 pt-4 space-y-6">
        <section className="relative">
          <div className="w-full aspect-[4/5] bg-surface-container border border-line overflow-hidden relative">
            <img 
              alt="Portrait" 
              className="w-full h-full object-cover grayscale" 
              src={me.avatar} 
              referrerPolicy="no-referrer"
            />
            <div className="absolute top-4 left-4 font-mono text-[10px] bg-bg/80 border border-line px-2 py-1">
              IMG_REF: PORTRAIT_01
            </div>
            <div className="absolute bottom-4 right-4 flex flex-col gap-2">
              <button className="bg-bg border border-line p-2 text-ink hover:bg-ink hover:text-bg transition-all shadow-sm">
                <Edit2 size={16} />
              </button>
              <button className="bg-bg border border-line p-2 text-ink hover:bg-ink hover:text-bg transition-all shadow-sm">
                <Camera size={16} />
              </button>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="bg-bg border border-line p-0 focus-within:ring-2 focus-within:ring-accent/20 transition-all">
            <div className="bg-line/[0.05] border-b border-line px-3 py-1 flex justify-between">
              <span className="font-mono text-[9px] font-bold opacity-60">RAW_TEXT_INPUT</span>
              <Terminal size={10} className="opacity-40" />
            </div>
            <textarea 
              className="w-full bg-transparent border-none focus:ring-0 text-sm min-h-[120px] p-4 resize-none font-mono placeholder:text-ink/20" 
              placeholder="Enter_Payload_Documentation..."
              value={content}
              onChange={(event) => setContent(event.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 gap-3">
            <input
              className="w-full bg-transparent border border-line px-4 py-3 text-sm font-mono placeholder:text-ink/30 outline-none focus:bg-line/[0.04]"
              placeholder="Image_URL(optional)"
              value={image}
              onChange={(event) => setImage(event.target.value)}
            />
            <input
              className="w-full bg-transparent border border-line px-4 py-3 text-sm font-mono placeholder:text-ink/30 outline-none focus:bg-line/[0.04]"
              placeholder="Location(optional)"
              value={location}
              onChange={(event) => setLocation(event.target.value)}
            />
            <input
              className="w-full bg-transparent border border-line px-4 py-3 text-sm font-mono placeholder:text-ink/30 outline-none focus:bg-line/[0.04]"
              placeholder="Tags: design, ui, photo"
              value={tags}
              onChange={(event) => setTags(event.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2">
            {(['public', 'followers', 'private'] as const).map((value) => (
              <button
                key={value}
                className={`px-3 py-1.5 border font-mono text-[9px] font-bold ${
                  visibility === value
                    ? 'bg-ink text-bg border-line'
                    : 'bg-line/[0.05] text-ink border-line'
                }`}
                onClick={() => setVisibility(value)}
              >
                [ {value.toUpperCase()} ]
              </button>
            ))}
            <button className="bg-bg text-ink px-3 py-1.5 border border-line border-dashed font-mono text-[9px] font-bold flex items-center gap-1.5 hover:bg-line hover:text-bg transition-colors">
              <Plus size={12} /> ATTACH_LBL
            </button>
          </div>
        </section>

        <section className="bg-bg border border-line p-0 space-y-0">
          <div className="bg-line/[0.05] border-b border-line px-3 py-1">
            <span className="font-mono text-[9px] font-bold opacity-60">SYSTEM_METADATA</span>
          </div>
          
          <div className="flex items-center justify-between group cursor-pointer border-b border-line p-4 hover:bg-line/[0.03]">
            <div className="flex items-center gap-3">
              <div className="bg-bg border border-line p-2 text-ink">
                <Layout size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-ink uppercase tracking-tight">Category_Mapping</p>
                <p className="font-mono text-[9px] opacity-60">Selection of domain register</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] font-bold text-accent tracking-tighter">PHOTO_GRA</span>
              <ChevronRight size={14} className="opacity-40" />
            </div>
          </div>

          <div className="flex items-center justify-between group cursor-pointer border-b border-line p-4 hover:bg-line/[0.03]">
            <div className="flex items-center gap-3">
              <div className="bg-bg border border-line p-2 text-ink">
                <MapPin size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-ink uppercase tracking-tight">Geo_Location</p>
                <p className="font-mono text-[9px] opacity-60">Coordinate metadata injection</p>
              </div>
            </div>
            <ChevronRight size={14} className="opacity-40" />
          </div>

          <div className="flex items-center justify-between group cursor-pointer p-4 hover:bg-line/[0.03]">
            <div className="flex items-center gap-3">
              <div className="bg-bg border border-line p-2 text-ink">
                <Users size={16} />
              </div>
              <div>
                <p className="text-xs font-bold text-ink uppercase tracking-tight">Access_Permissions</p>
                <p className="font-mono text-[9px] opacity-60">Read/Write ACL verification</p>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-mono text-[10px] font-bold text-accent tracking-tighter">
                {visibility.toUpperCase()}
              </span>
              <ChevronRight size={14} className="opacity-40" />
            </div>
          </div>
        </section>

        <div className="grid grid-cols-2 gap-0 border border-line bg-line">
          <button className="bg-bg p-5 flex flex-col items-center gap-2 hover:bg-ink hover:text-bg transition-all border-r border-line">
            <Calendar size={20} />
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest leading-none">Sched_Trans</span>
          </button>
          <button className="bg-bg p-5 flex flex-col items-center gap-2 hover:bg-ink hover:text-bg transition-all">
            <FileText size={20} />
            <span className="font-mono text-[9px] font-bold uppercase tracking-widest leading-none">Save_Local</span>
          </button>
        </div>
      </main>
    </div>
  );
}
