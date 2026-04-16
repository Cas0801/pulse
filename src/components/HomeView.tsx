import TopBar from './TopBar';
import Stories from './Stories';
import PostCard from './PostCard';
import type { Post, Story } from '../types';

interface HomeViewProps {
  posts: Post[];
  stories: Story[];
  source: 'supabase' | 'mock';
}

export default function HomeView({ posts, stories, source }: HomeViewProps) {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <TopBar source={source} />
      <main className="flex-1 px-6 pt-6 pb-24 overflow-y-auto no-scrollbar">
        <Stories stories={stories} />
        <div className="mt-8 space-y-0">
          <div className="flex items-center justify-between mb-4 border-b-2 border-line pb-2">
            <h2 className="font-serif italic text-lg text-ink">Global_Feed</h2>
            <span className="font-mono text-[9px] font-bold opacity-40">
              SOURCE: {source.toUpperCase()}
            </span>
          </div>
          {posts.map((post) => (
            <PostCard key={post.id} post={post} />
          ))}
        </div>
      </main>
    </div>
  );
}
