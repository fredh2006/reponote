import { NextResponse } from 'next/server'
// The client you created from the Server-Side Auth instructions
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
            } catch (error) {
              console.error('Error setting cookies:', error)
            }
          },
        },
      }
    )

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) {
        console.error('Error exchanging code for session:', error)
        return NextResponse.redirect(`${origin}/auth/auth-code-error`)
      }

      // Get the user after successful authentication
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError) {
        console.error('Error getting user:', userError)
        return NextResponse.redirect(`${origin}/auth/auth-code-error`)
      }

      if (user) {
        // Get the session to access the provider token
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.provider_token) {
          console.error('No provider token in session')
          return NextResponse.redirect(`${origin}/auth/auth-code-error`)
        }

        // Check if user already exists in the users table
        const { data: existingUser, error: checkError } = await supabase
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single()

        // Only store user data if they don't already exist
        if (checkError || !existingUser) {
          const { error: upsertError } = await supabase
            .from('users')
            .upsert({
              id: user.id,
              email: user.email,
              github_username: user.user_metadata.user_name,
              plan: 'free',
              provider_token: session.provider_token
            })

          if (upsertError) {
            console.error('Error storing user data:', upsertError)
            return NextResponse.redirect(`${origin}/auth/auth-code-error`)
          }
        } else {
          // Update the provider token for existing users
          const { error: updateError } = await supabase
            .from('users')
            .update({ provider_token: session.provider_token })
            .eq('id', user.id)

          if (updateError) {
            console.error('Error updating provider token:', updateError)
            return NextResponse.redirect(`${origin}/auth/auth-code-error`)
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
    } catch (error) {
      console.error('Unexpected error in auth callback:', error)
      return NextResponse.redirect(`${origin}/auth/auth-code-error`)
    }
  }

  // If no code is present, redirect to error page
  return NextResponse.redirect(`${origin}/auth/auth-code-error`)
}