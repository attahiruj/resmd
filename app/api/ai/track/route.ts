import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getProviderForModel } from '@/lib/ai-providers';

export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Only track for authenticated non-guest users
  if (!user || user.is_anonymous) {
    return NextResponse.json({ ok: true });
  }

  try {
    const { action, count = 1, model } = await req.json();

    if (!action || !['accepted', 'rejected'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    let providerName = 'unknown';
    try {
      providerName = getProviderForModel(model ?? '').name;
    } catch {}

    const { error } = await supabase.rpc('track_suggestion', {
      p_model: model || 'unknown',
      p_provider: providerName,
      p_action: action,
      p_count: count,
    });
    if (error) console.error('[AI Track]', error);

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[AI Track] Error:', err);
    return NextResponse.json({ ok: true }); // never surface tracking errors to client
  }
}
