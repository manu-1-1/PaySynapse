'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, FileText, Filter, Loader2 } from 'lucide-react';
import Link from 'next/link';

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const limit = 20;

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/transactions?limit=${limit}&offset=${page * limit}`);
        const data = await res.json();
        setTransactions(data.data || []);
        setTotal(data.total || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTransactions();
  }, [page]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'CAPTURED': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 ring-1 ring-emerald-500/20';
      case 'FAILED': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 ring-1 ring-rose-500/20';
      case 'REFUNDED': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 ring-1 ring-amber-500/20';
      default: return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ring-1 ring-slate-500/20';
    }
  };

  const getReconStyle = (recon) => {
    if (!recon || recon.length === 0) return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ring-1 ring-slate-500/20';
    const status = recon[0].status;
    if (status === 'MATCHED') return 'bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-400 ring-1 ring-blue-500/20';
    if (status === 'EXCEPTION') return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 ring-1 ring-rose-500/20';
    return 'bg-slate-50 text-slate-700 dark:bg-slate-800 dark:text-slate-300 ring-1 ring-slate-500/20';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 min-h-screen">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-300 dark:to-slate-500 bg-clip-text text-transparent">
            Transactions
          </h2>
          <p className="text-muted-foreground mt-1">
            Browse and search all payments and their reconciliation states.
          </p>
        </div>
      </div>

      <div className="animate-fade-in-up stagger-2 rounded-2xl border border-border/50 bg-white dark:bg-slate-950/60 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search by Payment ID or Order ID..."
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200"
            />
          </div>
          <button className="inline-flex items-center justify-center rounded-xl text-sm font-medium border border-border/50 bg-white dark:bg-slate-900 h-10 px-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2 text-slate-400" /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/20">
                <th className="h-11 px-4 text-left font-medium text-slate-500 text-xs uppercase tracking-wider w-[100px]">Time</th>
                <th className="h-11 px-4 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Payment ID</th>
                <th className="h-11 px-4 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Amount</th>
                <th className="h-11 px-4 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Method</th>
                <th className="h-11 px-4 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Gateway Status</th>
                <th className="h-11 px-4 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Recon State</th>
                <th className="h-11 px-4 text-right font-medium text-slate-500 text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                      <span className="text-sm">Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-slate-400 text-sm">No transactions found.</td>
                </tr>
              ) : (
                transactions.map((tx, idx) => (
                  <tr 
                    key={tx.id} 
                    className="border-b border-border/30 transition-all duration-200 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 group animate-fade-in-up"
                    style={{ animationDelay: `${idx * 30}ms`, animationDuration: '0.3s' }}
                  >
                    <td className="p-4 align-middle text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="p-4 align-middle">
                      <span className="font-medium text-slate-800 dark:text-slate-200 text-sm">{tx.externalPaymentId}</span>
                      <div className="text-xs text-slate-400 font-normal mt-0.5">Ord: {tx.order?.externalOrderId}</div>
                    </td>
                    <td className="p-4 align-middle font-semibold text-sm">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="p-4 align-middle text-slate-500 dark:text-slate-400 text-sm">
                      {tx.method || 'Unknown'}
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${getStatusStyle(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${getReconStyle(tx.reconciliations)}`}>
                        {tx.reconciliations?.length > 0 ? tx.reconciliations[0].status : 'PENDING'}
                      </span>
                      {tx.exceptions?.length > 0 && (
                        <div className="text-[11px] text-rose-500 font-medium mt-1.5 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-rose-500 animate-pulse" />
                          {tx.exceptions.length} exception(s)
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Link href={`/transactions/${tx.id}`} className="inline-flex items-center justify-center rounded-lg text-xs font-medium border border-border/50 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/20 h-8 px-3 transition-all duration-200 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0">
                        <FileText className="w-3 h-3 mr-1.5" /> Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-border/50 flex items-center justify-between text-sm text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{transactions.length > 0 ? page * limit + 1 : 0}</span> to <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.min((page + 1) * limit, total)}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{total}</span> transactions
          </div>
          <div className="flex items-center space-x-1.5">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="inline-flex items-center justify-center rounded-xl border border-border/50 bg-white dark:bg-slate-900 h-9 w-9 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 rounded-lg">
              {page + 1} / {totalPages || 1}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="inline-flex items-center justify-center rounded-xl border border-border/50 bg-white dark:bg-slate-900 h-9 w-9 disabled:opacity-30 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
