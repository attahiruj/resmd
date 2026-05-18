import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/getAuthUser';
import {
  getResume,
  updateResumeContent,
  deleteResume,
} from '@/lib/resumeService';
import { getAllTemplates } from '@/lib/templates';
import { checkRateLimit } from '@/lib/rateLimit';

interface Params {
  params: Promise<{ id: string }>;
}

// GET /api/resumes/[id] — fetch single resume
export async function GET(_req: NextRequest, { params }: Params) {
  const { id } = await params;
  const user = await getAuthUser(_req);
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
  const user = await getAuthUser(req);
  if (!user)
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  // Rate limit: 60 requests per user per minute (autosave can be frequent)
  const { allowed, retryAfter } = checkRateLimit(user.id);
  if (!allowed) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429, headers: { 'Retry-After': String(retryAfter) } }
    );
  }

  try {
    const resume = await getResume(id);
    if (!resume || resume.userId !== user.id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const { rawContent, templateId, title } = await req.json();

    // Input validation
    if (
      title !== undefined &&
      (typeof title !== 'string' || title.length > 100)
    ) {
      return NextResponse.json(
        { error: 'Title must be a string with max 100 characters' },
        { status: 400 }
      );
    }
    if (
      rawContent !== undefined &&
      (typeof rawContent !== 'string' || rawContent.length > 50000)
    ) {
      return NextResponse.json(
        { error: 'Content must be a string with max 50,000 characters' },
        { status: 400 }
      );
    }
    if (templateId !== undefined) {
      const validTemplateIds = getAllTemplates().map((t) => t.id);
      if (!validTemplateIds.includes(templateId)) {
        return NextResponse.json(
          { error: 'Invalid template ID' },
          { status: 400 }
        );
      }
    }

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
  const user = await getAuthUser(_req);
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
