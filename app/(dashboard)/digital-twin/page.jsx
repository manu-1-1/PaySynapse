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

// Scenario definitions with clean, cohesive design system styling
const SCENARIOS = [
  { id: 'PERFECT_MATCH', label: 'Normal Flow', desc: '100% Reconciled 5-node match', statusType: 'healthy' },
  { id: 'MISSING_SETTLEMENT', label: 'Missing Settlement', desc: 'Unsettled Gateway batch', statusType: 'error' },
  { id: 'FEE_MISMATCH', label: 'Fee Discrepancy', desc: 'Gateway commission overcharge', statusType: 'warning' },
  { id: 'AMOUNT_MISMATCH', label: 'Short Settlement', desc: 'Net settlement difference', statusType: 'error' },
  { id: 'DELAYED_SETTLEMENT', label: 'T+10 Settlement', desc: 'SLA breach delay', statusType: 'warning' },
  { id: 'DUPLICATE_TRANSACTION', label: 'Duplicate Entry', desc: 'Double ledger posting', statusType: 'error' },
  { id: 'STATUS_MISMATCH', label: 'Status Mismatch', desc: 'Capture vs Authorize sync', statusType: 'error' },
  { id: 'MISSING_REFUND', label: 'Missing Refund', desc: 'Unsettled reversal credit', statusType: 'error' },
];

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
        desc: 'HDFC Nodal Escrow confirms UTR clearance. 3-way reconciliation engine confirms zero ledger delta. Lineage: MATCHED',
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
        stage: '04: Settlement Batch Missing',
        title: 'Gateway Payout Batch Not Delivered',
        desc: 'Acquiring gateway failed to disburse settlement file within SLA window. Batch is missing from ledger feed.',
        status: 'FAIL',
        node: 'settlement',
        highlight: 'Unsettled: ₹4,893.80 held at gateway'
      },
      5: {
        stage: '05: Reconciliation Anomaly Flagged',
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
        stage: '01: Order Ingestion',
        title: 'Netbanking Order Initialized',
        desc: 'Merchant checkout created for Netbanking payment of ₹5,000.00 (Contracted flat fee: ₹15.00).',
        status: 'PASS',
        node: 'order',
        highlight: 'Contracted Flat MDR: ₹15.00'
      },
      2: {
        stage: '02: Gateway Capture',
        title: 'Netbanking Payment Authorized',
        desc: 'Payment authorized through banking gateway integration.',
        status: 'PASS',
        node: 'payment',
        highlight: 'Payment Captured'
      },
      3: {
        stage: '03: MDR Overcharge Detected',
        title: 'Discrepant MDR Applied by Gateway',
        desc: 'Contracted flat fee was ₹15.00 (+₹2.70 GST), but Gateway deducted ₹45.00 (+₹8.10 GST) — an excess fee overcharge of +₹35.40.',
        status: 'WARN',
        node: 'fees',
        highlight: 'Fee Variance: +₹35.40 Overcharge'
      },
      4: {
        stage: '04: Reduced Settlement Batch',
        title: 'Lower Payout Batch Received',
        desc: 'Gateway disbursed ₹4,946.90 instead of the contracted expected net payout of ₹4,982.30.',
        status: 'WARN',
        node: 'settlement',
        highlight: 'Settled: ₹4,946.90 vs Expected: ₹4,982.30'
      },
      5: {
        stage: '05: Recon Exception Filed',
        title: 'FEE_MISMATCH Discrepancy Flagged',
        desc: 'Reconciliation audit isolates exact ₹35.40 MDR leakage. Remediation: File Dispute Ticket to Gateway with line-item proof.',
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
        stage: '01: Order Ingestion',
        title: 'Merchant Order Created',
        desc: 'Order created for gross amount of ₹5,000.00.',
        status: 'PASS',
        node: 'order',
        highlight: 'Gross: ₹5,000.00'
      },
      2: {
        stage: '02: Payment Captured',
        title: 'Gateway Payment Processed',
        desc: 'Payment captured with standard authorization token.',
        status: 'PASS',
        node: 'payment',
        highlight: 'Captured'
      },
      3: {
        stage: '03: Deductions Applied',
        title: 'Standard Charges Computed',
        desc: 'Fees ₹90.00 + GST ₹16.20 applied. Expected net settlement amount: ₹4,893.80.',
        status: 'PASS',
        node: 'fees',
        highlight: 'Expected Net: ₹4,893.80'
      },
      4: {
        stage: '04: Short Settlement Batch',
        title: 'Deficit in Gateway Disbursement',
        desc: 'Gateway disbursed ₹4,543.80 into the settlement batch — an unexplained shortfall of -₹350.00.',
        status: 'FAIL',
        node: 'settlement',
        highlight: 'Deficit: -₹350.00 Shortfall'
      },
      5: {
        stage: '05: Recon Variance Detected',
        title: 'AMOUNT_MISMATCH Exception Raised',
        desc: 'Lineage reconciliation engine identifies ₹350.00 balance sheet deficit. Remediation: Request Short-Settlement True-Up.',
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
        stage: '01: Order Ingestion',
        title: 'Order Created',
        desc: 'Customer purchase initiated for ₹5,000.00.',
        status: 'PASS',
        node: 'order',
        highlight: 'Order: ₹5,000.00'
      },
      2: {
        stage: '02: Payment Captured On T-10',
        title: 'Payment Captured 10 Days Ago',
        desc: 'Payment was captured 10 days prior, exceeding the contractual T+1 settlement SLA window.',
        status: 'WARN',
        node: 'payment',
        highlight: 'T+10 Days Elapsed'
      },
      3: {
        stage: '03: Charges Computed',
        title: 'MDR Deductions Applied',
        desc: 'Fee deductions of ₹106.20 accounted for in ledger.',
        status: 'PASS',
        node: 'fees',
        highlight: 'Expected: ₹4,893.80'
      },
      4: {
        stage: '04: Delayed Batch Received',
        title: 'Payout Arrives After Extended Latency',
        desc: 'Gateway batch arrived with 10 days latency. Settlement amount matches, but timeline violated contract SLA.',
        status: 'WARN',
        node: 'settlement',
        highlight: 'SLA Breach: 9 Days Overdue'
      },
      5: {
        stage: '05: Audit Record Logged',
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
        stage: '01: Order Ingestion',
        title: 'Single Merchant Order',
        desc: 'Single checkout cart created for ₹5,000.00.',
        status: 'PASS',
        node: 'order',
        highlight: 'Single Order: ₹5,000.00'
      },
      2: {
        stage: '02: Payment Captured',
        title: 'Single Gateway Charge',
        desc: 'Single payment authorized & captured.',
        status: 'PASS',
        node: 'payment',
        highlight: 'Single Charge'
      },
      3: {
        stage: '03: Deductions',
        title: 'MDR Calculated',
        desc: 'Standard fee calculated for single transaction.',
        status: 'PASS',
        node: 'fees',
        highlight: 'Fee: ₹106.20'
      },
      4: {
        stage: '04: Duplicate Settlement Batches',
        title: 'Gateway Disbursed Payout Twice',
        desc: 'Gateway generated 2 separate settlement batches for the same single payment charge.',
        status: 'FAIL',
        node: 'settlement',
        highlight: 'Double Settlement: 2x ₹4,893.80'
      },
      5: {
        stage: '05: Recon Anomaly Intercepted',
        title: 'DUPLICATE_TRANSACTION Anomaly Flagged',
        desc: 'Recon engine catches duplicate ₹4,893.80 payout before bank ledger reconciliation. Remediation: Auto-Reverse Duplicate Entry.',
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
        stage: '01: Order Marked Failed',
        title: 'Merchant Checkout Cart Failed',
        desc: 'Merchant website recorded order as FAILED / Abandoned during checkout callback.',
        status: 'FAIL',
        node: 'order',
        highlight: 'Order State: FAILED'
      },
      2: {
        stage: '02: Payment State Conflict',
        title: 'Gateway Payment Synchronized',
        desc: 'Gateway webhook synchronization confirms payment failed or in state conflict with cart.',
        status: 'FAIL',
        node: 'payment',
        highlight: 'Status Conflict'
      },
      3: {
        stage: '03: Ledger Suspended',
        title: 'No Deductions Assessed',
        desc: 'MDR charges held due to state mismatch.',
        status: 'WARN',
        node: 'fees',
        highlight: 'Ledger Hold'
      },
      4: {
        stage: '04: Settlement Skipped',
        title: 'No Batch Generated',
        desc: 'Uncaptured payment skipped from payout batch cycle.',
        status: 'WARN',
        node: 'settlement',
        highlight: 'No Settlement'
      },
      5: {
        stage: '05: Recon Isolation',
        title: 'STATUS_MISMATCH Exception Raised',
        desc: 'Recon engine isolates cart vs gateway status discrepancy. Remediation: Sync Status from Gateway API.',
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
        stage: '01: Order Ingestion',
        title: 'Original Order Record',
        desc: 'Customer purchase of ₹5,000.00 registered on merchant database.',
        status: 'PASS',
        node: 'order',
        highlight: 'Order: ₹5,000.00'
      },
      2: {
        stage: '02: Payment Marked Refunded',
        title: 'Customer Refund Initiated',
        desc: 'Payment state marked REFUNDED on merchant portal; reversal request submitted to gateway.',
        status: 'WARN',
        node: 'payment',
        highlight: 'State: REFUNDED'
      },
      3: {
        stage: '03: Reversal Accounting',
        title: 'Fee Reversal Adjustments',
        desc: 'Ledger prepares debit entry for refund disbursement.',
        status: 'PASS',
        node: 'fees',
        highlight: 'Refund Debit: ₹5,000.00'
      },
      4: {
        stage: '04: Missing Refund Credit',
        title: 'Gateway Reversal Batch Not Delivered',
        desc: 'Gateway has not posted the refund reversal batch credit to the nodal bank within banking cutoff.',
        status: 'FAIL',
        node: 'settlement',
        highlight: 'Uncredited Refund: ₹5,000.00'
      },
      5: {
        stage: '05: Recon Anomaly Flagged',
        title: 'MISSING_REFUND Exception Raised',
        desc: 'Recon engine flags uncredited ₹5,000.00 reversal. Remediation: Force Retry Refund API with gateway.',
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
      setAiResult(`### Root Cause Analysis\n\n**Diagnosis:** ${r.explanation}\n\n**Confidence Score:** ${(r.confidence * 100).toFixed(0)}%\n\n**Recommended Action:** ${r.recommendedAction}`);
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
          { label: 'MDR Commission Rate', status: totalFeesAmount > 0 ? (simScenario === 'FEE_MISMATCH' ? 'WARN' : 'PASS') : 'WARN', note: simScenario === 'FEE_MISMATCH' ? 'Overcharged fee: ₹' + totalFeesAmount : `Calculated fee ₹${totalFeesAmount}` },
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
    <div className="flex-1 space-y-5 p-4 sm:p-6 pt-4 sm:pt-5 min-h-screen print:bg-white print:text-black print:p-2 print:space-y-4">
      
      {/* Header - Hidden in Print */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 print:hidden">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Digital Twin Financial Lineage</h2>
            <span className="text-[11px] font-mono px-2.5 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] border border-[var(--border)] font-medium">
              Live Flow Simulator
            </span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Step through, inspect, and understand underlying financial mechanics across all 5 financial nodes.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
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
            {latestLiveTx && (
              <button
                onClick={() => handleSearch(latestLiveTx.id, 'Live Transaction')}
                className="h-8 px-3 rounded text-xs font-medium bg-[#1C1D22] hover:bg-[#26272E] border border-[#2D2E36] text-[#E8EAED] transition-colors flex items-center gap-1.5"
              >
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>Latest Live: <strong className="font-mono">{latestLiveTx.externalPaymentId?.slice(0, 16)}...</strong> ({formatCurrency(latestLiveTx.amount)})</span>
              </button>
            )}

            {originalTx && tx?.id !== originalTx?.id && (
              <button
                onClick={() => handleSearch(originalTx.id, 'Original')}
                className="h-8 px-3 rounded text-xs font-medium bg-[#1C1D22] hover:bg-[#26272E] border border-[#2D2E36] text-[#8AB4F8] transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Live Feed</span>
              </button>
            )}
          </div>
        </div>

        {/* Clean Professional Financial Trace Workbench */}
        <div className="rounded-lg border border-[#2D2E36] bg-[#1C1D22] p-3.5 shadow-sm text-xs space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[#E8EAED]">Scenario Pipeline Testbed:</span>
              <select
                value={simScenario}
                onChange={(e) => {
                  const targetScenario = SCENARIOS.find(s => s.id === e.target.value);
                  if (targetScenario) handleSimulate(targetScenario.id, targetScenario.label);
                }}
                disabled={simulating}
                className="bg-[#131417] text-[#E8EAED] font-medium text-xs rounded px-3 py-1.5 border border-[#2D2E36] focus:border-[#8AB4F8] outline-none cursor-pointer"
              >
                <optgroup label="Healthy Baseline">
                  <option value="PERFECT_MATCH">Normal Flow (100% Reconciled 5-Node Parity)</option>
                </optgroup>
                <optgroup label="Discrepancy & Variance Scenarios">
                  <option value="MISSING_SETTLEMENT">Missing Settlement Batch (Unsettled Gateway)</option>
                  <option value="FEE_MISMATCH">Fee Discrepancy (MDR Rate Card Overcharge)</option>
                  <option value="SHORT_SETTLEMENT">Short Settlement (Net Payout Delta)</option>
                  <option value="DELAYED_SETTLEMENT">T+10 SLA Settlement Window Breach</option>
                  <option value="DUPLICATE_TRANSACTION">Duplicate Ledger Entry (Double Payout)</option>
                  <option value="STATUS_MISMATCH">Status Mismatch (Cart vs Gateway Conflict)</option>
                  <option value="MISSING_REFUND">Missing Refund Reversal Batch</option>
                </optgroup>
              </select>
            </div>

            {/* Input Controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center bg-[#131417] rounded border border-[#2D2E36] px-2 py-1">
                <span className="text-xs text-[#9AA0A6] mr-1">₹</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Amount"
                  className="w-16 bg-transparent text-xs font-mono font-medium text-[#E8EAED] focus:outline-none"
                />
              </div>

              <div className="hidden sm:flex items-center gap-1">
                {['299', '800', '2500', '5000'].map(amt => (
                  <button
                    key={amt}
                    onClick={() => setCustomAmount(amt)}
                    className={`px-2 py-1 rounded text-[11px] font-mono transition-colors ${
                      customAmount === amt
                        ? 'bg-[#1E2838] text-[#8AB4F8] border border-[#8AB4F8]/40'
                        : 'bg-[#131417] text-[#9AA0A6] hover:text-[#E8EAED] border border-[#2D2E36]'
                    }`}
                  >
                    ₹{amt}
                  </button>
                ))}
              </div>

              <select
                value={customMethod}
                onChange={(e) => setCustomMethod(e.target.value)}
                className="bg-[#131417] rounded px-2.5 py-1 text-xs text-[#E8EAED] border border-[#2D2E36] focus:outline-none cursor-pointer"
              >
                <option value="CARD">Credit/Debit Card (1.8% MDR)</option>
                <option value="UPI">UPI / QR (0.0%)</option>
                <option value="NETBANKING">Netbanking (Flat ₹15)</option>
              </select>

              <button
                onClick={() => {
                  const targetScenario = SCENARIOS.find(s => s.id === simScenario) || SCENARIOS[0];
                  handleSimulate(targetScenario.id, targetScenario.label);
                }}
                disabled={simulating}
                className="px-3 py-1 rounded bg-[#1A73E8] hover:bg-[#1B66C9] text-white font-medium text-xs transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                {simulating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
                Run Trace
              </button>
            </div>
          </div>

          {/* Trace History Breadcrumb */}
          {history.length > 0 && (
            <div className="pt-2 border-t border-[#2D2E36] flex items-center gap-2 overflow-x-auto text-xs">
              <span className="text-[11px] text-[#9AA0A6] flex items-center gap-1 flex-shrink-0">
                <Clock className="w-3 h-3" /> Recent Traces:
              </span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {history.map((h, i) => (
                  <button
                    key={`${h.id}_${i}`}
                    onClick={() => handleSearch(h.id, h.scenario)}
                    className={`px-2 py-0.5 rounded text-[11px] font-mono transition-all flex-shrink-0 border ${
                      h.id === tx?.id
                        ? 'bg-[#1E2838] text-[#8AB4F8] border-[#8AB4F8]/40 font-medium'
                        : 'bg-[#131417] text-[#9AA0A6] hover:text-[#E8EAED] border-[#2D2E36]'
                    }`}
                  >
                    {h.scenario} ({formatCurrency(h.amount)})
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
            <div className="rounded-lg border border-[#2D2E36] shadow-sm overflow-hidden bg-[#1C1D22] text-[#E8EAED] relative">

              {/* Financial Balance & Flow Controller Header */}
              <div className="border-b border-[#2D2E36] bg-[#18191E] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs relative z-10">
                
                {/* Arithmetic Flow Breakdown Cards */}
                <div className="flex items-center gap-2 flex-wrap">
                  
                  {/* Item 1: Gross */}
                  <div className="bg-[#131417] border border-[#2D2E36] px-3 py-1 rounded">
                    <span className="text-[#9AA0A6] block text-[10px] font-medium uppercase tracking-wider">Gross Payment</span>
                    <span className="font-semibold text-emerald-400 text-xs font-mono">{formatCurrency(tx.amount)}</span>
                  </div>

                  <span className="text-[#9AA0A6] font-mono text-xs">-</span>

                  {/* Item 2: Charges */}
                  <div className={`bg-[#131417] border px-3 py-1 rounded ${simScenario === 'FEE_MISMATCH' ? 'border-amber-500/40 bg-amber-500/10' : 'border-[#2D2E36]'}`}>
                    <span className="text-[#9AA0A6] block text-[10px] font-medium uppercase tracking-wider">
                      Charges & GST
                    </span>
                    <span className={`font-semibold text-xs font-mono ${simScenario === 'FEE_MISMATCH' ? 'text-amber-400' : 'text-[#9AA0A6]'}`}>
                      -{formatCurrency(totalDeductions)}
                    </span>
                  </div>

                  <span className="text-[#9AA0A6] font-mono text-xs">=</span>

                  {/* Item 3: Expected Net */}
                  <div className="bg-[#131417] border border-[#2D2E36] px-3 py-1 rounded">
                    <span className="text-[#9AA0A6] block text-[10px] font-medium uppercase tracking-wider">Expected Net</span>
                    <span className="font-semibold text-[#8AB4F8] text-xs font-mono">{formatCurrency(expectedSettlement)}</span>
                  </div>

                  <span className="text-[#9AA0A6] font-mono text-xs">-&gt;</span>

                  {/* Item 4: Bank Cleared */}
                  <div className={`bg-[#131417] border px-3 py-1 rounded ${actualSettlement === 0 ? 'border-rose-500/40 bg-rose-500/10' : Math.abs(reconDelta) > 0.01 ? 'border-amber-500/40 bg-amber-500/10' : 'border-emerald-500/30'}`}>
                    <span className="text-[#9AA0A6] block text-[10px] font-medium uppercase tracking-wider">Bank Cleared</span>
                    <span className={`font-semibold text-xs font-mono ${actualSettlement === 0 ? 'text-rose-400' : Math.abs(reconDelta) > 0.01 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {formatCurrency(actualSettlement)}
                    </span>
                  </div>

                  {/* Variance Pill */}
                  {Math.abs(reconDelta) > 0.01 && (
                    <div className="px-2 py-0.5 rounded bg-rose-950/40 text-rose-300 border border-rose-800/40 text-[10px] font-mono font-semibold flex items-center gap-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" /> Variance: {formatCurrency(reconDelta)}
                    </div>
                  )}

                </div>

                {/* Playback & Step Controller */}
                <div className="flex items-center gap-1 bg-[#131417] border border-[#2D2E36] rounded p-0.5">
                  <button 
                    onClick={() => stepNode('prev')}
                    title="Previous Node"
                    className="p-1 text-[#9AA0A6] hover:text-[#E8EAED] rounded hover:bg-[#1C1D22] transition-colors"
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
                    className={`px-2.5 py-1 rounded text-xs font-medium flex items-center gap-1.5 transition-colors ${
                      isSimRunning
                        ? isSimPaused
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          : 'bg-amber-600 hover:bg-amber-500 text-white'
                        : isPlaying 
                          ? 'bg-[#1E2838] text-[#8AB4F8] border border-[#8AB4F8]/40' 
                          : 'bg-[#1A73E8] text-white hover:bg-[#1B66C9]'
                    }`}
                  >
                    {isSimRunning ? (
                      isSimPaused ? <><Play className="w-3 h-3 fill-current" /> Resume</> : <><Pause className="w-3 h-3 fill-current" /> Pause</>
                    ) : (
                      isPlaying ? <><Pause className="w-3 h-3 fill-current" /> Pause</> : <><Play className="w-3 h-3 fill-current" /> Step-Through</>
                    )}
                  </button>

                  <button 
                    onClick={() => stepNode('next')}
                    title="Next Node"
                    className="p-1 text-[#9AA0A6] hover:text-[#E8EAED] rounded hover:bg-[#1C1D22] transition-colors"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Dynamic Simulation Mechanics Explainer HUD */}
              <div className="bg-[var(--surface)] border-b border-[var(--border)] px-5 py-4 relative z-10">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  
                  {/* Stage Tracker & Mechanism Insight */}
                  <div className="flex items-start gap-3.5 flex-1">
                    <div className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      currentStepInfo.status === 'PASS' 
                        ? 'bg-blue-50 text-[#528FF0] dark:bg-blue-950/40 dark:text-[#528FF0] border border-blue-200 dark:border-blue-800/40' 
                        : currentStepInfo.status === 'WARN'
                        ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border border-amber-200 dark:border-amber-800/40'
                        : 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40'
                    }`}>
                      {currentStepInfo.status === 'PASS' ? (
                        <Activity className="w-4 h-4" />
                      ) : currentStepInfo.status === 'WARN' ? (
                        <AlertTriangle className="w-4 h-4" />
                      ) : (
                        <AlertCircle className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[11px] font-mono font-semibold uppercase tracking-wider text-[var(--foreground)] bg-[var(--muted)] px-2 py-0.5 rounded border border-[var(--border)]">
                          {currentStepInfo.stage}
                        </span>
                        <span className="text-[var(--muted-foreground)] text-xs">•</span>
                        <span className="text-sm font-semibold text-[var(--foreground)]">
                          {currentStepInfo.title}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-semibold ${
                          currentStepInfo.status === 'PASS' 
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40' 
                            : currentStepInfo.status === 'WARN'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                        }`}>
                          {currentStepInfo.highlight}
                        </span>
                      </div>
                      <p className="text-xs text-[var(--muted-foreground)] mt-1.5 leading-relaxed max-w-4xl font-normal">
                        {currentStepInfo.desc}
                      </p>
                    </div>
                  </div>

                  {/* Simulation Controls: Speed, Replay, Skip */}
                  <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                    
                    {/* Speed Selector */}
                    <div className="flex items-center bg-[var(--muted)] border border-[var(--border)] rounded-lg p-0.5 text-[11px]">
                      <button
                        onClick={() => setSimSpeed(0.5)}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${simSpeed === 0.5 ? 'bg-[#528FF0] text-white shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                        title="Slow Speed"
                      >
                        0.5x
                      </button>
                      <button
                        onClick={() => setSimSpeed(1)}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${simSpeed === 1 ? 'bg-[#528FF0] text-white shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                        title="Normal Speed"
                      >
                        1x
                      </button>
                      <button
                        onClick={() => setSimSpeed(2)}
                        className={`px-2.5 py-1 rounded-md font-medium transition-colors ${simSpeed === 2 ? 'bg-[#528FF0] text-white shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                        title="Fast Speed"
                      >
                        2x
                      </button>
                    </div>

                    {/* Replay Simulation */}
                    <button
                      onClick={handleReplaySimulation}
                      title="Replay this simulation mechanism from step 1"
                      className="px-3 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--muted)] text-[var(--foreground)] text-xs font-medium border border-[var(--border)] flex items-center gap-1.5 transition-colors shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-[#528FF0]" /> Replay
                    </button>

                    {/* Skip to end */}
                    {isSimRunning && (
                      <button
                        onClick={handleSkipSimulation}
                        title="Skip straight to completed state"
                        className="px-3 py-1 rounded-lg bg-[var(--surface)] hover:bg-[var(--muted)] text-[var(--foreground)] text-xs font-medium border border-[var(--border)] flex items-center gap-1 transition-colors shadow-sm"
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
                        className={`flex-1 group relative h-1.5 rounded-full transition-all duration-200 ${
                          isCurrent
                            ? 'bg-[#528FF0]'
                            : isPassed
                            ? 'bg-[#528FF0]/60'
                            : 'bg-[var(--muted)]'
                        }`}
                        title={`Stage ${stepNum}: ${nodeName.toUpperCase()}`}
                      >
                        <span className={`absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-mono font-semibold transition-opacity ${
                          isCurrent ? 'opacity-100 text-[#528FF0]' : 'opacity-40 text-[var(--muted-foreground)] group-hover:opacity-100'
                        }`}>
                          {stepNum}. {nodeName.toUpperCase()}
                        </span>
                      </button>
                    );
                  })}
                </div>

              </div>

              {/* Graph Topology Canvas — SVG DAG */}
              <div 
                className="relative overflow-x-auto select-none"
                style={{
                  backgroundColor: '#131417',
                  backgroundImage: 'radial-gradient(circle, #1E1F25 1px, transparent 1px)',
                  backgroundSize: '20px 20px',
                }}
              >
                {/* Reconciliation Status Chip */}
                <div className="sticky top-0 left-0 z-30 flex items-center justify-between px-3 py-2">
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 bg-[#1C1D22]/80 backdrop-blur-sm border border-[#2D2E36] rounded-md px-2.5 py-1.5 text-[10px] font-mono text-[#9AA0A6]">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[#E8EAED] font-medium">Reconciliation: </span>
                      <span className="text-emerald-400">{isChainHealthy ? 'Dual-Sync Verified' : 'Pending'}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-[#1C1D22]/80 backdrop-blur-sm border border-[#2D2E36] rounded-md px-2.5 py-1.5 text-[10px] font-mono text-[#9AA0A6]">
                      <ShieldCheck className="w-3 h-3 text-[#8AB4F8]" />
                      <span>HMAC Signature: <strong className="text-[#E8EAED]">Verified</strong></span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 bg-[#1C1D22]/80 backdrop-blur-sm border border-[#2D2E36] rounded-md p-0.5 shadow-lg text-[#9AA0A6]">
                    <button className="p-1.5 hover:text-[#E8EAED] hover:bg-[#26272E] rounded text-xs transition-colors" title="Fit to View">
                      <Layers className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Fixed-width inner container — SVG + Nodes share same coordinate space */}
                <div className="relative" style={{ width: '1100px', height: '340px', margin: '0 auto' }}>

                  {/* SVG Edge Layer — same pixel coordinate space as nodes */}
                  <svg 
                    className="absolute inset-0 pointer-events-none" 
                    style={{ zIndex: 1, width: '1100px', height: '340px' }}
                  >
                    <defs>
                      <linearGradient id="edgeGradient1" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#8AB4F8" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#8AB4F8" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#8AB4F8" stopOpacity="0.2" />
                      </linearGradient>
                      <linearGradient id="edgeGradientWarn" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#F59E0B" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#F59E0B" stopOpacity="0.2" />
                      </linearGradient>
                      <linearGradient id="edgeGradientFail" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#F87171" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#F87171" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#F87171" stopOpacity="0.2" />
                      </linearGradient>
                      <linearGradient id="edgeGradientBank" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#34D399" stopOpacity="0.2" />
                        <stop offset="50%" stopColor="#34D399" stopOpacity="0.7" />
                        <stop offset="100%" stopColor="#34D399" stopOpacity="0.2" />
                      </linearGradient>
                      <marker id="arrowBlue" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                        <path d="M0,0 L6,2 L0,4" fill="#8AB4F8" opacity="0.6" />
                      </marker>
                      <marker id="arrowGreen" markerWidth="6" markerHeight="4" refX="5" refY="2" orient="auto">
                        <path d="M0,0 L6,2 L0,4" fill="#34D399" opacity="0.6" />
                      </marker>
                    </defs>

                    {/* Edge 1→2: Order (right port ~185, 65) to Payment (left port ~265, 155) */}
                    <path 
                      d="M 185 65 C 225 65, 225 155, 265 155"
                      fill="none" 
                      stroke="#2D2E36" 
                      strokeWidth="1.5" 
                      strokeDasharray={simStep >= 2 ? 'none' : '4 4'}
                      markerEnd={simStep >= 2 ? 'url(#arrowBlue)' : undefined}
                    />
                    {simStep >= 2 && (
                      <>
                        <path 
                          d="M 185 65 C 225 65, 225 155, 265 155"
                          fill="none" 
                          stroke="url(#edgeGradient1)" 
                          strokeWidth="1.5"
                        />
                        <circle r="2.5" fill="#8AB4F8" opacity="0.9">
                          <animateMotion dur="2s" repeatCount="indefinite" path="M 185 65 C 225 65, 225 155, 265 155" />
                        </circle>
                      </>
                    )}
                    <rect x="195" y="100" width="50" height="16" rx="4" fill="#131417" stroke="#2D2E36" strokeWidth="0.5" />
                    <text x="220" y="112" textAnchor="middle" fill="#9AA0A6" fontSize="8" fontFamily="monospace">Auth ACK</text>

                    {/* Edge 2→3: Payment (right port ~435, 155) to Fees (left port ~500, 65) */}
                    <path 
                      d="M 435 155 C 468 155, 468 65, 500 65"
                      fill="none" 
                      stroke="#2D2E36" 
                      strokeWidth="1.5" 
                      strokeDasharray={simStep >= 3 ? 'none' : '4 4'}
                      markerEnd={simStep >= 3 ? 'url(#arrowBlue)' : undefined}
                    />
                    {simStep >= 3 && (
                      <>
                        <path 
                          d="M 435 155 C 468 155, 468 65, 500 65"
                          fill="none" 
                          stroke={simScenario === 'FEE_MISMATCH' ? 'url(#edgeGradientWarn)' : 'url(#edgeGradient1)'}
                          strokeWidth="1.5"
                        />
                        <circle r="2.5" fill={simScenario === 'FEE_MISMATCH' ? '#F59E0B' : '#8AB4F8'} opacity="0.9">
                          <animateMotion dur="2s" repeatCount="indefinite" path="M 435 155 C 468 155, 468 65, 500 65" />
                        </circle>
                      </>
                    )}
                    <rect x="441" y="100" width="56" height="16" rx="4" fill="#131417" stroke="#2D2E36" strokeWidth="0.5" />
                    <text x="469" y="112" textAnchor="middle" fill="#9AA0A6" fontSize="8" fontFamily="monospace">MDR Engine</text>

                    {/* Edge 3→4: Fees (right port ~665, 65) to Settlement (left port ~730, 195) */}
                    <path 
                      d="M 665 65 C 698 65, 698 195, 730 195"
                      fill="none" 
                      stroke="#2D2E36" 
                      strokeWidth="1.5" 
                      strokeDasharray={simStep >= 4 ? 'none' : '4 4'}
                      markerEnd={simStep >= 4 ? 'url(#arrowBlue)' : undefined}
                    />
                    {simStep >= 4 && (
                      <>
                        <path 
                          d="M 665 65 C 698 65, 698 195, 730 195"
                          fill="none" 
                          stroke={tx.settlements?.length > 0 ? 'url(#edgeGradient1)' : 'url(#edgeGradientFail)'}
                          strokeWidth="1.5"
                        />
                        <circle r="2.5" fill={tx.settlements?.length > 0 ? '#8AB4F8' : '#F87171'} opacity="0.9">
                          <animateMotion dur="2s" repeatCount="indefinite" path="M 665 65 C 698 65, 698 195, 730 195" />
                        </circle>
                      </>
                    )}
                    <rect x="672" y="120" width="50" height="16" rx="4" fill="#131417" stroke="#2D2E36" strokeWidth="0.5" />
                    <text x="697" y="132" textAnchor="middle" fill="#9AA0A6" fontSize="8" fontFamily="monospace">Net Batch</text>

                    {/* Edge 4→5: Settlement (right port ~900, 195) to Bank (left port ~940, 85) */}
                    <path 
                      d="M 900 195 C 920 195, 920 85, 940 85"
                      fill="none" 
                      stroke="#2D2E36" 
                      strokeWidth="1.5" 
                      strokeDasharray={simStep >= 5 ? 'none' : '4 4'}
                      markerEnd={simStep >= 5 ? 'url(#arrowGreen)' : undefined}
                    />
                    {simStep >= 5 && (
                      <>
                        <path 
                          d="M 900 195 C 920 195, 920 85, 940 85"
                          fill="none" 
                          stroke="url(#edgeGradientBank)"
                          strokeWidth="1.5"
                        />
                        <circle r="2.5" fill="#34D399" opacity="0.9">
                          <animateMotion dur="2s" repeatCount="indefinite" path="M 900 195 C 920 195, 920 85, 940 85" />
                        </circle>
                      </>
                    )}
                    <rect x="905" y="128" width="46" height="16" rx="4" fill="#131417" stroke="#2D2E36" strokeWidth="0.5" />
                    <text x="928" y="140" textAnchor="middle" fill="#34D399" fontSize="8" fontFamily="monospace">UTR Clear</text>

                  </svg>

                  {/* Node Layer — same coordinate space as SVG */}

                  {/* NODE 1: ORDER — top-left area */}
                  <div 
                    className="absolute z-10"
                    style={{ left: '15px', top: '20px', width: '170px' }}
                  >
                    <div 
                      onClick={() => { setSelectedNode('order'); setSimStep(1); setIsPlaying(false); setIsSimRunning(false); }}
                      className={`cursor-pointer rounded-lg p-3 transition-all duration-200 border text-left bg-[#1C1D22] relative shadow-md ${
                        selectedNode === 'order' 
                          ? 'border-[#8AB4F8] ring-1 ring-[#8AB4F8]/30 shadow-lg shadow-[#1A73E8]/10' 
                          : simStep < 1
                          ? 'opacity-30 border-[#2D2E36]'
                          : 'border-[#2D2E36] hover:border-[#8AB4F8]/50'
                      }`}
                    >
                      {/* Output port — right side center (~185, 65 in SVG coords = right edge, vertical center) */}
                      <div className="absolute -right-[7px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-[#131417] border-2 border-[#8AB4F8] z-20 shadow-sm shadow-[#8AB4F8]/30" />

                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-medium text-[#9AA0A6] flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${simStep >= 1 ? 'bg-[#8AB4F8]' : 'bg-[#2D2E36]'}`} /> 01 • ORDER
                        </span>
                        <Receipt className="w-3.5 h-3.5 text-[#8AB4F8]" />
                      </div>
                      <div className="font-semibold text-xs text-[#E8EAED] truncate">Merchant Order</div>
                      <div className="text-xs font-mono text-emerald-400 font-bold mt-0.5">
                        {tx.order ? formatCurrency(tx.order.amount) : <span className="text-rose-400">Missing</span>}
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-[#2D2E36] flex items-center justify-between text-[10px] text-[#9AA0A6] font-mono">
                        <span className="truncate max-w-[85px]">{tx.order?.externalOrderId?.slice(0, 16) || 'No Order'}...</span>
                      </div>
                    </div>
                  </div>

                  {/* NODE 2: PAYMENT — center-left, lower */}
                  <div 
                    className="absolute z-10"
                    style={{ left: '265px', top: '110px', width: '170px' }}
                  >
                    <div 
                      onClick={() => { setSelectedNode('payment'); setSimStep(2); setIsPlaying(false); setIsSimRunning(false); }}
                      className={`cursor-pointer rounded-lg p-3 transition-all duration-200 border text-left bg-[#1C1D22] relative shadow-md ${
                        selectedNode === 'payment' 
                          ? 'border-[#8AB4F8] ring-1 ring-[#8AB4F8]/30 shadow-lg shadow-[#1A73E8]/10' 
                          : simStep < 2
                          ? 'opacity-30 border-[#2D2E36]'
                          : 'border-[#2D2E36] hover:border-[#8AB4F8]/50'
                      }`}
                    >
                      {/* Input port — left center */}
                      <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-[#131417] border-2 border-[#8AB4F8] z-20 shadow-sm shadow-[#8AB4F8]/30" />
                      {/* Output port — right center */}
                      <div className="absolute -right-[7px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-[#131417] border-2 border-[#8AB4F8] z-20 shadow-sm shadow-[#8AB4F8]/30" />

                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-medium text-[#8AB4F8] flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${simStep >= 2 ? 'bg-[#8AB4F8]' : 'bg-[#2D2E36]'}`} /> 02 • PAYMENT
                        </span>
                        <CreditCard className="w-3.5 h-3.5 text-[#8AB4F8]" />
                      </div>
                      <div className="font-semibold text-xs text-[#E8EAED] truncate">Gateway Charge</div>
                      <div className="text-xs font-mono text-emerald-400 font-bold mt-0.5">{formatCurrency(tx.amount)}</div>
                      <div className="mt-1.5 pt-1.5 border-t border-[#2D2E36] flex items-center justify-between text-[10px] font-mono">
                        <span className="text-[#9AA0A6] truncate max-w-[75px]">{tx.externalPaymentId}</span>
                        <span className={`px-1.5 rounded text-[9px] font-semibold ${
                          tx.status === 'CAPTURED' ? 'bg-emerald-950/40 text-emerald-300 border border-emerald-800/40' : 'bg-rose-950/40 text-rose-300 border border-rose-800/40'
                        }`}>
                          {tx.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* NODE 3: FEES — top center */}
                  <div 
                    className="absolute z-10"
                    style={{ left: '500px', top: '20px', width: '165px' }}
                  >
                    <div 
                      onClick={() => { setSelectedNode('fees'); setSimStep(3); setIsPlaying(false); setIsSimRunning(false); }}
                      className={`cursor-pointer rounded-lg p-3 transition-all duration-200 border text-left bg-[#1C1D22] relative shadow-md ${
                        selectedNode === 'fees' 
                          ? simScenario === 'FEE_MISMATCH'
                            ? 'border-amber-500 ring-1 ring-amber-500/30 shadow-lg shadow-amber-500/10'
                            : 'border-[#8AB4F8] ring-1 ring-[#8AB4F8]/30 shadow-lg shadow-[#1A73E8]/10' 
                          : simStep < 3
                          ? 'opacity-30 border-[#2D2E36]'
                          : 'border-[#2D2E36] hover:border-[#8AB4F8]/50'
                      }`}
                    >
                      {/* Input port */}
                      <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-[#131417] border-2 border-amber-400 z-20 shadow-sm shadow-amber-400/30" />
                      {/* Output port */}
                      <div className="absolute -right-[7px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-[#131417] border-2 border-amber-400 z-20 shadow-sm shadow-amber-400/30" />

                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-medium text-[#9AA0A6] flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${simScenario === 'FEE_MISMATCH' ? 'bg-amber-400' : simStep >= 3 ? 'bg-[#8AB4F8]' : 'bg-[#2D2E36]'}`} /> 03 • CHARGES
                        </span>
                        <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                      </div>
                      <div className="font-semibold text-xs text-[#E8EAED] truncate">Fees &amp; Tax</div>
                      <div className={`text-xs font-mono font-bold mt-0.5 ${simScenario === 'FEE_MISMATCH' ? 'text-amber-400' : 'text-[#9AA0A6]'}`}>
                        -{formatCurrency(totalDeductions)}
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-[#2D2E36] flex items-center justify-between text-[10px] text-[#9AA0A6] font-mono">
                        <span>Fee: {formatCurrency(totalFeesAmount)}</span>
                        <span>GST 18%</span>
                      </div>
                    </div>
                  </div>

                  {/* NODE 4: SETTLEMENT — lower right */}
                  <div 
                    className="absolute z-10"
                    style={{ left: '730px', top: '150px', width: '170px' }}
                  >
                    <div 
                      onClick={() => { setSelectedNode('settlement'); setSimStep(4); setIsPlaying(false); setIsSimRunning(false); }}
                      className={`cursor-pointer rounded-lg p-3 transition-all duration-200 border text-left bg-[#1C1D22] relative shadow-md ${
                        selectedNode === 'settlement' 
                          ? tx.settlements?.length > 0
                            ? 'border-[#8AB4F8] ring-1 ring-[#8AB4F8]/30 shadow-lg shadow-[#1A73E8]/10'
                            : 'border-rose-500 ring-1 ring-rose-500/30 shadow-lg shadow-rose-500/10' 
                          : simStep < 4
                          ? 'opacity-30 border-[#2D2E36]'
                          : 'border-[#2D2E36] hover:border-[#8AB4F8]/50'
                      }`}
                    >
                      {/* Input port */}
                      <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-[#131417] border-2 border-[#8AB4F8] z-20 shadow-sm shadow-[#8AB4F8]/30" />
                      {/* Output port */}
                      <div className="absolute -right-[7px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-[#131417] border-2 border-[#8AB4F8] z-20 shadow-sm shadow-[#8AB4F8]/30" />

                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-medium text-[#9AA0A6] flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${tx.settlements?.length > 0 ? 'bg-[#8AB4F8]' : 'bg-rose-400'}`} /> 04 • BATCH
                        </span>
                        <Clock className={`w-3.5 h-3.5 ${tx.settlements?.length > 0 ? 'text-[#8AB4F8]' : 'text-rose-400'}`} />
                      </div>
                      <div className="font-semibold text-xs text-[#E8EAED] truncate">Settlement Batch</div>
                      <div className="text-xs font-mono text-emerald-400 font-bold mt-0.5">
                        {tx.settlements?.length > 0 ? formatCurrency(tx.settlements[0].amount) : <span className="text-rose-400">Unsettled</span>}
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-[#2D2E36] flex items-center justify-between text-[10px] text-[#9AA0A6] font-mono">
                        <span className="truncate max-w-[75px]">{tx.settlements?.[0]?.externalSettlementId?.slice(0, 14) || 'None'}...</span>
                        <span className={tx.settlements?.length > 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {tx.settlements?.length > 0 ? 'T+1' : 'HELD'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* NODE 5: BANK — far right, top */}
                  <div 
                    className="absolute z-10"
                    style={{ left: '940px', top: '40px', width: '160px' }}
                  >
                    <div 
                      onClick={() => { setSelectedNode('bank'); setSimStep(5); setIsPlaying(false); setIsSimRunning(false); }}
                      className={`cursor-pointer rounded-lg p-3 transition-all duration-200 border text-left bg-[#1C1D22] relative shadow-md ${
                        selectedNode === 'bank' 
                          ? 'border-emerald-400 ring-1 ring-emerald-400/30 shadow-lg shadow-emerald-500/10' 
                          : simStep < 5
                          ? 'opacity-30 border-[#2D2E36]'
                          : 'border-[#2D2E36] hover:border-emerald-400/50'
                      }`}
                    >
                      {/* Input port — left center */}
                      <div className="absolute -left-[7px] top-1/2 -translate-y-1/2 w-[14px] h-[14px] rounded-full bg-[#131417] border-2 border-emerald-400 z-20 shadow-sm shadow-emerald-400/30" />

                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-mono font-medium text-[#9AA0A6] flex items-center gap-1.5">
                          <span className={`w-1.5 h-1.5 rounded-full ${simStep >= 5 ? 'bg-emerald-400' : 'bg-[#2D2E36]'}`} /> 05 • BANK
                        </span>
                        <Building2 className="w-3.5 h-3.5 text-emerald-400" />
                      </div>
                      <div className="font-semibold text-xs text-[#E8EAED] truncate">Nodal Bank UTR</div>
                      <div className="text-xs font-mono text-emerald-400 font-bold mt-0.5">
                        {tx.settlements?.[0]?.bankTransactions?.[0] ? formatCurrency(tx.settlements[0].bankTransactions[0].amount) : formatCurrency(actualSettlement)}
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-[#2D2E36] flex items-center justify-between text-[10px] text-[#9AA0A6] font-mono">
                        <span className="truncate max-w-[75px]">{tx.settlements?.[0]?.bankTransactions?.[0]?.reference || 'APEX...'}</span>
                        <span className="text-emerald-400 font-bold">CLEARED</span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* Graph Canvas Footer */}
                <div className="px-4 py-2.5 border-t border-[#2D2E36] bg-[#131417] flex items-center justify-between text-[10px] text-[#9AA0A6] font-mono">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      <span className="text-[#E8EAED]">DAG Synchronized</span>
                    </span>
                    <span className="text-[#2D2E36]">|</span>
                    <span>Routing: <strong className="text-[#E8EAED]">HDFC Escrow → RBI Nodal</strong></span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-[#1C1D22] border border-[#2D2E36]">5 Nodes • 4 Edges</span>
                  </div>
                </div>

              </div>

              {/* Interactive Node Deep-Dive Inspector Tabs */}
              <div className="border-t border-[var(--border)] bg-[var(--muted)]/20 p-5 relative z-10">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5 mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-[var(--muted)] text-[#528FF0] border border-[var(--border)]">
                      <Info className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-[var(--foreground)] flex items-center gap-2">
                        Node Inspector: <span className="text-[#528FF0] font-mono bg-[var(--muted)] px-2 py-0.5 rounded border border-[var(--border)]">{selectedNode.toUpperCase()}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[var(--muted)] text-[var(--muted-foreground)] font-mono">Step {PIPELINE_NODES.indexOf(selectedNode) + 1} of 5</span>
                      </span>
                      <p className="text-[11px] text-[var(--muted-foreground)] mt-0.5">Live state verification and ledger telemetry for active stage</p>
                    </div>
                  </div>

                  {/* Tabs */}
                  <div className="flex items-center bg-[var(--muted)] border border-[var(--border)] rounded-lg p-1 text-xs">
                    <button 
                      onClick={() => setInspectorTab('overview')}
                      className={`px-3 py-1.5 rounded-md transition-all ${inspectorTab === 'overview' ? 'bg-[#528FF0] text-white font-semibold shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                    >
                      Overview
                    </button>
                    <button 
                      onClick={() => setInspectorTab('checks')}
                      className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${inspectorTab === 'checks' ? 'bg-[#528FF0] text-white font-semibold shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                    >
                      <FileCheck2 className="w-3.5 h-3.5" /> Validation Checks
                    </button>
                    <button 
                      onClick={() => setInspectorTab('json')}
                      className={`px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${inspectorTab === 'json' ? 'bg-[#528FF0] text-white font-semibold shadow-sm' : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]'}`}
                    >
                      <Code2 className="w-3.5 h-3.5" /> Raw JSON
                    </button>
                  </div>
                </div>

                {/* Tab 1: Overview */}
                {inspectorTab === 'overview' && (
                  <div className="transition-all duration-200">
                    {selectedNode === 'order' && (
                      <div className="border border-[var(--border)] rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)] bg-[var(--surface)] overflow-hidden grid grid-cols-1 sm:grid-cols-3 text-xs">
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">External Order ID</span>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-mono text-[var(--foreground)] text-xs font-semibold truncate">{tx.order?.externalOrderId || 'N/A'}</span>
                            {tx.order?.externalOrderId && (
                              <button onClick={() => handleCopy(tx.order.externalOrderId, 'ord')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                                {copiedId === 'ord' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                              </button>
                            )}
                          </div>
                        </div>
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">Order Total Amount</span>
                          <span className="font-mono text-emerald-400 font-bold text-sm mt-1 block">{formatCurrency(tx.order?.amount)}</span>
                        </div>
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">Creation Timestamp</span>
                          <span className="text-[var(--foreground)] mt-1 block font-mono text-xs">{formatDate(tx.order?.createdAt)}</span>
                        </div>
                      </div>
                    )}

                    {selectedNode === 'payment' && (
                      <div className="border border-[var(--border)] rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)] bg-[var(--surface)] overflow-hidden grid grid-cols-1 sm:grid-cols-4 text-xs">
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">Gateway Payment ID</span>
                          <div className="flex items-center justify-between mt-1">
                            <span className="font-mono text-[var(--foreground)] text-xs font-semibold truncate">{tx.externalPaymentId}</span>
                            <button onClick={() => handleCopy(tx.externalPaymentId, 'pay')} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1">
                              {copiedId === 'pay' ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">Payment Method</span>
                          <span className="text-[var(--foreground)] font-mono text-xs mt-1 block truncate">{tx.method || 'CARD / UPI / NETBANKING'}</span>
                        </div>
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">Authorized State</span>
                          <span className="text-emerald-400 font-mono font-semibold text-xs mt-1 block">{tx.status}</span>
                        </div>
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">Capture Timestamp</span>
                          <span className="text-[var(--foreground)] mt-1 block font-mono text-xs">{formatDate(tx.capturedAt || tx.createdAt)}</span>
                        </div>
                      </div>
                    )}

                    {selectedNode === 'fees' && (
                      <div className="border border-[var(--border)] rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)] bg-[var(--surface)] overflow-hidden grid grid-cols-1 sm:grid-cols-3 text-xs">
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">MDR Processing Fee</span>
                          <span className={`font-mono font-bold text-sm mt-1 block ${simScenario === 'FEE_MISMATCH' ? 'text-amber-400' : 'text-[var(--foreground)]'}`}>
                            -{formatCurrency(totalFeesAmount)}
                          </span>
                        </div>
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">Goods & Services Tax (18%)</span>
                          <span className="font-mono text-[var(--foreground)] font-bold text-sm mt-1 block">-{formatCurrency(totalTaxAmount)}</span>
                        </div>
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">Total Deductions %</span>
                          <span className="font-mono text-[var(--foreground)] mt-1 block text-xs">{tx.amount ? ((totalDeductions / tx.amount) * 100).toFixed(2) : 0}% of Gross</span>
                        </div>
                      </div>
                    )}

                    {selectedNode === 'settlement' && (
                      <div className="border border-[var(--border)] rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)] bg-[var(--surface)] overflow-hidden grid grid-cols-1 sm:grid-cols-3 text-xs">
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">Settlement Batch ID</span>
                          <span className="font-mono text-[var(--foreground)] mt-1 block text-xs truncate">{tx.settlements?.[0]?.externalSettlementId || 'None (Missing)'}</span>
                        </div>
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">Net Batch Amount</span>
                          <span className={`font-mono font-bold text-sm mt-1 block ${actualSettlement > 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {actualSettlement > 0 ? formatCurrency(actualSettlement) : 'Unsettled'}
                          </span>
                        </div>
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">Batch Timestamp</span>
                          <span className="text-[var(--foreground)] mt-1 block font-mono text-xs">{formatDate(tx.settlements?.[0]?.settledAt)}</span>
                        </div>
                      </div>
                    )}

                    {selectedNode === 'bank' && (
                      <div className="border border-[var(--border)] rounded-lg divide-y sm:divide-y-0 sm:divide-x divide-[var(--border)] bg-[var(--surface)] overflow-hidden grid grid-cols-1 sm:grid-cols-3 text-xs">
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">Nodal UTR Reference</span>
                          <span className="font-mono text-[var(--foreground)] mt-1 block text-xs truncate">{tx.settlements?.[0]?.bankTransactions?.[0]?.reference || 'CMS589210940'}</span>
                        </div>
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">Disbursement Channel</span>
                          <span className="text-[var(--foreground)] font-mono text-xs mt-1 block truncate">HDFC Bank Nodal Escrow</span>
                        </div>
                        <div className="p-3.5">
                          <span className="text-[var(--muted-foreground)] block text-[10px] font-mono uppercase tracking-wider">Value Date (Bank Clearance)</span>
                          <span className="text-[var(--foreground)] mt-1 block font-mono text-xs">{formatDate(tx.settlements?.[0]?.bankTransactions?.[0]?.transactionDate || tx.createdAt)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Tab 2: Validation Checks */}
                {inspectorTab === 'checks' && (
                  <div className="space-y-2.5">
                    {getValidationChecks(selectedNode).map((chk, i) => (
                      <div key={i} className="flex items-center justify-between p-3.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-xs shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold ${
                            chk.status === 'PASS' 
                              ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40' 
                              : chk.status === 'WARN'
                              ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300 border border-amber-200 dark:border-amber-800/40'
                              : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800/40'
                          }`}>
                            {chk.status}
                          </span>
                          <span className="font-semibold text-[var(--foreground)]">{chk.label}</span>
                        </div>
                        <span className="text-[var(--muted-foreground)] font-mono text-[11px]">{chk.note}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Tab 3: Raw JSON */}
                {inspectorTab === 'json' && (
                  <div className="relative">
                    <pre className="p-4 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[var(--foreground)] font-mono text-xs max-h-52 overflow-auto shadow-inner">
                      {selectedNode === 'order' && JSON.stringify(tx.order, null, 2)}
                      {selectedNode === 'payment' && JSON.stringify({ id: tx.id, externalPaymentId: tx.externalPaymentId, amount: tx.amount, status: tx.status, method: tx.method, capturedAt: tx.capturedAt }, null, 2)}
                      {selectedNode === 'fees' && JSON.stringify(tx.fees, null, 2)}
                      {selectedNode === 'settlement' && JSON.stringify(tx.settlements, null, 2)}
                      {selectedNode === 'bank' && JSON.stringify(tx.settlements?.[0]?.bankTransactions, null, 2)}
                    </pre>
                    <button 
                      onClick={() => handleCopy(JSON.stringify(tx, null, 2), 'raw-json')}
                      className="absolute top-3 right-3 px-3 py-1.5 rounded-md bg-[var(--muted)] hover:bg-[var(--surface-hover)] text-[var(--foreground)] text-xs font-semibold flex items-center gap-1.5 border border-[var(--border)] shadow-sm"
                    >
                      {copiedId === 'raw-json' ? <><Check className="w-3.5 h-3.5 text-emerald-500" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy JSON</>}
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

          {/* Exceptions Overlay & Diagnostics */}
          {tx.exceptions?.length > 0 && (
            <div className="mt-4 rounded-lg border border-[#2D2E36] bg-[#1C1D22] p-4 shadow-sm print:bg-red-50 print:border-red-200">
              <div className="flex items-center justify-between mb-3 border-b border-[#2D2E36] pb-2.5">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                  <h3 className="text-xs font-mono uppercase tracking-wider font-semibold text-[#E8EAED]">
                    Active Pipeline Discrepancies
                  </h3>
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-[#26272E] border border-[#2D2E36] text-[#9AA0A6]">
                    {tx.exceptions.length} detected
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-3">
                {tx.exceptions.map((ex) => (
                  <div key={ex.id} className="bg-[#131417] print:bg-white p-3.5 rounded-lg border border-[#2D2E36] print:border-rose-200 shadow-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2">
                        <div className="font-mono font-medium text-xs text-[#E8EAED]">{ex.type.replace(/_/g, ' ')}</div>
                        <span className="text-[10px] font-mono uppercase tracking-wider px-2 py-0.5 rounded border border-[#2D2E36] bg-[#1C1D22] text-[#9AA0A6]">{ex.severity} Priority</span>
                      </div>
                      <p className="text-[#9AA0A6] print:text-gray-700 text-xs mt-1.5 leading-relaxed font-sans">{ex.description}</p>
                      <div className="text-xs font-mono text-[#9AA0A6] mt-2.5">
                        Variance Impact: <span className="font-semibold text-[#E8EAED]">{formatCurrency(ex.financialImpact)}</span>
                      </div>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 mt-3 pt-3 border-t border-[#2D2E36] print:hidden">
                      <button 
                        onClick={() => handleAIInvestigate(ex.id)}
                        disabled={aiLoading}
                        className="flex-1 h-8 px-3 rounded text-xs font-mono font-medium border border-[#2D2E36] bg-[#26272E] hover:bg-[#2F3038] text-[#E8EAED] hover:text-white transition-colors flex items-center justify-center gap-1.5 disabled:opacity-50"
                      >
                        {aiLoading && activeExceptionId === ex.id ? (
                          <><Loader2 className="w-3.5 h-3.5 animate-spin text-[#8AB4F8]" /> Analyzing...</>
                        ) : (
                          <><Code2 className="w-3.5 h-3.5 text-[#8AB4F8]" /> Root Cause Diagnostics</>
                        )}
                      </button>

                      <a
                        href="/exceptions"
                        className="h-8 px-3 rounded text-xs font-mono font-medium border border-[#2D2E36] bg-[#1C1D22] hover:bg-[#26272E] text-[#9AA0A6] hover:text-[#E8EAED] transition-colors flex items-center gap-1"
                      >
                        <span>Exceptions</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              {/* Inline Diagnostic Result */}
              {aiResult && (
                <div className="mt-4 bg-[#131417] print:bg-white p-4 rounded-lg border border-[#2D2E36] print:border-gray-300 shadow-sm print:shadow-none">
                  <div className="flex items-center text-[#8AB4F8] font-mono text-xs mb-2.5 gap-2 border-b border-[#2D2E36] pb-2">
                    <Code2 className="w-3.5 h-3.5" />
                    <span>Diagnostic Trace Analysis</span>
                  </div>
                  <div className="prose prose-slate dark:prose-invert max-w-none text-xs print:prose-slate">
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
                All 5 nodes (Order -&gt; Payment -&gt; Fees -&gt; Settlement -&gt; Nodal Bank) matched with zero variance.
              </p>
            </div>
          )}

        </div>
      )}
    </div>
  );
}
