import { OpenAICompatibleProvider } from './openai-compatible';
import type { AIProvider } from './types';
import CURATED_MODELS from './models.json';

export type { AIModel, AIProvider, ChatMessage, ChatRequest } from './types';
export { createSSEStream } from './stream';
export { OpenAICompatibleProvider } from './openai-compatible';

// ---------------------------------------------------------------------------
// Provider factories — one per provider, only constructed when key is present
// ---------------------------------------------------------------------------

function makeMinimaxProvider(key: string): AIProvider {
  return new OpenAICompatibleProvider({
    name: 'minimax',
    baseUrl: 'https://api.minimax.io/v1',
    apiKey: key,
    defaultModel: 'M2-her',
    maxTokensParam: 'max_completion_tokens',
    staticModels: CURATED_MODELS.minimax,
  });
}

function makeGroqProvider(key: string): AIProvider {
  return new OpenAICompatibleProvider({
    name: 'groq',
    baseUrl: 'https://api.groq.com/openai/v1',
    apiKey: key,
    defaultModel: 'llama-3.3-70b-versatile',
    staticModels: CURATED_MODELS.groq,
  });
}

function makeOpenRouterProvider(key: string): AIProvider {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  return new OpenAICompatibleProvider({
    name: 'openrouter',
    baseUrl: 'https://openrouter.ai/api/v1',
    apiKey: key,
    defaultModel: 'arcee-ai/trinity-large-preview:free',
    extraHeaders: { 'HTTP-Referer': appUrl, 'X-Title': 'resmd resAI' },
    staticModels: CURATED_MODELS.openrouter,
  });
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Returns all providers for which an API key is configured.
 * MiniMax is first — it becomes the default when no specific model is requested.
 * Call per-request, not at module load.
 */
export function getActiveProviders(): AIProvider[] {
  const providers: AIProvider[] = [];
  if (process.env.MINIMAX_API_KEY)
    providers.push(makeMinimaxProvider(process.env.MINIMAX_API_KEY));
  if (process.env.GROQ_API_KEY)
    providers.push(makeGroqProvider(process.env.GROQ_API_KEY));
  if (process.env.OPENROUTER_API_KEY)
    providers.push(makeOpenRouterProvider(process.env.OPENROUTER_API_KEY));
  return providers;
}

/**
 * Returns the provider that owns the given model ID (looked up from models.json).
 * Falls back to the first active provider if the model ID isn't found.
 * Throws if no providers are configured.
 */
export function getProviderForModel(modelId: string): AIProvider {
  const providers = getActiveProviders();
  if (providers.length === 0) throw new Error('No AI providers configured');

  // Find which curated list contains this model ID
  for (const [providerName, models] of Object.entries(CURATED_MODELS) as [
    string,
    { id: string }[],
  ][]) {
    if (models.some((m) => m.id === modelId)) {
      const match = providers.find((p) => p.name === providerName);
      if (match) return match;
    }
  }

  // Model not in curated list (e.g. stale localStorage) — use first active provider
  return providers[0];
}
