import { NextRequest, NextResponse } from 'next/server';
import { renderToBuffer, type DocumentProps } from '@react-pdf/renderer';
import React from 'react';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getResume } from '@/lib/resumeService';
import { parseResume } from '@/lib/parser';
import { getTemplate, getPdfComponent } from '@/lib/templates';

export async function POST(req: NextRequest) {
  try {
    const supabase = createSupabaseServerClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { resumeId } = body as { resumeId: string };

    if (!resumeId) {
      return NextResponse.json(
        { error: 'resumeId is required' },
        { status: 400 }
      );
    }

    const resume = await getResume(resumeId);
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }
    if (resume.userId !== user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const parsed = parseResume(resume.rawContent);
    const template = getTemplate(resume.templateId);
    if (!template) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const PdfComponent = await getPdfComponent(resume.templateId);
    const doc = React.createElement(PdfComponent, { resume: parsed });
    const buffer = await renderToBuffer(
      doc as React.ReactElement<DocumentProps>
    );
    const uint8 = new Uint8Array(buffer);

    const safeTitle =
      resume.title.replace(/[^a-z0-9\-_ ]/gi, '').trim() || 'resume';

    return new NextResponse(uint8, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${safeTitle}.pdf"`,
      },
    });
  } catch (err) {
    console.error('PDF export error:', err);
    return NextResponse.json(
      { error: 'Failed to generate PDF' },
      { status: 500 }
    );
  }
}
