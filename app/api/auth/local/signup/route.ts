import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { getLocalDb } from '@/lib/db/local/LocalDatabase';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      );
    }

    const db = getLocalDb();

    const existing = await db.execute({
      sql: `SELECT id FROM users WHERE email = ?`,
      args: [email],
    });
    if (existing.rows.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 12);
    const userId = randomUUID();
    const now = new Date().toISOString();

    await db.execute({
      sql: `INSERT INTO users (id, email, password_hash, created_at) VALUES (?, ?, ?, ?)`,
      args: [userId, email, passwordHash, now],
    });
    await db.execute({
      sql: `INSERT INTO profiles (id, email, created_at) VALUES (?, ?, ?)`,
      args: [userId, email, now],
    });

    const token = randomUUID();
    const expiresAt = new Date(
      Date.now() + 30 * 24 * 60 * 60 * 1000
    ).toISOString();
    await db.execute({
      sql: `INSERT INTO sessions (id, user_id, token, expires_at) VALUES (?, ?, ?, ?)`,
      args: [randomUUID(), userId, token, expiresAt],
    });

    const cookieStore = await cookies();
    cookieStore.set('local_session', token, {
      httpOnly: true,
      path: '/',
      maxAge: 30 * 24 * 60 * 60,
      sameSite: 'lax',
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[local/signup]', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
