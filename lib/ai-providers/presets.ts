import type { AdapterType } from '@/lib/db/interfaces';

export const PRESET_PROVIDERS = {
  openai: {
    name: 'OpenAI',
    adapterType: 'openai' as AdapterType,
    baseUrl: 'https://api.openai.com/v1',
  },
  anthropic: {
    name: 'Anthropic',
    adapterType: 'anthropic' as AdapterType,
    baseUrl: 'https://api.anthropic.com/v1',
  },
  google: {
    name: 'Google Gemini',
    adapterType: 'openai' as AdapterType,
    baseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
  },
} as const;
