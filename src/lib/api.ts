import type { CreatePostInput, FeedData, Post } from '../types';

interface RequestOptions extends RequestInit {
  accessToken?: string | null;
}

async function request<T>(path: string, init?: RequestOptions): Promise<T> {
  const response = await fetch(path, {
    headers: {
      'Content-Type': 'application/json',
      ...(init?.accessToken ? { Authorization: `Bearer ${init.accessToken}` } : {}),
      ...(init?.headers ?? {}),
    },
    ...init,
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as { message?: string } | null;
    throw new Error(payload?.message ?? `Request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export function fetchFeed() {
  return request<FeedData>('/api/feed');
}

export function createPost(input: CreatePostInput, accessToken?: string | null) {
  return request<Post>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(input),
    accessToken,
  });
}
