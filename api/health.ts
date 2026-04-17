export default async function handler(_req: any, res: any) {
  const hasSupabaseConfig = Boolean(process.env.SUPABASE_URL && process.env.SUPABASE_ANON_KEY);

  res.status(200).json({
    ok: true,
    source: hasSupabaseConfig ? 'supabase' : 'mock',
    timestamp: new Date().toISOString(),
  });
}
