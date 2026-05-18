import { randomUUID } from 'crypto';
import { getLocalDb } from './LocalDatabase';
import type { IResumeRepository, AiModelStat } from '@/lib/db/interfaces';
import type { Resume, UserProfile } from '@/types/resume';

function mapResume(row: Record<string, unknown>): Resume {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    rawContent: row.raw_content as string,
    templateId: row.template_id as string,
    clonedFromId: (row.cloned_from_id as string | null) ?? null,
    isPublic: Boolean(row.is_public),
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

export class LocalResumeRepository implements IResumeRepository {
  private get db() {
    return getLocalDb();
  }

  async createResume(
    userId: string,
    title: string,
    rawContent: string,
    templateId: string
  ): Promise<Resume> {
    const id = randomUUID();
    const now = new Date().toISOString();
    await this.db.execute({
      sql: `INSERT INTO resumes (id, user_id, title, raw_content, template_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
      args: [id, userId, title, rawContent, templateId, now, now],
    });
    const result = await this.db.execute({
      sql: `SELECT * FROM resumes WHERE id = ?`,
      args: [id],
    });
    return mapResume(result.rows[0] as Record<string, unknown>);
  }

  async getResume(resumeId: string): Promise<Resume | null> {
    const result = await this.db.execute({
      sql: `SELECT * FROM resumes WHERE id = ?`,
      args: [resumeId],
    });
    if (result.rows.length === 0) return null;
    return mapResume(result.rows[0] as Record<string, unknown>);
  }

  async getUserResumes(userId: string): Promise<Resume[]> {
    const result = await this.db.execute({
      sql: `SELECT * FROM resumes WHERE user_id = ? ORDER BY updated_at DESC`,
      args: [userId],
    });
    return result.rows.map((r) => mapResume(r as Record<string, unknown>));
  }

  async updateResumeContent(
    resumeId: string,
    rawContent: string,
    templateId: string,
    title?: string
  ): Promise<void> {
    const now = new Date().toISOString();
    if (title !== undefined) {
      await this.db.execute({
        sql: `UPDATE resumes SET raw_content = ?, template_id = ?, title = ?, updated_at = ? WHERE id = ?`,
        args: [rawContent, templateId, title, now, resumeId],
      });
    } else {
      await this.db.execute({
        sql: `UPDATE resumes SET raw_content = ?, template_id = ?, updated_at = ? WHERE id = ?`,
        args: [rawContent, templateId, now, resumeId],
      });
    }
  }

  async cloneResume(
    sourceResumeId: string,
    newTitle: string,
    userId: string
  ): Promise<Resume> {
    const source = await this.getResume(sourceResumeId);
    if (!source) throw new Error('Source resume not found');
    const id = randomUUID();
    const now = new Date().toISOString();
    await this.db.execute({
      sql: `INSERT INTO resumes (id, user_id, title, raw_content, template_id, cloned_from_id, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      args: [
        id,
        userId,
        newTitle,
        source.rawContent,
        source.templateId,
        sourceResumeId,
        now,
        now,
      ],
    });
    const result = await this.db.execute({
      sql: `SELECT * FROM resumes WHERE id = ?`,
      args: [id],
    });
    return mapResume(result.rows[0] as Record<string, unknown>);
  }

  async deleteResume(resumeId: string): Promise<void> {
    await this.db.execute({
      sql: `DELETE FROM resumes WHERE id = ?`,
      args: [resumeId],
    });
  }

  async getResumeBySlug(slug: string): Promise<Resume | null> {
    const result = await this.db.execute({
      sql: `SELECT * FROM resumes WHERE public_slug = ? AND is_public = 1`,
      args: [slug],
    });
    if (result.rows.length === 0) return null;
    return mapResume(result.rows[0] as Record<string, unknown>);
  }

  async getUserProfile(userId: string): Promise<UserProfile | null> {
    const result = await this.db.execute({
      sql: `SELECT * FROM profiles WHERE id = ?`,
      args: [userId],
    });
    if (result.rows.length === 0) return null;
    return mapProfile(result.rows[0] as Record<string, unknown>);
  }

  async upsertProfile(userId: string, email: string | null): Promise<void> {
    const now = new Date().toISOString();
    await this.db.execute({
      sql: `INSERT INTO profiles (id, email, created_at) VALUES (?, ?, ?)
            ON CONFLICT(id) DO NOTHING`,
      args: [userId, email ?? '', now],
    });
  }

  async insertFeedback(
    userId: string | null,
    rating: number,
    message: string | null
  ): Promise<void> {
    await this.db.execute({
      sql: `INSERT INTO feedback (id, user_id, rating, message) VALUES (?, ?, ?, ?)`,
      args: [randomUUID(), userId, rating, message],
    });
  }

  async getAiModelStats(modelIds: string[]): Promise<AiModelStat[]> {
    if (modelIds.length === 0) return [];
    const placeholders = modelIds.map(() => '?').join(', ');
    const result = await this.db.execute({
      sql: `SELECT model_id, use_count FROM ai_model_stats WHERE model_id IN (${placeholders})`,
      args: modelIds,
    });
    return result.rows.map((r) => ({
      model_id: r.model_id as string,
      use_count: r.use_count as number,
    }));
  }

  async incrementModelUse(model: string, provider: string): Promise<void> {
    await this.db.execute({
      sql: `INSERT INTO ai_model_stats (model_id, provider, use_count)
            VALUES (?, ?, 1)
            ON CONFLICT(model_id, provider) DO UPDATE SET use_count = use_count + 1`,
      args: [model, provider],
    });
  }

  async getAiProfileUsage(userId: string): Promise<{
    ai_usage_this_month: number;
    ai_usage_reset_at: string;
  } | null> {
    const result = await this.db.execute({
      sql: `SELECT ai_usage_this_month, ai_usage_reset_at FROM profiles WHERE id = ?`,
      args: [userId],
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return {
      ai_usage_this_month: (row.ai_usage_this_month as number) ?? 0,
      ai_usage_reset_at:
        (row.ai_usage_reset_at as string) ?? new Date().toISOString(),
    };
  }

  async updateAiProfileUsage(
    userId: string,
    usage: number,
    resetAt?: string
  ): Promise<void> {
    if (resetAt !== undefined) {
      await this.db.execute({
        sql: `UPDATE profiles SET ai_usage_this_month = ?, ai_usage_reset_at = ? WHERE id = ?`,
        args: [usage, resetAt, userId],
      });
    } else {
      await this.db.execute({
        sql: `UPDATE profiles SET ai_usage_this_month = ? WHERE id = ?`,
        args: [usage, userId],
      });
    }
  }

  async createMcpKey(
    userId: string,
    name: string,
    keyHash: string,
    keyId: string
  ): Promise<void> {
    const now = new Date().toISOString();
    await this.db.execute({
      sql: `INSERT INTO mcp_keys (id, user_id, key_hash, name, created_at) VALUES (?, ?, ?, ?, ?)`,
      args: [keyId, userId, keyHash, name, now],
    });
  }

  async getMcpKeyByHash(
    keyHash: string
  ): Promise<{ id: string; userId: string } | null> {
    const result = await this.db.execute({
      sql: `SELECT id, user_id FROM mcp_keys WHERE key_hash = ?`,
      args: [keyHash],
    });
    if (result.rows.length === 0) return null;
    const row = result.rows[0];
    return { id: row.id as string, userId: row.user_id as string };
  }

  async listMcpKeys(
    userId: string
  ): Promise<
    { id: string; name: string; createdAt: string; lastUsedAt: string | null }[]
  > {
    const result = await this.db.execute({
      sql: `SELECT id, name, created_at, last_used_at FROM mcp_keys WHERE user_id = ? ORDER BY created_at DESC`,
      args: [userId],
    });
    return result.rows.map((r) => ({
      id: r.id as string,
      name: r.name as string,
      createdAt: r.created_at as string,
      lastUsedAt: (r.last_used_at as string | null) ?? null,
    }));
  }

  async deleteMcpKey(keyId: string, userId: string): Promise<void> {
    await this.db.execute({
      sql: `DELETE FROM mcp_keys WHERE id = ? AND user_id = ?`,
      args: [keyId, userId],
    });
  }

  async updateMcpKeyLastUsed(keyId: string): Promise<void> {
    const now = new Date().toISOString();
    await this.db.execute({
      sql: `UPDATE mcp_keys SET last_used_at = ? WHERE id = ?`,
      args: [now, keyId],
    });
  }

  async trackSuggestion(
    model: string,
    provider: string,
    action: string,
    count: number
  ): Promise<void> {
    const acceptedDelta = action === 'accepted' ? count : 0;
    const rejectedDelta = action === 'rejected' ? count : 0;
    await this.db.execute({
      sql: `INSERT INTO ai_model_stats (model_id, provider, use_count, accepted_count, rejected_count)
            VALUES (?, ?, ?, ?, ?)
            ON CONFLICT(model_id, provider) DO UPDATE SET
              use_count = use_count + excluded.use_count,
              accepted_count = accepted_count + excluded.accepted_count,
              rejected_count = rejected_count + excluded.rejected_count`,
      args: [model, provider, count, acceptedDelta, rejectedDelta],
    });
  }
}
