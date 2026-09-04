import "./globals.css";
import Link from "next/link";
import { Building2, ShieldCheck, ArrowUpRight, Zap, FileSpreadsheet, Lock, Activity, ExternalLink } from "lucide-react";

export const metadata = {
  title: "Apex Nodal Bank | RBI Escrow & Settlement Portal",
  description: "Enterprise Nodal Settlement Banking Portal and Clearing Engine for PaySynapse Ecosystem",
};

export default function RootLayout({ children }) {
  const paysynapseUrl = process.env.NEXT_PUBLIC_PAYSYNAPSE_URL || "http://localhost:3000";
  const merchantStoreUrl = process.env.NEXT_PUBLIC_MERCHANT_STORE_URL || "http://localhost:3001";

  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col selection:bg-amber-500/30 selection:text-amber-200">
        {/* Top Header */}
        <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-[#070a13]/90 backdrop-blur-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Brand & Badge */}
              <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3 group">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-800 p-[1px] shadow-lg shadow-amber-900/20">
                    <div className="w-full h-full bg-[#0d1527] rounded-[11px] flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold tracking-tight text-lg text-white font-sans">
                        APEX <span className="text-amber-400">NODAL BANK</span>
                      </span>
                      <span className="text-[10px] font-semibold tracking-wider uppercase px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        RBI NODAL ESCROW
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 tracking-wide">
                      Core Clearing & Settlement Gateway • Member ID: <span className="text-slate-300 font-mono">APEX-IN-9021</span>
                    </p>
                  </div>
                </Link>
              </div>

              {/* Navigation Links */}
              <nav className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-slate-800">
                <Link
                  href="/"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Activity className="w-3.5 h-3.5 text-amber-400" />
                  Settlement Queue
                </Link>
                <Link
                  href="/chaos"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <Zap className="w-3.5 h-3.5 text-rose-400" />
                  Chaos & Anomaly Studio
                </Link>
                <Link
                  href="/statements"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-sky-400" />
                  Statements & Feed Sync
                </Link>
                <Link
                  href="/escrow"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-200 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  Escrow Vault
                </Link>
              </nav>

              {/* Multi-App Quick Links */}
              <div className="flex items-center gap-2">
                <a
                  href={merchantStoreUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white hover:border-slate-700 transition-all shadow-sm"
                  title="Open CyberDeck Merchant Store Demo"
                >
                  <span>Store (:3001)</span>
                  <ExternalLink className="w-3 h-3 text-slate-400" />
                </a>

                <a
                  href={paysynapseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-xs font-semibold text-white transition-all shadow-sm"
                  title="Open PaySynapse Reconciliation Engine"
                >
                  <span>PaySynapse (:3000)</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Subheader Status Ticker */}
          <div className="bg-[#050810] border-t border-b border-slate-800/60 px-4 py-1.5 text-[11px] text-slate-400 flex items-center justify-between overflow-x-auto">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-6 px-4">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5 text-emerald-400 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  RTGS / NEFT / IMPS GATEWAY ONLINE
                </span>
                <span className="text-slate-600">|</span>
                <span className="text-slate-300">
                  RBI Master Direction Compliance: <strong className="text-emerald-400 font-normal">Section 10A Escrow Verified</strong>
                </span>
              </div>
              <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400">
                <span>EOD Cut-off: <strong className="text-slate-200">23:59:59 IST</strong></span>
                <span className="text-slate-600">•</span>
                <span>Node: <strong className="text-amber-400">MUM-NODAL-01</strong></span>
              </div>
            </div>
          </div>
        </header>

        {/* Main Body */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-800/80 bg-[#050810] py-4 text-center text-xs text-slate-500">
          <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p>© 2026 Apex Nodal Bank of India. Simulated Acquiring Settlement Environment for PaySynapse.</p>
            <p className="font-mono text-[11px] text-slate-400">
              Deterministic Settlement Protocol • Port 3002
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
