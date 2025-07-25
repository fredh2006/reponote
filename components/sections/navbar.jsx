'use client';

import Link from "next/link";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { ProfileMenu } from "@/components/ui/profile-menu";
import Image from "next/image";
import { useAuth } from '@/components/providers/auth-provider';

export default function Navbar({ sticky = true }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { user, loading, signInWithGitHub, signOut } = useAuth();
  const pathname = usePathname();
  const isHomePage = pathname === '/';

  const handleLogin = async () => {
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <header className={`border-b w-full bg-white/80 backdrop-blur-sm ${sticky ? 'sticky top-0' : ''} z-50`}>
      <div className="w-full flex h-16 items-center px-4 md:px-8 lg:px-12 justify-between relative">

        <div className="flex items-center">
          <Link href="/" className="flex items-center -space-x-1">
            <Image
              src="/logo.png"
              alt="Reponote Logo"
              width={48}
              height={48}
              className="h-12 w-auto"
            />
            <span className="text-2xl font-bold bg-gradient-to-r from-gray-900 to-gray-500 bg-clip-text text-transparent">Reponote</span>
          </Link>
        </div>

        <nav className="hidden md:flex gap-8 absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          {user ? (
            <>
              <Link href="/create" className="text-sm font-medium hover:text-gray-900 hover:underline underline-offset-4 transition-colors">Create</Link>
              <Link href="/docs" className="text-sm font-medium hover:text-gray-900 hover:underline underline-offset-4 transition-colors">Docs</Link>
              <Link href="/pricing" className="text-sm font-medium hover:text-gray-900 hover:underline underline-offset-4 transition-colors">Pricing</Link>
            </>
          ) : (
            <>
              <Link href={isHomePage ? "#features" : "/#features"} className="text-sm font-medium hover:text-gray-900 hover:underline underline-offset-4 transition-colors">Features</Link>
              <Link href={isHomePage ? "#how-it-works" : "/#how-it-works"} className="text-sm font-medium hover:text-gray-900 hover:underline underline-offset-4 transition-colors">How It Works</Link>
              <Link href={isHomePage ? "#pricing" : "/#pricing"} className="text-sm font-medium hover:text-gray-900 hover:underline underline-offset-4 transition-colors">Pricing</Link>
              <Link href="/docs" className="text-sm font-medium hover:text-gray-900 hover:underline underline-offset-4 transition-colors">Docs</Link>
            </>
          )}
        </nav>

        <div className="flex items-center gap-4 md:w-[200px] md:justify-end">
          {user ? (
            <>
              <div className="md:hidden">
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="p-4"
                  aria-label="Toggle menu"
                >
                  {isMobileMenuOpen ? (
                    <X className="h-7 w-7 text-gray-800" />
                  ) : (
                    <Menu className="h-7 w-7 text-gray-800" />
                  )}
                </button>
              </div>
              <div className="hidden md:block">
                <ProfileMenu />
              </div>
            </>
          ) : (
            <Button 
              size="sm" 
              className="bg-gray-900 hover:bg-gray-800 transition-colors"
              onClick={handleLogin}
            >
              Log In
            </Button>
          )}
        </div>
      </div>

      {isMobileMenuOpen && user && (
        <div className="md:hidden border-t">
          <div className="px-4 py-4 space-y-4">

            <div className="flex items-center gap-3 px-2 py-2 border-b border-gray-100">
              <img
                src={user.user_metadata.avatar_url}
                alt={user.user_metadata.full_name || user.user_metadata.user_name}
                className="w-10 h-10 rounded-full"
              />
              <div>
                <p className="text-sm font-medium text-gray-900">
                  {user.user_metadata.full_name || user.user_metadata.user_name}
                </p>
                <p className="text-xs text-gray-500">@{user.user_metadata.user_name}</p>
              </div>
            </div>

            <div className="space-y-2">
              <Link href="/create" className="block px-2 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:underline underline-offset-4 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Create</Link>
              <Link href="/docs" className="block px-2 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:underline underline-offset-4 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Docs</Link>
              <Link href="/pricing" className="block px-2 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:underline underline-offset-4 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
              <Link href="/profile" className="block px-2 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:underline underline-offset-4 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>View Profile</Link>
              <a href={`https://github.com/${user.user_metadata.user_name}`} target="_blank" rel="noopener noreferrer" className="block px-2 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:underline underline-offset-4 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>GitHub Profile</a>
              <Button 
                variant="ghost" 
                className="w-full justify-start px-2 py-2 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => {
                  handleLogout();
                  setIsMobileMenuOpen(false);
                }}
              >
                Log out
              </Button>
            </div>
          </div>
        </div>
      )}

      {isMobileMenuOpen && !user && (
        <div className="md:hidden border-t">
          <div className="px-4 py-4 space-y-2">
            <Link href={isHomePage ? "#features" : "/#features"} className="block px-2 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:underline underline-offset-4 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Features</Link>
            <Link href={isHomePage ? "#how-it-works" : "/#how-it-works"} className="block px-2 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:underline underline-offset-4 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>How It Works</Link>
            <Link href="/docs" className="block px-2 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:underline underline-offset-4 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Docs</Link>
            <Link href={isHomePage ? "#pricing" : "/#pricing"} className="block px-2 py-2 text-base font-medium text-gray-700 hover:text-gray-900 hover:underline underline-offset-4 transition-colors" onClick={() => setIsMobileMenuOpen(false)}>Pricing</Link>
          </div>
        </div>
      )}
    </header>
  );
}
