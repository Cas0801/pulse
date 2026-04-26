import { setProfileFollow } from '../../_lib/supabase.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  try {
    const authHeader = req.headers?.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const profileId = String(req.query.profileId ?? '');

    if (!profileId) {
      res.status(400).json({ message: '缺少 profileId，无法执行关注操作' });
      return;
    }

    const result = await setProfileFollow(profileId, req.method === 'POST', accessToken);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({
      message: req.method === 'POST' ? '关注失败' : '取消关注失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
}
