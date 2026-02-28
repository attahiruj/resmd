import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getVariant } from '@/lib/variantService'
import EditorClient from '@/components/editor/EditorClient'

interface Props {
  params: { variantId: string }
}

export default async function EditorPage({ params }: Props) {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const variant = await getVariant(params.variantId)

  if (!variant || variant.userId !== user.id) {
    redirect('/dashboard')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('is_pro')
    .eq('id', user.id)
    .single()

  return (
    <EditorClient
      variant={variant}
      isPro={profile?.is_pro ?? false}
    />
  )
}
