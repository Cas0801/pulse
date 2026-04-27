import type {
  CreateCommentInput,
  CreatePostInput,
  FeedMode,
  FeedData,
  NotificationItem,
  Post,
  PostBookmarkResult,
  PostComment,
  ProfileFollowResult,
  PostLikeResult,
  UploadedImageAsset,
  UploadImagePayload,
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

export function fetchFeed(accessToken?: string | null, mode: FeedMode = 'for-you') {
  return request<FeedData>(`/api/feed?mode=${encodeURIComponent(mode)}`, {
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

export function uploadPostImage(input: UploadImagePayload, accessToken?: string | null) {
  return request<UploadedImageAsset>('/api/uploads/images', {
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

export function setProfileFollow(profileId: string, following: boolean, accessToken?: string | null) {
  return request<ProfileFollowResult>(`/api/profiles/${profileId}/follow`, {
    method: following ? 'POST' : 'DELETE',
    accessToken,
  });
}

export function fetchNotifications(accessToken?: string | null) {
  return request<{ notifications: NotificationItem[]; unreadCount: number }>('/api/notifications', {
    accessToken,
  });
}

export function markAllNotificationsRead(accessToken?: string | null) {
  return request<{ unreadCount: number }>('/api/notifications/read-all', {
    method: 'POST',
    accessToken,
  });
}
