const required = ['SUPABASE_URL', 'SUPABASE_ANON_KEY'] as const;

export interface ServerConfig {
  port: number;
  supabaseUrl?: string;
  supabaseAnonKey?: string;
  supabaseServiceRoleKey?: string;
  supabaseImageBucket?: string;
  clientOrigin?: string;
}

export function getConfig(): ServerConfig {
  return {
    port: Number(process.env.API_PORT ?? 3001),
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY,
    supabaseImageBucket: process.env.SUPABASE_IMAGE_BUCKET ?? 'post-images',
    clientOrigin: process.env.CLIENT_ORIGIN,
  };
}

export function hasSupabaseConfig(config = getConfig()): boolean {
  return required.every((key) => Boolean(config[key === 'SUPABASE_URL' ? 'supabaseUrl' : 'supabaseAnonKey']));
}
