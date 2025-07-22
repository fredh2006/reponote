import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';

export async function updateSession(request) {
  // Create response that will have new cookies
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get(name) {
          return request.cookies.get(name)?.value;
        },
        set(name, value, options) {
          // Set the cookie on both request and response
          request.cookies.set({
            name,
            value,
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value,
            ...options,
          });
        },
        remove(name, options) {
          // Remove the cookie from both request and response
          request.cookies.set({
            name,
            value: '',
            ...options,
          });
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          });
          response.cookies.set({
            name,
            value: '',
            ...options,
          });
        },
      },
    }
  );

  // Refresh session if it exists
  const { data: { session } } = await supabase.auth.getSession();

  // Debug logging
  if (process.env.NODE_ENV === 'development') {
    console.log('Middleware - Path:', request.nextUrl.pathname);
    console.log('Middleware - Session:', session ? 'exists' : 'null');
  }

  // List of protected routes
  const protectedPaths = ['/profile', '/create', '/pricing'];
  const isProtectedRoute = protectedPaths.some(path => 
    request.nextUrl.pathname === path || request.nextUrl.pathname.startsWith(path + '/')
  );

  // Skip API routes and auth callback from auth check
  const isApiRoute = request.nextUrl.pathname.startsWith('/api');
  const isAuthCallback = request.nextUrl.pathname.startsWith('/auth/callback');

  if (!session && isProtectedRoute && !isApiRoute && !isAuthCallback) {
    console.log('Middleware - Redirecting to home, no session for protected route');
    const url = request.nextUrl.clone();
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  return response;
}
