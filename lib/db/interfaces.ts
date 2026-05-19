import type { Resume, UserProfile } from '@/types/resume';

export type { Resume, UserProfile };

export type AdapterType = 'openai' | 'anthropic';

export interface UserProvider {
  id: string;
  name: string;
  adapterType: AdapterType;
  baseUrl: string;
  keyPreview: string;
  createdAt: string;
}

export interface AuthUser {
  id: string;
  email?: string;
  is_anonymous?: boolean;
}

export interface AuthResult {
  error: Error | null;
}

export type Unsubscribe = () => void;

export interface AiModelStat {
  model_id: string;
  use_count: number;
}

export interface IResumeRepository {
  createResume(
    userId: string,
    title: string,
    rawContent: string,
    templateId: string
  ): Promise<Resume>;
  getResume(resumeId: string): Promise<Resume | null>;
  getUserResumes(userId: string): Promise<Resume[]>;
  updateResumeContent(
    resumeId: string,
    rawContent: string,
    templateId: string,
    title?: string
  ): Promise<void>;
  cloneResume(
    sourceResumeId: string,
    newTitle: string,
    userId: string
  ): Promise<Resume>;
  deleteResume(resumeId: string): Promise<void>;
  getResumeBySlug(slug: string): Promise<Resume | null>;
  getUserProfile(userId: string): Promise<UserProfile | null>;
  upsertProfile(userId: string, email: string | null): Promise<void>;
  insertFeedback(
    userId: string | null,
    rating: number,
    message: string | null
  ): Promise<void>;
  getAiModelStats(modelIds: string[]): Promise<AiModelStat[]>;
  trackSuggestion(
    model: string,
    provider: string,
    action: string,
    count: number
  ): Promise<void>;
  incrementModelUse(model: string, provider: string): Promise<void>;
  getAiProfileUsage(
    userId: string
  ): Promise<{ ai_usage_this_month: number; ai_usage_reset_at: string } | null>;
  updateAiProfileUsage(
    userId: string,
    usage: number,
    resetAt?: string
  ): Promise<void>;
  createMcpKey(
    userId: string,
    name: string,
    keyHash: string,
    keyId: string
  ): Promise<void>;
  getMcpKeyByHash(
    keyHash: string
  ): Promise<{ id: string; userId: string } | null>;
  listMcpKeys(
    userId: string
  ): Promise<
    { id: string; name: string; createdAt: string; lastUsedAt: string | null }[]
  >;
  deleteMcpKey(keyId: string, userId: string): Promise<void>;
  updateMcpKeyLastUsed(keyId: string): Promise<void>;
  createUserProvider(
    userId: string,
    name: string,
    adapterType: AdapterType,
    baseUrl: string,
    encryptedKey: string,
    keyPreview: string
  ): Promise<string>;
  listUserProviders(userId: string): Promise<UserProvider[]>;
  getUserProviderKey(
    providerId: string,
    userId: string
  ): Promise<{
    encryptedKey: string;
    adapterType: AdapterType;
    baseUrl: string;
    name: string;
  } | null>;
  deleteUserProvider(providerId: string, userId: string): Promise<void>;
}

export interface IServerAuthProvider {
  getUser(): Promise<AuthUser | null>;
}

export interface IClientAuthProvider {
  getUser(): Promise<AuthUser | null>;
  getProfile(userId: string): Promise<UserProfile | null>;
  signInWithPassword(email: string, password: string): Promise<AuthResult>;
  signUp(
    email: string,
    password: string,
    redirectTo: string
  ): Promise<AuthResult>;
  updateUser(attrs: { email?: string; password?: string }): Promise<AuthResult>;
  signInWithOAuth(provider: string, redirectTo: string): Promise<AuthResult>;
  linkIdentity(provider: string, redirectTo: string): Promise<AuthResult>;
  signOut(): Promise<void>;
  signInAnonymously(): Promise<AuthResult>;
  onAuthStateChange(callback: (user: AuthUser | null) => void): Unsubscribe;
}
