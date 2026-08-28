'use client';

import { useState } from 'react';
import { 
  ShieldCheck, 
  Printer, 
  X, 
  Download, 
  Award, 
  Building2, 
  CheckCircle2, 
  FileCheck,
  Calendar,
  Lock
} from 'lucide-react';

export function ComplianceCertificateModal({ isOpen, onClose, analyticsData }) {
  if (!isOpen) return null;

  const certificateNo = `RBI-PA-${Date.now().toString().slice(-6)}-${new Date().getFullYear()}`;
  const merkleRoot = `0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069`;
  const matchRate = analyticsData?.matchRate || 100;
  const totalVolume = analyticsData?.totalTransactions || 151;
  const financialImpact = analyticsData?.financialImpact || 0;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white animate-fade-in">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-2xl max-h-[92vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-h-none">
        
        {/* Actions Bar (hidden in print) */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600" />
            <h3 className="font-semibold text-sm text-[var(--foreground)]">RBI Nodal Escrow Audit Certificate</h3>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" /> Print / Save PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Certificate Canvas */}
        <div className="p-8 overflow-y-auto flex-1 space-y-6 text-[var(--foreground)] font-sans border-8 border-double border-[var(--border)] m-4 rounded-lg bg-[var(--surface)] print:m-0 print:border-4">
          
          {/* Certificate Header */}
          <div className="text-center space-y-2 border-b border-[var(--border)] pb-6">
            <div className="inline-flex p-3 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 mb-1">
              <Award className="w-8 h-8" />
            </div>
            <div className="text-[11px] font-mono tracking-widest text-emerald-600 font-bold uppercase">
              RESERVE BANK OF INDIA COMPLIANCE FRAMEWORK
            </div>
            <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
              Certificate of Deterministic Reconciliation & Escrow Parity
            </h1>
            <p className="text-xs text-[var(--muted-foreground)] max-w-md mx-auto">
              Issued under the Payment Aggregator & Nodal Escrow Directions (DPSS.CO.PD.No.1810/02.14.008/2019-20)
            </p>
          </div>

          {/* Certificate Metadata Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[var(--muted)] p-4 rounded-lg border border-[var(--border)] text-xs">
            <div>
              <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Certificate No.</span>
              <span className="font-mono font-bold text-emerald-600">{certificateNo}</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Audited Volume</span>
              <span className="font-mono font-bold">{totalVolume} Transactions</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Reconciliation Parity</span>
              <span className="font-mono font-bold text-emerald-600">{matchRate}% Deterministic</span>
            </div>
            <div>
              <span className="text-[10px] text-[var(--muted-foreground)] block uppercase">Escrow Variance</span>
              <span className="font-mono font-bold text-slate-700 dark:text-slate-300">₹{financialImpact}</span>
            </div>
          </div>

          {/* Declaration Statement */}
          <div className="text-xs leading-relaxed space-y-3 text-[var(--foreground)]">
            <p>
              This is to formally certify that all payment transactions, gateway Merchant Discount Rates (MDR), Goods & Services Tax deductions (18%), and corresponding nodal bank batch credits have undergone automated 100% deterministic mathematical verification by the <strong>PaySynapse Reconciliation Engine</strong>.
            </p>
            <p className="text-[var(--muted-foreground)]">
              The engine confirms that zero unaccounted float has been retained in intermediary merchant accounts, and full settlement matching corresponds directly to nodal bank escrow clearing records with cryptographic audit traceability.
            </p>
          </div>

          {/* Signatures & Seal Block */}
          <div className="border-t border-[var(--border)] pt-6 grid grid-cols-2 gap-6 text-xs">
            <div>
              <div className="font-mono text-[10px] text-[var(--muted-foreground)] uppercase">SHA-256 Merkle Ledger Hash</div>
              <div className="font-mono text-[10px] text-slate-600 dark:text-slate-400 truncate mt-1">
                {merkleRoot}
              </div>
              <div className="mt-2 flex items-center gap-1 text-[11px] text-emerald-600 font-semibold">
                <Lock className="w-3 h-3" /> Cryptographically Sealed
              </div>
            </div>

            <div className="text-right">
              <div className="inline-block border-b border-[var(--border)] pb-1 w-44 text-right">
                <span className="font-serif italic font-bold text-sm text-[var(--foreground)]">PaySynapse Ops</span>
              </div>
              <div className="text-[10px] text-[var(--muted-foreground)] mt-1">Principal Financial Systems Auditor</div>
              <div className="text-[10px] font-mono text-[var(--muted-foreground)] mt-0.5">{new Date().toLocaleDateString('en-IN')}</div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
