import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { checkRateLimit } from '@/lib/rateLimit';
import { buildSystemPrompt, AI_MODEL, AI_MAX_TOKENS } from '@/lib/prompts';

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Rate limit: 10 requests per user per minute
  const { allowed, retryAfter } = checkRateLimit(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: 'AI service not configured' },
      { status: 503 }
    );
  }

  try {
    const { message, resumeContent, history } = await req.json();

    if (!resumeContent || !resumeContent.trim()) {
      return NextResponse.json({
        reply:
          'Your resume editor is empty. Please add some content to your resume first, then I can help you improve it.',
      });
    }

    // Gemma doesn't support the 'system' role — inject context as a user/assistant
    // preamble so the model understands its role before the real conversation.
    const messages = [
      { role: 'user', content: buildSystemPrompt(resumeContent ?? '') },
      {
        role: 'assistant',
        content:
          "Understood. I'm ready to help improve your resume. What would you like to work on?",
      },
      ...(history ?? []).map(
        ({ role, content }: { role: string; content: string }) => ({
          role,
          content,
        })
      ),
      { role: 'user', content: message },
    ];

    console.log('[AI] →', {
      model: AI_MODEL,
      historyLength: (history ?? []).length,
      resumeContentLength: resumeContent.length,
      userMessage: message,
    });

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer':
          process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'ResMarkup AI Assistant',
      },
      body: JSON.stringify({
        model: AI_MODEL,
        max_tokens: AI_MAX_TOKENS,
        messages,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error('[AI] OpenRouter error:', response.status, err);
      return NextResponse.json({ error: 'AI request failed' }, { status: 502 });
    }

    const data = await response.json();
    const reply: string = data.choices?.[0]?.message?.content ?? '';

    console.log('[AI] ←', {
      status: response.status,
      model: data.model,
      usage: data.usage,
      reply,
    });

    return NextResponse.json({ reply });
  } catch (err) {
    console.error('AI chat error:', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
