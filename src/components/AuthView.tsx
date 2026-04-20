import { useState } from 'react';
import type { AuthFormState } from '../types';

interface AuthViewProps {
  isBusy: boolean;
  error: string | null;
  message: string | null;
  onSignIn: (email: string, password: string) => Promise<void>;
  onSignUp: (input: AuthFormState) => Promise<void>;
}

const initialState: AuthFormState = {
  email: '',
  password: '',
  name: '',
  username: '',
};

export default function AuthView({ isBusy, error, message, onSignIn, onSignUp }: AuthViewProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [form, setForm] = useState<AuthFormState>(initialState);

  const canSubmit =
    form.email.trim().length > 3 &&
    form.password.trim().length >= 6 &&
    (mode === 'signin' || (form.name.trim().length > 1 && form.username.trim().length > 1));

  async function handleSubmit() {
    if (mode === 'signin') {
      await onSignIn(form.email, form.password);
      return;
    }

    await onSignUp(form);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 py-10">
      <div className="ios-shell w-full max-w-[430px] rounded-[36px] border border-white/70 overflow-hidden">
        <div className="px-6 py-6">
          <div className="section-label">Pulse Account</div>
          <h1 className="mt-2 text-3xl font-semibold">欢迎回来</h1>
          <p className="mt-3 text-sm text-ink/70">
            用 Supabase Auth 管理真实身份，写入帖子时走用户级权限而不是假数据。
          </p>
        </div>

        <div className="px-6 pb-2">
        <div className="ios-panel grid grid-cols-2 rounded-[22px] p-1">
          <button
            className={`rounded-[18px] py-3 text-sm font-semibold ${mode === 'signin' ? 'bg-[#dcebff] text-accent' : 'text-ink/60'}`}
            onClick={() => setMode('signin')}
          >
            登录
          </button>
          <button
            className={`rounded-[18px] py-3 text-sm font-semibold ${mode === 'signup' ? 'bg-[#dcebff] text-accent' : 'text-ink/60'}`}
            onClick={() => setMode('signup')}
          >
            注册
          </button>
        </div>
        </div>

        <div className="space-y-4 px-6 py-6">
          {mode === 'signup' ? (
            <>
              <input
                className="ios-input"
                placeholder="姓名"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
              <input
                className="ios-input"
                placeholder="用户名"
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              />
            </>
          ) : null}

          <input
            className="ios-input"
            placeholder="邮箱"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            className="ios-input"
            placeholder="密码"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />

          {error ? (
            <div className="rounded-[18px] border border-[#f3bcbc] bg-[#fff1f1] px-4 py-3 text-sm text-[#9f4141]">{error}</div>
          ) : null}

          {message ? (
            <div className="rounded-[18px] border border-line bg-white/70 px-4 py-3 text-sm">{message}</div>
          ) : null}

          <button
            className="ios-primary-btn w-full"
            disabled={isBusy || !canSubmit}
            onClick={() => void handleSubmit()}
          >
            {isBusy ? '处理中...' : mode === 'signin' ? '登录' : '创建账号'}
          </button>
        </div>
      </div>
    </div>
  );
}
