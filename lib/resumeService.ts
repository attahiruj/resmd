import { Resume, UserProfile } from '@/types/resume';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// DB row → TypeScript type mappers (snake_case → camelCase)
function mapResume(row: Record<string, unknown>): Resume {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    title: row.title as string,
    rawContent: row.raw_content as string,
    templateId: row.template_id as string,
    clonedFromId: (row.forked_from_id as string | null) ?? null,
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

export const createResume = async (
  userId: string,
  title: string,
  rawContent: string,
  templateId: string
): Promise<Resume> => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
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
};

export const updateResumeContent = async (
  resumeId: string,
  rawContent: string,
  templateId: string,
  title?: string
): Promise<void> => {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from('resumes')
    .update({
      raw_content: rawContent,
      template_id: templateId,
      updated_at: new Date().toISOString(),
      ...(title !== undefined ? { title } : {}),
    })
    .eq('id', resumeId);

  if (error) throw error;
};

export const getUserResumes = async (userId: string): Promise<Resume[]> => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map(mapResume);
};

export const getResume = async (resumeId: string): Promise<Resume | null> => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('id', resumeId)
    .single();

  if (error) return null;

  return mapResume(data);
};

export const cloneResume = async (
  sourceResumeId: string,
  newTitle: string,
  userId: string
): Promise<Resume> => {
  const supabase = createSupabaseServerClient();

  const source = await getResume(sourceResumeId);
  if (!source) throw new Error('Source resume not found');

  const { data, error } = await supabase
    .from('resumes')
    .insert({
      user_id: userId,
      title: newTitle,
      raw_content: source.rawContent,
      template_id: source.templateId,
      forked_from_id: sourceResumeId,
    })
    .select()
    .single();

  if (error) throw error;

  return mapResume(data);
};

export const deleteResume = async (resumeId: string): Promise<void> => {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase.from('resumes').delete().eq('id', resumeId);

  if (error) throw error;
};

export const getResumeBySlug = async (slug: string): Promise<Resume | null> => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('resumes')
    .select('*')
    .eq('public_slug', slug)
    .eq('is_public', true)
    .single();

  if (error) return null;

  return mapResume(data);
};

export const getUserProfile = async (
  userId: string
): Promise<UserProfile | null> => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) return null;

  return mapProfile(data);
};
