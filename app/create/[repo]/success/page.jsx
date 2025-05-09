'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { CheckCircle, ArrowRight, Github, ExternalLink } from 'lucide-react'
import Navbar from '@/components/sections/navbar'
import { Button } from '@/components/ui/button'
import { createClient } from '@/lib/supabase/client'

export default function SuccessPage() {
  const router = useRouter()
  const { repo } = useParams()
  const decodedRepo = decodeURIComponent(repo)
  const supabase = createClient()

  useEffect(() => {
    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        router.push('/');
      }
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [supabase, router]);

  return (
    <>
      <Navbar sticky={false} />
      <div className="min-h-[calc(100vh-4rem)] bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-12">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
              <div className="p-8 text-center">
                <div className="flex justify-center mb-8">
                  <div className="relative">
                    <div className="absolute inset-0 bg-green-100 dark:bg-green-900/30 rounded-full animate-ping"></div>
                    <CheckCircle className="relative w-20 h-20 text-green-500 dark:text-green-400" />
                  </div>
                </div>
                
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                  README Created Successfully!
                </h1>
                
                <p className="text-gray-600 dark:text-gray-300 mb-2">
                  Your README has been created for
                </p>
                <p className="text-lg font-semibold text-gray-900 dark:text-white mb-8">
                  {decodedRepo}
                </p>

                <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                  <Button
                    onClick={() => window.open(`https://github.com/${decodedRepo}`, '_blank')}
                    className="bg-gray-900 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                  >
                    <Github className="w-5 h-5" />
                    View on GitHub
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>

                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <Button
                    onClick={() => router.push(`/create/${repo}`)}
                    className="bg-green-600 hover:bg-green-700 text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2"
                  >
                    Edit README
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                  <Button
                    onClick={() => router.push('/create')}
                    variant="outline"
                    className="border-2 border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white font-medium px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    Select Another Repository
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-8 text-center">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Want to create more READMEs? Check out our other features!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}