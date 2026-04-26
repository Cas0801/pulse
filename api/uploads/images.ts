import { uploadImageAsset } from '../_lib/supabase.js';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method Not Allowed' });
    return;
  }

  const { fileName, mimeType, dataUrl, width, height } = req.body ?? {};

  if (typeof fileName !== 'string' || typeof mimeType !== 'string' || typeof dataUrl !== 'string') {
    res.status(400).json({ message: '缺少图片上传参数' });
    return;
  }

  try {
    const authHeader = req.headers?.authorization;
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
}
