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
    <div className="flex min-h-screen bg-[#FAFBFC] dark:bg-[#111827]">
      {/* Left Form Section */}
      <div className="flex flex-col justify-center w-full lg:w-1/2 px-8 sm:px-16 md:px-24 xl:px-32 relative">
        {/* Brand */}
        <div className="absolute top-8 left-8 sm:left-16 md:left-24 xl:left-32">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="PaySynapse Logo" className="h-8 w-8 rounded-lg" />
            <span className="text-lg font-semibold tracking-tight text-[var(--foreground)]">
              PaySynapse
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md mx-auto space-y-7">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Welcome back
            </h2>
            <p className="mt-1.5 text-sm text-[var(--muted-foreground)]">
              Sign in to your account to access your reconciliation dashboard.
            </p>
            {error && (
              <div className="mt-4 p-3 rounded-lg bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/30 text-red-600 dark:text-red-400 text-sm flex items-center">
                <ShieldCheck className="h-4 w-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1.5">
                  Email Address
                </label>
                <input
                  suppressHydrationWarning
                  type="email"
                  name="email"
                  placeholder="name@company.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[#528FF0] text-[var(--foreground)] transition-colors duration-150 text-sm"
                  required
                />
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-medium text-[var(--foreground)]">
                    Password
                  </label>
                  <a href="#" className="text-sm font-medium text-[#528FF0] hover:underline">
                    Forgot password?
                  </a>
                </div>
                <input
                  suppressHydrationWarning
                  type="password"
                  name="password"
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] focus:outline-none focus:border-[#528FF0] text-[var(--foreground)] transition-colors duration-150 text-sm"
                  required
                />
              </div>
            </div>

            <button
              suppressHydrationWarning
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-[#528FF0] hover:bg-[#4080E0] text-white font-medium transition-colors duration-150 focus:outline-none disabled:opacity-60 text-sm"
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
              <div className="w-full border-t border-[var(--border)]"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-3 bg-[#FAFBFC] dark:bg-[#111827] text-[var(--muted-foreground)]">Or continue with</span>
            </div>
          </div>

          <button
            suppressHydrationWarning
            onClick={() => setError('Google Workspace SSO is not configured for this environment. Please enter your credentials above.')}
            type="button"
            className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] font-medium transition-colors duration-150 focus:outline-none text-sm"
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
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 relative overflow-hidden" style={{ backgroundColor: '#1B232E' }}>
        {/* Subtle accent dots */}
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        
        {/* Subtle blue glow */}
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#528FF0]/[0.06] rounded-full blur-[120px]" />
        
        <div className="relative z-10 mt-20 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-white/[0.06] border border-white/[0.08] text-xs font-medium mb-6">
            <Sparkles className="h-3.5 w-3.5 text-[#528FF0]" />
            AI-Powered Financial Intelligence
          </div>
          <h2 className="text-3xl font-bold mb-5 leading-tight">
            Automate your<br />financial operations.
          </h2>
          <p className="text-white/50 text-base max-w-md leading-relaxed">
            PaySynapse provides deterministic, real-time reconciliation for high-volume payment gateways. Catch missing settlements, orphaned transactions, and API mismatches instantly.
          </p>
          
          <div className="mt-10 space-y-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-white/[0.06] flex items-center justify-center border border-white/[0.08]">
                <ShieldCheck className="h-5 w-5 text-[#528FF0]" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-semibold text-white">100% Deterministic Engine</h4>
                <p className="text-white/40 mt-0.5 text-sm">Built for audit compliance. No hallucinated numbers.</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-white/[0.06] flex items-center justify-center border border-white/[0.08]">
                <Zap className="h-5 w-5 text-[#528FF0]" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-semibold text-white">Real-time Webhook Triaging</h4>
                <p className="text-white/40 mt-0.5 text-sm">Detect exceptions within milliseconds of gateway delivery.</p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-white/[0.06] flex items-center justify-center border border-white/[0.08]">
                <Lock className="h-5 w-5 text-[#528FF0]" />
              </div>
              <div className="ml-4">
                <h4 className="text-sm font-semibold text-white">Enterprise-Grade Security</h4>
                <p className="text-white/40 mt-0.5 text-sm">SOC-2 compliant with encrypted data at rest and in transit.</p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="relative z-10 text-white/30 text-sm">
          &copy; {new Date().getFullYear()} PaySynapse Inc. All rights reserved.
        </div>
      </div>
    </div>
  );
}
