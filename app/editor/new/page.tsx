'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase';

const DEFAULT_CONTENT = `# Bio
Name: Amara Osei
Title: Full Stack Engineer
Email: amara@example.com
Location: Lagos, Nigeria
GitHub: github.com/amaraosei
LinkedIn: linkedin.com/in/amaraosei

# Summary
Full stack engineer with 4 years building products across fintech and edtech.
Strong backend focus with React on the frontend. Passionate about developer tooling.

# Experience
## Senior Engineer @ Paystack | 2022 – Present
- Architected a transaction reconciliation service processing ₦2B daily
- Reduced API response time by 60% through query optimization and caching
- Mentored 3 junior engineers through a structured onboarding program

## Software Engineer @ Andela | 2020 – 2022
- Built React component library used across 12 client projects
- Led migration from REST to GraphQL, reducing over-fetching by 40%

# Education
## B.Sc Computer Science @ University of Lagos | 2016 – 2020
First Class Honours. Final year project: real-time collaborative code editor.

# Skills
Languages: TypeScript, Python, Go
Frontend: React, Next.js, Tailwind CSS
Backend: Node.js, FastAPI, PostgreSQL, Redis
Infrastructure: Docker, AWS, GitHub Actions

# Projects
## resmd | github.com/amara/resmd | 2024
Plain-text resume builder with live preview and AI enhancement.
- Built parser in TypeScript with zero dependencies
- 300+ GitHub stars in 6 weeks after launch

# Certifications
AWS Solutions Architect Associate | Amazon | 2023`;

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
      const res = await fetch('/api/variants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'My Resume',
          rawContent: DEFAULT_CONTENT,
          templateId: 'minimal',
        }),
      });

      if (!res.ok) {
        console.error('Failed to create guest variant:', await res.text());
        return;
      }

      const { data: variant } = await res.json();
      router.replace(`/editor/${variant.id}`);
    };

    init();
  }, [router]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-accent border-t-transparent rounded-full" />
    </div>
  );
}
