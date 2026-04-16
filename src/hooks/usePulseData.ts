import { useEffect, useState } from 'react';
import { createPost as createPostRequest, fetchFeed } from '../lib/api';
import type { CreatePostInput, FeedData } from '../types';

export function usePulseData(accessToken?: string | null) {
  const [feed, setFeed] = useState<FeedData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  return {
    feed,
    isLoading,
    isSubmitting,
    error,
    reload,
    createPost,
  };
}
