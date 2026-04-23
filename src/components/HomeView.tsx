import TopBar from './TopBar';
import Stories from './Stories';
import PostCard from './PostCard';
import StateCard from './StateCard';
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
  commentErrorByPost?: Record<string, string | null>;
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
  commentErrorByPost = {},
  onLoadComments,
  onCreateComment,
}: HomeViewProps) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <TopBar source={source} posts={posts} />
      <main className="flex-1 px-4 pt-4 pb-28 overflow-y-auto no-scrollbar lg:px-7 lg:pb-8">
        <Stories stories={stories} />
        <div className="mt-4 space-y-0">
          <div className="mb-4 flex items-end justify-between px-1">
            <div>
              <div className="section-label">Latest Posts</div>
              <h2 className="mt-1 text-[24px] font-semibold text-ink lg:text-[28px]">内容流</h2>
              <p className="mt-1 text-[13px] text-ink/52">按时间与互动优先级混合展示，突出内容阅读与参与效率。</p>
            </div>
            <span className="text-[12px] font-medium text-ink/45">
              {source === 'supabase' ? 'Supabase Cloud' : 'Mock Feed'}
            </span>
          </div>
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onToggleLike={onToggleLike}
                onToggleBookmark={onToggleBookmark}
                comments={commentsByPost[post.id] ?? []}
                isCommentsLoading={commentLoadingByPost[post.id] ?? false}
                isCommentSubmitting={commentSubmittingByPost[post.id] ?? false}
                commentError={commentErrorByPost[post.id] ?? null}
                onLoadComments={onLoadComments}
                onCreateComment={onCreateComment}
              />
            ))
          ) : (
            <StateCard
              compact
              tone="empty"
              eyebrow="Feed Empty"
              title="内容流还没有启动"
              description="当前还没有动态内容，发布第一条内容来建立这个社交空间的初始节奏。"
            />
          )}
        </div>
      </main>
    </div>
  );
}
