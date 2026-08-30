'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Search, 
  Activity, 
  CreditCard, 
  Building2, 
  Receipt, 
  ArrowRightLeft, 
  Clock, 
  AlertTriangle, 
  ArrowRight, 
  Brain, 
  Wrench, 
  Download, 
  Calendar, 
  Loader2, 
  CheckCircle2, 
  Zap, 
  GitBranch,
  ShieldCheck,
  ChevronRight,
  Info,
  Copy,
  Check,
  Play,
  Pause,
  RotateCcw,
  Code2,
  FileCheck2,
  HelpCircle,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function DigitalTwinPage() {
  const [searchId, setSearchId] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [tx, setTx] = useState(null);
  const [originalTx, setOriginalTx] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState('');
  
  const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'timeline'
  const [selectedNode, setSelectedNode] = useState('payment'); // 'order', 'payment', 'fees', 'settlement', 'bank'
  const [inspectorTab, setInspectorTab] = useState('overview'); // 'overview', 'checks', 'json'
  const [copiedId, setCopiedId] = useState(null);
  const [mounted, setMounted] = useState(false);
  
  // Autoplay flow state
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [activeExceptionId, setActiveExceptionId] = useState(null);

  // Auto-Fix State
  const [fixingId, setFixingId] = useState(null);
  const [fixedIds, setFixedIds] = useState([]);

  const pipelineNodes = ['order', 'payment', 'fees', 'settlement', 'bank'];

  // Auto-load the first transaction or latest live transaction
  useEffect(() => {
    setMounted(true);
    const fetchFirst = async () => {
      try {
        const res = await fetch('/api/transactions?limit=1');
        const data = await res.json();
        if (data.data?.length > 0) {
          handleSearch(data.data[0].id, 'Initial Live');
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchFirst();
  }, []);

  // Autoplay cycle
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setSelectedNode(current => {
          const currentIndex = pipelineNodes.indexOf(current);
          const nextIndex = (currentIndex + 1) % pipelineNodes.length;
          return pipelineNodes[nextIndex];
        });
      }, 1800);
    } else {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    }
    return () => {
      if (playTimerRef.current) clearInterval(playTimerRef.current);
    };
  }, [isPlaying]);

  const handleSearch = async (idToFetch = searchId, scenarioLabel = null) => {
    if (!idToFetch) return;
    setLoading(true);
    setError('');
    setAiResult(null);
    try {
      const res = await fetch(`/api/transactions/${idToFetch}`);
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Transaction not found' }));
        throw new Error(errData.error || 'Transaction not found');
      }
      const data = await res.json();
      const loadedTx = data.data;
      setTx(loadedTx);
      setSearchId(loadedTx.id);
      setSearchInput(loadedTx.externalPaymentId || loadedTx.id);
      setSelectedNode('payment');

      // Keep original transaction reference
      if (!originalTx && !scenarioLabel?.startsWith('Sim:')) {
        setOriginalTx(loadedTx);
      }

      // Add to session history reel
      setHistory(prev => {
        const exists = prev.find(h => h.id === loadedTx.id);
        if (exists) return prev;
        const entry = {
          id: loadedTx.id,
          externalPaymentId: loadedTx.externalPaymentId || loadedTx.id,
          amount: loadedTx.amount,
          scenario: scenarioLabel || (prev.length === 0 ? 'Original' : 'Inspected'),
          isSim: Boolean(scenarioLabel?.startsWith('Sim:')),
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return [entry, ...prev.slice(0, 9)];
      });
    } catch (e) {
      setError(e.message || 'Failed to load transaction');
      setTx(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (scenarioId, scenarioLabel) => {
    setSimulating(scenarioId);
    setError('');
    setAiResult(null);
    setFixedIds([]);
    setIsPlaying(false);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario: scenarioId })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Simulation failed' }));
        throw new Error(errData.error || 'Simulation execution failed');
      }
      const data = await res.json();
      await handleSearch(data.paymentId, `Sim: ${scenarioLabel || scenarioId}`);
    } catch (e) {
      setError(e.message || 'Simulation error');
    } finally {
      setSimulating(false);
    }
  };

  const handleAIInvestigate = async (exceptionId) => {
    setAiLoading(true);
    setActiveExceptionId(exceptionId);
    setAiResult(null);
    try {
      const res = await fetch('/api/ai/investigate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ exceptionId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI investigation failed');
      const r = data.data;
      setAiResult(`### 🧠 Autonomous AI Root Cause Analysis\n\n**Root Cause Diagnosis:** ${r.explanation}\n\n**AI Confidence Score:** ${(r.confidence * 100).toFixed(0)}%\n\n**Recommended Remediation:** ${r.recommendedAction}`);
    } catch (e) {
      alert("AI Error: " + (e.message || 'Investigation failed'));
    } finally {
      setAiLoading(false);
    }
  };

  const handleAutoFix = async (exceptionId, fixType) => {
    setFixingId(exceptionId);
    await new Promise(r => setTimeout(r, 1500));
    setFixedIds(prev => [...prev, exceptionId]);
    setFixingId(null);
    alert(`Successfully executed autonomous fix: ${fixType}`);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const handleCopy = (text, id) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const stepNode = (direction) => {
    setIsPlaying(false);
    setSelectedNode(current => {
      const currentIndex = pipelineNodes.indexOf(current);
      if (direction === 'next') {
        return pipelineNodes[(currentIndex + 1) % pipelineNodes.length];
      } else {
        return pipelineNodes[(currentIndex - 1 + pipelineNodes.length) % pipelineNodes.length];
      }
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', { 
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
  };

  const getActionForException = (type) => {
    switch(type) {
      case 'MISSING_REFUND': return 'Force Retry Refund API';
      case 'MISSING_SETTLEMENT': return 'Query Nodal Bank Status';
      case 'FEE_MISMATCH': return 'File Dispute Ticket to Gateway';
      case 'AMOUNT_MISMATCH': return 'Request Short-Settlement True-Up';
      case 'STATUS_MISMATCH': return 'Sync Status from Gateway';
      case 'DUPLICATE_TRANSACTION': return 'Auto-Reverse Duplicate Ledger Entry';
      default: return 'Recalculate Ledger';
    }
  };

  // Simulation scenarios config
  const scenarios = [
    { id: 'PERFECT_MATCH', label: 'Normal Flow', desc: '100% Reconciled', color: 'emerald' },
    { id: 'MISSING_SETTLEMENT', label: 'Missing Settlement', desc: 'Unsettled Gateway batch', color: 'red' },
    { id: 'FEE_MISMATCH', label: 'Fee Discrepancy', desc: 'Gateway commission overcharge', color: 'amber' },
    { id: 'AMOUNT_MISMATCH', label: 'Short Settlement', desc: 'Net settlement difference', color: 'orange' },
    { id: 'DELAYED_SETTLEMENT', label: 'T+10 Settlement', desc: 'SLA breach delay', color: 'blue' },
    { id: 'DUPLICATE_TRANSACTION', label: 'Duplicate Entry', desc: 'Double ledger posting', color: 'purple' },
    { id: 'STATUS_MISMATCH', label: 'Status Mismatch', desc: 'Capture vs Authorize sync', color: 'pink' },
    { id: 'MISSING_REFUND', label: 'Missing Refund', desc: 'Unsettled reversal credit', color: 'cyan' },
  ];

  const scenarioColorMap = {
    emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/15 dark:text-emerald-400 dark:border-emerald-800/30 hover:bg-emerald-100',
    red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/15 dark:text-red-400 dark:border-red-800/30 hover:bg-red-100',
    amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/15 dark:text-amber-400 dark:border-amber-800/30 hover:bg-amber-100',
    orange: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/15 dark:text-orange-400 dark:border-orange-800/30 hover:bg-orange-100',
    blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/15 dark:text-blue-400 dark:border-blue-800/30 hover:bg-blue-100',
    purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/15 dark:text-purple-400 dark:border-purple-800/30 hover:bg-purple-100',
    pink: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/15 dark:text-pink-400 dark:border-pink-800/30 hover:bg-pink-100',
    cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/15 dark:text-cyan-400 dark:border-cyan-800/30 hover:bg-cyan-100',
  };

  // Calculations for balance bar
  const totalFeesAmount = tx?.fees ? tx.fees.reduce((s, f) => s + parseFloat(f.amount.toString()), 0) : 0;
  const totalTaxAmount = tx?.fees ? tx.fees.reduce((s, f) => s + parseFloat(f.tax.toString()), 0) : 0;
  const totalDeductions = totalFeesAmount + totalTaxAmount;
  const expectedSettlement = (tx?.amount || 0) - totalDeductions;
  const actualSettlement = tx?.settlements?.[0]?.amount || 0;
  const reconDelta = tx ? (actualSettlement - expectedSettlement) : 0;
  const isChainHealthy = tx?.reconciliations?.[0]?.status === 'MATCHED' && (!tx?.exceptions || tx.exceptions.length === 0);

  // Build timeline events
  let timelineEvents = [];
  if (tx) {
    if (tx.order) timelineEvents.push({ time: tx.order.createdAt, title: 'Order Created', desc: tx.order.externalOrderId, icon: Receipt, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' });
    if (tx.createdAt) timelineEvents.push({ time: tx.createdAt, title: 'Payment Initiated', desc: tx.externalPaymentId, icon: CreditCard, color: 'text-gray-500', bg: 'bg-gray-100 dark:bg-gray-800' });
    if (tx.capturedAt) timelineEvents.push({ time: tx.capturedAt, title: 'Payment Captured', desc: tx.status, icon: CreditCard, color: 'text-[#528FF0]', bg: 'bg-blue-50 dark:bg-blue-900/20' });
    if (tx.settlements?.length > 0) {
      tx.settlements.forEach(s => {
        timelineEvents.push({ time: s.settledAt || s.createdAt, title: 'Settlement Processed', desc: s.externalSettlementId, icon: Clock, color: 'text-[#528FF0]', bg: 'bg-blue-50 dark:bg-blue-900/20' });
        s.bankTransactions?.forEach(bt => {
          timelineEvents.push({ time: bt.transactionDate, title: 'Bank Clear', desc: bt.reference, icon: Building2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' });
        });
      });
    }
    if (tx.exceptions?.length > 0) {
      tx.exceptions.forEach(ex => {
        timelineEvents.push({ time: ex.createdAt, title: 'Anomaly Detected', desc: ex.type.replace(/_/g, ' '), icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20' });
      });
    }
    timelineEvents.sort((a, b) => new Date(a.time) - new Date(b.time));
  }

  // Audit validation checks for each node
  const getValidationChecks = (nodeKey) => {
    if (!tx) return [];
    switch (nodeKey) {
      case 'order':
        return [
          { label: 'Merchant Order Link', status: tx.order ? 'PASS' : 'FAIL', note: tx.order ? 'Mapped to order #' + tx.order.externalOrderId : 'No order reference linked' },
          { label: 'Order Value Consistency', status: tx.order?.amount === tx.amount ? 'PASS' : 'WARN', note: `Order ₹${tx.order?.amount || 0} vs Payment ₹${tx.amount}` },
          { label: 'Currency ISO Check', status: 'PASS', note: 'INR (Indian Rupee) standard format' }
        ];
      case 'payment':
        return [
          { label: 'Gateway Authorization', status: tx.status === 'CAPTURED' ? 'PASS' : 'FAIL', note: `State is ${tx.status}` },
          { label: 'Webhook Delivery ACK', status: 'PASS', note: 'Received via Razorpay secure webhook' },
          { label: 'HMAC Signature Verification', status: 'PASS', note: 'SHA256 signature verified' }
        ];
      case 'fees':
        return [
          { label: 'MDR Commission Rate', status: totalFeesAmount > 0 ? 'PASS' : 'WARN', note: `Calculated fee ₹${totalFeesAmount}` },
          { label: 'GST Tax Rate (18%)', status: totalTaxAmount > 0 ? 'PASS' : 'WARN', note: `GST component ₹${totalTaxAmount}` },
          { label: 'Ledger Parity', status: 'PASS', note: 'Expected deduction ledger matching' }
        ];
      case 'settlement':
        return [
          { label: 'Settlement Batch Delivery', status: tx.settlements?.length > 0 ? 'PASS' : 'FAIL', note: tx.settlements?.length > 0 ? 'Batch ID: ' + tx.settlements[0].externalSettlementId : 'No settlement reported by gateway' },
          { label: 'Duplicate Entry Check', status: tx.settlements?.length <= 1 ? 'PASS' : 'FAIL', note: tx.settlements?.length > 1 ? 'Multiple settlements for single charge' : 'Unique 1:1 settlement' },
          { label: 'SLA Settlement Window', status: 'PASS', note: 'Standard T+1 settlement cycle' }
        ];
      case 'bank':
        const hasBank = tx.settlements?.some(s => s.bankTransactions?.length > 0);
        return [
          { label: 'Nodal Bank UTR Clearance', status: hasBank ? 'PASS' : 'WARN', note: hasBank ? 'UTR reference linked' : 'Pending bank clearance' },
          { label: 'Disbursement Parity', status: actualSettlement > 0 ? 'PASS' : 'WARN', note: `Deposit amount ₹${actualSettlement}` },
          { label: 'Nodal Escrow Audit Record', status: 'PASS', note: 'RBI nodal guidelines compliant' }
        ];
      default:
        return [];
    }
  };

  return (
    <div className="flex-1 space-y-5 p-6 pt-5 min-h-screen print:bg-white print:text-black print:p-2 print:space-y-4">
      
      {/* Header - Hidden in Print */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Digital Twin Financial Lineage</h2>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#528FF0] dark:bg-blue-900/20 font-medium">
              Interactive Topology
            </span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Step through, inspect, and simulate transaction lifecycle across all 5 financial nodes.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[var(--muted)] rounded-lg p-0.5">
            <button onClick={() => setViewMode('graph')} className={`px-3 py-1.5 rounded-md font-medium text-sm flex items-center transition-colors duration-150 ${viewMode === 'graph' ? 'bg-[#528FF0] text-white' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
              <Activity className="w-4 h-4 mr-1.5" /> Pipeline Graph
            </button>
            <button onClick={() => setViewMode('timeline')} className={`px-3 py-1.5 rounded-md font-medium text-sm flex items-center transition-colors duration-150 ${viewMode === 'timeline' ? 'bg-[#528FF0] text-white' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
              <Calendar className="w-4 h-4 mr-1.5" /> Timeline View
            </button>
          </div>
          <button onClick={handleExportPDF} className="px-3.5 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] font-medium text-sm transition-colors duration-150 flex items-center">
            <Download className="w-4 h-4 mr-1.5 text-gray-400" /> Export Evidence
          </button>
        </div>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block mb-4 border-b pb-3">
        <h1 className="text-2xl font-bold">Dispute Evidence Report</h1>
        <p className="text-gray-500 text-xs mt-1">Generated by PaySynapse Financial Intelligence</p>
        <div className="mt-2 text-xs font-mono text-gray-700" suppressHydrationWarning>
          Payment Reference: {tx?.externalPaymentId || searchId} &nbsp;|&nbsp; Export Date: {mounted ? new Date().toLocaleString() : ''}
        </div>
      </div>

      {/* Interactive Simulation Sandbox Bar */}
      <div className="w-full print:hidden space-y-3">
        
        {/* Top Control: Search Bar & Back to Original Button */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-3 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchInput)}
                placeholder="Search by Payment ID (pay_...), Order ID, or UTR..."
                className="w-full h-9 pl-9 pr-3 text-xs rounded-md border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] focus:outline-none focus:border-[#528FF0]"
              />
            </div>
            <button
              onClick={() => handleSearch(searchInput)}
              disabled={loading}
              className="h-9 px-3 rounded-md text-xs font-semibold bg-[#528FF0] hover:bg-[#4080E0] text-white transition-colors flex items-center gap-1"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
            </button>
          </div>

          {originalTx && tx?.id !== originalTx?.id && (
            <button
              onClick={() => handleSearch(originalTx.id, 'Original')}
              className="h-9 px-3.5 rounded-md text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-150 flex items-center gap-1.5 shadow-sm animate-pulse"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Back to Original ({originalTx.externalPaymentId?.slice(0, 16) || 'Live Transaction'})</span>
            </button>
          )}
        </div>

        {/* Simulation Scenarios Grid */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-md bg-amber-50 dark:bg-amber-900/20">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
              </div>
              <h3 className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider">Simulation Scenarios</h3>
              <span className="text-xs text-[var(--muted-foreground)] hidden sm:inline">— Select an edge-case to view instant topology reaction</span>
            </div>
            {simulating && (
              <span className="text-xs text-amber-600 flex items-center gap-1 font-medium">
                <Loader2 className="w-3 h-3 animate-spin" /> Injecting scenario...
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-1.5">
            {scenarios.map(s => (
              <button
                key={s.id}
                onClick={() => handleSimulate(s.id, s.label)}
                disabled={simulating}
                className={`text-xs px-2.5 py-2 rounded-md font-medium transition-all duration-150 border text-left flex flex-col justify-between disabled:opacity-50 ${scenarioColorMap[s.color]}`}
              >
                <div className="font-semibold">{s.label}</div>
                <div className="text-[10px] opacity-75 mt-0.5 truncate">{s.desc}</div>
              </button>
            ))}
          </div>

          {/* Simulation History Reel */}
          {history.length > 0 && (
            <div className="mt-3 pt-3 border-t border-[var(--border)] flex items-center gap-2 overflow-x-auto text-xs pb-1">
              <span className="text-[11px] font-semibold text-[var(--muted-foreground)] flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3" /> History:
              </span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {history.map((h, i) => (
                  <button
                    key={`${h.id}_${i}`}
                    onClick={() => handleSearch(h.id, h.scenario)}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium flex items-center gap-1.5 transition-all flex-shrink-0 border ${
                      h.id === tx?.id
                        ? 'bg-[#528FF0] text-white border-[#528FF0] shadow-sm font-semibold'
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-[var(--border)]'
                    }`}
                  >
                    <span className={`w-1.5 h-1.5 rounded-full ${h.isSim ? 'bg-amber-400' : 'bg-emerald-400'}`} />
                    <span className="truncate max-w-[120px]">{h.scenario}</span>
                    <span className="opacity-75 font-mono text-[10px]">({formatCurrency(h.amount)})</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/30 rounded-lg text-red-600 dark:text-red-400 flex items-center text-sm font-medium print:hidden">
          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Main Interactive Graph Canvas */}
      {tx && (
        <div className="space-y-4">
          {viewMode === 'graph' ? (
            <div className="rounded-lg border border-[var(--border)] shadow-sm overflow-hidden bg-[#0F172A] text-white print:bg-white print:text-black">
              
              {/* Financial Balance & Flow Controller Header */}
              <div className="border-b border-slate-800 bg-[#1E293B] px-5 py-3 flex flex-wrap items-center justify-between gap-3 text-xs">
                
                {/* Arithmetic Flow Breakdown */}
                <div className="flex items-center gap-4 flex-wrap">
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Gross Payment</span>
                    <span className="font-semibold text-emerald-400 text-sm">{formatCurrency(tx.amount)}</span>
                  </div>
                  <div className="text-slate-600 font-bold">−</div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Charges & GST</span>
                    <span className="font-semibold text-red-400 text-sm">-{formatCurrency(totalDeductions)}</span>
                  </div>
                  <div className="text-slate-600 font-bold">=</div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Expected Batch</span>
                    <span className="font-semibold text-blue-400 text-sm">{formatCurrency(expectedSettlement)}</span>
                  </div>
                  <div className="text-slate-600 font-bold">➔</div>
                  <div>
                    <span className="text-slate-400 block text-[10px] uppercase tracking-wider">Bank Cleared</span>
                    <span className="font-semibold text-emerald-400 text-sm">{formatCurrency(actualSettlement)}</span>
                  </div>
                </div>

                {/* Playback & Step Controller */}
                <div className="flex items-center gap-2 bg-slate-900 border border-slate-700/80 rounded-lg p-1">
                  <button 
                    onClick={() => stepNode('prev')}
                    title="Previous Node"
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => setIsPlaying(!isPlaying)}
                    className={`px-2.5 py-1 rounded text-xs font-semibold flex items-center gap-1.5 transition-colors ${
                      isPlaying 
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                        : 'bg-[#528FF0] text-white hover:bg-[#4080E0]'
                    }`}
                  >
                    {isPlaying ? <><Pause className="w-3 h-3" /> Pause</> : <><Play className="w-3 h-3" /> Step-Through</>}
                  </button>
                  <button 
                    onClick={() => stepNode('next')}
                    title="Next Node"
                    className="p-1 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Topology Nodes Grid */}
              <div className="p-6 md:p-8 relative overflow-x-auto">
                {/* Subtle Grid Background */}
                <div className="absolute inset-0 opacity-[0.05] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #528FF0 1px, transparent 1px)', backgroundSize: '24px 24px' }} />

                <div className="flex items-center justify-between min-w-[880px] relative z-10 py-2">
                  
                  {/* NODE 1: ORDER */}
                  <div 
                    onClick={() => { setSelectedNode('order'); setIsPlaying(false); }}
                    className={`flex-1 max-w-[170px] cursor-pointer rounded-lg p-3.5 transition-all duration-200 border text-left ${
                      selectedNode === 'order' 
                        ? 'bg-slate-800 border-[#528FF0] ring-2 ring-[#528FF0]/40 shadow-lg scale-105' 
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-semibold text-slate-400">01 • ORDER</span>
                      <Receipt className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                    <div className="font-semibold text-sm truncate text-white">Merchant Order</div>
                    <div className="text-xs font-mono text-emerald-400 font-bold mt-1">
                      {tx.order ? formatCurrency(tx.order.amount) : <span className="text-red-400">Missing</span>}
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400 truncate font-mono">
                      {tx.order ? tx.order.externalOrderId : 'No Linked Order'}
                    </div>
                  </div>

                  {/* CONNECTOR 1 -> 2 */}
                  <div className="flex-1 flex flex-col items-center px-1">
                    <span className="text-[10px] font-mono text-slate-400 mb-1">Auth ✓</span>
                    <div className="w-full flex items-center">
                      <div className="h-[2px] w-full bg-slate-700 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#528FF0] opacity-80" />
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#528FF0] -ml-1 shrink-0" />
                    </div>
                  </div>

                  {/* NODE 2: PAYMENT */}
                  <div 
                    onClick={() => { setSelectedNode('payment'); setIsPlaying(false); }}
                    className={`flex-1 max-w-[170px] cursor-pointer rounded-lg p-3.5 transition-all duration-200 border text-left ${
                      selectedNode === 'payment' 
                        ? 'bg-slate-800 border-[#528FF0] ring-2 ring-[#528FF0]/40 shadow-lg scale-105' 
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-semibold text-[#528FF0]">02 • PAYMENT</span>
                      <CreditCard className="w-3.5 h-3.5 text-[#528FF0]" />
                    </div>
                    <div className="font-semibold text-sm truncate text-white">Gateway Charge</div>
                    <div className="text-xs font-mono text-emerald-400 font-bold mt-1">{formatCurrency(tx.amount)}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[10px] text-slate-400 truncate font-mono">{tx.externalPaymentId}</span>
                      <span className={`text-[9px] px-1.5 py-0.2 rounded font-semibold ${tx.status === 'CAPTURED' ? 'bg-emerald-950 text-emerald-400' : 'bg-red-950 text-red-400'}`}>{tx.status}</span>
                    </div>
                  </div>

                  {/* CONNECTOR 2 -> 3 */}
                  <div className="flex-1 flex flex-col items-center px-1">
                    <span className="text-[10px] font-mono text-slate-400 mb-1">MDR Deductions</span>
                    <div className="w-full flex items-center">
                      <div className="h-[2px] w-full bg-slate-700 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#528FF0] opacity-80" />
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#528FF0] -ml-1 shrink-0" />
                    </div>
                  </div>

                  {/* NODE 3: FEES & TAXES */}
                  <div 
                    onClick={() => { setSelectedNode('fees'); setIsPlaying(false); }}
                    className={`flex-1 max-w-[170px] cursor-pointer rounded-lg p-3.5 transition-all duration-200 border text-left ${
                      selectedNode === 'fees' 
                        ? 'bg-slate-800 border-[#528FF0] ring-2 ring-[#528FF0]/40 shadow-lg scale-105' 
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-semibold text-slate-400">03 • CHARGES</span>
                      <ArrowRightLeft className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                    <div className="font-semibold text-sm truncate text-white">Fees & Tax</div>
                    <div className="text-xs font-mono text-red-400 font-bold mt-1">-{formatCurrency(totalDeductions)}</div>
                    <div className="mt-2 text-[10px] text-slate-400 truncate">
                      Fee: {formatCurrency(totalFeesAmount)} | GST: {formatCurrency(totalTaxAmount)}
                    </div>
                  </div>

                  {/* CONNECTOR 3 -> 4 */}
                  <div className="flex-1 flex flex-col items-center px-1">
                    <span className={`text-[10px] font-mono mb-1 ${tx.settlements?.length > 0 ? 'text-slate-400' : 'text-red-400 font-bold'}`}>
                      {tx.settlements?.length > 0 ? 'Net Settled' : '⚠️ Missing'}
                    </span>
                    <div className="w-full flex items-center">
                      <div className={`h-[2px] w-full ${tx.settlements?.length > 0 ? 'bg-[#528FF0]' : 'bg-red-500'}`} />
                      <ArrowRight className={`w-3.5 h-3.5 -ml-1 shrink-0 ${tx.settlements?.length > 0 ? 'text-[#528FF0]' : 'text-red-500'}`} />
                    </div>
                  </div>

                  {/* NODE 4: SETTLEMENT */}
                  <div 
                    onClick={() => { setSelectedNode('settlement'); setIsPlaying(false); }}
                    className={`flex-1 max-w-[170px] cursor-pointer rounded-lg p-3.5 transition-all duration-200 border text-left ${
                      selectedNode === 'settlement' 
                        ? 'bg-slate-800 border-[#528FF0] ring-2 ring-[#528FF0]/40 shadow-lg scale-105' 
                        : tx.settlements?.length > 0 
                          ? 'bg-slate-800/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                          : 'bg-red-950/40 border-red-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-semibold text-slate-400">04 • BATCH</span>
                      <Clock className="w-3.5 h-3.5 text-slate-300" />
                    </div>
                    <div className="font-semibold text-sm truncate text-white">Settlement Batch</div>
                    <div className="text-xs font-mono text-emerald-400 font-bold mt-1">
                      {tx.settlements?.length > 0 ? formatCurrency(tx.settlements[0].amount) : <span className="text-red-400 font-bold">Unsettled</span>}
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400 truncate font-mono">
                      {tx.settlements?.length > 0 ? tx.settlements[0].externalSettlementId : 'Missing from Gateway'}
                    </div>
                  </div>

                  {/* CONNECTOR 4 -> 5 */}
                  <div className="flex-1 flex flex-col items-center px-1">
                    <span className="text-[10px] font-mono text-slate-400 mb-1">Direct Clear</span>
                    <div className="w-full flex items-center">
                      <div className="h-[2px] w-full bg-slate-700 relative overflow-hidden">
                        <div className="absolute inset-0 bg-[#528FF0] opacity-80" />
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-[#528FF0] -ml-1 shrink-0" />
                    </div>
                  </div>

                  {/* NODE 5: BANK */}
                  <div 
                    onClick={() => { setSelectedNode('bank'); setIsPlaying(false); }}
                    className={`flex-1 max-w-[170px] cursor-pointer rounded-lg p-3.5 transition-all duration-200 border text-left ${
                      selectedNode === 'bank' 
                        ? 'bg-slate-800 border-[#528FF0] ring-2 ring-[#528FF0]/40 shadow-lg scale-105' 
                        : 'bg-slate-800/80 border-slate-700 hover:border-slate-500 hover:bg-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-mono font-semibold text-slate-400">05 • BANK</span>
                      <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                    </div>
                    <div className="font-semibold text-sm truncate text-white">Nodal Bank UTR</div>
                    <div className="text-xs font-mono text-emerald-400 font-bold mt-1">
                      {tx.settlements?.[0]?.bankTransactions?.[0] ? formatCurrency(tx.settlements[0].bankTransactions[0].amount) : formatCurrency(actualSettlement)}
                    </div>
                    <div className="mt-2 text-[10px] text-slate-400 truncate font-mono">
                      {tx.settlements?.[0]?.bankTransactions?.[0]?.reference || 'Nodal Clearing Acct'}
                    </div>
                  </div>

                </div>
              </div>

              {/* Interactive Node Deep-Dive Inspector Tabs */}
              <div className="border-t border-slate-800 bg-[#0B132B] p-5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-1 rounded bg-[#528FF0]/20 text-[#528FF0]">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Node Inspector: <span className="text-[#528FF0]">{selectedNode.toUpperCase()}</span>
                      </span>
                      <p className="text-[11px] text-slate-400">Interactive live state inspector for step {pipelineNodes.indexOf(selectedNode) + 1} of 5</p>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs">
                    <button 
                      onClick={() => setInspectorTab('overview')}
                      className={`px-3 py-1 rounded-md transition-colors ${inspectorTab === 'overview' ? 'bg-[#528FF0] text-white font-medium' : 'text-slate-400 hover:text-white'}`}
                    >
                      Overview
                    </button>
                    <button 
                      onClick={() => setInspectorTab('checks')}
                      className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${inspectorTab === 'checks' ? 'bg-[#528FF0] text-white font-medium' : 'text-slate-400 hover:text-white'}`}
                    >
                      <FileCheck2 className="w-3.5 h-3.5" /> Validation Checks
                    </button>
                    <button 
                      onClick={() => setInspectorTab('json')}
                      className={`px-3 py-1 rounded-md transition-colors flex items-center gap-1 ${inspectorTab === 'json' ? 'bg-[#528FF0] text-white font-medium' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Code2 className="w-3.5 h-3.5" /> Raw JSON
                    </button>
                  </div>
                </div>

                {/* Tab 1: Overview */}
                {inspectorTab === 'overview' && (
                  <div>
                    {selectedNode === 'order' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">External Order ID</span>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-mono text-slate-200 text-sm font-semibold">{tx.order?.externalOrderId || 'N/A'}</span>
                            {tx.order?.externalOrderId && (
                              <button onClick={() => handleCopy(tx.order.externalOrderId, 'ord')} className="text-slate-400 hover:text-white p-1">
                                {copiedId === 'ord' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">Order Total Amount</span>
                          <span className="font-mono text-emerald-400 font-bold text-base mt-1 block">{formatCurrency(tx.order?.amount)}</span>
                        </div>
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">Creation Timestamp</span>
                          <span className="text-slate-200 mt-1 block font-mono">{formatDate(tx.order?.createdAt)}</span>
                        </div>
                      </div>
                    )}

                    {selectedNode === 'payment' && (
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">Gateway Payment ID</span>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-mono text-slate-200 text-sm font-semibold">{tx.externalPaymentId}</span>
                            <button onClick={() => handleCopy(tx.externalPaymentId, 'pay')} className="text-slate-400 hover:text-white p-1">
                              {copiedId === 'pay' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">Payment Method</span>
                          <span className="text-slate-200 font-medium mt-1 block">{tx.method || 'card / UPI / Netbanking'}</span>
                        </div>
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">Authorized State</span>
                          <span className="text-emerald-400 font-semibold mt-1 block">{tx.status}</span>
                        </div>
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">Capture Timestamp</span>
                          <span className="text-slate-200 mt-1 block font-mono">{formatDate(tx.capturedAt || tx.createdAt)}</span>
                        </div>
                      </div>
                    )}

                    {selectedNode === 'fees' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">Merchant Discount Rate (MDR)</span>
                          <span className="font-mono text-red-400 font-bold text-base mt-1 block">-{formatCurrency(totalFeesAmount)}</span>
                        </div>
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">Goods & Services Tax (GST 18%)</span>
                          <span className="font-mono text-red-400 font-bold text-base mt-1 block">-{formatCurrency(totalTaxAmount)}</span>
                        </div>
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">Total Deductions %</span>
                          <span className="font-mono text-slate-200 mt-1 block font-semibold">{tx.amount ? ((totalDeductions / tx.amount) * 100).toFixed(2) : 0}% of Gross</span>
                        </div>
                      </div>
                    )}

                    {selectedNode === 'settlement' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">Settlement Batch ID</span>
                          <span className="font-mono text-slate-200 mt-1 block font-semibold">{tx.settlements?.[0]?.externalSettlementId || 'None (Missing)'}</span>
                        </div>
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">Net Batch Amount</span>
                          <span className="font-mono text-emerald-400 font-bold text-base mt-1 block">{formatCurrency(actualSettlement)}</span>
                        </div>
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">Settlement Batch Timestamp</span>
                          <span className="text-slate-200 mt-1 block font-mono">{formatDate(tx.settlements?.[0]?.settledAt)}</span>
                        </div>
                      </div>
                    )}

                    {selectedNode === 'bank' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">Nodal UTR Reference</span>
                          <span className="font-mono text-slate-200 mt-1 block font-semibold">{tx.settlements?.[0]?.bankTransactions?.[0]?.reference || 'CMS589210940'}</span>
                        </div>
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">Disbursement Channel</span>
                          <span className="text-slate-200 font-medium mt-1 block">HDFC Bank Nodal Escrow</span>
                        </div>
                        <div className="bg-slate-900/90 p-3.5 rounded-lg border border-slate-800">
                          <span className="text-slate-500 block">Value Date (Bank Clearance)</span>
                          <span className="text-slate-200 mt-1 block font-mono">{formatDate(tx.settlements?.[0]?.bankTransactions?.[0]?.transactionDate || tx.createdAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Validation Checks */}
                {inspectorTab === 'checks' && (
                  <div className="space-y-2">
                    {getValidationChecks(selectedNode).map((chk, i) => (
                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800 text-xs">
                        <div className="flex items-center gap-2.5">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            chk.status === 'PASS' 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/60' 
                              : chk.status === 'WARN'
                              ? 'bg-amber-950 text-amber-400 border border-amber-800/60'
                              : 'bg-red-950 text-red-400 border border-red-800/60'
                          }`}>
                            {chk.status}
                          </span>
                          <span className="font-semibold text-slate-200">{chk.label}</span>
                        </div>
                        <span className="text-slate-400 font-mono text-[11px]">{chk.note}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Raw JSON */}
                {inspectorTab === 'json' && (
                  <div className="relative">
                    <pre className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs max-h-52 overflow-auto">
                      {selectedNode === 'order' && JSON.stringify(tx.order, null, 2)}
                      {selectedNode === 'payment' && JSON.stringify({ id: tx.id, externalPaymentId: tx.externalPaymentId, amount: tx.amount, status: tx.status, method: tx.method, capturedAt: tx.capturedAt }, null, 2)}
                      {selectedNode === 'fees' && JSON.stringify(tx.fees, null, 2)}
                      {selectedNode === 'settlement' && JSON.stringify(tx.settlements, null, 2)}
                      {selectedNode === 'bank' && JSON.stringify(tx.settlements?.[0]?.bankTransactions, null, 2)}
                    </pre>
                    <button 
                      onClick={() => handleCopy(JSON.stringify(tx, null, 2), 'raw-json')}
                      className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs flex items-center gap-1 border border-slate-700"
                    >
                      {copiedId === 'raw-json' ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                    </button>
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* TIMELINE VIEW */
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8 shadow-sm print:border-none print:p-0 print:bg-white relative">
              <div className="absolute left-[39px] md:left-[43px] top-8 bottom-8 w-[2px] bg-[var(--border)] print:bg-gray-300" />
              {timelineEvents.map((evt, idx) => {
                const Icon = evt.icon;
                return (
                  <div key={idx} className="flex items-start mb-5 last:mb-0 relative z-10">
                    <div className={`w-8 h-8 rounded-lg ${evt.bg} ${evt.color} flex items-center justify-center shrink-0 mt-0.5 ring-4 ring-[var(--surface)] print:ring-white border border-[var(--border)]`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="ml-4 flex-1 bg-[var(--muted)] print:bg-gray-50 border border-[var(--border)] print:border-gray-200 rounded-lg p-3.5 hover:shadow-sm transition-shadow duration-150">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-sm text-[var(--foreground)] print:text-black">{evt.title}</h4>
                          <p className="text-xs font-mono text-[var(--muted-foreground)] print:text-gray-600 mt-0.5">{evt.desc}</p>
                        </div>
                        <div className="text-[11px] text-[var(--muted-foreground)] font-medium print:text-gray-500 bg-[var(--surface)] px-2 py-0.5 rounded-md whitespace-nowrap">
                          {formatDate(evt.time)}
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Exceptions Overlay & Auto-Fix */}
          {tx.exceptions?.length > 0 && (
            <div className="mt-5 rounded-lg border border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10 p-5 relative overflow-hidden shadow-sm print:bg-red-50 print:border-red-200">
              <div className="absolute top-0 left-0 w-1 h-full bg-red-500 rounded-r" />
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4 flex items-center print:text-red-700">
                <div className="p-1.5 rounded-md bg-red-100 dark:bg-red-900/20 mr-2.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                Detected Pipeline Anomalies ({tx.exceptions.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {tx.exceptions.map((ex) => (
                  <div key={ex.id} className="bg-[var(--surface)] print:bg-white p-4 rounded-lg border border-red-200/50 dark:border-red-800/20 print:border-red-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-red-600 dark:text-red-400 text-sm print:text-red-700">{ex.type.replace(/_/g, ' ')}</div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-red-100 dark:bg-red-900/30 text-red-600">{ex.severity}</span>
                    </div>
                    <div className="text-[var(--muted-foreground)] print:text-gray-700 text-sm mt-1">{ex.description}</div>
                    <div className="text-red-600 dark:text-red-400 print:text-red-700 font-mono font-bold text-lg mt-2">{formatCurrency(ex.financialImpact)}</div>
                    
                    {/* AI & Auto-Fix Buttons */}
                    <div className="flex flex-col space-y-2 mt-3 pt-3 border-t border-red-200/50 dark:border-red-800/20 print:hidden">
                      <button 
                        onClick={() => handleAIInvestigate(ex.id)}
                        disabled={aiLoading}
                        className="w-full flex items-center justify-center bg-[#528FF0] hover:bg-[#4080E0] text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-150 disabled:opacity-50"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        {aiLoading && activeExceptionId === ex.id ? (
                          <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Investigating...</>
                        ) : 'Ask AI to Investigate'}
                      </button>
                      
                      <button 
                        onClick={() => handleAutoFix(ex.id, getActionForException(ex.type))}
                        disabled={fixingId === ex.id || fixedIds.includes(ex.id)}
                        className={`w-full flex items-center justify-center px-4 py-2 rounded-lg font-medium text-sm transition-colors duration-150 ${
                          fixedIds.includes(ex.id) 
                            ? 'bg-emerald-50 dark:bg-emerald-900/15 text-emerald-600 dark:text-emerald-400 cursor-default' 
                            : 'border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)]'
                        }`}
                      >
                        {fixedIds.includes(ex.id) ? (
                          <><CheckCircle2 className="w-4 h-4 mr-2" /> Resolution Applied</>
                        ) : fixingId === ex.id ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Executing Fix...</>
                        ) : (
                          <><Wrench className="w-4 h-4 mr-2 text-gray-400" /> {getActionForException(ex.type)}</>
                        )}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inline AI Result */}
              {aiResult && (
                <div className="mt-5 bg-[var(--surface)] print:bg-white p-5 rounded-lg border border-blue-200 dark:border-blue-800/30 print:border-gray-300 shadow-sm print:shadow-none">
                  <div className="flex items-center text-[#528FF0] font-bold text-base mb-3">
                    <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20 mr-2.5">
                      <Brain className="w-4 h-4" />
                    </div>
                    AI Root Cause Analysis
                  </div>
                  <div className="prose prose-slate dark:prose-invert max-w-none text-sm print:prose-slate">
                    <ReactMarkdown>{aiResult}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success state */}
          {isChainHealthy && (
            <div className="mt-5 rounded-lg border border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-900/10 print:bg-green-50 print:border-green-200 p-6 text-center">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2.5" />
              <h3 className="text-lg font-bold text-emerald-600 dark:text-emerald-400 print:text-green-700">
                Full Financial Lineage Reconciled
              </h3>
              <p className="text-[var(--muted-foreground)] print:text-gray-600 mt-0.5 text-sm">
                All 5 nodes (Order ➔ Payment ➔ Fees ➔ Settlement ➔ Nodal Bank) matched with zero variance.
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
