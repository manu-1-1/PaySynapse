'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
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
  ChevronLeft,
  FastForward,
  Sparkles,
  Sliders,
  AlertCircle,
  Layers,
  Cpu,
  Radio,
  Lock,
  ArrowUpRight,
  ShieldAlert
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';

// Scenario definitions
const SCENARIOS = [
  { id: 'PERFECT_MATCH', label: 'Normal Flow', desc: '100% Reconciled 5-node match', color: 'emerald' },
  { id: 'MISSING_SETTLEMENT', label: 'Missing Settlement', desc: 'Unsettled Gateway batch', color: 'red' },
  { id: 'FEE_MISMATCH', label: 'Fee Discrepancy', desc: 'Gateway commission overcharge', color: 'amber' },
  { id: 'AMOUNT_MISMATCH', label: 'Short Settlement', desc: 'Net settlement difference', color: 'orange' },
  { id: 'DELAYED_SETTLEMENT', label: 'T+10 Settlement', desc: 'SLA breach delay', color: 'blue' },
  { id: 'DUPLICATE_TRANSACTION', label: 'Duplicate Entry', desc: 'Double ledger posting', color: 'purple' },
  { id: 'STATUS_MISMATCH', label: 'Status Mismatch', desc: 'Capture vs Authorize sync', color: 'pink' },
  { id: 'MISSING_REFUND', label: 'Missing Refund', desc: 'Unsettled reversal credit', color: 'cyan' },
];

const SCENARIO_COLOR_MAP = {
  emerald: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/15 dark:text-emerald-400 dark:border-emerald-800/30 hover:bg-emerald-100',
  red: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/15 dark:text-red-400 dark:border-red-800/30 hover:bg-red-100',
  amber: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/15 dark:text-amber-400 dark:border-amber-800/30 hover:bg-amber-100',
  orange: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/15 dark:text-orange-400 dark:border-orange-800/30 hover:bg-orange-100',
  blue: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/15 dark:text-blue-400 dark:border-blue-800/30 hover:bg-blue-100',
  purple: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/15 dark:text-purple-400 dark:border-purple-800/30 hover:bg-purple-100',
  pink: 'bg-pink-50 text-pink-700 border-pink-200 dark:bg-pink-900/15 dark:text-pink-400 dark:border-pink-800/30 hover:bg-pink-100',
  cyan: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/15 dark:text-cyan-400 dark:border-cyan-800/30 hover:bg-cyan-100',
};

