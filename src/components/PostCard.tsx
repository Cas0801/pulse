import { Heart, MessageCircle, Send, MoreHorizontal, Bookmark } from 'lucide-react';
import { Post as PostType } from '../types';
import { formatCompactCount } from '../lib/format';

interface PostCardProps {
  post: PostType;
}

export default function PostCard({ post }: PostCardProps) {
  return (
    <article className="bg-[#D9D8D4]/20 border border-line mb-4 transition-colors hover:bg-[#D9D8D4]/40">
      <div className="border-b border-line flex items-center justify-between px-4 py-2 bg-line/[0.03]">
        <div className="flex items-center gap-3">
          <img alt={post.author.name} className="w-8 h-8 rounded-none border border-line object-cover" src={post.author.avatar} referrerPolicy="no-referrer" />
          <div>
            <h3 className="font-bold text-xs uppercase tracking-tight text-ink">{post.author.name}</h3>
            <p className="font-mono text-[9px] opacity-60 uppercase">{post.timestamp}</p>
          </div>
        </div>
        <button className="p-1 hover:bg-ink hover:text-bg transition-colors">
          <MoreHorizontal size={14} />
        </button>
      </div>
      
      <div className="p-4 border-b border-line">
        <p className="text-sm text-ink leading-snug font-medium mb-3">
          {post.content}
        </p>

        {post.type === 'quote' ? (
          <div className="bg-bg border border-line p-4 relative overflow-hidden">
             <div className="absolute top-0 left-0 w-1 h-full bg-line" />
             <p className="text-sm text-ink italic font-serif leading-relaxed">
               {post.content}
             </p>
          </div>
        ) : post.type === 'gallery' && post.images ? (
          <div className="grid grid-cols-2 gap-1 border border-line bg-line p-1">
            <div className="bg-bg h-48 overflow-hidden">
              <img alt="Gallery 1" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" src={post.images[0]} referrerPolicy="no-referrer" />
            </div>
            <div className="grid grid-rows-2 gap-1 h-48">
              <div className="bg-bg overflow-hidden border-l border-line">
                <img alt="Gallery 2" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" src={post.images[1]} referrerPolicy="no-referrer" />
              </div>
              <div className="bg-bg overflow-hidden relative border-l border-t border-line">
                <img alt="Gallery 3" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" src={post.images[2]} referrerPolicy="no-referrer" />
                <div className="absolute inset-0 bg-ink/60 flex items-center justify-center">
                  <span className="text-bg font-mono text-sm font-bold">+05</span>
                </div>
              </div>
            </div>
          </div>
        ) : post.image ? (
          <div className="border border-line overflow-hidden aspect-[4/5] bg-bg">
            <img alt="Post visual" className="w-full h-full object-cover grayscale hover:grayscale-0 transition-all duration-500" src={post.image} referrerPolicy="no-referrer" />
          </div>
        ) : null}
      </div>

      <div className="flex items-center justify-between px-3 py-2 bg-line/[0.03]">
        <div className="flex items-center gap-6">
          <button className="flex items-center gap-2 group">
            <Heart size={16} className="text-ink group-hover:text-accent transition-colors" />
            <span className="font-mono text-[10px] font-bold group-hover:text-accent transition-colors">{formatCompactCount(post.likes)}</span>
          </button>
          <button className="flex items-center gap-2 group">
            <MessageCircle size={16} className="text-ink group-hover:text-ink transition-colors" />
            <span className="font-mono text-[10px] font-bold group-hover:text-ink transition-colors">{post.comments}</span>
          </button>
        </div>
        <div className="flex gap-4">
          <button className="text-ink opacity-60 hover:opacity-100 transition-opacity">
            <Bookmark size={16} />
          </button>
          <button className="text-ink opacity-60 hover:opacity-100 transition-opacity">
            <Send size={16} />
          </button>
        </div>
      </div>
    </article>
  );
}
