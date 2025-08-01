'use client';

import Navbar from "@/components/sections/navbar";
import { Button } from "@/components/ui/button";
import { subscribeAction } from "@/app/actions/stripe";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from '@/components/providers/auth-provider';

export default function PricingPage(){
  const router = useRouter();
  const { user, signInWithGitHub, supabase, refreshUserData } = useAuth();
  const [userPlan, setUserPlan] = useState(null);
  const [isLoadingPortal, setIsLoadingPortal] = useState(false);
  const [paymentType, setPaymentType] = useState('subscription');

  useEffect(() => {
    const getUserPlan = async () => {
      if (user) {
        console.log('User ID:', user.id);
        const { data: userData, error } = await supabase
          .from('users')
          .select('plan')
          .eq('id', user.id);
        
        console.log('Query result:', { userData, error });
        
        if (error) {
          console.error('Database error:', error);
        } else if (userData && userData.length > 0) {
          console.log('User plan:', userData[0].plan);
          setUserPlan(userData[0].plan);
        } else {
          console.log('No user record found in users table');
        }
      } else {
        console.log('No user, setting plan to null');
        setUserPlan(null);
      }
    };
    getUserPlan();
  }, [user, supabase]);

  const handleStripeCheckout = async () => {
    if (!user) {
      handleLogin();
      return;
    }

    const url = await subscribeAction({ 
      userId: user.id,
      paymentType: paymentType
    });
    if (url) { 
      router.push(url);
    } else {
      console.error("Failed to create checkout session");
    }
  };

  const handleManageSubscription = async () => {
    if (!user) {
      handleLogin();
      return;
    }
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

  const handleLogin = async () => {
    try {
      await signInWithGitHub();
    } catch (error) {
      console.error('Login error:', error);
    }
  };

    return(
        <>
            <Navbar />
            <section id="pricing" className="w-full py-8 bg-gray-50 dark:bg-gray-900">
        <div className="w-full px-6 md:px-8 lg:px-12">
          <div className="flex flex-col items-center justify-center space-y-8 text-center">
            <div className="space-y-4">
              <div className="inline-block rounded-lg bg-gray-100 px-4 py-2 text-lg font-medium text-gray-900 dark:bg-gray-800 dark:text-gray-100">Pricing</div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl text-gray-900 dark:text-white">Simple, Transparent Pricing</h2>
              <p className="max-w-[900px] text-gray-600 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed dark:text-gray-300">
                Choose the plan that's right for you or your team.
              </p>
            </div>

            <div className="flex items-center gap-4 bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setPaymentType('subscription')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  paymentType === 'subscription'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Subscription
              </button>
              <button
                onClick={() => setPaymentType('lifetime')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  paymentType === 'lifetime'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Lifetime
              </button>
            </div>
          </div>
          <div className="mx-auto grid max-w-5xl grid-cols-1 gap-8 py-16 md:grid-cols-2 md:max-w-3xl">
            {paymentType === 'subscription' ? (
              <>
                <div className="flex flex-col rounded-xl border bg-white p-8 shadow-lg transition-transform hover:scale-105 dark:bg-gray-800">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Free</h3>
                    <p className="text-gray-600 dark:text-gray-300">For individual developers</p>
                  </div>
                  <div className="mt-4 flex items-baseline text-3xl font-bold text-gray-900 dark:text-white">
                    $0
                    <span className="ml-1 text-base font-medium text-gray-600 dark:text-gray-300">/month</span>
                  </div>
                  <ul className="mt-6 space-y-3 flex-grow">
                    <li className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      5 READMEs per month
                    </li>
                    <li className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Base tier models
                    </li>
                    <li className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      One integration
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Button 
                      disabled={userPlan === 'lifetime'}
                      onClick={!user ? handleLogin : userPlan === 'pro' ? handleManageSubscription : handleLogin}
                      className={`w-full ${userPlan === 'lifetime' ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-gray-900 to-gray-600 hover:bg-gradient-to-r hover:from-gray-900 hover:to-blue-400'} transition-colors`}
                    >
                      {!user ? 'Get Started' : userPlan === 'free' ? 'Get Started' : userPlan === 'pro' ? 'Downgrade Plan' : userPlan === 'lifetime' ? 'Lifetime Access' : 'Get Started'}
                    </Button>
                  </div>
                </div>
                <div className="flex flex-col rounded-xl border bg-white p-8 shadow-lg transition-transform hover:scale-105 dark:bg-gray-800">
                  <div className="space-y-2">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Pro</h3>
                    <p className="text-gray-600 dark:text-gray-300">For professional developers</p>
                  </div>
                  <div className="mt-4 flex flex-col items-baseline text-gray-900 dark:text-white">
                    <div className="flex items-baseline">
                      <span className="text-3xl font-bold">$9</span>
                      <span className="ml-1 text-base font-medium text-gray-600 dark:text-gray-300">/month</span>
                    </div>
                  </div>
                  <ul className="mt-6 space-y-3 flex-grow">
                    <li className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Unlimited READMEs
                    </li>
                    <li className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      Pro-tier models
                    </li>
                    <li className="flex items-center text-gray-600 dark:text-gray-300">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="mr-2 h-4 w-4 text-green-500"
                      >
                        <polyline points="20 6 9 17 4 12"></polyline>
                      </svg>
                      All integrations (coming soon!)
                    </li>
                  </ul>
                  <div className="mt-6">
                    <Button 
                      onClick={handleStripeCheckout}
                      disabled={userPlan === 'pro' || userPlan === 'lifetime'}
                      className={`w-full ${(userPlan === 'pro' || userPlan === 'lifetime') ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-gray-900 to-gray-600 hover:bg-gradient-to-r hover:from-gray-900 hover:to-blue-400'} transition-colors`}
                    >
                      {!user ? 'Get Started' : userPlan === 'pro' ? 'Current Plan' : userPlan === 'lifetime' ? 'Lifetime Access' : 'Upgrade Plan'}
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col rounded-xl border bg-white p-8 shadow-lg transition-transform hover:scale-105 dark:bg-gray-800 md:col-span-2 md:max-w-2xl md:mx-auto">
                <div className="space-y-2">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Lifetime Access</h3>
                  <p className="text-gray-600 dark:text-gray-300">One-time payment, lifetime access</p>
                </div>
                <div className="mt-4 flex items-baseline text-3xl font-bold text-gray-900 dark:text-white">
                  $30
                  <span className="ml-1 text-base font-medium text-gray-600 dark:text-gray-300">/lifetime</span>
                </div>
                <ul className="mt-6 space-y-3 flex-grow">
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Unlimited READMEs forever
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    Pro-tier models
                  </li>
                  <li className="flex items-center text-gray-600 dark:text-gray-300">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="mr-2 h-4 w-4 text-green-500"
                    >
                      <polyline points="20 6 9 17 4 12"></polyline>
                    </svg>
                    No recurring payments
                  </li>
                </ul>
                <div className="mt-6">
                  <Button 
                    onClick={handleStripeCheckout}
                    disabled={userPlan === 'lifetime'}
                    className={`w-full ${userPlan === 'lifetime' ? 'bg-gray-400 cursor-not-allowed' : 'bg-gradient-to-r from-gray-900 to-gray-600 hover:bg-gradient-to-r hover:from-gray-900 hover:to-blue-400'} transition-colors`}
                  >
                    {!user ? 'Get Started' : userPlan === 'lifetime' ? 'Current Plan' : 'Get Lifetime Access'}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>
        </>
    )
}