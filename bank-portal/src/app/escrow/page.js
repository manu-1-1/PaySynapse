"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  ShieldCheck,
  Building2,
  Lock,
  Coins,
  CheckCircle2,
  FileCheck,
  TrendingUp,
  Percent,
  ArrowRight
} from "lucide-react";

export default function EscrowVaultPage() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetch("/api/settlements?filter=ALL")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.stats);
        }
      })
      .catch(console.error);
  }, []);

  const balance = stats?.escrowBalance || 12500000;
  const inflow = stats?.totalInflow || 0;
  const outflow = stats?.totalClearedOutflow || 0;

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="border-b border-slate-800/80 pb-5">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h1 className="text-xl font-bold text-white tracking-tight">
            Nodal Escrow Vault & Statutory Treasury
          </h1>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Reserve Bank of India (RBI) mandated escrow account segregation for Payment Aggregators & Merchants.
        </p>
      </div>

      {/* Main Vault Status Card */}
      <div className="glass-panel-glow p-6 rounded-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-400">
                Statutory Nodal Escrow Pool
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold font-mono">
                COMPLIANT • T+0 ESCROW
              </span>
            </div>
            <div className="text-3xl font-extrabold font-mono text-white tracking-tight">
              ₹{balance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Held in ring-fenced Escrow under RBI Master Directions on Payment Aggregators.
            </p>
          </div>

          <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-2 text-xs font-mono shrink-0">
            <div className="flex items-center justify-between gap-6">
              <span className="text-slate-400">Reserve Ratio:</span>
              <strong className="text-emerald-400">100.00% (No Speculation)</strong>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-slate-400">Nodal Escrow A/C:</span>
              <strong className="text-white">9021-0010-8842-1901</strong>
            </div>
            <div className="flex items-center justify-between gap-6">
              <span className="text-slate-400">Intermediary Bank:</span>
              <strong className="text-amber-300">Apex Commercial Bank</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Treasury Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold uppercase text-sky-400 flex items-center gap-1.5 mb-2">
            <Coins className="w-4 h-4" />
            Aggregator Settlement Inflow
          </div>
          <div className="text-xl font-bold font-mono text-white">
            ₹{inflow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Net incoming batch payments received from Razorpay / Aggregators.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold uppercase text-emerald-400 flex items-center gap-1.5 mb-2">
            <TrendingUp className="w-4 h-4" />
            Merchant Operating Disbursal
          </div>
          <div className="text-xl font-bold font-mono text-emerald-300">
            ₹{outflow.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Directly credited to Merchant Operating Current Accounts via RTGS.
          </p>
        </div>

        <div className="glass-panel p-5 rounded-2xl border border-slate-800">
          <div className="text-xs font-semibold uppercase text-amber-400 flex items-center gap-1.5 mb-2">
            <Percent className="w-4 h-4" />
            Statutory Capital Buffer
          </div>
          <div className="text-xl font-bold font-mono text-amber-300">
            ₹1,25,00,000.00
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Permanent institutional liquidity cushion maintained with RBI.
          </p>
        </div>
      </div>

      {/* Regulatory Master Directions Box */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <FileCheck className="w-4 h-4 text-emerald-400" />
          Statutory Nodal Escrow Mandates (RBI DPSS.CO.PD.No.1810/02.14.008)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs text-slate-300 leading-relaxed">
          <div className="bg-[#050810] p-4 rounded-xl border border-slate-800/80">
            <strong className="text-white block mb-1">1. Non-Interest Bearing Escrow:</strong>
            Funds held in this account are non-interest bearing and strictly segregated from aggregator balance sheets to guarantee 100% merchant solvency.
          </div>
          <div className="bg-[#050810] p-4 rounded-xl border border-slate-800/80">
            <strong className="text-white block mb-1">2. Deterministic T+1 / T+2 Payouts:</strong>
            All settlement batches must be finalized and dispatched to merchant accounts within the regulated SLA window, verified against cryptographic UTR proofs.
          </div>
        </div>
      </div>
    </div>
  );
}
