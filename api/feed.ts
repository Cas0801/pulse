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

interface Story {
  id: string;
  user: User;
  isMe?: boolean;
}

interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  images?: string[];
  timestamp: string;
  createdAt: string;
  likes: number;
  comments: number;
  type?: PostType;
  visibility: PostVisibility;
  location?: string;
  tags: string[];
  viewerHasLiked?: boolean;
  viewerHasBookmarked?: boolean;
}

interface FeedData {
  me: User;
  stories: Story[];
  posts: Post[];
  discover: {
    hero: {
      title: string;
      subtitle: string;
      image: string;
    };
    categories: string[];
    galleries: Array<{
      id: string;
      title: string;
      likes: number;
      image: string;
      category: string;
    }>;
  };
  portfolioImages: string[];
  source: 'supabase' | 'mock';
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
  author: SupabaseUserRow | SupabaseUserRow[] | null;
}

interface SupabaseIdRow {
  post_id: string;
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

const FALLBACK_FEED: FeedData = {
  me: FALLBACK_ME,
  stories: [{ id: 'me-story', user: FALLBACK_ME, isMe: true }],
  posts: [],
  discover: {
    hero: {
      title: 'Pulse Cloud Feed',
      subtitle: 'Supabase 未配置时显示演示内容',
      image: 'https://images.unsplash.com/photo-1493246507139-91e8fad9978e?auto=format&fit=crop&w=1200&q=80',
    },
    categories: ['FOR_YOU', 'PHOTO_GRA', 'DESIGN_UX'],
    galleries: [
      {
        id: 'gallery-1',
        title: 'Cloud Board',
        likes: 120,
        image: 'https://picsum.photos/seed/pulse-cloud-1/800/450',
        category: 'FOR_YOU',
      },
      {
        id: 'gallery-2',
        title: 'Ocean Notes',
        likes: 240,
        image: 'https://picsum.photos/seed/pulse-cloud-2/800/450',
        category: 'PHOTO_GRA',
      },
    ],
  },
  portfolioImages: [
    'https://picsum.photos/seed/pulse-portfolio-1/800/900',
    'https://picsum.photos/seed/pulse-portfolio-2/800/900',
    'https://picsum.photos/seed/pulse-portfolio-3/800/900',
  ],
  source: 'mock',
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

function normalizePost(row: SupabasePostRow, engagement?: { likedPostIds: Set<string>; bookmarkedPostIds: Set<string> }): Post {
  return {
    id: row.id,
    author: normalizeAuthor(row.author),
    content: row.content,
    image: row.image_url ?? undefined,
    images: row.image_urls ?? undefined,
    timestamp: formatRelativeTime(row.created_at),
    createdAt: row.created_at,
    likes: row.likes_count ?? 0,
    comments: row.comments_count ?? 0,
    type: row.type ?? 'standard',
    visibility: row.visibility ?? 'public',
    location: row.location ?? undefined,
    tags: row.tags ?? [],
    viewerHasLiked: engagement?.likedPostIds.has(row.id) ?? false,
    viewerHasBookmarked: engagement?.bookmarkedPostIds.has(row.id) ?? false,
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

async function fetchOptionalIds(url: string, accessToken?: string) {
  try {
    return await fetchJson<SupabaseIdRow[]>(url, undefined, accessToken);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';

    if (message.includes('post_likes') || message.includes('post_bookmarks')) {
      return [];
    }

    throw error;
  }
}

async function resolveActorId(accessToken?: string) {
  if (accessToken) {
    const authUser = await fetchAuthenticatedUser(accessToken);
    return authUser.id;
  }

  return process.env.SUPABASE_DEFAULT_AUTHOR_ID;
}

export default async function handler(req: any, res: any) {
  try {
    if (!hasSupabaseConfig()) {
      res.status(200).json(FALLBACK_FEED);
      return;
    }

    const authHeader = req.headers?.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const baseUrl = getRestBaseUrl();
    const actorId = await resolveActorId(accessToken);

    const [profiles, posts, likedRows, bookmarkedRows] = await Promise.all([
      fetchJson<SupabaseUserRow[]>(
        `${baseUrl}/profiles?select=id,name,username,avatar_url,bio,post_count,follower_count,following_count&order=name.asc`,
      ),
      fetchJson<SupabasePostRow[]>(
        `${baseUrl}/posts?select=id,content,image_url,image_urls,created_at,likes_count,comments_count,type,visibility,location,tags,author:profiles!posts_author_id_fkey(id,name,username,avatar_url,bio,post_count,follower_count,following_count)&order=created_at.desc`,
        undefined,
        accessToken,
      ),
      actorId
        ? fetchOptionalIds(
            `${baseUrl}/post_likes?select=post_id&user_id=eq.${encodeURIComponent(actorId)}`,
            accessToken,
          )
        : Promise.resolve([]),
      actorId
        ? fetchOptionalIds(
            `${baseUrl}/post_bookmarks?select=post_id&user_id=eq.${encodeURIComponent(actorId)}`,
            accessToken,
          )
        : Promise.resolve([]),
    ]);

    let me = profiles[0] ? normalizeProfile(profiles[0]) : FALLBACK_FEED.me;

    if (accessToken) {
      const authUser = await fetchAuthenticatedUser(accessToken);
      const profile = profiles.find((item) => item.id === authUser.id);
      if (profile) {
        me = normalizeProfile(profile);
      }
    }

    const stories = profiles.slice(0, 4).map((profile, index) => ({
      id: `${profile.id}-story`,
      user: normalizeProfile(profile),
      isMe: index === 0,
    }));

    const engagement = {
      likedPostIds: new Set(likedRows.map((row) => row.post_id)),
      bookmarkedPostIds: new Set(bookmarkedRows.map((row) => row.post_id)),
    };

    const payload: FeedData = {
      ...FALLBACK_FEED,
      me,
      stories: stories.length > 0 ? stories : FALLBACK_FEED.stories,
      posts: posts.map((post) => normalizePost(post, engagement)),
      source: 'supabase',
    };

    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({
      message: '加载 feed 失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
}
