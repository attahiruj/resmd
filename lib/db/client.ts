'use client';

import type { IClientAuthProvider } from './interfaces';
import { SupabaseClientAuthProvider } from './supabase/SupabaseClientAuthProvider';
import { LocalClientAuthProvider } from './local/LocalClientAuthProvider';

export function getClientAuthProvider(): IClientAuthProvider {
  return process.env.NEXT_PUBLIC_DB_PROVIDER === 'local'
    ? new LocalClientAuthProvider()
    : new SupabaseClientAuthProvider();
}
