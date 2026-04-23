import { useEffect, useMemo, useState } from 'react';
import {
  X,
  Camera,
  Layout,
  Users,
  Calendar,
  FileText,
  ChevronRight,
  Sparkles,
  ImagePlus,
  Trash2,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import type { CreatePostInput, PendingUploadImage, PostVisibility, User } from '../types';
import StateCard from './StateCard';
import BottomNav from './BottomNav';

interface CreateViewProps {
  onClose: () => void;
  me: User;
  isSubmitting: boolean;
  onSubmit: (input: CreatePostInput) => Promise<void>;
  onTabChange: (tab: string) => void;
}

const CATEGORY_OPTIONS = ['摄影', '设计', '旅行', '灵感'];

function fileToPendingImage(file: File): Promise<PendingUploadImage> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('图片读取失败'));
    reader.onload = () => {
      if (typeof reader.result !== 'string') {
        reject(new Error('图片读取失败'));
        return;
      }

      const image = new Image();
      image.onerror = () => reject(new Error('图片预览失败'));
      image.onload = () => {
        resolve({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          fileName: file.name,
          mimeType: file.type || 'image/jpeg',
          size: file.size,
          dataUrl: reader.result as string,
          width: image.naturalWidth,
          height: image.naturalHeight,
          isCover: false,
        });
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(file);
  });
}

