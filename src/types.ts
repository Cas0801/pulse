export type PostVisibility = 'public' | 'followers' | 'private';
export type PostType = 'standard' | 'quote' | 'gallery';
export type FeedMode = 'for-you' | 'following';
export type NotificationType = 'post_like' | 'post_comment' | 'profile_follow';

export interface UserStats {
  posts: number;
  followers: number;
  following: number;
}

export interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  bio?: string;
  stats?: UserStats;
  viewerIsFollowing?: boolean;
  isCurrentUser?: boolean;
}

export interface Story {
  id: string;
  user: User;
  isMe?: boolean;
}

export interface Post {
  id: string;
  author: User;
  content: string;
  image?: string;
  images?: string[];
  media?: PostImage[];
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

export interface PostComment {
  id: string;
  postId: string;
  author: User;
  content: string;
  createdAt: string;
  timestamp: string;
}

export interface PostImage {
  id?: string;
  url: string;
  storagePath?: string;
  width?: number;
  height?: number;
  sortOrder: number;
  isCover: boolean;
}

export interface PendingUploadImage {
  id: string;
  fileName: string;
  mimeType: string;
  size: number;
  dataUrl: string;
  width: number;
  height: number;
  isCover: boolean;
}

export interface GalleryCard {
  id: string;
  title: string;
  likes: number;
  image: string;
  category: string;
}

export interface DiscoverHero {
  title: string;
  subtitle: string;
  image: string;
}

export interface DiscoverData {
  hero: DiscoverHero;
  categories: string[];
  galleries: GalleryCard[];
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  actor: User;
  postId?: string;
  postPreview?: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  timestamp: string;
}

export interface FeedData {
  me: User;
  stories: Story[];
  posts: Post[];
  discover: DiscoverData;
  portfolioImages: string[];
  notifications: NotificationItem[];
  unreadNotificationCount: number;
  source: 'supabase' | 'mock';
}

export interface CreatePostInput {
  content: string;
  image?: string;
  images?: string[];
  media?: PostImage[];
  localImages?: PendingUploadImage[];
  type?: PostType;
  visibility: PostVisibility;
  location?: string;
  tags: string[];
}

export interface ApiErrorPayload {
  message: string;
  details?: string;
}

export interface PostLikeResult {
  postId: string;
  liked: boolean;
  likes: number;
}

export interface PostBookmarkResult {
  postId: string;
  bookmarked: boolean;
}

export interface ProfileFollowResult {
  profileId: string;
  following: boolean;
  followerCount: number;
  viewerFollowingCount: number;
}

export interface CreateCommentInput {
  content: string;
}

export interface UploadImagePayload {
  fileName: string;
  mimeType: string;
  dataUrl: string;
  width?: number;
  height?: number;
}

export interface UploadedImageAsset extends PostImage {}

export interface AuthFormState {
  email: string;
  password: string;
  name: string;
  username: string;
}
