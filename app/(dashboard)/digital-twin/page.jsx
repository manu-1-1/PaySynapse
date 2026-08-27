'use client';

import { useState, useEffect } from 'react';
import { Search, Activity, CreditCard, Building2, Receipt, ArrowRightLeft, Clock, AlertTriangle, ArrowRight, Brain, Wrench, Download, Calendar, Loader2, CheckCircle2, Zap, GitBranch } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

export default function DigitalTwinPage() {
  const [searchId, setSearchId] = useState('');
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState('');
  
  const [viewMode, setViewMode] = useState('graph'); // 'graph' or 'timeline'
  
  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [activeExceptionId, setActiveExceptionId] = useState(null);

  // Auto-Fix State
  const [fixingId, setFixingId] = useState(null);
  const [fixedIds, setFixedIds] = useState([]);

  // Auto-load the first transaction just to have a demo state if none provided
  useEffect(() => {
    const fetchFirst = async () => {
      try {
        const res = await fetch('/api/transactions?limit=1');
        const data = await res.json();
        if (data.data?.length > 0) {
          handleSearch(data.data[0].id);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchFirst();
  }, []);

  const handleSearch = async (idToFetch = searchId) => {
    if (!idToFetch) return;
    setLoading(true);
    setError('');
    setAiResult(null);
    try {
      const res = await fetch(`/api/transactions/${idToFetch}`);
      if (!res.ok) throw new Error('Transaction not found');
      const data = await res.json();
      setTx(data.data);
      setSearchId(data.data.id);
    } catch (e) {
      setError(e.message);
      setTx(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSimulate = async (scenario) => {
    setSimulating(scenario);
    setError('');
    setAiResult(null);
    setFixedIds([]);
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Simulation failed');
      
      handleSearch(data.paymentId);
    } catch (e) {
      setError(e.message);
    } finally {
      setSimulating(false);
    }
  };

  const handleAIInvestigate = async (exceptionId) => {
    setAiLoading(true);
    setActiveExceptionId(exceptionId);
    setAiResult(null);
    try {
      const res = await fetch('/api/ai/copilot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'investigate',
          exceptionId
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'AI failed');
      setAiResult(data.data.analysis);
    } catch (e) {
      alert("AI Error: " + e.message);
    } finally {
      setAiLoading(false);
    }
  };

  const handleAutoFix = async (exceptionId, fixType) => {
    setFixingId(exceptionId);
    // Simulate a network delay for the fix
    await new Promise(r => setTimeout(r, 1500));
    setFixedIds(prev => [...prev, exceptionId]);
    setFixingId(null);
    alert(`Successfully executed autonomous fix: ${fixType}`);
  };

  const handleExportPDF = () => {
    window.print();
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
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
    { id: 'PERFECT_MATCH', label: 'Perfect Flow', color: 'emerald' },
    { id: 'MISSING_SETTLEMENT', label: 'Drop Settlement', color: 'rose' },
    { id: 'FEE_MISMATCH', label: 'Gateway Overcharge', color: 'amber' },
    { id: 'AMOUNT_MISMATCH', label: 'Short Settlement', color: 'orange' },
    { id: 'DELAYED_SETTLEMENT', label: 'Late Settlement (10d)', color: 'blue' },
    { id: 'DUPLICATE_TRANSACTION', label: 'Duplicate Settlement', color: 'purple' },
    { id: 'STATUS_MISMATCH', label: 'Status Mismatch', color: 'pink' },
    { id: 'MISSING_REFUND', label: 'Missing Refund', color: 'cyan' },
  ];

  // Build timeline events
  let timelineEvents = [];
  if (tx) {
    if (tx.order) timelineEvents.push({ time: tx.order.createdAt, title: 'Order Created', desc: tx.order.externalOrderId, icon: Receipt, color: 'text-slate-400', bg: 'bg-slate-700/60', ring: 'ring-slate-600/30' });
    if (tx.createdAt) timelineEvents.push({ time: tx.createdAt, title: 'Payment Initiated', desc: tx.externalPaymentId, icon: CreditCard, color: 'text-slate-400', bg: 'bg-slate-700/60', ring: 'ring-slate-600/30' });
    if (tx.capturedAt) timelineEvents.push({ time: tx.capturedAt, title: 'Payment Captured', desc: tx.status, icon: CreditCard, color: 'text-indigo-400', bg: 'bg-indigo-900/50', ring: 'ring-indigo-500/30' });
    if (tx.settlements?.length > 0) {
      tx.settlements.forEach(s => {
        timelineEvents.push({ time: s.settledAt || s.createdAt, title: 'Settlement Processed', desc: s.externalSettlementId, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-900/50', ring: 'ring-blue-500/30' });
        s.bankTransactions?.forEach(bt => {
          timelineEvents.push({ time: bt.transactionDate, title: 'Bank Clear', desc: bt.reference, icon: Building2, color: 'text-emerald-400', bg: 'bg-emerald-900/50', ring: 'ring-emerald-500/30' });
        });
      });
    }
    if (tx.exceptions?.length > 0) {
      tx.exceptions.forEach(ex => {
        timelineEvents.push({ time: ex.createdAt, title: 'Anomaly Detected', desc: ex.type.replace(/_/g, ' '), icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-900/50', ring: 'ring-rose-500/30' });
      });
    }
    timelineEvents.sort((a, b) => new Date(a.time) - new Date(b.time));
  }

  // Graph node component
  const GraphNode = ({ icon: Icon, title, iconColor, borderColor, bgColor, children }) => (
    <div className="flex flex-col items-center flex-1 min-w-[120px] max-w-[180px] relative group animate-fade-in-up print:w-[130px] print:max-w-none print:min-w-0">
      <div className={`w-[72px] h-[72px] lg:w-[80px] lg:h-[80px] rounded-2xl ${bgColor} border-2 ${borderColor} flex items-center justify-center shadow-xl z-10 transition-transform duration-300 group-hover:scale-105 print:shadow-none print:w-12 print:h-12 print:rounded-xl`}>
        <Icon className={`w-7 h-7 lg:w-8 lg:h-8 ${iconColor} print:w-5 print:h-5`} />
      </div>
      <div className="mt-3 text-center space-y-1 w-full overflow-hidden print:mt-1.5">
        <div className="font-bold text-sm lg:text-base text-slate-100 print:text-black print:text-xs truncate">{title}</div>
        {children}
      </div>
    </div>
  );

  // Connection arrow
  const ConnectArrow = () => (
    <div className="hidden lg:flex items-center justify-center shrink-0 print:flex print:shrink">
      <div className="w-4 xl:w-8 h-[2px] bg-gradient-to-r from-slate-600 to-slate-500 print:w-3 print:bg-gray-400" />
      <ArrowRight className="w-4 h-4 text-slate-500 -ml-1 print:w-3 print:h-3 print:text-gray-400" />
    </div>
  );

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 min-h-screen print:bg-white print:text-black print:p-2 print:space-y-4">
      
      {/* Header - Hidden in Print */}
      <div className="flex items-center justify-between print:hidden animate-fade-in-up">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3 bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/20">
              <GitBranch className="h-5 w-5 text-white" />
            </div>
            Digital Twin
          </h2>
          <p className="text-muted-foreground mt-1">
            Visual reconstruction of a transaction&apos;s physical lifecycle.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-slate-100 dark:bg-slate-800/60 rounded-xl p-1">
            <button onClick={() => setViewMode('graph')} className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center transition-all duration-200 ${viewMode === 'graph' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <Activity className="w-4 h-4 mr-2" /> Graph
            </button>
            <button onClick={() => setViewMode('timeline')} className={`px-4 py-2 rounded-lg font-medium text-sm flex items-center transition-all duration-200 ${viewMode === 'timeline' ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'}`}>
              <Calendar className="w-4 h-4 mr-2" /> Timeline
            </button>
          </div>
          <button onClick={handleExportPDF} className="group px-4 py-2.5 rounded-xl border border-border/50 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-600 dark:text-slate-300 font-medium text-sm transition-all duration-200 flex items-center hover:shadow-sm">
            <Download className="w-4 h-4 mr-2 text-slate-400 group-hover:text-blue-500 group-hover:-translate-y-0.5 transition-all duration-200" /> Export Evidence
          </button>
        </div>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block mb-4 border-b pb-3">
        <h1 className="text-2xl font-bold">Dispute Evidence Report</h1>
        <p className="text-gray-500 text-xs mt-1">Generated by PaySynapse Financial Intelligence</p>
        <div className="mt-2 text-xs font-mono text-gray-700">
          Payment Reference: {tx?.externalPaymentId || searchId} &nbsp;|&nbsp; Export Date: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-2xl animate-fade-in-up stagger-2 print:hidden">
        <div className="relative flex items-center bg-white dark:bg-slate-800/60 rounded-2xl border border-border/50 shadow-sm overflow-hidden group focus-within:border-blue-300 dark:focus-within:border-blue-700 focus-within:shadow-[0_0_0_3px_rgba(45,136,255,0.1)] transition-all duration-300">
          <Search className="h-5 w-5 text-slate-400 ml-4 group-focus-within:text-blue-500 transition-colors" />
          <input 
            type="text" 
            value={searchId}
            onChange={(e) => setSearchId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder="Enter Payment Internal UUID to reconstruct..."
            className="w-full bg-transparent border-none text-slate-800 dark:text-slate-200 pl-3 py-3.5 focus:outline-none focus:ring-0 placeholder:text-slate-400 text-sm"
          />
          <button 
            onClick={() => handleSearch()}
            disabled={loading || !searchId}
            className="mr-2 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 disabled:opacity-40 shadow-sm hover:shadow-lg hover:shadow-blue-500/20 whitespace-nowrap flex items-center"
          >
            {loading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Rendering...</> : <><Zap className="w-4 h-4 mr-1.5" /> Render Twin</>}
          </button>
        </div>
      </div>

      {/* Simulation Control Panel */}
      <div className="w-full max-w-5xl animate-fade-in-up stagger-3 print:hidden">
        <div className="rounded-2xl border border-border/50 bg-white dark:bg-slate-800/40 backdrop-blur-sm p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/30">
              <Zap className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Simulation Sandbox</h3>
            <span className="text-[10px] text-slate-400 font-normal normal-case ml-1">— Inject anomalies to test detection</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {scenarios.map(s => (
              <button
                key={s.id}
                onClick={() => handleSimulate(s.id)}
                disabled={simulating}
                className={`text-xs px-3.5 py-2 rounded-xl font-medium transition-all duration-200 border flex items-center gap-1.5
                  bg-${s.color}-50 dark:bg-${s.color}-950/20 text-${s.color}-600 dark:text-${s.color}-400 border-${s.color}-200/50 dark:border-${s.color}-800/30
                  hover:bg-${s.color}-100 dark:hover:bg-${s.color}-950/30 hover:shadow-sm disabled:opacity-50`}
              >
                {simulating === s.id ? <Loader2 className="w-3 h-3 animate-spin" /> : null}
                {simulating === s.id ? 'Injecting...' : s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30 rounded-2xl text-rose-600 dark:text-rose-400 flex items-center text-sm font-medium animate-fade-in-up print:hidden">
          <AlertTriangle className="w-5 h-5 mr-3 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Transaction Visualization */}
      {tx && (
        <div className="mt-4 relative animate-fade-in-up print:mt-1">
          
          {viewMode === 'graph' ? (
            /* GRAPH VIEW */
            <div className="rounded-2xl border border-border/50 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/30 dark:from-slate-900 dark:via-slate-900 dark:to-indigo-950/30 p-6 md:p-8 shadow-sm print:bg-white print:border-gray-300 print:p-3 print:shadow-none">
              <div className="flex flex-wrap lg:flex-nowrap items-center justify-center lg:justify-between w-full gap-6 lg:gap-2 relative z-10 print:flex-nowrap print:flex-row print:justify-between print:gap-1">
                
                {/* NODE 1: ORDER */}
                <GraphNode 
                  icon={Receipt} title="Order"
                  iconColor="text-slate-300 print:text-gray-600"
                  borderColor="border-slate-600/50 print:border-gray-300"
                  bgColor="bg-slate-800/80 print:bg-gray-100"
                >
                  {tx.order ? (
                    <>
                      <div className="text-xs font-mono text-slate-400 print:text-gray-600">{tx.order.externalOrderId}</div>
                      <div className="text-emerald-400 font-semibold text-sm print:text-green-700">{formatCurrency(tx.order.amount)}</div>
                    </>
                  ) : (
                    <div className="text-rose-400 font-bold text-xs bg-rose-950/50 px-3 py-1 rounded-lg print:text-red-600 print:bg-red-100">MISSING</div>
                  )}
                </GraphNode>

                <ConnectArrow />

                {/* NODE 2: PAYMENT */}
                <GraphNode 
                  icon={CreditCard} title="Payment"
                  iconColor={tx.status === 'CAPTURED' ? 'text-indigo-300 print:text-blue-600' : 'text-rose-300 print:text-red-600'}
                  borderColor={tx.status === 'CAPTURED' ? 'border-indigo-500/60 print:border-blue-500' : 'border-rose-500/60 print:border-red-500'}
                  bgColor={tx.status === 'CAPTURED' ? 'bg-indigo-900/50 print:bg-blue-50' : 'bg-rose-900/50 print:bg-red-50'}
                >
                  <div className="text-xs font-mono text-slate-400 print:text-gray-600">{tx.externalPaymentId}</div>
                  <div className={`${tx.status === 'CAPTURED' ? 'text-emerald-400 print:text-green-700' : 'text-rose-400 print:text-red-700'} font-semibold text-sm`}>
                    {formatCurrency(tx.amount)}
                  </div>
                  <span className={`text-[10px] font-semibold px-2.5 py-0.5 rounded-lg mt-0.5 inline-block ${
                    tx.status === 'CAPTURED' 
                      ? 'bg-emerald-950/50 text-emerald-400 ring-1 ring-emerald-500/20 print:bg-green-100 print:text-green-700' 
                      : 'bg-rose-950/50 text-rose-400 ring-1 ring-rose-500/20 print:bg-red-100 print:text-red-700'
                  }`}>{tx.status}</span>
                </GraphNode>

                <ConnectArrow />

                {/* NODE 3: FEES/TAXES */}
                <GraphNode 
                  icon={ArrowRightLeft} title="Fees & Taxes"
                  iconColor="text-slate-300 print:text-gray-600"
                  borderColor="border-slate-600/50 print:border-gray-300"
                  bgColor="bg-slate-800/80 print:bg-gray-100"
                >
                  {tx.fees?.length > 0 ? (
                    <div className="text-rose-400 font-semibold text-xs space-y-0.5 print:text-red-700">
                      <div>-{formatCurrency(tx.fees.reduce((s,f) => s + parseFloat(f.amount.toString()), 0))} (Fee)</div>
                      <div>-{formatCurrency(tx.fees.reduce((s,f) => s + parseFloat(f.tax.toString()), 0))} (Tax)</div>
                    </div>
                  ) : (
                    <div className="text-slate-500 font-medium text-xs print:text-gray-500">No Fees Deducted</div>
                  )}
                </GraphNode>

                <ConnectArrow />

                {/* NODE 4: SETTLEMENT */}
                <GraphNode 
                  icon={Clock} title="Settlement"
                  iconColor={tx.settlements?.length > 0 ? 'text-blue-300 print:text-blue-600' : 'text-rose-300 print:text-red-600'}
                  borderColor={tx.settlements?.length > 0 ? 'border-blue-500/60 print:border-blue-500' : 'border-rose-500/60 print:border-red-500'}
                  bgColor={tx.settlements?.length > 0 ? 'bg-blue-900/50 print:bg-blue-50' : 'bg-rose-900/50 print:bg-red-50'}
                >
                  {tx.settlements?.length > 0 ? (
                    <>
                      <div className="text-xs font-mono text-slate-400 truncate w-full print:text-gray-600" title={tx.settlements[0].externalSettlementId}>{tx.settlements[0].externalSettlementId}</div>
                      <div className="text-emerald-400 font-semibold text-sm print:text-green-700">{formatCurrency(tx.settlements[0].amount)}</div>
                      {tx.settlements.length > 1 && (
                        <div className="text-rose-400 text-[10px] font-bold bg-rose-950/50 px-2.5 py-0.5 rounded-lg ring-1 ring-rose-500/20 print:text-red-700 print:bg-red-100">DUPLICATE DETECTED</div>
                      )}
                    </>
                  ) : (
                    <div className="text-rose-400 font-bold text-xs bg-rose-950/50 px-3 py-1 rounded-lg print:text-red-700 print:bg-red-100">MISSING</div>
                  )}
                </GraphNode>

                <ConnectArrow />

                {/* NODE 5: BANK CLEARING */}
                <GraphNode 
                  icon={Building2} title="Bank"
                  iconColor={tx.settlements?.some(s => s.bankTransactions?.length > 0) ? 'text-emerald-300 print:text-green-600' : 'text-rose-300 print:text-red-600'}
                  borderColor={tx.settlements?.some(s => s.bankTransactions?.length > 0) ? 'border-emerald-500/60 print:border-green-500' : 'border-rose-500/60 print:border-red-500'}
                  bgColor={tx.settlements?.some(s => s.bankTransactions?.length > 0) ? 'bg-emerald-900/50 print:bg-green-50' : 'bg-rose-900/50 print:bg-red-50'}
                >
                  {tx.settlements?.map(s => s.bankTransactions?.map(bt => (
                    <div key={bt.id} className="space-y-0.5">
                      <div className="text-xs font-mono text-slate-400 print:text-gray-600">{bt.reference}</div>
                      <div className="text-emerald-400 font-semibold text-sm print:text-green-700">{formatCurrency(bt.amount)}</div>
                    </div>
                  )))}
                  {tx.settlements?.every(s => !s.bankTransactions || s.bankTransactions.length === 0) && (
                    <div className="text-rose-400 font-bold text-xs bg-rose-950/50 px-3 py-1 rounded-lg print:text-red-700 print:bg-red-100">PENDING/MISSING</div>
                  )}
                </GraphNode>

              </div>
            </div>
          ) : (
            /* TIMELINE VIEW */
            <div className="rounded-2xl border border-border/50 bg-white dark:bg-slate-900/60 backdrop-blur-sm p-6 md:p-8 shadow-sm print:border-none print:p-0 print:bg-white relative">
              <div className="absolute left-[39px] md:left-[43px] top-8 bottom-8 w-[2px] bg-gradient-to-b from-slate-200 via-slate-300 to-slate-200 dark:from-slate-700 dark:via-slate-600 dark:to-slate-700 print:bg-gray-300" />
              {timelineEvents.map((evt, idx) => {
                const Icon = evt.icon;
                return (
                  <div key={idx} className="flex items-start mb-6 last:mb-0 relative z-10 animate-fade-in-up" style={{ animationDelay: `${idx * 80}ms` }}>
                    <div className={`w-9 h-9 rounded-xl ${evt.bg} ${evt.color} flex items-center justify-center shrink-0 mt-0.5 ring-4 ring-white dark:ring-slate-900 print:ring-white border border-white/10 shadow-lg`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="ml-5 flex-1 bg-slate-50 dark:bg-slate-800/40 print:bg-gray-50 border border-border/50 print:border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-slate-800 dark:text-slate-200 print:text-black">{evt.title}</h4>
                          <p className="text-sm font-mono text-slate-500 print:text-gray-600 mt-0.5">{evt.desc}</p>
                        </div>
                        <div className="text-[11px] text-slate-400 font-medium print:text-gray-500 bg-slate-100 dark:bg-slate-700/50 px-2 py-0.5 rounded-md whitespace-nowrap">
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
            <div className="mt-8 rounded-2xl border border-rose-200/50 dark:border-rose-800/30 bg-rose-50/50 dark:bg-rose-950/10 backdrop-blur-sm p-6 relative overflow-hidden shadow-sm print:bg-red-50 print:border-red-200 animate-fade-in-up">
              <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-rose-500 to-orange-500 rounded-r" />
              <h3 className="text-xl font-bold text-rose-600 dark:text-rose-400 mb-5 flex items-center print:text-red-700">
                <div className="p-2 rounded-xl bg-rose-100 dark:bg-rose-900/30 mr-3">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                Detected Anomalies
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {tx.exceptions.map((ex, idx) => (
                  <div key={ex.id} className="bg-white dark:bg-slate-900/60 print:bg-white p-5 rounded-xl border border-rose-200/50 dark:border-rose-800/20 print:border-red-200 shadow-sm hover:shadow-md transition-all duration-200 animate-fade-in-up" style={{ animationDelay: `${idx * 100}ms` }}>
                    <div className="font-bold text-rose-600 dark:text-rose-400 print:text-red-700">{ex.type.replace(/_/g, ' ')}</div>
                    <div className="text-slate-500 dark:text-slate-400 print:text-gray-700 text-sm mt-1">{ex.description}</div>
                    <div className="text-rose-600 dark:text-rose-400 print:text-red-700 font-mono font-bold text-lg mt-3">{formatCurrency(ex.financialImpact)}</div>
                    
                    {/* AI & Auto-Fix Buttons */}
                    <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-rose-200/50 dark:border-rose-800/20 print:hidden">
                      <button 
                        onClick={() => handleAIInvestigate(ex.id)}
                        disabled={aiLoading}
                        className="w-full flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 shadow-sm hover:shadow-lg hover:shadow-indigo-500/20 disabled:opacity-50"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        {aiLoading && activeExceptionId === ex.id ? (
                          <><Loader2 className="w-4 h-4 mr-1.5 animate-spin" /> Investigating...</>
                        ) : 'Ask AI to Investigate'}
                      </button>
                      
                      <button 
                        onClick={() => handleAutoFix(ex.id, getActionForException(ex.type))}
                        disabled={fixingId === ex.id || fixedIds.includes(ex.id)}
                        className={`w-full flex items-center justify-center px-4 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                          fixedIds.includes(ex.id) 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 ring-1 ring-emerald-500/20 cursor-default' 
                            : 'border border-border/50 bg-white dark:bg-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-700/60 text-slate-700 dark:text-slate-300 hover:shadow-sm'
                        }`}
                      >
                        {fixedIds.includes(ex.id) ? (
                          <><CheckCircle2 className="w-4 h-4 mr-2" /> Resolution Applied</>
                        ) : fixingId === ex.id ? (
                          <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Executing Fix...</>
                        ) : (
                          <><Wrench className="w-4 h-4 mr-2 text-slate-400" /> {getActionForException(ex.type)}</>
                        )}
                      </button>
                    </div>
                    
                    {/* Print Only */}
                    <div className="hidden print:block text-sm text-gray-500 mt-4 border-t pt-2 border-gray-200">
                      Suggested Action: {getActionForException(ex.type)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Inline AI Result */}
              {aiResult && (
                <div className="mt-6 bg-white dark:bg-slate-900/60 print:bg-white p-6 rounded-xl border border-indigo-200/50 dark:border-indigo-800/30 print:border-gray-300 shadow-lg print:shadow-none animate-fade-in-up">
                  <div className="flex items-center text-indigo-600 dark:text-indigo-400 print:text-indigo-700 font-bold text-lg mb-4">
                    <div className="p-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 mr-3">
                      <Brain className="w-5 h-5" />
                    </div>
                    AI Root Cause Analysis
                  </div>
                  <div className="prose prose-slate dark:prose-invert prose-indigo max-w-none text-sm print:prose-slate">
                    <ReactMarkdown>{aiResult}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Success state */}
          {tx.reconciliations?.[0]?.status === 'MATCHED' && (
            <div className="mt-8 rounded-2xl border border-emerald-200/50 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-950/10 print:bg-green-50 print:border-green-200 p-8 text-center animate-fade-in-up">
              <div className="inline-flex p-3 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 mb-4">
                <CheckCircle2 className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 print:text-green-700">
                Lifecycle Perfectly Reconciled
              </h3>
              <p className="text-slate-500 dark:text-slate-400 print:text-gray-600 mt-2">All financial nodes correspond flawlessly.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
