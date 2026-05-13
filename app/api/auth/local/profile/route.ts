import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getLocalDb } from '@/lib/db/local/LocalDatabase';

export async function GET(req: NextRequest) {
  try {
    // Validate session
    const cookieStore = await cookies();
    const token = cookieStore.get('local_session')?.value;
    if (!token) return NextResponse.json(null, { status: 401 });

    const userId = new URL(req.url).searchParams.get('userId');
    if (!userId) return NextResponse.json(null, { status: 400 });

    const db = getLocalDb();
    const result = await db.execute({
      sql: `SELECT p.* FROM profiles p
            JOIN sessions s ON s.user_id = p.id
            WHERE p.id = ? AND s.token = ?`,
      args: [userId, token],
    });

    if (result.rows.length === 0) return NextResponse.json(null);
    const row = result.rows[0];
    return NextResponse.json({
      id: row.id,
      email: row.email,
      createdAt: row.created_at,
    });
  } catch (err) {
    console.error('[local/profile]', err);
    return NextResponse.json(null);
  }
}
