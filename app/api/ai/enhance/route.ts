import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { checkRateLimit } from '@/lib/rateLimit';
import { getProviderForModel, createSSEStream } from '@/lib/ai-providers';

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  if (user.is_anonymous) {
    return NextResponse.json(
      { error: 'AI features require an account', code: 'guest_no_ai' },
      { status: 403 }
    );
  }

  // Rate limit: 10 requests per user per minute
  const { allowed, retryAfter } = checkRateLimit(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  // Fetch profile for usage tracking
  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_usage_this_month, ai_usage_reset_at')
    .eq('id', user.id)
    .single();

  try {
    const { selectedText, instruction, resumeContext, model } =
      await req.json();

    if (!selectedText) {
      return NextResponse.json(
        { error: 'Missing required field: selectedText' },
        { status: 400 }
      );
    }

    let provider;
    try {
      provider = getProviderForModel(model ?? '');
    } catch {
      return NextResponse.json(
        { error: 'AI service not configured' },
        { status: 503 }
      );
    }

    // Build the prompt for enhancement
    const effectiveInstruction =
      instruction?.trim() || 'Make this more impactful and professional.';
    const systemPrompt = `You are **resAI**, an expert resume coach. Your job is to rewrite the selected resume text based on the user's instruction — grounded in the resume's own context.

## Instruction
${effectiveInstruction}

## Selected text
\`\`\`
${selectedText}
\`\`\`

## Surrounding resume context
\`\`\`
${resumeContext?.trim() || '(not provided)'}
\`\`\`

## Rules
- Output ONLY the rewritten text — no explanation, no preamble, no sign-off.
- Preserve the original format: if it's a bullet list, return bullet lines; if prose, return prose.
- Keep voice consistent with the rest of the resume (use context above).
- Strengthen impact: prefer active verbs, concrete outcomes, and specifics already present in the text.
- Never invent facts, metrics, or credentials not in the selected text or context.
- If the instruction asks for a metric you can't infer, write the line without it rather than guessing.

## Output format
Wrap the result like this — nothing outside the tags:
<<<SUGGESTION>>>
rewritten text here
<<<END>>>`;

    const messages = [{ role: 'user' as const, content: systemPrompt }];

    console.log('[AI Enhance] →', {
      selectedTextLength: selectedText.length,
      resumeContextLength: resumeContext?.length || 0,
    });

    const modelUsed = model ?? provider.defaultModel;
    const response = await provider.chat({
      messages,
      model: modelUsed,
      maxTokens: 1024,
      stream: true,
    });

    if (!response.ok) {
      const err = await response.text();
      console.error(
        `[AI Enhance] ${provider.name} error:`,
        response.status,
        err
      );
      return NextResponse.json({ error: 'AI request failed' }, { status: 502 });
    }

    // Update AI usage count
    if (profile) {
      const now = new Date();
      const resetAt = new Date(profile.ai_usage_reset_at);
      let newUsage = profile.ai_usage_this_month;

      if (now >= resetAt) {
        // New month - reset counter and set new reset date
        newUsage = 1;
        const nextMonth = new Date(now);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        await supabase
          .from('profiles')
          .update({
            ai_usage_this_month: newUsage,
            ai_usage_reset_at: nextMonth.toISOString(),
          })
          .eq('id', user.id);
      } else {
        // Increment existing count
        await supabase
          .from('profiles')
          .update({ ai_usage_this_month: newUsage + 1 })
          .eq('id', user.id);
      }
    }

    // Track model usage — fire and forget, never block the response
    supabase
      .rpc('increment_model_use', {
        p_model: modelUsed,
        p_provider: provider.name,
      })
      .then()
      .catch((e: unknown) => console.error('[AI Stats]', e));

    const stream = createSSEStream(response.body!);

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    });
  } catch (err) {
    console.error('[AI Enhance] Error:', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
