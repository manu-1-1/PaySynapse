"use client";

import { useState, useEffect } from "react";
import {
  FileSpreadsheet,
  Download,
  Send,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  FileCode,
  Search,
  Building,
  ShieldCheck,
  Calendar
} from "lucide-react";

export default function StatementsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [syncing, setSyncing] = useState(false);
  const [syncStatus, setSyncStatus] = useState(null);

  const fetchStatements = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/settlements?filter=ALL");
      const json = await res.json();
      if (json.success) {
        setTransactions(json.recentBankTransactions || []);
      }
    } catch (err) {
      console.error("Failed to load bank transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatements();
  }, []);

  const handlePushSync = async () => {
    try {
      setSyncing(true);
      setSyncStatus(null);
      const res = await fetch("/api/sync", { method: "POST" });
      const json = await res.json();
      if (json.success) {
        setSyncStatus({ type: "success", message: json.message });
      } else {
        setSyncStatus({ type: "error", message: json.error });
      }
    } catch (err) {
      setSyncStatus({ type: "error", message: err.message });
    } finally {
      setSyncing(false);
      setTimeout(() => setSyncStatus(null), 6000);
    }
  };

  const filteredTxns = transactions.filter((tx) => {
    const q = searchTerm.toLowerCase();
    return (
      (tx.reference && tx.reference.toLowerCase().includes(q)) ||
      (tx.externalTransactionId && tx.externalTransactionId.toLowerCase().includes(q)) ||
      (tx.settlementId && tx.settlementId.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-sky-500/10 border border-sky-500/30 text-sky-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Bank Statements & Clearance Feeds
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Generate official MT940 Swift / CAMT statements or stream direct Bank clearance feeds to PaySynapse.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <a
            href="/api/export?format=csv"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-sky-400" />
            Export CSV
          </a>

          <a
            href="/api/export?format=mt940"
            className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1.5 transition-all shadow-sm"
          >
            <FileCode className="w-3.5 h-3.5 text-amber-400" />
            Export MT940
          </a>

          <button
            onClick={handlePushSync}
            disabled={syncing}
            className="px-4 py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-blue-500/20 disabled:opacity-50 transition-all"
          >
            {syncing ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                Pushing Bank Feed...
              </>
            ) : (
              <>
                <Send className="w-3.5 h-3.5" />
                Sync Feed to PaySynapse
              </>
            )}
          </button>
        </div>
      </div>

      {/* Sync Status Feedback */}
      {syncStatus && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs transition-all animate-in fade-in slide-in-from-top-2 ${
            syncStatus.type === "success"
              ? "bg-emerald-950/60 border-emerald-500/30 text-emerald-300"
              : "bg-rose-950/60 border-rose-500/30 text-rose-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {syncStatus.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            )}
            <span>{syncStatus.message}</span>
          </div>
          <button onClick={() => setSyncStatus(null)} className="text-slate-400 hover:text-white">
            ✕
          </button>
        </div>
      )}

      {/* Account Details & ISO Header Card */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs font-mono">
        <div>
          <span className="text-slate-400 text-[10px] uppercase block mb-1">Nodal Account No.</span>
          <strong className="text-white text-sm">9021-0010-8842-1901</strong>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase block mb-1">IFSC / Routing Code</span>
          <strong className="text-amber-400 text-sm">APEX0009021</strong>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase block mb-1">Account Holder</span>
          <strong className="text-white text-sm">PaySynapse Nodal Pool</strong>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase block mb-1">Clearing Cycle</span>
          <strong className="text-emerald-400 text-sm">T+0 Continuous RTGS</strong>
        </div>
      </div>

      {/* Search & Transaction Table */}
      <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between gap-4 bg-slate-900/40">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search Bank UTR, Transaction ID, Settlement ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#050810] border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-amber-400"
            />
          </div>

          <span className="text-xs text-slate-400 font-mono">
            {filteredTxns.length} Records Listed
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#050810] text-slate-400 border-b border-slate-800 font-mono uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Date & Time</th>
                <th className="py-3.5 px-4">Bank Reference (UTR)</th>
                <th className="py-3.5 px-4">Txn ID</th>
                <th className="py-3.5 px-4">Settlement Link</th>
                <th className="py-3.5 px-4">Type</th>
                <th className="py-3.5 px-4">Amount</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {loading ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-sans">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-sky-400" />
                    Loading Bank Statement Feeds...
                  </td>
                </tr>
              ) : filteredTxns.length === 0 ? (
                <tr>
                  <td colSpan="7" className="py-12 text-center text-slate-400 font-sans">
                    No bank statement records found.
                  </td>
                </tr>
              ) : (
                filteredTxns.map((tx) => (
                  <tr key={tx.id} className="table-row-hover text-slate-300">
                    <td className="py-3 px-4 text-[11px] text-slate-400 font-sans">
                      {new Date(tx.transactionDate).toLocaleString()}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-amber-300 bg-amber-400/10 px-2 py-0.5 rounded border border-amber-400/20 text-[11px]">
                        {tx.reference || "N/A"}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-[11px] text-slate-400">
                      {tx.externalTransactionId || tx.id.slice(0, 16)}
                    </td>
                    <td className="py-3 px-4 text-[11px] text-sky-400">
                      {tx.settlementId ? tx.settlementId.slice(0, 16) : "N/A"}
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {tx.transactionType || "CREDIT"}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-bold text-white text-sm">
                      ₹{parseFloat(tx.amount.toString()).toFixed(2)}
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px] font-semibold">
                        <CheckCircle2 className="w-3 h-3" />
                        {tx.status || "CLEARED"}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
