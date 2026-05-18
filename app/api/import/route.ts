import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/getAuthUser';
import { extractText } from '@/lib/import/extractor';
import { mapToResMarkup } from '@/lib/import/mapper';
import { getProviderForModel } from '@/lib/ai-providers';
import { buildImportPrompt } from '@/lib/prompts';
import { debug } from '@/lib/env';

const MAX_FILE_SIZE = 5 * 1024 * 1024;

const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'];

const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
  'text/markdown',
];

function getExtension(filename: string): string {
  const parts = filename.split('.');
  return parts.length > 1 ? '.' + parts[parts.length - 1].toLowerCase() : '';
}

export async function POST(req: NextRequest) {
  try {
    const user = await getAuthUser(req);
    if (!user)
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    const extension = getExtension(file.name);
    if (!ALLOWED_EXTENSIONS.includes(extension)) {
      return NextResponse.json(
        { error: 'File type not supported. Allowed: .pdf, .docx, .txt, .md' },
        { status: 400 }
      );
    }

    const mimeType = file.type;
    if (!ALLOWED_MIME_TYPES.includes(mimeType)) {
      return NextResponse.json(
        { error: 'MIME type not supported' },
        { status: 400 }
      );
    }

    const buffer = await file.arrayBuffer();
    const rawContent = await extractText(buffer, file.name);

    if (!rawContent || rawContent.trim().length === 0) {
      return NextResponse.json(
        {
          error:
            'Document appears to be empty or scanned. Please use a text-based PDF or convert first.',
        },
        { status: 400 }
      );
    }

    let finalContent: string;
    let detectedFields = {};

    try {
      const provider = getProviderForModel('');
      debug(`Import: using AI provider ${provider.name} for conversion`);
      const prompt = buildImportPrompt(rawContent);
      const response = await provider.chat({
        messages: [{ role: 'user' as const, content: prompt }],
        model: provider.defaultModel,
        temperature: 0.1,
        maxTokens: 2048,
      });
      if (response.ok) {
        const data = await response.json();
        const aiOutput: string = data.choices?.[0]?.message?.content ?? '';
        // Strip any accidental code fences the model may have added
        finalContent = aiOutput
          .replace(/^```[\w]*\n?/gm, '')
          .replace(/^```$/gm, '')
          .trim();
      } else {
        const errBody = await response.text().catch(() => '(unreadable)');
        console.error(
          `[import] AI response ${response.status}, falling back. Body: ${errBody}`
        );
        const mapped = mapToResMarkup(rawContent);
        finalContent = mapped.rawContent;
        detectedFields = mapped.detectedFields;
      }
    } catch (aiErr) {
      console.error(
        '[import] AI threw, falling back to heuristic mapper:',
        aiErr
      );
      const mapped = mapToResMarkup(rawContent);
      finalContent = mapped.rawContent;
      detectedFields = mapped.detectedFields;
    }

    return NextResponse.json({
      rawContent: finalContent,
      detectedFields,
    });
  } catch (err) {
    console.error('Import error:', err);
    const message =
      err instanceof Error ? err.message : 'Failed to import file';
    if (
      message.includes('Unsupported file type') ||
      message.includes('parser')
    ) {
      return NextResponse.json(
        { error: 'Could not extract text from this file format' },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
