import type {
  CreatePostInput,
  FeedData,
  Post,
  PostImage,
  PostBookmarkResult,
  PostComment,
  PostLikeResult,
  UploadedImageAsset,
  User,
} from '../../src/types';
import { MOCK_FEED } from '../../src/lib/mockData';
import { getConfig, hasSupabaseConfig } from './config';
import { formatRelativeTime } from './utils';

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
  type: Post['type'] | null;
  visibility: Post['visibility'] | null;
  location: string | null;
  tags: string[] | null;
  post_images?: SupabasePostImageRow[] | null;
  author: SupabaseUserRow | SupabaseUserRow[] | null;
}

interface SupabasePostImageRow {
  id: string;
  post_id?: string;
  storage_path: string;
  public_url: string;
  width: number | null;
  height: number | null;
  sort_order: number | null;
  is_cover: boolean | null;
  created_at?: string;
}

interface SupabaseIdRow {
  post_id: string;
}

interface SupabaseCommentRow {
  id: string;
  post_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  author: SupabaseUserRow | SupabaseUserRow[] | null;
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

function buildHeaders(accessToken?: string) {
  const config = getConfig();
  const apiKey = config.supabaseAnonKey;
  const bearer = accessToken ?? config.supabaseServiceRoleKey ?? config.supabaseAnonKey;

  return {
    apikey: apiKey ?? '',
    Authorization: `Bearer ${bearer ?? ''}`,
    'Content-Type': 'application/json',
  };
}

function getBaseUrl() {
  const config = getConfig();
  return `${config.supabaseUrl}/rest/v1`;
}

function getStorageObjectBaseUrl() {
  const config = getConfig();
  return `${config.supabaseUrl}/storage/v1/object`;
}

function normalizeAuthor(author: SupabasePostRow['author']): User {
  const profile = Array.isArray(author) ? author[0] : author;

  if (!profile) {
    return MOCK_FEED.me;
  }

  return normalizeProfile(profile);
}

function normalizeMedia(row: SupabasePostRow): PostImage[] {
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

function normalizePost(row: SupabasePostRow, engagement?: { likedPostIds: Set<string>; bookmarkedPostIds: Set<string> }): Post {
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
    viewerHasLiked: engagement?.likedPostIds.has(row.id) ?? false,
    viewerHasBookmarked: engagement?.bookmarkedPostIds.has(row.id) ?? false,
  };
}

function normalizeComment(row: SupabaseCommentRow): PostComment {
  return {
    id: row.id,
    postId: row.post_id,
    author: normalizeAuthor(row.author),
    content: row.content,
    createdAt: row.created_at,
    timestamp: formatRelativeTime(row.created_at),
  };
}

async function fetchJson<T>(url: string, init?: RequestInit, accessToken?: string): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      ...buildHeaders(accessToken),
      ...(init?.headers ?? {}),
    },
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Supabase request failed with ${response.status}`);
  }

  return response.json() as Promise<T>;
}

async function fetchAuthenticatedUser(accessToken: string) {
  const config = getConfig();
  const response = await fetch(`${config.supabaseUrl}/auth/v1/user`, {
    headers: buildHeaders(accessToken),
  });

  if (!response.ok) {
    throw new Error('登录态已失效，请重新登录。');
  }

  return response.json() as Promise<{
    id: string;
    email?: string;
  }>;
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

async function fetchPosts(accessToken?: string) {
  const baseUrl = getBaseUrl();
  const query =
    'id,content,image_url,image_urls,created_at,likes_count,comments_count,type,visibility,location,tags,post_images(id,storage_path,public_url,width,height,sort_order,is_cover),author:profiles!posts_author_id_fkey(id,name,username,avatar_url,bio,post_count,follower_count,following_count)';

  try {
    return await fetchJson<SupabasePostRow[]>(
      `${baseUrl}/posts?select=${encodeURIComponent(query)}&order=created_at.desc`,
      undefined,
      accessToken,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (!message.includes('post_images')) {
      throw error;
    }

    return fetchJson<SupabasePostRow[]>(
      `${baseUrl}/posts?select=id,content,image_url,image_urls,created_at,likes_count,comments_count,type,visibility,location,tags,author:profiles!posts_author_id_fkey(id,name,username,avatar_url,bio,post_count,follower_count,following_count)&order=created_at.desc`,
      undefined,
      accessToken,
    );
  }
}

async function resolveActorId(accessToken?: string) {
  if (accessToken) {
    const authUser = await fetchAuthenticatedUser(accessToken);
    return authUser.id;
  }

  return process.env.SUPABASE_DEFAULT_AUTHOR_ID;
}

export async function loadFeed(accessToken?: string): Promise<FeedData> {
  if (!hasSupabaseConfig()) {
    return MOCK_FEED;
  }

  const baseUrl = getBaseUrl();
  const actorId = await resolveActorId(accessToken);
  const [profiles, posts, likedRows, bookmarkedRows] = await Promise.all([
    fetchJson<SupabaseUserRow[]>(
      `${baseUrl}/profiles?select=id,name,username,avatar_url,bio,post_count,follower_count,following_count&order=name.asc`,
    ),
    fetchPosts(accessToken),
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

  let me = profiles[0] ? normalizeProfile(profiles[0]) : MOCK_FEED.me;

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

  return {
    ...MOCK_FEED,
    me,
    stories: stories.length > 0 ? stories : MOCK_FEED.stories,
    posts: posts.map((post) => normalizePost(post, engagement)),
    source: 'supabase',
  };
}

export async function createPost(input: CreatePostInput, accessToken?: string): Promise<Post> {
  if (!hasSupabaseConfig()) {
    const createdAt = new Date().toISOString();
    return {
      id: `mock-${Date.now()}`,
      author: MOCK_FEED.me,
      content: input.content,
      image: input.image,
      createdAt,
      timestamp: '刚刚',
      likes: 0,
      comments: 0,
      type: input.type ?? 'standard',
      visibility: input.visibility,
      location: input.location,
      tags: input.tags,
    };
  }

  const baseUrl = getBaseUrl();
  let authorId = process.env.SUPABASE_DEFAULT_AUTHOR_ID;

  if (accessToken) {
    const authUser = await fetchAuthenticatedUser(accessToken);
    authorId = authUser.id;
  }

  if (!authorId) {
    throw new Error('缺少 SUPABASE_DEFAULT_AUTHOR_ID，无法写入 posts.author_id');
  }

  const payload = {
    author_id: authorId,
    content: input.content,
    image_url: input.image ?? null,
    image_urls: input.images ?? (input.type === 'gallery' && input.image ? [input.image] : input.image ? [input.image] : []),
    type: input.type ?? 'standard',
    visibility: input.visibility,
    location: input.location ?? null,
    tags: input.tags ?? [],
  };

  const createdRows = await fetchJson<SupabasePostRow[]>(
    `${baseUrl}/posts?select=id,content,image_url,image_urls,created_at,likes_count,comments_count,type,visibility,location,tags,post_images(id,storage_path,public_url,width,height,sort_order,is_cover),author:profiles!posts_author_id_fkey(id,name,username,avatar_url,bio,post_count,follower_count,following_count)`,
    {
      method: 'POST',
      headers: {
        Prefer: 'return=representation',
      },
      body: JSON.stringify(payload),
    },
    accessToken,
  );

  const created = createdRows[0];

  if (created && input.media && input.media.length > 0) {
    try {
      await fetchJson<SupabasePostImageRow[]>(
        `${baseUrl}/post_images`,
        {
          method: 'POST',
          headers: {
            Prefer: 'return=representation',
          },
          body: JSON.stringify(
            input.media.map((item, index) => ({
              post_id: created.id,
              storage_path: item.storagePath,
              public_url: item.url,
              width: item.width ?? null,
              height: item.height ?? null,
              sort_order: item.sortOrder ?? index,
              is_cover: item.isCover ?? index === 0,
            })),
          ),
        },
        accessToken,
      );
      const refreshed = await fetchPosts(accessToken);
      const hydrated = refreshed.find((item) => item.id === created.id);
      if (hydrated) {
        return normalizePost(hydrated);
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
    return {
      id: `remote-${Date.now()}`,
      author: MOCK_FEED.me,
      content: input.content,
      image: input.image,
      createdAt,
      timestamp: formatRelativeTime(createdAt),
      likes: 0,
      comments: 0,
      type: input.type ?? 'standard',
      visibility: input.visibility,
      location: input.location,
      tags: input.tags,
    };
  }

  return normalizePost(created);
}

function parseDataUrl(dataUrl: string) {
  const match = dataUrl.match(/^data:(image\/(?:jpeg|jpg|png|webp));base64,([a-z0-9+/=]+)$/i);
  if (!match) {
    throw new Error('仅支持 JPG、PNG、WebP 图片上传');
  }

  return {
    mimeType: match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase(),
    buffer: Buffer.from(match[2], 'base64'),
  };
}

export async function uploadImageAsset(
  input: {
    fileName: string;
    mimeType: string;
    dataUrl: string;
    width?: number;
    height?: number;
  },
  accessToken?: string,
): Promise<UploadedImageAsset> {
  if (!hasSupabaseConfig()) {
    return {
      url: input.dataUrl,
      width: input.width,
      height: input.height,
      sortOrder: 0,
      isCover: false,
    };
  }

  const actorId = (await resolveActorId(accessToken)) ?? 'guest';
  const { buffer, mimeType } = parseDataUrl(input.dataUrl);

  if (buffer.byteLength > 8 * 1024 * 1024) {
    throw new Error('单张图片需小于 8MB');
  }

  const safeName = input.fileName.replace(/[^a-zA-Z0-9._-]/g, '-').toLowerCase() || `image.${mimeType.split('/')[1]}`;
  const objectPath = `${actorId}/${Date.now()}-${safeName}`;
  const bucket = getConfig().supabaseImageBucket ?? 'post-images';
  const response = await fetch(`${getStorageObjectBaseUrl()}/${bucket}/${objectPath}`, {
    method: 'POST',
    headers: {
      apikey: getConfig().supabaseAnonKey ?? '',
      Authorization: `Bearer ${accessToken ?? getConfig().supabaseServiceRoleKey ?? getConfig().supabaseAnonKey ?? ''}`,
      'Content-Type': mimeType,
      'x-upsert': 'false',
    },
    body: buffer,
  });

  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || '图片上传失败');
  }

  return {
    url: `${getConfig().supabaseUrl}/storage/v1/object/public/${bucket}/${objectPath}`,
    storagePath: objectPath,
    width: input.width,
    height: input.height,
    sortOrder: 0,
    isCover: false,
  };
}

async function fetchPostLikes(postId: string, accessToken?: string) {
  const baseUrl = getBaseUrl();
  const rows = await fetchJson<Array<{ id: string; likes_count: number | null }>>(
    `${baseUrl}/posts?id=eq.${encodeURIComponent(postId)}&select=id,likes_count&limit=1`,
    undefined,
    accessToken,
  );

  return rows[0]?.likes_count ?? 0;
}

export async function setPostLike(postId: string, shouldLike: boolean, accessToken?: string): Promise<PostLikeResult> {
  if (!hasSupabaseConfig()) {
    return {
      postId,
      liked: shouldLike,
      likes: shouldLike ? 1 : 0,
    };
  }

  const actorId = await resolveActorId(accessToken);

  if (!actorId) {
    throw new Error('缺少用户身份，无法执行点赞操作');
  }

  const baseUrl = getBaseUrl();

  try {
    if (shouldLike) {
      await fetchJson<unknown>(
        `${baseUrl}/post_likes?on_conflict=post_id,user_id`,
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
        `${baseUrl}/post_likes?post_id=eq.${encodeURIComponent(postId)}&user_id=eq.${encodeURIComponent(actorId)}`,
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
    if (message.includes('post_likes')) {
      throw new Error('点赞表尚未初始化，请先执行 supabase/engagement.sql');
    }
    throw error;
  }

  return {
    postId,
    liked: shouldLike,
    likes: await fetchPostLikes(postId, accessToken),
  };
}

export async function setPostBookmark(
  postId: string,
  shouldBookmark: boolean,
  accessToken?: string,
): Promise<PostBookmarkResult> {
  if (!hasSupabaseConfig()) {
    return {
      postId,
      bookmarked: shouldBookmark,
    };
  }

  const actorId = await resolveActorId(accessToken);

  if (!actorId) {
    throw new Error('缺少用户身份，无法执行收藏操作');
  }

  const baseUrl = getBaseUrl();

  try {
    if (shouldBookmark) {
      await fetchJson<unknown>(
        `${baseUrl}/post_bookmarks?on_conflict=post_id,user_id`,
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
        `${baseUrl}/post_bookmarks?post_id=eq.${encodeURIComponent(postId)}&user_id=eq.${encodeURIComponent(actorId)}`,
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

  return {
    postId,
    bookmarked: shouldBookmark,
  };
}

export async function loadComments(postId: string, accessToken?: string): Promise<PostComment[]> {
  if (!hasSupabaseConfig()) {
    return [];
  }

  const baseUrl = getBaseUrl();

  try {
    const rows = await fetchJson<SupabaseCommentRow[]>(
      `${baseUrl}/post_comments?post_id=eq.${encodeURIComponent(postId)}&select=id,post_id,content,created_at,updated_at,author:profiles!post_comments_author_id_fkey(id,name,username,avatar_url,bio,post_count,follower_count,following_count)&order=created_at.asc`,
      undefined,
      accessToken,
    );

    return rows.map(normalizeComment);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('post_comments')) {
      throw new Error('评论表尚未初始化，请先执行 supabase/comments.sql');
    }
    throw error;
  }
}

export async function createComment(postId: string, content: string, accessToken?: string): Promise<PostComment> {
  if (!hasSupabaseConfig()) {
    const createdAt = new Date().toISOString();
    return {
      id: `mock-comment-${Date.now()}`,
      postId,
      author: MOCK_FEED.me,
      content,
      createdAt,
      timestamp: formatRelativeTime(createdAt),
    };
  }

  const actorId = await resolveActorId(accessToken);
  if (!actorId) {
    throw new Error('缺少用户身份，无法发表评论');
  }

  const baseUrl = getBaseUrl();

  try {
    const rows = await fetchJson<SupabaseCommentRow[]>(
      `${baseUrl}/post_comments?select=id,post_id,content,created_at,updated_at,author:profiles!post_comments_author_id_fkey(id,name,username,avatar_url,bio,post_count,follower_count,following_count)`,
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

    return normalizeComment(created);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('post_comments')) {
      throw new Error('评论表尚未初始化，请先执行 supabase/comments.sql');
    }
    throw error;
  }
}
