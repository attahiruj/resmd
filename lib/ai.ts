/**
 * Client-side AI helpers for Stage 8 features.
 * - streamEnhance: Inline AI text enhancement (8a)
 * - streamChat: AI Chat Panel (8b)
 */

export interface EnhanceOptions {
  instruction: string;
  selectedText: string;
  resumeContext: string;
  onChunk: (text: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: string) => void;
}

export interface ChatOptions {
  message: string;
  resumeContent: string;
  history: Array<{ role: string; content: string }>;
  onChunk: (text: string) => void;
  onDone: (fullText: string) => void;
  onError: (error: string) => void;
}

/**
 * Streams an inline AI enhancement request.
 * Sends selected text + instruction to /api/ai/enhance and streams the response.
 */
export function streamEnhance({
  instruction,
  selectedText,
  resumeContext,
  onChunk,
  onDone,
  onError,
}: EnhanceOptions): AbortController {
  const controller = new AbortController();
  const signal = controller.signal;

  const run = async () => {
    try {
      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedText,
          instruction,
          resumeContext,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        onError(errorData.error || `Request failed: ${response.status}`);
        return;
      }

      if (!response.body) {
        onError('No response body');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        onChunk(chunk);
      }

      onDone(fullText);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, don't treat as error
        return;
      }
      onError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  run();

  return controller;
}

/**
 * Streams an AI chat request to /api/ai/chat and streams the response.
 */
export function streamChat({
  message,
  resumeContent,
  history,
  onChunk,
  onDone,
  onError,
}: ChatOptions): AbortController {
  const controller = new AbortController();
  const signal = controller.signal;

  const run = async () => {
    try {
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          resumeContent,
          history,
        }),
        signal,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        onError(errorData.error || `Request failed: ${response.status}`);
        return;
      }

      if (!response.body) {
        onError('No response body');
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let fullText = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        fullText += chunk;
        onChunk(chunk);
      }

      onDone(fullText);
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        // Request was cancelled, don't treat as error
        return;
      }
      onError(err instanceof Error ? err.message : 'Unknown error');
    }
  };

  run();

  return controller;
}
