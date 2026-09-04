'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, ShieldCheck, Terminal, CheckCircle2, Lock, KeyRound } from 'lucide-react';
import Link from 'next/link';

export default function AuthPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async (e) => {
    e?.preventDefault();
    setLoading(true);
    setError('');

    try {
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
        setError(data.error || 'Authentication failed. Verify your credentials.');
        setLoading(false);
      }
    } catch (err) {
      setError('Connection error contacting authentication endpoint.');
      setLoading(false);
    }
  };

  const handleFillDemo = () => {
    setEmail('ops@demo.paysynapse.com');
    setPassword('password123');
    setError('');
  };

  return (
    <div className="flex min-h-screen bg-[#131417] text-[#E8EAED] text-xs">
      {/* Left Form Section */}
      <div className="flex flex-col justify-between w-full lg:w-1/2 p-6 sm:p-12 md:p-16 lg:p-20 border-r border-[#2D2E36]/60 bg-[#131417]">
        {/* Brand Header */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icon.svg" alt="PaySynapse Logo" className="h-8 w-8 rounded-lg" />
            <span className="text-base font-semibold tracking-tight text-[#E8EAED]">
              PaySynapse
            </span>
          </Link>

          <span className="text-[10px] font-mono px-2 py-0.5 rounded border border-[#2D2E36] bg-[#1C1D22] text-[#9AA0A6]">
            FINTECH CONSOLE v1.4
          </span>
        </div>

        {/* Login Form Container */}
        <div className="w-full max-w-sm mx-auto my-auto py-10 space-y-6">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-[#E8EAED]">
              Operator Authentication
            </h1>
            <p className="mt-1 text-xs text-[#9AA0A6]">
              Sign in to access your multi-node reconciliation pipeline.
            </p>
            {error && (
              <div className="mt-3 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 flex-shrink-0 text-rose-400" />
                <span>{error}</span>
              </div>
            )}
          </div>

          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-mono text-[#9AA0A6] uppercase tracking-wider mb-1.5">
                  Email Address
                </label>
                <input
                  suppressHydrationWarning
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="ops@demo.paysynapse.com"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#2D2E36] bg-[#1C1D22] focus:outline-none focus:border-[#528FF0] text-[#E8EAED] placeholder-[#5F6368] transition-colors text-xs font-mono"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-mono text-[#9AA0A6] uppercase tracking-wider">
                    Secret Key / Password
                  </label>
                  <a href="#" className="text-xs text-[#8AB4F8] hover:underline">
                    Reset
                  </a>
                </div>
                <input
                  suppressHydrationWarning
                  type="password"
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-3.5 py-2.5 rounded-lg border border-[#2D2E36] bg-[#1C1D22] focus:outline-none focus:border-[#528FF0] text-[#E8EAED] placeholder-[#5F6368] transition-colors text-xs font-mono"
                  required
                />
              </div>
            </div>

            <button
              suppressHydrationWarning
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg bg-[#528FF0] hover:bg-[#4080E0] text-white font-medium transition-colors focus:outline-none disabled:opacity-60 text-xs shadow-sm"
            >
              {loading ? (
                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  Authenticate Session <ArrowRight className="ml-2 h-3.5 w-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Fill Button */}
          <button
            type="button"
            onClick={handleFillDemo}
            className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-[#2D2E36] bg-[#18191E] hover:bg-[#1E2027] text-[#9AA0A6] hover:text-[#E8EAED] transition-colors text-xs font-mono"
          >
            <span className="flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5 text-emerald-400" />
              Demo Credentials
            </span>
            <span className="text-[10px] text-emerald-400 font-semibold uppercase">Auto-Fill</span>
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-[#2D2E36]"></div>
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="px-3 bg-[#131417] text-[#9AA0A6] font-mono text-[11px]">Or SSO</span>
            </div>
          </div>

          <button
            suppressHydrationWarning
            onClick={() => setError('Enterprise SSO is configured for internal domains. Use Demo Credentials above.')}
            type="button"
            className="w-full flex items-center justify-center py-2.5 px-4 rounded-lg border border-[#2D2E36] bg-[#1C1D22] hover:bg-[#26272E] text-[#E8EAED] font-medium transition-colors focus:outline-none text-xs"
          >
            <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
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
            Sign in with Google Workspace
          </button>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-[#9AA0A6] text-[11px] font-mono">
          <span>&copy; {new Date().getFullYear()} PaySynapse Platform</span>
          <span className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            Ledger Ingestion Active
          </span>
        </div>
      </div>

      {/* Right Architecture & Telemetry Section */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between p-12 lg:p-16 bg-[#0E0F12] relative overflow-hidden">
        {/* Subtle grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none" 
          style={{ backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)', backgroundSize: '24px 24px' }} 
        />

        {/* Header Tag */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#2D2E36] bg-[#18191E] text-[11px] font-mono text-[#8AB4F8]">
            <Terminal className="h-3.5 w-3.5 text-[#528FF0]" />
            Deterministic Financial Middleware
          </div>
        </div>

        {/* Main Content */}
        <div className="relative z-10 max-w-lg space-y-6 my-auto py-8">
          <div>
            <h2 className="text-2xl lg:text-3xl font-bold tracking-tight text-[#E8EAED] leading-snug">
              Automated 5-Node Ledger Reconciliation.
            </h2>
            <p className="mt-2.5 text-xs text-[#9AA0A6] leading-relaxed">
              Continuous mathematical matching across merchant cart orders, gateway charges, MDR deductions, settlement batches, and RBI bank escrow records.
            </p>
          </div>

          {/* Architecture Verification Console */}
          <div className="rounded-lg border border-[#2D2E36] bg-[#131417] overflow-hidden">
            <div className="px-4 py-2 bg-[#18191E] border-b border-[#2D2E36] flex items-center justify-between font-mono text-[10px] text-[#9AA0A6]">
              <span>RECONCILIATION_PIPELINE.SPEC</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> ACTIVE
              </span>
            </div>

            <div className="p-4 space-y-3 font-mono text-xs">
              <div className="flex items-center justify-between py-1 border-b border-[#2D2E36]/40">
                <span className="text-[#9AA0A6]">Node 01 — Cart Order</span>
                <span className="text-[#E8EAED]">SHA-256 HMAC Verified</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#2D2E36]/40">
                <span className="text-[#9AA0A6]">Node 02 — Gateway Capture</span>
                <span className="text-[#528FF0]">Razorpay / Cashfree Webhook</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#2D2E36]/40">
                <span className="text-[#9AA0A6]">Node 03 — Contract MDR Rate</span>
                <span className="text-[#E8EAED]">1.80% + GST Calibrated</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-[#2D2E36]/40">
                <span className="text-[#9AA0A6]">Node 04 — Settlement Batch</span>
                <span className="text-[#E8EAED]">RBI T+1 Compliance SLA</span>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-[#9AA0A6]">Node 05 — Bank Escrow Clearance</span>
                <span className="text-emerald-400">Direct Nodal UTR Matched</span>
              </div>
            </div>
          </div>

          {/* Three Compact Specs */}
          <div className="grid grid-cols-3 gap-3 border border-[#2D2E36] rounded-lg divide-x divide-[#2D2E36] bg-[#18191E]/40 overflow-hidden text-center p-3">
            <div>
              <div className="text-[10px] font-mono uppercase text-[#9AA0A6]">Invariance</div>
              <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">100% Parity</div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-[#9AA0A6]">Latency</div>
              <div className="text-sm font-bold font-mono text-[#528FF0] mt-0.5">&lt; 12ms</div>
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase text-[#9AA0A6]">Variance</div>
              <div className="text-sm font-bold font-mono text-[#E8EAED] mt-0.5">₹0.00 Float</div>
            </div>
          </div>
        </div>

        {/* Security Trust Footnote */}
        <div className="relative z-10 flex items-center justify-between text-[11px] font-mono text-[#9AA0A6] border-t border-[#2D2E36]/40 pt-4">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-[#8AB4F8]" /> End-to-End Cryptographic Signatures
          </span>
          <span>SOC-2 &amp; RBI Compliance</span>
        </div>
      </div>
    </div>
  );
}
