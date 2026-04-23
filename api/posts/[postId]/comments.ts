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

interface PostComment {
  id: string;
  postId: string;
  author: User;
  content: string;
  createdAt: string;
  timestamp: string;
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

interface SupabaseCommentRow {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author: SupabaseUserRow | SupabaseUserRow[] | null;
}

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

  if (response.status === 204) {
    return [] as T;
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

async function resolveActorId(accessToken?: string) {
  if (accessToken) {
    const authUser = await fetchAuthenticatedUser(accessToken);
    return authUser.id;
  }

  return process.env.SUPABASE_DEFAULT_AUTHOR_ID;
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

function normalizeComment(row: SupabaseCommentRow): PostComment {
  const profile = Array.isArray(row.author) ? row.author[0] : row.author;
  const author = profile
    ? normalizeProfile(profile)
    : {
        id: 'unknown',
        name: 'Unknown User',
        username: '@unknown',
        avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=unknown',
      };

  return {
    id: row.id,
    postId: row.post_id,
    author,
    content: row.content,
    createdAt: row.created_at,
    timestamp: formatRelativeTime(row.created_at),
  };
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'GET' && req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    if (!hasSupabaseConfig()) {
      if (req.method === 'GET') {
        res.status(200).json([]);
        return;
      }

      const createdAt = new Date().toISOString();
      res.status(201).json({
        id: `mock-comment-${Date.now()}`,
        postId: String(req.query.postId ?? ''),
        author: {
          id: 'me',
          name: 'Pulse Guest',
          username: '@pulse_guest',
          avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=pulse-guest',
        },
        content: String(req.body?.content ?? ''),
        createdAt,
        timestamp: '刚刚',
      });
      return;
    }

    const authHeader = req.headers?.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const postId = String(req.query.postId ?? '');

    if (!postId) {
      res.status(400).json({ message: '缺少 postId' });
      return;
    }

    if (req.method === 'GET') {
      const rows = await fetchJson<SupabaseCommentRow[]>(
        `${getRestBaseUrl()}/post_comments?post_id=eq.${encodeURIComponent(postId)}&select=id,post_id,content,created_at,updated_at,author:profiles!post_comments_author_id_fkey(id,name,username,avatar_url,bio,post_count,follower_count,following_count)&order=created_at.asc`,
        undefined,
        accessToken,
      );
      res.status(200).json(rows.map(normalizeComment));
      return;
    }

    const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';
    if (content.length < 1) {
      res.status(400).json({ message: '评论内容不能为空' });
      return;
    }

    const actorId = await resolveActorId(accessToken);
    if (!actorId) {
      res.status(400).json({ message: '缺少用户身份，无法发表评论' });
      return;
    }

    const rows = await fetchJson<SupabaseCommentRow[]>(
      `${getRestBaseUrl()}/post_comments?select=id,post_id,content,created_at,updated_at,author:profiles!post_comments_author_id_fkey(id,name,username,avatar_url,bio,post_count,follower_count,following_count)`,
      {
        method: 'POST',
        headers: {
          Prefer: 'return=representation',
        },
        body: JSON.stringify({
          post_id: postId,
          author_id: actorId,
          content,
        }),
      },
      accessToken,
    );

    const created = rows[0];
    if (!created) {
      throw new Error('评论创建后未返回数据');
    }

    res.status(201).json(normalizeComment(created));
  } catch (error) {
    const message = error instanceof Error ? error.message : 'unknown error';
    const missingCommentsTable = message.includes('post_comments');
    res.status(500).json({
      message: req.method === 'GET' ? '加载评论失败' : '发表评论失败',
      details: missingCommentsTable ? '评论表尚未初始化，请先执行 supabase/comments.sql' : message,
    });
  }
}
