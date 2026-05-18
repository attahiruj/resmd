import { createHash } from 'crypto';
import type { NextRequest } from 'next/server';
import { getServerAuthProvider, getDbProvider } from '@/lib/db/server';
import type { AuthUser } from '@/lib/db/interfaces';
import { debug } from '@/lib/env';

export async function getAuthUser(req: NextRequest): Promise<AuthUser | null> {
  const authHeader = req.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    const token = authHeader.slice(7);
    const keyHash = createHash('sha256').update(token).digest('hex');
    debug('[auth] MCP key lookup, hash prefix:', keyHash.slice(0, 8));
    try {
      const key = await getDbProvider().getMcpKeyByHash(keyHash);
      if (key) {
        debug('[auth] MCP key matched, userId:', key.userId);
        // Fire-and-forget last used update
        getDbProvider().updateMcpKeyLastUsed(key.id);
        return { id: key.userId, is_anonymous: false };
      }
      debug('[auth] MCP key not found in DB');
    } catch (err) {
      console.error('[auth] MCP key lookup failed:', err);
    }
    return null;
  }
  const user = await getServerAuthProvider().getUser();
  debug(
    '[auth] Session auth result:',
    user ? `userId=${user.id}` : 'unauthenticated'
  );
  return user;
}
