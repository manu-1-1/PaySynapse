'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, AlertCircle, FileText, CheckCircle2, ExternalLink, Sparkles, Bot, Loader2, Send, ShieldCheck, Lightbulb, Code2, FileCode } from 'lucide-react';
import Link from 'next/link';
import { DisputePacketModal } from '@/components/DisputePacketModal';
import { PreventionPlaybookModal } from '@/components/PreventionPlaybookModal';

export default function ExceptionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [ex, setEx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showPreventionModal, setShowPreventionModal] = useState(false);
  
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
    <div className="flex-1 space-y-5 p-4 sm:p-6 pt-4 sm:pt-5 min-h-screen">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 border border-[var(--border)] rounded-lg hover:bg-[var(--surface-hover)] bg-[var(--surface)] transition-colors duration-150 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--muted-foreground)]" />
          </button>
          <div>
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
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

        <button
          onClick={() => setShowPreventionModal(true)}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm w-full sm:w-auto"
        >
          <ShieldCheck className="w-3.5 h-3.5" /> Prevention Playbook
        </button>
      </div>

      <div className="grid gap-5 grid-cols-1 md:grid-cols-3">
        
        {/* Exception Details Card */}
        <div className="md:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm p-5 space-y-5">
          <div className="flex items-center space-x-2.5 text-red-500">
            <div className="p-1.5 rounded-md bg-[var(--muted)] border border-[var(--border)]">
              <AlertCircle className="w-4 h-4 text-rose-400" />
            </div>
            <h3 className="text-base font-semibold text-[var(--foreground)]">{ex.type.replace(/_/g, ' ')}</h3>
          </div>
          
          <div className="p-3.5 bg-[var(--muted)] rounded-lg border border-[var(--border)] font-mono text-xs leading-relaxed text-[var(--foreground)]">
            {ex.description}
          </div>

          {/* Unified Telemetry Strip */}
          <div className="rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 grid grid-cols-2 divide-x divide-[var(--border)] overflow-hidden">
            <div className="p-3.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">Variance Value</div>
              <div className="text-xl font-bold font-mono text-rose-400 mt-0.5">{formatCurrency(ex.financialImpact)}</div>
              <div className="text-[10px] font-mono text-[var(--muted-foreground)] mt-0.5">Discrepancy pool</div>
            </div>
            <div className="p-3.5">
              <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">SLA Severity</div>
              <div className="mt-1 flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${ex.severity === 'HIGH' ? 'bg-rose-400 animate-pulse' : 'bg-amber-400'}`} />
                <span className="font-mono font-bold text-xs uppercase tracking-wider text-[var(--foreground)]">
                  {ex.severity} Priority
                </span>
              </div>
              <div className="text-[10px] font-mono text-[var(--muted-foreground)] mt-0.5">Deterministic audit tag</div>
            </div>
          </div>
          
          {!aiResult && !aiLoading && (
            <button 
              onClick={handleInvestigateAI} 
              className="mt-2 w-full flex items-center justify-center gap-2 p-2.5 bg-[#528FF0] hover:bg-[#4080E0] text-white rounded-lg font-medium text-sm transition-colors duration-150 shadow-sm"
            >
              <Code2 className="w-4 h-4" /> Run Root Cause Diagnostics
            </button>
          )}
          {aiLoading && (
            <div className="mt-2 w-full flex items-center justify-center p-3 bg-[var(--muted)] border border-[var(--border)] rounded-lg text-[var(--muted-foreground)] text-sm font-mono text-xs">
              <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin text-[#528FF0]" /> Evaluating multi-node financial ledgers...</div>
            </div>
          )}
          {aiResult && (
            <div className="mt-4 border border-[var(--border)] bg-[var(--muted)]/30 rounded-lg overflow-hidden">
              <div className="bg-[var(--muted)] px-4 py-2.5 border-b border-[var(--border)] flex items-center justify-between">
                <div className="flex items-center text-[var(--foreground)] font-semibold text-xs font-mono">
                  <FileCode className="w-4 h-4 mr-2 text-[#528FF0]" /> Root Cause Diagnostic Report
                </div>
                <div className="text-[10px] font-mono text-[var(--muted-foreground)] bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded">Confidence: {(aiResult.confidence * 100).toFixed(1)}%</div>
              </div>
              <div className="p-4 space-y-3">
                <div>
                  <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Telemetry Findings</div>
                  <div className="text-xs leading-relaxed text-[var(--foreground)] font-mono bg-[var(--surface)] p-3 rounded border border-[var(--border)]">{aiResult.explanation}</div>
                </div>
                <div>
                  <div className="text-[10px] font-mono font-semibold uppercase tracking-wider text-[var(--muted-foreground)] mb-1">Recommended Remediation</div>
                  <div className="text-xs font-mono text-[var(--foreground)] bg-[var(--surface)] p-3 rounded border border-[var(--border)]">{aiResult.recommendedAction}</div>
                </div>
              </div>
            </div>
          )}

          {/* Inline Prevention Tip Card */}
          <div className="p-4 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-md bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                <Lightbulb className="w-4 h-4" />
              </div>
              <div>
                <span className="font-semibold text-emerald-800 dark:text-emerald-300 block">Want to prevent this mismatch permanently?</span>
                <span className="text-[var(--muted-foreground)]">Review our 3-step operational and engineering prevention playbook.</span>
              </div>
            </div>
            <button
              onClick={() => setShowPreventionModal(true)}
              className="px-3 py-1.5 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white font-medium whitespace-nowrap transition-colors"
            >
              Open Playbook
            </button>
          </div>

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
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm p-5 h-fit space-y-4">
          <h3 className="font-semibold flex items-center text-sm">
            <FileText className="w-4 h-4 mr-2 text-[#528FF0]" /> Action Center
          </h3>

          {/* Dispute Packet Generator Button */}
          <div className="p-3 bg-red-50/50 dark:bg-red-900/10 rounded-lg border border-red-200/60 dark:border-red-800/30">
            <div className="text-xs font-semibold text-red-700 dark:text-red-400 mb-1">Gateway Dispute Desk</div>
            <p className="text-[11px] text-[var(--muted-foreground)] mb-2.5">
              Generate a formal legal dispute dossier with cryptographic hashes ready for Razorpay/Bank operations.
            </p>
            <button
              onClick={() => setShowDisputeModal(true)}
              className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
            >
              <FileText className="w-3.5 h-3.5" /> Generate Dispute Packet
            </button>
          </div>
          
          {isResolved ? (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-900/15 border border-emerald-200 dark:border-emerald-800/30 rounded-lg text-center space-y-1.5">
              <CheckCircle2 className="w-7 h-7 text-emerald-500 mx-auto" />
              <div className="font-semibold text-emerald-800 dark:text-emerald-400 text-sm">{ex.status === 'OBSOLETE' ? 'Exception Obsolete (Superseded)' : 'Exception Resolved'}</div>
              <div className="text-xs text-[var(--muted-foreground)]">Resolved at {formatDate(ex.resolvedAt)}</div>
            </div>
          ) : (
            <form onSubmit={handleResolve} className="space-y-3 pt-2 border-t border-[var(--border)]">
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

      {/* Dispute Modal */}
      <DisputePacketModal
        isOpen={showDisputeModal}
        onClose={() => setShowDisputeModal(false)}
        exception={ex}
        payment={ex.payment}
      />

      {/* Prevention Playbook Modal */}
      <PreventionPlaybookModal
        isOpen={showPreventionModal}
        onClose={() => setShowPreventionModal(false)}
        exceptionType={ex?.type}
      />
    </div>
  );
}

