'use client';

import Navbar from "@/components/sections/navbar";
import { useState } from "react";
import { Search, Loader2, FolderGit2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from '@/components/providers/auth-provider';

export default function CreateClient({ user, initialRepos, error: initialError }) {
    const router = useRouter();
    const { signOut } = useAuth();
    const [repos] = useState(initialRepos);
    const [search, setSearch] = useState('');
    const [error] = useState(initialError);

    const filteredRepos = repos.filter(repo =>
        repo.name.toLowerCase().includes(search.toLowerCase()) ||
        (repo.description && repo.description.toLowerCase().includes(search.toLowerCase()))
    );
    
    const handleRepoSelect = (repo) => {
        const repoPath = encodeURIComponent(repo.full_name);
        router.push(`/create/${repoPath}`);
    };

    const handleReauthenticate = async () => {
        await signOut();
    };

    if (error) {
        return (
            <>
                <Navbar sticky={false} />
                <div className="container mx-auto px-4 py-8">
                    <div className="max-w-4xl mx-auto">
                        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                            <div className="p-6">
                                <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                                    <h2 className="text-lg font-medium text-red-800">Unable to fetch repositories</h2>
                                    <p className="mt-2 text-sm text-red-700">{error}</p>
                                    <button
                                        onClick={handleReauthenticate}
                                        className="mt-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
                                    >
                                        Re-authenticate with GitHub
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </>
        );
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

                            {filteredRepos.length === 0 ? (
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
    );
}