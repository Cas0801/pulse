import { handleAiChat, AiRequestError } from '../_lib/ai.js';
import { applyCors } from '../_lib/http.js';

export async function handleAiChatRequest(req: any, res: any) {
  if (applyCors(req, res)) return;
  if (req.method !== 'POST') { res.status(405).json({ message: 'Method Not Allowed' }); return; }
  const authHeader = req.headers?.authorization;
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : '';
  if (!accessToken) { res.status(401).json({ message: '请先登录后使用 AI 助手。' }); return; }
  try { res.status(200).json(await handleAiChat(req.body ?? {}, accessToken)); }
  catch (error) { res.status(error instanceof AiRequestError ? error.status : 500).json({ message: error instanceof AiRequestError ? error.message : 'AI 请求失败，请稍后重试。' }); }
}

export default handleAiChatRequest;
