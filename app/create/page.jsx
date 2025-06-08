'use client';

import Navbar from "@/components/sections/navbar";
import { useEffect, useState } from "react";
import { Search, Loader2, FolderGit2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function Create(){
    const router = useRouter();
    const supabase = createClient();

    const [repos, setRepos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [user, setUser] = useState(null);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserAndRepos = async () => {
            try {
                const { data: { user }, error: userError } = await supabase.auth.getUser();
                
                if (userError) throw userError;
                
                setUser(user);
                
                const { data: userData, error: userDataError } = await supabase
                    .from('users')
                    .select('*')
                    .eq('id', user.id)
                    .single();
                
                if (userDataError) throw userDataError;
                
                const provider_token = userData?.provider_token;

                console.log(provider_token)
                
                if (!provider_token) {
                    setError('GitHub access token not found. Please log out and log in again to grant repository access.');
                    return;
                }

                const timeoutPromise = new Promise((_, reject) => {
                    setTimeout(() => reject(new Error('Request timed out')), 10000);
                });

                const response = await Promise.race([
                    fetch('https://api.github.com/user/repos?sort=updated&per_page=100', {
                        headers: {
                            'Authorization': `Bearer ${provider_token}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    }),
                    timeoutPromise
                ]);
        
                if (!response.ok) throw new Error('Failed to fetch repositories');
                
                const data = await response.json();
                setRepos(data);
            } catch (error) {
                console.error('Error:', error);
                if (error.message === 'Request timed out') {
                    setError('Request took too long. Please try logging in again.');
                } else {
                    setError(error.message);
                }
            } finally {
                setLoading(false);
            }
        };
    
        fetchUserAndRepos();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_OUT') {
                router.push('/');
            }
        });

        return () => {
            subscription?.unsubscribe();
        };
    }, [supabase, router]);

    const filteredRepos = repos.filter(repo =>
        repo.name.toLowerCase().includes(search.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(search.toLowerCase()))
      )
    
      const handleRepoSelect = (repo) => {
        const repoPath = encodeURIComponent(repo.full_name)
        router.push(`/create/${repoPath}`)
      }

      if (loading) {
        return (
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        )
      }

      return (
        <>
          <Navbar sticky={false} />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                <div className="p-6">
                  <div className="mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Select a Repository</h1>
                    <p className="text-gray-600 mt-1">Edit its README</p>
                  </div>
    
                  <div className="relative mb-6">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <input
                      type="text"
                      placeholder="Search repositories..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
    
                  {loading? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-gray-900" />
                    </div>
                  ) : filteredRepos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <FolderGit2 className="w-12 h-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900">No repositories found</h3>
                      <p className="text-gray-500 mt-1">
                        {search ? 'No repositories match your search' : 'You don\'t have any repositories yet'}
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {filteredRepos.map((repo) => (
                        <div
                          key={repo.id}
                          onClick={() => handleRepoSelect(repo)}
                          className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 cursor-pointer transition-all duration-200 hover:shadow-md"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="font-medium text-gray-900">{repo.name}</h3>
                              <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                {repo.description || 'No description'}
                              </p>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span>{repo.language || 'Unknown'}</span>
                              <span>•</span>
                              <span>{repo.stargazers_count} stars</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </>
      )
}
