import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import {
  cloneResume,
  getUserResumes,
  updateResumeContent,
} from '@/lib/resumeService';
import { LIMITS } from '@/lib/limits';
import { checkRateLimit } from '@/lib/rateLimit';
import { getProviderForModel } from '@/lib/ai-providers';
import { buildTailoringPrompt, parseSuggestion } from '@/lib/prompts';

// POST /api/resumes/[id]/clone — clone an existing resume
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Rate limit: 30 requests per user per minute
  const { allowed, retryAfter } = checkRateLimit(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const existing = await getUserResumes(user.id);
    if (existing.length >= LIMITS.MAX_VARIANTS) {
      return NextResponse.json(
        { error: 'Resume limit reached', code: 'limit_reached' },
        { status: 402 }
      );
    }

    const body = await req.json();
    const { title, targetRoleDescription } = body;
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const resume = await cloneResume(id, title.trim(), user.id);
    console.log(
      `[Clone] Created resume "${resume.title}" (${resume.id}) from ${id}`
    );

    // If target role description is provided, tailor the resume
    if (targetRoleDescription?.trim()) {
      console.log(
        `[Clone/Tailor] Starting AI tailoring for resume ${resume.id}`
      );
      try {
        const provider = getProviderForModel('');
        console.log(
          `[Clone/Tailor] Using provider: ${provider.name}, model: ${provider.defaultModel}`
        );

        const prompt = buildTailoringPrompt(
          resume.rawContent,
          targetRoleDescription.trim()
        );
        const response = await provider.chat({
          messages: [{ role: 'user' as const, content: prompt }],
          model: provider.defaultModel,
        });

        if (response.ok) {
          const data = await response.json();
          const aiReply: string = data.choices?.[0]?.message?.content ?? '';
          const parsed = parseSuggestion(aiReply);

          if (parsed.fullResume) {
            await updateResumeContent(
              resume.id,
              parsed.fullResume,
              resume.templateId
            );
            resume.rawContent = parsed.fullResume;
            console.log(
              `[Clone/Tailor] Resume ${resume.id} tailored successfully (${parsed.fullResume.length} chars)`
            );
          } else {
            console.warn(
              `[Clone/Tailor] AI responded but returned no full resume block for ${resume.id}`
            );
          }
        } else {
          const err = await response.text();
          console.error(
            `[Clone/Tailor] Provider error ${response.status}:`,
            err
          );
        }
      } catch (aiError) {
        // Graceful degradation: if AI fails, return the cloned resume without tailoring
        console.error('[Clone/Tailor] AI tailoring failed:', aiError);
      }
    }

    return NextResponse.json({ data: resume });
  } catch {
    return NextResponse.json(
      { error: 'Failed to clone resume' },
      { status: 500 }
    );
  }
}
