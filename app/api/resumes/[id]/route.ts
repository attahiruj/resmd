import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import {
  getResume,
  updateResumeContent,
  deleteResume,
} from '@/lib/resumeService';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/resumes/[id] — fetch single resume
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resume = await getResume(id);
    if (!resume || resume.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json({ data: resume });
  } catch {
    return NextResponse.json(
      { error: 'Failed to load resume' },
      { status: 500 }
    );
  }
}

// PATCH /api/resumes/[id] — autosave update
export async function PATCH(req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resume = await getResume(id);
    if (!resume || resume.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { rawContent, templateId, title } = await req.json();
    await updateResumeContent(id, rawContent, templateId, title);
    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json(
      { error: 'Failed to update resume' },
      { status: 500 }
    );
  }
}

// DELETE /api/resumes/[id] — delete a resume
export async function DELETE(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const resume = await getResume(id);
    if (!resume || resume.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    await deleteResume(id);
    return NextResponse.json({ data: { success: true } });
  } catch {
    return NextResponse.json(
      { error: 'Failed to delete resume' },
      { status: 500 }
    );
  }
}
