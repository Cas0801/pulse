import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { hasSupabaseClientEnv, supabase } from '../lib/supabaseClient';

interface SignUpInput {
  email: string;
  password: string;
  name: string;
  username: string;
}

export function useSupabaseAuth() {
  const [session, setSession] = useState<Session | null>(null);
  const [isAuthLoading, setIsAuthLoading] = useState(hasSupabaseClientEnv);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authMessage, setAuthMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) {
      setIsAuthLoading(false);
      return;
    }

    void supabase.auth.getSession().then(({ data, error }) => {
      setSession(data.session);
      setAuthError(error?.message ?? null);
      setIsAuthLoading(false);
    });

    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
    });

    return () => data.subscription.unsubscribe();
  }, []);

  async function signIn(email: string, password: string) {
    if (!supabase) {
      setAuthError('缺少 Supabase 前端环境变量，无法登录。');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setAuthError(error?.message ?? null);
    setAuthMessage(error ? null : '登录成功。');
  }

  async function signUp(input: SignUpInput) {
    if (!supabase) {
      setAuthError('缺少 Supabase 前端环境变量，无法注册。');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email: input.email,
      password: input.password,
      options: {
        data: {
          name: input.name,
          username: input.username.startsWith('@') ? input.username : `@${input.username}`,
          avatar_url: `https://api.dicebear.com/9.x/notionists/svg?seed=${encodeURIComponent(input.username)}`,
        },
      },
    });

    setAuthError(error?.message ?? null);
    setAuthMessage(
      error
        ? null
        : data.session
          ? '注册并登录成功。'
          : '注册成功，请检查邮箱并完成确认后登录。',
    );
  }

  async function signOut() {
    if (!supabase) {
      return;
    }

    const { error } = await supabase.auth.signOut();
    setAuthError(error?.message ?? null);
    setAuthMessage(error ? null : '已退出登录。');
  }

  return {
    session,
    isAuthenticated: Boolean(session),
    isAuthLoading,
    authError,
    authMessage,
    hasSupabaseClientEnv,
    signIn,
    signUp,
    signOut,
  };
}
