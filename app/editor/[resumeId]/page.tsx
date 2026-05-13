import { redirect } from 'next/navigation';
import { getServerAuthProvider } from '@/lib/db/server';
import { getResume } from '@/lib/resumeService';
import EditorClient from '@/components/editor/EditorClient';

interface Props {
  params: Promise<{ resumeId: string }>;
}

export default async function EditorPage({ params }: Props) {
  const { resumeId } = await params;
  const user = await getServerAuthProvider().getUser();

  if (!user) {
    redirect('/auth');
  }

  const resume = await getResume(resumeId);

  if (!resume || resume.userId !== user.id) {
    redirect('/dashboard');
  }

  return <EditorClient resume={resume} isGuest={user.is_anonymous ?? false} />;
}
