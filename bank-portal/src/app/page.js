"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  RefreshCw,
  Zap,
  Copy,
  ExternalLink,
  Coins,
  Send,
  Check,
  Filter
} from "lucide-react";

export default function BankDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [settlingId, setSettlingId] = useState(null);
  const [batchSettling, setBatchSettling] = useState(false);
  const [copiedUtr, setCopiedUtr] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const fetchSettlements = async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/settlements?filter=${filter}`);
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error("Error loading settlements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettlements();
    const interval = setInterval(fetchSettlements, 10000);
    return () => clearInterval(interval);
  }, [filter]);

  const handleSettleSingle = async (settlementId) => {
    try {
      setSettlingId(settlementId);
      const res = await fetch("/api/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settlementId })
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "success", message: json.message });
        await fetchSettlements();
      } else {
        setFeedback({ type: "error", message: json.error || "Failed to clear settlement" });
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setSettlingId(null);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const handleBatchSettle = async () => {
    try {
      setBatchSettling(true);
      const res = await fetch("/api/settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ batch: true })
      });
      const json = await res.json();
      if (json.success) {
        setFeedback({ type: "success", message: json.message });
        await fetchSettlements();
      } else {
        setFeedback({ type: "error", message: json.error || "Failed to clear batch" });
      }
    } catch (err) {
      setFeedback({ type: "error", message: err.message });
    } finally {
      setBatchSettling(false);
      setTimeout(() => setFeedback(null), 5000);
    }
  };

  const copyToClipboard = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedUtr(id);
    setTimeout(() => setCopiedUtr(null), 2000);
  };

  const stats = data?.stats || {
    escrowBalance: 12500000,
    totalInflow: 0,
    totalClearedOutflow: 0,
    pendingSettlementsCount: 0,
    pendingSettlementsAmount: 0,
    clearedSettlementsCount: 0
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Feedback Alert */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-sm transition-all animate-in fade-in slide-in-from-top-2 ${
            feedback.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/60 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === "success" ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            ) : (
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-slate-400 hover:text-white text-xs px-2 py-1 rounded"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Hero Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Nodal Escrow Balance Card */}
        <div className="glass-panel-glow p-5 rounded-2xl relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
            <ShieldCheck className="w-20 h-20 text-amber-400" />
          </div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400/90 flex items-center gap-1.5">
              <Coins className="w-3.5 h-3.5" />
              Nodal Escrow Pool
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-400/10 text-amber-300 border border-amber-400/20 font-mono">
              RBI ESCROW
            </span>
          </div>
          <div className="text-2xl font-bold font-mono tracking-tight text-white mt-1">
            ₹{stats.escrowBalance.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
            100% Reserve Backed • Section 10A Compliant
          </p>
        </div>

        {/* Pending Settlements Card */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Pending Bank Clearance
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-bold">
              {stats.pendingSettlementsCount} BATCHES
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-amber-300 mt-1">
            ₹{stats.pendingSettlementsAmount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Awaiting RTGS / UTR authorization
          </p>
        </div>

        {/* Inward Inflow Card */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-sky-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              Aggregator Inflow
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-400">
              RAZORPAY
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-white mt-1">
            ₹{stats.totalInflow.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Gross settlements captured
          </p>
        </div>

        {/* Cleared Outflow Card */}
        <div className="glass-panel p-5 rounded-2xl relative overflow-hidden group">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Cleared & Disbursed
            </span>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 font-mono">
              {stats.clearedSettlementsCount} UTRs
            </span>
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-300 mt-1">
            ₹{stats.totalClearedOutflow.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <p className="text-[11px] text-slate-400 mt-2">
            Credited to Merchant Operating Current A/c
          </p>
        </div>
      </div>

      {/* Action Header & Quick Chaos Shortcut */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/40 p-4 rounded-2xl border border-slate-800">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <span>Settlement Processing Pipeline</span>
            <span className="text-xs font-normal text-slate-400 font-mono">
              (Live Bank Queue)
            </span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Authorize real-time RTGS/NEFT batches or inject banking anomalies into the PaySynapse ecosystem.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={fetchSettlements}
            disabled={loading}
            className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
            title="Refresh Settlements"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          <Link
            href="/chaos"
            className="px-3 py-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400" />
            Inject Chaos
          </Link>

          <button
            onClick={handleBatchSettle}
            disabled={batchSettling || stats.pendingSettlementsCount === 0}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {batchSettling ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Processing Batch...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Clear All Pending ({stats.pendingSettlementsCount})
              </>
            )}
          </button>
        </div>
      </div>

      {/* Filter Tabs & Settlement Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        {/* Filter Navigation */}
        <div className="p-4 border-b border-slate-800/80 flex items-center justify-between gap-4 bg-slate-900/30">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            <span className="text-xs font-medium text-slate-300 mr-2">Filter View:</span>
            {["ALL", "PENDING", "CLEARED"].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filter === tab
                    ? "bg-amber-400 text-slate-950 shadow-sm"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                }`}
              >
                {tab === "ALL" && `All Records (${data?.settlements?.length || 0})`}
                {tab === "PENDING" && `Pending Clearance (${stats.pendingSettlementsCount})`}
                {tab === "CLEARED" && `Cleared (${stats.clearedSettlementsCount})`}
              </button>
            ))}
          </div>

          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline-block">
            Auto-refresh every 10s
          </span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#050810] text-slate-400 border-b border-slate-800 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Settlement Batch ID</th>
                <th className="py-3.5 px-4">Payment & Order</th>
                <th className="py-3.5 px-4">Net Settlement</th>
                <th className="py-3.5 px-4">Gateway Status</th>
                <th className="py-3.5 px-4">Bank UTR Reference</th>
                <th className="py-3.5 px-4">Clearing Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {loading && !data?.settlements ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-400" />
                    Loading Nodal Escrow Settlements...
                  </td>
                </tr>
              ) : data?.settlements?.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400">
                    No settlements found matching the filter.
                  </td>
                </tr>
              ) : (
                data?.settlements?.map((settlement) => {
                  const hasClearedTxn = settlement.bankTransactions.some(
                    (bt) => bt.status === "CLEARED" || bt.status === "SUCCESS"
                  );
                  const bankTxn = settlement.bankTransactions[0];
                  const isSettling = settlingId === settlement.id;

                  return (
                    <tr key={settlement.id} className="table-row-hover text-slate-300">
                      {/* Settlement ID */}
                      <td className="py-3 px-4 font-mono text-[11px]">
                        <div className="font-semibold text-slate-200">
                          {settlement.externalSettlementId || settlement.id.slice(0, 16)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {new Date(settlement.createdAt).toLocaleString()}
                        </div>
                      </td>

                      {/* Payment & Order */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-300 text-[11px]">
                          {settlement.payment?.externalPaymentId || settlement.paymentId?.slice(0, 14)}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          Order: {settlement.payment?.order?.externalOrderId || "N/A"}
                        </div>
                      </td>

                      {/* Net Settlement */}
                      <td className="py-3 px-4 font-mono font-bold text-white text-sm">
                        ₹{parseFloat(settlement.amount.toString()).toFixed(2)}
                      </td>

                      {/* Gateway Status */}
                      <td className="py-3 px-4">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {settlement.status || "CAPTURED"}
                        </span>
                      </td>

                      {/* Bank UTR Reference */}
                      <td className="py-3 px-4">
                        {bankTxn?.reference ? (
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[11px] text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20">
                              {bankTxn.reference}
                            </span>
                            <button
                              onClick={() => copyToClipboard(bankTxn.reference, bankTxn.id)}
                              className="text-slate-400 hover:text-white p-1 rounded hover:bg-slate-800"
                              title="Copy UTR"
                            >
                              {copiedUtr === bankTxn.id ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <Copy className="w-3.5 h-3.5" />
                              )}
                            </button>
                          </div>
                        ) : (
                          <span className="text-slate-400 text-[11px] italic">
                            Awaiting UTR
                          </span>
                        )}
                      </td>

                      {/* Clearing Status */}
                      <td className="py-3 px-4">
                        {hasClearedTxn ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            <CheckCircle2 className="w-3 h-3" />
                            CLEARED
                          </span>
                        ) : settlement.bankTransactions.some((bt) => bt.status === "HOLD" || bt.status === "HELD_AML_AUDIT") ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                            <AlertTriangle className="w-3 h-3" />
                            COMPLIANCE HOLD
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            <Clock className="w-3 h-3" />
                            PENDING RELEASE
                          </span>
                        )}
                      </td>

                      {/* Action */}
                      <td className="py-3 px-4 text-right">
                        {hasClearedTxn ? (
                          <span className="text-[11px] text-emerald-400 font-medium">
                            Disbursed
                          </span>
                        ) : (
                          <button
                            onClick={() => handleSettleSingle(settlement.id)}
                            disabled={isSettling}
                            className="px-3 py-1 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs inline-flex items-center gap-1 transition-all disabled:opacity-50"
                          >
                            {isSettling ? (
                              <>
                                <RefreshCw className="w-3 h-3 animate-spin" />
                                Issuing...
                              </>
                            ) : (
                              <>
                                <Check className="w-3 h-3" />
                                Clear & Issue UTR
                              </>
                            )}
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
