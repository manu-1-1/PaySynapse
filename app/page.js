'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Activity, Zap, Sparkles, Lock } from 'lucide-react';
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
          <Link href="/" className="flex items-center gap-2.5 group">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="PaySynapse Logo" className="h-9 w-9 rounded-xl shadow-lg shadow-blue-500/20 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-105" />
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              PaySynapse
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto space-y-8 animate-fade-in-up">
          <div>
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
              Welcome back
            </h2>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Sign in to your account to access your reconciliation dashboard.
            </p>
            {error && (
              <div className="mt-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-sm flex items-center animate-fade-in-up" style={{ animationDuration: '0.2s' }}>
                <ShieldCheck className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSignIn} className="space-y-5">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <input
                  suppressHydrationWarning
                  type="email"
                  name="email"
                  defaultValue="ops@demo.paysynapse.com"
                  className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#111c3a] border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-600 text-slate-900 dark:text-white transition-all duration-200 shadow-sm"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                    Password
                  </label>
                  <a href="#" className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  suppressHydrationWarning
                  type="password"
                  name="password"
                  defaultValue="password123"
                  className="w-full px-4 py-3 rounded-xl border bg-white dark:bg-[#111c3a] border-slate-200 dark:border-slate-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 dark:focus:border-blue-600 text-slate-900 dark:text-white transition-all duration-200 shadow-sm"
                  required
                />
              </div>
            </div>

            <button
              suppressHydrationWarning
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-60 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 group"
            >
              {loading ? (
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Sign In <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
                </>
              )}
            </button>
          </form>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-700/50"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-slate-50 dark:bg-[#0B192C] text-slate-400">Or continue with</span>
            </div>
          </div>

          <button
            suppressHydrationWarning
            onClick={handleSignIn}
            type="button"
            className="w-full flex items-center justify-center py-3.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700/50 bg-white dark:bg-[#111c3a] hover:bg-slate-50 dark:hover:bg-slate-800/50 text-slate-900 dark:text-white font-medium transition-all duration-200 focus:outline-none shadow-sm hover:shadow-md"
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
      <div className="hidden lg:flex w-1/2 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 flex-col justify-between p-12 relative overflow-hidden">
        {/* Animated floating orbs */}
        <div className="absolute top-20 right-20 w-72 h-72 bg-white/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-32 left-10 w-56 h-56 bg-blue-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
        <div className="absolute top-1/2 right-1/3 w-40 h-40 bg-purple-400/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '4s' }} />
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        <div className="relative z-10 mt-20 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium mb-6 animate-fade-in-up">
            <Sparkles className="h-3.5 w-3.5" />
            AI-Powered Financial Intelligence
          </div>
          <h2 className="text-4xl font-bold mb-6 leading-tight animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            Automate your<br />financial operations.
          </h2>
          <p className="text-white/70 text-lg max-w-md leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
            PaySynapse provides deterministic, real-time reconciliation for high-volume payment gateways. Catch missing settlements, orphaned transactions, and API mismatches instantly.
          </p>
          
          <div className="mt-12 space-y-5">
            <div className="flex items-start animate-fade-in-up" style={{ animationDelay: '0.3s' }}>
              <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg">
                <ShieldCheck className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-white">100% Deterministic Engine</h4>
                <p className="text-white/60 mt-0.5 text-sm">Built for audit compliance. No hallucinated numbers.</p>
              </div>
            </div>
            
            <div className="flex items-start animate-fade-in-up" style={{ animationDelay: '0.4s' }}>
              <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg">
                <Zap className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-white">Real-time Webhook Triaging</h4>
                <p className="text-white/60 mt-0.5 text-sm">Detect exceptions within milliseconds of gateway delivery.</p>
              </div>
            </div>

            <div className="flex items-start animate-fade-in-up" style={{ animationDelay: '0.5s' }}>
              <div className="flex-shrink-0 h-11 w-11 rounded-xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/10 shadow-lg">
                <Lock className="h-5 w-5 text-white" />
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-semibold text-white">Enterprise-Grade Security</h4>
                <p className="text-white/60 mt-0.5 text-sm">SOC-2 compliant with encrypted data at rest and in transit.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-white/40 text-sm">
          &copy; {new Date().getFullYear()} PaySynapse Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
