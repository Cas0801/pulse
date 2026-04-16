export type PostVisibility = 'public' | 'followers' | 'private';
export type PostType = 'standard' | 'quote' | 'gallery';

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
  timestamp: string;
  createdAt: string;
  likes: number;
  comments: number;
  type?: PostType;
  visibility: PostVisibility;
  location?: string;
  tags: string[];
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

export interface FeedData {
  me: User;
  stories: Story[];
  posts: Post[];
  discover: DiscoverData;
  portfolioImages: string[];
  source: 'supabase' | 'mock';
}

export interface CreatePostInput {
  content: string;
  image?: string;
  type?: PostType;
  visibility: PostVisibility;
  location?: string;
  tags: string[];
}

export interface ApiErrorPayload {
  message: string;
  details?: string;
}

export interface AuthFormState {
  email: string;
  password: string;
  name: string;
  username: string;
}
