import { redirect } from 'next/navigation'
import { createSupabaseServerClient } from '@/lib/supabase-server'
import { getUserVariants, getUserProfile } from '@/lib/variantService'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth')
  }

  const [variants, profile] = await Promise.all([
    getUserVariants(user.id),
    getUserProfile(user.id),
  ])

  return (
    <DashboardClient
      initialVariants={variants}
      isPro={profile?.isPro ?? false}
      userEmail={profile?.email ?? user.email ?? ''}
    />
  )
}
