import { ChevronLeft, ChevronRight, Heart, MessageCircle, X } from 'lucide-react';

interface MediaLightboxItem {
  id?: string;
  url: string;
  title?: string;
  subtitle?: string;
  meta?: string;
}

interface MediaLightboxProps {
  isOpen: boolean;
  items: MediaLightboxItem[];
  activeIndex?: number;
  title: string;
  description?: string;
  likesLabel?: string;
  commentsLabel?: string;
  onNavigate?: (index: number) => void;
  onClose: () => void;
}

export default function MediaLightbox({
  isOpen,
  items,
  activeIndex = 0,
  title,
  description,
  likesLabel,
  commentsLabel,
  onNavigate,
  onClose,
}: MediaLightboxProps) {
  const resolvedIndex = Math.min(Math.max(activeIndex, 0), Math.max(items.length - 1, 0));
  const activeItem = items[resolvedIndex];

  if (!isOpen || !activeItem) {
    return null;
  }

  const canNavigate = items.length > 1;
  const previousIndex = resolvedIndex === 0 ? items.length - 1 : resolvedIndex - 1;
  const nextIndex = resolvedIndex === items.length - 1 ? 0 : resolvedIndex + 1;

  return (
    <div className="fixed inset-0 z-[90] flex bg-[#08111d]/88 backdrop-blur-md">
      <div className="relative flex flex-1 flex-col lg:flex-row">
        <div className="relative flex min-h-[55vh] flex-1 items-center justify-center px-4 py-6 lg:px-8">
          <button className="absolute right-4 top-4 z-10 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20" onClick={onClose}>
            <X size={18} />
          </button>

          {canNavigate ? (
            <>
              <button className="absolute left-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20" onClick={() => onNavigate?.(previousIndex)}>
                <ChevronLeft size={18} />
              </button>
              <button className="absolute right-4 top-1/2 z-10 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white transition-colors hover:bg-white/20" onClick={() => onNavigate?.(nextIndex)}>
                <ChevronRight size={18} />
              </button>
            </>
          ) : null}

          <div className="max-h-[82vh] max-w-[min(1080px,100%)] overflow-hidden rounded-[28px] border border-white/12 bg-white/4 shadow-[0_24px_70px_rgba(0,0,0,0.3)]">
            <img alt={activeItem.title ?? title} className="max-h-[82vh] w-full object-contain" src={activeItem.url} />
          </div>
        </div>

        <aside className="w-full border-t border-white/10 bg-[#0d1624]/92 px-5 py-5 text-white lg:w-[360px] lg:border-l lg:border-t-0 lg:px-6 lg:py-6">
          <div className="section-label text-white/50">Artwork Detail</div>
          <h3 className="mt-2 text-[28px] font-semibold leading-tight">{activeItem.title ?? title}</h3>
          {activeItem.subtitle ? <div className="mt-2 text-sm text-white/65">{activeItem.subtitle}</div> : null}
          {description ? <p className="mt-4 text-sm leading-7 text-white/72">{description}</p> : null}
          {activeItem.meta ? <div className="mt-4 text-[12px] uppercase tracking-[0.16em] text-white/45">{activeItem.meta}</div> : null}

          {(likesLabel || commentsLabel) ? (
            <div className="mt-6 grid grid-cols-2 gap-3">
              {likesLabel ? (
                <div className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-2 text-[12px] text-white/50">
                    <Heart size={13} />
                    Appreciation
                  </div>
                  <div className="mt-2 text-lg font-semibold">{likesLabel}</div>
                </div>
              ) : null}
              {commentsLabel ? (
                <div className="rounded-[18px] border border-white/10 bg-white/5 px-4 py-3">
                  <div className="flex items-center gap-2 text-[12px] text-white/50">
                    <MessageCircle size={13} />
                    Discussion
                  </div>
                  <div className="mt-2 text-lg font-semibold">{commentsLabel}</div>
                </div>
              ) : null}
            </div>
          ) : null}

          {items.length > 1 ? (
            <div className="mt-6 grid grid-cols-4 gap-2">
              {items.map((item, index) => (
                <button
                  key={item.id ?? `${item.url}-${index}`}
                  className={`overflow-hidden rounded-[14px] border ${index === resolvedIndex ? 'border-white/70' : 'border-white/10'} bg-white/5`}
                  onClick={() => onNavigate?.(index)}
                >
                  <img alt={item.title ?? `${title}-${index}`} className="aspect-square w-full object-cover" src={item.url} />
                </button>
              ))}
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
