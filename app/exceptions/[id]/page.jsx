'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, FileText, CheckCircle2, Search, ExternalLink } from 'lucide-react';
import Link from 'next/link';

export default function ExceptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ex, setEx] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Resolution Form State
  const [note, setNote] = useState('');
  const [targetStatus, setTargetStatus] = useState('INVESTIGATING');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchEx = async () => {
      try {
        const res = await fetch(`/api/exceptions/${params.id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setEx(data.data);
        if (data.data.status !== 'OPEN') setTargetStatus('RESOLVED');
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchEx();
  }, [params.id]);

  const handleResolve = async (e) => {
    e.preventDefault();
    if (!note) return alert('Audit note is required to change status.');
    
    setSubmitting(true);
    try {
      const res = await fetch(`/api/exceptions/${params.id}/resolve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ note, newStatus: targetStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setEx(data.data);
        setNote('');
      } else {
        alert('Failed to update exception');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN');
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!ex) {
    return <div className="p-8 text-center"><h2 className="text-xl">Exception not found.</h2><button onClick={() => router.back()} className="mt-4 text-primary">Go Back</button></div>;
  }

  const isResolved = ex.status === 'RESOLVED';

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="flex items-center space-x-4">
        <button onClick={() => router.back()} className="p-2 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-950 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">Exception Triage</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              isResolved ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {ex.status}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">Detected at {formatDate(ex.createdAt)}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Exception Details Card */}
        <div className="md:col-span-2 rounded-xl border bg-white dark:bg-slate-950 shadow-sm p-6 space-y-6">
          <div className="flex items-center space-x-2 text-rose-600 dark:text-rose-400">
            <AlertCircle className="w-5 h-5" />
            <h3 className="text-lg font-semibold">{ex.type.replace(/_/g, ' ')}</h3>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border font-mono text-sm text-slate-700 dark:text-slate-300">
            {ex.description}
          </div>

          <div className="grid grid-cols-2 gap-4 border-t pt-6">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Financial Impact</div>
              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(ex.financialImpact)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Severity</div>
              <div className="mt-1">
                <span className={`px-2 py-1 rounded text-xs uppercase font-bold tracking-wider ${
                  ex.severity === 'HIGH' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {ex.severity}
                </span>
              </div>
            </div>
          </div>
          
          {ex.paymentId && (
            <div className="border-t pt-6">
              <div className="text-sm font-medium text-slate-500 mb-3">Associated Payment</div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900 rounded-lg border">
                <div>
                  <div className="font-semibold">{ex.payment.externalPaymentId}</div>
                  <div className="text-xs text-slate-500 mt-1">Order: {ex.payment.order?.externalOrderId}</div>
                </div>
                <Link href={`/transactions/${ex.paymentId}`} className="text-primary hover:underline text-sm font-medium flex items-center">
                  View Lineage <ExternalLink className="w-3 h-3 ml-1" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Resolution Actions Card */}
        <div className="rounded-xl border bg-white dark:bg-slate-950 shadow-sm p-6 h-fit">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-primary" /> Action Center
          </h3>
          
          {isResolved ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 rounded-lg text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="font-semibold text-emerald-800 dark:text-emerald-400">Exception Resolved</div>
              <div className="text-xs text-slate-500">Resolved at {formatDate(ex.resolvedAt)}</div>
            </div>
          ) : (
            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Change Status To</label>
                <select 
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="INVESTIGATING">Investigating</option>
                  <option value="RESOLVED">Resolved (Fixed)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Audit Note (Required)</label>
                <textarea 
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Explain the investigation findings or resolution action..."
                  className="w-full h-24 bg-slate-50 dark:bg-slate-900 border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={submitting || !note}
                className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 disabled:opacity-50"
              >
                {submitting ? 'Updating...' : 'Update Status'}
              </button>
            </form>
          )}
        </div>
        
      </div>
    </div>
  );
}
