'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Activity, Zap } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const email = e.target.email.value;
      const password = e.target.password.value;

      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError(data.error || 'Authentication failed');
        setLoading(false);
      }
    } catch (err) {
      setError('An unexpected error occurred');
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-[#0B192C]">
      {/* Left Form Section */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-16 md:px-24 xl:px-32 relative">
        {/* Brand */}
        <div className="absolute top-8 left-8 sm:left-16 md:left-24 xl:left-32">
          <Link href="/" className="flex items-center gap-2 font-bold text-2xl tracking-tight text-slate-900 dark:text-white">
            <Activity className="h-6 w-6 text-primary" />
            PaySynapse
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto space-y-8">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
              Sign in to your account to access your reconciliation dashboard.
            </p>
            {error && (
              <div className="mt-4 p-3 rounded bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center">
                <ShieldCheck className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSignIn} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  defaultValue="ops@demo.paysynapse.com"
                  className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-[#111c3a] border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <a href="#" className="text-sm font-medium text-primary hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  type="password"
                  name="password"
                  defaultValue="password123"
                  className="w-full px-4 py-3 rounded-lg border bg-white dark:bg-[#111c3a] border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-primary text-slate-900 dark:text-white"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3 px-4 rounded-lg bg-primary hover:bg-primary/90 text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-70"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-50 dark:bg-[#0B192C] text-slate-500">Or continue with</span>
            </div>
          </div>

          <button
            onClick={handleSignIn}
            type="button"
            className="w-full flex items-center justify-center py-3 px-4 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#111c3a] hover:bg-slate-50 dark:hover:bg-slate-900/50 text-slate-900 dark:text-white font-medium transition-colors focus:outline-none"
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Google Workspace
          </button>
        </div>
      </div>

      {/* Right Hero Section */}
      <div className="hidden lg:flex w-1/2 bg-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Abstract background graphics */}
        <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-80 h-80 bg-blue-900/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10 mt-20 text-white">
          <h2 className="text-4xl font-bold mb-6">Automate your financial operations.</h2>
          <p className="text-primary-foreground/80 text-lg max-w-md leading-relaxed">
            PaySynapse provides deterministic, real-time reconciliation for high-volume payment gateways. Catch missing settlements, orphaned transactions, and API mismatches instantly.
          </p>
          
          <div className="mt-12 space-y-6">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-white">100% Deterministic Engine</h4>
                <p className="text-primary-foreground/70 mt-1">Built for audit compliance. No hallucinated numbers.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-white">Real-time Webhook Triaging</h4>
                <p className="text-primary-foreground/70 mt-1">Detect exceptions within milliseconds of gateway delivery.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-white/50 text-sm">
          &copy; {new Date().getFullYear()} PaySynapse Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
