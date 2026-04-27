import { Bell, CheckCheck, Heart, MessageCircle, UserPlus } from 'lucide-react';
import type { NotificationItem } from '../types';
import StateCard from './StateCard';

interface NotificationsViewProps {
  notifications: NotificationItem[];
  unreadCount: number;
  isLoading: boolean;
  onRefresh?: () => Promise<unknown> | void;
  onMarkAllRead?: () => Promise<unknown> | void;
}

const toneIconMap = {
  post_like: Heart,
  post_comment: MessageCircle,
  profile_follow: UserPlus,
} as const;

const toneLabelMap = {
  post_like: '点赞通知',
  post_comment: '评论通知',
  profile_follow: '关注通知',
} as const;

export default function NotificationsView({
  notifications,
  unreadCount,
  isLoading,
  onRefresh,
  onMarkAllRead,
}: NotificationsViewProps) {
  return (
    <div className="flex min-h-screen flex-col bg-transparent">
      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line/70 bg-white/88 px-5 py-4 backdrop-blur-xl lg:px-7">
        <div>
          <div className="section-label">Notification Center</div>
          <div className="mt-1 text-[28px] font-semibold text-ink">消息中心</div>
          <div className="mt-1 text-[13px] text-ink/54">
            当前还有 {unreadCount} 条未读消息，覆盖关注、点赞和评论行为。
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="ios-secondary-btn px-4 py-2 text-[13px]" onClick={() => void onRefresh?.()}>
            刷新
          </button>
          <button className="ios-primary-btn px-4 py-2 text-[13px]" onClick={() => void onMarkAllRead?.()}>
            <CheckCheck size={14} />
            全部已读
          </button>
        </div>
      </header>

      <main className="flex-1 px-4 pb-28 pt-5 lg:px-7 lg:pb-10">
        {isLoading ? (
          <StateCard
            tone="loading"
            eyebrow="Syncing"
            title="正在同步通知流"
            description="系统正在从云端拉取最新的关注、点赞和评论动态。"
          />
        ) : notifications.length > 0 ? (
          <div className="space-y-4">
            {notifications.map((item) => {
              const Icon = toneIconMap[item.type];

              return (
                <article key={item.id} className="ios-card rounded-[28px] px-5 py-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className={`mt-1 flex h-11 w-11 items-center justify-center rounded-2xl ${item.isRead ? 'bg-[#f2f6ff] text-ink/55' : 'bg-[#e7f1ff] text-accent'}`}>
                        <Icon size={18} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-3">
                          <div className="text-sm font-semibold text-ink">{toneLabelMap[item.type]}</div>
                          {!item.isRead ? <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-semibold text-white">NEW</span> : null}
                        </div>
                        <div className="mt-2 flex items-center gap-3">
                          <img
                            alt={item.actor.name}
                            className="h-9 w-9 rounded-full border border-white/80 object-cover"
                            src={item.actor.avatar}
                            referrerPolicy="no-referrer"
                          />
                          <div>
                            <div className="text-sm font-semibold text-ink">{item.actor.name}</div>
                            <div className="text-[12px] text-ink/48">{item.actor.username}</div>
                          </div>
                        </div>
                        <p className="mt-4 text-[14px] leading-6 text-ink/78">{item.message}</p>
                        {item.postPreview ? (
                          <div className="mt-3 ios-panel rounded-[18px] px-4 py-3 text-[13px] text-ink/60">
                            关联动态：{item.postPreview}
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-2 text-[12px] text-ink/42">
                      <Bell size={14} />
                      {item.timestamp}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <StateCard
            tone="empty"
            eyebrow="Inbox Zero"
            title="消息中心还没有积累动态"
            description="当别人关注你、点赞你或评论你的内容时，通知会在这里形成清晰的互动时间线。"
            actionLabel="刷新一下"
            onAction={() => void onRefresh?.()}
          />
        )}
      </main>
    </div>
  );
}
