import { NextRequest, NextResponse } from 'next/server';
import { getDbProvider } from '@/lib/db/server';
import { getAuthUser } from '@/lib/getAuthUser';
import { checkRateLimit } from '@/lib/rateLimit';
import { buildSystemPrompt, AI_MAX_TOKENS } from '@/lib/prompts';
import { getProviderForModel } from '@/lib/ai-providers';
import { debug } from '@/lib/env';

export async function POST(req: NextRequest) {
  // Auth check
  const user = await getAuthUser(req);
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (user.is_anonymous)
    return NextResponse.json(
      { error: 'AI features require an account', code: 'guest_no_ai' },
      { status: 403 }
    );

  // Rate limit: 10 requests per user per minute
  const { allowed, retryAfter } = checkRateLimit(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const { message, resumeContent, history, model } = await req.json();

    let provider;
    try {
      provider = getProviderForModel(model ?? '');
    } catch {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    if (!resumeContent || !resumeContent.trim()) {
      return NextResponse.json({
        reply:
          "Your resume is empty — add some content first and I'll get to work on it.",
      });
    }

    // Gemma doesn't support the 'system' role — inject context as a user/assistant
    // preamble so the model understands its role before the real conversation.
    const messages = [
      {
        role: 'user' as const,
        content: buildSystemPrompt(resumeContent ?? ''),
      },
      {
        role: 'assistant' as const,
        content:
          "Got it — I've read through your resume. What are we working on?",
      },
      ...(history ?? []).map(
        ({ role, content }: { role: string; content: string }) => ({
          role: role as 'user' | 'assistant' | 'system',
          content,
        })
      ),
      { role: 'user' as const, content: message },
    ];

    const modelUsed = model ?? provider.defaultModel;
    debug('AI Chat', { model: modelUsed, messageLength: message.length });
    const response = await provider.chat({
      messages,
      model: modelUsed,
      maxTokens: AI_MAX_TOKENS,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(`[AI] ${provider.name} error:`, response.status, err);
      return NextResponse.json({ error: 'AI request failed' }, { status: 502 });
    }

    const data = await response.json();
    const reply: string = data.choices?.[0]?.message?.content ?? '';

    // Track model usage — fire and forget, never block the response
    getDbProvider().incrementModelUse(modelUsed, provider.name);

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('AI chat error:', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
