import TopBar from './TopBar';
import Stories from './Stories';
import PostCard from './PostCard';
import StateCard from './StateCard';
import type { FeedMode, NotificationItem, Post, PostBookmarkResult, PostComment, PostLikeResult, ProfileFollowResult, Story } from '../types';

interface HomeViewProps {
  posts: Post[];
  stories: Story[];
  source: 'supabase' | 'mock';
  feedMode: FeedMode;
  onFeedModeChange: (mode: FeedMode) => void;
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  onToggleLike?: (postId: string, nextLiked: boolean) => Promise<PostLikeResult | void> | void;
  onToggleBookmark?: (postId: string, nextBookmarked: boolean) => Promise<PostBookmarkResult | void> | void;
  onToggleFollow?: (profileId: string, nextFollowing: boolean) => Promise<ProfileFollowResult | void> | void;
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
  feedMode,
  onFeedModeChange,
  notifications,
  unreadNotificationCount,
  onToggleLike,
  onToggleBookmark,
  onToggleFollow,
  commentsByPost = {},
  commentLoadingByPost = {},
  commentSubmittingByPost = {},
  commentErrorByPost = {},
  onLoadComments,
  onCreateComment,
}: HomeViewProps) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <TopBar
        source={source}
        posts={posts}
        feedMode={feedMode}
        onFeedModeChange={onFeedModeChange}
        notifications={notifications}
        unreadNotificationCount={unreadNotificationCount}
      />
      <main className="flex-1 px-4 pt-4 pb-28 overflow-y-auto no-scrollbar lg:px-7 lg:pb-8">
        <Stories stories={stories} />
        <div className="mt-4 space-y-0">
          <div className="mb-4 flex items-end justify-between px-1">
            <div>
              <div className="section-label">最新内容</div>
              <h2 className="mt-1 text-[24px] font-semibold text-ink lg:text-[28px]">{feedMode === 'following' ? '关注动态' : '推荐内容'}</h2>
              <p className="mt-1 text-[13px] text-ink/52">
                {feedMode === 'following' ? '查看你关注的人发布的内容。' : '发现值得浏览的新内容。'}
              </p>
            </div>
            <span className="text-[12px] font-medium text-ink/45">
              {source === 'supabase' ? '在线' : '离线'}
            </span>
          </div>
          {posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                onToggleLike={onToggleLike}
                onToggleBookmark={onToggleBookmark}
                onToggleFollow={onToggleFollow}
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
              eyebrow="内容为空"
              title={feedMode === 'following' ? '关注页还没有内容' : '还没有内容'}
              description={
                feedMode === 'following'
                  ? '先去关注几位创作者吧。'
                  : '发布第一条内容试试。'
              }
            />
          )}
        </div>
      </main>
    </div>
  );
}
