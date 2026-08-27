'use client';

import { useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, AlertTriangle, FileText, Download, Loader2 } from 'lucide-react';
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

  const handleExport = () => {
    const url = `/api/export${filter ? `?status=${filter}` : ''}`;
    window.open(url, '_blank');
  };

  const getSeverityStyle = (severity) => {
    if (severity === 'HIGH') return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 ring-1 ring-rose-500/20 glow-red';
    return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 ring-1 ring-amber-500/20 glow-amber';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 ring-1 ring-rose-500/20';
      case 'INVESTIGATING': return 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 ring-1 ring-amber-500/20';
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 ring-1 ring-emerald-500/20';
      case 'OBSOLETE': return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 ring-1 ring-slate-500/20';
      default: return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 ring-1 ring-slate-500/20';
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 min-h-screen">
      <div className="flex items-center justify-between animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3 bg-gradient-to-r from-rose-600 via-rose-500 to-orange-500 dark:from-rose-400 dark:via-rose-300 dark:to-orange-300 bg-clip-text text-transparent">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-rose-500 to-orange-500 shadow-lg shadow-rose-500/20">
              <AlertTriangle className="h-5 w-5 text-white" />
            </div>
            Exception Center
          </h2>
          <p className="text-muted-foreground mt-1">
            Investigate and resolve financial discrepancies.
          </p>
        </div>
      </div>

      <div className="animate-fade-in-up stagger-2 rounded-2xl border border-border/50 bg-white dark:bg-slate-950/60 backdrop-blur-sm shadow-sm flex flex-col overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-border/50 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="relative w-full sm:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 group-focus-within:text-rose-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search exceptions..."
              className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:bg-white dark:focus:bg-slate-900 transition-all duration-200"
            />
          </div>
          <div className="flex w-full sm:w-auto space-x-2">
            <select 
              value={filter} 
              onChange={(e) => { setFilter(e.target.value); setPage(0); }}
              className="bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-full sm:w-auto cursor-pointer transition-all duration-200"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
              <option value="OBSOLETE">Obsolete</option>
            </select>
            <button 
              onClick={handleExport}
              className="group inline-flex items-center justify-center rounded-xl text-sm font-medium border border-border/50 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 px-4 py-2.5 transition-all duration-200 text-slate-600 dark:text-slate-300 w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2 text-slate-400 group-hover:text-blue-500 transition-colors group-hover:-translate-y-0.5 transition-transform duration-200" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/20">
                <th className="h-11 px-4 text-left font-medium text-slate-500 text-xs uppercase tracking-wider w-[100px]">Detected</th>
                <th className="h-11 px-4 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Payment ID</th>
                <th className="h-11 px-4 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Type</th>
                <th className="h-11 px-4 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Financial Impact</th>
                <th className="h-11 px-4 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Severity</th>
                <th className="h-11 px-4 text-left font-medium text-slate-500 text-xs uppercase tracking-wider">Status</th>
                <th className="h-11 px-4 text-right font-medium text-slate-500 text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-slate-400">
                      <Loader2 className="h-5 w-5 animate-spin text-rose-500" />
                      <span className="text-sm">Loading exceptions...</span>
                    </div>
                  </td>
                </tr>
              ) : exceptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-slate-400 text-sm">No exceptions found.</td>
                </tr>
              ) : (
                exceptions.map((ex, idx) => (
                  <tr 
                    key={ex.id} 
                    className={`border-b border-border/30 transition-all duration-200 hover:bg-rose-50/20 dark:hover:bg-rose-950/5 group animate-fade-in-up ${
                      ex.status === 'OPEN' ? 'bg-rose-50/10 dark:bg-rose-950/5' : ''
                    }`}
                    style={{ animationDelay: `${idx * 30}ms`, animationDuration: '0.3s' }}
                  >
                    <td className="p-4 align-middle text-slate-500 dark:text-slate-400 whitespace-nowrap text-xs">
                      {formatDate(ex.createdAt)}
                    </td>
                    <td className="p-4 align-middle font-medium text-slate-800 dark:text-slate-200 text-sm">
                      {ex.payment?.externalPaymentId || <span className="text-slate-400 italic text-xs">Unlinked</span>}
                    </td>
                    <td className="p-4 align-middle">
                      <div className="text-[11px] font-semibold bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg w-fit text-slate-700 dark:text-slate-300">
                        {ex.type.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="p-4 align-middle font-bold text-rose-600 dark:text-rose-400 text-sm">
                      {formatCurrency(ex.financialImpact)}
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] uppercase font-bold tracking-wider ${getSeverityStyle(ex.severity)}`}>
                        {ex.severity}
                      </span>
                    </td>
                    <td className="p-4 align-middle">
                      <span className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold ${getStatusStyle(ex.status)}`}>
                        {ex.status}
                      </span>
                    </td>
                    <td className="p-4 align-middle text-right">
                      <Link href={`/exceptions/${ex.id}`} className="inline-flex items-center justify-center rounded-lg text-xs font-medium border border-border/50 bg-white dark:bg-slate-900 hover:bg-rose-50 dark:hover:bg-rose-950/20 h-8 px-3 transition-all duration-200 text-rose-600 dark:text-rose-400">
                        <FileText className="w-3 h-3 mr-1.5" /> Investigate
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
            Showing <span className="font-semibold text-slate-800 dark:text-slate-200">{exceptions.length > 0 ? page * limit + 1 : 0}</span> to <span className="font-semibold text-slate-800 dark:text-slate-200">{Math.min((page + 1) * limit, total)}</span> of <span className="font-semibold text-slate-800 dark:text-slate-200">{total}</span> exceptions
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
