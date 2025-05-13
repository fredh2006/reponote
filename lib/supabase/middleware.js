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

  // Get current session and check if it needs refresh
  try {
    // Create a promise that rejects after 5 seconds
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Session check timed out')), 5000);
    });

    // Race between the session check and the timeout
    const { data: { session } } = await Promise.race([
      supabase.auth.getSession(),
      timeoutPromise
    ]);
    
    if (session) {
      const expiresAt = new Date(session.expires_at * 1000);
      const now = new Date();
      const timeUntilExpiry = expiresAt - now;
      
      // If session expires in less than 1 hour, refresh it
      if (timeUntilExpiry < 3600000) {
        try {
          await supabase.auth.refreshSession();
        } catch (error) {
          // If refresh fails, the next getUser() call will handle the redirect
          console.error('Session refresh failed:', error);
        }
      }
    }
  } catch (error) {
    // If session check fails or times out, log the error and continue
    // The getUser() call will handle the redirect if needed
    console.error('Session check failed:', error);
  }

  // Do not run code between createServerClient and supabase.auth.getUser()
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (
    !user &&
    (request.nextUrl.pathname.startsWith('/profile') || request.nextUrl.pathname === '/profile' 
    || request.nextUrl.pathname === '/create' || request.nextUrl.pathname.startsWith('/create')
    || request.nextUrl.pathname === '/pricing' || request.nextUrl.pathname.startsWith('/pricing')
    || request.nextUrl.pathname === '/api' || request.nextUrl.pathname.startsWith('/api'))
  ) {
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return supabaseResponse;
}
