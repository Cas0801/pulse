import { useState } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, Bookmark, Check, UserPlus } from 'lucide-react';
import { Post as PostType, PostBookmarkResult, PostComment, PostLikeResult, ProfileFollowResult } from '../types';
import { formatCompactCount } from '../lib/format';
import CommentsSheet from './CommentsSheet';
import StateCard from './StateCard';
import MediaLightbox from './MediaLightbox';

interface PostCardProps {
  post: PostType;
  onToggleLike?: (postId: string, nextLiked: boolean) => Promise<PostLikeResult | void> | void;
  onToggleBookmark?: (postId: string, nextBookmarked: boolean) => Promise<PostBookmarkResult | void> | void;
  onToggleFollow?: (profileId: string, nextFollowing: boolean) => Promise<ProfileFollowResult | void> | void;
  comments?: PostComment[];
  isCommentsLoading?: boolean;
  isCommentSubmitting?: boolean;
  commentError?: string | null;
  onLoadComments?: (postId: string) => Promise<PostComment[] | void> | void;
  onCreateComment?: (postId: string, content: string) => Promise<PostComment | void> | void;
}

export default function PostCard({
  post,
  onToggleLike,
  onToggleBookmark,
  onToggleFollow,
  comments = [],
  isCommentsLoading = false,
  isCommentSubmitting = false,
  commentError = null,
  onLoadComments,
  onCreateComment,
}: PostCardProps) {
  const [shared, setShared] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLikeBusy, setIsLikeBusy] = useState(false);
  const [isBookmarkBusy, setIsBookmarkBusy] = useState(false);
  const [isFollowBusy, setIsFollowBusy] = useState(false);
  const [feedback, setFeedback] = useState<{ tone: 'success' | 'error'; message: string } | null>(null);
  const [isViewerOpen, setIsViewerOpen] = useState(false);
  const [viewerIndex, setViewerIndex] = useState(0);
  const liked = post.viewerHasLiked ?? false;
  const saved = post.viewerHasBookmarked ?? false;
  const following = post.author.viewerIsFollowing ?? false;
  const displayLikes = post.likes;
  const galleryImages = post.images ?? (post.image ? [post.image] : []);

  function flashFeedback(next: { tone: 'success' | 'error'; message: string }) {
    setFeedback(next);
    window.setTimeout(() => {
      setFeedback((current) => (current?.message === next.message ? null : current));
    }, 2200);
  }

  async function handleToggleLike() {
    if (!onToggleLike || isLikeBusy) {
      return;
    }

    setIsLikeBusy(true);
    try {
      await onToggleLike(post.id, !liked);
      flashFeedback({
        tone: 'success',
        message: liked ? '已取消点赞' : '已加入点赞',
      });
    } catch {
      flashFeedback({
        tone: 'error',
        message: '点赞操作暂时没有完成',
      });
    } finally {
      setIsLikeBusy(false);
    }
  }

  async function handleToggleBookmark() {
    if (!onToggleBookmark || isBookmarkBusy) {
      return;
    }

    setIsBookmarkBusy(true);
    try {
      await onToggleBookmark(post.id, !saved);
      flashFeedback({
        tone: 'success',
        message: saved ? '已从收藏夹移除' : '已加入收藏夹',
      });
    } catch {
      flashFeedback({
        tone: 'error',
        message: '收藏操作暂时没有完成',
      });
    } finally {
      setIsBookmarkBusy(false);
    }
  }

  async function handleToggleFollow() {
    if (!onToggleFollow || isFollowBusy || post.author.isCurrentUser) {
      return;
    }

    setIsFollowBusy(true);
    try {
      await onToggleFollow(post.author.id, !following);
      flashFeedback({
        tone: 'success',
        message: following ? `已取消关注 ${post.author.name}` : `已关注 ${post.author.name}`,
      });
    } catch {
      flashFeedback({
        tone: 'error',
        message: '关注操作暂时没有完成',
      });
    } finally {
      setIsFollowBusy(false);
    }
  }

  async function handleOpenComments() {
    setIsCommentsOpen(true);
    if (onLoadComments) {
      await onLoadComments(post.id);
    }
  }

  async function handleCreateComment(content: string) {
    if (!onCreateComment) {
      return;
    }

    await onCreateComment(post.id, content);
  }

  async function handleShare() {
    const shareText = `${post.author.name}：${post.content}`;

    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareText);
      }
      setShared(true);
      flashFeedback({
        tone: 'success',
        message: '动态内容已复制，方便继续分享',
      });
    } catch {
      flashFeedback({
        tone: 'error',
        message: '分享文案复制失败，请稍后重试',
      });
    }
  }

  function openViewer(index = 0) {
    setViewerIndex(index);
    setIsViewerOpen(true);
  }

  return (
    <>
      <article className="ios-card mb-4 overflow-hidden rounded-[24px] transition-transform hover:-translate-y-0.5 lg:mb-5">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <img alt={post.author.name} className="h-11 w-11 rounded-full border border-white/80 object-cover shadow-sm" src={post.author.avatar} referrerPolicy="no-referrer" />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-[15px] tracking-tight text-ink">{post.author.name}</h3>
                <span className="text-[12px] text-ink/38">{post.author.username}</span>
              </div>
              <p className="text-[12px] text-ink/55">{post.timestamp}{post.location ? ` · ${post.location}` : ''}</p>
            </div>
            {!post.author.isCurrentUser ? (
              <button
                className={`ml-2 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-semibold transition-colors ${following ? 'bg-[#edf4ff] text-accent' : 'bg-accent text-white shadow-[0_8px_20px_rgba(22,119,255,0.16)]'} disabled:opacity-60`}
                onClick={() => void handleToggleFollow()}
                disabled={isFollowBusy}
              >
                {following ? <Check size={13} /> : <UserPlus size={13} />}
                {following ? '已关注' : '关注'}
              </button>
            ) : null}
          </div>
          <button className="ios-pill rounded-full p-2 text-ink/60 hover:text-accent transition-colors">
            <MoreHorizontal size={14} />
          </button>
        </div>

        <div className="px-5 pb-4">
          {feedback ? (
            <div className="mb-4">
              <StateCard
                compact
                tone={feedback.tone}
                title={feedback.tone === 'success' ? '操作已同步' : '操作没有完成'}
                description={feedback.message}
              />
            </div>
          ) : null}
          {post.type === 'quote' ? (
            <div className="ios-panel relative overflow-hidden rounded-[20px] p-5">
               <div className="absolute inset-y-4 left-0 w-1 rounded-full bg-accent/70" />
               <p className="pl-4 text-[17px] italic leading-relaxed text-ink">
                 {post.content}
               </p>
            </div>
          ) : post.type === 'gallery' && galleryImages.length > 0 ? (
            <div className="overflow-hidden rounded-[24px] border border-white/80 bg-white/80 p-1">
              <div className="mb-3 px-3 pt-3">
                <p className="text-[16px] leading-7 text-ink">{post.content}</p>
              </div>
              <div className="grid grid-cols-2 gap-1">
              {galleryImages.slice(0, 4).map((imageUrl, index) => (
                <button
                  key={`${post.id}-gallery-${index}`}
                  className={`relative overflow-hidden rounded-[16px] bg-bg ${galleryImages.length === 3 && index === 0 ? 'col-span-2 h-64' : galleryImages.length === 1 ? 'col-span-2 h-[420px]' : 'h-48'}`}
                  onClick={() => openViewer(index)}
                >
                  <img alt={`Gallery ${index + 1}`} className="h-full w-full object-cover" src={imageUrl} referrerPolicy="no-referrer" />
                  {index === 3 && galleryImages.length > 4 ? (
                    <div className="absolute inset-0 flex items-center justify-center bg-ink/28">
                      <span className="text-sm font-semibold text-white">+{galleryImages.length - 4}</span>
                    </div>
                  ) : null}
                </button>
              ))}
              </div>
            </div>
          ) : post.image ? (
            <button className="block w-full overflow-hidden rounded-[24px] border border-white/80 bg-white/80 p-1 text-left" onClick={() => openViewer(0)}>
              <div className="mb-3 px-3 pt-3">
                <p className="text-[16px] leading-7 text-ink">{post.content}</p>
              </div>
              <div className="aspect-[4/5] overflow-hidden rounded-[20px] bg-bg">
                <img alt="Post visual" className="h-full w-full object-cover" src={post.image} referrerPolicy="no-referrer" />
              </div>
            </button>
          ) : (
            <p className="mb-3 text-[15px] leading-7 text-ink">
              {post.content}
            </p>
          )}

          {post.tags.length > 0 ? (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.slice(0, 4).map((tag) => (
                <span key={`${post.id}-${tag}`} className="rounded-full bg-[#edf4ff] px-3 py-1 text-[11px] font-medium text-accent">
                  #{tag}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between border-t border-white/70 px-5 py-3.5">
          <div className="flex items-center gap-6">
            <button className="flex items-center gap-2 group" onClick={() => void handleToggleLike()} disabled={isLikeBusy}>
              <Heart
                size={18}
                className={`${liked ? 'fill-current text-accent' : 'text-ink/75'} group-hover:text-accent transition-colors`}
              />
              <span className="text-[13px] font-medium text-ink/70 group-hover:text-accent transition-colors">{formatCompactCount(displayLikes)}</span>
            </button>
            <button className="flex items-center gap-2 group" onClick={() => void handleOpenComments()}>
              <MessageCircle size={18} className="text-ink/75 transition-colors group-hover:text-accent" />
              <span className="text-[13px] font-medium text-ink/70 transition-colors group-hover:text-accent">{post.comments}</span>
            </button>
          </div>
          <div className="flex gap-4">
            <button
              className={`transition-colors ${saved ? 'text-accent' : 'text-ink/55 hover:text-accent'}`}
              onClick={() => void handleToggleBookmark()}
              disabled={isBookmarkBusy}
            >
              <Bookmark size={16} />
            </button>
            <button className={`transition-colors ${shared ? 'text-accent' : 'text-ink/55 hover:text-accent'}`} onClick={() => void handleShare()}>
              <Send size={16} />
            </button>
          </div>
        </div>
      </article>
      <CommentsSheet
        comments={comments}
        count={post.comments}
        isOpen={isCommentsOpen}
        isLoading={isCommentsLoading}
        isSubmitting={isCommentSubmitting}
        errorMessage={commentError}
        onClose={() => setIsCommentsOpen(false)}
        onSubmit={handleCreateComment}
      />
      <MediaLightbox
        isOpen={isViewerOpen}
        items={galleryImages.map((item, index) => ({
          id: `${post.id}-${index}`,
          url: item,
          title: post.author.name,
          subtitle: `${post.author.username}${post.location ? ` · ${post.location}` : ''}`,
          meta: `作品 ${index + 1} / ${galleryImages.length}`,
        }))}
        activeIndex={viewerIndex}
        onNavigate={setViewerIndex}
        title={post.author.name}
        description={post.content}
        likesLabel={formatCompactCount(post.likes)}
        commentsLabel={String(post.comments)}
        onClose={() => setIsViewerOpen(false)}
      />
    </>
  );
}
