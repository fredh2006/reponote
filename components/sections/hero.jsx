'use client';

import { Button } from "../ui/button";
import { ArrowRight, Github } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function Hero(){
    const supabase = createClient();
    const router = useRouter();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);
        };
        getUser();
    }, []);

    const handleLogin = async () => {
        const { data, error } = await supabase.auth.signInWithOAuth({
            provider: 'github',
            options: {
                scopes: 'repo user:email',
                queryParams: {
                    prompt: 'consent',
                },
                redirectTo: `${window.location.origin}/auth/callback`,
                skipBrowserRedirect: false
            }
        });

        if (error) {
            console.error('Error:', error.message);
        }
    };

    const handleCreate = () => {
        router.push('/create');
    };

    return(
        <section id = "hero" className="w-full py-16 md:py-28 lg:py-36 bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
          <div className="w-full px-6 md:px-8 lg:px-12">
            <div className="grid gap-8 lg:grid-cols-[1fr_400px] lg:gap-16 xl:grid-cols-[1fr_600px]">
              <div className="flex flex-col justify-center space-y-6">
                <div className="inline-block rounded-lg bg-gray-100 px-4 py-2 text-lg font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100">
                  {user ? 'Welcome to Reponote' : 'Introducing Reponote'}
                </div>
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl xl:text-6xl/none bg-gradient-to-r from-gray-900 to-gray-400 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
                  Generate Detailed READMEs with AI
                </h1>
                <p className="max-w-[600px] text-gray-600 md:text-xl dark:text-gray-300">
                  Reponote leverages AI to create professional, comprehensive README files for your projects in
                  seconds.
                </p>
                <div className="flex flex-col gap-4 min-[400px]:flex-row">
                  <Button 
                    size="lg" 
                    className="bg-gray-900 hover:bg-blue-400 transition-colors gap-2"
                    onClick={user ? handleCreate : handleLogin}
                  >
                    {user ? 'Create ' : 'Get Started'} <ArrowRight className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="lg" className="hover:bg-gray-100 hover:text-gray-900 transition-colors gap-2">
                    <Github className="h-4 w-4" /> View on GitHub
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-center">
                <div className="relative w-full max-w-[500px] rounded-xl border bg-white p-6 shadow-xl dark:bg-gray-800">
                  <div className="flex items-center gap-2 border-b pb-3">
                    <div className="h-3 w-3 rounded-full bg-red-500"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <div className="ml-2 text-sm font-medium text-gray-600 dark:text-gray-300">README.md</div>
                  </div>
                  <div className="mt-4 space-y-4 font-mono text-sm">
                    <h1 className="text-xl font-bold text-gray-900 dark:text-white"># Project Name</h1>
                    <p className="text-gray-600 dark:text-gray-300">A brief description of what this project does and who it's for.</p>
                    <div className="text-gray-500 dark:text-gray-400">## Installation</div>
                    <div className="text-gray-500 dark:text-gray-400">## Features</div>
                    <div className="text-gray-500 dark:text-gray-400">## Usage</div>
                    <div className="text-gray-500 dark:text-gray-400">## API Reference</div>
                    <div className="text-gray-500 dark:text-gray-400">## Contributing</div>
                    <div className="text-gray-500 dark:text-gray-400">## License</div>
                    <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white to-transparent dark:from-gray-800"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
    )
}