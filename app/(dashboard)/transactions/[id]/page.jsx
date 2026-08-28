'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, Building2, Receipt, ArrowRightLeft, CreditCard, Loader2 } from 'lucide-react';
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
  const hasExceptions = tx.exceptions?.length > 0;

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
            <h2 className="text-lg font-semibold">Payment: {tx.externalPaymentId}</h2>
            <span className={`px-2 py-0.5 rounded-md text-xs font-semibold ${
              tx.status === 'CAPTURED' ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400' : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            }`}>
              {tx.status}
            </span>
          </div>
          <p className="text-[var(--muted-foreground)] mt-0.5 text-sm">Created at {formatDate(tx.createdAt)}</p>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <div className="text-sm font-medium text-[var(--muted-foreground)] mb-1">Gross Amount</div>
          <div className="text-xl font-bold">{formatCurrency(tx.amount)}</div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">via {tx.method}</div>
        </div>
        
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <div className="text-sm font-medium text-[var(--muted-foreground)] mb-1">Expected Settlement</div>
          <div className="text-xl font-bold text-[#528FF0]">
            {recon ? formatCurrency(recon.expectedAmount) : '-'}
          </div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">After fees & taxes</div>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <div className="text-sm font-medium text-[var(--muted-foreground)] mb-1">Actual Settlement</div>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
            {recon ? formatCurrency(recon.actualAmount) : '-'}
          </div>
          <div className="text-xs text-[var(--muted-foreground)] mt-1">Received in Bank</div>
        </div>

        <div className={`rounded-lg border p-4 shadow-sm ${
          isMatched 
            ? 'bg-emerald-50/50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-800/30' 
            : 'bg-red-50/50 border-red-200 dark:bg-red-900/10 dark:border-red-800/30'
        }`}>
          <div className="text-sm font-medium text-[var(--muted-foreground)] mb-1">Reconciliation State</div>
          <div className={`text-lg font-bold flex items-center ${isMatched ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
            {isMatched ? <CheckCircle2 className="w-4 h-4 mr-1.5" /> : <AlertCircle className="w-4 h-4 mr-1.5" />}
            {recon ? recon.status : 'PENDING'}
          </div>
          <div className="text-xs mt-1 text-[var(--muted-foreground)]">
            Diff: {recon ? formatCurrency(recon.difference) : '-'}
          </div>
        </div>
      </div>

      {hasExceptions && (
        <div className="rounded-lg border border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10 p-5 shadow-sm">
          <h3 className="text-base font-semibold text-red-700 dark:text-red-400 mb-3 flex items-center">
            <AlertCircle className="w-4 h-4 mr-2" /> 
            Detected Exceptions
          </h3>
          <div className="space-y-2">
            {tx.exceptions.map(ex => (
              <div key={ex.id} className="flex justify-between items-center bg-[var(--surface)] p-3.5 rounded-lg border border-red-100 dark:border-red-900/30 shadow-sm">
                <div>
                  <div className="font-semibold text-sm">{ex.type.replace(/_/g, ' ')}</div>
                  <div className="text-xs text-[var(--muted-foreground)] mt-0.5">{ex.description}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-red-600 dark:text-red-400">{formatCurrency(ex.financialImpact)}</div>
                  <div className="text-xs text-[var(--muted-foreground)] font-medium mt-0.5">{ex.status}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Lineage Timeline */}
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
    </div>
  );
}
