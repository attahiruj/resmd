import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { getUserResumes, getUserProfile } from '@/lib/resumeService';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const supabase = createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || user.is_anonymous) {
    redirect('/auth');
  }

  const [resumes, profile] = await Promise.all([
    getUserResumes(user.id),
    getUserProfile(user.id),
  ]);

  return (
    <DashboardClient
      initialResumes={resumes}
      userEmail={profile?.email ?? user.email ?? ''}
    />
  );
}
