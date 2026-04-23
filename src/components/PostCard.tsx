import { useState } from 'react';
import { Heart, MessageCircle, Send, MoreHorizontal, Bookmark } from 'lucide-react';
import { Post as PostType, PostBookmarkResult, PostComment, PostLikeResult } from '../types';
import { formatCompactCount } from '../lib/format';
import CommentsSheet from './CommentsSheet';

interface PostCardProps {
  post: PostType;
  onToggleLike?: (postId: string, nextLiked: boolean) => Promise<PostLikeResult | void> | void;
  onToggleBookmark?: (postId: string, nextBookmarked: boolean) => Promise<PostBookmarkResult | void> | void;
  comments?: PostComment[];
  isCommentsLoading?: boolean;
  isCommentSubmitting?: boolean;
  onLoadComments?: (postId: string) => Promise<PostComment[] | void> | void;
  onCreateComment?: (postId: string, content: string) => Promise<PostComment | void> | void;
}

export default function PostCard({
  post,
  onToggleLike,
  onToggleBookmark,
  comments = [],
  isCommentsLoading = false,
  isCommentSubmitting = false,
  onLoadComments,
  onCreateComment,
}: PostCardProps) {
  const [shared, setShared] = useState(false);
  const [isCommentsOpen, setIsCommentsOpen] = useState(false);
  const [isLikeBusy, setIsLikeBusy] = useState(false);
  const [isBookmarkBusy, setIsBookmarkBusy] = useState(false);
  const liked = post.viewerHasLiked ?? false;
  const saved = post.viewerHasBookmarked ?? false;
  const displayLikes = post.likes;

  async function handleToggleLike() {
    if (!onToggleLike || isLikeBusy) {
      return;
    }

    setIsLikeBusy(true);
    try {
      await onToggleLike(post.id, !liked);
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
    } finally {
      setIsBookmarkBusy(false);
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

  return (
    <>
      <article className="ios-card rounded-[28px] mb-5 overflow-hidden transition-transform hover:-translate-y-0.5">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <img alt={post.author.name} className="w-11 h-11 rounded-full border border-white/80 object-cover shadow-sm" src={post.author.avatar} referrerPolicy="no-referrer" />
            <div>
              <h3 className="font-semibold text-[15px] tracking-tight text-ink">{post.author.name}</h3>
              <p className="text-[12px] text-ink/55">{post.timestamp}</p>
            </div>
          </div>
          <button className="ios-pill rounded-full p-2 text-ink/60 hover:text-accent transition-colors">
            <MoreHorizontal size={14} />
          </button>
        </div>

        <div className="px-5 pb-4">
          <p className="text-[15px] text-ink leading-7 mb-4">
            {post.content}
          </p>

          {post.type === 'quote' ? (
            <div className="ios-panel rounded-[24px] p-5 relative overflow-hidden">
               <div className="absolute inset-y-4 left-0 w-1 rounded-full bg-accent/70" />
               <p className="text-[17px] text-ink italic leading-relaxed pl-4">
                 {post.content}
               </p>
            </div>
          ) : post.type === 'gallery' && post.images ? (
            <div className="grid grid-cols-2 gap-1 rounded-[24px] overflow-hidden bg-white/80 p-1 border border-white/80">
              <div className="bg-bg h-48 overflow-hidden rounded-[20px]">
                <img alt="Gallery 1" className="w-full h-full object-cover" src={post.images[0]} referrerPolicy="no-referrer" />
              </div>
              <div className="grid grid-rows-2 gap-1 h-48">
                <div className="bg-bg overflow-hidden rounded-[20px]">
                  <img alt="Gallery 2" className="w-full h-full object-cover" src={post.images[1]} referrerPolicy="no-referrer" />
                </div>
                <div className="bg-bg overflow-hidden relative rounded-[20px]">
                  <img alt="Gallery 3" className="w-full h-full object-cover" src={post.images[2]} referrerPolicy="no-referrer" />
                  <div className="absolute inset-0 bg-ink/25 flex items-center justify-center">
                    <span className="text-white text-sm font-semibold">+5</span>
                  </div>
                </div>
              </div>
            </div>
          ) : post.image ? (
            <div className="overflow-hidden aspect-[4/5] bg-bg rounded-[24px] border border-white/80">
              <img alt="Post visual" className="w-full h-full object-cover" src={post.image} referrerPolicy="no-referrer" />
            </div>
          ) : null}
        </div>

        <div className="flex items-center justify-between px-5 py-4 border-t border-white/70">
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
            <button className={`transition-colors ${shared ? 'text-accent' : 'text-ink/55 hover:text-accent'}`} onClick={() => setShared(true)}>
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
        onClose={() => setIsCommentsOpen(false)}
        onSubmit={handleCreateComment}
      />
    </>
  );
}
