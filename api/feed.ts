import { loadFeed } from './_lib/supabase.js';

export default async function handler(req: any, res: any) {
  try {
    const authHeader = req.headers?.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const mode = req.query?.mode === 'following' ? 'following' : 'for-you';
    const feed = await loadFeed(accessToken, mode);
    res.status(200).json(feed);
  } catch (error) {
    res.status(500).json({
      message: '加载 feed 失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
}
