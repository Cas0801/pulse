/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, Plus, Sparkles } from 'lucide-react';
import HomeView from './components/HomeView';
import DiscoverView from './components/DiscoverView';
import ProfileView from './components/ProfileView';
import CreateView from './components/CreateView';
import BottomNav from './components/BottomNav';
import NotificationsView from './components/NotificationsView';
import { usePulseData } from './hooks/usePulseData';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import AuthView from './components/AuthView';
import StateCard from './components/StateCard';
import AppShellSkeleton from './components/AppShellSkeleton';
import { PRIMARY_NAV_ITEMS } from './lib/navigation';
import AiAssistantView from './components/AiAssistantView';
import { sendAiChat } from './lib/api';
import type { AiChatRequest } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showCreate, setShowCreate] = useState(false);
  const [showAi, setShowAi] = useState(false);
  const {
    session,
    isAuthenticated,
    isAuthLoading,
    authError,
    authMessage,
    hasSupabaseClientEnv,
    signIn,
    signUp,
    signOut,
  } = useSupabaseAuth();
  const {
    feedMode,
    setFeedMode,
    feed,
    notifications,
    unreadNotificationCount,
    isLoading,
    isSubmitting,
    isNotificationsLoading,
    error,
    successMessage,
    dismissSuccessMessage,
    createPost,
    reload,
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
  } = usePulseData(
    session?.access_token,
  );

  useEffect(() => {
    if (!successMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      dismissSuccessMessage();
    }, 3200);

    return () => window.clearTimeout(timer);
  }, [dismissSuccessMessage, successMessage]);

  const handleTabChange = (tab: string) => {
    if (tab === 'create') {
      setShowCreate(true);
    } else {
      setActiveTab(tab);
    }
  };

  async function handleCreatePost(input: Parameters<typeof createPost>[0]) {
    await createPost(input);
  }

  function requestAi(input: Omit<AiChatRequest, 'conversationId'>) {
    return sendAiChat(input, session?.access_token);
  }

  if (isAuthLoading) {
    return <AppShellSkeleton />;
  }

  if (hasSupabaseClientEnv && !isAuthenticated) {
    return (
      <AuthView
        isBusy={isAuthLoading}
        error={authError}
        message={authMessage}
        onSignIn={signIn}
        onSignUp={signUp}
      />
    );
  }

  if (isLoading) {
    return <AppShellSkeleton />;
  }

  if (!feed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-[460px]">
          <StateCard
            tone="error"
            eyebrow="App Boot"
            title="主界面没有完成加载"
            description={error ?? '内容流没有返回数据，请重试并查看当前网络环境。'}
            actionLabel="重新加载"
            onAction={() => void reload()}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
      <div className="mx-auto lg:shell-desktop">
        <aside className="hidden lg:flex lg:flex-col lg:gap-4">
          <div className="rail-card sticky top-6 rounded-[28px] p-5">
            <div className="section-label">导航</div>
            <h2 className="mt-2 text-[28px] font-semibold text-ink">Pulse</h2>
            <p className="mt-2 text-sm leading-6 text-ink/58">发现和分享你的内容。</p>
            <div className="mt-6 space-y-2">
              {PRIMARY_NAV_ITEMS.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    aria-current={isActive ? 'page' : undefined}
                    className={`flex w-full items-center gap-3 rounded-[16px] px-4 py-3 text-sm font-semibold transition-colors ${isActive ? 'bg-accent text-white shadow-[0_10px_24px_rgba(16,163,127,0.18)]' : 'text-ink/65 hover:bg-white/70'}`}
                    onClick={() => handleTabChange(item.id)}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </button>
                );
              })}
              <button
                className="ios-primary-btn mt-3 flex w-full items-center justify-center gap-2"
                onClick={() => setShowCreate(true)}
              >
                <Plus size={16} />
                发布内容
              </button>
            </div>
          </div>
          <div className="rail-card rounded-[28px] p-5">
            <div className="section-label">账号</div>
            <div className="mt-3 text-sm text-ink/65">{hasSupabaseClientEnv && isAuthenticated ? session?.user.email : '未登录'}</div>
            {hasSupabaseClientEnv && isAuthenticated ? (
              <button className="mt-4 text-sm font-semibold text-accent" onClick={() => void signOut()}>
                退出登录
              </button>
            ) : null}
          </div>
        </aside>

        <div className="ios-shell feed-frame relative flex min-h-[100dvh] w-full flex-col overflow-hidden rounded-[36px] border border-white/60 lg:min-h-[880px] lg:rounded-[32px]">
          <div className="space-y-3 border-b border-line/70 bg-white/42 px-4 py-3 backdrop-blur-xl">
            {error ? (
              <StateCard
                compact
                tone="error"
                eyebrow="加载失败"
                title="内容暂时没有加载完成"
                description={error}
                actionLabel="重新加载"
                onAction={() => void reload()}
              />
            ) : null}
            {successMessage ? (
              <StateCard
                compact
                tone="success"
                eyebrow="操作完成"
                title="操作已完成"
                description={successMessage}
                actionLabel="知道了"
                onAction={dismissSuccessMessage}
              />
            ) : null}
            {hasSupabaseClientEnv && isAuthenticated ? (
              <div className="flex items-center justify-between px-1 text-[11px] text-ink/70">
                <span className="truncate">{session?.user.email}</span>
                <button className="font-semibold text-accent" onClick={() => void signOut()}>
                  退出登录
                </button>
              </div>
            ) : (
              <div className="px-1 text-[11px] text-ink/65">未登录</div>
            )}
          </div>

          <AnimatePresence mode="wait">
            {activeTab === 'home' && (
              <motion.div
                key="home"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <HomeView
                  posts={feed.posts}
                  stories={feed.stories}
                  source={feed.source}
                  feedMode={feedMode}
                  onFeedModeChange={setFeedMode}
                  notifications={notifications}
                  unreadNotificationCount={unreadNotificationCount}
                  onToggleLike={toggleLike}
                  onToggleBookmark={toggleBookmark}
                  onToggleFollow={toggleFollow}
                  commentsByPost={commentsByPost}
                  commentLoadingByPost={commentLoadingByPost}
                  commentSubmittingByPost={commentSubmittingByPost}
                  commentErrorByPost={commentErrorByPost}
                  onLoadComments={loadComments}
                  onCreateComment={createComment}
                />
              </motion.div>
            )}
            {activeTab === 'discover' && (
              <motion.div
                key="discover"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <DiscoverView discover={feed.discover} />
              </motion.div>
            )}
            {activeTab === 'profile' && (
              <motion.div
                key="profile"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <ProfileView me={feed.me} portfolioImages={feed.portfolioImages} posts={feed.posts} />
              </motion.div>
            )}
            {activeTab === 'messages' && (
              <motion.div
                key="messages"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex-1"
              >
                <NotificationsView
                  notifications={notifications}
                  unreadCount={unreadNotificationCount}
                  isLoading={isNotificationsLoading}
                  onRefresh={reloadNotifications}
                  onMarkAllRead={markNotificationsRead}
                  onOpenAi={() => setShowAi(true)}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <BottomNav activeTab={activeTab} onTabChange={handleTabChange} />

          <AnimatePresence>
            {showCreate && (
              <motion.div
                initial={{ y: '100%' }}
                animate={{ y: 0 }}
                exit={{ y: '100%' }}
                transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                className="fixed inset-0 z-[60]"
              >
                <CreateView
                  onClose={() => setShowCreate(false)}
                  me={feed.me}
                  isSubmitting={isSubmitting}
                  onSubmit={handleCreatePost}
                  onTabChange={handleTabChange}
                  onAiOptimize={(content) => requestAi({ message: content, mode: 'improve-post' })}
                />
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showAi ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70]">
                <AiAssistantView accessToken={session?.access_token} onClose={() => setShowAi(false)} />
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <aside className="hidden lg:flex lg:flex-col lg:gap-4">
          <div className="rail-card sticky top-6 rounded-[28px] p-5">
            <div className="flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.18em] text-ink/44">
              <Sparkles size={14} />
              热门话题
            </div>
            <div className="mt-4 space-y-3">
              <div className="ios-panel rounded-[20px] p-4">
                <div className="text-sm font-semibold text-ink">热门话题</div>
                <div className="mt-2 space-y-2 text-sm text-ink/62">
                  <div>#design-system</div>
                  <div>#product-thinking</div>
                  <div>#creator-economy</div>
                </div>
              </div>
              <div className="ios-panel rounded-[20px] p-4">
                <div className="flex items-center gap-2 text-sm font-semibold text-ink">
                  <Bell size={15} />
                  通知摘要
                </div>
                <p className="mt-2 text-sm leading-6 text-ink/65">最新消息会显示在这里。</p>
              </div>
              <div className="ios-panel rounded-[20px] p-4">
                <div className="text-sm font-semibold text-ink">数据概览</div>
                <div className="mt-3 grid grid-cols-2 gap-3">
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-ink/42">Posts</div>
                    <div className="mt-1 text-2xl font-semibold text-ink">{feed.posts.length}</div>
                  </div>
                  <div>
                    <div className="text-[11px] uppercase tracking-[0.16em] text-ink/42">Stories</div>
                    <div className="mt-1 text-2xl font-semibold text-ink">{feed.stories.length}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
