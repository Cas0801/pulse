import { useEffect, useState } from 'react';
import {
  createPost as createPostRequest,
  createPostComment as createPostCommentRequest,
  fetchFeed,
  fetchPostComments as fetchPostCommentsRequest,
  setPostBookmark,
  setPostLike,
} from '../lib/api';
import type { CreatePostInput, FeedData, PostComment } from '../types';

export function usePulseData(accessToken?: string | null) {
  const [feed, setFeed] = useState<FeedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, PostComment[]>>({});
  const [commentLoadingByPost, setCommentLoadingByPost] = useState<Record<string, boolean>>({});
  const [commentSubmittingByPost, setCommentSubmittingByPost] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);

  async function reload() {
    setIsLoading(true);
    try {
      const nextFeed = await fetchFeed(accessToken);
      setFeed(nextFeed);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, [accessToken]);

  async function createPost(input: CreatePostInput) {
    setIsSubmitting(true);
    try {
      const created = await createPostRequest(input, accessToken);
      setFeed((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          posts: [created, ...current.posts],
          me: {
            ...current.me,
            stats: current.me.stats
              ? {
                  ...current.me.stats,
                  posts: current.me.stats.posts + 1,
                }
              : current.me.stats,
          },
        };
      });
      setError(null);
      return created;
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : '发布失败';
      setError(message);
      throw requestError;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleLike(postId: string, nextLiked: boolean) {
    setFeed((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        posts: current.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                likes: Math.max(post.likes + (nextLiked ? 1 : -1), 0),
                viewerHasLiked: nextLiked,
              }
            : post,
        ),
      };
    });

    try {
      const result = await setPostLike(postId, nextLiked, accessToken);

      setFeed((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          posts: current.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: result.likes,
                  viewerHasLiked: result.liked,
                }
              : post,
          ),
        };
      });

      return result;
    } catch (requestError) {
      setFeed((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          posts: current.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  likes: Math.max(post.likes + (nextLiked ? -1 : 1), 0),
                  viewerHasLiked: !nextLiked,
                }
              : post,
          ),
        };
      });

      const message = requestError instanceof Error ? requestError.message : '点赞失败';
      setError(message);
      throw requestError;
    }
  }

  async function toggleBookmark(postId: string, nextBookmarked: boolean) {
    setFeed((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        posts: current.posts.map((post) =>
          post.id === postId
            ? {
                ...post,
                viewerHasBookmarked: nextBookmarked,
              }
            : post,
        ),
      };
    });

    try {
      const result = await setPostBookmark(postId, nextBookmarked, accessToken);

      setFeed((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          posts: current.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  viewerHasBookmarked: result.bookmarked,
                }
              : post,
          ),
        };
      });

      return result;
    } catch (requestError) {
      setFeed((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          posts: current.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  viewerHasBookmarked: !nextBookmarked,
                }
              : post,
          ),
        };
      });

      const message = requestError instanceof Error ? requestError.message : '收藏失败';
      setError(message);
      throw requestError;
    }
  }

  async function loadComments(postId: string, force = false) {
    if (!force && commentsByPost[postId]) {
      return commentsByPost[postId];
    }

    setCommentLoadingByPost((current) => ({
      ...current,
      [postId]: true,
    }));

    try {
      const comments = await fetchPostCommentsRequest(postId, accessToken);
      setCommentsByPost((current) => ({
        ...current,
        [postId]: comments,
      }));
      setError(null);
      return comments;
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : '评论加载失败';
      setError(message);
      throw requestError;
    } finally {
      setCommentLoadingByPost((current) => ({
        ...current,
        [postId]: false,
      }));
    }
  }

  async function createComment(postId: string, content: string) {
    setCommentSubmittingByPost((current) => ({
      ...current,
      [postId]: true,
    }));

    try {
      const created = await createPostCommentRequest(postId, { content }, accessToken);
      setCommentsByPost((current) => ({
        ...current,
        [postId]: [...(current[postId] ?? []), created],
      }));
      setFeed((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          posts: current.posts.map((post) =>
            post.id === postId
              ? {
                  ...post,
                  comments: post.comments + 1,
                }
              : post,
          ),
        };
      });
      setError(null);
      return created;
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : '评论发布失败';
      setError(message);
      throw requestError;
    } finally {
      setCommentSubmittingByPost((current) => ({
        ...current,
        [postId]: false,
      }));
    }
  }

  return {
    feed,
    isLoading,
    isSubmitting,
    error,
    reload,
    createPost,
    toggleLike,
    toggleBookmark,
    commentsByPost,
    commentLoadingByPost,
    commentSubmittingByPost,
    loadComments,
    createComment,
  };
}
