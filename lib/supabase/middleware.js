import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => {
            request.cookies.set(name, value);
          });

          supabaseResponse = NextResponse.next({ request });

          cookiesToSet.forEach(({ name, value, options }) => {
            supabaseResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  // Do not run code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect profile route
  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/profile') || request.nextUrl.pathname === '/profile' 
    || request.nextUrl.pathname === '/create' || request.nextUrl.pathname.startsWith('/create')
    || request.nextUrl.pathname === '/pricing' || request.nextUrl.pathname.startsWith('/pricing')
    || request.nextUrl.pathname === '/api/auth/callback' || request.nextUrl.pathname.startsWith('/api/auth/callback'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
