import { NextRequest, NextResponse } from 'next/server';
import { getServerAuthProvider, getDbProvider } from '@/lib/db/server';
import { getProviderForModel } from '@/lib/ai-providers';

export async function POST(req: NextRequest) {
  const user = await getServerAuthProvider().getUser();

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

    await getDbProvider().trackSuggestion(
      model || 'unknown',
      providerName,
      action,
      count
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error('[AI Track] Error:', err);
    return NextResponse.json({ ok: true }); // never surface tracking errors to client
  }
}
