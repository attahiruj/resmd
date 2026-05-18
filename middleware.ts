import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function middleware(request: NextRequest) {
  if (request.nextUrl.pathname !== '/') {
    return NextResponse.next();
  }

  const isLocalMode = process.env.NEXT_PUBLIC_DB_PROVIDER === 'local';

  if (isLocalMode) {
    // Local mode: use cookie existence as a lightweight heuristic.
    // The dashboard server component will do the real auth check.
    if (request.cookies.has('local_session')) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
    return NextResponse.next();
  }

  // Supabase mode: fast path — skip network call if no session cookie present
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseKey) return NextResponse.next();

  const hasSessionCookie = request.cookies
    .getAll()
    .some((c) => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));
  if (!hasSessionCookie) return NextResponse.next();

  // Has a session cookie — verify it and redirect authenticated users
  const response = NextResponse.next({
    request: { headers: request.headers },
  });

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value, options } of cookiesToSet) {
          response.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user && !user.is_anonymous) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/'],
};
