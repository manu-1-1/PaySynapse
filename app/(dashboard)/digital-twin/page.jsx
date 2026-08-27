'use client';

import { useState, useEffect } from 'react';
import { Search, Activity, Box, CreditCard, Building2, Receipt, ArrowRightLeft, Clock, AlertTriangle, ArrowRight, Brain, Wrench, Download, Calendar } from 'lucide-react';
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

  // Build timeline events
  let timelineEvents = [];
  if (tx) {
    if (tx.order) timelineEvents.push({ time: tx.order.createdAt, title: 'Order Created', desc: tx.order.externalOrderId, icon: Receipt, color: 'text-slate-400', bg: 'bg-slate-800' });
    if (tx.createdAt) timelineEvents.push({ time: tx.createdAt, title: 'Payment Initiated', desc: tx.externalPaymentId, icon: CreditCard, color: 'text-slate-400', bg: 'bg-slate-800' });
    if (tx.capturedAt) timelineEvents.push({ time: tx.capturedAt, title: 'Payment Captured', desc: tx.status, icon: CreditCard, color: 'text-indigo-400', bg: 'bg-indigo-900/40' });
    if (tx.settlements?.length > 0) {
      tx.settlements.forEach(s => {
        timelineEvents.push({ time: s.settledAt || s.createdAt, title: 'Settlement Processed', desc: s.externalSettlementId, icon: Clock, color: 'text-blue-400', bg: 'bg-blue-900/40' });
        s.bankTransactions?.forEach(bt => {
          timelineEvents.push({ time: bt.transactionDate, title: 'Bank Clear', desc: bt.reference, icon: Building2, color: 'text-emerald-400', bg: 'bg-emerald-900/40' });
        });
      });
    }
    if (tx.exceptions?.length > 0) {
      tx.exceptions.forEach(ex => {
        timelineEvents.push({ time: ex.createdAt, title: 'Anomaly Detected', desc: ex.type, icon: AlertTriangle, color: 'text-rose-400', bg: 'bg-rose-900/40' });
      });
    }
    timelineEvents.sort((a, b) => new Date(a.time) - new Date(b.time));
  }

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-900 min-h-screen text-slate-100 print:bg-white print:text-black">
      
      {/* Header - Hidden in Print */}
      <div className="flex items-center justify-between print:hidden">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Digital Twin
          </h2>
          <p className="text-slate-400 mt-1">
            Visual reconstruction of a transaction's physical lifecycle.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <button onClick={() => setViewMode('graph')} className={`px-4 py-2 rounded-md font-medium flex items-center ${viewMode === 'graph' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
            <Activity className="w-4 h-4 mr-2" /> Graph View
          </button>
          <button onClick={() => setViewMode('timeline')} className={`px-4 py-2 rounded-md font-medium flex items-center ${viewMode === 'timeline' ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'}`}>
            <Calendar className="w-4 h-4 mr-2" /> Timeline View
          </button>
          <button onClick={handleExportPDF} className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-md font-medium transition-colors flex items-center">
            <Download className="w-4 h-4 mr-2" /> Export Evidence
          </button>
        </div>
      </div>

      {/* Print Only Header */}
      <div className="hidden print:block mb-8 border-b pb-4">
        <h1 className="text-3xl font-bold">Dispute Evidence Report</h1>
        <p className="text-gray-500 mt-2">Generated by PaySynapse Financial Intelligence</p>
        <div className="mt-4 text-sm font-mono">
          Payment Reference: {tx?.externalPaymentId || searchId} <br/>
          Export Date: {new Date().toLocaleString()}
        </div>
      </div>

      {/* Search Bar - Hidden in Print */}
      <div className="relative w-full max-w-2xl bg-slate-800 rounded-lg p-2 border border-slate-700 shadow-xl flex items-center space-x-2 print:hidden">
        <Search className="h-5 w-5 text-slate-400 ml-2" />
        <input 
          type="text" 
          value={searchId}
          onChange={(e) => setSearchId(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
          placeholder="Enter Payment Internal UUID to reconstruct..."
          className="w-full bg-transparent border-none text-slate-200 pl-2 py-2 focus:outline-none focus:ring-0 placeholder:text-slate-500"
        />
        <button 
          onClick={() => handleSearch()}
          disabled={loading || !searchId}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50"
        >
          {loading ? 'Reconstructing...' : 'Render Twin'}
        </button>
      </div>

      {/* Simulation Control Panel - Hidden in Print */}
      <div className="w-full max-w-5xl bg-slate-900 border border-slate-700/50 rounded-lg p-4 print:hidden">
        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Simulation Sandbox (Inject Anomalies)</h3>
        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleSimulate('PERFECT_MATCH')} disabled={simulating} className="text-xs px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20">
            {simulating === 'PERFECT_MATCH' ? 'Injecting...' : 'Perfect Flow'}
          </button>
          <button onClick={() => handleSimulate('MISSING_SETTLEMENT')} disabled={simulating} className="text-xs px-3 py-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20">
            {simulating === 'MISSING_SETTLEMENT' ? 'Injecting...' : 'Drop Settlement'}
          </button>
          <button onClick={() => handleSimulate('FEE_MISMATCH')} disabled={simulating} className="text-xs px-3 py-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20">
            {simulating === 'FEE_MISMATCH' ? 'Injecting...' : 'Gateway Overcharge'}
          </button>
          <button onClick={() => handleSimulate('AMOUNT_MISMATCH')} disabled={simulating} className="text-xs px-3 py-1.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20">
            {simulating === 'AMOUNT_MISMATCH' ? 'Injecting...' : 'Short Settlement'}
          </button>
          <button onClick={() => handleSimulate('DELAYED_SETTLEMENT')} disabled={simulating} className="text-xs px-3 py-1.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20">
            {simulating === 'DELAYED_SETTLEMENT' ? 'Injecting...' : 'Late Settlement (10d)'}
          </button>
          <button onClick={() => handleSimulate('DUPLICATE_TRANSACTION')} disabled={simulating} className="text-xs px-3 py-1.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 hover:bg-purple-500/20">
            {simulating === 'DUPLICATE_TRANSACTION' ? 'Injecting...' : 'Duplicate Settlement'}
          </button>
          <button onClick={() => handleSimulate('STATUS_MISMATCH')} disabled={simulating} className="text-xs px-3 py-1.5 rounded bg-pink-500/10 text-pink-400 border border-pink-500/20 hover:bg-pink-500/20">
            {simulating === 'STATUS_MISMATCH' ? 'Injecting...' : 'Status Mismatch (Failed/Paid)'}
          </button>
          <button onClick={() => handleSimulate('MISSING_REFUND')} disabled={simulating} className="text-xs px-3 py-1.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 hover:bg-cyan-500/20">
            {simulating === 'MISSING_REFUND' ? 'Injecting...' : 'Simulate Missing Refund'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-900/40 border border-rose-500/50 rounded-lg text-rose-300 flex items-center print:hidden">
          <AlertTriangle className="w-5 h-5 mr-2" /> {error}
        </div>
      )}

      {tx && (
        <div className="mt-8 relative">
          
          {viewMode === 'graph' ? (
            /* GRAPH VIEW */
            <div className="flex flex-col md:flex-row items-center justify-between w-full space-y-8 md:space-y-0 md:space-x-4 relative z-10 print:flex-wrap print:justify-start print:gap-4">
              
              {/* NODE 1: ORDER */}
              <div className="flex flex-col items-center w-48 relative">
                <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 print:border-gray-300 print:bg-gray-100 print:shadow-none">
                  <Receipt className="w-10 h-10 text-slate-400 print:text-gray-600" />
                </div>
                <div className="mt-4 text-center">
                  <div className="font-bold text-lg text-slate-200 print:text-black">Order</div>
                  {tx.order ? (
                    <>
                      <div className="text-sm font-mono text-slate-400 mt-1 print:text-gray-600">{tx.order.externalOrderId}</div>
                      <div className="text-emerald-400 font-semibold mt-1 print:text-green-700">{formatCurrency(tx.order.amount)}</div>
                    </>
                  ) : (
                    <div className="text-rose-400 font-bold mt-1 text-sm print:text-red-600">MISSING</div>
                  )}
                </div>
              </div>

              <ArrowRight className="hidden md:block w-8 h-8 text-slate-700 print:hidden" />

              {/* NODE 2: PAYMENT */}
              <div className="flex flex-col items-center w-48 relative">
                <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 print:shadow-none ${
                  tx.status === 'CAPTURED' ? 'bg-indigo-900/40 border-indigo-500 print:bg-blue-50 print:border-blue-500' : 'bg-rose-900/40 border-rose-500 print:bg-red-50 print:border-red-500'
                }`}>
                  <CreditCard className={`w-10 h-10 ${tx.status === 'CAPTURED' ? 'text-indigo-400 print:text-blue-600' : 'text-rose-400 print:text-red-600'}`} />
                </div>
                <div className="mt-4 text-center">
                  <div className="font-bold text-lg text-slate-200 print:text-black">Payment</div>
                  <div className="text-sm font-mono text-slate-400 mt-1 print:text-gray-600">{tx.externalPaymentId}</div>
                  <div className={`${tx.status === 'CAPTURED' ? 'text-emerald-400 print:text-green-700' : 'text-rose-400 print:text-red-700'} font-semibold mt-1 flex flex-col items-center`}>
                    {formatCurrency(tx.amount)}
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded mt-1 text-slate-300 print:bg-gray-200 print:text-gray-800">{tx.status}</span>
                  </div>
                </div>
              </div>

              <ArrowRight className="hidden md:block w-8 h-8 text-slate-700 print:hidden" />

              {/* NODE 3: FEES/TAXES */}
              <div className="flex flex-col items-center w-48 relative">
                <div className={`w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 print:bg-gray-100 print:border-gray-300 print:shadow-none`}>
                  <ArrowRightLeft className="w-10 h-10 text-slate-400 print:text-gray-600" />
                </div>
                <div className="mt-4 text-center">
                  <div className="font-bold text-lg text-slate-200 print:text-black">Fees & Taxes</div>
                  {tx.fees?.length > 0 ? (
                    <div className="text-rose-400 font-semibold mt-1 print:text-red-700">
                      -{formatCurrency(tx.fees.reduce((s,f) => s + parseFloat(f.amount.toString()), 0))} (Fee)
                      <br/>
                      -{formatCurrency(tx.fees.reduce((s,f) => s + parseFloat(f.tax.toString()), 0))} (Tax)
                    </div>
                  ) : (
                    <div className="text-slate-500 font-medium mt-1 text-sm print:text-gray-500">No Fees Deducted</div>
                  )}
                </div>
              </div>

              <ArrowRight className="hidden md:block w-8 h-8 text-slate-700 print:hidden" />

              {/* NODE 4: SETTLEMENT */}
              <div className="flex flex-col items-center w-48 relative">
                <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 print:shadow-none ${
                  tx.settlements?.length > 0 ? 'bg-blue-900/40 border-blue-500 print:bg-blue-50 print:border-blue-500' : 'bg-rose-900/40 border-rose-500 print:bg-red-50 print:border-red-500'
                }`}>
                  <Clock className={`w-10 h-10 ${tx.settlements?.length > 0 ? 'text-blue-400 print:text-blue-600' : 'text-rose-400 print:text-red-600'}`} />
                </div>
                <div className="mt-4 text-center">
                  <div className="font-bold text-lg text-slate-200 print:text-black">Settlement</div>
                  {tx.settlements?.length > 0 ? (
                    <>
                      <div className="text-sm font-mono text-slate-400 mt-1 truncate w-full print:text-gray-600" title={tx.settlements[0].externalSettlementId}>{tx.settlements[0].externalSettlementId}</div>
                      <div className="text-emerald-400 font-semibold mt-1 print:text-green-700">{formatCurrency(tx.settlements[0].amount)}</div>
                      {tx.settlements.length > 1 && (
                        <div className="text-rose-400 text-xs font-bold mt-1 bg-rose-900/50 px-2 py-0.5 rounded print:text-red-700 print:bg-red-100">DUPLICATE DETECTED</div>
                      )}
                    </>
                  ) : (
                    <div className="text-rose-400 font-bold mt-1 text-sm bg-rose-900/30 px-3 py-1 rounded print:text-red-700 print:bg-red-100">MISSING</div>
                  )}
                </div>
              </div>

              <ArrowRight className="hidden md:block w-8 h-8 text-slate-700 print:hidden" />

              {/* NODE 5: BANK CLEARING */}
              <div className="flex flex-col items-center w-48 relative">
                <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 print:shadow-none ${
                  tx.settlements?.some(s => s.bankTransactions?.length > 0) ? 'bg-emerald-900/40 border-emerald-500 print:bg-green-50 print:border-green-500' : 'bg-rose-900/40 border-rose-500 print:bg-red-50 print:border-red-500'
                }`}>
                  <Building2 className={`w-10 h-10 ${tx.settlements?.some(s => s.bankTransactions?.length > 0) ? 'text-emerald-400 print:text-green-600' : 'text-rose-400 print:text-red-600'}`} />
                </div>
                <div className="mt-4 text-center">
                  <div className="font-bold text-lg text-slate-200 print:text-black">Bank</div>
                  {tx.settlements?.map(s => s.bankTransactions?.map(bt => (
                    <div key={bt.id} className="mt-1">
                      <div className="text-sm font-mono text-slate-400 print:text-gray-600">{bt.reference}</div>
                      <div className="text-emerald-400 font-semibold print:text-green-700">{formatCurrency(bt.amount)}</div>
                    </div>
                  )))}
                  {tx.settlements?.every(s => !s.bankTransactions || s.bankTransactions.length === 0) && (
                    <div className="text-rose-400 font-bold mt-1 text-sm bg-rose-900/30 px-3 py-1 rounded print:text-red-700 print:bg-red-100">PENDING/MISSING</div>
                  )}
                </div>
              </div>

            </div>
          ) : (
            /* TIMELINE VIEW */
            <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 print:border-none print:p-0 print:bg-white relative">
              <div className="absolute left-10 top-6 bottom-6 w-0.5 bg-slate-700 print:bg-gray-300"></div>
              {timelineEvents.map((evt, idx) => {
                const Icon = evt.icon;
                return (
                  <div key={idx} className="flex items-start mb-8 relative z-10">
                    <div className={`w-8 h-8 rounded-full ${evt.bg} ${evt.color} flex items-center justify-center shrink-0 mt-1 ring-4 ring-slate-900 print:ring-white border border-slate-700 print:border-gray-300`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="ml-6 flex-1 bg-slate-900/50 print:bg-gray-50 border border-slate-700 print:border-gray-200 rounded-lg p-4 shadow-sm">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-bold text-slate-200 print:text-black">{evt.title}</h4>
                          <p className="text-sm font-mono text-slate-400 print:text-gray-600 mt-1">{evt.desc}</p>
                        </div>
                        <div className="text-xs text-slate-500 font-medium print:text-gray-500">
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
            <div className="mt-12 bg-rose-950/30 border border-rose-500/30 rounded-xl p-6 relative overflow-hidden print:bg-red-50 print:border-red-200">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
              <h3 className="text-xl font-bold text-rose-400 mb-4 flex items-center print:text-red-700">
                <AlertTriangle className="w-6 h-6 mr-2" /> Detected Anomalies
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {tx.exceptions.map(ex => (
                  <div key={ex.id} className="bg-slate-900/50 print:bg-white p-4 rounded-lg border border-rose-500/20 print:border-red-200 shadow-sm">
                    <div className="font-bold text-rose-300 print:text-red-700">{ex.type.replace(/_/g, ' ')}</div>
                    <div className="text-slate-400 print:text-gray-700 text-sm mt-1">{ex.description}</div>
                    <div className="text-rose-400 print:text-red-700 font-mono mt-2 mb-4">{formatCurrency(ex.financialImpact)}</div>
                    
                    {/* Embedded AI & Auto-Fix Buttons - Hidden in Print */}
                    <div className="flex flex-col space-y-2 mt-4 pt-4 border-t border-rose-500/20 print:hidden">
                      <button 
                        onClick={() => handleAIInvestigate(ex.id)}
                        disabled={aiLoading}
                        className="w-full flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md font-medium transition-colors"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        {aiLoading && activeExceptionId === ex.id ? 'Investigating...' : 'Ask AI to Investigate'}
                      </button>
                      
                      <button 
                        onClick={() => handleAutoFix(ex.id, getActionForException(ex.type))}
                        disabled={fixingId === ex.id || fixedIds.includes(ex.id)}
                        className={`w-full flex items-center justify-center px-4 py-2 rounded-md font-medium transition-colors ${
                          fixedIds.includes(ex.id) ? 'bg-emerald-600 text-white cursor-not-allowed' : 'bg-slate-700 hover:bg-slate-600 text-white'
                        }`}
                      >
                        <Wrench className="w-4 h-4 mr-2" />
                        {fixedIds.includes(ex.id) ? 'Resolution Applied' : (fixingId === ex.id ? 'Executing Fix...' : getActionForException(ex.type))}
                      </button>
                    </div>
                    
                    {/* Print Only Action Record */}
                    <div className="hidden print:block text-sm text-gray-500 mt-4 border-t pt-2 border-gray-200">
                      Suggested Action: {getActionForException(ex.type)}
                    </div>
                  </div>
                ))}
              </div>

              {/* Inline AI Result */}
              {aiResult && (
                <div className="mt-6 bg-slate-800/80 print:bg-white p-6 rounded-lg border border-indigo-500/30 print:border-gray-300 shadow-xl print:shadow-none">
                  <div className="flex items-center text-indigo-400 print:text-indigo-700 font-bold text-lg mb-4">
                    <Brain className="w-5 h-5 mr-2" />
                    AI Root Cause Analysis
                  </div>
                  <div className="prose prose-invert prose-indigo max-w-none print:prose-slate">
                    <ReactMarkdown>{aiResult}</ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          )}

          {tx.reconciliations?.[0]?.status === 'MATCHED' && (
            <div className="mt-12 bg-emerald-950/30 print:bg-green-50 border border-emerald-500/30 print:border-green-200 rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-emerald-400 print:text-green-700 flex items-center justify-center">
                <Activity className="w-6 h-6 mr-2" /> Lifecycle Perfectly Reconciled
              </h3>
              <p className="text-slate-400 print:text-gray-600 mt-2">All financial nodes correspond flawlessly.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
