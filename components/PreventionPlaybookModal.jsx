'use client';

import { 
  ShieldCheck, 
  X, 
  Settings, 
  ArrowRight, 
  FileCode, 
  Sliders, 
  AlertCircle,
  Copy, 
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const PLAYBOOKS = {
  FEE_MISMATCH: {
    title: 'Gateway Fee Discrepancy Remediation',
    subtitle: 'Procedure to calibrate MDR schedules and eliminate gateway fee variance.',
    rootCause: 'Gateway processing engines applied standard retail fee schedules instead of negotiated enterprise rate tiers, resulting in variance during automated fee reconciliation.',
    steps: [
      {
        title: 'Synchronize Contract Pricing Matrix',
        description: 'Update the contracted MDR schedules in Integrations so the reconciliation engine enforces agreed percentage and flat fee caps.',
        actionLabel: 'Configure Pricing Matrix',
        actionHref: '/integrations',
      },
      {
        title: 'Submit Tier Adjustment to Gateway',
        description: 'Provide your payment aggregator account representative with the disputed payment IDs to lock the correct account-level pricing tier.',
        actionLabel: 'View Dispute Notice',
      },
      {
        title: 'Tag Transaction Class in Checkout Request',
        description: 'Pass contract tier metadata in checkout order initialization to ensure correct interchange pricing is applied by the gateway engine.',
        snippet: `// Example: Attach contract tier to order payload
const order = await razorpay.orders.create({
  amount: 29900,
  currency: "INR",
  receipt: "rcpt_001",
  notes: {
    pricing_tier: "ENTERPRISE_1_80"
  }
});`
      }
    ],
    note: 'Automated variance monitoring alerts the finance team when fee deductions diverge from the rate card by more than 0.05%.'
  },
  MISSING_SETTLEMENT: {
    title: 'Settlement Delivery & Clearing Resolution',
    subtitle: 'Standard procedure for resolving delayed or unposted gateway settlement batches.',
    rootCause: 'Gateway payout batch was not cleared within the standard T+1 window due to banking cutoff schedules, settlement maintenance, or unacknowledged webhook events.',
    steps: [
      {
        title: 'Verify Gateway Webhook Subscription',
        description: 'Confirm that the settlement.processed webhook event is active and delivering delivery confirmations to the ingestion endpoint.',
        actionLabel: 'Webhook Settings',
        actionHref: '/integrations',
      },
      {
        title: 'Review Banking Holiday Clearing Window',
        description: 'Transactions captured after 18:00 IST on Friday or on banking holidays clear on the subsequent banking business day.',
      },
      {
        title: 'Trigger On-Demand Settlement Synchronization',
        description: 'Run the batch synchronization job to query the aggregator settlement report API directly.',
        actionLabel: 'Run Sync',
        actionHref: '/dashboard',
      }
    ],
    note: 'For high-volume accounts, contact your payment aggregator to configure T+0 same-day settlement windows.'
  },
  AMOUNT_MISMATCH: {
    title: 'Order Amount & Captured Value Verification',
    subtitle: 'Procedure for reconciling discrepancies between cart billing and payment captures.',
    rootCause: 'A discrepancy occurred between the merchant cart order total and the value captured by the payment gateway, typically caused by client-side rounding or dynamic cart changes.',
    steps: [
      {
        title: 'Enforce Server-Side Amount Signing',
        description: 'Ensure payable amounts are computed exclusively on the server and cryptographically signed prior to checkout invocation.',
      },
      {
        title: 'Standardize Integer Currency Representation',
        description: 'Store and calculate all transaction values in fractional units (paise) to prevent floating-point calculation drift.',
      },
      {
        title: 'Verify Cryptographic Payment Signatures',
        description: 'Validate the payment signature on webhook callbacks prior to updating order fulfillment state in the core database.',
      }
    ],
    note: 'Itemized breakdown records (subtotal, tax, discounts) should be persisted in order metadata for audit defense.'
  },
  DEFAULT: {
    title: 'Reconciliation Exception Standard Operating Procedure',
    subtitle: 'Guidelines for resolving ledger discrepancies and maintaining zero-variance financial state.',
    rootCause: 'Variance identified across the 5-point reconciliation lifecycle (Order, Payment, Charges, Settlement, and Nodal Bank records).',
    steps: [
      {
        title: 'Execute Deterministic Dual-Sync Re-run',
        description: 'Trigger a re-reconciliation run across the transaction dataset to confirm state across all intermediary ledgers.',
        actionLabel: 'Run Reconciliation',
        actionHref: '/dashboard',
      },
      {
        title: 'Audit Pricing Matrix & SLA Schedules',
        description: 'Verify contractual MDR rate rules in the integrations portal against effective gateway deductions.',
        actionLabel: 'Review Rate Matrix',
        actionHref: '/integrations',
      },
      {
        title: 'Dispatch Formal Dispute Documentation',
        description: 'Generate an audit-sealed dispute packet for submission to the payment aggregator settlement operations desk.',
        actionLabel: 'Exception Desk',
        actionHref: '/exceptions',
      }
    ],
    note: 'Daily automated reconciliation cycles run at end-of-day to identify and isolate discrepancies.'
  }
};

export function PreventionPlaybookModal({ isOpen, onClose, exceptionType }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const playbook = PLAYBOOKS[exceptionType] || PLAYBOOKS.DEFAULT;

  const handleCopySnippet = (snippet) => {
    navigator.clipboard.writeText(snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-fade-in">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-xl w-full max-w-2xl max-h-[88vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--border)] flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-[var(--muted-foreground)]">
                Standard Operating Procedure
              </span>
              {exceptionType && (
                <span className="text-xs text-[var(--muted-foreground)] font-mono">
                  ({exceptionType})
                </span>
              )}
            </div>
            <h3 className="text-base font-semibold text-[var(--foreground)] mt-0.5">{playbook.title}</h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{playbook.subtitle}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
          
          {/* Root Cause Card */}
          <div className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--muted)]/40 text-xs space-y-1">
            <span className="font-semibold text-[var(--foreground)] block">Root Cause Summary</span>
            <p className="text-[var(--muted-foreground)] leading-relaxed">
              {playbook.rootCause}
            </p>
          </div>

          {/* Remediation Steps */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-[var(--foreground)] uppercase tracking-wider block">
              Remediation Steps
            </span>

            <div className="space-y-2.5">
              {playbook.steps.map((step, idx) => (
                <div 
                  key={idx} 
                  className="p-3.5 rounded-lg border border-[var(--border)] bg-[var(--surface)] space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] font-mono text-xs font-semibold flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <div>
                        <h5 className="font-medium text-xs text-[var(--foreground)]">{step.title}</h5>
                        <p className="text-xs text-[var(--muted-foreground)] mt-0.5 leading-relaxed">{step.description}</p>
                      </div>
                    </div>

                    {step.actionHref && (
                      <Link
                        href={step.actionHref}
                        onClick={onClose}
                        className="hidden sm:inline-flex items-center gap-1 text-xs font-medium text-[#528FF0] hover:underline whitespace-nowrap pt-0.5"
                      >
                        {step.actionLabel} <ArrowRight className="w-3 h-3" />
                      </Link>
                    )}
                  </div>

                  {step.snippet && (
                    <div className="relative mt-2">
                      <pre className="p-3 bg-[var(--muted)] border border-[var(--border)] text-[var(--foreground)] rounded-md text-xs font-mono overflow-x-auto">
                        {step.snippet}
                      </pre>
                      <button
                        onClick={() => handleCopySnippet(step.snippet)}
                        className="absolute top-2 right-2 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] rounded text-[11px] flex items-center gap-1 transition-colors shadow-sm"
                      >
                        {copied ? <><Check className="w-3 h-3 text-emerald-500" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Operational Note */}
          {playbook.note && (
            <div className="p-3 rounded-lg border border-[var(--border)] text-xs text-[var(--muted-foreground)] bg-[var(--muted)]/20">
              <span className="font-semibold text-[var(--foreground)] mr-1">Operational Guidance:</span>
              {playbook.note}
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--border)] bg-[var(--muted)]/30 flex items-center justify-between">
          <Link
            href="/integrations"
            onClick={onClose}
            className="text-xs font-medium text-[#528FF0] hover:underline flex items-center gap-1"
          >
            <Settings className="w-3.5 h-3.5" /> Open Pricing Matrix Settings
          </Link>
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-[#528FF0] hover:bg-[#4080E0] text-white transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
