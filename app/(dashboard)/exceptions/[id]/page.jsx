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
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-[3px] border-rose-500/20 border-t-rose-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <AlertCircle className="h-5 w-5 text-rose-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!ex) {
    return (
      <div className="p-8 text-center animate-fade-in-up">
        <h2 className="text-xl font-bold">Exception not found.</h2>
        <button onClick={() => router.back()} className="mt-4 text-sm font-medium text-blue-600 hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const isResolved = ex.status === 'RESOLVED' || ex.status === 'OBSOLETE';

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 min-h-screen">
      <div className="flex items-center space-x-4 animate-fade-in-up">
        <button 
          onClick={() => router.back()} 
          className="p-2.5 border border-border/50 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/60 bg-white dark:bg-slate-900 transition-all duration-200 shadow-sm"
        >
          <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-300" />
        </button>
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold tracking-tight text-rose-600 dark:text-rose-400">Exception Triage</h2>
            <span className={`px-3 py-1 rounded-xl text-xs font-semibold ${
              isResolved 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 ring-1 ring-emerald-500/20' 
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 ring-1 ring-rose-500/20'
            }`}>
              {ex.status}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">Detected at {formatDate(ex.createdAt)}</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        
        {/* Exception Details Card */}
        <div className="md:col-span-2 rounded-2xl border border-border/50 bg-white dark:bg-slate-950/60 backdrop-blur-sm shadow-sm p-6 space-y-6 animate-fade-in-up stagger-1">
          <div className="flex items-center space-x-3 text-rose-600 dark:text-rose-400">
            <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30">
              <AlertCircle className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-semibold">{ex.type.replace(/_/g, ' ')}</h3>
          </div>
          
          <div className="p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-border/50 font-mono text-sm text-slate-700 dark:text-slate-300">
            {ex.description}
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-border/50 pt-6">
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Financial Impact</div>
              <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(ex.financialImpact)}</div>
            </div>
            <div>
              <div className="text-sm font-medium text-slate-500 mb-1">Severity</div>
              <div className="mt-1">
                <span className={`px-3 py-1 rounded-xl text-xs uppercase font-bold tracking-wider ${
                  ex.severity === 'HIGH' ? 'bg-rose-50 text-rose-700 dark:bg-rose-950/30 dark:text-rose-400 ring-1 ring-rose-500/20' : 'bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 ring-1 ring-amber-500/20'
                }`}>
                  {ex.severity}
                </span>
              </div>
            </div>
          </div>
          
          {!aiResult && !aiLoading && (
            <button 
              onClick={handleInvestigateAI} 
              className="mt-4 w-full flex items-center justify-center p-3.5 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-sm hover:shadow-lg hover:shadow-indigo-500/20 transition-all duration-200 font-medium text-sm"
            >
              <Sparkles className="w-4 h-4 mr-2" /> Run AI Root Cause Investigation
            </button>
          )}
          {aiLoading && (
            <div className="mt-4 w-full flex items-center justify-center p-4 bg-slate-50 dark:bg-slate-900/60 border border-border/50 rounded-xl text-slate-500 text-sm">
              <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-indigo-500" /> AI is analyzing financial nodes...</div>
            </div>
          )}
          {aiResult && (
            <div className="mt-6 border border-indigo-200/50 dark:border-indigo-800/30 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl overflow-hidden animate-fade-in-up">
              <div className="bg-indigo-100/70 dark:bg-indigo-900/40 px-5 py-3 border-b border-indigo-200/50 dark:border-indigo-800/30 flex items-center justify-between">
                <div className="flex items-center text-indigo-800 dark:text-indigo-300 font-semibold text-sm">
                  <Bot className="w-4 h-4 mr-2" /> AI Investigation Report
                </div>
                <div className="text-xs font-mono text-indigo-600 dark:text-indigo-300 bg-indigo-200/70 dark:bg-indigo-900 px-2.5 py-1 rounded-lg">Confidence: {(aiResult.confidence * 100).toFixed(1)}%</div>
              </div>
              <div className="p-5 space-y-4">
                <div>
                  <div className="text-xs font-semibold text-indigo-800/70 dark:text-indigo-400/70 uppercase tracking-wider mb-1.5">Findings</div>
                  <div className="text-sm text-slate-700 dark:text-slate-200 leading-relaxed">{aiResult.explanation}</div>
                </div>
                <div>
                  <div className="text-xs font-semibold text-indigo-800/70 dark:text-indigo-400/70 uppercase tracking-wider mb-1.5">Recommended Action</div>
                  <div className="text-sm font-medium text-indigo-900 dark:text-indigo-100 bg-white dark:bg-slate-900/80 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/30">{aiResult.recommendedAction}</div>
                </div>
              </div>
            </div>
          )}

          {ex.paymentId && (
            <div className="border-t border-border/50 pt-6">
              <div className="text-sm font-medium text-slate-500 mb-3">Associated Payment</div>
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-border/50">
                <div>
                  <div className="font-semibold text-slate-800 dark:text-slate-200">{ex.payment?.externalPaymentId || 'N/A'}</div>
                  <div className="text-xs text-slate-500 mt-1">Order: {ex.payment?.order?.externalOrderId || 'N/A'}</div>
                </div>
                <Link href={`/transactions/${ex.paymentId}`} className="text-blue-600 dark:text-blue-400 hover:underline text-sm font-medium flex items-center gap-1">
                  View Lineage <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Resolution Actions Card */}
        <div className="rounded-2xl border border-border/50 bg-white dark:bg-slate-950/60 backdrop-blur-sm shadow-sm p-6 h-fit animate-fade-in-up stagger-2">
          <h3 className="font-semibold text-lg mb-4 flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-500" /> Action Center
          </h3>
          
          {isResolved ? (
            <div className="p-5 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/30 rounded-xl text-center space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <div className="font-semibold text-emerald-800 dark:text-emerald-400">{ex.status === 'OBSOLETE' ? 'Exception Obsolete (Superseded)' : 'Exception Resolved'}</div>
              <div className="text-xs text-slate-500">Resolved at {formatDate(ex.resolvedAt)}</div>
            </div>
          ) : (
            <form onSubmit={handleResolve} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Change Status To</label>
                <select 
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-border/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200"
                >
                  <option value="INVESTIGATING">Investigating</option>
                  <option value="RESOLVED">Resolved (Fixed)</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600 dark:text-slate-300 block mb-1.5">Audit Note (Required)</label>
                <textarea 
                  required
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="Explain the investigation findings or resolution action..."
                  className="w-full h-24 bg-slate-50 dark:bg-slate-900 border border-border/50 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 resize-none transition-all duration-200"
                ></textarea>
              </div>
              <button 
                type="submit"
                disabled={submitting || !note}
                className="w-full inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-200 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm hover:shadow-lg hover:shadow-blue-500/20 h-10 px-4 disabled:opacity-50"
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
