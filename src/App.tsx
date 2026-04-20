/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import HomeView from './components/HomeView';
import DiscoverView from './components/DiscoverView';
import ProfileView from './components/ProfileView';
import CreateView from './components/CreateView';
import BottomNav from './components/BottomNav';
import { usePulseData } from './hooks/usePulseData';
import { useSupabaseAuth } from './hooks/useSupabaseAuth';
import AuthView from './components/AuthView';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [showCreate, setShowCreate] = useState(false);
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
  const { feed, isLoading, isSubmitting, error, createPost, reload } = usePulseData(session?.access_token);

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

  if (isAuthLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="ios-card max-w-sm w-full rounded-[30px] p-7 text-center">
          <div className="section-label">Session Sync</div>
          <h1 className="mt-3 text-2xl font-semibold text-ink">正在连接你的账号</h1>
          <p className="mt-3 text-sm text-ink/70">正在校验 Supabase 登录态与用户会话。</p>
        </div>
      </div>
    );
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

  if (isLoading || !feed) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6">
        <div className="ios-card max-w-sm w-full rounded-[30px] p-7 text-center">
          <div className="section-label">Cloud Bootstrap</div>
          <h1 className="mt-3 text-2xl font-semibold text-ink">正在加载 Pulse</h1>
          <p className="mt-3 text-sm text-ink/70">正在初始化前后端链路与云端数据连接。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center min-h-screen px-3 py-4 sm:px-6 sm:py-6">
      <div className="ios-shell w-full max-w-[430px] relative overflow-hidden flex flex-col min-h-[100dvh] sm:min-h-[900px] rounded-[36px] border border-white/60">
        {error ? (
          <div className="border-b border-line/70 bg-[#fdebeb] px-4 py-3 text-[12px] text-ink flex items-center justify-between gap-3">
            <span>{error}</span>
            <button className="font-semibold text-accent" onClick={() => void reload()}>
              重试
            </button>
          </div>
        ) : null}
        {hasSupabaseClientEnv && isAuthenticated ? (
          <div className="border-b border-line/70 bg-white/50 px-4 py-2 text-[11px] text-ink/70 flex items-center justify-between backdrop-blur-xl">
            <span className="truncate">{session?.user.email}</span>
            <button className="font-semibold text-accent" onClick={() => void signOut()}>
              退出登录
            </button>
          </div>
        ) : (
          <div className="border-b border-line/70 bg-white/50 px-4 py-2 text-[11px] text-ink/65 backdrop-blur-xl">
            演示模式 / 未配置 Supabase Auth
          </div>
        )}
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1"
            >
              <HomeView posts={feed.posts} stories={feed.stories} source={feed.source} />
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
              <ProfileView me={feed.me} portfolioImages={feed.portfolioImages} />
            </motion.div>
          )}
          {activeTab === 'messages' && (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex-1 flex flex-col items-center justify-center p-8 text-center"
            >
              <div className="ios-card mb-6 rounded-[28px] px-10 py-12 relative">
                <span className="text-6xl opacity-60">💬</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">消息中心</h3>
              <p className="text-sm text-ink/60">暂时还没有新的对话或通知。</p>
              <div className="mt-8 flex gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-line/60"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-line/60"></div>
              </div>
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
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
