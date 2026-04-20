import { Plus } from 'lucide-react';
import { Story } from '../types';

interface StoriesProps {
  stories: Story[];
}

export default function Stories({ stories }: StoriesProps) {
  return (
    <section className="flex gap-4 overflow-x-auto pb-6 no-scrollbar mb-6">
      {stories.map((story) => (
        <div key={story.id} className="flex flex-col items-center gap-2 flex-shrink-0">
          <div className={`w-16 h-16 rounded-full flex items-center justify-center overflow-hidden transition-all group cursor-pointer ios-card ${
            story.isMe 
              ? 'bg-white/70 active:scale-95' 
              : 'hover:-translate-y-0.5'
          }`}>
            {story.isMe ? (
              <Plus size={20} className="text-accent opacity-80 group-hover:opacity-100" />
            ) : (
              <img 
                src={story.user.avatar} 
                alt={story.user.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}
          </div>
          <span className="text-[11px] font-medium text-ink/70 truncate w-16 text-center">
            {story.isMe ? '你的故事' : story.user.name.split(' ')[0]}
          </span>
        </div>
      ))}
    </section>
  );
}
