import { loadFeed } from '../server/supabase';

export default async function handler(req: any, res: any) {
  try {
    const authHeader = req.headers?.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const feed = await loadFeed(accessToken);
    res.status(200).json(feed);
  } catch (error) {
    res.status(500).json({
      message: '加载 feed 失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
}