export default function CreateView({ onClose, me, isSubmitting, onSubmit, onTabChange }: CreateViewProps) {
  const [content, setContent] = useState('');
  const [image, setImage] = useState('');
  const [location, setLocation] = useState('');
  const [tags, setTags] = useState('design, visual');
  const [visibility, setVisibility] = useState<PostVisibility>('public');
  const [category, setCategory] = useState('摄影');
  const [notice, setNotice] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState<PendingUploadImage[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const mediaCount = localImages.length + (image.trim() ? 1 : 0);
  const resolvedType = useMemo(() => {
    if (mediaCount > 1) {
      return 'gallery';
    }
    if (mediaCount === 1) {
      return 'standard';
    }
    return 'quote';
  }, [mediaCount]);

  useEffect(() => {
    const rawDraft = localStorage.getItem('pulse-create-draft');
    if (!rawDraft) {
      return;
    }

    try {
      const draft = JSON.parse(rawDraft) as {
        content?: string;
        image?: string;
        location?: string;
        tags?: string;
        visibility?: PostVisibility;
        category?: string;
      };

      setContent(draft.content ?? '');
      setImage(draft.image ?? '');
      setLocation(draft.location ?? '');
      setTags(draft.tags ?? 'design, visual');
      setVisibility(draft.visibility ?? 'public');
      setCategory(draft.category ?? '摄影');
      setNotice('已恢复上次未发布的草稿');
    } catch {
      localStorage.removeItem('pulse-create-draft');
    }
  }, []);

  async function handleSubmit() {
    await onSubmit({
      content,
      image: image.trim() || undefined,
      images: image.trim() ? [image.trim()] : undefined,
      localImages,
      visibility,
      location: location.trim() || undefined,
      tags: tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean),
      type: resolvedType,
    });
    localStorage.removeItem('pulse-create-draft');
    setContent('');
    setImage('');
    setLocation('');
    setTags('');
    setCategory('摄影');
    setLocalImages([]);
    setUploadError(null);
    onClose();
  }

  function handleSaveDraft() {
    localStorage.setItem(
      'pulse-create-draft',
      JSON.stringify({
        content,
        image,
        location,
        tags,
        visibility,
        category,
      }),
    );
    setNotice('草稿已保存到本地浏览器');
  }

  function handleAttachCategoryTag() {
    const normalized = category.toLowerCase();
    const nextTags = tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (!nextTags.includes(normalized)) {
      nextTags.push(normalized);
      setTags(nextTags.join(', '));
      setNotice(`已将 ${category} 加入标签`);
    }
  }

  async function handleFiles(files: FileList | File[] | null) {
    if (!files || files.length === 0) {
      return;
    }

    setUploadError(null);
    try {
      const selected = Array.from(files).slice(0, Math.max(0, 6 - localImages.length));
      const nextImages = await Promise.all(
        selected.map(async (file) => {
          if (!file.type.startsWith('image/')) {
            throw new Error('仅支持图片文件');
          }
          if (file.size > 8 * 1024 * 1024) {
            throw new Error('单张图片需小于 8MB');
          }
          return fileToPendingImage(file);
        }),
      );

      setLocalImages((current) => {
        const merged = [...current, ...nextImages];
        return merged.map((item, index) => ({
          ...item,
          isCover: current.length === 0 ? index === 0 : item.isCover,
        }));
      });
      setNotice(`已载入 ${nextImages.length} 张图片，发布时会自动上传到云端`);
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : '图片处理失败');
    }
  }

  function setCover(imageId: string) {
    setLocalImages((current) =>
      current.map((item) => ({
        ...item,
        isCover: item.id === imageId,
      })),
    );
    setNotice('已更新作品封面');
  }

  function moveImage(imageId: string, direction: -1 | 1) {
    setLocalImages((current) => {
      const index = current.findIndex((item) => item.id === imageId);
      const targetIndex = index + direction;
      if (index < 0 || targetIndex < 0 || targetIndex >= current.length) {
        return current;
      }

      const next = [...current];
      const [item] = next.splice(index, 1);
      next.splice(targetIndex, 0, item);
      return next;
    });
  }

  function removeImage(imageId: string) {
    setLocalImages((current) => {
      const filtered = current.filter((item) => item.id !== imageId);
      if (filtered.length > 0 && !filtered.some((item) => item.isCover)) {
        filtered[0] = {
          ...filtered[0],
          isCover: true,
        };
      }
      return filtered;
    });
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[linear-gradient(180deg,#f7fbff_0%,#eef3fa_52%,#e7eef7_100%)]">
      <div className="mx-auto flex h-full max-w-[980px] flex-col overflow-hidden lg:px-4 lg:py-4">
        <div className="ios-shell flex h-full flex-col overflow-hidden rounded-none border-0 lg:rounded-[32px] lg:border lg:border-white/60">
          <header className="sticky top-0 z-40 flex items-center justify-between border-b border-line/70 bg-white/88 px-5 py-4 backdrop-blur-xl lg:px-7">
            <div className="flex items-center gap-4">
              <button onClick={onClose} className="ios-pill rounded-full p-2 text-ink hover:text-accent transition-all">
                <X size={20} />
              </button>
              <div>
                <div className="section-label">Publisher</div>
                <div className="mt-1 text-[24px] font-semibold text-ink">内容发布器</div>
              </div>
            </div>
            <button
              className="ios-primary-btn px-6 py-2.5 text-sm"
              disabled={isSubmitting || content.trim().length < 3}
              onClick={() => void handleSubmit()}
            >
              {isSubmitting ? '发布中...' : '立即发布'}
            </button>
          </header>

          <main className="flex-1 overflow-y-auto no-scrollbar px-4 pb-40 pt-5 lg:px-7 lg:pb-8">
            {notice ? (
              <div className="mb-4 ios-panel flex items-center justify-between gap-3 rounded-[20px] px-4 py-3">
                <span className="text-sm text-ink/70">{notice}</span>
                <button className="text-sm font-medium text-accent" onClick={() => setNotice(null)}>
                  关闭
                </button>
              </div>
            ) : null}

            <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-4">
                <div className="ios-card rounded-[30px] p-5">
                  <div className="flex items-center gap-3">
                    <img alt={me.name} className="h-12 w-12 rounded-full border border-white/80 object-cover" src={me.avatar} referrerPolicy="no-referrer" />
                    <div>
                      <div className="text-[15px] font-semibold text-ink">{me.name}</div>
                      <div className="text-[12px] text-accent">{me.username}</div>
                    </div>
                  </div>
                  <div className="mt-5">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="section-label">Content</span>
                      <span className="text-[12px] text-ink/42">{content.trim().length} 字</span>
                    </div>
                    <textarea
                      className="min-h-[220px] w-full resize-none rounded-[24px] border border-line/70 bg-[#fbfdff] px-4 py-4 text-[15px] leading-7 text-ink outline-none placeholder:text-ink/28"
                      placeholder="分享你的最新灵感、观点或作品背景..."
                      value={content}
                      onChange={(event) => setContent(event.target.value)}
                    />
                  </div>
                </div>

                <div className="ios-card rounded-[30px] p-5">
                  <div className="mb-4 flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/42">
                    <ImagePlus size={14} />
                    Media
                  </div>
                  <div className="grid gap-3">
                    <label
                      htmlFor="pulse-image-upload"
                      className="ios-panel flex min-h-[168px] cursor-pointer flex-col items-center justify-center rounded-[26px] border border-dashed border-line px-5 py-6 text-center"
                      onDragOver={(event) => {
                        event.preventDefault();
                      }}
                      onDrop={(event) => {
                        event.preventDefault();
                        void handleFiles(event.dataTransfer.files);
                      }}
                    >
                      <div className="ios-pill rounded-2xl p-3 text-accent">
                        <ImagePlus size={18} />
                      </div>
                      <div className="mt-4 text-[15px] font-semibold text-ink">拖拽图片到这里，或点击选择本地作品</div>
                      <div className="mt-2 max-w-[360px] text-[13px] leading-6 text-ink/55">
                        支持 JPG、PNG、WebP，单张小于 8MB，最多 6 张。发布时会自动上传到 Supabase Storage。
                      </div>
                      <input
                        id="pulse-image-upload"
                        hidden
                        accept="image/png,image/jpeg,image/webp"
                        multiple
                        type="file"
                        onChange={(event) => void handleFiles(event.target.files)}
                      />
                    </label>
                    {uploadError ? (
                      <StateCard
                        compact
                        tone="error"
                        eyebrow="Upload Queue"
                        title="图片队列处理失败"
                        description={uploadError}
                      />
                    ) : null}
                    {localImages.length > 0 ? (
                      <div className="grid gap-3">
                        {localImages.map((item, index) => (
                          <div key={item.id} className="ios-panel rounded-[24px] p-3">
                            <div className="flex gap-3">
                              <div className="h-24 w-24 overflow-hidden rounded-[18px] bg-surface-container">
                                <img alt={item.fileName} className="h-full w-full object-cover" src={item.dataUrl} />
                              </div>
                              <div className="min-w-0 flex-1">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <div className="truncate text-sm font-semibold text-ink">{item.fileName}</div>
                                    <div className="mt-1 text-[12px] text-ink/50">
                                      {item.width} × {item.height} · {(item.size / 1024 / 1024).toFixed(1)} MB
                                    </div>
                                  </div>
                                  {item.isCover ? (
                                    <span className="rounded-full bg-[#edf4ff] px-3 py-1 text-[11px] font-semibold text-accent">封面</span>
                                  ) : null}
                                </div>
                                <div className="mt-3 flex flex-wrap gap-2">
                                  <button className="ios-pill rounded-full px-3 py-1.5 text-[12px] font-semibold text-ink/70" onClick={() => setCover(item.id)}>
                                    设为封面
                                  </button>
                                  <button
                                    className="ios-pill inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold text-ink/70 disabled:opacity-40"
                                    disabled={index === 0}
                                    onClick={() => moveImage(item.id, -1)}
                                  >
                                    <ArrowLeft size={12} />
                                    前移
                                  </button>
                                  <button
                                    className="ios-pill inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold text-ink/70 disabled:opacity-40"
                                    disabled={index === localImages.length - 1}
                                    onClick={() => moveImage(item.id, 1)}
                                  >
                                    后移
                                    <ArrowRight size={12} />
                                  </button>
                                  <button className="ios-pill inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-[12px] font-semibold text-[#db4b4b]" onClick={() => removeImage(item.id)}>
                                    <Trash2 size={12} />
                                    删除
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : null}
                    <input
                      className="ios-input"
                      placeholder="外部图片链接（可选，作为补充来源）"
                      value={image}
                      onChange={(event) => setImage(event.target.value)}
                    />
                    <input
                      className="ios-input"
                      placeholder="位置（可选）"
                      value={location}
                      onChange={(event) => setLocation(event.target.value)}
                    />
                    <input
                      className="ios-input"
                      placeholder="标签：design, ui, photo"
                      value={tags}
                      onChange={(event) => setTags(event.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="ios-card rounded-[30px] p-5">
                  <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/42">
                    <Sparkles size={14} />
                    Publish Setup
                  </div>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {(['public', 'followers', 'private'] as const).map((value) => (
                      <button
                        key={value}
                        className={`rounded-full px-4 py-2 text-[12px] font-semibold ${
                          visibility === value
                            ? 'bg-accent text-white shadow-[0_10px_20px_rgba(22,119,255,0.18)]'
                            : 'ios-pill text-ink/65'
                        }`}
                        onClick={() => setVisibility(value)}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                  <div className="mt-4 grid gap-3">
                    <button
                      className="ios-panel flex items-center justify-between rounded-[22px] px-4 py-4 text-left"
                      onClick={handleAttachCategoryTag}
                    >
                      <div className="flex items-center gap-3">
                        <div className="ios-pill rounded-2xl p-2.5 text-ink">
                          <Layout size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink">内容分类</p>
                          <p className="text-[12px] text-ink/55">当前分类：{category}</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="opacity-40" />
                    </button>
                    <button
                      className="ios-panel flex items-center justify-between rounded-[22px] px-4 py-4 text-left"
                      onClick={() => setNotice('可以继续扩展图片上传、草稿封面和预览能力')}
                    >
                        <div className="flex items-center gap-3">
                          <div className="ios-pill rounded-2xl p-2.5 text-ink">
                            <Camera size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-ink">封面与媒体</p>
                            <p className="text-[12px] text-ink/55">当前支持本地上传、设封面和作品顺序调整</p>
                          </div>
                        </div>
                        <ChevronRight size={14} className="opacity-40" />
                    </button>
                    <button
                      className="ios-panel flex items-center justify-between rounded-[22px] px-4 py-4 text-left"
                      onClick={() => setNotice('位置、可见性与内容标签共同决定这条内容的分发策略')}
                    >
                      <div className="flex items-center gap-3">
                        <div className="ios-pill rounded-2xl p-2.5 text-ink">
                          <Users size={16} />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-ink">分发与可见范围</p>
                          <p className="text-[12px] text-ink/55">为社交系统后续推荐和权限控制预留入口</p>
                        </div>
                      </div>
                      <ChevronRight size={14} className="opacity-40" />
                    </button>
                  </div>
                </div>

                <div className="ios-card rounded-[30px] p-5">
                  <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/42">分类选择</div>
                  <div className="grid grid-cols-2 gap-2">
                    {CATEGORY_OPTIONS.map((option) => (
                      <button
                        key={option}
                        className={`rounded-[18px] px-4 py-3 text-sm font-semibold transition-colors ${
                          category === option ? 'bg-accent text-white' : 'ios-panel text-ink/65'
                        }`}
                        onClick={() => setCategory(option)}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    className="ios-panel rounded-[24px] p-5 flex flex-col items-center gap-2 transition-all"
                    onClick={() => setNotice('定时发布还未接真实任务调度，已为你保留入口')}
                  >
                    <Calendar size={20} />
                    <span className="text-[12px] font-medium leading-none">定时发布</span>
                  </button>
                  <button
                    className="ios-panel rounded-[24px] p-5 flex flex-col items-center gap-2 transition-all"
                    onClick={handleSaveDraft}
                  >
                    <FileText size={20} />
                    <span className="text-[12px] font-medium leading-none">保存草稿</span>
                  </button>
                </div>

                <div className="ios-card rounded-[30px] p-5">
                  <div className="mb-4 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/42">Quick Tips</div>
                  <div className="space-y-3 text-sm text-ink/60">
                    <div className="ios-panel rounded-[20px] px-4 py-3">当前模式：{resolvedType === 'gallery' ? '多图作品' : resolvedType === 'standard' ? '单图作品' : '纯文字观点'}</div>
                    <div className="ios-panel rounded-[20px] px-4 py-3">已排入上传队列：{localImages.length} 张。封面图会优先成为帖子主视觉。</div>
                  </div>
                </div>
              </div>
            </section>
          </main>
          <BottomNav
            activeTab="create"
            onTabChange={(tab) => {
              if (tab === 'create') {
                return;
              }
              onClose();
              onTabChange(tab);
            }}
          />
        </div>
      </div>
    </div>
  );
}
