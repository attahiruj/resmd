import mammoth from 'mammoth';

const SUPPORTED_EXTENSIONS = ['.pdf', '.docx', '.txt', '.md'];

export async function extractText(
  buffer: ArrayBuffer,
  filename: string
): Promise<string> {
  const ext = filename.toLowerCase().slice(filename.lastIndexOf('.'));

  if (!SUPPORTED_EXTENSIONS.includes(ext)) {
    throw new Error(`Unsupported file type: ${ext}`);
  }

  try {
    if (ext === '.docx') {
      const result = await mammoth.extractRawText({
        buffer: Buffer.from(buffer),
      });
      return result.value || '';
    }

    if (ext === '.pdf') {
      const pdfParse = (await import('pdf-parse')).default as (
        buffer: Buffer,
        options?: Record<string, unknown>
      ) => Promise<{ text: string }>;
      const data = await pdfParse(Buffer.from(buffer));
      return data.text || '';
    }

    return new TextDecoder('utf-8').decode(buffer);
  } catch (err) {
    console.error('Extraction failed:', err);
    throw new Error('Could not extract text from document');
  }
}
