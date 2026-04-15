const SUGGESTION_TAG = '<<<SUGGESTION>>>';

/**
 * Parses an OpenAI-compatible SSE stream and yields plain text chunks.
 * Works for any provider using the standard choices[0].delta.content format.
 *
 * @param body - The streaming response body from the AI provider
 * @param options.onChunk - Optional callback: receives each text chunk before output.
 *   Return the filtered text to output, or null to skip the chunk.
 */
export function createSSEStream(
  body: ReadableStream<Uint8Array>,
  options?: {
    onChunk?: (text: string) => string | null;
  }
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
      const onChunk = options?.onChunk;
      let buffer = '';

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n');
          buffer = lines.pop() ?? '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const data = line.slice(6).trim();
            if (data === '[DONE]') continue;
            try {
              const parsed = JSON.parse(data);
              const text: string = parsed.choices?.[0]?.delta?.content ?? '';
              if (text) {
                const filtered = onChunk ? onChunk(text) : text;
                if (filtered !== null) {
                  controller.enqueue(encoder.encode(filtered));
                }
              }
            } catch {
              // skip malformed SSE lines
            }
          }
        }
      } catch (err) {
        console.error('[AI] Stream error:', err);
      } finally {
        controller.close();
      }
    },
  });
}

/**
 * Creates a filter that strips content before the first <<<SUGGESTION>>> tag.
 * Useful for providers (like MiniMax) that output reasoning before the suggestion block.
 */
export function createSuggestionFilter() {
  let seenTag = false;
  let pendingBefore = '';

  return (text: string): string | null => {
    if (seenTag) {
      return text;
    }

    pendingBefore += text;
    const tagIndex = pendingBefore.indexOf(SUGGESTION_TAG);

    if (tagIndex === -1) {
      return null;
    }

    seenTag = true;
    return pendingBefore.slice(tagIndex);
  };
}
