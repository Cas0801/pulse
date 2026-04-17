import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import { getConfig, hasSupabaseConfig } from '../api/_lib/config';
import { createPost, loadFeed } from '../api/_lib/supabase';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const config = getConfig();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.clientOrigin ?? '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, apikey');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});
app.use(express.json());

app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    ok: true,
    source: hasSupabaseConfig() ? 'supabase' : 'mock',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/feed', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const feed = await loadFeed(accessToken);
    res.json(feed);
  } catch (error) {
    res.status(500).json({
      message: '加载 feed 失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.post('/api/posts', async (req: Request, res: Response) => {
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
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const post = await createPost({
      content: content.trim(),
      image: typeof image === 'string' && image.trim() ? image.trim() : undefined,
      type: type === 'quote' || type === 'gallery' ? type : 'standard',
      visibility,
      location: typeof location === 'string' && location.trim() ? location.trim() : undefined,
      tags: Array.isArray(tags) ? tags.filter((tag) => typeof tag === 'string' && tag.trim()) : [],
    }, accessToken);

    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({
      message: '创建帖子失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.listen(config.port, () => {
  console.log(`Pulse API listening on http://localhost:${config.port}`);
});
