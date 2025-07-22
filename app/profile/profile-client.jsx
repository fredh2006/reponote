'use client';

import Navbar from "@/components/sections/navbar";
import { Star, GitFork, Eye, FolderGit2, CreditCard, Crown, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/providers/auth-provider';

export default function ProfileClient({ user, userData, repos, error }) {
    const router = useRouter();
    const { signOut } = useAuth();
    const [isLoadingPortal, setIsLoadingPortal] = useState(false);

    const handleReauthenticate = async () => {
        await signOut();
    };

    const handleManageSubscription = async () => {
        try {
            setIsLoadingPortal(true);
            const response = await fetch('/api/stripe/billing-portal', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId: user.id }),
            });

            if (!response.ok) {
                throw new Error('Failed to create billing portal session');
            }

            const { url } = await response.json();
            window.location.href = url;
        } catch (error) {
            console.error('Error opening customer portal:', error);
        } finally {
            setIsLoadingPortal(false);
        }
    };

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
                <Navbar />
                <main className="container mx-auto px-4 py-8">
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
                </main>
            </div>
        );
    }

    return (
        <>
            <Navbar sticky={false} />
            <div className="container mx-auto px-4 py-8">
                <div className="max-w-4xl mx-auto">
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 p-4 sm:p-6">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-4">
                                    <img
                                        src={user?.user_metadata?.avatar_url}
                                        alt={user?.user_metadata?.user_name || 'User'}
                                        className="w-20 h-20 sm:w-24 sm:h-24 rounded-full ring-4 ring-white/20 shadow-lg"
                                    />
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <h1 className="text-xl sm:text-2xl font-bold text-white">{user?.user_metadata?.full_name || user?.user_metadata?.user_name || 'User'}</h1>
                                            {userData?.plan === 'lifetime' ? (
                                                <div className="flex items-center gap-1 text-purple-400">
                                                    <Crown className="w-5 h-5" />
                                                    <span className="text-sm font-medium">Lifetime Pro</span>
                                                </div>
                                            ) : userData?.plan === 'pro' ? (
                                                <div className="flex items-center gap-1 text-amber-400">
                                                    <Crown className="w-5 h-5" />
                                                    <span className="text-sm font-medium">Pro</span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-1 text-gray-400">
                                                    <User className="w-5 h-5" />
                                                    <span className="text-sm font-medium">Free</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-gray-300 text-base sm:text-base">@{user?.user_metadata?.user_name}</p>
                                        <p className="text-gray-400 text-sm sm:text-sm mt-1">ID: {user?.id}</p>
                                    </div>
                                </div>
                                {userData?.plan !== 'lifetime' && (
                                    <Button
                                        onClick={userData?.plan === 'free' ? () => router.push('/pricing') : handleManageSubscription}
                                        variant="outline"
                                        className="flex items-center gap-2 whitespace-nowrap text-sm sm:text-base"
                                        disabled={isLoadingPortal}
                                    >
                                        <CreditCard className="w-5 h-5" />
                                        <span className="hidden sm:inline">
                                            {userData?.plan === 'free' ? 'Upgrade Plan' : 'Manage Subscription'}
                                        </span>
                                        <span className="sm:hidden">
                                            {userData?.plan === 'free' ? 'Upgrade' : 'Manage'}
                                        </span>
                                    </Button>
                                )}
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 space-y-8">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <h2 className="text-lg font-semibold text-gray-900">Recent Repositories</h2>
                                    <a
                                        href={`https://github.com/${user?.user_metadata?.user_name}?tab=repositories`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-gray-600 hover:text-gray-900 transition-colors"
                                    >
                                        View all repositories →
                                    </a>
                                </div>
                                
                                {repos.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-center">
                                        <FolderGit2 className="w-12 h-12 text-gray-400 mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900">No repositories yet</h3>
                                        <p className="text-gray-500 mt-1">You don't have any repositories on GitHub</p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {repos.map((repo) => (
                                            <a
                                                key={repo.id}
                                                href={repo.html_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="block bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-all duration-200 shadow-sm hover:shadow-md"
                                            >
                                                <h3 className="font-medium text-gray-900 mb-2">{repo.name}</h3>
                                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{repo.description || 'No description'}</p>
                                                <div className="flex items-center gap-4 text-sm text-gray-500">
                                                    <div className="flex items-center gap-1">
                                                        <Star className="w-4 h-4" />
                                                        <span>{repo.stargazers_count}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <GitFork className="w-4 h-4" />
                                                        <span>{repo.forks_count}</span>
                                                    </div>
                                                    <div className="flex items-center gap-1">
                                                        <Eye className="w-4 h-4" />
                                                        <span>{repo.watchers_count}</span>
                                                    </div>
                                                </div>
                                            </a>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}