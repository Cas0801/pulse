import type {
  CreateCommentInput,
  CreatePostInput,
  FeedData,
  Post,
  PostBookmarkResult,
  PostComment,
  PostLikeResult,
} from '../types';

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

export function fetchFeed(accessToken?: string | null) {
  return request<FeedData>('/api/feed', {
    accessToken,
  });
}

export function createPost(input: CreatePostInput, accessToken?: string | null) {
  return request<Post>('/api/posts', {
    method: 'POST',
    body: JSON.stringify(input),
    accessToken,
  });
}

export function setPostLike(postId: string, liked: boolean, accessToken?: string | null) {
  return request<PostLikeResult>(`/api/posts/${postId}/like`, {
    method: liked ? 'POST' : 'DELETE',
    accessToken,
  });
}

export function setPostBookmark(postId: string, bookmarked: boolean, accessToken?: string | null) {
  return request<PostBookmarkResult>(`/api/posts/${postId}/bookmark`, {
    method: bookmarked ? 'POST' : 'DELETE',
    accessToken,
  });
}

export function fetchPostComments(postId: string, accessToken?: string | null) {
  return request<PostComment[]>(`/api/posts/${postId}/comments`, {
    accessToken,
  });
}

export function createPostComment(postId: string, input: CreateCommentInput, accessToken?: string | null) {
  return request<PostComment>(`/api/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(input),
    accessToken,
  });
}
