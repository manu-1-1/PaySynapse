'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, FileText, CheckCircle2, ExternalLink, Sparkles, Bot, Loader2 } from 'lucide-react';
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
  
  // AI Investigation State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);

  useEffect(() => {
    if (ex?.aiExplanation) {
      setAiResult({ explanation: ex.aiExplanation, recommendedAction: ex.recommendedAction, confidence: ex.aiConfidence });
    }
  }, [ex]);

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

  const handleInvestigateAI = async () => {
    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exceptionId: params.id })
      });
      const data = await res.json();
      if (res.ok) {
        setAiResult(data.data);
      } else {
        alert(data.error);
      }
    } catch(e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

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
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <div className="h-10 w-10 rounded-full border-[3px] border-red-500/20 border-t-red-500 animate-spin" />
      </div>
    );
  }

  if (!ex) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold">Exception not found.</h2>
        <button onClick={() => router.back()} className="mt-3 text-sm font-medium text-[#528FF0] hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const isResolved = ex.status === 'RESOLVED' || ex.status === 'OBSOLETE';

  return (
    <div className="flex-1 space-y-5 p-6 pt-5 min-h-screen">
      <div className="flex items-center space-x-3">
        <button 
          onClick={() => router.back()} 
          className="p-2 border border-[var(--border)] rounded-lg hover:bg-[var(--surface-hover)] bg-[var(--surface)] transition-colors duration-150"
        >
          <ArrowLeft className="w-4 h-4 text-[var(--muted-foreground)]" />
        </button>
        <div>
          <div className="flex items-center space-x-2.5">
            <h2 className="text-lg font-semibold text-red-600 dark:text-red-400">Exception Triage</h2>
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
              isResolved 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' 
                : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
            }`}>
              {ex.status}
            </span>
          </div>
          <p className="text-[var(--muted-foreground)] mt-0.5 text-sm">Detected at {formatDate(ex.createdAt)}</p>
        </div>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        
        {/* Exception Details Card */}
        <div className="md:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm p-5 space-y-5">
          <div className="flex items-center space-x-2.5 text-red-600 dark:text-red-400">
            <div className="p-1.5 rounded-md bg-red-50 dark:bg-red-900/20">
              <AlertCircle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold">{ex.type.replace(/_/g, ' ')}</h3>
          </div>
          
          <div className="p-3.5 bg-[var(--muted)] rounded-lg border border-[var(--border)] font-mono text-sm">
            {ex.description}
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-[var(--border)] pt-5">
            <div>
              <div className="text-sm font-medium text-[var(--muted-foreground)] mb-1">Financial Impact</div>
              <div className="text-2xl font-bold text-red-600 dark:text-red-400">{formatCurrency(ex.financialImpact)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-[var(--muted-foreground)] mb-1">Severity</div>
              <div className="mt-1">
                <span className={`px-2 py-0.5 rounded-md text-xs uppercase font-bold tracking-wider ${
                  ex.severity === 'HIGH' ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400' : 'bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400'
                }`}>
                  {ex.severity}
                </span>
              </div>
            </div>
          </div>
          
          {!aiResult && !aiLoading && (
            <button 
              onClick={handleInvestigateAI} 
              className="mt-2 w-full flex items-center justify-center p-2.5 bg-[#528FF0] hover:bg-[#4080E0] text-white rounded-lg font-medium text-sm transition-colors duration-150"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Run AI Root Cause Investigation
            </button>
          )}
          {aiLoading && (
            <div className="mt-2 w-full flex items-center justify-center p-3 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--muted-foreground)] text-sm">
              <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-[#528FF0]" /> AI is analyzing financial nodes...</div>
            </div>
          )}
          {aiResult && (
            <div className="mt-4 border border-blue-200 dark:border-blue-800/30 bg-blue-50/50 dark:bg-blue-900/10 rounded-lg overflow-hidden">
              <div className="bg-blue-100/70 dark:bg-blue-900/30 px-4 py-2.5 border-b border-blue-200/50 dark:border-blue-800/30 flex items-center justify-between">
                <div className="flex items-center text-[#528FF0] font-semibold text-sm">
                  <Bot className="w-4 h-4 mr-2" /> AI Investigation Report
                </div>
                <div className="text-xs font-mono text-[#528FF0] bg-blue-200/50 dark:bg-blue-900/50 px-2 py-0.5 rounded-md">Confidence: {(aiResult.confidence * 100).toFixed(1)}%</div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-xs font-semibold text-[#528FF0]/70 uppercase tracking-wider mb-1">Findings</div>
                  <div className="text-sm leading-relaxed">{aiResult.explanation}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-[#528FF0]/70 uppercase tracking-wider mb-1">Recommended Action</div>
                  <div className="text-sm font-medium bg-[var(--surface)] p-2.5 rounded-lg border border-blue-100 dark:border-blue-800/30">{aiResult.recommendedAction}</div>
                </div>
              </div>
            </div>
          )}

          {ex.paymentId && (
            <div className="border-t border-[var(--border)] pt-5">
              <div className="text-sm font-medium text-[var(--muted-foreground)] mb-2">Associated Payment</div>
              <div className="flex items-center justify-between p-3.5 bg-[var(--muted)] rounded-lg border border-[var(--border)]">
                <div>
                  <div className="font-semibold text-sm">{ex.payment?.externalPaymentId || 'N/A'}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">Order: {ex.payment?.order?.externalOrderId || 'N/A'}</div>
                </div>
                <Link href={`/transactions/${ex.paymentId}`} className="text-[#528FF0] hover:underline text-sm font-medium flex items-center gap-1">
                  View Lineage <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Resolution Actions Card */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm p-5 h-fit">
          <h3 className="font-semibold mb-4 flex items-center text-sm">
            <FileText className="w-4 h-4 mr-2 text-[#528FF0]" /> Action Center
          </h3>
          
          {isResolved ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/30 rounded-lg text-center space-y-1.5">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
              <div className="font-semibold text-emerald-800 dark:text-emerald-400 text-sm">{ex.status === 'OBSOLETE' ? 'Exception Obsolete (Superseded)' : 'Exception Resolved'}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Resolved at {formatDate(ex.resolvedAt)}</div>
            </div>
          ) : (
            <form onSubmit={handleResolve} className="space-y-3">
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)] block mb-1">Change Status To</label>
                <select 
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#528FF0] transition-colors duration-150"
                >
                  <option value="INVESTIGATING">Investigating</option>
                  <option value="RESOLVED">Resolved (Fixed)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-[var(--muted-foreground)] block mb-1">Audit Note (Required)</label>
                <textarea 
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Explain the investigation findings or resolution action..."
                  className="w-full h-24 bg-[var(--muted)] border border-[var(--border)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#528FF0] resize-none transition-colors duration-150"
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={submitting || !note}
                className="w-full inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150 bg-[#528FF0] hover:bg-[#4080E0] text-white h-9 px-4 disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Update Status'}
              </button>
            </form>
          )}
        </div>
        
      </div>
    </div>
  );
}
