import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import ProfileClient from './profile-client';

export default async function ProfilePage() {
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
  let repoError = null;

  if (userData?.provider_token) {
    try {
      const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=6', {
        headers: {
          'Authorization': `Bearer ${userData.provider_token}`,
          'Accept': 'application/vnd.github.v3+json'
        },
        next: { revalidate: 60 } // Cache for 60 seconds
      });

      if (response.ok) {
        repos = await response.json();
      } else {
        repoError = 'Failed to fetch repositories';
      }
    } catch (error) {
      console.error('Error fetching repos:', error);
      repoError = 'Failed to fetch repositories';
    }
  } else {
    repoError = 'GitHub access token not found. Please log out and log in again.';
  }

  return <ProfileClient 
    user={user} 
    userData={userData} 
    repos={repos} 
    error={repoError} 
  />;
}