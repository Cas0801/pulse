type PostVisibility = 'public' | 'followers' | 'private';
type PostType = 'standard' | 'quote' | 'gallery';

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  stats?: {
    posts: number;
    followers: number;
    following: number;
  };
}

interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  images?: string[];
  media?: Array<{
    id?: string;
    url: string;
    storagePath?: string;
    width?: number;
    height?: number;
    sortOrder: number;
    isCover: boolean;
  }>;
  timestamp: string;
  createdAt: string;
  likes: number;
  comments: number;
  type?: PostType;
  visibility: PostVisibility;
  location?: string;
  tags: string[];
}

interface SupabaseUserRow {
  id: string;
  name: string;
  username: string;
  avatar_url: string;
  bio: string | null;
  post_count: number | null;
  follower_count: number | null;
  following_count: number | null;
}

interface SupabasePostRow {
  id: string;
  content: string;
  image_url: string | null;
  image_urls: string[] | null;
  created_at: string;
  likes_count: number | null;
  comments_count: number | null;
  type: PostType | null;
  visibility: PostVisibility | null;
  location: string | null;
  tags: string[] | null;
  post_images?: SupabasePostImageRow[] | null;
  author: SupabaseUserRow | SupabaseUserRow[] | null;
}

interface SupabasePostImageRow {
  id: string;
  storage_path: string;
  public_url: string;
  width: number | null;
  height: number | null;
  sort_order: number | null;
  is_cover: boolean | null;
}

const FALLBACK_ME: User = {
  id: 'me',
  name: 'Pulse Guest',
  username: '@pulse_guest',
  avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80',
  bio: '正在浏览 Pulse 的演示内容。',
  stats: {
    posts: 0,
    followers: 0,
    following: 0,
  },
};

function hasSupabaseConfig() {
  return Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);
}

function getHeaders(accessToken?: string) {
  const apiKey = process.env.SUPABASE_ANON_KEY ?? '';
  const bearer = accessToken ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? apiKey;

  return {
    apikey: apiKey,
    Authorization: `Bearer ${bearer}`,
    'Content-Type': 'application/json',
  };
}

function getRestBaseUrl() {
  return `${process.env.SUPABASE_URL}/rest/v1`;
}

function normalizeProfile(profile: SupabaseUserRow): User {
  return {
    id: profile.id,
    name: profile.name,
    username: profile.username,
    avatar: profile.avatar_url,
    bio: profile.bio ?? undefined,
    stats: {
      posts: profile.post_count ?? 0,
      followers: profile.follower_count ?? 0,
      following: profile.following_count ?? 0,
    },
  };
}

function normalizeAuthor(author: SupabasePostRow['author']): User {
  const profile = Array.isArray(author) ? author[0] : author;
  return profile ? normalizeProfile(profile) : FALLBACK_ME;
}

function formatRelativeTime(dateInput: string): string {
  const now = new Date();
  const target = new Date(dateInput);
  const diffMinutes = Math.floor((now.getTime() - target.getTime()) / 60000);

  if (Number.isNaN(target.getTime()) || diffMinutes < 1) {
    return '刚刚';
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} 分钟前`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours} 小时前`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 7) {
    return `${diffDays} 天前`;
  }

  return target.toLocaleDateString('zh-CN');
}

function normalizeMedia(row: SupabasePostRow) {
  const relationMedia = [...(row.post_images ?? [])]
    .sort((left, right) => (left.sort_order ?? 0) - (right.sort_order ?? 0))
    .map((item, index) => ({
      id: item.id,
      url: item.public_url,
      storagePath: item.storage_path,
      width: item.width ?? undefined,
      height: item.height ?? undefined,
      sortOrder: item.sort_order ?? index,
      isCover: item.is_cover ?? index === 0,
    }));

  if (relationMedia.length > 0) {
    return relationMedia;
  }

  const legacyImages = row.image_urls?.filter(Boolean) ?? [];
  if (legacyImages.length === 0 && !row.image_url) {
    return [];
  }

  const merged = row.image_url && !legacyImages.includes(row.image_url) ? [row.image_url, ...legacyImages] : legacyImages;
  return merged.map((url, index) => ({
    url,
    sortOrder: index,
    isCover: row.image_url ? row.image_url === url : index === 0,
  }));
}

function normalizePost(row: SupabasePostRow): Post {
  const media = normalizeMedia(row);
  const cover = media.find((item) => item.isCover) ?? media[0];
  return {
    id: row.id,
    author: normalizeAuthor(row.author),
    content: row.content,
    image: cover?.url ?? row.image_url ?? undefined,
    images: media.length > 0 ? media.map((item) => item.url) : row.image_urls ?? undefined,
    media: media.length > 0 ? media : undefined,
    timestamp: formatRelativeTime(row.created_at),
    createdAt: row.created_at,
    likes: row.likes_count ?? 0,
    comments: row.comments_count ?? 0,
    type: row.type ?? 'standard',
    visibility: row.visibility ?? 'public',
    location: row.location ?? undefined,
    tags: row.tags ?? [],
  };
}

