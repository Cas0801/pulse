import { useState } from 'react';
import { Send, X } from 'lucide-react';
import type { PostComment } from '../types';
import StateCard from './StateCard';

interface CommentsSheetProps {
  comments: PostComment[];
  count: number;
  isOpen: boolean;
  isLoading: boolean;
  isSubmitting: boolean;
  errorMessage?: string | null;
  onClose: () => void;
  onSubmit: (content: string) => Promise<void> | void;
}

export default function CommentsSheet({
  comments,
  count,
  isOpen,
  isLoading,
  isSubmitting,
  errorMessage,
  onClose,
  onSubmit,
}: CommentsSheetProps) {
  const [draft, setDraft] = useState('');

  function CommentSkeleton() {
    return (
      <div className="ios-panel rounded-[24px] px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="pulse-skeleton h-9 w-9 rounded-full" />
          <div className="flex-1">
            <div className="pulse-skeleton h-4 w-28 rounded-full" />
            <div className="pulse-skeleton mt-2 h-3 w-20 rounded-full" />
          </div>
        </div>
        <div className="pulse-skeleton mt-4 h-14 w-full rounded-[18px]" />
      </div>
    );
  }

  if (!isOpen) {
    return null;
  }

  async function handleSubmit() {
    const content = draft.trim();
    if (content.length < 1 || isSubmitting) {
      return;
    }

    await onSubmit(content);
    setDraft('');
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-end bg-ink/28 backdrop-blur-sm lg:items-center lg:justify-center">
      <div className="ios-card max-h-[78vh] w-full overflow-hidden rounded-t-[32px] px-5 pb-6 pt-4 lg:max-h-[82vh] lg:max-w-[640px] lg:rounded-[28px]">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <div className="section-label">Comments</div>
            <h3 className="mt-1 text-xl font-semibold text-ink">评论 {count}</h3>
            <p className="mt-1 text-[13px] text-ink/52">围绕这条动态展开讨论，保持输入和阅读在同一工作区里。</p>
          </div>
          <button className="ios-pill rounded-full p-2 text-ink/60 hover:text-accent" onClick={onClose}>
            <X size={16} />
          </button>
        </div>

        <div className="mb-4 max-h-[46vh] space-y-3 overflow-y-auto pr-1">
          {errorMessage ? (
            <StateCard
              compact
              tone="error"
              eyebrow="Comment Sync"
              title="评论暂时没有提交成功"
              description={errorMessage}
            />
          ) : null}
          {isLoading ? (
            <>
              <CommentSkeleton />
              <CommentSkeleton />
              <CommentSkeleton />
            </>
          ) : comments.length > 0 ? (
            comments.map((comment) => (
              <article key={comment.id} className="ios-panel rounded-[24px] px-4 py-3">
                <div className="flex items-center gap-3">
                  <img
                    alt={comment.author.name}
                    className="h-9 w-9 rounded-full border border-white/80 object-cover"
                    src={comment.author.avatar}
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-ink">{comment.author.name}</div>
                    <div className="text-[12px] text-ink/55">{comment.timestamp}</div>
                  </div>
                </div>
                <p className="mt-3 text-[14px] leading-6 text-ink/85">{comment.content}</p>
              </article>
            ))
          ) : (
            <StateCard
              compact
              tone="empty"
              eyebrow="No Replies"
              title="这条动态还很安静"
              description="还没有评论，写下第一条回应，让讨论真正开始。"
            />
          )}
        </div>

        <div className="ios-panel rounded-[24px] p-3">
          <textarea
            className="min-h-[96px] w-full resize-none bg-transparent px-2 py-1 text-[14px] leading-6 text-ink outline-none placeholder:text-ink/35"
            placeholder="写下你的评论..."
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-[12px] text-ink/45">{isSubmitting ? '正在同步评论到云端...' : '评论会实时写入云端数据库'}</span>
            <button
              className="ios-pill inline-flex items-center gap-2 rounded-full bg-accent px-4 py-2 text-[13px] font-semibold text-white disabled:opacity-60"
              disabled={draft.trim().length < 1 || isSubmitting}
              onClick={() => void handleSubmit()}
            >
              <Send size={14} />
              {isSubmitting ? '发送中' : '发送'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
