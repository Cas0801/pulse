import { Plus } from 'lucide-react';
import { Story } from '../types';

interface StoriesProps {
  stories: Story[];
}

export default function Stories({ stories }: StoriesProps) {
  return (
    <section className="flex gap-4 overflow-x-auto pb-6 no-scrollbar border-b border-line mb-6">
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className={`w-14 h-14 border border-line flex items-center justify-center overflow-hidden transition-all group cursor-pointer ${
            story.isMe 
              ? 'bg-line/5 border-dashed active:bg-line/10' 
              : 'ring-1 ring-line/20 ring-offset-2 ring-offset-bg hover:ring-accent'
          }`}>
            {story.isMe ? (
              <Plus size={18} className="text-ink opacity-60 group-hover:opacity-100" />
            ) : (
              <img 
                src={story.user.avatar} 
                alt={story.user.name} 
                className="w-full h-full object-cover grayscale group-hover:grayscale-0"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
          <span className="font-mono text-[8px] font-bold text-ink uppercase tracking-tighter truncate w-14 text-center opacity-60">
            {story.isMe ? 'USR_ROOT' : story.user.name.split(' ')[0].toUpperCase()}
          </span>
        </div>
      ))}
    </section>
  );
}
