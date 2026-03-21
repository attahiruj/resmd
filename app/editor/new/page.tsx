'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';
import { DEFAULT_RESUME_CONTENT } from '@/lib/defaultContent';

export default function EditorNewPage() {
  const router = useRouter();

  useEffect(() => {
    const init = async () => {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      // Real (non-anonymous) users go to dashboard
      if (user && !user.is_anonymous) {
        router.replace('/dashboard');
        return;
      }

      // Sign in anonymously if no session at all
      if (!user) {
        const { error } = await supabase.auth.signInAnonymously();
        if (error) {
          console.error('Anonymous sign-in failed:', error.message);
          return;
        }
      }

      // Create a variant for this guest session
      const res = await fetch('/api/resumes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'My Resume',
          rawContent: DEFAULT_RESUME_CONTENT,
          templateId: 'minimal',
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => null);
        if (body?.code === 'guest_limit_reached') {
          // Guest already has a resume — redirect to it
          const listRes = await fetch('/api/resumes');
          if (listRes.ok) {
            const { data: resumes } = await listRes.json();
            if (resumes?.length) {
              router.replace(`/editor/${resumes[0].id}`);
              return;
            }
          }
        }
        console.error('Failed to create guest resume:', body);
        return;
      }

      const { data: resume } = await res.json();
      router.replace(`/editor/${resume.id}`);
    };

    init();
  }, [router]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
    </div>
  );
}
