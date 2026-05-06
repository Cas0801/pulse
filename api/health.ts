import { applyCors } from './_lib/http.js';

export default async function handler(req: any, res: any) {
  if (applyCors(req, res)) {
    return;
  }

  const hasSupabaseConfig = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

  res.status(200).json({
    ok: true,
    source: hasSupabaseConfig ? 'supabase' : 'mock',
    timestamp: new Date().toISOString(),
  });
}
