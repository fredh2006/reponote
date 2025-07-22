import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import CreateClient from './create-client';

export default async function CreatePage() {
  const supabase = await createClient();
  
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/');
  }

  // Fetch user data from database
  const { data: userData } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single();

  // Fetch repositories if provider token exists
  let repos = [];
  let error = null;

  if (userData?.provider_token) {
    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
        headers: {
          'Authorization': `Bearer ${userData.provider_token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        next: { revalidate: 60 } // Cache for 60 seconds
      });

      if (response.ok) {
        repos = await response.json();
      } else {
        error = 'Failed to fetch repositories';
      }
    } catch (err) {
      console.error('Error fetching repos:', err);
      error = 'Failed to fetch repositories';
    }
  } else {
    error = 'GitHub access token not found. Please log out and log in again to grant repository access.';
  }

  return <CreateClient user={user} initialRepos={repos} error={error} />;
}