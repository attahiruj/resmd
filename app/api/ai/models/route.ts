import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getActiveProviders } from '@/lib/ai-providers';
import type { AIModel } from '@/lib/ai-providers';

export const dynamic = 'force-dynamic';

export type { AIModel };

export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const providers = getActiveProviders();
  if (providers.length === 0)
    return NextResponse.json(
      { error: 'AI service not configured' },
      { status: 503 }
    );

  try {
    // Aggregate models from all active providers
    const perProvider = await Promise.all(
      providers.map((p) =>
        p.listModels
          ? p.listModels()
          : Promise.resolve([
              { id: p.defaultModel, name: p.defaultModel, provider: p.name },
            ])
      )
    );
    const models: AIModel[] = perProvider.flat();

    // Enrich with global usage counts (best-effort — failures don't block model list)
    const { data: stats } = await supabase
      .from('ai_model_stats')
      .select('model_id, use_count')
      .in(
        'model_id',
        models.map((m) => m.id)
      );

    const countMap: Record<string, number> = Object.fromEntries(
      (stats ?? []).map((s) => [s.model_id, s.use_count])
    );

    const enriched = models.map((m) => ({
      ...m,
      use_count: countMap[m.id] ?? 0,
    }));

    return NextResponse.json({ models: enriched });
  } catch (err) {
    console.error('[AI Models] error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 502 }
    );
  }
}
