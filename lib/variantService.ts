import { ResumeVariant, VariantSnapshot, UserProfile } from '@/types/resume'
import { LIMITS } from '@/lib/limits'
import { createSupabaseServerClient } from '@/lib/supabase-server'

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
  }
}

function mapSnapshot(row: Record<string, unknown>): VariantSnapshot {
  return {
    id: row.id as string,
    variantId: row.variant_id as string,
    rawContent: row.raw_content as string,
    message: row.message as string,
    templateId: row.template_id as string,
    createdAt: row.created_at as string,
  }
}

function mapProfile(row: Record<string, unknown>): UserProfile {
  return {
    id: row.id as string,
    email: row.email as string,
    isPro: row.is_pro as boolean,
    stripeCustomerId: (row.stripe_customer_id as string | null) ?? null,
    proExpiresAt: (row.pro_expires_at as string | null) ?? null,
    aiUsageThisMonth: row.ai_usage_this_month as number,
    createdAt: row.created_at as string,
  }
}

export const createVariant = async (
  userId: string,
  title: string,
  rawContent: string,
  templateId: string
): Promise<ResumeVariant> => {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('resume_variants')
    .insert({
      user_id: userId,
      title,
      raw_content: rawContent,
      template_id: templateId,
    })
    .select()
    .single()

  if (error) throw error

  const variant = mapVariant(data)

  // Create initial snapshot
  await supabase.from('variant_snapshots').insert({
    variant_id: variant.id,
    raw_content: rawContent,
    message: 'Initial save',
    template_id: templateId,
  })

  return variant
}

export const updateVariantContent = async (
  variantId: string,
  rawContent: string,
  templateId: string,
  title?: string
): Promise<void> => {
  const supabase = createSupabaseServerClient()

  const { error } = await supabase
    .from('resume_variants')
    .update({
      raw_content: rawContent,
      template_id: templateId,
      updated_at: new Date().toISOString(),
      ...(title !== undefined ? { title } : {}),
    })
    .eq('id', variantId)

  if (error) throw error
}

export const saveSnapshot = async (
  variantId: string,
  rawContent: string,
  message: string,
  templateId: string
): Promise<VariantSnapshot> => {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('variant_snapshots')
    .insert({
      variant_id: variantId,
      raw_content: rawContent,
      message,
      template_id: templateId,
    })
    .select()
    .single()

  if (error) throw error

  // For free users: keep only the most recent FREE_SNAPSHOTS snapshots
  const { data: variant } = await supabase
    .from('resume_variants')
    .select('user_id')
    .eq('id', variantId)
    .single()

  if (variant) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('is_pro')
      .eq('id', variant.user_id)
      .single()

    if (profile && !profile.is_pro) {
      const { data: snapshots } = await supabase
        .from('variant_snapshots')
        .select('id')
        .eq('variant_id', variantId)
        .order('created_at', { ascending: false })

      if (snapshots && snapshots.length > LIMITS.FREE_SNAPSHOTS) {
        const toDelete = snapshots.slice(LIMITS.FREE_SNAPSHOTS).map((s: { id: string }) => s.id)
        await supabase.from('variant_snapshots').delete().in('id', toDelete)
      }
    }
  }

  return mapSnapshot(data)
}

export const getUserVariants = async (userId: string): Promise<ResumeVariant[]> => {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('resume_variants')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map(mapVariant)
}

export const getVariant = async (variantId: string): Promise<ResumeVariant | null> => {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('resume_variants')
    .select('*')
    .eq('id', variantId)
    .single()

  if (error) return null

  return mapVariant(data)
}

export const getVariantSnapshots = async (variantId: string): Promise<VariantSnapshot[]> => {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('variant_snapshots')
    .select('*')
    .eq('variant_id', variantId)
    .order('created_at', { ascending: false })

  if (error) throw error

  return (data ?? []).map(mapSnapshot)
}

export const cloneVariant = async (
  sourceVariantId: string,
  newTitle: string,
  userId: string
): Promise<ResumeVariant> => {
  const supabase = createSupabaseServerClient()

  const source = await getVariant(sourceVariantId)
  if (!source) throw new Error('Source variant not found')

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
    .single()

  if (error) throw error

  const newVariant = mapVariant(data)

  // Create first snapshot with clone message
  await supabase.from('variant_snapshots').insert({
    variant_id: newVariant.id,
    raw_content: source.rawContent,
    message: `Cloned from ${source.title}`,
    template_id: source.templateId,
  })

  return newVariant
}

export const deleteVariant = async (variantId: string): Promise<void> => {
  const supabase = createSupabaseServerClient()

  const { error } = await supabase
    .from('resume_variants')
    .delete()
    .eq('id', variantId)

  if (error) throw error
}

export const getUserProfile = async (userId: string): Promise<UserProfile | null> => {
  const supabase = createSupabaseServerClient()

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()

  if (error) return null

  return mapProfile(data)
}
