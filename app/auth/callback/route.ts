import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');

  if (code) {
    const supabase = createSupabaseServerClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const returnVariant = searchParams.get('returnVariant');
      return NextResponse.redirect(
        returnVariant
          ? `${origin}/editor/${returnVariant}`
          : `${origin}/dashboard`
      );
    }
  }

  return NextResponse.redirect(`${origin}/auth?error=oauth`);
}
