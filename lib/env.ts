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

function optionalEnv(key: string): string {
  return process.env[key] ?? '';
}

const isLocalMode = process.env.DB_PROVIDER === 'local';

export const env = {
  NEXT_PUBLIC_SUPABASE_URL: isLocalMode
    ? optionalEnv('NEXT_PUBLIC_SUPABASE_URL')
    : requireEnv('NEXT_PUBLIC_SUPABASE_URL'),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: isLocalMode
    ? optionalEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY')
    : requireEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY'),
  DEBUG_MODE: process.env.DEBUG_MODE === 'true',
  // AI provider keys are validated per-request in lib/ai-providers/index.ts
  // to allow graceful 503 responses rather than crashing at startup.
} as const;

export function debug(...args: Parameters<typeof console.log>) {
  if (env.DEBUG_MODE) {
    console.log('[DEBUG]', ...args);
  }
}
