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
      <div className="min-h-screen bg-[#D9D8D4] flex items-center justify-center px-6">
        <div className="max-w-sm w-full border border-line bg-bg p-6 text-center">
          <div className="font-mono text-xs opacity-60">AUTH_BOOTSTRAP</div>
          <h1 className="mt-3 text-2xl font-black uppercase tracking-tighter">Loading Session</h1>
          <p className="mt-3 text-sm opacity-70">正在校验 Supabase 登录态与用户会话。</p>
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
      <div className="min-h-screen bg-[#D9D8D4] flex items-center justify-center px-6">
        <div className="max-w-sm w-full border border-line bg-bg p-6 text-center">
          <div className="font-mono text-xs opacity-60">SYSTEM_BOOTSTRAP</div>
          <h1 className="mt-3 text-2xl font-black uppercase tracking-tighter">Loading Pulse</h1>
          <p className="mt-3 text-sm opacity-70">正在初始化前后端链路与云端数据连接。</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex justify-center bg-[#D9D8D4] min-h-screen">
      <div className="w-full max-w-[430px] bg-bg relative shadow-[0_0_100px_rgba(0,0,0,0.2)] overflow-hidden flex flex-col min-h-screen border-x border-line">
        {error ? (
          <div className="border-b border-line bg-[#f2d6d6] px-4 py-3 text-[11px] font-mono text-ink flex items-center justify-between gap-3">
            <span>{error}</span>
            <button className="underline underline-offset-2" onClick={() => void reload()}>
              RETRY
            </button>
          </div>
        ) : null}
        {hasSupabaseClientEnv && isAuthenticated ? (
          <div className="border-b border-line bg-line/[0.05] px-4 py-2 text-[10px] font-mono flex items-center justify-between">
            <span>{session?.user.email}</span>
            <button className="underline underline-offset-2" onClick={() => void signOut()}>
              SIGN_OUT
            </button>
          </div>
        ) : (
          <div className="border-b border-line bg-line/[0.05] px-4 py-2 text-[10px] font-mono">
            DEMO_MODE / NO_SUPABASE_AUTH_ENV
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
              <div className="border-2 border-dashed border-line p-10 mb-6 relative">
                <div className="absolute top-0 left-0 w-2 h-2 bg-line -translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute top-0 right-0 w-2 h-2 bg-line translate-x-1/2 -translate-y-1/2"></div>
                <div className="absolute bottom-0 left-0 w-2 h-2 bg-line -translate-x-1/2 translate-y-1/2"></div>
                <div className="absolute bottom-0 right-0 w-2 h-2 bg-line translate-x-1/2 translate-y-1/2"></div>
                <span className="text-6xl grayscale opacity-40">💬</span>
              </div>
              <h3 className="text-xl font-black uppercase tracking-tighter mb-2">Message_Hub</h3>
              <p className="font-mono text-[10px] opacity-60 uppercase tracking-widest">No_Active_Transmissions_Detected</p>
              <div className="mt-8 flex gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-line/20"></div>
                 <div className="w-1.5 h-1.5 rounded-full bg-line/20"></div>
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
