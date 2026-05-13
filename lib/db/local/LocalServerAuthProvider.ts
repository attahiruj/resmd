import { cookies } from 'next/headers';
import { getLocalDb } from './LocalDatabase';
import type { IServerAuthProvider, AuthUser } from '@/lib/db/interfaces';

export class LocalServerAuthProvider implements IServerAuthProvider {
  async getUser(): Promise<AuthUser | null> {
    const cookieStore = await cookies();
    const token = cookieStore.get('local_session')?.value;
    if (!token) return null;

    const db = getLocalDb();
    const now = new Date().toISOString();
    const result = await db.execute({
      sql: `SELECT u.id, u.email, u.is_anonymous
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token = ? AND s.expires_at > ?`,
      args: [token, now],
    });

    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      id: row.id as string,
      email: row.email as string,
      is_anonymous: Boolean(row.is_anonymous),
    };
  }
}
