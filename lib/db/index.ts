// This barrel file intentionally omits server exports to avoid
// accidentally bundling next/headers into client components.
//
// Import explicitly:
//   Server components / API routes: import from '@/lib/db/server'
//   Client components:              import from '@/lib/db/client'

export type {
  IResumeRepository,
  IServerAuthProvider,
  IClientAuthProvider,
  AuthUser,
  AuthResult,
  AiModelStat,
  Unsubscribe,
} from './interfaces';
