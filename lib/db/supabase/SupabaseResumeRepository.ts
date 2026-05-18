import { createSupabaseAdminClient } from '@/lib/supabase-server';
import type { IResumeRepository, AiModelStat } from '@/lib/db/interfaces';
import type { Resume, UserProfile } from '@/types/resume';
import { debug } from '@/lib/env';

function mapResume(row: Record<string, unknown>): Resume {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    rawContent: row.raw_content as string,
    templateId: row.template_id as string,
    clonedFromId: (row.cloned_from_id as string | null) ?? null,
    isPublic: row.is_public as boolean,
    publicSlug: (row.public_slug as string | null) ?? null,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function mapProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    email: row.email as string,
    createdAt: row.created_at as string,
  };
}

export class SupabaseResumeRepository implements IResumeRepository {
  private get db() {
    return createSupabaseAdminClient();
  }

  async createResume(
    userId: string,
    title: string,
    rawContent: string,
    templateId: string
  ): Promise<Resume> {
    const { data, error } = await this.db
      .from('resumes')
      .insert({
        user_id: userId,
        title,
        raw_content: rawContent,
        template_id: templateId,
      })
      .select()
      .single();
    if (error) throw error;
    return mapResume(data);
  }

  async getResume(resumeId: string): Promise<Resume | null> {
    const { data, error } = await this.db
      .from('resumes')
      .select('*')
      .eq('id', resumeId)
      .single();
    if (error) return null;
    return mapResume(data);
  }

  async getUserResumes(userId: string): Promise<Resume[]> {
    const { data, error } = await this.db
      .from('resumes')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapResume);
  }

  async updateResumeContent(
    resumeId: string,
    rawContent: string,
    templateId: string,
    title?: string
  ): Promise<void> {
    const { error } = await this.db
      .from('resumes')
      .update({
        raw_content: rawContent,
        template_id: templateId,
        updated_at: new Date().toISOString(),
        ...(title !== undefined ? { title } : {}),
      })
      .eq('id', resumeId);
    if (error) throw error;
  }

  async cloneResume(
    sourceResumeId: string,
    newTitle: string,
    userId: string
  ): Promise<Resume> {
    const source = await this.getResume(sourceResumeId);
    if (!source) throw new Error('Source resume not found');
    const { data, error } = await this.db
      .from('resumes')
      .insert({
        user_id: userId,
        title: newTitle,
        raw_content: source.rawContent,
        template_id: source.templateId,
        cloned_from_id: sourceResumeId,
      })
      .select()
      .single();
    if (error) throw error;
    return mapResume(data);
  }

  async deleteResume(resumeId: string): Promise<void> {
    const { error } = await this.db.from('resumes').delete().eq('id', resumeId);
    if (error) throw error;
  }

  async getResumeBySlug(slug: string): Promise<Resume | null> {
    const { data, error } = await this.db
      .from('resumes')
      .select('*')
      .eq('public_slug', slug)
      .eq('is_public', true)
      .single();
    if (error) return null;
    return mapResume(data);
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const { data, error } = await this.db
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    if (error) return null;
    return mapProfile(data);
  }

  async upsertProfile(userId: string, _email: string | null): Promise<void> {
    await this.db
      .from('profiles')
      .upsert({ id: userId }, { onConflict: 'id', ignoreDuplicates: true });
  }

  async insertFeedback(
    userId: string | null,
    rating: number,
    message: string | null
  ): Promise<void> {
    await this.db.from('feedback').insert({ user_id: userId, rating, message });
  }

  async getAiModelStats(modelIds: string[]): Promise<AiModelStat[]> {
    const { data } = await this.db
      .from('ai_model_stats')
      .select('model_id, use_count')
      .in('model_id', modelIds);
    return data ?? [];
  }

  async trackSuggestion(
    model: string,
    provider: string,
    action: string,
    count: number
  ): Promise<void> {
    const { error } = await this.db.rpc('track_suggestion', {
      p_model: model,
      p_provider: provider,
      p_action: action,
      p_count: count,
    });
    if (error) throw error;
  }

  async incrementModelUse(model: string, provider: string): Promise<void> {
    await this.db.rpc('increment_model_use', {
      p_model: model,
      p_provider: provider,
    });
  }

  async getAiProfileUsage(userId: string): Promise<{
    ai_usage_this_month: number;
    ai_usage_reset_at: string;
  } | null> {
    const { data, error } = await this.db
      .from('profiles')
      .select('ai_usage_this_month, ai_usage_reset_at')
      .eq('id', userId)
      .single();
    if (error || !data) return null;
    return {
      ai_usage_this_month: data.ai_usage_this_month,
      ai_usage_reset_at: data.ai_usage_reset_at,
    };
  }

  async updateAiProfileUsage(
    userId: string,
    usage: number,
    resetAt?: string
  ): Promise<void> {
    const update: Record<string, unknown> = { ai_usage_this_month: usage };
    if (resetAt !== undefined) update.ai_usage_reset_at = resetAt;
    await this.db.from('profiles').update(update).eq('id', userId);
  }

  async createMcpKey(
    userId: string,
    name: string,
    keyHash: string,
    keyId: string
  ): Promise<void> {
    debug('[supabase] createMcpKey userId:', userId, 'name:', name);
    const { error } = await this.db
      .from('mcp_keys')
      .insert({ id: keyId, user_id: userId, key_hash: keyHash, name });
    if (error) {
      console.error('[supabase] createMcpKey failed:', error);
      throw error;
    }
    debug('[supabase] createMcpKey success, keyId:', keyId);
  }

  async getMcpKeyByHash(
    keyHash: string
  ): Promise<{ id: string; userId: string } | null> {
    debug('[supabase] getMcpKeyByHash, hash prefix:', keyHash.slice(0, 8));
    const { data, error } = await this.db
      .from('mcp_keys')
      .select('id, user_id')
      .eq('key_hash', keyHash)
      .maybeSingle();
    if (error) {
      console.error('[supabase] getMcpKeyByHash failed:', error);
      throw error;
    }
    debug(
      '[supabase] getMcpKeyByHash result:',
      data ? `found id=${data.id}` : 'not found'
    );
    if (!data) return null;
    return { id: data.id as string, userId: data.user_id as string };
  }

  async listMcpKeys(
    userId: string
  ): Promise<
    { id: string; name: string; createdAt: string; lastUsedAt: string | null }[]
  > {
    const { data } = await this.db
      .from('mcp_keys')
      .select('id, name, created_at, last_used_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });
    return (data ?? []).map((r: Record<string, unknown>) => ({
      id: r.id as string,
      name: r.name as string,
      createdAt: r.created_at as string,
      lastUsedAt: (r.last_used_at as string | null) ?? null,
    }));
  }

  async deleteMcpKey(keyId: string, userId: string): Promise<void> {
    await this.db
      .from('mcp_keys')
      .delete()
      .eq('id', keyId)
      .eq('user_id', userId);
  }

  async updateMcpKeyLastUsed(keyId: string): Promise<void> {
    await this.db
      .from('mcp_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyId);
  }
}