async function fetchJson<T>(url: string, init?: RequestInit, accessToken?: string): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...getHeaders(accessToken),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error((await response.text()) || `Supabase request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function fetchAuthenticatedUser(accessToken: string) {
  const response = await fetch(`${process.env.SUPABASE_URL}/auth/v1/user`, {
    headers: getHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error('登录态已失效，请重新登录。');
  }

  return response.json() as Promise<{ id: string }>;
}

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { content, image, images, media, type, visibility, location, tags } = req.body ?? {};

  if (typeof content !== 'string' || content.trim().length < 3) {
    res.status(400).json({ message: '内容至少需要 3 个字符' });
    return;
  }

  if (!['public', 'followers', 'private'].includes(visibility)) {
    res.status(400).json({ message: 'visibility 非法' });
    return;
  }

  try {
    if (!hasSupabaseConfig()) {
      const createdAt = new Date().toISOString();
      res.status(201).json({
        id: `mock-${Date.now()}`,
        author: FALLBACK_ME,
        content: content.trim(),
        image: typeof image === 'string' && image.trim() ? image.trim() : undefined,
        images: Array.isArray(images) ? images.filter((item) => typeof item === 'string' && item.trim()) : undefined,
        media: Array.isArray(media) ? media : undefined,
        createdAt,
        timestamp: '刚刚',
        likes: 0,
        comments: 0,
        type: type === 'quote' || type === 'gallery' ? type : 'standard',
        visibility,
        location: typeof location === 'string' && location.trim() ? location.trim() : undefined,
        tags: Array.isArray(tags) ? tags.filter((tag) => typeof tag === 'string' && tag.trim()) : [],
      });
      return;
    }

    const authHeader = req.headers?.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    let authorId = process.env.SUPABASE_DEFAULT_AUTHOR_ID;

    if (accessToken) {
      const authUser = await fetchAuthenticatedUser(accessToken);
      authorId = authUser.id;
    }

    if (!authorId) {
      res.status(500).json({ message: '缺少 SUPABASE_DEFAULT_AUTHOR_ID，无法写入 posts.author_id' });
      return;
    }

    const payload = {
      author_id: authorId,
      content: content.trim(),
      image_url: typeof image === 'string' && image.trim() ? image.trim() : null,
      image_urls: Array.isArray(images)
        ? images.filter((item) => typeof item === 'string' && item.trim())
        : type === 'gallery' && typeof image === 'string' && image.trim()
          ? [image.trim()]
          : typeof image === 'string' && image.trim()
            ? [image.trim()]
            : [],
      type: type === 'quote' || type === 'gallery' ? type : 'standard',
      visibility,
      location: typeof location === 'string' && location.trim() ? location.trim() : null,
      tags: Array.isArray(tags) ? tags.filter((tag) => typeof tag === 'string' && tag.trim()) : [],
    };

    const rows = await fetchJson<SupabasePostRow[]>(
      `${getRestBaseUrl()}/posts?select=id,content,image_url,image_urls,created_at,likes_count,comments_count,type,visibility,location,tags,post_images(id,storage_path,public_url,width,height,sort_order,is_cover),author:profiles!posts_author_id_fkey(id,name,username,avatar_url,bio,post_count,follower_count,following_count)`,
      {
        method: 'POST',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify(payload),
      },
      accessToken,
    );

    const created = rows[0];

    if (created && Array.isArray(media) && media.length > 0) {
      try {
        await fetchJson<unknown>(
          `${getRestBaseUrl()}/post_images`,
          {
            method: 'POST',
            headers: {
              Prefer: 'return=representation',
            },
            body: JSON.stringify(
              media
                .filter((item) => item && typeof item.url === 'string')
                .map((item, index) => ({
                  post_id: created.id,
                  storage_path: typeof item.storagePath === 'string' ? item.storagePath : null,
                  public_url: item.url.trim(),
                  width: typeof item.width === 'number' ? item.width : null,
                  height: typeof item.height === 'number' ? item.height : null,
                  sort_order: typeof item.sortOrder === 'number' ? item.sortOrder : index,
                  is_cover: Boolean(item.isCover),
                })),
            ),
          },
          accessToken,
        );
        const refreshed = await fetchJson<SupabasePostRow[]>(
          `${getRestBaseUrl()}/posts?id=eq.${encodeURIComponent(created.id)}&select=id,content,image_url,image_urls,created_at,likes_count,comments_count,type,visibility,location,tags,post_images(id,storage_path,public_url,width,height,sort_order,is_cover),author:profiles!posts_author_id_fkey(id,name,username,avatar_url,bio,post_count,follower_count,following_count)&limit=1`,
          undefined,
          accessToken,
        );
        if (refreshed[0]) {
          res.status(201).json(normalizePost(refreshed[0]));
          return;
        }
      } catch (error) {
        const message = error instanceof Error ? error.message : '';
        if (message.includes('post_images')) {
          throw new Error('图片表尚未初始化，请先执行 supabase/images.sql');
        }
        throw error;
      }
    }

    if (!created) {
      const createdAt = new Date().toISOString();
      res.status(201).json({
        id: `remote-${Date.now()}`,
        author: FALLBACK_ME,
        content: content.trim(),
        image: typeof image === 'string' && image.trim() ? image.trim() : undefined,
        images: Array.isArray(images) ? images.filter((item) => typeof item === 'string' && item.trim()) : undefined,
        media: Array.isArray(media) ? media : undefined,
        createdAt,
        timestamp: formatRelativeTime(createdAt),
        likes: 0,
        comments: 0,
        type: type === 'quote' || type === 'gallery' ? type : 'standard',
        visibility,
        location: typeof location === 'string' && location.trim() ? location.trim() : undefined,
        tags: Array.isArray(tags) ? tags.filter((tag) => typeof tag === 'string' && tag.trim()) : [],
      });
      return;
    }

    res.status(201).json(normalizePost(created));
  } catch (error) {
    res.status(500).json({
      message: '创建帖子失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
}
