import { useMemo, useState } from 'react';
import { ArrowLeft, Bot, Eraser, Send, Sparkles, WandSparkles } from 'lucide-react';
import { sendAiChat } from '../lib/api';
import type { AiMessage, AiMode } from '../types';

interface AiAssistantViewProps {
  accessToken?: string | null;
  onClose: () => void;
}

const starterMessage: AiMessage = {
  id: 'pulse-ai-welcome',
  role: 'assistant',
  content: '你好，我可以帮你润色帖子、生成标签，也可以一起梳理创作思路。',
  createdAt: new Date().toISOString(),
};

const quickActions: Array<{ label: string; prompt: string; mode: AiMode }> = [
  { label: '润色帖子', prompt: '请帮我把下面这段内容润色得更自然，保留原意：', mode: 'improve-post' },
  { label: '生成标签', prompt: '请根据这段内容推荐适合发布的标签：', mode: 'suggest-tags' },
  { label: '整理思路', prompt: '请帮我把这个想法整理成清晰的创作提纲：', mode: 'chat' },
];

export default function AiAssistantView({ accessToken, onClose }: AiAssistantViewProps) {
  const [messages, setMessages] = useState<AiMessage[]>([starterMessage]);
  const [conversationId, setConversationId] = useState<string>();
  const [draft, setDraft] = useState('');
  const [mode, setMode] = useState<AiMode>('chat');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [failedMessage, setFailedMessage] = useState<string | null>(null);

  const canSend = useMemo(() => Boolean(draft.trim()) && !isSending, [draft, isSending]);

  async function handleSend() {
    const message = draft.trim();
    if (!message || isSending) return;

    setMessages((current) => [...current, {
      id: `local-user-${Date.now()}`,
      role: 'user',
      content: message,
      createdAt: new Date().toISOString(),
    }]);
    setDraft('');
    setError(null);
    setFailedMessage(null);
    setIsSending(true);

    try {
      const response = await sendAiChat({ conversationId, message, mode }, accessToken);
      setConversationId(response.conversationId);
      setMessages((current) => [...current, response.message]);
    } catch (requestError) {
      setFailedMessage(message);
      setError(requestError instanceof Error ? requestError.message : 'AI 请求失败，请稍后重试。');
    } finally {
      setIsSending(false);
    }
  }

  function handleQuickAction(action: (typeof quickActions)[number]) {
    setMode(action.mode);
    setDraft((current) => (current.trim() ? `${action.prompt}\n${current}` : `${action.prompt}\n`));
  }

  function clearConversation() {
    setMessages([starterMessage]);
    setConversationId(undefined);
    setDraft('');
    setError(null);
    setFailedMessage(null);
  }

  return (
    <div className="fixed inset-0 z-[70] bg-[#f7f8fa]/95 backdrop-blur-xl">
      <div className="mx-auto flex h-full max-w-[900px] flex-col bg-white/80 shadow-[0_24px_80px_rgba(15,23,42,0.12)] lg:my-5 lg:h-[calc(100%-40px)] lg:rounded-[32px] lg:border lg:border-white">
        <header className="flex items-center justify-between border-b border-line/70 px-5 py-4 lg:px-7">
          <div className="flex items-center gap-3">
            <button aria-label="返回" title="返回" className="ios-pill rounded-full p-2 text-ink/70" onClick={onClose}><ArrowLeft size={18} /></button>
            <div><div className="section-label">Pulse Assistant</div><h1 className="mt-1 text-[24px] font-semibold text-ink">AI 创作助手</h1></div>
          </div>
          <button aria-label="清空会话" title="清空会话" className="ios-secondary-btn inline-flex items-center gap-2 px-3 py-2 text-[13px]" onClick={clearConversation}><Eraser size={14} />清空</button>
        </header>

        <main className="flex-1 overflow-y-auto px-4 py-5 lg:px-7">
          <div className="mx-auto max-w-[720px] space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {message.role === 'assistant' ? <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-[#eaf2ff] text-accent"><Bot size={18} /></div> : null}
                <div className={`max-w-[min(720px,85%)] whitespace-pre-wrap rounded-[22px] px-4 py-3 text-[14px] leading-7 ${message.role === 'user' ? 'bg-accent text-white' : 'ios-panel text-ink/82'}`}>{message.content}</div>
              </div>
            ))}
            {isSending ? <div className="flex items-center gap-3 text-sm text-ink/50"><div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#eaf2ff] text-accent"><Bot size={18} /></div>正在思考...</div> : null}
            {error ? (
              <div className="flex items-center justify-between gap-3 rounded-[18px] border border-[#f2c4c4] bg-[#fff5f5] px-4 py-3 text-sm text-[#a34848]">
                <span>{error}</span>
                {failedMessage ? <button className="shrink-0 font-semibold underline" onClick={() => { setDraft(failedMessage); setError(null); }}>重试</button> : null}
              </div>
            ) : null}
          </div>
        </main>

        <footer className="border-t border-line/70 bg-white/90 px-4 pb-4 pt-3 lg:px-7">
          <div className="mx-auto max-w-[720px]">
            <div className="mb-3 flex gap-2 overflow-x-auto no-scrollbar">
              {quickActions.map((action) => <button key={action.label} className="ios-pill inline-flex shrink-0 items-center gap-2 rounded-full px-3 py-2 text-[12px] font-semibold text-ink/70" onClick={() => handleQuickAction(action)}><WandSparkles size={13} className="text-accent" />{action.label}</button>)}
            </div>
            <div className="flex items-end gap-3 rounded-[24px] border border-line bg-white p-2 shadow-[0_8px_24px_rgba(15,23,42,0.05)] focus-within:border-accent/50 focus-within:ring-4 focus-within:ring-accent/10">
              <textarea aria-label="输入消息" className="min-h-[46px] flex-1 resize-none bg-transparent px-3 py-2.5 text-[14px] leading-6 text-ink outline-none placeholder:text-ink/35" placeholder="输入你的问题或创作需求..." value={draft} onChange={(event) => setDraft(event.target.value)} onKeyDown={(event) => { if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); void handleSend(); } }} />
              <button aria-label="发送消息" title="发送消息" className="ios-primary-btn rounded-[18px] p-3" disabled={!canSend} onClick={() => void handleSend()}><Send size={17} /></button>
            </div>
            <div className="mt-2 flex items-center justify-between px-1 text-[11px] text-ink/42"><span className="inline-flex items-center gap-1"><Sparkles size={12} />AI 只提供建议，发布前请自行确认</span><span>{draft.length}/2000</span></div>
          </div>
        </footer>
      </div>
    </div>
  );
}
