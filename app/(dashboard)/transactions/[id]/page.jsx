'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, Building2, Receipt, ArrowRightLeft } from 'lucide-react';
import Link from 'next/link';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [tx, setTx] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTx = async () => {
      try {
        const res = await fetch(`/api/transactions/${params.id}`);
        if (!res.ok) throw new Error('Not found');
        const data = await res.json();
        setTx(data.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchTx();
  }, [params.id]);

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

  if (!tx) {
    return <div className="p-8 text-center"><h2 className="text-xl">Transaction not found.</h2><button onClick={() => router.back()} className="mt-4 text-primary">Go Back</button></div>;
  }

  const recon = tx.reconciliations?.[0];
  const isMatched = recon?.status === 'MATCHED';
  const hasExceptions = tx.exceptions?.length > 0;

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="flex items-center space-x-4">
        <button onClick={() => router.back()} className="p-2 border rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 bg-white dark:bg-slate-950 transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center space-x-3">
            <h2 className="text-2xl font-bold tracking-tight">Payment: {tx.externalPaymentId}</h2>
            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
              tx.status === 'CAPTURED' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-800'
            }`}>
              {tx.status}
            </span>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">Created at {formatDate(tx.createdAt)}</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-xl border bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Gross Amount</div>
          <div className="text-2xl font-bold">{formatCurrency(tx.amount)}</div>
          <div className="text-xs text-slate-400 mt-1">via {tx.method}</div>
        </div>
        
        <div className="rounded-xl border bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Expected Settlement</div>
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {recon ? formatCurrency(recon.expectedAmount) : '-'}
          </div>
          <div className="text-xs text-slate-400 mt-1">After fees & taxes</div>
        </div>

        <div className="rounded-xl border bg-white dark:bg-slate-950 p-5 shadow-sm">
          <div className="text-sm font-medium text-slate-500 mb-1">Actual Settlement</div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {recon ? formatCurrency(recon.actualAmount) : '-'}
          </div>
          <div className="text-xs text-slate-400 mt-1">Received in Bank</div>
        </div>

        <div className={`rounded-xl border p-5 shadow-sm ${isMatched ? 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30' : 'bg-rose-50 border-rose-200 dark:bg-rose-950/30'}`}>
          <div className="text-sm font-medium text-slate-500 mb-1">Reconciliation State</div>
          <div className={`text-xl font-bold flex items-center ${isMatched ? 'text-emerald-600' : 'text-rose-600'}`}>
            {isMatched ? <CheckCircle2 className="w-5 h-5 mr-2" /> : <AlertCircle className="w-5 h-5 mr-2" />}
            {recon ? recon.status : 'PENDING'}
          </div>
          <div className="text-xs mt-1 text-slate-500">
            Diff: {recon ? formatCurrency(recon.difference) : '-'}
          </div>
        </div>
      </div>

      {hasExceptions && (
        <div className="rounded-xl border border-rose-200 bg-rose-50/50 dark:bg-rose-950/20 p-5 shadow-sm">
          <h3 className="text-lg font-semibold text-rose-800 dark:text-rose-400 mb-3 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2" /> 
            Detected Exceptions
          </h3>
          <div className="space-y-3">
            {tx.exceptions.map(ex => (
              <div key={ex.id} className="flex justify-between items-center bg-white dark:bg-slate-900 p-3 rounded-lg border border-rose-100 shadow-sm">
                <div>
                  <div className="font-semibold text-sm text-slate-900 dark:text-slate-100">{ex.type.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{ex.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-rose-600">{formatCurrency(ex.financialImpact)}</div>
                  <div className="text-xs text-slate-400 font-medium">{ex.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lineage Timeline */}
      <h3 className="text-xl font-bold tracking-tight mt-8 mb-4">Financial Lineage</h3>
      <div className="rounded-xl border bg-white dark:bg-slate-950 shadow-sm overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-5 divide-y md:divide-y-0 md:divide-x border-b text-sm">
          
          <div className="p-5 flex flex-col space-y-3">
            <div className="flex items-center text-slate-500 font-medium">
              <Receipt className="w-4 h-4 mr-2" /> Order
            </div>
            {tx.order ? (
              <>
                <div className="font-semibold break-all">{tx.order.externalOrderId}</div>
                <div className="text-xs text-slate-500">{formatCurrency(tx.order.amount)}</div>
                <div><span className="bg-slate-100 px-2 py-1 rounded text-xs">{tx.order.status}</span></div>
              </>
            ) : <div className="text-xs text-slate-400 italic">No order linked</div>}
          </div>

          <div className="p-5 flex flex-col space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center text-slate-500 font-medium">
              <CreditCard className="w-4 h-4 mr-2" /> Payment
            </div>
            <div className="font-semibold break-all">{tx.externalPaymentId}</div>
            <div className="text-xs text-slate-500">{formatCurrency(tx.amount)}</div>
            <div><span className="bg-emerald-100 text-emerald-800 px-2 py-1 rounded text-xs">{tx.status}</span></div>
          </div>

          <div className="p-5 flex flex-col space-y-3">
            <div className="flex items-center text-slate-500 font-medium">
              <ArrowRightLeft className="w-4 h-4 mr-2" /> Fees & Taxes
            </div>
            {tx.fees && tx.fees.length > 0 ? tx.fees.map(fee => (
              <div key={fee.id} className="border border-slate-100 rounded p-2 bg-slate-50 dark:bg-slate-900/50">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-500">Fee</span>
                  <span className="font-semibold text-rose-600">-{formatCurrency(fee.amount)}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Tax</span>
                  <span className="font-semibold text-rose-600">-{formatCurrency(fee.tax)}</span>
                </div>
              </div>
            )) : <div className="text-xs text-slate-400 italic">No fees recorded</div>}
          </div>

          <div className="p-5 flex flex-col space-y-3 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center text-slate-500 font-medium">
              <Clock className="w-4 h-4 mr-2" /> Settlement
            </div>
            {tx.settlements && tx.settlements.length > 0 ? tx.settlements.map((s, i) => (
              <div key={s.id} className="border border-slate-100 rounded p-2 bg-white dark:bg-slate-900">
                <div className="text-xs text-slate-500 mb-1 break-all truncate" title={s.externalSettlementId}>{s.externalSettlementId}</div>
                <div className="font-semibold text-emerald-600">{formatCurrency(s.amount)}</div>
                <div className="text-xs text-slate-400 mt-1">{formatDate(s.settledAt)}</div>
              </div>
            )) : <div className="text-xs text-rose-500 font-medium bg-rose-50 p-2 rounded">Missing Settlement</div>}
          </div>

          <div className="p-5 flex flex-col space-y-3">
            <div className="flex items-center text-slate-500 font-medium">
              <Building2 className="w-4 h-4 mr-2" /> Bank
            </div>
            {tx.settlements?.map(s => 
              s.bankTransactions?.map(bt => (
                <div key={bt.id} className="border border-slate-100 rounded p-2 bg-slate-50 dark:bg-slate-900/50">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-500">UTR</span>
                    <span className="font-medium text-slate-700 dark:text-slate-300">{bt.reference}</span>
                  </div>
                  <div className="font-semibold text-emerald-600">{formatCurrency(bt.amount)}</div>
                  <div className="text-xs text-slate-400 mt-1">Cleared: {formatDate(bt.transactionDate)}</div>
                </div>
              ))
            )}
            {tx.settlements?.every(s => !s.bankTransactions || s.bankTransactions.length === 0) && (
              <div className="text-xs text-slate-400 italic">No bank transactions found</div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
