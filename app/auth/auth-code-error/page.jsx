'use client';

import { Button } from "@/components/ui/button";
import Navbar from "@/components/sections/navbar";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

export default function AuthCodeError() {
  const router = useRouter();
  const supabase = createClient();

  const handleRetry = async () => {
    await supabase.auth.signOut();
    router.push('/');
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Authentication Error
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                There was an error during the authentication process. This could be due to:
              </p>
              <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-6 space-y-2">
                <li>Expired or invalid authentication code</li>
                <li>Missing or invalid GitHub permissions</li>
                <li>Network connectivity issues</li>
              </ul>
              <div className="flex gap-4">
                <Button
                  onClick={handleRetry}
                  className="bg-gray-900 hover:bg-gray-800 text-white"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => router.push('/')}
                  variant="outline"
                >
                  Return Home
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 