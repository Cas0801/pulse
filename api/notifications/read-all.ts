import { markNotificationsRead } from '../_lib/supabase.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    const authHeader = req.headers?.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const payload = await markNotificationsRead(accessToken);
    res.status(200).json(payload);
  } catch (error) {
    res.status(500).json({
      message: '更新通知状态失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
}
