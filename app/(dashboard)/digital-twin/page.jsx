'use client';

import { useState, useEffect } from 'react';
import { Search, Activity, Box, CreditCard, Building2, Receipt, ArrowRightLeft, Clock, AlertTriangle, ArrowRight } from 'lucide-react';

export default function DigitalTwinPage() {
  const [searchId, setSearchId] = useState('');
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState('');

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
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scenario })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Simulation failed');
      
      // Auto-load the newly injected transaction
      handleSearch(data.paymentId);
    } catch (e) {
      setError(e.message);
    } finally {
      setSimulating(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-900 min-h-screen text-slate-100">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
            Digital Twin
          </h2>
          <p className="text-slate-400 mt-1">
            Visual reconstruction of a transaction's physical lifecycle.
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative w-full max-w-2xl bg-slate-800 rounded-lg p-2 border border-slate-700 shadow-xl flex items-center space-x-2">
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

      {/* Simulation Control Panel */}
      <div className="w-full max-w-4xl bg-slate-900 border border-slate-700/50 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-slate-400 mb-3 uppercase tracking-wider">Simulation Sandbox (Inject Anomalies)</h3>
        <div className="flex flex-wrap gap-2">
          <button 
            onClick={() => handleSimulate('PERFECT_MATCH')}
            disabled={simulating}
            className="text-xs px-3 py-1.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            {simulating === 'PERFECT_MATCH' ? 'Injecting...' : 'Perfect Flow'}
          </button>
          <button 
            onClick={() => handleSimulate('MISSING_SETTLEMENT')}
            disabled={simulating}
            className="text-xs px-3 py-1.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-colors disabled:opacity-50"
          >
            {simulating === 'MISSING_SETTLEMENT' ? 'Injecting...' : 'Drop Settlement'}
          </button>
          <button 
            onClick={() => handleSimulate('FEE_MISMATCH')}
            disabled={simulating}
            className="text-xs px-3 py-1.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 hover:bg-amber-500/20 transition-colors disabled:opacity-50"
          >
            {simulating === 'FEE_MISMATCH' ? 'Injecting...' : 'Gateway Overcharge'}
          </button>
          <button 
            onClick={() => handleSimulate('AMOUNT_MISMATCH')}
            disabled={simulating}
            className="text-xs px-3 py-1.5 rounded bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors disabled:opacity-50"
          >
            {simulating === 'AMOUNT_MISMATCH' ? 'Injecting...' : 'Short Settlement'}
          </button>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-900/40 border border-rose-500/50 rounded-lg text-rose-300 flex items-center">
          <AlertTriangle className="w-5 h-5 mr-2" /> {error}
        </div>
      )}

      {tx && (
        <div className="mt-8 relative">
          
          <div className="flex flex-col md:flex-row items-center justify-between w-full space-y-8 md:space-y-0 md:space-x-4 relative z-10">
            
            {/* NODE 1: ORDER */}
            <div className="flex flex-col items-center w-48 relative">
              <div className="w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10">
                <Receipt className="w-10 h-10 text-slate-400" />
              </div>
              <div className="mt-4 text-center">
                <div className="font-bold text-lg text-slate-200">Order</div>
                {tx.order ? (
                  <>
                    <div className="text-sm font-mono text-slate-400 mt-1">{tx.order.externalOrderId}</div>
                    <div className="text-emerald-400 font-semibold mt-1">{formatCurrency(tx.order.amount)}</div>
                  </>
                ) : (
                  <div className="text-rose-400 font-bold mt-1 text-sm">MISSING</div>
                )}
              </div>
            </div>

            <ArrowRight className="hidden md:block w-8 h-8 text-slate-700" />

            {/* NODE 2: PAYMENT */}
            <div className="flex flex-col items-center w-48 relative">
              <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 ${
                tx.status === 'CAPTURED' ? 'bg-indigo-900/40 border-indigo-500 shadow-indigo-500/20' : 'bg-rose-900/40 border-rose-500 shadow-rose-500/20'
              }`}>
                <CreditCard className={`w-10 h-10 ${tx.status === 'CAPTURED' ? 'text-indigo-400' : 'text-rose-400'}`} />
              </div>
              <div className="mt-4 text-center">
                <div className="font-bold text-lg text-slate-200">Payment</div>
                <div className="text-sm font-mono text-slate-400 mt-1">{tx.externalPaymentId}</div>
                <div className={`${tx.status === 'CAPTURED' ? 'text-emerald-400' : 'text-rose-400'} font-semibold mt-1 flex flex-col items-center`}>
                  {formatCurrency(tx.amount)}
                  <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded mt-1 text-slate-300">{tx.status}</span>
                </div>
              </div>
            </div>

            <ArrowRight className="hidden md:block w-8 h-8 text-slate-700" />

            {/* NODE 3: FEES/TAXES */}
            <div className="flex flex-col items-center w-48 relative">
              <div className={`w-24 h-24 rounded-full bg-slate-800 border-4 border-slate-700 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10`}>
                <ArrowRightLeft className="w-10 h-10 text-slate-400" />
              </div>
              <div className="mt-4 text-center">
                <div className="font-bold text-lg text-slate-200">Fees & Taxes</div>
                {tx.fees?.length > 0 ? (
                  <div className="text-rose-400 font-semibold mt-1">
                    -{formatCurrency(tx.fees.reduce((s,f) => s + parseFloat(f.amount.toString()), 0))} (Fee)
                    <br/>
                    -{formatCurrency(tx.fees.reduce((s,f) => s + parseFloat(f.tax.toString()), 0))} (Tax)
                  </div>
                ) : (
                  <div className="text-slate-500 font-medium mt-1 text-sm">No Fees Deducted</div>
                )}
              </div>
            </div>

            <ArrowRight className="hidden md:block w-8 h-8 text-slate-700" />

            {/* NODE 4: SETTLEMENT */}
            <div className="flex flex-col items-center w-48 relative">
              <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 ${
                tx.settlements?.length > 0 ? 'bg-blue-900/40 border-blue-500 shadow-blue-500/20' : 'bg-rose-900/40 border-rose-500 shadow-rose-500/20'
              }`}>
                <Clock className={`w-10 h-10 ${tx.settlements?.length > 0 ? 'text-blue-400' : 'text-rose-400'}`} />
              </div>
              <div className="mt-4 text-center">
                <div className="font-bold text-lg text-slate-200">Settlement</div>
                {tx.settlements?.length > 0 ? (
                  <>
                    <div className="text-sm font-mono text-slate-400 mt-1 truncate w-full" title={tx.settlements[0].externalSettlementId}>{tx.settlements[0].externalSettlementId}</div>
                    <div className="text-emerald-400 font-semibold mt-1">{formatCurrency(tx.settlements[0].amount)}</div>
                    {tx.settlements.length > 1 && (
                      <div className="text-rose-400 text-xs font-bold mt-1 bg-rose-900/50 px-2 py-0.5 rounded">DUPLICATE DETECTED</div>
                    )}
                  </>
                ) : (
                  <div className="text-rose-400 font-bold mt-1 text-sm bg-rose-900/30 px-3 py-1 rounded">MISSING</div>
                )}
              </div>
            </div>

            <ArrowRight className="hidden md:block w-8 h-8 text-slate-700" />

            {/* NODE 5: BANK CLEARING */}
            <div className="flex flex-col items-center w-48 relative">
              <div className={`w-24 h-24 rounded-full border-4 flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] z-10 ${
                tx.settlements?.some(s => s.bankTransactions?.length > 0) ? 'bg-emerald-900/40 border-emerald-500 shadow-emerald-500/20' : 'bg-rose-900/40 border-rose-500 shadow-rose-500/20'
              }`}>
                <Building2 className={`w-10 h-10 ${tx.settlements?.some(s => s.bankTransactions?.length > 0) ? 'text-emerald-400' : 'text-rose-400'}`} />
              </div>
              <div className="mt-4 text-center">
                <div className="font-bold text-lg text-slate-200">Bank</div>
                {tx.settlements?.map(s => s.bankTransactions?.map(bt => (
                  <div key={bt.id} className="mt-1">
                    <div className="text-sm font-mono text-slate-400">{bt.reference}</div>
                    <div className="text-emerald-400 font-semibold">{formatCurrency(bt.amount)}</div>
                  </div>
                )))}
                {tx.settlements?.every(s => !s.bankTransactions || s.bankTransactions.length === 0) && (
                  <div className="text-rose-400 font-bold mt-1 text-sm bg-rose-900/30 px-3 py-1 rounded">PENDING/MISSING</div>
                )}
              </div>
            </div>

          </div>

          {/* Exceptions Overlay */}
          {tx.exceptions?.length > 0 && (
            <div className="mt-12 bg-rose-950/30 border border-rose-500/30 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-rose-500"></div>
              <h3 className="text-xl font-bold text-rose-400 mb-4 flex items-center">
                <AlertTriangle className="w-6 h-6 mr-2" /> Detected Anomalies
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {tx.exceptions.map(ex => (
                  <div key={ex.id} className="bg-slate-900/50 p-4 rounded-lg border border-rose-500/20">
                    <div className="font-bold text-rose-300">{ex.type.replace(/_/g, ' ')}</div>
                    <div className="text-slate-400 text-sm mt-1">{ex.description}</div>
                    <div className="text-rose-400 font-mono mt-2">{formatCurrency(ex.financialImpact)}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {tx.reconciliations?.[0]?.status === 'MATCHED' && (
            <div className="mt-12 bg-emerald-950/30 border border-emerald-500/30 rounded-xl p-6 text-center">
              <h3 className="text-2xl font-bold text-emerald-400 flex items-center justify-center">
                <Activity className="w-6 h-6 mr-2" /> Lifecycle Perfectly Reconciled
              </h3>
              <p className="text-slate-400 mt-2">All financial nodes correspond flawlessly.</p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
