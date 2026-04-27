import { useEffect, useState } from 'react';
import {
  createPost as createPostRequest,
  createPostComment as createPostCommentRequest,
  fetchFeed,
  fetchNotifications as fetchNotificationsRequest,
  fetchPostComments as fetchPostCommentsRequest,
  markAllNotificationsRead as markAllNotificationsReadRequest,
  setProfileFollow as setProfileFollowRequest,
  setPostBookmark,
  setPostLike,
  uploadPostImage,
} from '../lib/api';
import type { CreatePostInput, FeedData, FeedMode, NotificationItem, PostComment } from '../types';

export function usePulseData(accessToken?: string | null) {
  const [feedMode, setFeedMode] = useState<FeedMode>('for-you');
  const [feed, setFeed] = useState<FeedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [commentsByPost, setCommentsByPost] = useState<Record<string, PostComment[]>>({});
  const [commentLoadingByPost, setCommentLoadingByPost] = useState<Record<string, boolean>>({});
  const [commentSubmittingByPost, setCommentSubmittingByPost] = useState<Record<string, boolean>>({});
  const [commentErrorByPost, setCommentErrorByPost] = useState<Record<string, string | null>>({});
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [isNotificationsLoading, setIsNotificationsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  function dismissSuccessMessage() {
    setSuccessMessage(null);
  }

  async function reload() {
    setIsLoading(true);
    try {
      const nextFeed = await fetchFeed(accessToken, feedMode);
      setFeed(nextFeed);
      setNotifications(nextFeed.notifications ?? []);
      setUnreadNotificationCount(nextFeed.unreadNotificationCount ?? 0);
      setError(null);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : '加载失败');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    void reload();
  }, [accessToken, feedMode]);

  async function createPost(input: CreatePostInput) {
    setIsSubmitting(true);
    try {
      const uploadedMedia = input.localImages?.length
        ? await Promise.all(
            input.localImages.map((image, index) =>
              uploadPostImage(
                {
                  fileName: image.fileName,
                  mimeType: image.mimeType,
                  dataUrl: image.dataUrl,
                  width: image.width,
                  height: image.height,
                },
                accessToken,
              ).then((asset) => ({
                ...asset,
                sortOrder: index,
                isCover: image.isCover,
              })),
            ),
          )
        : [];

      const coverAsset = uploadedMedia.find((item) => item.isCover) ?? uploadedMedia[0];
      const created = await createPostRequest(
        {
          ...input,
          image: coverAsset?.url ?? input.image,
          images: uploadedMedia.length > 0 ? uploadedMedia.map((item) => item.url) : input.images,
          media: uploadedMedia.length > 0 ? uploadedMedia : input.media,
          localImages: undefined,
          type:
            input.type ??
            (uploadedMedia.length > 1 ? 'gallery' : uploadedMedia.length === 1 || input.image ? 'standard' : 'quote'),
        },
        accessToken,
      );
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
      setSuccessMessage('新内容已发布到内容流');
      return created;
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : '发布失败';
      setError(message);
      throw requestError;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function reloadNotifications() {
    setIsNotificationsLoading(true);
    try {
      const payload = await fetchNotificationsRequest(accessToken);
      setNotifications(payload.notifications);
      setUnreadNotificationCount(payload.unreadCount);
      setError(null);
      return payload.notifications;
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : '通知加载失败';
      setError(message);
      throw requestError;
    } finally {
      setIsNotificationsLoading(false);
    }
  }

  async function markNotificationsRead() {
    const previous = notifications;
    setNotifications((current) => current.map((item) => ({ ...item, isRead: true })));
    setUnreadNotificationCount(0);

    try {
      await markAllNotificationsReadRequest(accessToken);
      setError(null);
    } catch (requestError) {
      setNotifications(previous);
      setUnreadNotificationCount(previous.filter((item) => !item.isRead).length);
      const message = requestError instanceof Error ? requestError.message : '通知状态更新失败';
      setError(message);
      throw requestError;
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
    } finally {
      void reloadNotifications().catch(() => {});
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

  async function toggleFollow(profileId: string, nextFollowing: boolean) {
    const snapshot = feed;

    setFeed((current) => {
      if (!current) {
        return current;
      }

      const updateUser = <T extends { author?: { id: string; stats?: { followers: number } | undefined; viewerIsFollowing?: boolean }; user?: { id: string; stats?: { followers: number } | undefined; viewerIsFollowing?: boolean }; }>(
        item: T,
      ) => {
        const nextItem = { ...item };

        if (nextItem.author?.id === profileId) {
          nextItem.author = {
            ...nextItem.author,
            viewerIsFollowing: nextFollowing,
            stats: nextItem.author.stats
              ? {
                  ...nextItem.author.stats,
                  followers: Math.max(nextItem.author.stats.followers + (nextFollowing ? 1 : -1), 0),
                }
              : nextItem.author.stats,
          };
        }

        if (nextItem.user?.id === profileId) {
          nextItem.user = {
            ...nextItem.user,
            viewerIsFollowing: nextFollowing,
            stats: nextItem.user.stats
              ? {
                  ...nextItem.user.stats,
                  followers: Math.max(nextItem.user.stats.followers + (nextFollowing ? 1 : -1), 0),
                }
              : nextItem.user.stats,
          };
        }

        return nextItem;
      };

      const nextPosts = current.posts
        .map((post) => updateUser(post))
        .filter((post) => (feedMode === 'following' && !nextFollowing ? post.author.id !== profileId : true));

      return {
        ...current,
        me: {
          ...current.me,
          stats: current.me.stats
            ? {
                ...current.me.stats,
                following: Math.max(current.me.stats.following + (nextFollowing ? 1 : -1), 0),
              }
            : current.me.stats,
        },
        stories: current.stories.map((story) => updateUser(story)),
        posts: nextPosts,
      };
    });

    try {
      const result = await setProfileFollowRequest(profileId, nextFollowing, accessToken);

      setFeed((current) => {
        if (!current) {
          return current;
        }

        return {
          ...current,
          me: {
            ...current.me,
            stats: current.me.stats
              ? {
                  ...current.me.stats,
                  following: result.viewerFollowingCount,
                }
              : current.me.stats,
          },
          stories: current.stories.map((story) =>
            story.user.id === profileId
              ? {
                  ...story,
                  user: {
                    ...story.user,
                    viewerIsFollowing: result.following,
                    stats: story.user.stats
                      ? {
                          ...story.user.stats,
                          followers: result.followerCount,
                        }
                      : story.user.stats,
                  },
                }
              : story,
          ),
          posts: current.posts.map((post) =>
            post.author.id === profileId
              ? {
                  ...post,
                  author: {
                    ...post.author,
                    viewerIsFollowing: result.following,
                    stats: post.author.stats
                      ? {
                          ...post.author.stats,
                          followers: result.followerCount,
                        }
                      : post.author.stats,
                  },
                }
              : post,
          ),
        };
      });

      if (feedMode === 'following') {
        await reload();
      }

      return result;
    } catch (requestError) {
      setFeed(snapshot);
      const message = requestError instanceof Error ? requestError.message : '关注操作失败';
      setError(message);
      throw requestError;
    } finally {
      void reloadNotifications().catch(() => {});
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
    setCommentErrorByPost((current) => ({
      ...current,
      [postId]: null,
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
      setCommentErrorByPost((current) => ({
        ...current,
        [postId]: message,
      }));
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
    setCommentErrorByPost((current) => ({
      ...current,
      [postId]: null,
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
      setSuccessMessage('评论已发送并同步到动态');
      void reloadNotifications().catch(() => {});
      return created;
    } catch (requestError) {
      const message = requestError instanceof Error ? requestError.message : '评论发布失败';
      setCommentErrorByPost((current) => ({
        ...current,
        [postId]: message,
      }));
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
    feedMode,
    setFeedMode,
    feed,
    notifications,
    unreadNotificationCount,
    isLoading,
    isNotificationsLoading,
    isSubmitting,
    error,
    successMessage,
    dismissSuccessMessage,
    reload,
    createPost,
    toggleLike,
    toggleBookmark,
    toggleFollow,
    reloadNotifications,
    markNotificationsRead,
    commentsByPost,
    commentLoadingByPost,
    commentSubmittingByPost,
    commentErrorByPost,
    loadComments,
    createComment,
  };
}
