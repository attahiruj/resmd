export interface AIModel {
  id: string;
  name: string;
  provider: string;
  providerId?: string; // 'server' | UUID from user_providers — added by routes/callers
  use_count?: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ChatRequest {
  messages: ChatMessage[];
  model?: string;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface AIProvider {
  readonly name: string;
  readonly defaultModel: string;
  /** Returns raw fetch Response — routes handle streaming vs non-streaming */
  chat(request: ChatRequest): Promise<Response>;
  /** Optional: return model list. Omit for providers with static/no discovery. */
  listModels?(): Promise<AIModel[]>;
}
