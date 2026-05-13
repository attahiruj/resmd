import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getLocalDb } from '@/lib/db/local/LocalDatabase';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('local_session')?.value;
    if (!token) return NextResponse.json(null);

    const db = getLocalDb();
    const now = new Date().toISOString();
    const result = await db.execute({
      sql: `SELECT u.id, u.email, u.is_anonymous
            FROM sessions s
            JOIN users u ON u.id = s.user_id
            WHERE s.token = ? AND s.expires_at > ?`,
      args: [token, now],
    });

    if (result.rows.length === 0) return NextResponse.json(null);
    const row = result.rows[0];
    return NextResponse.json({
      id: row.id,
      email: row.email,
      is_anonymous: Boolean(row.is_anonymous),
    });
  } catch (err) {
    console.error('[local/me]', err);
    return NextResponse.json(null);
  }
}
