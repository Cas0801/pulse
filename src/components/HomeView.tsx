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
      <main className="flex-1 px-5 pt-5 pb-28 overflow-y-auto no-scrollbar">
        <Stories stories={stories} />
        <div className="mt-3 space-y-0">
          <div className="flex items-end justify-between mb-4 px-1">
            <div>
              <div className="section-label">Latest Posts</div>
              <h2 className="mt-1 text-[26px] font-semibold text-ink">动态</h2>
            </div>
            <span className="text-[12px] font-medium text-ink/45">
              {source === 'supabase' ? 'Supabase Cloud' : 'Mock Feed'}
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
