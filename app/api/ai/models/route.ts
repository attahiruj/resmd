import { NextResponse } from 'next/server';
import { getServerAuthProvider, getDbProvider } from '@/lib/db/server';
import { getActiveProviders, listUserProviderModels } from '@/lib/ai-providers';
import type { AIModel } from '@/lib/ai-providers';
import { debug } from '@/lib/env';

export const dynamic = 'force-dynamic';

export type { AIModel };

export async function GET() {
  const user = await getServerAuthProvider().getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Server provider models
    const providers = getActiveProviders();
    debug('AI Models', { providerCount: providers.length });
    const serverResults = await Promise.allSettled(
      providers.map((p) =>
        p.listModels
          ? p.listModels()
          : Promise.resolve([
              {
                id: p.defaultModel,
                name: p.defaultModel,
                provider: p.name,
                providerId: 'server',
              },
            ])
      )
    );
    const serverModels: AIModel[] = serverResults
      .flatMap((r) => (r.status === 'fulfilled' ? r.value : []))
      .map((m) => ({ ...m, providerId: 'server' }));

    // BYOK models
    const userModels: AIModel[] = user.is_anonymous
      ? []
      : await listUserProviderModels(user.id).catch(() => []);

    const allModels = [...serverModels, ...userModels];

    if (allModels.length === 0) {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    // Enrich with global usage counts (best-effort)
    const stats = await getDbProvider().getAiModelStats(
      allModels.map((m) => m.id)
    );
    const countMap: Record<string, number> = Object.fromEntries(
      stats.map((s) => [s.model_id, s.use_count])
    );

    const enriched = allModels.map((m) => ({
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
