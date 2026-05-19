import type { AIModel, AIProvider, ChatRequest } from './types';

export interface OpenAICompatibleConfig {
  name: string;
  /** Base URL without trailing slash, e.g. 'https://openrouter.ai/api/v1' */
  baseUrl: string;
  apiKey: string;
  defaultModel: string;
  /** Extra headers to merge in (e.g. HTTP-Referer for OpenRouter) */
  extraHeaders?: Record<string, string>;
  /** Token limit parameter name — defaults to 'max_tokens' */
  maxTokensParam?: 'max_tokens' | 'max_completion_tokens';
  /** URL to fetch dynamic model list from */
  modelsUrl?: string;
  /** Filter applied to models fetched from modelsUrl */
  modelsFilter?: (m: { id: string; name: string }) => boolean;
  /** Static model list — provider is attached at runtime by listModels() */
  staticModels?: { id: string; name: string }[];
}

export class OpenAICompatibleProvider implements AIProvider {
  constructor(private config: OpenAICompatibleConfig) {}

  get name() {
    return this.config.name;
  }

  get defaultModel() {
    return this.config.defaultModel;
  }

  async chat(request: ChatRequest): Promise<Response> {
    const maxTokensKey = this.config.maxTokensParam ?? 'max_tokens';
    return fetch(`${this.config.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...this.config.extraHeaders,
      },
      body: JSON.stringify({
        model: request.model ?? this.config.defaultModel,
        [maxTokensKey]: request.maxTokens,
        messages: request.messages,
        ...(request.temperature !== undefined
          ? { temperature: request.temperature }
          : {}),
        ...(request.stream ? { stream: true } : {}),
      }),
    });
  }

  async listModels(): Promise<AIModel[]> {
    const provider = this.config.name;

    if (this.config.staticModels) {
      return this.config.staticModels.map((m) => ({ ...m, provider }));
    }

    if (!this.config.modelsUrl) {
      return [
        {
          id: this.config.defaultModel,
          name: this.config.defaultModel,
          provider,
        },
      ];
    }

    console.log(`[listModels:${provider}] fetching ${this.config.modelsUrl}`);
    const res = await fetch(this.config.modelsUrl, {
      headers: { Authorization: `Bearer ${this.config.apiKey}` },
      cache: 'no-store',
    });

    console.log(`[listModels:${provider}] status ${res.status}`);
    if (!res.ok) {
      const body = await res.text().catch(() => '');
      console.error(`[listModels:${provider}] error body:`, body);
      throw new Error(
        `Failed to fetch models from ${this.config.modelsUrl}: ${res.status} ${body}`
      );
    }

    const data = await res.json();
    console.log(
      `[listModels:${provider}] raw response keys:`,
      Object.keys(data)
    );
    console.log(
      `[listModels:${provider}] data.data length:`,
      (data.data ?? []).length
    );
    const raw: { id: string; name: string }[] = data.data ?? [];
    // Google returns IDs like "models/gemini-2.0-flash" — strip the prefix
    const models = raw.map((m) => ({
      ...m,
      id: m.id.replace(/^models\//, ''),
    }));
    const filtered = models.filter(this.config.modelsFilter ?? (() => true));
    console.log(
      `[listModels:${provider}] after filter:`,
      filtered.length,
      'models'
    );
    return filtered
      .map((m) => ({ id: m.id, name: m.name ?? m.id, provider }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
