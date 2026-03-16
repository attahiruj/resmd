import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await req.json();
    const { rating, message } = body as { rating: number; message?: string };

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid rating' }, { status: 400 });
    }

    await supabase.from('feedback').insert({
      user_id: user?.id ?? null,
      rating,
      message: message ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch {
    // Non-critical — always return success to the client
    return NextResponse.json({ ok: true });
  }
}
