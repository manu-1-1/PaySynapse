'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle, 
  Clock, 
  Building2, 
  Receipt, 
  ArrowRightLeft, 
  CreditCard, 
  Loader2,
  Sparkles,
  Bot,
  FileText,
  MessageSquare,
  TrendingDown,
  ShieldAlert,
  ShieldCheck,
  HelpCircle,
  ExternalLink,
  Lightbulb,
  Code2,
  Terminal
} from 'lucide-react';
import Link from 'next/link';
import { DisputePacketModal } from '@/components/DisputePacketModal';
import { PreventionPlaybookModal } from '@/components/PreventionPlaybookModal';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [selectedExceptionForDispute, setSelectedExceptionForDispute] = useState(null);
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [showPreventionModal, setShowPreventionModal] = useState(false);
  const [preventionType, setPreventionType] = useState('FEE_MISMATCH');

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await fetch(`/api/transactions/${params.id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setTx(data.data);

        // Preload any existing AI investigation from active exception
        const activeEx = data.data?.exceptions?.find(e => e.status === 'OPEN') || data.data?.exceptions?.[0];
        if (activeEx) {
          setPreventionType(activeEx.type);
        }
        if (activeEx?.aiExplanation) {
          setAiResult({
            explanation: activeEx.aiExplanation,
            recommendedAction: activeEx.recommendedAction,
            confidence: activeEx.aiConfidence || 0.95
          });
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, [params.id]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleString('en-IN');
  };

  const handleRunAiInvestigation = async () => {
    const targetEx = tx.exceptions?.find(e => e.status === 'OPEN') || tx.exceptions?.[0];
    if (!targetEx) return;

    setAiLoading(true);
    try {
      const res = await fetch('/api/ai/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exceptionId: targetEx.id })
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setAiResult(data.data);
      } else {
        alert(data.error || 'Failed to generate AI investigation');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-3.5rem)]">
        <div className="h-10 w-10 rounded-full border-[3px] border-[#528FF0]/20 border-t-[#528FF0] animate-spin" />
      </div>
    );
  }

  if (!tx) {
    return (
      <div className="p-6 text-center">
        <h2 className="text-lg font-semibold">Transaction not found.</h2>
        <button onClick={() => router.back()} className="mt-3 text-sm font-medium text-[#528FF0] hover:underline">
          Go Back
        </button>
      </div>
    );
  }

  const recon = tx.reconciliations?.[0];
  const isMatched = recon?.status === 'MATCHED';
  const openExceptions = tx.exceptions?.filter(e => e.status === 'OPEN') || [];
  const hasExceptions = tx.exceptions?.length > 0;
  const primaryException = openExceptions[0] || tx.exceptions?.[0];

  // Derive dynamic natural language synthesis
  const feeTotal = tx.fees?.reduce((acc, f) => acc + (f.amount || 0), 0) || 0;
  const taxTotal = tx.fees?.reduce((acc, f) => acc + (f.tax || 0), 0) || 0;
  const hasSettlement = tx.settlements && tx.settlements.length > 0;
  const bankTx = tx.settlements?.[0]?.bankTransactions?.[0];

  const getNaturalSummary = () => {
    if (isMatched && !openExceptions.length) {
      return `Payment of ${formatCurrency(tx.amount)} via ${tx.method} matched perfectly. Net payout of ${formatCurrency(recon?.actualAmount || tx.amount - feeTotal - taxTotal)} was credited to bank ledger under UTR ${bankTx?.reference || 'CLEARED'}. Zero variance detected.`;
    }

    if (openExceptions.some(e => e.type === 'FEE_MISMATCH')) {
      const ex = openExceptions.find(e => e.type === 'FEE_MISMATCH') || tx.exceptions.find(e => e.type === 'FEE_MISMATCH');
      return `Contract overcharge detected: Gateway billed ${formatCurrency(feeTotal)} in processing fees (${((feeTotal / tx.amount) * 100).toFixed(2)}%), exceeding your agreed tier. This results in a direct merchant margin loss of ${formatCurrency(ex?.financialImpact || 0.60)}. Bank settlement ${hasSettlement ? `arrived at ${formatCurrency(tx.settlements[0].amount)}` : 'is pending'}.`;
    }

    if (openExceptions.some(e => e.type === 'MISSING_SETTLEMENT')) {
      return `Payment was successfully captured by gateway for ${formatCurrency(tx.amount)}, but no matching settlement batch or bank credit has arrived yet. In-flight funds are under T+1 SLA monitoring.`;
    }

    if (openExceptions.length > 0) {
      return `Transaction flagged with ${openExceptions.length} active discrepancy: ${primaryException.description}. Total financial variance: ${formatCurrency(primaryException.financialImpact)}.`;
    }

    return `Payment ${tx.externalPaymentId} for ${formatCurrency(tx.amount)} is currently in ${tx.status} state.`;
  };

  return (
    <div className="flex-1 space-y-5 p-4 sm:p-6 pt-4 sm:pt-5 min-h-screen">
      {/* Top Bar Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => router.back()} 
            className="p-2 border border-[var(--border)] rounded-lg hover:bg-[var(--surface-hover)] bg-[var(--surface)] transition-colors duration-150 shrink-0"
          >
            <ArrowLeft className="w-4 h-4 text-[var(--muted-foreground)]" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <h2 className="text-lg font-semibold truncate max-w-[220px] sm:max-w-none">Payment: {tx.externalPaymentId}</h2>
              <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
                tx.status === 'CAPTURED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
              }`}>
                {tx.status}
              </span>
            </div>
            <p className="text-[var(--muted-foreground)] mt-0.5 text-sm">Created at {formatDate(tx.createdAt)}</p>
          </div>
        </div>

        {/* Action Link to Copilot & Playbook */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setPreventionType(primaryException?.type || 'FEE_MISMATCH');
              setShowPreventionModal(true);
            }}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-emerald-300 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors"
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> Prevention Playbook
          </button>
          <Link
            href={`/digital-twin`}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5 text-[#528FF0]" /> Digital Twin
          </Link>
          <Link
            href={`/copilot`}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[var(--muted)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] border border-[var(--border)] transition-colors shadow-sm"
          >
            <Terminal className="w-3.5 h-3.5 text-[#528FF0]" /> Query Engine
          </Link>
        </div>
      </div>

      {/* Unified Telemetry Strip */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm grid grid-cols-2 sm:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)] overflow-hidden">
        <div className="p-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">Gross Amount</div>
          <div className="text-xl font-bold font-mono text-[var(--foreground)] mt-1">{formatCurrency(tx.amount)}</div>
          <div className="text-[11px] font-mono text-[var(--muted-foreground)] mt-1 flex items-center gap-1 truncate">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            {tx.method || 'GATEWAY'}
          </div>
        </div>
        
        <div className="p-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">Expected Settlement</div>
          <div className="text-xl font-bold font-mono text-[#528FF0] mt-1">
            {recon ? formatCurrency(recon.expectedAmount) : '-'}
          </div>
          <div className="text-[11px] font-mono text-[var(--muted-foreground)] mt-1 truncate">Contract rate card net</div>
        </div>

        <div className="p-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">Actual Settlement</div>
          <div className="text-xl font-bold font-mono text-emerald-400 mt-1">
            {recon ? formatCurrency(recon.actualAmount) : '-'}
          </div>
          <div className="text-[11px] font-mono text-[var(--muted-foreground)] mt-1 truncate">Bank UTR received</div>
        </div>

        <div className="p-4">
          <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)]">Reconciliation Parity</div>
          <div className={`text-xl font-bold font-mono mt-1 ${isMatched ? 'text-emerald-400' : 'text-rose-400'}`}>
            {recon ? recon.status : 'PENDING'}
          </div>
          <div className="text-[11px] font-mono mt-1 flex items-center gap-1 text-[var(--muted-foreground)] truncate">
            <span className={`w-1.5 h-1.5 rounded-full ${isMatched ? 'bg-emerald-400' : 'bg-rose-400 animate-pulse'}`} />
            Diff: {recon ? formatCurrency(recon.difference) : '₹0.00'}
          </div>
        </div>
      </div>

      {/* Deterministic Ledger Audit & Diagnostics Console */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-lg bg-[var(--muted)] text-[#528FF0] border border-[var(--border)]">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[var(--foreground)] flex items-center gap-2">
                Ledger Audit & Diagnostics
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)]">
                  {aiResult ? `${(aiResult.confidence * 100).toFixed(0)}% Confidence` : 'Multi-Node Parity'}
                </span>
              </h3>
              <p className="text-xs text-[var(--muted-foreground)]">Automated ledger verification of financial lifecycle, MDR commissions, and bank nodal clearance</p>
            </div>
          </div>

          <div className="flex items-center flex-wrap gap-2">
            <button
              onClick={() => {
                setPreventionType(primaryException?.type || 'FEE_MISMATCH');
                setShowPreventionModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-colors shadow-sm"
            >
              <ShieldCheck className="w-3.5 h-3.5" /> Prevention Playbook
            </button>

            {primaryException && (
              <button
                onClick={handleRunAiInvestigation}
                disabled={aiLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[var(--border)] bg-[var(--muted)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] transition-colors disabled:opacity-50"
              >
                {aiLoading ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#528FF0]" /> Analyzing Nodes...
                  </>
                ) : (
                  <>
                    <Code2 className="w-3.5 h-3.5 text-[#528FF0]" /> Run Diagnostics
                  </>
                )}
              </button>
            )}

            {openExceptions.length > 0 && (
              <button
                onClick={() => {
                  setSelectedExceptionForDispute(primaryException);
                  setShowDisputeModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors shadow-sm"
              >
                <FileText className="w-3.5 h-3.5" /> Dispute Notice
              </button>
            )}
          </div>
        </div>

        {/* Narrative Box */}
        <div className="space-y-3">
          <div className="bg-[var(--muted)]/40 p-3.5 rounded-lg border border-[var(--border)] text-sm leading-relaxed text-[var(--foreground)]">
            {aiResult ? aiResult.explanation : getNaturalSummary()}
          </div>

          {/* AI Recommended Next Step & Prevention Callout */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[var(--muted)]/60 p-3 rounded-lg border border-[var(--border)] text-xs">
            <div className="flex items-start sm:items-center gap-2">
              <span className="font-semibold text-[#528FF0] uppercase tracking-wider whitespace-nowrap">Recommended Action:</span>
              <span className="text-[var(--foreground)]">
                {aiResult?.recommendedAction || (
                  openExceptions.some(e => e.type === 'FEE_MISMATCH')
                    ? 'Generate an RBI dispute claim to recover overcharged fees from gateway operations.'
                    : openExceptions.some(e => e.type === 'MISSING_SETTLEMENT')
                    ? 'Wait for next nodal clearing cycle or raise a payout inquiry if T+2 SLA expires.'
                    : 'No further action required. Transaction is fully settled.'
                )}
              </span>
            </div>
            <div className="flex items-center gap-3 self-end sm:self-auto">
              <button
                onClick={() => {
                  setPreventionType(primaryException?.type || 'FEE_MISMATCH');
                  setShowPreventionModal(true);
                }}
                className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
              >
                <ShieldCheck className="w-3 h-3" /> Prevention Guide
              </button>
              <Link
                href={`/copilot`}
                className="text-[#528FF0] hover:underline font-semibold flex items-center gap-1 whitespace-nowrap"
              >
                Ask Copilot <ExternalLink className="w-3 h-3" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Detected Exceptions List */}
      {hasExceptions && (
        <div className="rounded-lg border border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-semibold text-red-700 dark:text-red-400 flex items-center">
              <AlertCircle className="w-4 h-4 mr-2" /> 
              Detected Exceptions ({tx.exceptions.length})
            </h3>
            <button
              onClick={() => {
                setPreventionType(primaryException?.type || 'FEE_MISMATCH');
                setShowPreventionModal(true);
              }}
              className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1"
            >
              <Lightbulb className="w-3.5 h-3.5" /> How to Prevent These Mismatches
            </button>
          </div>

          <div className="space-y-2">
            {tx.exceptions.map(ex => {
              const isObsolete = ex.status === 'OBSOLETE';
              return (
                <div 
                  key={ex.id} 
                  className={`flex flex-col sm:flex-row justify-between sm:items-center p-3.5 rounded-lg border shadow-sm transition-colors duration-150 gap-2 ${
                    isObsolete 
                      ? 'bg-[var(--surface)]/60 border-gray-200 dark:border-gray-800 opacity-70' 
                      : 'bg-[var(--surface)] border-red-100 dark:border-red-900/30'
                  }`}
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{ex.type.replace(/_/g, ' ')}</span>
                      <span className={`px-2 py-0.2 rounded text-[10px] uppercase font-bold tracking-wider ${
                        isObsolete ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                      }`}>
                        {ex.status}
                      </span>
                    </div>
                    <div className="text-xs text-[var(--muted-foreground)]">{ex.description}</div>
                  </div>
                  
                  <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-[var(--border)]">
                    <div className="text-right">
                      <div className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(ex.financialImpact)}</div>
                      <div className="text-[10px] text-[var(--muted-foreground)] uppercase font-semibold">{ex.severity} Priority</div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => {
                          setPreventionType(ex.type);
                          setShowPreventionModal(true);
                        }}
                        title="View prevention playbook for this mismatch"
                        className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-emerald-200 dark:border-emerald-800/40 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 h-7 px-2 transition-colors"
                      >
                        <ShieldCheck className="w-3 h-3 mr-1" /> Prevent
                      </button>
                      <Link 
                        href={`/exceptions/${ex.id}`}
                        className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] h-7 px-2.5 transition-colors"
                      >
                        <FileText className="w-3 h-3 mr-1 text-red-600" /> Triage
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Financial Lineage Timeline */}
      <div className="space-y-3">
        <h3 className="text-base font-semibold">Financial Lineage</h3>
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x divide-[var(--border)] text-sm">
            
            <div className="p-4 flex flex-col space-y-2.5">
              <div className="flex items-center text-[var(--muted-foreground)] font-medium text-xs uppercase tracking-wider">
                <Receipt className="w-3.5 h-3.5 mr-1.5" /> Order
              </div>
              {tx.order ? (
                <>
                  <div className="font-semibold break-all text-sm">{tx.order.externalOrderId}</div>
                  <div className="text-xs text-[var(--muted-foreground)]">{formatCurrency(tx.order.amount)}</div>
                  <div><span className="bg-[var(--muted)] px-2 py-0.5 rounded-md text-xs font-semibold">{tx.order.status}</span></div>
                </>
              ) : <div className="text-xs text-[var(--muted-foreground)] italic">No order linked</div>}
            </div>

            <div className="p-4 flex flex-col space-y-2.5 bg-[var(--muted)]">
              <div className="flex items-center text-[var(--muted-foreground)] font-medium text-xs uppercase tracking-wider">
                <CreditCard className="w-3.5 h-3.5 mr-1.5" /> Payment
              </div>
              <div className="font-semibold break-all text-sm">{tx.externalPaymentId}</div>
              <div className="text-xs text-[var(--muted-foreground)]">{formatCurrency(tx.amount)}</div>
              <div><span className="bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 px-2 py-0.5 rounded-md text-xs font-semibold">{tx.status}</span></div>
            </div>

            <div className="p-4 flex flex-col space-y-2.5">
              <div className="flex items-center text-[var(--muted-foreground)] font-medium text-xs uppercase tracking-wider">
                <ArrowRightLeft className="w-3.5 h-3.5 mr-1.5" /> Fees & Taxes
              </div>
              {tx.fees && tx.fees.length > 0 ? tx.fees.map(fee => (
                <div key={fee.id} className="border border-[var(--border)] rounded-lg p-2.5 bg-[var(--muted)] space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted-foreground)]">Fee</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">-{formatCurrency(fee.amount)}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-[var(--muted-foreground)]">Tax</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">-{formatCurrency(fee.tax)}</span>
                  </div>
                </div>
              )) : <div className="text-xs text-[var(--muted-foreground)] italic">No fees recorded</div>}
            </div>

            <div className="p-4 flex flex-col space-y-2.5 bg-[var(--muted)]">
              <div className="flex items-center text-[var(--muted-foreground)] font-medium text-xs uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 mr-1.5" /> Settlement
              </div>
              {tx.settlements && tx.settlements.length > 0 ? tx.settlements.map((s) => (
                <div key={s.id} className="border border-[var(--border)] rounded-lg p-2.5 bg-[var(--surface)]">
                  <div className="text-xs text-[var(--muted-foreground)] mb-1 break-all truncate" title={s.externalSettlementId}>{s.externalSettlementId}</div>
                  <div className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(s.amount)}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-1">{formatDate(s.settledAt)}</div>
                </div>
              )) : <div className="text-xs text-red-600 dark:text-red-400 font-medium bg-red-50 dark:bg-red-900/15 p-2 rounded-lg border border-red-200 dark:border-red-800/30">Missing Settlement</div>}
            </div>

            <div className="p-4 flex flex-col space-y-2.5">
              <div className="flex items-center text-[var(--muted-foreground)] font-medium text-xs uppercase tracking-wider">
                <Building2 className="w-3.5 h-3.5 mr-1.5" /> Bank
              </div>
              {tx.settlements?.map(s => 
                s.bankTransactions?.map(bt => (
                  <div key={bt.id} className="border border-[var(--border)] rounded-lg p-2.5 bg-[var(--muted)] space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-[var(--muted-foreground)]">UTR</span>
                      <span className="font-medium">{bt.reference}</span>
                    </div>
                    <div className="font-semibold text-emerald-600 dark:text-emerald-400">{formatCurrency(bt.amount)}</div>
                    <div className="text-xs text-[var(--muted-foreground)] mt-1">Cleared: {formatDate(bt.transactionDate)}</div>
                  </div>
                ))
              )}
              {tx.settlements?.every(s => !s.bankTransactions || s.bankTransactions.length === 0) && (
                <div className="text-xs text-[var(--muted-foreground)] italic">No bank transactions found</div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Dispute Modal */}
      {selectedExceptionForDispute && (
        <DisputePacketModal
          isOpen={showDisputeModal}
          onClose={() => setShowDisputeModal(false)}
          exception={selectedExceptionForDispute}
          payment={tx}
        />
      )}

      {/* Prevention Playbook Modal */}
      <PreventionPlaybookModal
        isOpen={showPreventionModal}
        onClose={() => setShowPreventionModal(false)}
        exceptionType={preventionType}
      />
    </div>
  );
}


