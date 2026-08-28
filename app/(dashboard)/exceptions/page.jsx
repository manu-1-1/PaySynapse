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
    if (severity === 'HIGH') return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
    return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'OPEN': return 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400';
      case 'INVESTIGATING': return 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400';
      case 'RESOLVED': return 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400';
      case 'OBSOLETE': return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400';
    }
  };

  return (
    <div className="flex-1 space-y-5 p-6 pt-5 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Exception Center</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Investigate and resolve financial discrepancies.
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
              placeholder="Search exceptions..."
              className="w-full bg-[var(--muted)] rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-[#528FF0] border border-transparent transition-colors duration-150"
            />
          </div>
          <div className="flex w-full sm:w-auto space-x-2">
            <select 
              value={filter} 
              onChange={(e) => { setFilter(e.target.value); setPage(0); }}
              className="bg-[var(--muted)] rounded-lg px-3 py-2 text-sm focus:outline-none border border-transparent focus:border-[#528FF0] w-full sm:w-auto cursor-pointer transition-colors duration-150"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
              <option value="OBSOLETE">Obsolete</option>
            </select>
            <button 
              onClick={handleExport}
              className="inline-flex items-center justify-center rounded-lg text-sm font-medium border border-[var(--border)] bg-[var(--surface)] px-4 py-2 hover:bg-[var(--surface-hover)] transition-colors duration-150 w-full sm:w-auto"
            >
              <Download className="w-4 h-4 mr-2 text-gray-400" />
              Export CSV
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="w-full overflow-auto">
          <table className="w-full caption-bottom text-sm">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--muted)]">
                <th className="h-10 px-4 text-left font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wider w-[100px]">Detected</th>
                <th className="h-10 px-4 text-left font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wider">Payment ID</th>
                <th className="h-10 px-4 text-left font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wider">Type</th>
                <th className="h-10 px-4 text-left font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wider">Financial Impact</th>
                <th className="h-10 px-4 text-left font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wider">Severity</th>
                <th className="h-10 px-4 text-left font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wider">Status</th>
                <th className="h-10 px-4 text-right font-medium text-[var(--muted-foreground)] text-xs uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center">
                    <div className="flex items-center justify-center gap-2 text-gray-400">
                      <Loader2 className="h-5 w-5 animate-spin text-red-500" />
                      <span className="text-sm">Loading exceptions...</span>
                    </div>
                  </td>
                </tr>
              ) : exceptions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="h-32 text-center text-gray-400 text-sm">No exceptions found.</td>
                </tr>
              ) : (
                exceptions.map((ex) => (
                  <tr 
                    key={ex.id} 
                    className={`border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors duration-100 group ${
                      ex.status === 'OPEN' ? 'bg-red-50/30 dark:bg-red-900/5' : ''
                    }`}
                  >
                    <td className="p-3 align-middle text-[var(--muted-foreground)] whitespace-nowrap text-xs">
                      {formatDate(ex.createdAt)}
                    </td>
                    <td className="p-3 align-middle font-medium text-[var(--foreground)] text-sm">
                      {ex.payment?.externalPaymentId || <span className="text-gray-400 italic text-xs">Unlinked</span>}
                    </td>
                    <td className="p-3 align-middle">
                      <div className="text-[11px] font-semibold bg-[var(--muted)] px-2 py-0.5 rounded-md w-fit">
                        {ex.type.replace(/_/g, ' ')}
                      </div>
                    </td>
                    <td className="p-3 align-middle font-bold text-red-600 dark:text-red-400 text-sm">
                      {formatCurrency(ex.financialImpact)}
                    </td>
                    <td className="p-3 align-middle">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase font-bold tracking-wider ${getSeverityStyle(ex.severity)}`}>
                        {ex.severity}
                      </span>
                    </td>
                    <td className="p-3 align-middle">
                      <span className={`px-2 py-0.5 rounded-md text-[11px] font-semibold ${getStatusStyle(ex.status)}`}>
                        {ex.status}
                      </span>
                    </td>
                    <td className="p-3 align-middle text-right">
                      <Link href={`/exceptions/${ex.id}`} className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] h-7 px-2.5 transition-colors duration-100 text-red-600 dark:text-red-400">
                        <FileText className="w-3 h-3 mr-1" /> Investigate
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="p-3 border-t border-[var(--border)] flex items-center justify-between text-sm text-[var(--muted-foreground)]">
          <div>
            Showing <span className="font-semibold text-[var(--foreground)]">{exceptions.length > 0 ? page * limit + 1 : 0}</span> to <span className="font-semibold text-[var(--foreground)]">{Math.min((page + 1) * limit, total)}</span> of <span className="font-semibold text-[var(--foreground)]">{total}</span> exceptions
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
