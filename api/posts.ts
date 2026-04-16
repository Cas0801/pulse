import { createPost } from '../server/supabase.ts';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { content, image, type, visibility, location, tags } = req.body ?? {};

  if (typeof content !== 'string' || content.trim().length < 3) {
    res.status(400).json({ message: '内容至少需要 3 个字符' });
    return;
  }

  if (!['public', 'followers', 'private'].includes(visibility)) {
    res.status(400).json({ message: 'visibility 非法' });
    return;
  }

  try {
    const authHeader = req.headers?.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const post = await createPost(
      {
        content: content.trim(),
        image: typeof image === 'string' && image.trim() ? image.trim() : undefined,
        type: type === 'quote' || type === 'gallery' ? type : 'standard',
        visibility,
        location: typeof location === 'string' && location.trim() ? location.trim() : undefined,
        tags: Array.isArray(tags) ? tags.filter((tag) => typeof tag === 'string' && tag.trim()) : [],
      },
      accessToken,
    );

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({
      message: '创建帖子失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
}
