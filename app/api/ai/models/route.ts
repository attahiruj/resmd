import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

const OPENROUTER_MODELS_URL = 'https://openrouter.ai/api/v1/models';

export interface OpenRouterModel {
  id: string;
  name: string;
}

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey)
    return NextResponse.json(
      { error: 'AI service not configured' },
      { status: 503 }
    );

  try {
    const res = await fetch(OPENROUTER_MODELS_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 3600 },
    });

    if (!res.ok) {
      console.error('[AI Models] OpenRouter error:', res.status);
      return NextResponse.json(
        { error: 'Failed to fetch models' },
        { status: 502 }
      );
    }

    const data = await res.json();
    const freeModels: OpenRouterModel[] = (
      data.data as Array<{ id: string; name: string }>
    )
      .filter((m) => m.id.endsWith(':free'))
      .map((m) => ({ id: m.id, name: m.name }))
      .sort((a, b) => a.name.localeCompare(b.name));

    return NextResponse.json({ models: freeModels });
  } catch (err) {
    console.error('[AI Models] Error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
