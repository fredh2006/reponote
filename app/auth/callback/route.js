import { NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function GET(request) {
const cookieStore = await cookies()
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/'

  if (code) {
    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        {
          cookies: {
            getAll() {
              return cookieStore.getAll()
            },
            setAll(cookiesToSet) {
              try {
                cookiesToSet.forEach(({ name, value, options }) =>
                  cookieStore.set(name, value, options)
                )
              } catch {
              }
            },
          },
        }
      )
    const { data: sessionData, error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error && sessionData?.session) {
      // Get fresh user data from the session
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (!userError && user) {
        // Store GitHub token if available
        const provider_token = sessionData.session?.provider_token || null;
        
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
        
        // Add small delay to ensure session is properly established
        await new Promise(resolve => setTimeout(resolve, 100));
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