/**
 * Server-side environment variable validation.
 * Import this only from server-side files (API routes, server components, lib/).
 * Throws at module load time if any required var is missing — fails fast on
 * misconfigured deployments instead of at request time.
 */
function requireEnv(key: string): string {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required environment variable: ${key}`);
  return val;
}

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  OPENROUTER_API_KEY: requireEnv('OPENROUTER_API_KEY'),
} as const;
