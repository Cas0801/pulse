interface BookmarkResult {
  postId: string;
  bookmarked: boolean;
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

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    if (!hasSupabaseConfig()) {
      const payload: BookmarkResult = {
        postId: req.query.postId,
        bookmarked: req.method === 'POST',
      };
      res.status(200).json(payload);
      return;
    }

    const authHeader = req.headers?.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const actorId = await resolveActorId(accessToken);
    const postId = String(req.query.postId ?? '');

    if (!actorId || !postId) {
      res.status(400).json({ message: '缺少 postId 或用户身份，无法执行收藏操作' });
      return;
    }

    try {
      if (req.method === 'POST') {
        await fetchJson<unknown>(
          `${getRestBaseUrl()}/post_bookmarks?on_conflict=post_id,user_id`,
          {
            method: 'POST',
            headers: {
              Prefer: 'resolution=ignore-duplicates,return=representation',
            },
            body: JSON.stringify({
              post_id: postId,
              user_id: actorId,
            }),
          },
          accessToken,
        );
      } else {
        await fetchJson<unknown>(
          `${getRestBaseUrl()}/post_bookmarks?post_id=eq.${encodeURIComponent(postId)}&user_id=eq.${encodeURIComponent(actorId)}`,
          {
            method: 'DELETE',
            headers: {
              Prefer: 'return=representation',
            },
          },
          accessToken,
        );
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message.includes('post_bookmarks')) {
        throw new Error('收藏表尚未初始化，请先执行 supabase/engagement.sql');
      }
      throw error;
    }

    res.status(200).json({
      postId,
      bookmarked: req.method === 'POST',
    });
  } catch (error) {
    res.status(500).json({
      message: req.method === 'POST' ? '收藏失败' : '取消收藏失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
}
