import { redirect } from 'next/navigation';
import { getServerAuthProvider } from '@/lib/db/server';
import {
  getCachedUserResumes,
  getCachedUserProfile,
} from '@/lib/resumeService';
import DashboardClient from '@/components/dashboard/DashboardClient';

export default async function DashboardPage() {
  const user = await getServerAuthProvider().getUser();

  if (!user || user.is_anonymous) {
    redirect('/auth');
  }

  const [resumes, profile] = await Promise.all([
    getCachedUserResumes(user.id),
    getCachedUserProfile(user.id),
  ]);

  return (
    <DashboardClient
      initialResumes={resumes}
      userEmail={profile?.email ?? user.email ?? ''}
    />
  );
}
