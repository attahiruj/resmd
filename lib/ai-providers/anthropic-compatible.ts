import type { AIModel, AIProvider, ChatRequest } from './types';

export class AnthropicCompatibleProvider implements AIProvider {
  constructor(
    private config: {
      name: string;
      baseUrl: string;
      apiKey: string;
    }
  ) {}

  get name() {
    return this.config.name;
  }

  get defaultModel() {
    return '';
  }

  async chat(request: ChatRequest): Promise<Response> {
    // Separate system messages from conversation messages
    const systemMessages = request.messages.filter((m) => m.role === 'system');
    const otherMessages = request.messages.filter((m) => m.role !== 'system');

    const systemContent = systemMessages.map((m) => m.content).join('\n\n');

    // Merge consecutive same-role messages (Anthropic requires alternating roles)
    const merged: { role: 'user' | 'assistant'; content: string }[] = [];
    for (const msg of otherMessages) {
      const last = merged[merged.length - 1];
      if (last && last.role === msg.role) {
        last.content += '\n\n' + msg.content;
      } else {
        merged.push({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        });
      }
    }

    const body: Record<string, unknown> = {
      model: request.model,
      max_tokens: request.maxTokens ?? 4096,
      messages: merged,
    };
    if (systemContent) body.system = systemContent;
    if (request.stream) body.stream = true;
    if (request.temperature !== undefined)
      body.temperature = request.temperature;

    return fetch(`${this.config.baseUrl}/messages`, {
      method: 'POST',
      headers: {
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
  }

  async listModels(): Promise<AIModel[]> {
    const provider = this.config.name;
    const res = await fetch(`${this.config.baseUrl}/models`, {
      headers: {
        'x-api-key': this.config.apiKey,
        'anthropic-version': '2023-06-01',
      },
      next: { revalidate: 3600 },
    });

    if (!res.ok) throw new Error(`Failed to fetch models: ${res.status}`);

    const data = await res.json();
    const models: { id: string; display_name?: string }[] = data.data ?? [];
    return models
      .map((m) => ({ id: m.id, name: m.display_name ?? m.id, provider }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }
}
