'use client';

import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ProfileMenu } from "@/components/ui/profile-menu";

export default function Navbar({sticky = true}) {
  const [user, setUser] = useState(null);
  const supabase = createClient();
  const pathname = usePathname();
  const isHomePage = pathname === '/';


  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user }, error } = await supabase.auth.getUser();

        if (user) {
          console.log("✅ Logged in user:", user);
          setUser(user);
        } else if (error && error.message !== "Auth session missing!") {
          console.error("Failed to fetch user:", error.message);
        }
      } catch (error) {
        
        if (error.message !== "Auth session missing!") {
          console.error("Error fetching user:", error.message);
        }
      }
    };

    getUser();

    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase]);

  const handleLogin = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        queryParams: {
          prompt: 'consent',
        },
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });

    if (error) {
      console.error('Error:', error.message);
    }
  };

  return (
    <header className={`border-b w-full bg-white/80 backdrop-blur-sm ${sticky ? 'sticky top-0' : ''} z-50`}>
      <div className="w-full flex h-16 items-center justify-between px-6 md:px-8 lg:px-12">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <FileText className="h-6 w-6 text-gray-900" />
            <span className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-500 bg-clip-text text-transparent">Reponote</span>
          </Link>
        </div>
        <nav className="hidden md:flex gap-8">
          {user ? (
            <>
              <Link href="/product" className="text-sm font-medium hover:text-gray-900 hover:underline underline-offset-4 transition-colors">
                Create
              </Link>
              <Link href="/templates" className="text-sm font-medium hover:text-gray-900 hover:underline underline-offset-4 transition-colors">
                Templates
              </Link>
              <Link href="/pricing" className="text-sm font-medium hover:text-gray-900 hover:underline underline-offset-4 transition-colors">
                Pricing
              </Link>
            </>
          ) : (
            <>
              <Link href={isHomePage ? "#features" : "/#features"} className="text-sm font-medium hover:text-gray-900 hover:underline underline-offset-4 transition-colors">
                Features
              </Link>
              <Link href={isHomePage ? "#how-it-works" : "/#how-it-works"} className="text-sm font-medium hover:text-gray-900 hover:underline underline-offset-4 transition-colors">
                How It Works
              </Link>
              <Link href={isHomePage ? "#pricing" : "/#pricing"} className="text-sm font-medium hover:text-gray-900 hover:underline underline-offset-4 transition-colors">
                Pricing
              </Link>
            </>
          )}
        </nav>
        <div className="flex items-center gap-4">
          {user ? (
            <ProfileMenu />
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
    </header>
  );
}
