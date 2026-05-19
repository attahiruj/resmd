import { OpenAICompatibleProvider } from './openai-compatible';
import { AnthropicCompatibleProvider } from './anthropic-compatible';
import type { AIProvider, AIModel } from './types';
import type { AdapterType } from '@/lib/db/interfaces';
import CURATED_MODELS from './models.json';
import { debug } from '@/lib/env';
import { getDbProvider } from '@/lib/db/server';
import { decryptApiKey } from '@/lib/crypto';

export type { AIModel, AIProvider, ChatMessage, ChatRequest } from './types';
export {
  createSSEStream,
  createAnthropicSSEStream,
  createSuggestionFilter,
} from './stream';
export { OpenAICompatibleProvider } from './openai-compatible';
export { AnthropicCompatibleProvider } from './anthropic-compatible';

// ---------------------------------------------------------------------------
// Preset provider definitions — used by Settings UI for quick-add
// ---------------------------------------------------------------------------

export { PRESET_PROVIDERS } from './presets';

// ---------------------------------------------------------------------------
// Provider factory — builds the right adapter based on wire format
// ---------------------------------------------------------------------------

function getModelsFilter(baseUrl: string): (m: { id: string }) => boolean {
  if (baseUrl.includes('openai.com'))
    return (m) => /^gpt-/.test(m.id) && !m.id.includes('instruct');
  if (baseUrl.includes('generativelanguage'))
    return (m) => /^gemini-/.test(m.id);
  return () => true;
}

export function buildProvider(
  config: { name: string; adapterType: AdapterType; baseUrl: string },
  apiKey: string
): AIProvider {
  if (config.adapterType === 'anthropic') {
    return new AnthropicCompatibleProvider({ ...config, apiKey });
  }
  return new OpenAICompatibleProvider({
    name: config.name,
    baseUrl: config.baseUrl,
    apiKey,
    defaultModel: '',
    modelsUrl: `${config.baseUrl}/models`,
    modelsFilter: getModelsFilter(config.baseUrl),
  });
}

// ---------------------------------------------------------------------------
// BYOK resolution helpers — called by AI routes and model list
// ---------------------------------------------------------------------------

export async function resolveUserProvider(
  userId: string,
  providerId: string
): Promise<AIProvider> {
  const record = await getDbProvider().getUserProviderKey(providerId, userId);
  if (!record) throw new Error('Provider not found');
  const rawKey = decryptApiKey(record.encryptedKey);
  return buildProvider(
    {
      name: record.name,
      adapterType: record.adapterType,
      baseUrl: record.baseUrl,
    },
    rawKey
  );
}

export async function listUserProviderModels(
  userId: string
): Promise<AIModel[]> {
  const stored = await getDbProvider().listUserProviders(userId);
  const results = await Promise.allSettled(
    stored.map(async (p) => {
      const record = await getDbProvider().getUserProviderKey(p.id, userId);
      if (!record) return [] as AIModel[];
      const provider = buildProvider(
        { name: p.name, adapterType: p.adapterType, baseUrl: p.baseUrl },
        decryptApiKey(record.encryptedKey)
      );
      const models = (await provider.listModels?.()) ?? [];
      return models.map((m) => ({ ...m, providerId: p.id }));
    })
  );
  return results.flatMap((r) => (r.status === 'fulfilled' ? r.value : []));
}

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
  debug('AI Providers loaded', {
    count: providers.length,
    names: providers.map((p) => p.name),
  });
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
