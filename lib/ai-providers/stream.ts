/**
 * Parses an OpenAI-compatible SSE stream and yields plain text chunks.
 * Works for any provider using the standard choices[0].delta.content format.
 */
export function createSSEStream(
  body: ReadableStream<Uint8Array>
): ReadableStream<Uint8Array> {
  return new ReadableStream({
    async start(controller) {
      const reader = body.getReader();
      const decoder = new TextDecoder();
      const encoder = new TextEncoder();
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
              if (text) controller.enqueue(encoder.encode(text));
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
