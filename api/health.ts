import { hasSupabaseConfig } from './_lib/config.ts';

export default async function handler(_req: any, res: any) {
  res.status(200).json({
    ok: true,
    source: hasSupabaseConfig() ? 'supabase' : 'mock',
    timestamp: new Date().toISOString(),
  });
}
