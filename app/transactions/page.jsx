'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, FileText, Filter } from 'lucide-react';
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
      case 'CAPTURED': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'FAILED': return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
      case 'REFUNDED': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400';
      default: return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  const getReconStyle = (recon) => {
    if (!recon || recon.length === 0) return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
    const status = recon[0].status;
    if (status === 'MATCHED') return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    if (status === 'EXCEPTION') return 'bg-rose-100 text-rose-800 dark:bg-rose-900/30 dark:text-rose-400';
    return 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300';
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Transactions
          </h2>
          <p className="text-muted-foreground mt-1">
            Browse and search all payments and their reconciliation states.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white dark:bg-slate-950 shadow-sm flex flex-col">
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search by Payment ID or Order ID..."
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <button className="inline-flex items-center justify-center rounded-md text-sm font-medium border bg-white dark:bg-slate-950 h-9 px-4 hover:bg-slate-50 dark:hover:bg-slate-900 transition-colors w-full sm:w-auto">
            <Filter className="w-4 h-4 mr-2" /> Filter
          </button>
        </div>

        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20 hover:bg-transparent">
                <th className="h-10 px-4 text-left font-medium text-slate-500 w-[100px]">Time</th>
                <th className="h-10 px-4 text-left font-medium text-slate-500">Payment ID</th>
                <th className="h-10 px-4 text-left font-medium text-slate-500">Amount</th>
                <th className="h-10 px-4 text-left font-medium text-slate-500">Method</th>
                <th className="h-10 px-4 text-left font-medium text-slate-500">Gateway Status</th>
                <th className="h-10 px-4 text-left font-medium text-slate-500">Recon State</th>
                <th className="h-10 px-4 text-right font-medium text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-slate-500">Loading transactions...</td>
                </tr>
              ) : transactions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-slate-500">No transactions found.</td>
                </tr>
              ) : (
                transactions.map((tx) => (
                  <tr key={tx.id} className="border-b transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/50 group">
                    <td className="p-4 align-middle text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(tx.createdAt)}
                    </td>
                    <td className="p-4 align-middle font-medium text-slate-900 dark:text-slate-200">
                      {tx.externalPaymentId}
                      <div className="text-xs text-slate-500 font-normal mt-0.5">Ord: {tx.order?.externalOrderId}</div>
                    </td>
                    <td className="p-4 align-middle font-medium">
                      {formatCurrency(tx.amount)}
                    </td>
                    <td className="p-4 align-middle text-slate-600 dark:text-slate-400">
                      {tx.method || 'Unknown'}
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getStatusStyle(tx.status)}`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${getReconStyle(tx.reconciliations)}`}>
                        {tx.reconciliations?.length > 0 ? tx.reconciliations[0].status : 'PENDING'}
                      </span>
                      {tx.exceptions?.length > 0 && (
                        <div className="text-xs text-rose-500 font-medium mt-1">
                          {tx.exceptions.length} exception(s)
                        </div>
                      )}
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Link href={`/transactions/${tx.id}`} className="inline-flex items-center justify-center rounded-md text-xs font-medium border bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 h-8 px-3 transition-colors text-primary opacity-0 group-hover:opacity-100">
                        <FileText className="w-3 h-3 mr-1.5" /> Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-4 border-t flex items-center justify-between text-sm text-slate-500">
          <div>
            Showing <span className="font-medium text-slate-900 dark:text-slate-200">{transactions.length > 0 ? page * limit + 1 : 0}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{Math.min((page + 1) * limit, total)}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{total}</span> transactions
          </div>
          <div className="flex space-x-2">
            <button 
              onClick={() => setPage(p => Math.max(0, p - 1))}
              disabled={page === 0 || loading}
              className="inline-flex items-center justify-center rounded-md border bg-white dark:bg-slate-950 h-8 w-8 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
              disabled={page >= totalPages - 1 || loading}
              className="inline-flex items-center justify-center rounded-md border bg-white dark:bg-slate-950 h-8 w-8 disabled:opacity-50 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
