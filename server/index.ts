import dotenv from 'dotenv';
import express from 'express';
import type { Request, Response } from 'express';
import { getConfig, hasSupabaseConfig } from '../api/_lib/config';
import { createComment, createPost, loadComments, loadFeed, loadNotifications, markNotificationsRead, setPostBookmark, setPostLike, setProfileFollow, uploadImageAsset } from '../api/_lib/supabase';

dotenv.config({ path: '.env.local' });
dotenv.config();

const app = express();
const config = getConfig();

app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', config.clientOrigin ?? '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization, apikey');
  res.header('Access-Control-Allow-Methods', 'GET,POST,DELETE,OPTIONS');

  if (req.method === 'OPTIONS') {
    res.sendStatus(204);
    return;
  }

  next();
});
app.use(express.json({ limit: '15mb' }));

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
    const mode = req.query.mode === 'following' ? 'following' : 'for-you';
    const feed = await loadFeed(accessToken, mode);
    res.json(feed);
  } catch (error) {
    res.status(500).json({
      message: '加载 feed 失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.post('/api/profiles/:profileId/follow', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const result = await setProfileFollow(req.params.profileId, true, accessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: '关注失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.delete('/api/profiles/:profileId/follow', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const result = await setProfileFollow(req.params.profileId, false, accessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: '取消关注失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.get('/api/notifications', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const payload = await loadNotifications(accessToken);
    res.json(payload);
  } catch (error) {
    res.status(500).json({
      message: '加载通知失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.post('/api/notifications/read-all', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const payload = await markNotificationsRead(accessToken);
    res.json(payload);
  } catch (error) {
    res.status(500).json({
      message: '更新通知状态失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.post('/api/posts', async (req: Request, res: Response) => {
  const { content, image, images, media, type, visibility, location, tags } = req.body ?? {};

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
      images: Array.isArray(images) ? images.filter((item) => typeof item === 'string' && item.trim()) : undefined,
      media: Array.isArray(media)
        ? media
            .filter((item) => item && typeof item.url === 'string')
            .map((item, index) => ({
              id: typeof item.id === 'string' ? item.id : undefined,
              url: item.url.trim(),
              storagePath: typeof item.storagePath === 'string' ? item.storagePath : undefined,
              width: typeof item.width === 'number' ? item.width : undefined,
              height: typeof item.height === 'number' ? item.height : undefined,
              sortOrder: typeof item.sortOrder === 'number' ? item.sortOrder : index,
              isCover: Boolean(item.isCover),
            }))
        : undefined,
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

app.post('/api/uploads/images', async (req: Request, res: Response) => {
  const { fileName, mimeType, dataUrl, width, height } = req.body ?? {};

  if (typeof fileName !== 'string' || typeof mimeType !== 'string' || typeof dataUrl !== 'string') {
    res.status(400).json({ message: '缺少图片上传参数' });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const asset = await uploadImageAsset(
      {
        fileName,
        mimeType,
        dataUrl,
        width: typeof width === 'number' ? width : undefined,
        height: typeof height === 'number' ? height : undefined,
      },
      accessToken,
    );
    res.status(201).json(asset);
  } catch (error) {
    res.status(500).json({
      message: '图片上传失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.post('/api/posts/:postId/like', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const result = await setPostLike(req.params.postId, true, accessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: '点赞失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.delete('/api/posts/:postId/like', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const result = await setPostLike(req.params.postId, false, accessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: '取消点赞失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.post('/api/posts/:postId/bookmark', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const result = await setPostBookmark(req.params.postId, true, accessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: '收藏失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.delete('/api/posts/:postId/bookmark', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const result = await setPostBookmark(req.params.postId, false, accessToken);
    res.json(result);
  } catch (error) {
    res.status(500).json({
      message: '取消收藏失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.get('/api/posts/:postId/comments', async (req: Request, res: Response) => {
  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const comments = await loadComments(req.params.postId, accessToken);
    res.json(comments);
  } catch (error) {
    res.status(500).json({
      message: '加载评论失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.post('/api/posts/:postId/comments', async (req: Request, res: Response) => {
  const content = typeof req.body?.content === 'string' ? req.body.content.trim() : '';

  if (content.length < 1) {
    res.status(400).json({ message: '评论内容不能为空' });
    return;
  }

  try {
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : undefined;
    const comment = await createComment(req.params.postId, content, accessToken);
    res.status(201).json(comment);
  } catch (error) {
    res.status(500).json({
      message: '发表评论失败',
      details: error instanceof Error ? error.message : 'unknown error',
    });
  }
});

app.listen(config.port, () => {
  console.log(`Pulse API listening on http://localhost:${config.port}`);
});
