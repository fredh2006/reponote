'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { Github } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecentRepos() {
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const supabase = createClient();

  useEffect(() => {
    const fetchRepos = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) throw userError;
        
        // Get the GitHub token from the users table
        const { data: userData, error: userDataError } = await supabase
          .from('users')
          .select('provider_token')
          .eq('id', user.id)
          .single();
        
        if (userDataError) throw userDataError;
        
        const githubToken = userData?.provider_token;
        
        if (!githubToken) {
          setError('GitHub access token not found. Please log out and log in again to grant repository access.');
          return;
        }

        // Fetch both public and private repositories
        const response = await fetch('https://api.github.com/user/repos?sort=updated&per_page=6', {
          headers: {
            'Authorization': `Bearer ${githubToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        });

        if (!response.ok) throw new Error('Failed to fetch repositories');
        
        const data = await response.json();
        setRepos(data);
      } catch (error) {
        console.error('Error fetching repositories:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRepos();
  }, [supabase]);

  const handleReauthenticate = async () => {
    await supabase.auth.signOut();
    window.location.href = '/';
  };

  if (loading) {
    return (
      <div className="w-full py-8">
        <div className="animate-pulse space-y-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-20 bg-gray-200 rounded-lg dark:bg-gray-700"></div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full py-8">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-800 dark:bg-red-900/50">
          <h2 className="text-lg font-medium text-red-800 dark:text-red-200">Unable to fetch repositories</h2>
          <p className="mt-2 text-sm text-red-700 dark:text-red-300">{error}</p>
          <Button
            onClick={handleReauthenticate}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white"
          >
            Re-authenticate with GitHub
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full py-8">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Recent Repositories</h2>
      <div className="grid gap-4">
        {repos.map((repo) => (
          <a
            key={repo.id}
            href={repo.html_url}
            target="_blank"
            rel="noopener noreferrer"
            className="block p-4 rounded-lg border bg-white hover:bg-gray-50 transition-colors dark:bg-gray-800 dark:hover:bg-gray-700 dark:border-gray-700"
          >
            <div className="flex items-center gap-3">
              <Github className="h-5 w-5 text-gray-500" />
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-medium text-gray-900 dark:text-white">{repo.name}</h3>
                  {repo.private && (
                    <span className="px-2 py-0.5 text-xs font-medium bg-gray-100 text-gray-600 rounded-full dark:bg-gray-700 dark:text-gray-300">
                      Private
                    </span>
                  )}
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{repo.description || 'No description'}</p>
              </div>
            </div>
            <div className="mt-2 flex gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{repo.language || 'Unknown'}</span>
              <span>⭐ {repo.stargazers_count}</span>
              <span>🔀 {repo.forks_count}</span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
} 