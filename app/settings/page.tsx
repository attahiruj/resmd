import { redirect } from 'next/navigation';
import { getServerAuthProvider } from '@/lib/db/server';
import { getCachedUserProfile } from '@/lib/resumeService';
import SettingsClient from '@/components/settings/SettingsClient';

export default async function SettingsPage() {
  const user = await getServerAuthProvider().getUser();

  if (!user || user.is_anonymous) {
    redirect('/auth');
  }

  const profile = await getCachedUserProfile(user.id);

  return (
    <SettingsClient
      userEmail={profile?.email ?? user.email ?? ''}
      userId={user.id}
      memberSince={profile?.createdAt ?? ''}
    />
  );
}
