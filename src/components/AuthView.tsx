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
    <div className="min-h-screen bg-[#D9D8D4] flex items-center justify-center px-6 py-10">
      <div className="w-full max-w-[430px] bg-bg border border-line shadow-[0_0_100px_rgba(0,0,0,0.15)]">
        <div className="border-b border-line px-6 py-5">
          <div className="font-mono text-[10px] uppercase opacity-60">Pulse / Auth Gateway</div>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tighter">Secure Access</h1>
          <p className="mt-3 text-sm opacity-70">
            用 Supabase Auth 管理真实身份，写入帖子时走用户级权限而不是假数据。
          </p>
        </div>

        <div className="grid grid-cols-2 border-b border-line bg-line">
          <button
            className={`py-3 font-mono text-[10px] font-bold uppercase ${mode === 'signin' ? 'bg-ink text-bg' : 'bg-bg text-ink'}`}
            onClick={() => setMode('signin')}
          >
            Sign In
          </button>
          <button
            className={`py-3 font-mono text-[10px] font-bold uppercase border-l border-line ${mode === 'signup' ? 'bg-ink text-bg' : 'bg-bg text-ink'}`}
            onClick={() => setMode('signup')}
          >
            Sign Up
          </button>
        </div>

        <div className="space-y-4 px-6 py-6">
          {mode === 'signup' ? (
            <>
              <input
                className="w-full border border-line bg-transparent px-4 py-3 font-mono text-sm outline-none focus:bg-line/[0.04]"
                placeholder="Name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
              <input
                className="w-full border border-line bg-transparent px-4 py-3 font-mono text-sm outline-none focus:bg-line/[0.04]"
                placeholder="Username"
                value={form.username}
                onChange={(event) => setForm((current) => ({ ...current, username: event.target.value }))}
              />
            </>
          ) : null}

          <input
            className="w-full border border-line bg-transparent px-4 py-3 font-mono text-sm outline-none focus:bg-line/[0.04]"
            placeholder="Email"
            type="email"
            value={form.email}
            onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
          />
          <input
            className="w-full border border-line bg-transparent px-4 py-3 font-mono text-sm outline-none focus:bg-line/[0.04]"
            placeholder="Password"
            type="password"
            value={form.password}
            onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
          />

          {error ? (
            <div className="border border-[#c96d6d] bg-[#f4dddd] px-4 py-3 text-sm">{error}</div>
          ) : null}

          {message ? (
            <div className="border border-line bg-line/[0.04] px-4 py-3 text-sm">{message}</div>
          ) : null}

          <button
            className="w-full bg-ink text-bg py-3 font-mono text-xs font-bold uppercase tracking-widest disabled:opacity-50"
            disabled={isBusy || !canSubmit}
            onClick={() => void handleSubmit()}
          >
            {isBusy ? 'Processing...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </div>
      </div>
    </div>
  );
}
