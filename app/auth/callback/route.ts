import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  if (process.env.DB_PROVIDER === 'local') {
    return NextResponse.redirect(`${origin}/auth?error=oauth_not_supported`);
  }

  const code = searchParams.get('code');

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const returnResume = searchParams.get('returnResume');
      return NextResponse.redirect(
        returnResume
          ? `${origin}/editor/${returnResume}`
          : `${origin}/dashboard`
      );
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=oauth`);
}
