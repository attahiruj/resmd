import { NextRequest, NextResponse } from 'next/server';
import { getDbProvider } from '@/lib/db/server';
import { getAuthUser } from '@/lib/getAuthUser';
import { checkRateLimit } from '@/lib/rateLimit';
import {
  getProviderForModel,
  createSSEStream,
  createSuggestionFilter,
} from '@/lib/ai-providers';
import { debug, env } from '@/lib/env';

export async function POST(req: NextRequest) {
  // Auth check
  const user = await getAuthUser(req);
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
  const profile = await getDbProvider().getAiProfileUsage(user.id);

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
    const modelUsed = model ?? provider.defaultModel;

    debug('AI Enhance >>>', {
      model: modelUsed,
      instruction: effectiveInstruction,
      selectedTextLength: selectedText.length,
      resumeContextLength: resumeContext?.length || 0,
      prompt: systemPrompt,
    });

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
        await getDbProvider().updateAiProfileUsage(
          user.id,
          newUsage,
          nextMonth.toISOString()
        );
      } else {
        // Increment existing count
        await getDbProvider().updateAiProfileUsage(user.id, newUsage + 1);
      }
    }

    // Track model usage — fire and forget, never block the response
    getDbProvider().incrementModelUse(modelUsed, provider.name);

    let fullResponse = '';
    const handleChunk = (text: string): string | null => {
      fullResponse += text;
      return createSuggestionFilter()(text);
    };

    const stream = createSSEStream(response.body!, {
      onChunk: handleChunk,
    });

    return new Response(
      new ReadableStream({
        start(controller) {
          const reader = stream.getReader();
          const decoder = new TextDecoder();

          (async () => {
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                controller.enqueue(value);
              }
            } finally {
              if (env.DEBUG_MODE) {
                debug('AI Enhance <<<', { response: fullResponse });
              }
              controller.close();
            }
          })();
        },
      }),
      {
        headers: {
          'Content-Type': 'text/plain; charset=utf-8',
          'Transfer-Encoding': 'chunked',
        },
      }
    );
  } catch (err) {
    console.error('[AI Enhance] Error:', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
