'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, AlertTriangle, FileText, Filter } from 'lucide-react';
import Link from 'next/link';

export default function ExceptionsPage() {
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(0);
  const [total, setTotal] = useState(0);
  const [filter, setFilter] = useState(''); // '' (all), 'OPEN', 'INVESTIGATING', 'RESOLVED'
  const limit = 20;

  useEffect(() => {
    const fetchExceptions = async () => {
      setLoading(true);
      try {
        const url = `/api/exceptions?limit=${limit}&offset=${page * limit}${filter ? `&status=${filter}` : ''}`;
        const res = await fetch(url);
        const data = await res.json();
        setExceptions(data.data || []);
        setTotal(data.total || 0);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchExceptions();
  }, [page, filter]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-rose-700 to-rose-500 dark:from-rose-400 dark:to-rose-300 bg-clip-text text-transparent">
            Exception Center
          </h2>
          <p className="text-muted-foreground mt-1">
            Investigate and resolve financial discrepancies.
          </p>
        </div>
      </div>

      <div className="rounded-xl border bg-white dark:bg-slate-950 shadow-sm flex flex-col">
        <div className="p-4 border-b flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
            <input 
              type="text" 
              placeholder="Search exceptions..."
              className="w-full bg-slate-50 dark:bg-slate-900 border-none rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="flex w-full sm:w-auto space-x-2">
            <select 
              value={filter} 
              onChange={(e) => { setFilter(e.target.value); setPage(0); }}
              className="bg-slate-50 dark:bg-slate-900 border-none rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary w-full sm:w-auto cursor-pointer"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        </div>

        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b">
              <tr className="border-b bg-slate-50/50 dark:bg-slate-900/20 hover:bg-transparent">
                <th className="h-10 px-4 text-left font-medium text-slate-500 w-[100px]">Detected</th>
                <th className="h-10 px-4 text-left font-medium text-slate-500">Payment ID</th>
                <th className="h-10 px-4 text-left font-medium text-slate-500">Type</th>
                <th className="h-10 px-4 text-left font-medium text-slate-500">Financial Impact</th>
                <th className="h-10 px-4 text-left font-medium text-slate-500">Severity</th>
                <th className="h-10 px-4 text-left font-medium text-slate-500">Status</th>
                <th className="h-10 px-4 text-right font-medium text-slate-500">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-slate-500">Loading exceptions...</td>
                </tr>
              ) : exceptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-slate-500">No exceptions found.</td>
                </tr>
              ) : (
                exceptions.map((ex) => (
                  <tr key={ex.id} className={`border-b transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-900/50 group ${ex.status === 'OPEN' ? 'bg-rose-50/30 dark:bg-rose-950/10' : ''}`}>
                    <td className="p-4 align-middle text-slate-600 dark:text-slate-400 whitespace-nowrap">
                      {formatDate(ex.createdAt)}
                    </td>
                    <td className="p-4 align-middle font-medium text-slate-900 dark:text-slate-200">
                      {ex.payment?.externalPaymentId || <span className="text-slate-400 italic">Unlinked</span>}
                    </td>
                    <td className="p-4 align-middle font-medium">
                      <div className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit text-slate-800 dark:text-slate-300">
                        {ex.type.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="p-4 align-middle font-bold text-rose-600 dark:text-rose-400">
                      {formatCurrency(ex.financialImpact)}
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                        ex.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {ex.severity}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        ex.status === 'OPEN' ? 'bg-rose-100 text-rose-800' : 
                        ex.status === 'INVESTIGATING' ? 'bg-amber-100 text-amber-800' : 
                        'bg-emerald-100 text-emerald-800'
                      }`}>
                        {ex.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Link href={`/exceptions/${ex.id}`} className="inline-flex items-center justify-center rounded-md text-xs font-medium border bg-white dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-800 h-8 px-3 transition-colors text-primary">
                        <FileText className="w-3 h-3 mr-1.5" /> Investigate
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
            Showing <span className="font-medium text-slate-900 dark:text-slate-200">{exceptions.length > 0 ? page * limit + 1 : 0}</span> to <span className="font-medium text-slate-900 dark:text-slate-200">{Math.min((page + 1) * limit, total)}</span> of <span className="font-medium text-slate-900 dark:text-slate-200">{total}</span> exceptions
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
