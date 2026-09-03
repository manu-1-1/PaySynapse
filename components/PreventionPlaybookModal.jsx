'use client';

import { 
  ShieldCheck, 
  X, 
  Settings, 
  ArrowRight, 
  CheckCircle2, 
  FileCode, 
  Sliders, 
  AlertTriangle,
  Lightbulb,
  ExternalLink,
  Copy,
  Check
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';

const PLAYBOOKS = {
  FEE_MISMATCH: {
    title: 'How to Prevent Gateway Fee Mismatches & Overcharges',
    subtitle: 'Ensure gateway deductions match your negotiated enterprise MDR contracts.',
    rootCause: 'Payment gateways frequently default to standard retail rate tiers (e.g., 2.00% + GST) when account parameters change, custom volume discounts expire, or payment sub-types (commercial cards, international cards) lack negotiated contract rules in your gateway portal.',
    steps: [
      {
        title: '1. Synchronize Contract Pricing Rules in PaySynapse',
        description: 'Verify and update your contractual MDR fee rules in the Integrations portal so the reconciliation engine uses your exact contract percentages and fixed caps per payment method.',
        actionLabel: 'Configure MDR Matrix',
        actionHref: '/integrations',
        icon: Sliders
      },
      {
        title: '2. Request Gateway Backend Tier Calibration',
        description: 'Provide your Razorpay/aggregator account manager with the list of overcharged payment IDs and request an account-level rate lock matching your signed SLA agreement.',
        actionLabel: 'View Dispute Dossier',
        icon: ShieldCheck
      },
      {
        title: '3. Implement Dynamic Surcharging / Method Splitting',
        description: 'In your checkout application, accurately tag corporate cards vs consumer cards before payment submission to ensure applicable interchange rates are predicted in advance.',
        actionLabel: 'Copy Checkout Code Snippet',
        icon: FileCode,
        snippet: `// Tag transaction intent at checkout creation
const order = await razorpay.orders.create({
  amount: 29900,
  currency: "INR",
  receipt: "receipt_001",
  notes: {
    merchant_tier: "ENTERPRISE_1_80",
    fee_cap: "NO_SURCHARGE"
  }
});`
      }
    ],
    proTip: 'Configure automated fee variance alerts in PaySynapse so your finance team is notified immediately when cumulative gateway deductions drift by more than 0.1%.'
  },
  MISSING_SETTLEMENT: {
    title: 'How to Prevent Missing or Delayed Gateway Settlements',
    subtitle: 'Minimize in-flight float and prevent delayed nodal escrow credits.',
    rootCause: 'Settlements become delayed due to bank holiday cut-offs, RTGS/NEFT settlement maintenance windows, or missing automated webhook events (such as settlement.processed).',
    steps: [
      {
        title: '1. Enable Real-Time Settlement Webhooks in Gateway',
        description: 'In your Razorpay Dashboard (Settings → Webhooks), ensure the "settlement.processed" event is checked so nodal payout batches update the ledger immediately.',
        actionLabel: 'Webhook Setup Guide',
        actionHref: '/integrations',
        icon: Sliders
      },
      {
        title: '2. Account for Banking Calendar & Holiday Windows',
        description: 'Align your treasury expectation rules: Transactions captured on Friday evening or 2nd/4th Saturdays are cleared on the next working banking day (T+1 / T+2).',
        actionLabel: 'Review SLA Rules',
        icon: CheckCircle2
      },
      {
        title: '3. Enable Automated Nodal Payout Polling',
        description: 'Set up an automated periodic reconciliation job to query gateway settlement reports daily at 06:00 UTC.',
        actionLabel: 'Trigger Sync Engine',
        actionHref: '/dashboard',
        icon: ArrowRight
      }
    ],
    proTip: 'For high-velocity merchants, negotiate "Same-Day Settlements (T+0)" or "Instant Payout Escrow" with your payment aggregator to eliminate weekend float.'
  },
  AMOUNT_MISMATCH: {
    title: 'How to Prevent Transaction Amount & Currency Deltas',
    subtitle: 'Enforce strict server-side arithmetic parity between cart orders and gateway captures.',
    rootCause: 'Occurs when client-side discount coupons, dynamic shipping calculations, or rounding discrepancies create a divergence between what was billed in the cart and what was captured by the gateway.',
    steps: [
      {
        title: '1. Lock Order Amounts Exclusively on Backend',
        description: 'Never compute final payable amounts on the browser. Always generate a verified cryptographic order payload on your server before initializing the checkout popup.',
        icon: ShieldCheck
      },
      {
        title: '2. Enforce Strict Integer (Paise / Cents) Calculations',
        description: 'Convert all currency values to whole integer units (e.g. ₹299.00 → 29900 paise) to avoid floating point precision drift in JavaScript/PostgreSQL.',
        icon: FileCode
      },
      {
        title: '3. Verify Webhook Signatures on Receipt',
        description: 'Validate Razorpay signature hash on every webhook event before altering the order fulfillment state in your database.',
        icon: Sliders
      }
    ],
    proTip: 'Always store tax, shipping, and discount line-items in the order metadata to simplify future dispute defense.'
  },
  DEFAULT: {
    title: 'General Guidelines to Prevent Reconciliation Mismatches',
    subtitle: 'Best practices for automated, zero-discrepancy payment operations.',
    rootCause: 'Operational drift occurs when payment gateway settings, nodal bank clearing schedules, and internal billing engines operate out of sync.',
    steps: [
      {
        title: '1. Daily Automated Dual-Reconciliation',
        description: 'Run automated end-of-day 5-point reconciliation runs combining Order, Payment, Gateway Fee, Settlement, and Bank Statement records.',
        actionLabel: 'Run Reconciliation',
        actionHref: '/dashboard',
        icon: CheckCircle2
      },
      {
        title: '2. Continuous SLA & Fee Rate Monitoring',
        description: 'Audit contractual MDR rates quarterly against actual gateway deductions to stop silent revenue leakage.',
        actionLabel: 'Manage Fee Rules',
        actionHref: '/integrations',
        icon: Sliders
      },
      {
        title: '3. Instant Autonomous Dispute Dispatch',
        description: 'When anomalies are flagged, generate formal RBI-compliant dispute notices within 24 hours to ensure immediate gateway recovery.',
        actionLabel: 'Explore Exceptions',
        actionHref: '/exceptions',
        icon: ShieldCheck
      }
    ],
    proTip: 'Utilize PaySynapse AI Copilot to run weekly autonomous financial health audits across your entire transaction volume.'
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-[var(--border)] bg-gradient-to-r from-emerald-500/10 via-blue-500/5 to-transparent flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300">
                  Prevention Playbook
                </span>
                {exceptionType && (
                  <span className="text-xs text-[var(--muted-foreground)] font-mono">
                    [{exceptionType.replace(/_/g, ' ')}]
                  </span>
                )}
              </div>
              <h3 className="text-base font-bold text-[var(--foreground)] mt-1">{playbook.title}</h3>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">{playbook.subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-[var(--surface-hover)] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5 text-sm">
          
          {/* Root Cause Card */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
              <AlertTriangle className="w-4 h-4" /> Why does this mismatch happen?
            </div>
            <p className="text-slate-700 dark:text-slate-300 leading-relaxed">
              {playbook.rootCause}
            </p>
          </div>

          {/* Actionable Prevention Steps */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--muted-foreground)]">
              Recommended Remediation & Prevention Steps
            </h4>

            {playbook.steps.map((step, idx) => {
              const StepIcon = step.icon || CheckCircle2;
              return (
                <div 
                  key={idx} 
                  className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]/50 hover:bg-[var(--muted)] transition-colors space-y-2.5"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div className="p-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[#528FF0] mt-0.5">
                        <StepIcon className="w-4 h-4" />
                      </div>
                      <div>
                        <h5 className="font-semibold text-sm text-[var(--foreground)]">{step.title}</h5>
                        <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">{step.description}</p>
                      </div>
                    </div>

                    {step.actionHref && (
                      <Link
                        href={step.actionHref}
                        onClick={onClose}
                        className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-[#528FF0] hover:underline whitespace-nowrap pt-1"
                      >
                        {step.actionLabel} <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    )}
                  </div>

                  {step.snippet && (
                    <div className="relative mt-2">
                      <pre className="p-3 bg-slate-900 text-slate-100 rounded-lg text-xs font-mono overflow-x-auto">
                        {step.snippet}
                      </pre>
                      <button
                        onClick={() => handleCopySnippet(step.snippet)}
                        className="absolute top-2 right-2 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-[11px] flex items-center gap-1 transition-colors"
                      >
                        {copied ? <><Check className="w-3 h-3 text-emerald-400" /> Copied</> : <><Copy className="w-3 h-3" /> Copy</>}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Pro Tip Box */}
          {playbook.proTip && (
            <div className="p-4 rounded-xl bg-blue-500/10 border border-blue-500/20 text-xs flex items-start gap-2.5 text-blue-900 dark:text-blue-200">
              <Lightbulb className="w-4 h-4 text-[#528FF0] mt-0.5 shrink-0" />
              <div>
                <span className="font-bold text-[#528FF0] mr-1">FinOps Pro Tip:</span>
                {playbook.proTip}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
          <Link
            href="/integrations"
            onClick={onClose}
            className="text-xs font-semibold text-[#528FF0] hover:underline flex items-center gap-1"
          >
            <Settings className="w-3.5 h-3.5" /> Open Gateway & MDR Settings
          </Link>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#528FF0] hover:bg-[#4080E0] text-white transition-colors"
          >
            Got It, Close Guide
          </button>
        </div>

      </div>
    </div>
  );
}
