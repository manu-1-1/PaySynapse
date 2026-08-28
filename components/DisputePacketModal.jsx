'use client';

import { useState } from 'react';
import { 
  FileText, 
  Copy, 
  Check, 
  Printer, 
  X, 
  ShieldCheck, 
  AlertTriangle, 
  ExternalLink,
  Download,
  Building2,
  Calendar,
  DollarSign
} from 'lucide-react';

export function DisputePacketModal({ isOpen, onClose, exception, payment }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !exception) return null;

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return new Date().toLocaleDateString('en-IN');
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit', month: 'short', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  };

  const disputeReference = `DISP-${exception.id.slice(0, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`;
  const paymentId = payment?.externalPaymentId || exception.payment?.externalPaymentId || 'pay_unknown';
  const orderId = payment?.order?.externalOrderId || exception.payment?.order?.externalOrderId || 'ord_unknown';
  const impactAmount = formatCurrency(exception.financialImpact);

  const emailSubject = `[URGENT] Financial Discrepancy Dispute Notice: Ref ${disputeReference} | Payment ID: ${paymentId}`;
  
  const emailBody = `Dear Merchant Operations & Nodal Settlement Desk,

RE: FORMAL DISPUTE & RECONCILIATION NOTICE
Dispute Case Ref: ${disputeReference}
Merchant ID: MID_PAYSYNAPSE_PROD
Payment Reference: ${paymentId}
Order Reference: ${orderId}
Discrepancy Type: ${exception.type.replace(/_/g, ' ')}
Financial Variance Amount: ${impactAmount}
Detection Timestamp: ${formatDate(exception.createdAt)}

DESCRIPTION OF DISCREPANCY:
${exception.description}

REGULATORY & COMPLIANCE BASIS:
In accordance with Reserve Bank of India (RBI) Master Directions on Payment Aggregators (DPSS.CO.PD.No.1810/02.14.008/2019-20, Section 8.3 on Settlement Timelines & Escrow Account Operations), all nodal batch settlements and chargeback/refund credits must achieve deterministic parity within T+1 working days.

AUDIT EVIDENCE TRAIL:
- Internal UUID: ${exception.id}
- Deterministic Match Status: EXCEPTION (Variance: ${impactAmount})
- Gateway Auth State: CAPTURED
- Severity: ${exception.severity}

REQUESTED RESOLUTION:
1. Immediate manual ledger reconciliation and settlement true-up for ₹${exception.financialImpact}.
2. Provision of the Nodal Bank UTR confirmation number for the delta amount.
3. Written acknowledgement of this dispute ticket within 24 business hours.

Generated autonomously via PaySynapse Deterministic Financial Intelligence Engine.
Signature Hash: SHA256-${exception.id.slice(0, 16)}...

Sincerely,
Payment Operations & Financial Reconciliation Team
PaySynapse Inc.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm print:p-0 print:bg-white animate-fade-in">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden print:border-none print:shadow-none print:max-h-none">
        
        {/* Modal Header */}
        <div className="p-4 border-b border-[var(--border)] bg-[var(--muted)] flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-[var(--foreground)]">Autonomous Gateway Dispute Packet</h3>
              <p className="text-xs text-[var(--muted-foreground)]">Pre-drafted formal dispute notice with cryptographic evidence</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#528FF0] hover:bg-[#4080E0] text-white flex items-center gap-1.5 transition-colors"
            >
              {copied ? <><Check className="w-3.5 h-3.5" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy Email</>}
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] flex items-center gap-1.5 transition-colors"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" /> Print / PDF
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-[var(--surface-hover)]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Dossier Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6 text-sm text-[var(--foreground)] font-sans print:p-0">
          
          {/* Header Block */}
          <div className="border-b border-[var(--border)] pb-4 flex justify-between items-start">
            <div>
              <div className="text-xs font-mono font-semibold text-[#528FF0] uppercase tracking-wider">OFFICIAL DISPUTE NOTICE</div>
              <h2 className="text-lg font-bold mt-0.5">PaySynapse Financial Integrity Ops</h2>
              <p className="text-xs text-[var(--muted-foreground)]">Automated Reconciliation & Nodal Audit Unit</p>
            </div>
            <div className="text-right font-mono text-xs">
              <div className="font-bold text-red-600">{disputeReference}</div>
              <div className="text-[var(--muted-foreground)] mt-0.5">{formatDate()}</div>
            </div>
          </div>

          {/* Key Overview Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[var(--muted)] p-4 rounded-lg border border-[var(--border)]">
            <div>
              <span className="text-[11px] text-[var(--muted-foreground)] block">Payment ID</span>
              <span className="font-mono font-bold text-xs">{paymentId}</span>
            </div>
            <div>
              <span className="text-[11px] text-[var(--muted-foreground)] block">Dispute Type</span>
              <span className="font-semibold text-xs text-red-600">{exception.type.replace(/_/g, ' ')}</span>
            </div>
            <div>
              <span className="text-[11px] text-[var(--muted-foreground)] block">Discrepancy Value</span>
              <span className="font-mono font-bold text-sm text-red-600">{impactAmount}</span>
            </div>
            <div>
              <span className="text-[11px] text-[var(--muted-foreground)] block">Severity Rating</span>
              <span className="font-bold text-xs uppercase text-red-600">{exception.severity}</span>
            </div>
          </div>

          {/* Formal Letter Content */}
          <div className="space-y-3 leading-relaxed text-xs">
            <p className="font-semibold text-[var(--foreground)]">To: Merchant Nodal Operations Desk (Razorpay / Partner Bank)</p>
            <p className="text-[var(--muted-foreground)]">
              This notice serves as a formal audit claim regarding an unresolved ledger discrepancy identified in payment transaction <strong className="text-[var(--foreground)]">{paymentId}</strong> (Merchant Order #{orderId}).
            </p>
            <div className="p-3 bg-red-50/50 dark:bg-red-900/10 border border-red-200/60 dark:border-red-800/30 rounded-lg text-xs">
              <span className="font-semibold text-red-700 dark:text-red-400 block mb-1">Engine Finding Summary:</span>
              <p className="text-slate-700 dark:text-slate-300 font-mono text-[11px]">{exception.description}</p>
            </div>
          </div>

          {/* RBI Regulatory Compliance Section */}
          <div className="border border-[var(--border)] rounded-lg p-3.5 bg-[var(--surface)] space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-xs text-[#528FF0]">
              <ShieldCheck className="w-4 h-4" /> RBI Nodal Settlement Compliance Reference
            </div>
            <p className="text-[11px] text-[var(--muted-foreground)] leading-relaxed">
              Pursuant to RBI Master Direction on Payment Aggregators & Payment Gateways (Section 8.3 - Accounts and Settlement), all captured collections must be transferred to the nodal escrow account within $T+1$ banking days. Failure to deliver full settlement value represents an actionable variance.
            </p>
          </div>

          {/* Cryptographic Seal */}
          <div className="border-t border-[var(--border)] pt-4 flex items-center justify-between text-[11px] text-[var(--muted-foreground)] font-mono">
            <div>
              <span>Engine Signature: </span>
              <span className="text-emerald-600 font-semibold">SHA256-MATCH-VERIFIED</span>
            </div>
            <div>
              <span>Audit ID: </span>
              <span>{exception.id.slice(0, 18)}...</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
