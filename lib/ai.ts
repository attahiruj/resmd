/**
 * Client-side AI helpers.
 * - streamEnhance: Inline AI text enhancement via /api/ai/enhance (streaming)
 * - AIChat.tsx calls /api/ai/chat directly (JSON response)
 */

/** @deprecated Use SELECTED_MODEL_STORAGE_KEY with { modelId, providerId } */
export const AI_MODEL_STORAGE_KEY = 'resmd_ai_model';

export const SELECTED_MODEL_STORAGE_KEY = 'resmd_selected_model';

export interface SelectedModel {
  modelId: string;
  providerId: string;
}

export function loadSelectedModel(): SelectedModel | null {
  if (typeof window === 'undefined') return null;
  const raw = localStorage.getItem(SELECTED_MODEL_STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw) as SelectedModel;
    } catch {
      // invalid JSON, fall through
    }
  }
  // Migrate legacy plain string value
  const legacy = localStorage.getItem(AI_MODEL_STORAGE_KEY);
  if (legacy) {
    const migrated: SelectedModel = { modelId: legacy, providerId: 'server' };
    localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, JSON.stringify(migrated));
    localStorage.removeItem(AI_MODEL_STORAGE_KEY);
    return migrated;
  }
  return null;
}

export function saveSelectedModel(model: SelectedModel): void {
  localStorage.setItem(SELECTED_MODEL_STORAGE_KEY, JSON.stringify(model));
}

export interface EnhanceOptions {
  instruction: string;
  selectedText: string;
  resumeContext: string;
  model?: string;
  providerId?: string;
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
  model,
  providerId,
  onChunk,
  onDone,
  onError,
}: EnhanceOptions): AbortController {
  const controller = new AbortController();
  const signal = controller.signal;

  const run = async () => {
    let resolvedModel = model;
    let resolvedProviderId = providerId;
    if (!resolvedModel && !resolvedProviderId) {
      const saved = loadSelectedModel();
      resolvedModel = saved?.modelId;
      resolvedProviderId = saved?.providerId;
    }

    try {
      const response = await fetch('/api/ai/enhance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          selectedText,
          instruction,
          resumeContext,
          model: resolvedModel,
          providerId: resolvedProviderId,
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
