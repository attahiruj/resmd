import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { cloneResume, getUserResumes } from '@/lib/resumeService';
import { LIMITS } from '@/lib/limits';

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

  try {
    const existing = await getUserResumes(user.id);
    if (existing.length >= LIMITS.MAX_VARIANTS) {
      return NextResponse.json(
        { error: 'Resume limit reached', code: 'limit_reached' },
        { status: 402 }
      );
    }

    const body = await req.json();
    const { title } = body;
    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const resume = await cloneResume(id, title.trim(), user.id);
    return NextResponse.json({ data: resume });
  } catch {
    return NextResponse.json(
      { error: 'Failed to clone resume' },
      { status: 500 }
    );
  }
}
