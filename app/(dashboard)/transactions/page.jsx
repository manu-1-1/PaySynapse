'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, FileText, Filter, Loader2, ReceiptText } from 'lucide-react';
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
      case 'CAPTURED': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'FAILED': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'REFUNDED': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getReconStyle = (recon) => {
    if (!recon || recon.length === 0) return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
    const status = recon[0].status;
    if (status === 'MATCHED') return 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400';
    if (status === 'EXCEPTION') return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex-1 space-y-5 p-4 sm:p-6 pt-4 sm:pt-5 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Transactions</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Browse and search all payments and their reconciliation states.
          </p>
        </div>
      </div>

      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-[var(--border)] flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search by Payment ID or Order ID..."
              className="w-full bg-[var(--muted)] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#528FF0] border border-transparent transition-colors duration-150"
            />
          </div>
          <button className="inline-flex items-center justify-center rounded-lg text-sm font-medium border border-[var(--border)] bg-[var(--surface)] h-9 px-4 hover:bg-[var(--surface-hover)] transition-colors duration-150 w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2 text-gray-400" /> Filter
          </button>
        </div>

        {/* Table */}
        <div className="w-full overflow-x-auto">
          <table className="w-full caption-bottom text-sm min-w-[720px]">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                <th className="h-10 px-4 text-left font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wider w-[100px]">Time</th>
                <th className="h-10 px-4 text-left font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wider">Payment ID</th>
                <th className="h-10 px-4 text-left font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wider">Amount</th>
                <th className="h-10 px-4 text-left font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wider">Method</th>
                <th className="h-10 px-4 text-left font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wider">Gateway Status</th>
                <th className="h-10 px-4 text-left font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wider">Recon State</th>
                <th className="h-10 px-4 text-right font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Loader2 className="h-5 w-5 animate-spin text-[#528FF0]" />
                      <span className="text-sm">Loading transactions...</span>
                    </div>
                  </td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-gray-400 text-sm">No transactions found.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr 
                    key={tx.id} 
                    className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors duration-100 group"
                  >
                    <td className="p-3 align-middle text-[var(--muted-foreground)] whitespace-nowrap text-xs">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="p-3 align-middle">
                      <span className="font-medium text-[var(--foreground)] text-sm">{tx.externalPaymentId}</span>
                      <div className="text-xs text-[var(--muted-foreground)] mt-0.5">Ord: {tx.order?.externalOrderId}</div>
                    </td>
                    <td className="p-3 align-middle font-semibold text-sm">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="p-3 align-middle text-[var(--muted-foreground)] text-sm">
                      {tx.method || 'Unknown'}
                    </td>
                    <td className="p-3 align-middle">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${getStatusStyle(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-3 align-middle">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${getReconStyle(tx.reconciliations)}`}>
                        {tx.reconciliations?.length > 0 ? tx.reconciliations[0].status : 'PENDING'}
                      </span>
                      {tx.exceptions?.length > 0 && (
                        <div className="text-[11px] text-red-500 font-medium mt-1 flex items-center gap-1">
                          <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
                          {tx.exceptions.length} exception(s)
                        </div>
                      )}
                    </td>
                    <td className="p-3 align-middle text-right">
                      <Link href={`/transactions/${tx.id}`} className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] h-7 px-2.5 transition-colors duration-100 text-[#528FF0] opacity-0 group-hover:opacity-100">
                        <FileText className="w-3 h-3 mr-1" /> Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs sm:text-sm text-[var(--muted-foreground)]">
          <div>
            Showing <span className="font-semibold text-[var(--foreground)]">{transactions.length > 0 ? page * limit + 1 : 0}</span> to <span className="font-semibold text-[var(--foreground)]">{Math.min((page + 1) * limit, total)}</span> of <span className="font-semibold text-[var(--foreground)]">{total}</span> transactions
          </div>
          <div className="flex items-center space-x-1.5">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] h-8 w-8 disabled:opacity-30 hover:bg-[var(--surface-hover)] transition-colors duration-150"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="px-2.5 py-1 text-xs font-semibold text-[var(--foreground)] bg-[var(--muted)] rounded-md">
              {page + 1} / {totalPages || 1}
            </span>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="inline-flex items-center justify-center rounded-lg border border-[var(--border)] bg-[var(--surface)] h-8 w-8 disabled:opacity-30 hover:bg-[var(--surface-hover)] transition-colors duration-150"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
