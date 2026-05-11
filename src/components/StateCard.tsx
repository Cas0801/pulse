import { AlertCircle, CheckCircle2, Inbox, RefreshCw, Sparkles } from 'lucide-react';

type StateTone = 'empty' | 'error' | 'success' | 'loading';

interface StateCardProps {
  tone: StateTone;
  eyebrow?: string;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  compact?: boolean;
}

const iconMap = {
  empty: Inbox,
  error: AlertCircle,
  success: CheckCircle2,
  loading: Sparkles,
} satisfies Record<StateTone, typeof Inbox>;

const accentMap: Record<StateTone, string> = {
  empty: 'bg-[#e8f5ef] text-accent',
  error: 'bg-[#fff1f1] text-[#db4b4b]',
  success: 'bg-[#e8f5ef] text-[#0f8f6f]',
  loading: 'bg-[#e8f5ef] text-accent',
};

export default function StateCard({
  tone,
  eyebrow,
  title,
  description,
  actionLabel,
  onAction,
  compact = false,
}: StateCardProps) {
  const Icon = iconMap[tone];

  return (
    <div className={`ios-card rounded-[28px] ${compact ? 'px-4 py-4' : 'px-6 py-7'} text-center`}>
      <div className={`mx-auto flex h-12 w-12 items-center justify-center rounded-2xl ${accentMap[tone]}`}>
        <Icon size={20} className={tone === 'loading' ? 'animate-pulse' : ''} />
      </div>
      {eyebrow ? <div className="section-label mt-4">{eyebrow}</div> : null}
      <h3 className={`mt-2 font-semibold text-ink ${compact ? 'text-lg' : 'text-[22px]'}`}>{title}</h3>
      <p className={`mx-auto mt-2 max-w-[420px] leading-6 text-ink/58 ${compact ? 'text-[13px]' : 'text-sm'}`}>{description}</p>
      {actionLabel && onAction ? (
        <button className="ios-secondary-btn mt-5 inline-flex items-center gap-2 px-4 py-2.5 text-[13px]" onClick={onAction}>
          {tone === 'error' ? <RefreshCw size={14} /> : null}
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
