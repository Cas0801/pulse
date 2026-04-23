import TopBar from './TopBar';
import Stories from './Stories';
import PostCard from './PostCard';
import type { Post, PostBookmarkResult, PostComment, PostLikeResult, Story } from '../types';

interface HomeViewProps {
  posts: Post[];
  stories: Story[];
  source: 'supabase' | 'mock';
  onToggleLike?: (postId: string, nextLiked: boolean) => Promise<PostLikeResult | void> | void;
  onToggleBookmark?: (postId: string, nextBookmarked: boolean) => Promise<PostBookmarkResult | void> | void;
  commentsByPost?: Record<string, PostComment[]>;
  commentLoadingByPost?: Record<string, boolean>;
  commentSubmittingByPost?: Record<string, boolean>;
  onLoadComments?: (postId: string) => Promise<PostComment[] | void> | void;
  onCreateComment?: (postId: string, content: string) => Promise<PostComment | void> | void;
}

export default function HomeView({
  posts,
  stories,
  source,
  onToggleLike,
  onToggleBookmark,
  commentsByPost = {},
  commentLoadingByPost = {},
  commentSubmittingByPost = {},
  onLoadComments,
  onCreateComment,
}: HomeViewProps) {
  return (
    <div className="flex flex-col min-h-screen bg-bg">
      <TopBar source={source} posts={posts} />
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
            <PostCard
              key={post.id}
              post={post}
              onToggleLike={onToggleLike}
              onToggleBookmark={onToggleBookmark}
              comments={commentsByPost[post.id] ?? []}
              isCommentsLoading={commentLoadingByPost[post.id] ?? false}
              isCommentSubmitting={commentSubmittingByPost[post.id] ?? false}
              onLoadComments={onLoadComments}
              onCreateComment={onCreateComment}
            />
          ))}
        </div>
      </main>
    </div>
  );
}