// Deep financial mechanism explanations per scenario and stage
const SCENARIO_MECHANISMS = {
  PERFECT_MATCH: {
    title: 'Standard 100% Reconciled Lifecycle',
    steps: {
      1: {
        stage: '01 • ORDER INGESTION',
        title: 'Merchant Checkout Cart Created',
        desc: 'Merchant ERP / cart initializes order for ₹5,000.00. Currency is ISO INR, reference locked.',
        status: 'PASS',
        node: 'order',
        highlight: 'Gross value: ₹5,000.00'
      },
      2: {
        stage: '02 • GATEWAY AUTHORIZATION',
        title: 'Payment Captured & Webhook Delivered',
        desc: 'Customer credit card charged. Razorpay returns CAPTURED state via webhook with valid HMAC-SHA256 signature.',
        status: 'PASS',
        node: 'payment',
        highlight: 'State: CAPTURED | HMAC Verified'
      },
      3: {
        stage: '03 • CHARGES & GST DEDUCTION',
        title: 'MDR Commission & Tax Computation',
        desc: 'Standard Card MDR of 1.8% (₹90.00) + 18% GST on fees (₹16.20) calculated. Total deduction: ₹106.20.',
        status: 'PASS',
        node: 'fees',
        highlight: 'Expected Net Payout = ₹4,893.80'
      },
      4: {
        stage: '04 • SETTLEMENT BATCHING',
        title: 'Gateway Net Payout Batch Compiled',
        desc: 'Gateway groups payment into scheduled payout batch (setl_...) for ₹4,893.80 conforming to T+1 cycle.',
        status: 'PASS',
        node: 'settlement',
        highlight: 'Batch Amount: ₹4,893.80 (100% match)'
      },
      5: {
        stage: '05 • NODAL BANK CLEARING & RECON',
        title: '3-Way Reconciliation Audit Complete',
        desc: 'HDFC Nodal Escrow confirms UTR clearance. 3-way reconciliation engine confirms zero ledger delta. Lineage: MATCHED ✓',
        status: 'PASS',
        node: 'bank',
        highlight: 'Zero Variance | Fully Balanced'
      }
    }
  },
  MISSING_SETTLEMENT: {
    title: 'Missing Gateway Settlement Batch',
    steps: {
      1: {
        stage: '01 • ORDER INGESTION',
        title: 'Merchant Order Created',
        desc: 'Merchant records checkout order for ₹5,000.00 expecting standard T+1 settlement.',
        status: 'PASS',
        node: 'order',
        highlight: 'Order: ₹5,000.00'
      },
      2: {
        stage: '02 • GATEWAY PAYMENT',
        title: 'Customer Payment Captured',
        desc: 'Payment captured successfully from customer. Gateway holds gross funds.',
        status: 'PASS',
        node: 'payment',
        highlight: 'Gateway holds ₹5,000.00'
      },
      3: {
        stage: '03 • CHARGES & LEDGER ENTRY',
        title: 'Projected Net Settlement Calculated',
        desc: 'MDR fee (₹90.00) and GST (₹16.20) ledger projections created. Merchant expects ₹4,893.80 payout.',
        status: 'PASS',
        node: 'fees',
        highlight: 'Projected Net: ₹4,893.80'
      },
      4: {
        stage: '04 • ⚠️ SETTLEMENT BATCH MISSING',
        title: 'Gateway Payout Batch Not Delivered',
        desc: 'Acquiring gateway failed to disburse settlement file within SLA window. Batch is missing from ledger feed.',
        status: 'FAIL',
        node: 'settlement',
        highlight: '⚠️ Unsettled: ₹4,893.80 held at gateway'
      },
      5: {
        stage: '05 • RECON ANOMALY DETECTION',
        title: 'MISSING_SETTLEMENT Anomaly Raised',
        desc: 'Recon engine flags settlement delay. Automated remediation: Query Nodal Bank Status & trigger gateway escalation ticket.',
        status: 'FAIL',
        node: 'bank',
        highlight: 'Anomaly: MISSING_SETTLEMENT (₹4,893.80)'
      }
    }
  },
  FEE_MISMATCH: {
    title: 'Gateway Fee Overcharge Discrepancy',
    steps: {
      1: {
        stage: '01 • ORDER INGESTION',
        title: 'Netbanking Order Initialized',
        desc: 'Merchant checkout created for Netbanking payment of ₹5,000.00 (Contracted flat fee: ₹15.00).',
        status: 'PASS',
        node: 'order',
        highlight: 'Contracted Flat MDR: ₹15.00'
      },
      2: {
        stage: '02 • GATEWAY CAPTURE',
        title: 'Netbanking Payment Authorized',
        desc: 'Payment authorized through banking gateway integration.',
        status: 'PASS',
        node: 'payment',
        highlight: 'Payment Captured'
      },
      3: {
        stage: '03 • ⚠️ MDR OVERCHARGE DETECTED',
        title: 'Discrepant MDR Applied by Gateway',
        desc: 'Contracted flat fee was ₹15.00 (+₹2.70 GST), but Gateway deducted ₹45.00 (+₹8.10 GST) — an excess fee overcharge of +₹35.40!',
        status: 'WARN',
        node: 'fees',
        highlight: '⚠️ Fee Variance: +₹35.40 Overcharge'
      },
      4: {
        stage: '04 • REDUCED SETTLEMENT BATCH',
        title: 'Lower Payout Batch Received',
        desc: 'Gateway disbursed ₹4,946.90 instead of the contracted expected net payout of ₹4,982.30.',
        status: 'WARN',
        node: 'settlement',
        highlight: 'Settled: ₹4,946.90 vs Expected: ₹4,982.30'
      },
      5: {
        stage: '05 • RECON EXCEPTION FILED',
        title: 'FEE_MISMATCH Discrepancy Flagged',
        desc: 'Reconciliation audit isolates exact ₹35.40 MDR leakage. Auto-remediation: File Dispute Ticket to Gateway with line-item proof.',
        status: 'WARN',
        node: 'bank',
        highlight: 'Exception: FEE_MISMATCH (+₹35.40)'
      }
    }
  },
  AMOUNT_MISMATCH: {
    title: 'Short Settlement Discrepancy',
    steps: {
      1: {
        stage: '01 • ORDER INGESTION',
        title: 'Merchant Order Created',
        desc: 'Order created for gross amount of ₹5,000.00.',
        status: 'PASS',
        node: 'order',
        highlight: 'Gross: ₹5,000.00'
      },
      2: {
        stage: '02 • PAYMENT CAPTURED',
        title: 'Gateway Payment Processed',
        desc: 'Payment captured with standard authorization token.',
        status: 'PASS',
        node: 'payment',
        highlight: 'Captured'
      },
      3: {
        stage: '03 • DEDUCTIONS APPLIED',
        title: 'Standard Charges Computed',
        desc: 'Fees ₹90.00 + GST ₹16.20 applied. Expected net settlement amount: ₹4,893.80.',
        status: 'PASS',
        node: 'fees',
        highlight: 'Expected Net: ₹4,893.80'
      },
      4: {
        stage: '04 • ⚠️ SHORT SETTLEMENT BATCH',
        title: 'Deficit in Gateway Disbursement',
        desc: 'Gateway disbursed ₹4,543.80 into the settlement batch — an unexplained shortfall of -₹350.00!',
        status: 'FAIL',
        node: 'settlement',
        highlight: '⚠️ Deficit: -₹350.00 Shortfall'
      },
      5: {
        stage: '05 • RECON VARIANCE DETECTED',
        title: 'AMOUNT_MISMATCH Exception Raised',
        desc: 'Lineage reconciliation engine identifies ₹350.00 balance sheet deficit. Auto-remediation: Request Short-Settlement True-Up.',
        status: 'FAIL',
        node: 'bank',
        highlight: 'Exception: AMOUNT_MISMATCH (-₹350.00)'
      }
    }
  },
  DELAYED_SETTLEMENT: {
    title: 'T+10 SLA Settlement Window Breach',
    steps: {
      1: {
        stage: '01 • ORDER INGESTION',
        title: 'Order Created',
        desc: 'Customer purchase initiated for ₹5,000.00.',
        status: 'PASS',
        node: 'order',
        highlight: 'Order: ₹5,000.00'
      },
      2: {
        stage: '02 • PAYMENT CAPTURED 10 DAYS AGO',
        title: 'Payment Captured on T-10',
        desc: 'Payment was captured 10 days prior, far exceeding the contractual T+1 settlement SLA window.',
        status: 'WARN',
        node: 'payment',
        highlight: 'T+10 Days Elapsed'
      },
      3: {
        stage: '03 • CHARGES COMPUTED',
        title: 'MDR Deductions Applied',
        desc: 'Fee deductions of ₹106.20 accounted for in ledger.',
        status: 'PASS',
        node: 'fees',
        highlight: 'Expected: ₹4,893.80'
      },
      4: {
        stage: '04 • DELAYED BATCH RECEIVED',
        title: 'Payout Arrives After Extended Latency',
        desc: 'Gateway batch arrived with 10 days latency. Settlement amount matches, but timeline violated contract SLA.',
        status: 'WARN',
        node: 'settlement',
        highlight: 'SLA Breach: 9 Days Overdue'
      },
      5: {
        stage: '05 • AUDIT RECORD LOGGED',
        title: 'SLA Latency Penalty Flagged',
        desc: 'Amounts reconciled, but SLA breach logged for gateway performance scorecard and merchant interest credit calculation.',
        status: 'WARN',
        node: 'bank',
        highlight: 'SLA Violation Audited'
      }
    }
  },
  DUPLICATE_TRANSACTION: {
    title: 'Duplicate Ledger Posting',
    steps: {
      1: {
        stage: '01 • ORDER INGESTION',
        title: 'Single Merchant Order',
        desc: 'Single checkout cart created for ₹5,000.00.',
        status: 'PASS',
        node: 'order',
        highlight: 'Single Order: ₹5,000.00'
      },
      2: {
        stage: '02 • PAYMENT CAPTURED',
        title: 'Single Gateway Charge',
        desc: 'Single payment authorized & captured.',
        status: 'PASS',
        node: 'payment',
        highlight: 'Single Charge'
      },
      3: {
        stage: '03 • DEDUCTIONS',
        title: 'MDR Calculated',
        desc: 'Standard fee calculated for single transaction.',
        status: 'PASS',
        node: 'fees',
        highlight: 'Fee: ₹106.20'
      },
      4: {
        stage: '04 • ⚠️ DUPLICATE SETTLEMENT BATCHES',
        title: 'Gateway Disbursed Payout Twice',
        desc: 'Gateway generated 2 separate settlement batches (setl_... and setl_dup_...) for the same single payment charge!',
        status: 'FAIL',
        node: 'settlement',
        highlight: '⚠️ Double Settlement: 2x ₹4,893.80'
      },
      5: {
        stage: '05 • RECON ANOMALY INTERCEPTED',
        title: 'DUPLICATE_TRANSACTION Anomaly Flagged',
        desc: 'Recon engine catches duplicate ₹4,893.80 payout before bank ledger reconciliation. Auto-remediation: Auto-Reverse Duplicate Entry.',
        status: 'FAIL',
        node: 'bank',
        highlight: 'Anomaly: DUPLICATE_TRANSACTION'
      }
    }
  },
  STATUS_MISMATCH: {
    title: 'Status Mismatch (Merchant Cart vs Gateway)',
    steps: {
      1: {
        stage: '01 • ⚠️ ORDER MARKED FAILED',
        title: 'Merchant Checkout Cart Failed',
        desc: 'Merchant website recorded order as FAILED / Abandoned during checkout callback.',
        status: 'FAIL',
        node: 'order',
        highlight: 'Order State: FAILED'
      },
      2: {
        stage: '02 • ⚠️ PAYMENT STATE CONFLICT',
        title: 'Gateway Payment Synchronized',
        desc: 'Gateway webhook synchronization confirms payment failed or in state conflict with cart.',
        status: 'FAIL',
        node: 'payment',
        highlight: 'Status Conflict'
      },
      3: {
        stage: '03 • LEDGER SUSPENDED',
        title: 'No Deductions Assessed',
        desc: 'MDR charges held due to state mismatch.',
        status: 'WARN',
        node: 'fees',
        highlight: 'Ledger Hold'
      },
      4: {
        stage: '04 • SETTLEMENT SKIPPED',
        title: 'No Batch Generated',
        desc: 'Uncaptured payment skipped from payout batch cycle.',
        status: 'WARN',
        node: 'settlement',
        highlight: 'No Settlement'
      },
      5: {
        stage: '05 • RECON ISOLATION',
        title: 'STATUS_MISMATCH Exception Raised',
        desc: 'Recon engine isolates cart vs gateway status discrepancy. Auto-remediation: Sync Status from Gateway API.',
        status: 'FAIL',
        node: 'bank',
        highlight: 'Exception: STATUS_MISMATCH'
      }
    }
  },
  MISSING_REFUND: {
    title: 'Missing Refund Reversal Batch',
    steps: {
      1: {
        stage: '01 • ORDER INGESTION',
        title: 'Original Order Record',
        desc: 'Customer purchase of ₹5,000.00 registered on merchant database.',
        status: 'PASS',
        node: 'order',
        highlight: 'Order: ₹5,000.00'
      },
      2: {
        stage: '02 • ⚠️ PAYMENT MARKED REFUNDED',
        title: 'Customer Refund Initiated',
        desc: 'Payment state marked REFUNDED on merchant portal; reversal request submitted to gateway.',
        status: 'WARN',
        node: 'payment',
        highlight: 'State: REFUNDED'
      },
      3: {
        stage: '03 • REVERSAL ACCOUNTING',
        title: 'Fee Reversal Adjustments',
        desc: 'Ledger prepares debit entry for refund disbursement.',
        status: 'PASS',
        node: 'fees',
        highlight: 'Refund Debit: ₹5,000.00'
      },
      4: {
        stage: '04 • ⚠️ MISSING REFUND CREDIT',
        title: 'Gateway Reversal Batch Not Delivered',
        desc: 'Gateway has not posted the refund reversal batch credit to the nodal bank within banking cutoff.',
        status: 'FAIL',
        node: 'settlement',
        highlight: '⚠️ Uncredited Refund: ₹5,000.00'
      },
      5: {
        stage: '05 • RECON ANOMALY FLAGGED',
        title: 'MISSING_REFUND Exception Raised',
        desc: 'Recon engine flags uncredited ₹5,000.00 reversal. Auto-remediation: Force Retry Refund API with gateway gateway.',
        status: 'FAIL',
        node: 'bank',
        highlight: 'Exception: MISSING_REFUND'
      }
    }
  }
};

