"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Zap,
  AlertTriangle,
  Clock,
  Ban,
  Copy,
  ArrowUpRight,
  CheckCircle2,
  RefreshCw,
  ShieldAlert,
  Sliders,
  DollarSign
} from "lucide-react";

export default function ChaosStudio() {
  const [settlements, setSettlements] = useState([]);
  const [selectedSettlementId, setSelectedSettlementId] = useState("");
  const [shortAmount, setShortAmount] = useState(150);
  const [delayDays, setDelayDays] = useState(6);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const paysynapseUrl = process.env.NEXT_PUBLIC_PAYSYNAPSE_URL || "http://localhost:3000";

  useEffect(() => {
    fetch("/api/settlements?filter=ALL")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.settlements?.length > 0) {
          setSettlements(data.settlements);
          setSelectedSettlementId(data.settlements[0].id);
        }
      })
      .catch(console.error);
  }, []);

  const handleInjectChaos = async (scenario) => {
    try {
      setLoading(true);
      setResult(null);

      const res = await fetch("/api/chaos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scenario,
          settlementId: selectedSettlementId || undefined,
          customAmount: shortAmount,
          delayDays
        })
      });

      const json = await res.json();
      setResult(json);
    } catch (err) {
      setResult({ success: false, error: err.message });
    } finally {
      setLoading(false);
    }
  };

  const selectedItem = settlements.find((s) => s.id === selectedSettlementId);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400">
              <Zap className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Banking Chaos & Exception Injection Studio
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Simulate realistic banking anomalies, wire overcharges, clearing delays, and AML holds to test PaySynapse's 5-point reconciliation engine.
          </p>
        </div>

        <Link
          href="/"
          className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300 hover:text-white"
        >
          ← Back to Live Queue
        </Link>
      </div>

      {/* Target Settlement Selector Bar */}
      <div className="glass-panel p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex-1 w-full">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
            Select Target Settlement for Anomaly Injection:
          </label>
          <select
            value={selectedSettlementId}
            onChange={(e) => setSelectedSettlementId(e.target.value)}
            className="w-full bg-[#050810] border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-amber-400"
          >
            {settlements.map((s) => (
              <option key={s.id} value={s.id}>
                {s.externalSettlementId || s.id} — Amount: ₹{parseFloat(s.amount.toString()).toFixed(2)} — Payment: {s.payment?.externalPaymentId || s.paymentId?.slice(0, 10)}
              </option>
            ))}
          </select>
        </div>

        {selectedItem && (
          <div className="bg-slate-900/80 px-4 py-2.5 rounded-xl border border-slate-800 shrink-0 text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-400 block">Current Amount</span>
            <span className="text-sm font-mono font-bold text-white">
              ₹{parseFloat(selectedItem.amount.toString()).toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {/* Result Card (When Injected) */}
      {result && (
        <div
          className={`p-5 rounded-2xl border transition-all animate-in fade-in slide-in-from-top-3 ${
            result.success
              ? "bg-slate-900/90 border-amber-500/40 shadow-xl shadow-amber-500/5"
              : "bg-rose-950/60 border-rose-500/40 text-rose-300"
          }`}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              {result.success ? (
                <div className="p-2 rounded-xl bg-amber-400/10 text-amber-400 border border-amber-400/30">
                  <ShieldAlert className="w-5 h-5" />
                </div>
              ) : (
                <AlertTriangle className="w-5 h-5 text-rose-400 mt-0.5" />
              )}
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>{result.success ? "Anomaly Injected & Reconciled" : "Injection Error"}</span>
                  {result.scenario && (
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 font-semibold">
                      {result.scenario}
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-300 mt-1">{result.message || result.error}</p>

                {result.details && (
                  <div className="mt-3 p-3 rounded-xl bg-[#050810] border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300">
                    <div>UTR Issued: <strong className="text-amber-400">{result.details.utr || "N/A"}</strong></div>
                    {result.details.variance && (
                      <div>Variance Deducted: <strong className="text-rose-400">-₹{result.details.variance}</strong></div>
                    )}
                    <div>Settlement Target: {result.details.settlementId}</div>
                  </div>
                )}
              </div>
            </div>

            {result.success && (
              <a
                href={`${paysynapseUrl}/exceptions`}
                target="_blank"
                rel="noreferrer"
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center gap-1.5 shrink-0 shadow-lg shadow-blue-600/30 transition-all"
              >
                <span>Inspect in PaySynapse</span>
                <ArrowUpRight className="w-4 h-4" />
              </a>
            )}
          </div>
        </div>
      )}

      {/* 4 Chaos Scenario Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Scenario 1: Short Settlement */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                SHORT_SETTLEMENT
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors">
              1. Intermediary Bank Wire Surcharge
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Deducts an unauthorized bank intermediary processing charge from the credited payout. PaySynapse flags an <code>AMOUNT_MISMATCH</code> exception.
            </p>

            <div className="mt-4 p-3 bg-[#050810] rounded-xl border border-slate-800">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Wire Fee Deduction (₹):
              </label>
              <input
                type="number"
                value={shortAmount}
                onChange={(e) => setShortAmount(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-amber-400"
              />
            </div>
          </div>

          <button
            onClick={() => handleInjectChaos("SHORT_SETTLEMENT")}
            disabled={loading || !selectedSettlementId}
            className="mt-5 w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Zap className="w-3.5 h-3.5" />}
            Inject Short-Settlement (-₹{shortAmount})
          </button>
        </div>

        {/* Scenario 2: SLA Clearing Delay */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-sky-500/10 text-sky-400 border border-sky-500/20">
                <Clock className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-sky-500/10 text-sky-400 border border-sky-500/20">
                DELAYED_SETTLEMENT
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-sky-300 transition-colors">
              2. Bank Clearing SLA Breach (T+5 Delay)
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Simulates a bank holiday or clearance bottleneck where funds clear beyond the standard 3-day SLA. Triggers <code>DELAYED_SETTLEMENT</code> alert.
            </p>

            <div className="mt-4 p-3 bg-[#050810] rounded-xl border border-slate-800">
              <label className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Settlement Delay (Days):
              </label>
              <input
                type="number"
                value={delayDays}
                onChange={(e) => setDelayDays(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-sky-400"
              />
            </div>
          </div>

          <button
            onClick={() => handleInjectChaos("DELAYED_SETTLEMENT")}
            disabled={loading || !selectedSettlementId}
            className="mt-5 w-full py-2.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Clock className="w-3.5 h-3.5" />}
            Inject SLA Breach ({delayDays} Days Delay)
          </button>
        </div>

        {/* Scenario 3: Compliance Freeze */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
                <Ban className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                COMPLIANCE_HOLD
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors">
              3. Nodal AML Escrow Freeze
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Blocks the bank payout and locks the funds under compliance inspection. PaySynapse flags a high-severity <code>MISSING_BANK_TRANSACTION</code> exposure.
            </p>
          </div>

          <button
            onClick={() => handleInjectChaos("COMPLIANCE_HOLD")}
            disabled={loading || !selectedSettlementId}
            className="mt-5 w-full py-2.5 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 shadow-md shadow-rose-600/20"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Ban className="w-3.5 h-3.5" />}
            Freeze Escrow Disbursement
          </button>
        </div>

        {/* Scenario 4: Duplicate Credit */}
        <div className="glass-panel p-5 rounded-2xl border border-slate-800 hover:border-purple-500/40 transition-all flex flex-col justify-between group">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
                <Copy className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20">
                DUPLICATE_CREDIT
              </span>
            </div>
            <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
              4. Duplicate Bank Clearance Glitch
            </h3>
            <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
              Simulates a bank network retry anomaly where two independent credits are issued for a single settlement. Tests PaySynapse duplicate entry detection.
            </p>
          </div>

          <button
            onClick={() => handleInjectChaos("DUPLICATE_CREDIT")}
            disabled={loading || !selectedSettlementId}
            className="mt-5 w-full py-2.5 px-4 rounded-xl bg-purple-500 hover:bg-purple-400 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all disabled:opacity-50 shadow-md shadow-purple-600/20"
          >
            {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Copy className="w-3.5 h-3.5" />}
            Dispatch Duplicate Bank Credit
          </button>
        </div>
      </div>
    </div>
  );
}
