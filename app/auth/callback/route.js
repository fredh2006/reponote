import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export async function GET(request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code);
    
    if (!error && session) {
      // Get the user from the session
      const user = session.user;
      
      if (user) {
        // Store GitHub token if available
        const provider_token = session.provider_token || null;
        
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

        if (checkError || !existingUser) {
          const { error: upsertError } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.email,
              github_username: user.user_metadata.user_name,
              plan: 'free',
              provider_token: provider_token
            })

          if (upsertError) {
            console.error('Error storing user data:', upsertError)
          }
        } else if (provider_token) {
          // Update existing user with provider token
          const { error: updateError } = await supabase
            .from('users')
            .update({ provider_token: provider_token })
            .eq('id', user.id)
            
          if (updateError) {
            console.error('Error updating provider token:', updateError)
          }
        }
        
      }

      const forwardedHost = request.headers.get('x-forwarded-host') // original origin before load balancer
      const isLocalEnv = process.env.NODE_ENV === 'development'
      if (isLocalEnv) {
        // we can be sure that there is no load balancer in between, so no need to watch for X-Forwarded-Host
        return NextResponse.redirect(`${origin}${next}`)
      } else if (forwardedHost) {
        return NextResponse.redirect(`https://${forwardedHost}${next}`)
      } else {
        return NextResponse.redirect(`${origin}${next}`)
      }
    }
  }

  // return the user to an error page with instructions
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}