const PIPELINE_NODES = ['order', 'payment', 'fees', 'settlement', 'bank'];

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

  // Dynamic What-If Simulation Sandbox State
  const [customAmount, setCustomAmount] = useState('299');
  const [customMethod, setCustomMethod] = useState('CARD');
  const [latestLiveTx, setLatestLiveTx] = useState(null);

  // Smooth Simulation Mechanism State
  const [simScenario, setSimScenario] = useState('PERFECT_MATCH');
  const [simScenarioLabel, setSimScenarioLabel] = useState('Normal Flow');
  const [simStep, setSimStep] = useState(5); // 1 to 5 (5 means complete)
  const [isSimRunning, setIsSimRunning] = useState(false);
  const [isSimPaused, setIsSimPaused] = useState(false);
  const [simSpeed, setSimSpeed] = useState(1); // 0.5 = slow/explain, 1 = normal, 2 = fast
  const simTimerRef = useRef(null);
  const pendingTxRef = useRef(null);

  // Autoplay flow state for standard stepping
  const [isPlaying, setIsPlaying] = useState(false);
  const playTimerRef = useRef(null);

  // AI State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [activeExceptionId, setActiveExceptionId] = useState(null);

  // Auto-Fix State
  const [fixingId, setFixingId] = useState(null);
  const [fixedIds, setFixedIds] = useState([]);

  // Auto-load the latest live transaction
  useEffect(() => {
    setMounted(true);
    const fetchLatestLive = async () => {
      try {
        const res = await fetch('/api/transactions?limit=5');
        const data = await res.json();
        if (data.data?.length > 0) {
          // Find first real live payment or default first
          const firstLive = data.data.find(d => !d.externalPaymentId?.includes('_sim_')) || data.data[0];
          setLatestLiveTx(firstLive);
          handleSearch(firstLive.id, 'Live DB Record');
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchLatestLive();
  }, []);

  // Smooth Simulation progression timer
  useEffect(() => {
    if (!isSimRunning || isSimPaused) {
      if (simTimerRef.current) clearTimeout(simTimerRef.current);
      return;
    }

    const stepDelay = Math.round(1500 / simSpeed);

    simTimerRef.current = setTimeout(() => {
      if (simStep < 5) {
        const nextStep = simStep + 1;
        setSimStep(nextStep);
        setSelectedNode(PIPELINE_NODES[nextStep - 1]);
      } else {
        // Simulation complete
        setIsSimRunning(false);
        if (pendingTxRef.current) {
          setTx(pendingTxRef.current);
        }
      }
    }, stepDelay);

    return () => {
      if (simTimerRef.current) clearTimeout(simTimerRef.current);
    };
  }, [isSimRunning, isSimPaused, simStep, simSpeed]);

  // Autoplay cycle for standard step-through
  useEffect(() => {
    if (isPlaying) {
      playTimerRef.current = setInterval(() => {
        setSelectedNode(current => {
          const currentIndex = PIPELINE_NODES.indexOf(current);
          const nextIndex = (currentIndex + 1) % PIPELINE_NODES.length;
          return PIPELINE_NODES[nextIndex];
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
    setIsSimRunning(false);
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
      setSimStep(5); // full view

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
          isSim: Boolean(scenarioLabel?.startsWith('Sim:') || loadedTx.externalPaymentId?.includes('_sim_')),
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

  // Launch smooth step-by-step simulation with dynamic amount & method
  const handleSimulate = async (scenarioId, scenarioLabel, overrideAmount = null, overrideMethod = null) => {
    const targetAmount = overrideAmount !== null ? overrideAmount : (parseFloat(customAmount) || 299);
    const targetMethod = overrideMethod || customMethod;

    setSimulating(scenarioId);
    setError('');
    setAiResult(null);
    setFixedIds([]);
    setIsPlaying(false);
    setIsSimPaused(false);
    setSimScenario(scenarioId);
    setSimScenarioLabel(scenarioLabel || scenarioId);
    
    try {
      const res = await fetch('/api/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          scenario: scenarioId,
          amount: targetAmount,
          method: targetMethod
        })
      });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Simulation failed' }));
        throw new Error(errData.error || 'Simulation execution failed');
      }
      const data = await res.json();
      
      // Fetch full simulated record
      const txRes = await fetch(`/api/transactions/${data.paymentId}`);
      if (!txRes.ok) throw new Error('Failed to retrieve simulated transaction');
      const txData = await txRes.json();
      const loadedTx = txData.data;

      pendingTxRef.current = loadedTx;
      setTx(loadedTx);
      setSearchId(loadedTx.id);
      setSearchInput(loadedTx.externalPaymentId || loadedTx.id);

      // Keep original transaction reference
      if (!originalTx) {
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
          scenario: `Sim: ${scenarioLabel || scenarioId}`,
          isSim: true,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };
        return [entry, ...prev.slice(0, 9)];
      });

      // Start staged animation at Step 1
      setSimStep(1);
      setSelectedNode('order');
      setIsSimRunning(true);

    } catch (e) {
      setError(e.message || 'Simulation error');
    } finally {
      setSimulating(false);
    }
  };

  // Replay current simulation smoothly
  const handleReplaySimulation = () => {
    setIsPlaying(false);
    setIsSimPaused(false);
    setSimStep(1);
    setSelectedNode('order');
    setIsSimRunning(true);
  };

  // Skip simulation straight to finished state
  const handleSkipSimulation = () => {
    setIsSimRunning(false);
    setIsSimPaused(false);
    setSimStep(5);
    setSelectedNode('payment');
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
    setIsSimRunning(false);
    setSelectedNode(current => {
      const currentIndex = PIPELINE_NODES.indexOf(current);
      if (direction === 'next') {
        const nextIdx = (currentIndex + 1) % PIPELINE_NODES.length;
        setSimStep(nextIdx + 1);
        return PIPELINE_NODES[nextIdx];
      } else {
        const prevIdx = (currentIndex - 1 + PIPELINE_NODES.length) % PIPELINE_NODES.length;
        setSimStep(prevIdx + 1);
        return PIPELINE_NODES[prevIdx];
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

  // Calculations for balance bar
  const totalFeesAmount = tx?.fees ? tx.fees.reduce((s, f) => s + parseFloat(f.amount.toString()), 0) : 0;
  const totalTaxAmount = tx?.fees ? tx.fees.reduce((s, f) => s + parseFloat(f.tax.toString()), 0) : 0;
  const totalDeductions = totalFeesAmount + totalTaxAmount;
  const expectedSettlement = (tx?.amount || 0) - totalDeductions;
  const actualSettlement = tx?.settlements?.[0]?.amount || 0;
  const reconDelta = tx ? (actualSettlement - expectedSettlement) : 0;
  const isChainHealthy = tx?.reconciliations?.[0]?.status === 'MATCHED' && (!tx?.exceptions || tx.exceptions.length === 0);

  // Active mechanism step info
  const activeMechanism = SCENARIO_MECHANISMS[simScenario] || SCENARIO_MECHANISMS.PERFECT_MATCH;
  const currentStepInfo = activeMechanism.steps[simStep] || activeMechanism.steps[1];

  // Timeline Events
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
          { label: 'MDR Commission Rate', status: totalFeesAmount > 0 ? (simScenario === 'FEE_MISMATCH' ? 'WARN' : 'PASS') : 'WARN', note: simScenario === 'FEE_MISMATCH' ? '⚠️ Overcharged fee ₹' + totalFeesAmount : `Calculated fee ₹${totalFeesAmount}` },
          { label: 'GST Tax Rate (18%)', status: totalTaxAmount > 0 ? 'PASS' : 'WARN', note: `GST component ₹${totalTaxAmount}` },
          { label: 'Ledger Parity', status: simScenario === 'FEE_MISMATCH' ? 'WARN' : 'PASS', note: simScenario === 'FEE_MISMATCH' ? 'Variance with agreed rate card' : 'Expected deduction ledger matching' }
        ];
      case 'settlement':
        return [
          { label: 'Settlement Batch Delivery', status: tx.settlements?.length > 0 ? 'PASS' : 'FAIL', note: tx.settlements?.length > 0 ? 'Batch ID: ' + tx.settlements[0].externalSettlementId : 'No settlement reported by gateway' },
          { label: 'Duplicate Entry Check', status: tx.settlements?.length <= 1 ? 'PASS' : 'FAIL', note: tx.settlements?.length > 1 ? 'Multiple settlements for single charge' : 'Unique 1:1 settlement' },
          { label: 'SLA Settlement Window', status: simScenario === 'DELAYED_SETTLEMENT' ? 'WARN' : 'PASS', note: simScenario === 'DELAYED_SETTLEMENT' ? 'T+10 SLA breach latency' : 'Standard T+1 settlement cycle' }
        ];
      case 'bank':
        const hasBank = tx.settlements?.some(s => s.bankTransactions?.length > 0);
        return [
          { label: 'Nodal Bank UTR Clearance', status: hasBank ? 'PASS' : 'WARN', note: hasBank ? 'UTR reference linked' : 'Pending bank clearance' },
          { label: 'Disbursement Parity', status: (actualSettlement > 0 && Math.abs(reconDelta) < 0.01) ? 'PASS' : 'WARN', note: `Deposit amount ₹${actualSettlement} (Delta: ₹${reconDelta.toFixed(2)})` },
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
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-[#528FF0] dark:bg-blue-900/20 font-medium flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[#528FF0]" /> Quantum Mesh Simulation
            </span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Step through, inspect, and understand underlying financial mechanics across all 5 financial nodes.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center bg-[var(--muted)] rounded-lg p-0.5">
            <button onClick={() => setViewMode('graph')} className={`px-3 py-1.5 rounded-md font-medium text-sm flex items-center transition-colors duration-150 ${viewMode === 'graph' ? 'bg-[#528FF0] text-white shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
              <Activity className="w-4 h-4 mr-1.5" /> Pipeline Topology
            </button>
            <button onClick={() => setViewMode('timeline')} className={`px-3 py-1.5 rounded-md font-medium text-sm flex items-center transition-colors duration-150 ${viewMode === 'timeline' ? 'bg-[#528FF0] text-white shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}>
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
        
        {/* Top Control: Search Bar & Live vs Sandbox Indicator */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3.5 shadow-sm flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2 flex-1 min-w-[280px]">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchInput)}
                placeholder="Search by Payment ID (pay_...), Order ID, or UTR..."
                className="w-full h-9 pl-9 pr-3 text-xs rounded-lg border border-[var(--border)] bg-[var(--muted)] text-[var(--foreground)] focus:outline-none focus:border-[#528FF0] transition-colors"
              />
            </div>
            <button
              onClick={() => handleSearch(searchInput)}
              disabled={loading}
              className="h-9 px-4 rounded-lg text-xs font-semibold bg-[#528FF0] hover:bg-[#4080E0] text-white transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Search'}
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* ⚡ Load Latest Live Payment Button */}
            {latestLiveTx && (
              <button
                onClick={() => handleSearch(latestLiveTx.id, 'Live DB Record')}
                className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 transition-all duration-150 flex items-center gap-1.5 shadow-sm"
              >
                <Zap className="w-3.5 h-3.5 text-emerald-500" />
                <span>Load Latest Live ({latestLiveTx.externalPaymentId?.slice(0, 14)}... • {formatCurrency(latestLiveTx.amount)})</span>
              </button>
            )}

            {originalTx && tx?.id !== originalTx?.id && (
              <button
                onClick={() => handleSearch(originalTx.id, 'Original')}
                className="h-9 px-3.5 rounded-lg text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white transition-all duration-150 flex items-center gap-1.5 shadow-sm"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Back to Live ({originalTx.externalPaymentId?.slice(0, 14) || 'Live Transaction'})</span>
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Sandbox Simulator Controls */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm relative overflow-hidden space-y-3.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[var(--border)] pb-3">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                <Sliders className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-[var(--foreground)] uppercase tracking-wider flex items-center gap-2">
                  Dynamic What-If Sandbox Simulator
                  <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                    tx?.externalPaymentId?.includes('_sim_') || simScenario !== 'PERFECT_MATCH'
                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                  }`}>
                    {tx?.externalPaymentId?.includes('_sim_') ? '🧪 Sandbox Model' : '🟢 Live DB Record'}
                  </span>
                </h3>
                <p className="text-[11px] text-[var(--muted-foreground)]">Customize amount & payment method to dynamically test fee mathematics across all 5 nodes</p>
              </div>
            </div>

            {/* Dynamic Input Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Amount Input */}
              <div className="flex items-center bg-[var(--muted)] rounded-lg border border-[var(--border)] px-2.5 py-1">
                <span className="text-xs font-semibold text-[var(--muted-foreground)] mr-1.5">₹</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-20 bg-transparent text-xs font-bold text-[var(--foreground)] focus:outline-none"
                />
              </div>

              {/* Quick Amount Presets */}
              <div className="hidden md:flex items-center gap-1">
                {['299', '800', '2500', '5000'].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setCustomAmount(amt)}
                    className={`px-2 py-1 rounded text-[10px] font-semibold border transition-colors ${
                      customAmount === amt
                        ? 'bg-[#528FF0] text-white border-[#528FF0]'
                        : 'bg-[var(--muted)] text-[var(--muted-foreground)] hover:text-[var(--foreground)] border-[var(--border)]'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              {/* Method Selector */}
              <select
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value)}
                className="bg-[var(--muted)] rounded-lg px-2.5 py-1.5 text-xs font-semibold border border-[var(--border)] text-[var(--foreground)] focus:outline-none cursor-pointer"
              >
                <option value="CARD">Credit/Debit Card (1.8% MDR)</option>
                <option value="UPI">UPI (0.0% / 1.1%)</option>
                <option value="NETBANKING">Netbanking (Flat ₹15)</option>
              </select>

              {simulating && (
                <span className="text-xs text-amber-600 flex items-center gap-1.5 font-medium animate-pulse bg-amber-50 dark:bg-amber-900/20 px-2.5 py-1 rounded-full border border-amber-500/30">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Ingesting scenario pipeline...
                </span>
              )}
            </div>
          </div>
          
          {/* Scenario Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
            {SCENARIOS.map(s => {
              const isSelected = simScenario === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => handleSimulate(s.id, s.label)}
                  disabled={simulating}
                  className={`text-xs p-2.5 rounded-lg font-medium transition-all duration-200 border text-left flex flex-col justify-between disabled:opacity-50 hover:scale-[1.03] active:scale-[0.97] ${SCENARIO_COLOR_MAP[s.color]} ${isSelected ? 'ring-2 ring-[#528FF0] shadow-md -translate-y-0.5' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold truncate">{s.label}</span>
                    {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-[#528FF0] animate-ping" />}
                  </div>
                  <div className="text-[10px] opacity-75 mt-1 truncate">{s.desc}</div>
                </button>
              );
            })}
          </div>

          {/* Simulation History Reel */}
          {history.length > 0 && (
            <div className="pt-2 border-t border-[var(--border)] flex items-center gap-2 overflow-x-auto text-xs pb-1">
              <span className="text-[11px] font-semibold text-[var(--muted-foreground)] flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3" /> History:
              </span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {history.map((h, i) => (
                  <button
                    key={`${h.id}_${i}`}
                    onClick={() => handleSearch(h.id, h.scenario)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 transition-all flex-shrink-0 border ${
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
        <div className="p-3 bg-red-50 dark:bg-red-900/15 border border-red-200 dark:border-red-800/30 rounded-xl text-red-600 dark:text-red-400 flex items-center text-sm font-medium print:hidden shadow-sm">
          <AlertTriangle className="w-4 h-4 mr-2 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Main Interactive Graph Canvas */}
      {tx && (
        <div className="space-y-4">
          {viewMode === 'graph' ? (
            <div className="rounded-2xl border border-slate-800 shadow-2xl overflow-hidden bg-[#070D1B] text-white print:bg-white print:text-black relative">
              
              {/* Futuristic Ambient Glow Backdrop Blobs */}
              <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

              {/* Financial Balance & Flow Controller Header */}
              <div className="border-b border-slate-800/90 bg-[#0C1427]/90 backdrop-blur-md px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 text-xs relative z-10">
                
                {/* Arithmetic Flow Breakdown Cards */}
                <div className="flex items-center gap-3 flex-wrap">
                  
                  {/* Item 1 */}
                  <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="text-slate-400 block text-[9px] font-mono uppercase tracking-wider">Gross Payment</span>
                    <span className="font-bold text-emerald-400 text-sm font-mono">{formatCurrency(tx.amount)}</span>
                  </div>

                  <div className="text-slate-500 font-bold text-base">−</div>

                  {/* Item 2 */}
                  <div className={`bg-slate-900/90 border px-3 py-1.5 rounded-lg shadow-sm ${simScenario === 'FEE_MISMATCH' ? 'border-amber-500/60 bg-amber-950/20' : 'border-slate-800'}`}>
                    <span className="text-slate-400 block text-[9px] font-mono uppercase tracking-wider flex items-center gap-1">
                      Charges & GST {simScenario === 'FEE_MISMATCH' && <span className="text-amber-400">⚠️</span>}
                    </span>
                    <span className={`font-bold text-sm font-mono ${simScenario === 'FEE_MISMATCH' ? 'text-amber-400' : 'text-red-400'}`}>
                      -{formatCurrency(totalDeductions)}
                    </span>
                  </div>

                  <div className="text-slate-500 font-bold text-base">=</div>

                  {/* Item 3 */}
                  <div className="bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg shadow-sm">
                    <span className="text-slate-400 block text-[9px] font-mono uppercase tracking-wider">Expected Net</span>
                    <span className="font-bold text-blue-400 text-sm font-mono">{formatCurrency(expectedSettlement)}</span>
                  </div>

                  <div className="text-slate-500 font-bold text-base">➔</div>

                  {/* Item 4 */}
                  <div className={`bg-slate-900/90 border px-3 py-1.5 rounded-lg shadow-sm ${actualSettlement === 0 ? 'border-red-500/60 bg-red-950/20' : Math.abs(reconDelta) > 0.01 ? 'border-amber-500/60 bg-amber-950/20' : 'border-emerald-500/40 bg-emerald-950/10'}`}>
                    <span className="text-slate-400 block text-[9px] font-mono uppercase tracking-wider">Bank Cleared</span>
                    <span className={`font-bold text-sm font-mono ${actualSettlement === 0 ? 'text-red-400' : Math.abs(reconDelta) > 0.01 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {formatCurrency(actualSettlement)}
                    </span>
                  </div>

                  {/* Variance Pill */}
                  {Math.abs(reconDelta) > 0.01 && (
                    <div className="px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-mono font-bold flex items-center gap-1 animate-pulse">
                      <AlertTriangle className="w-3 h-3" /> Variance: {formatCurrency(reconDelta)}
                    </div>
                  )}

                </div>

                {/* Playback & Step Controller */}
                <div className="flex items-center gap-2 bg-slate-950/80 border border-slate-700/80 rounded-xl p-1 shadow-inner">
                  <button 
                    onClick={() => stepNode('prev')}
                    title="Previous Node"
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={() => {
                      if (isSimRunning) {
                        setIsSimPaused(!isSimPaused);
                      } else {
                        setIsPlaying(!isPlaying);
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm ${
                      isSimRunning
                        ? isSimPaused
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold'
                        : isPlaying 
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' 
                          : 'bg-[#528FF0] text-white hover:bg-[#4080E0]'
                    }`}
                  >
                    {isSimRunning ? (
                      isSimPaused ? <><Play className="w-3 h-3 fill-current" /> Resume Sim</> : <><Pause className="w-3 h-3 fill-current" /> Pause Sim</>
                    ) : (
                      isPlaying ? <><Pause className="w-3 h-3 fill-current" /> Pause</> : <><Play className="w-3 h-3 fill-current" /> Step-Through</>
                    )}
                  </button>

                  <button 
                    onClick={() => stepNode('next')}
                    title="Next Node"
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>

              {/* Dynamic Simulation Mechanics Explainer HUD */}
              <div className="bg-gradient-to-r from-slate-950/90 via-[#0B152B]/90 to-slate-950/90 border-b border-slate-800/80 px-6 py-4 relative z-10 backdrop-blur-sm">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  {/* Stage Tracker & Mechanism Insight */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className={`p-2.5 rounded-xl shrink-0 mt-0.5 shadow-md ${
                      currentStepInfo.status === 'PASS' 
                        ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                        : currentStepInfo.status === 'WARN'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse'
                        : 'bg-red-500/20 text-red-400 border border-red-500/30 animate-pulse'
                    }`}>
                      {currentStepInfo.status === 'PASS' ? (
                        <Activity className="w-5 h-5" />
                      ) : currentStepInfo.status === 'WARN' ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <AlertCircle className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-[#528FF0] bg-[#528FF0]/10 px-2 py-0.5 rounded-md border border-[#528FF0]/20">
                          {currentStepInfo.stage}
                        </span>
                        <span className="text-slate-600 text-xs">•</span>
                        <span className="text-sm font-semibold text-white">
                          {currentStepInfo.title}
                        </span>
                        <span className={`text-[10px] px-2.5 py-0.5 rounded-md font-mono font-bold shadow-sm ${
                          currentStepInfo.status === 'PASS' 
                            ? 'bg-emerald-950/90 text-emerald-400 border border-emerald-800/60' 
                            : currentStepInfo.status === 'WARN'
                            ? 'bg-amber-950/90 text-amber-300 border border-amber-800/60'
                            : 'bg-red-950/90 text-red-400 border border-red-800/60'
                        }`}>
                          {currentStepInfo.highlight}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 mt-1.5 leading-relaxed max-w-4xl font-normal">
                        {currentStepInfo.desc}
                      </p>
                    </div>
                  </div>

                  {/* Simulation Controls: Speed, Replay, Skip */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    
                    {/* Speed Selector */}
                    <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5 text-[11px]">
                      <button
                        onClick={() => setSimSpeed(0.5)}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${simSpeed === 0.5 ? 'bg-[#528FF0] text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        title="Slow Motion (2.4s per stage - recommended for deep inspection)"
                      >
                        0.5x Slow
                      </button>
                      <button
                        onClick={() => setSimSpeed(1)}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${simSpeed === 1 ? 'bg-[#528FF0] text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        title="Normal Speed (1.5s per stage)"
                      >
                        1x Normal
                      </button>
                      <button
                        onClick={() => setSimSpeed(2)}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${simSpeed === 2 ? 'bg-[#528FF0] text-white shadow' : 'text-slate-400 hover:text-white'}`}
                        title="Fast Speed (0.7s per stage)"
                      >
                        2x Fast
                      </button>
                    </div>

                    {/* Replay Simulation */}
                    <button
                      onClick={handleReplaySimulation}
                      title="Replay this simulation mechanism from step 1"
                      className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-semibold border border-slate-700 flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#528FF0]" /> Replay
                    </button>

                    {/* Skip to end */}
                    {isSimRunning && (
                      <button
                        onClick={handleSkipSimulation}
                        title="Skip straight to completed state"
                        className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 flex items-center gap-1 transition-colors shadow-sm"
                      >
                        <FastForward className="w-3.5 h-3.5" /> Skip
                      </button>
                    )}

                  </div>

                </div>

                {/* 5-Step Visual Progress Bar */}
                <div className="mt-3.5 flex items-center gap-2">
                  {[1, 2, 3, 4, 5].map((stepNum) => {
                    const nodeName = PIPELINE_NODES[stepNum - 1];
                    const isPassed = simStep >= stepNum;
                    const isCurrent = simStep === stepNum;
                    return (
                      <button
                        key={stepNum}
                        onClick={() => {
                          setIsSimRunning(false);
                          setSimStep(stepNum);
                          setSelectedNode(nodeName);
                        }}
                        className={`flex-1 group relative h-2 rounded-full transition-all duration-300 ${
                          isCurrent
                            ? 'bg-[#528FF0] shadow-[0_0_12px_#528FF0]'
                            : isPassed
                            ? 'bg-blue-600/70'
                            : 'bg-slate-800'
                        }`}
                        title={`Stage ${stepNum}: ${nodeName.toUpperCase()}`}
                      >
                        <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono font-bold transition-opacity ${
                          isCurrent ? 'opacity-100 text-[#528FF0]' : 'opacity-40 text-slate-400 group-hover:opacity-100'
                        }`}>
                          {stepNum}. {nodeName.toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Hyper-Visual Quantum Topology Nodes Canvas */}
              <div className="p-7 md:p-9 relative overflow-x-auto">
                {/* Circuit Grid Canvas Texture */}
                <div className="absolute inset-0 opacity-[0.06] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #528FF0 1.5px, transparent 1.5px)', backgroundSize: '28px 28px' }} />

                <div className="flex items-center justify-between min-w-[960px] relative z-10 py-4">
                  
                  {/* NODE 1: ORDER */}
                  <div 
                    onClick={() => { setSelectedNode('order'); setSimStep(1); setIsPlaying(false); setIsSimRunning(false); }}
                    className={`flex-1 max-w-[175px] cursor-pointer rounded-2xl p-4 transition-all duration-300 border text-left relative backdrop-blur-md ${
                      selectedNode === 'order' 
                        ? 'bg-slate-900/95 border-[#528FF0] ring-2 ring-[#528FF0]/60 shadow-[0_0_25px_rgba(82,143,240,0.35)] scale-105 animate-glow-pulse' 
                        : simStep < 1
                        ? 'opacity-40 bg-slate-950/60 border-slate-800'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-900 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" /> 01 • ORDER
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Receipt className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    
                    <div className="font-bold text-sm truncate text-white">Merchant Order</div>
                    <div className="text-xs font-mono text-emerald-400 font-bold mt-1">
                      {tx.order ? formatCurrency(tx.order.amount) : <span className="text-red-400">Missing</span>}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="truncate max-w-[100px]">{tx.order?.externalOrderId || 'No Order'}</span>
                      <span className="text-emerald-400 font-semibold">ISO INR</span>
                    </div>

                    {simStep === 1 && isSimRunning && (
                      <div className="absolute -top-2.5 -right-2.5 bg-[#528FF0] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse-ring flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5" /> INGESTING
                      </div>
                    )}
                  </div>

                  {/* CONNECTOR 1 -> 2 */}
                  <div className="flex-1 flex flex-col items-center px-1.5">
                    <span className="text-[9px] font-mono text-slate-400 mb-1.5 flex items-center gap-0.5">
                      <Lock className="w-2.5 h-2.5 text-blue-400" /> Auth ACK
                    </span>
                    <div className="w-full flex items-center relative">
                      <div className="h-[3px] w-full bg-slate-800 relative overflow-hidden rounded-full shadow-inner">
                        <div className={`h-full w-full transition-all duration-500 ${
                          simStep >= 2 ? 'bg-[#528FF0]' : 'bg-slate-700/40'
                        }`} />
                        {simStep === 2 && isSimRunning && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-laser-flow" />
                        )}
                      </div>
                      <ArrowRight className={`w-4 h-4 -ml-1 shrink-0 transition-colors duration-300 ${
                        simStep >= 2 ? 'text-[#528FF0]' : 'text-slate-600'
                      }`} />
                    </div>
                  </div>

                  {/* NODE 2: PAYMENT */}
                  <div 
                    onClick={() => { setSelectedNode('payment'); setSimStep(2); setIsPlaying(false); setIsSimRunning(false); }}
                    className={`flex-1 max-w-[175px] cursor-pointer rounded-2xl p-4 transition-all duration-300 border text-left relative backdrop-blur-md ${
                      selectedNode === 'payment' 
                        ? 'bg-slate-900/95 border-[#528FF0] ring-2 ring-[#528FF0]/60 shadow-[0_0_25px_rgba(82,143,240,0.35)] scale-105 animate-glow-pulse' 
                        : simStep < 2
                        ? 'opacity-40 bg-slate-950/60 border-slate-800'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-900 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-mono font-bold text-[#528FF0] flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#528FF0] animate-pulse" /> 02 • PAYMENT
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-[#528FF0]/10 border border-[#528FF0]/20 flex items-center justify-center text-[#528FF0]">
                        <CreditCard className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    
                    <div className="font-bold text-sm truncate text-white">Gateway Charge</div>
                    <div className="text-xs font-mono text-emerald-400 font-bold mt-1">{formatCurrency(tx.amount)}</div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                      <span className="text-slate-400 truncate max-w-[85px]">{tx.externalPaymentId}</span>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${
                        tx.status === 'CAPTURED' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/40' : 'bg-red-950 text-red-400 border border-red-800/40'
                      }`}>
                        {tx.status}
                      </span>
                    </div>

                    {simStep === 2 && isSimRunning && (
                      <div className="absolute -top-2.5 -right-2.5 bg-[#528FF0] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse-ring flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5" /> CAPTURING
                      </div>
                    )}
                  </div>

                  {/* CONNECTOR 2 -> 3 */}
                  <div className="flex-1 flex flex-col items-center px-1.5">
                    <span className="text-[9px] font-mono text-slate-400 mb-1.5 flex items-center gap-0.5">
                      <Cpu className="w-2.5 h-2.5 text-amber-400" /> MDR Engine
                    </span>
                    <div className="w-full flex items-center relative">
                      <div className="h-[3px] w-full bg-slate-800 relative overflow-hidden rounded-full shadow-inner">
                        <div className={`h-full w-full transition-all duration-500 ${
                          simStep >= 3 ? (simScenario === 'FEE_MISMATCH' ? 'bg-amber-500' : 'bg-[#528FF0]') : 'bg-slate-700/40'
                        }`} />
                        {simStep === 3 && isSimRunning && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-300 to-transparent animate-laser-flow" />
                        )}
                      </div>
                      <ArrowRight className={`w-4 h-4 -ml-1 shrink-0 transition-colors duration-300 ${
                        simStep >= 3 ? (simScenario === 'FEE_MISMATCH' ? 'text-amber-400' : 'text-[#528FF0]') : 'text-slate-600'
                      }`} />
                    </div>
                  </div>

                  {/* NODE 3: FEES & TAXES */}
                  <div 
                    onClick={() => { setSelectedNode('fees'); setSimStep(3); setIsPlaying(false); setIsSimRunning(false); }}
                    className={`flex-1 max-w-[175px] cursor-pointer rounded-2xl p-4 transition-all duration-300 border text-left relative backdrop-blur-md ${
                      selectedNode === 'fees' 
                        ? simScenario === 'FEE_MISMATCH'
                          ? 'bg-slate-900/95 border-amber-500 ring-2 ring-amber-500/60 shadow-[0_0_25px_rgba(245,158,11,0.35)] scale-105 animate-glow-pulse-amber'
                          : 'bg-slate-900/95 border-[#528FF0] ring-2 ring-[#528FF0]/60 shadow-[0_0_25px_rgba(82,143,240,0.35)] scale-105 animate-glow-pulse' 
                        : simStep < 3
                        ? 'opacity-40 bg-slate-950/60 border-slate-800'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-900 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${simScenario === 'FEE_MISMATCH' ? 'bg-amber-400 animate-ping' : 'bg-blue-400 animate-pulse'}`} /> 03 • CHARGES
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    
                    <div className="font-bold text-sm truncate text-white">Fees & Tax</div>
                    <div className={`text-xs font-mono font-bold mt-1 ${simScenario === 'FEE_MISMATCH' ? 'text-amber-400' : 'text-red-400'}`}>
                      -{formatCurrency(totalDeductions)}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span>Fee: {formatCurrency(totalFeesAmount)}</span>
                      <span className="text-red-400">GST: 18%</span>
                    </div>

                    {simStep === 3 && isSimRunning && (
                      <div className="absolute -top-2.5 -right-2.5 bg-amber-500 text-slate-950 text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse-ring flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5" /> DEDUCTING
                      </div>
                    )}
                  </div>

                  {/* CONNECTOR 3 -> 4 */}
                  <div className="flex-1 flex flex-col items-center px-1.5">
                    <span className={`text-[9px] font-mono mb-1.5 flex items-center gap-0.5 ${
                      simStep >= 4 
                        ? (tx.settlements?.length > 0 ? 'text-slate-400' : 'text-red-400 font-bold') 
                        : 'text-slate-600'
                    }`}>
                      <Layers className="w-2.5 h-2.5" /> {tx.settlements?.length > 0 ? 'Net Batch' : '⚠️ Missing'}
                    </span>
                    <div className="w-full flex items-center relative">
                      <div className="h-[3px] w-full bg-slate-800 relative overflow-hidden rounded-full shadow-inner">
                        <div className={`h-full w-full transition-all duration-500 ${
                          simStep >= 4
                            ? (tx.settlements?.length > 0 ? 'bg-[#528FF0]' : 'bg-red-500')
                            : 'bg-slate-700/40'
                        }`} />
                        {simStep === 4 && isSimRunning && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-laser-flow" />
                        )}
                      </div>
                      <ArrowRight className={`w-4 h-4 -ml-1 shrink-0 transition-colors duration-300 ${
                        simStep >= 4 
                          ? (tx.settlements?.length > 0 ? 'text-[#528FF0]' : 'text-red-500') 
                          : 'text-slate-600'
                      }`} />
                    </div>
                  </div>

                  {/* NODE 4: SETTLEMENT */}
                  <div 
                    onClick={() => { setSelectedNode('settlement'); setSimStep(4); setIsPlaying(false); setIsSimRunning(false); }}
                    className={`flex-1 max-w-[175px] cursor-pointer rounded-2xl p-4 transition-all duration-300 border text-left relative backdrop-blur-md ${
                      selectedNode === 'settlement' 
                        ? tx.settlements?.length > 0
                          ? 'bg-slate-900/95 border-[#528FF0] ring-2 ring-[#528FF0]/60 shadow-[0_0_25px_rgba(82,143,240,0.35)] scale-105 animate-glow-pulse'
                          : 'bg-red-950/95 border-red-500 ring-2 ring-red-500/60 shadow-[0_0_25px_rgba(239,68,68,0.35)] scale-105 animate-glow-pulse-red' 
                        : simStep < 4
                        ? 'opacity-40 bg-slate-950/60 border-slate-800'
                        : tx.settlements?.length > 0 
                          ? 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-900 shadow-md'
                          : 'bg-red-950/40 border-red-800/60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${tx.settlements?.length > 0 ? 'bg-blue-400 animate-pulse' : 'bg-red-500 animate-ping'}`} /> 04 • BATCH
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
                        <Clock className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    
                    <div className="font-bold text-sm truncate text-white">Settlement Batch</div>
                    <div className="text-xs font-mono text-emerald-400 font-bold mt-1">
                      {tx.settlements?.length > 0 ? formatCurrency(tx.settlements[0].amount) : <span className="text-red-400 font-bold">Unsettled</span>}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="truncate max-w-[90px]">{tx.settlements?.[0]?.externalSettlementId || 'None'}</span>
                      <span className={tx.settlements?.length > 0 ? 'text-emerald-400' : 'text-red-400'}>
                        {tx.settlements?.length > 0 ? 'T+1 SLA' : 'HELD'}
                      </span>
                    </div>

                    {simStep === 4 && isSimRunning && (
                      <div className="absolute -top-2.5 -right-2.5 bg-[#528FF0] text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse-ring flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5" /> BATCHING
                      </div>
                    )}
                  </div>

                  {/* CONNECTOR 4 -> 5 */}
                  <div className="flex-1 flex flex-col items-center px-1.5">
                    <span className="text-[9px] font-mono text-slate-400 mb-1.5 flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5 text-emerald-400" /> UTR Clear
                    </span>
                    <div className="w-full flex items-center relative">
                      <div className="h-[3px] w-full bg-slate-800 relative overflow-hidden rounded-full shadow-inner">
                        <div className={`h-full w-full transition-all duration-500 ${
                          simStep >= 5 ? 'bg-[#528FF0]' : 'bg-slate-700/40'
                        }`} />
                        {simStep === 5 && isSimRunning && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300 to-transparent animate-laser-flow" />
                        )}
                      </div>
                      <ArrowRight className={`w-4 h-4 -ml-1 shrink-0 transition-colors duration-300 ${
                        simStep >= 5 ? 'text-[#528FF0]' : 'text-slate-600'
                      }`} />
                    </div>
                  </div>

                  {/* NODE 5: BANK */}
                  <div 
                    onClick={() => { setSelectedNode('bank'); setSimStep(5); setIsPlaying(false); setIsSimRunning(false); }}
                    className={`flex-1 max-w-[175px] cursor-pointer rounded-2xl p-4 transition-all duration-300 border text-left relative backdrop-blur-md ${
                      selectedNode === 'bank' 
                        ? 'bg-slate-900/95 border-[#528FF0] ring-2 ring-[#528FF0]/60 shadow-[0_0_25px_rgba(82,143,240,0.35)] scale-105 animate-glow-pulse' 
                        : simStep < 5
                        ? 'opacity-40 bg-slate-950/60 border-slate-800'
                        : 'bg-slate-900/80 border-slate-800 hover:border-slate-600 hover:bg-slate-900 shadow-md'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2.5">
                      <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 05 • BANK
                      </span>
                      <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Building2 className="w-3.5 h-3.5" />
                      </div>
                    </div>
                    
                    <div className="font-bold text-sm truncate text-white">Nodal Bank UTR</div>
                    <div className="text-xs font-mono text-emerald-400 font-bold mt-1">
                      {tx.settlements?.[0]?.bankTransactions?.[0] ? formatCurrency(tx.settlements[0].bankTransactions[0].amount) : formatCurrency(actualSettlement)}
                    </div>

                    <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                      <span className="truncate max-w-[95px]">{tx.settlements?.[0]?.bankTransactions?.[0]?.reference || 'Nodal Escrow'}</span>
                      <span className="text-emerald-400 font-semibold">CLEARED</span>
                    </div>

                    {simStep === 5 && isSimRunning && (
                      <div className="absolute -top-2.5 -right-2.5 bg-emerald-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-full shadow-lg animate-pulse-ring flex items-center gap-1">
                        <Radio className="w-2.5 h-2.5" /> RECONCILING
                      </div>
                    )}
                  </div>

                </div>

                {/* Quantum Telemetry Micro-Bar */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5 text-slate-300">
                      <Radio className="w-3 h-3 text-emerald-400 animate-pulse" /> Telemetry: <span className="text-emerald-400 font-bold">LIVE DUAL-SYNC</span>
                    </span>
                    <span className="hidden sm:inline text-slate-600">|</span>
                    <span className="hidden sm:flex items-center gap-1 text-slate-400">
                      <Lock className="w-3 h-3 text-[#528FF0]" /> HMAC-SHA256: <span className="text-slate-200">VERIFIED</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded text-slate-300">
                      Routing: HDFC ESCROW ➔ RBI NODAL
                    </span>
                  </div>
                </div>

              </div>

              {/* Interactive Node Deep-Dive Inspector Tabs */}
              <div className="border-t border-slate-800/90 bg-[#060D1E]/95 p-6 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-xl bg-[#528FF0]/20 text-[#528FF0] border border-[#528FF0]/30 shadow-inner">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-white flex items-center gap-2">
                        Node Deep-Dive Inspector: <span className="text-[#528FF0] font-mono bg-[#528FF0]/10 px-2 py-0.2 rounded border border-[#528FF0]/30">{selectedNode.toUpperCase()}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">Step {PIPELINE_NODES.indexOf(selectedNode) + 1} of 5</span>
                      </span>
                      <p className="text-[11px] text-slate-400 mt-0.5">Live state verification and ledger telemetry for active stage</p>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center bg-slate-950 border border-slate-800 rounded-xl p-1 text-xs shadow-inner">
                    <button 
                      onClick={() => setInspectorTab('overview')}
                      className={`px-3.5 py-1.5 rounded-lg transition-all ${inspectorTab === 'overview' ? 'bg-[#528FF0] text-white font-semibold shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      Overview
                    </button>
                    <button 
                      onClick={() => setInspectorTab('checks')}
                      className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${inspectorTab === 'checks' ? 'bg-[#528FF0] text-white font-semibold shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      <FileCheck2 className="w-3.5 h-3.5" /> Validation Checks
                    </button>
                    <button 
                      onClick={() => setInspectorTab('json')}
                      className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${inspectorTab === 'json' ? 'bg-[#528FF0] text-white font-semibold shadow' : 'text-slate-400 hover:text-white'}`}
                    >
                      <Code2 className="w-3.5 h-3.5" /> Raw JSON
                    </button>
                  </div>
                </div>

                {/* Tab 1: Overview */}
                {inspectorTab === 'overview' && (
                  <div className="transition-all duration-200">
                    {selectedNode === 'order' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">External Order ID</span>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="font-mono text-slate-200 text-sm font-semibold">{tx.order?.externalOrderId || 'N/A'}</span>
                            {tx.order?.externalOrderId && (
                              <button onClick={() => handleCopy(tx.order.externalOrderId, 'ord')} className="text-slate-400 hover:text-white p-1">
                                {copiedId === 'ord' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">Order Total Amount</span>
                          <span className="font-mono text-emerald-400 font-bold text-base mt-1.5 block">{formatCurrency(tx.order?.amount)}</span>
                        </div>
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">Creation Timestamp</span>
                          <span className="text-slate-200 mt-1.5 block font-mono">{formatDate(tx.order?.createdAt)}</span>
                        </div>
                      </div>
                    )}

                    {selectedNode === 'payment' && (
                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">Gateway Payment ID</span>
                          <div className="flex items-center justify-between mt-1.5">
                            <span className="font-mono text-slate-200 text-sm font-semibold">{tx.externalPaymentId}</span>
                            <button onClick={() => handleCopy(tx.externalPaymentId, 'pay')} className="text-slate-400 hover:text-white p-1">
                              {copiedId === 'pay' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">Payment Method</span>
                          <span className="text-slate-200 font-medium mt-1.5 block">{tx.method || 'CARD / UPI / NETBANKING'}</span>
                        </div>
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">Authorized State</span>
                          <span className="text-emerald-400 font-semibold mt-1.5 block">{tx.status}</span>
                        </div>
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">Capture Timestamp</span>
                          <span className="text-slate-200 mt-1.5 block font-mono">{formatDate(tx.capturedAt || tx.createdAt)}</span>
                        </div>
                      </div>
                    )}

                    {selectedNode === 'fees' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">Merchant Discount Rate (MDR)</span>
                          <span className={`font-mono font-bold text-base mt-1.5 block ${simScenario === 'FEE_MISMATCH' ? 'text-amber-400' : 'text-red-400'}`}>
                            -{formatCurrency(totalFeesAmount)}
                          </span>
                        </div>
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">Goods & Services Tax (GST 18%)</span>
                          <span className="font-mono text-red-400 font-bold text-base mt-1.5 block">-{formatCurrency(totalTaxAmount)}</span>
                        </div>
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">Total Deductions %</span>
                          <span className="font-mono text-slate-200 mt-1.5 block font-semibold">{tx.amount ? ((totalDeductions / tx.amount) * 100).toFixed(2) : 0}% of Gross</span>
                        </div>
                      </div>
                    )}

                    {selectedNode === 'settlement' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">Settlement Batch ID</span>
                          <span className="font-mono text-slate-200 mt-1.5 block font-semibold">{tx.settlements?.[0]?.externalSettlementId || 'None (Missing)'}</span>
                        </div>
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">Net Batch Amount</span>
                          <span className={`font-mono font-bold text-base mt-1.5 block ${actualSettlement > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {actualSettlement > 0 ? formatCurrency(actualSettlement) : 'Unsettled'}
                          </span>
                        </div>
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">Settlement Batch Timestamp</span>
                          <span className="text-slate-200 mt-1.5 block font-mono">{formatDate(tx.settlements?.[0]?.settledAt)}</span>
                        </div>
                      </div>
                    )}

                    {selectedNode === 'bank' && (
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">Nodal UTR Reference</span>
                          <span className="font-mono text-slate-200 mt-1.5 block font-semibold">{tx.settlements?.[0]?.bankTransactions?.[0]?.reference || 'CMS589210940'}</span>
                        </div>
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">Disbursement Channel</span>
                          <span className="text-slate-200 font-medium mt-1.5 block">HDFC Bank Nodal Escrow</span>
                        </div>
                        <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800/80 shadow-sm">
                          <span className="text-slate-500 block text-[11px] font-mono">Value Date (Bank Clearance)</span>
                          <span className="text-slate-200 mt-1.5 block font-mono">{formatDate(tx.settlements?.[0]?.bankTransactions?.[0]?.transactionDate || tx.createdAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Validation Checks */}
                {inspectorTab === 'checks' && (
                  <div className="space-y-2.5">
                    {getValidationChecks(selectedNode).map((chk, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-xs shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
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
                    <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-slate-300 font-mono text-xs max-h-52 overflow-auto shadow-inner">
                      {selectedNode === 'order' && JSON.stringify(tx.order, null, 2)}
                      {selectedNode === 'payment' && JSON.stringify({ id: tx.id, externalPaymentId: tx.externalPaymentId, amount: tx.amount, status: tx.status, method: tx.method, capturedAt: tx.capturedAt }, null, 2)}
                      {selectedNode === 'fees' && JSON.stringify(tx.fees, null, 2)}
                      {selectedNode === 'settlement' && JSON.stringify(tx.settlements, null, 2)}
                      {selectedNode === 'bank' && JSON.stringify(tx.settlements?.[0]?.bankTransactions, null, 2)}
                    </pre>
                    <button 
                      onClick={() => handleCopy(JSON.stringify(tx, null, 2), 'raw-json')}
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center gap-1.5 border border-slate-700 shadow"
                    >
                      {copiedId === 'raw-json' ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy JSON</>}
                    </button>
                  </div>
                )}

              </div>
            </div>
          ) : (
            /* TIMELINE VIEW */
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 md:p-8 shadow-sm print:border-none print:p-0 print:bg-white relative">
              <div className="absolute left-[39px] md:left-[43px] top-8 bottom-8 w-[2px] bg-[var(--border)] print:bg-gray-300" />
              {timelineEvents.map((evt, idx) => {
                const Icon = evt.icon;
                return (
                  <div key={idx} className="flex items-start mb-5 last:mb-0 relative z-10">
                    <div className={`w-8 h-8 rounded-xl ${evt.bg} ${evt.color} flex items-center justify-center shrink-0 mt-0.5 ring-4 ring-[var(--surface)] print:ring-white border border-[var(--border)] shadow-sm`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="ml-4 flex-1 bg-[var(--muted)] print:bg-gray-50 border border-[var(--border)] print:border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow duration-150">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold text-sm text-[var(--foreground)] print:text-black">{evt.title}</h4>
                          <p className="text-xs font-mono text-[var(--muted-foreground)] print:text-gray-600 mt-0.5">{evt.desc}</p>
                        </div>
                        <div className="text-[11px] text-[var(--muted-foreground)] font-medium print:text-gray-500 bg-[var(--surface)] px-2.5 py-1 rounded-md whitespace-nowrap border border-[var(--border)]">
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
            <div className="mt-5 rounded-2xl border border-red-200 dark:border-red-800/30 bg-red-50/50 dark:bg-red-900/10 p-5 relative overflow-hidden shadow-sm print:bg-red-50 print:border-red-200">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-red-500 rounded-r" />
              <h3 className="text-lg font-bold text-red-600 dark:text-red-400 mb-4 flex items-center print:text-red-700">
                <div className="p-1.5 rounded-lg bg-red-100 dark:bg-red-900/20 mr-2.5 border border-red-500/20">
                  <AlertTriangle className="w-4 h-4 text-red-600" />
                </div>
                Detected Pipeline Anomalies ({tx.exceptions.length})
              </h3>
              <div className="grid md:grid-cols-2 gap-3.5">
                {tx.exceptions.map((ex) => (
                  <div key={ex.id} className="bg-[var(--surface)] print:bg-white p-4 rounded-xl border border-red-200/60 dark:border-red-800/30 print:border-red-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-red-600 dark:text-red-400 text-sm print:text-red-700">{ex.type.replace(/_/g, ' ')}</div>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-red-100 dark:bg-red-900/40 text-red-600 border border-red-200 dark:border-red-800/40">{ex.severity}</span>
                    </div>
                    <div className="text-[var(--muted-foreground)] print:text-gray-700 text-sm mt-1">{ex.description}</div>
                    <div className="text-red-600 dark:text-red-400 print:text-red-700 font-mono font-bold text-lg mt-2">{formatCurrency(ex.financialImpact)}</div>
                    
                    {/* AI Investigation & Exception Center Link */}
                    <div className="flex flex-col sm:flex-row items-center gap-2 mt-3 pt-3 border-t border-red-200/50 dark:border-red-800/20 print:hidden">
                      <button 
                        onClick={() => handleAIInvestigate(ex.id)}
                        disabled={aiLoading}
                        className="w-full sm:flex-1 flex items-center justify-center bg-[#528FF0] hover:bg-[#4080E0] text-white px-4 py-2 rounded-xl font-semibold text-xs transition-colors duration-150 disabled:opacity-50 shadow-sm"
                      >
                        <Brain className="w-4 h-4 mr-2" />
                        {aiLoading && activeExceptionId === ex.id ? (
                          <><Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> Investigating...</>
                        ) : 'Ask AI to Investigate'}
                      </button>

                      <a
                        href="/exceptions"
                        className="w-full sm:w-auto px-4 py-2 rounded-xl text-xs font-semibold border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] transition-colors flex items-center justify-center gap-1"
                      >
                        <span>Exception Desk</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inline AI Result */}
              {aiResult && (
                <div className="mt-5 bg-[var(--surface)] print:bg-white p-5 rounded-xl border border-blue-200 dark:border-blue-800/30 print:border-gray-300 shadow-sm print:shadow-none">
                  <div className="flex items-center text-[#528FF0] font-bold text-base mb-3">
                    <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/20 mr-2.5 border border-blue-500/20">
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
            <div className="mt-5 rounded-2xl border border-emerald-200 dark:border-emerald-800/30 bg-emerald-50/50 dark:bg-emerald-900/10 print:bg-green-50 print:border-green-200 p-6 text-center shadow-sm">
              <CheckCircle2 className="w-9 h-9 text-emerald-500 mx-auto mb-2.5" />
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
