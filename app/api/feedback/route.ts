import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthProvider, getDbProvider } from '@/lib/db/server';

export async function POST(req: NextRequest) {
  try {
    const user = await getServerAuthProvider().getUser();

    const body = await req.json();
    const { rating, message } = body as { rating: number; message?: string };

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    await getDbProvider().insertFeedback(
      user?.id ?? null,
      rating,
      message ?? null
    );

    return NextResponse.json({ ok: true });
  } catch {
    // Non-critical — always return success to the client
    return NextResponse.json({ ok: true });
  }
}
