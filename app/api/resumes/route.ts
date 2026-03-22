import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { createResume, getUserResumes } from '@/lib/resumeService';
import { LIMITS } from '@/lib/limits';
import { getAllTemplates } from '@/lib/templates';

// GET /api/resumes — list authenticated user's resumes
export async function GET() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resumes = await getUserResumes(user.id);
    return NextResponse.json({ data: resumes });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load resumes' },
      { status: 500 }
    );
  }
}

// POST /api/resumes — create a new resume
export async function POST(req: NextRequest) {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    // Check guest resume limit
    if (user.is_anonymous) {
      const existing = await getUserResumes(user.id);
      if (existing.length >= LIMITS.GUEST_VARIANTS) {
        return NextResponse.json(
          {
            error: 'Sign up to create more resumes',
            code: 'guest_limit_reached',
          },
          { status: 402 }
        );
      }
    }

    // Check resume limit for authenticated users
    if (!user.is_anonymous) {
      const existing = await getUserResumes(user.id);
      if (existing.length >= LIMITS.MAX_VARIANTS) {
        return NextResponse.json(
          { error: 'Resume limit reached', code: 'limit_reached' },
          { status: 402 }
        );
      }
    }

    // Ensure a profile row exists (anonymous users may not have one if the trigger missed them)
    if (user.is_anonymous) {
      await supabase
        .from('profiles')
        .upsert({ id: user.id }, { onConflict: 'id', ignoreDuplicates: true });
    }

    const body = await req.json();
    const {
      title = 'My Resume',
      rawContent = '',
      templateId = 'minimal',
    } = body;

    // Input validation
    if (typeof title !== 'string' || title.length > 100) {
      return NextResponse.json(
        { error: 'Title must be a string with max 100 characters' },
        { status: 400 }
      );
    }
    if (typeof rawContent !== 'string' || rawContent.length > 10000) {
      return NextResponse.json(
        { error: 'Content must be a string with max 10000 characters' },
        { status: 400 }
      );
    }
    const validTemplateIds = getAllTemplates().map((t) => t.id);
    if (!validTemplateIds.includes(templateId)) {
      return NextResponse.json(
        { error: 'Invalid template ID' },
        { status: 400 }
      );
    }

    const resume = await createResume(user.id, title, rawContent, templateId);
    return NextResponse.json({ data: resume });
  } catch (err) {
    console.error('[POST /api/resumes]', err);
    return NextResponse.json(
      { error: 'Failed to create resume' },
      { status: 500 }
    );
  }
}
