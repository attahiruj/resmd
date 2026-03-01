import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { checkRateLimit } from '@/lib/rateLimit'
import { LIMITS } from '@/lib/limits'

const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions'

export async function POST(req: NextRequest) {
  // Auth check
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  // Rate limit: 10 requests per user per minute
  const { allowed, retryAfter } = checkRateLimit(user.id)
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    )
  }

  // Check AI usage limit
  const { data: profile } = await supabase
    .from('profiles')
    .select('ai_usage_this_month, ai_usage_reset_at')
    .eq('id', user.id)
    .single()

  if (profile) {
    // Check if we need to reset the monthly counter
    const now = new Date()
    const resetAt = new Date(profile.ai_usage_reset_at)
    let currentUsage = profile.ai_usage_this_month

    if (now >= resetAt) {
      // Reset for new month
      currentUsage = 0
    }

    if (currentUsage >= LIMITS.FREE_AI_PER_MONTH) {
      return NextResponse.json(
        { error: 'AI usage limit reached', code: 'ai_limit_exceeded' },
        { status: 402 }
      )
    }
  }

  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'AI service not configured' }, { status: 503 })
  }

  try {
    const { selectedText, instruction, resumeContext } = await req.json()

    if (!selectedText || !instruction) {
      return NextResponse.json(
        { error: 'Missing required fields: selectedText and instruction' },
        { status: 400 }
      )
    }

    // Build the prompt for enhancement
    const systemPrompt = `You are an expert resume coach helping improve resume text.

The user's selected text is part of their resume. They want you to: "${instruction}"

## Guidelines
- Only output the improved text - no explanations needed
- Keep the same formatting style (bullets, sections, etc.)
- Make the text more impactful, concise, and professional
- If the instruction is unclear, make reasonable improvements

## Selected text to improve:
"""
${selectedText}
"""

## Surrounding resume context:
"""
${resumeContext || '(no additional context)'}
"""

## Output format
Return ONLY the improved text. If you want to suggest multiple alternatives, use this format:
<<<SUGGESTION>>>
improved text here
<<<END>>>

Do not include any preamble or explanation.`

    const messages = [
      { role: 'user', content: systemPrompt },
    ]

    console.log('[AI Enhance] →', {
      instruction,
      selectedTextLength: selectedText.length,
      resumeContextLength: resumeContext?.length || 0,
    })

    const response = await fetch(OPENROUTER_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
        'X-Title': 'ResMarkup AI Enhancement',
      },
      body: JSON.stringify({
        model: process.env.OPENROUTER_MODEL ?? 'google/gemma-3n-e4b-it:free',
        max_tokens: 1024,
        messages,
        stream: true,
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      console.error('[AI Enhance] OpenRouter error:', response.status, err)
      return NextResponse.json({ error: 'AI request failed' }, { status: 502 })
    }

    // Update AI usage count
    if (profile) {
      const now = new Date()
      const resetAt = new Date(profile.ai_usage_reset_at)
      let newUsage = profile.ai_usage_this_month

      if (now >= resetAt) {
        // New month - reset counter and set new reset date
        newUsage = 1
        const nextMonth = new Date(now)
        nextMonth.setMonth(nextMonth.getMonth() + 1)
        await supabase
          .from('profiles')
          .update({
            ai_usage_this_month: newUsage,
            ai_usage_reset_at: nextMonth.toISOString(),
          })
          .eq('id', user.id)
      } else {
        // Increment existing count
        await supabase
          .from('profiles')
          .update({ ai_usage_this_month: newUsage + 1 })
          .eq('id', user.id)
      }
    }

    // Parse SSE from OpenRouter and stream plain text chunks to client
    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        const encoder = new TextEncoder()
        let buffer = ''

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() ?? ''

            for (const line of lines) {
              if (!line.startsWith('data: ')) continue
              const data = line.slice(6).trim()
              if (data === '[DONE]') continue
              try {
                const parsed = JSON.parse(data)
                const text: string = parsed.choices?.[0]?.delta?.content ?? ''
                if (text) controller.enqueue(encoder.encode(text))
              } catch {
                // skip malformed SSE lines
              }
            }
          }
        } catch (err) {
          console.error('[AI Enhance] Stream error:', err)
        } finally {
          controller.close()
        }
      },
    })

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Transfer-Encoding': 'chunked',
      },
    })
  } catch (err) {
    console.error('[AI Enhance] Error:', err)
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 })
  }
}
