import { ResumeVariant, UserProfile } from '@/types/resume';
import { createSupabaseServerClient } from '@/lib/supabase-server';

// DB row → TypeScript type mappers (snake_case → camelCase)
function mapVariant(row: Record<string, unknown>): ResumeVariant {
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

export const createVariant = async (
  userId: string,
  title: string,
  rawContent: string,
  templateId: string
): Promise<ResumeVariant> => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('resume_variants')
    .insert({
      user_id: userId,
      title,
      raw_content: rawContent,
      template_id: templateId,
    })
    .select()
    .single();

  if (error) throw error;

  return mapVariant(data);
};

export const updateVariantContent = async (
  variantId: string,
  rawContent: string,
  templateId: string,
  title?: string
): Promise<void> => {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from('resume_variants')
    .update({
      raw_content: rawContent,
      template_id: templateId,
      updated_at: new Date().toISOString(),
      ...(title !== undefined ? { title } : {}),
    })
    .eq('id', variantId);

  if (error) throw error;
};

export const getUserVariants = async (
  userId: string
): Promise<ResumeVariant[]> => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('resume_variants')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map(mapVariant);
};

export const getVariant = async (
  variantId: string
): Promise<ResumeVariant | null> => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('resume_variants')
    .select('*')
    .eq('id', variantId)
    .single();

  if (error) return null;

  return mapVariant(data);
};

export const cloneVariant = async (
  sourceVariantId: string,
  newTitle: string,
  userId: string
): Promise<ResumeVariant> => {
  const supabase = createSupabaseServerClient();

  const source = await getVariant(sourceVariantId);
  if (!source) throw new Error('Source variant not found');

  const { data, error } = await supabase
    .from('resume_variants')
    .insert({
      user_id: userId,
      title: newTitle,
      raw_content: source.rawContent,
      template_id: source.templateId,
      forked_from_id: sourceVariantId,
    })
    .select()
    .single();

  if (error) throw error;

  return mapVariant(data);
};

export const deleteVariant = async (variantId: string): Promise<void> => {
  const supabase = createSupabaseServerClient();

  const { error } = await supabase
    .from('resume_variants')
    .delete()
    .eq('id', variantId);

  if (error) throw error;
};

export const getVariantBySlug = async (
  slug: string
): Promise<ResumeVariant | null> => {
  const supabase = createSupabaseServerClient();

  const { data, error } = await supabase
    .from('resume_variants')
    .select('*')
    .eq('public_slug', slug)
    .eq('is_public', true)
    .single();

  if (error) return null;

  return mapVariant(data);
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
