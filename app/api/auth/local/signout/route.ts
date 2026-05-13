import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getLocalDb } from '@/lib/db/local/LocalDatabase';

export async function POST() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('local_session')?.value;

    if (token) {
      const db = getLocalDb();
      await db.execute({
        sql: `DELETE FROM sessions WHERE token = ?`,
        args: [token],
      });
      cookieStore.delete('local_session');
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[local/signout]', err);
    return NextResponse.json({ ok: true });
  }
}
