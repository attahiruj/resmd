import type { IResumeRepository, IServerAuthProvider } from './interfaces';
import { SupabaseResumeRepository } from './supabase/SupabaseResumeRepository';
import { SupabaseServerAuthProvider } from './supabase/SupabaseServerAuthProvider';
import { LocalResumeRepository } from './local/LocalResumeRepository';
import { LocalServerAuthProvider } from './local/LocalServerAuthProvider';

const DB_PROVIDER = process.env.DB_PROVIDER ?? 'supabase';

let _dbProvider: IResumeRepository | null = null;
let _serverAuthProvider: IServerAuthProvider | null = null;

export function getDbProvider(): IResumeRepository {
  if (!_dbProvider) {
    _dbProvider =
      DB_PROVIDER === 'local'
        ? new LocalResumeRepository()
        : new SupabaseResumeRepository();
  }
  return _dbProvider;
}

export function getServerAuthProvider(): IServerAuthProvider {
  if (!_serverAuthProvider) {
    _serverAuthProvider =
      DB_PROVIDER === 'local'
        ? new LocalServerAuthProvider()
        : new SupabaseServerAuthProvider();
  }
  return _serverAuthProvider;
}
