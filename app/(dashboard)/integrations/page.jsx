'use client';

import { useState, useEffect } from 'react';
import { 
  Settings, 
  CheckCircle2, 
  Key, 
  Bot, 
  CreditCard, 
  Loader2, 
  Eye, 
  EyeOff, 
  ExternalLink,
  Trash2,
  RotateCcw,
  AlertTriangle,
  Database,
  Receipt,
  Calculator,
  Percent,
  Layers,
  Save,
  HelpCircle
} from 'lucide-react';

export default function IntegrationsPage() {
  const [settings, setSettings] = useState({
    GEMINI_API_KEY: '',
    RAZORPAY_KEY_ID: '',
    RAZORPAY_KEY_SECRET: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showKeys, setShowKeys] = useState({});

  // Reset/Purge State
  const [resetting, setResetting] = useState(false);
  const [resetSuccess, setResetSuccess] = useState('');
  const [seedVolume, setSeedVolume] = useState(100);

  // Fee Rules State
  const [feeRules, setFeeRules] = useState([]);
  const [feeLoading, setFeeLoading] = useState(true);
  const [feeSaving, setFeeSaving] = useState(false);
  const [feeSaveSuccess, setFeeSaveSuccess] = useState(false);

  // Fee Simulator State
  const [simAmount, setSimAmount] = useState(5000);
  const [simMethod, setSimMethod] = useState('CREDIT_CARD');

  useEffect(() => {
    async function fetchData() {
      try {
        const [settingsRes, feeRes] = await Promise.all([
          fetch('/api/settings'),
          fetch('/api/fee-rules')
        ]);

        const settingsData = await settingsRes.json();
        if (settingsData.success && settingsData.settings) {
          setSettings({
            GEMINI_API_KEY: settingsData.settings.GEMINI_API_KEY || '',
            RAZORPAY_KEY_ID: settingsData.settings.RAZORPAY_KEY_ID || '',
            RAZORPAY_KEY_SECRET: settingsData.settings.RAZORPAY_KEY_SECRET || '',
          });
        }

        const feeData = await feeRes.json();
        if (feeData.success && feeData.data) {
          setFeeRules(feeData.data);
        }
      } catch (err) {
        console.error('Failed to load settings or fee rules', err);
      } finally {
        setLoading(false);
        setFeeLoading(false);
      }
    }
    fetchData();
  }, []);

  const handleChange = (e) => {
    setSettings({
      ...settings,
      [e.target.name]: e.target.value,
    });
    setSaved(false);
  };

  const handleSave = async (key, value) => {
    setSaving(key);
    try {
      await fetch('/api/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      setSaved(key);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error('Failed to save', err);
    } finally {
      setSaving(false);
    }
  };

  const toggleShowKey = (key) => {
    setShowKeys(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const handleFeeRuleChange = (index, field, value) => {
    const updated = [...feeRules];
    updated[index] = {
      ...updated[index],
      [field]: value
    };
    setFeeRules(updated);
    setFeeSaveSuccess(false);
  };

  const handleSaveFeeRules = async () => {
    setFeeSaving(true);
    try {
      const res = await fetch('/api/fee-rules', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules: feeRules })
      });
      const data = await res.json();
      if (data.success) {
        setFeeRules(data.data);
        setFeeSaveSuccess(true);
        setTimeout(() => setFeeSaveSuccess(false), 3000);
      } else {
        alert(data.error || 'Failed to save fee pricing rules');
      }
    } catch (err) {
      console.error('Failed to save fee rules:', err);
      alert('Error updating fee pricing rules');
    } finally {
      setFeeSaving(false);
    }
  };

  const handleResetFeeRules = async () => {
    if (!window.confirm('Reset all fee rules back to industry standard benchmarks (UPI 0%, Credit Card 1.8%, Debit Card 0.9%, Netbanking ₹15)?')) return;
    setFeeSaving(true);
    try {
      const res = await fetch('/api/fee-rules', { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setFeeRules(data.data);
        setFeeSaveSuccess(true);
        setTimeout(() => setFeeSaveSuccess(false), 3000);
      }
    } catch (err) {
      console.error('Failed to reset fee rules:', err);
    } finally {
      setFeeSaving(false);
    }
  };

  const handleDataAction = async (action) => {
    const confirmMsg = action === 'clear_all'
      ? 'Are you sure you want to PURGE ALL transaction ledger data? The transaction count will reset to 0.'
      : `This will replace existing transactions with ${seedVolume} fresh realistic payment records. Continue?`;
    
    if (!window.confirm(confirmMsg)) return;

    setResetting(action);
    setResetSuccess('');
    try {
      const res = await fetch('/api/settings/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, count: seedVolume })
      });
      const data = await res.json();
      if (res.ok) {
        setResetSuccess(data.message || 'Operation successful');
        setTimeout(() => setResetSuccess(''), 4000);
      } else {
        alert(data.error || 'Operation failed');
      }
    } catch (err) {
      console.error('Reset failed:', err);
      alert('Failed to reset data');
    } finally {
      setResetting(false);
    }
  };

  // Helper for simulation
  const getSimCalculation = (methodKey, amount) => {
    const rule = feeRules.find(r => r.paymentMethod === methodKey) || {
      percentageRate: 0.018,
      flatFee: 0,
      taxRate: 0.18
    };
    const pRate = parseFloat(rule.percentageRate) || 0;
    const fFee = parseFloat(rule.flatFee) || 0;
    const tRate = parseFloat(rule.taxRate) ?? 0.18;

    const fee = (amount * pRate) + fFee;
    const tax = fee * tRate;
    const totalDeduction = fee + tax;
    const netSettlement = Math.max(0, amount - totalDeduction);

    return {
      fee: fee.toFixed(2),
      tax: tax.toFixed(2),
      totalDeduction: totalDeduction.toFixed(2),
      netSettlement: netSettlement.toFixed(2),
      effectiveRate: amount > 0 ? ((totalDeduction / amount) * 100).toFixed(2) : '0.00'
    };
  };

  if (loading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full border-[3px] border-[#528FF0]/20 border-t-[#528FF0] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 overflow-y-auto min-h-screen space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-[var(--foreground)]">Settings & Pricing Configuration</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          Configure API credentials, dynamic MDR fee rules, and manage transaction ledger state.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {resetSuccess}
        </div>
      )}

      {/* MDR & PRICING RULE MATRIX SECTION */}
      <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
        <div className="p-5 border-b border-[var(--border)] bg-[var(--muted)] flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-[#528FF0]/10 border border-[#528FF0]/30 flex items-center justify-center text-[#528FF0]">
              <Receipt className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-base">Method-Aware MDR Pricing Matrix</h3>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/40">
                  Dynamic Engine Active
                </span>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                Contractual fee schedules evaluated by the 5-point deterministic reconciliation engine per payment instrument
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleResetFeeRules}
              disabled={feeSaving}
              className="h-9 px-3 rounded-lg text-xs font-medium border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-[var(--muted-foreground)] transition-colors flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Benchmarks
            </button>
            <button
              onClick={handleSaveFeeRules}
              disabled={feeSaving}
              className="h-9 px-4 rounded-lg text-xs font-semibold bg-[#528FF0] hover:bg-[#4080E0] text-white transition-colors flex items-center gap-1.5 shadow-sm disabled:opacity-60"
            >
              {feeSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
              {feeSaveSuccess ? 'Rules Saved!' : 'Save Pricing Matrix'}
            </button>
          </div>
        </div>

        <div className="p-5 space-y-6">
          {/* Rules Table */}
          <div className="overflow-x-auto rounded-lg border border-[var(--border)]">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--muted)] text-[var(--muted-foreground)] border-b border-[var(--border)]">
                <tr>
                  <th className="p-3 font-semibold">Payment Instrument</th>
                  <th className="p-3 font-semibold">MDR Rate (%)</th>
                  <th className="p-3 font-semibold">Flat Fee (₹)</th>
                  <th className="p-3 font-semibold">GST Rate (%)</th>
                  <th className="p-3 font-semibold">Contract Policy / Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {feeRules.map((rule, idx) => (
                  <tr key={rule.paymentMethod || idx} className="hover:bg-[var(--muted)]/50 transition-colors">
                    <td className="p-3 font-medium flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-[11px] font-mono font-semibold ${
                        rule.paymentMethod === 'UPI' ? 'bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800' :
                        rule.paymentMethod === 'CREDIT_CARD' || rule.paymentMethod === 'CARD' ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800' :
                        rule.paymentMethod === 'DEBIT_CARD' ? 'bg-cyan-100 dark:bg-cyan-950/60 text-cyan-700 dark:text-cyan-300 border border-cyan-200 dark:border-cyan-800' :
                        rule.paymentMethod === 'NETBANKING' ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800' :
                        'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700'
                      }`}>
                        {rule.paymentMethod}
                      </span>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.001"
                          min="0"
                          max="1"
                          value={rule.percentageRate}
                          onChange={(e) => handleFeeRuleChange(idx, 'percentageRate', e.target.value)}
                          className="w-24 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs focus:outline-none focus:border-[#528FF0] font-mono"
                        />
                        <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
                          ({(parseFloat(rule.percentageRate || 0) * 100).toFixed(2)}%)
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <span className="text-[var(--muted-foreground)]">₹</span>
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={rule.flatFee}
                          onChange={(e) => handleFeeRuleChange(idx, 'flatFee', e.target.value)}
                          className="w-20 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs focus:outline-none focus:border-[#528FF0] font-mono"
                        />
                      </div>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max="1"
                          value={rule.taxRate}
                          onChange={(e) => handleFeeRuleChange(idx, 'taxRate', e.target.value)}
                          className="w-20 px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs focus:outline-none focus:border-[#528FF0] font-mono"
                        />
                        <span className="text-[11px] text-[var(--muted-foreground)] font-mono">
                          ({(parseFloat(rule.taxRate || 0) * 100).toFixed(0)}%)
                        </span>
                      </div>
                    </td>
                    <td className="p-3">
                      <input
                        type="text"
                        value={rule.description || ''}
                        onChange={(e) => handleFeeRuleChange(idx, 'description', e.target.value)}
                        placeholder="Rule notes or contract clause..."
                        className="w-full px-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs focus:outline-none focus:border-[#528FF0]"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Interactive Fee Simulator */}
          <div className="p-4 rounded-lg bg-[var(--muted)] border border-[var(--border)] space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-[#528FF0]" />
                <span className="font-semibold text-xs text-[var(--foreground)]">Live MDR & Settlement Simulator</span>
              </div>
              <div className="flex items-center gap-3">
                <label className="text-xs text-[var(--muted-foreground)]">Simulate Amount:</label>
                <div className="relative">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-xs text-[var(--muted-foreground)]">₹</span>
                  <input
                    type="number"
                    value={simAmount}
                    onChange={(e) => setSimAmount(Math.max(1, parseFloat(e.target.value) || 0))}
                    className="w-32 pl-6 pr-2 py-1 bg-[var(--surface)] border border-[var(--border)] rounded text-xs font-mono font-medium focus:outline-none focus:border-[#528FF0]"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
              {['UPI', 'CREDIT_CARD', 'DEBIT_CARD', 'NETBANKING', 'WALLET'].map(m => {
                const calc = getSimCalculation(m, simAmount);
                return (
                  <div key={m} className="p-3 rounded-lg bg-[var(--surface)] border border-[var(--border)] space-y-1.5 shadow-sm">
                    <div className="text-[11px] font-bold text-[var(--muted-foreground)] tracking-wide">{m}</div>
                    <div className="text-base font-bold text-[var(--foreground)] font-mono">₹{calc.netSettlement}</div>
                    <div className="text-[10px] text-[var(--muted-foreground)] space-y-0.5 pt-1 border-t border-[var(--border)] font-mono">
                      <div className="flex justify-between">
                        <span>MDR Fee:</span>
                        <span>₹{calc.fee}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>GST (18%):</span>
                        <span>₹{calc.tax}</span>
                      </div>
                      <div className="flex justify-between font-semibold text-[#528FF0]">
                        <span>Effective:</span>
                        <span>{calc.effectiveRate}%</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 max-w-6xl">
        
        {/* Gemini API Card */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="p-5 border-b border-[var(--border)] bg-[var(--muted)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#528FF0] flex items-center justify-center">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Google Gemini AI</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Powers the Investigation Copilot</p>
                </div>
              </div>
              {settings.GEMINI_API_KEY ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Configured
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  Not Set
                </span>
              )}
            </div>
          </div>
          
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--muted-foreground)]">
                API Key
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showKeys.GEMINI_API_KEY ? 'text' : 'password'}
                    name="GEMINI_API_KEY"
                    value={settings.GEMINI_API_KEY}
                    onChange={handleChange}
                    placeholder="AIzaSy..."
                    className="w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 pl-10 pr-10 text-sm focus:outline-none focus:border-[#528FF0] transition-colors duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('GEMINI_API_KEY')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showKeys.GEMINI_API_KEY ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={() => handleSave('GEMINI_API_KEY', settings.GEMINI_API_KEY)}
                  disabled={saving === 'GEMINI_API_KEY'}
                  className="h-10 px-4 rounded-lg text-sm font-medium border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors duration-150 disabled:opacity-60 whitespace-nowrap"
                >
                  {saving === 'GEMINI_API_KEY' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saved === 'GEMINI_API_KEY' ? (
                    <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Saved!</span>
                  ) : 'Save'}
                </button>
              </div>
            </div>

            <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#528FF0] hover:underline mt-1">
              Get API key from Google AI Studio <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Razorpay Integration Card */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="p-5 border-b border-[var(--border)] bg-[var(--muted)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#528FF0] flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Razorpay Payment Gateway</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">For live webhook ingestion & auto-reconciliation</p>
                </div>
              </div>
              {settings.RAZORPAY_KEY_ID ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Configured
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-amber-50 text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
                  Not Set
                </span>
              )}
            </div>
          </div>
          
          <div className="p-5 space-y-4">
            {/* Key ID */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--muted-foreground)]">
                Key ID
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    name="RAZORPAY_KEY_ID"
                    value={settings.RAZORPAY_KEY_ID}
                    onChange={handleChange}
                    placeholder="rzp_test_..."
                    className="w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 pl-10 text-sm focus:outline-none focus:border-[#528FF0] transition-colors duration-150"
                  />
                </div>
                <button
                  onClick={() => handleSave('RAZORPAY_KEY_ID', settings.RAZORPAY_KEY_ID)}
                  disabled={saving === 'RAZORPAY_KEY_ID'}
                  className="h-10 px-4 rounded-lg text-sm font-medium border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors duration-150 disabled:opacity-60 whitespace-nowrap"
                >
                  {saving === 'RAZORPAY_KEY_ID' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saved === 'RAZORPAY_KEY_ID' ? (
                    <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Saved!</span>
                  ) : 'Save'}
                </button>
              </div>
            </div>
            
            {/* Key Secret */}
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--muted-foreground)]">
                Key Secret
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type={showKeys.RAZORPAY_KEY_SECRET ? 'text' : 'password'}
                    name="RAZORPAY_KEY_SECRET"
                    value={settings.RAZORPAY_KEY_SECRET}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full h-10 rounded-lg border border-[var(--border)] bg-[var(--muted)] px-3 pl-10 pr-10 text-sm focus:outline-none focus:border-[#528FF0] transition-colors duration-150"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('RAZORPAY_KEY_SECRET')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  >
                    {showKeys.RAZORPAY_KEY_SECRET ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={() => handleSave('RAZORPAY_KEY_SECRET', settings.RAZORPAY_KEY_SECRET)}
                  disabled={saving === 'RAZORPAY_KEY_SECRET'}
                  className="h-10 px-4 rounded-lg text-sm font-medium border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] transition-colors duration-150 disabled:opacity-60 whitespace-nowrap"
                >
                  {saving === 'RAZORPAY_KEY_SECRET' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saved === 'RAZORPAY_KEY_SECRET' ? (
                    <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Saved!</span>
                  ) : 'Save'}
                </button>
              </div>
            </div>

            <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#528FF0] hover:underline mt-1">
              Get keys from Razorpay Dashboard <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Data Management & Sandbox Reset Card */}
        <div className="lg:col-span-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden">
          <div className="p-5 border-b border-[var(--border)] bg-[var(--muted)] flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-slate-800 flex items-center justify-center text-white">
                <Database className="h-5 w-5 text-[#528FF0]" />
              </div>
              <div>
                <h3 className="font-semibold">Ledger Data Management & Sandbox Reset</h3>
                <p className="text-sm text-[var(--muted-foreground)]">Purge test transactions or generate fresh demo datasets</p>
              </div>
            </div>
          </div>

          <div className="p-5 grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* Clear All Data */}
            <div className="p-4 rounded-lg border border-red-200 dark:border-red-900/30 bg-red-50/40 dark:bg-red-900/10 flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center gap-2 text-red-600 font-semibold text-sm">
                  <Trash2 className="w-4 h-4" />
                  Purge All Test Transactions
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                  Clears all payments, settlements, and exceptions to start with a clean 0-volume slate for live webhook testing.
                </p>
              </div>
              <button
                onClick={() => handleDataAction('clear_all')}
                disabled={resetting !== false}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-red-600 hover:bg-red-700 text-white transition-colors disabled:opacity-50"
              >
                {resetting === 'clear_all' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Purging Data...</> : <><Trash2 className="w-3.5 h-3.5" /> Clear All Data (0 Volume)</>}
              </button>
            </div>

            {/* Regenerate Fresh Demo Data */}
            <div className="p-4 rounded-lg border border-[var(--border)] bg-[var(--muted)] flex flex-col justify-between space-y-3">
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[var(--foreground)] font-semibold text-sm">
                    <RotateCcw className="w-4 h-4 text-[#528FF0]" />
                    Re-Seed Demo Dataset
                  </div>
                  <select
                    value={seedVolume}
                    onChange={(e) => setSeedVolume(parseInt(e.target.value))}
                    disabled={resetting !== false}
                    className="bg-[var(--surface)] border border-[var(--border)] rounded-md px-2 py-1 text-xs font-medium text-[var(--foreground)] focus:outline-none focus:border-[#528FF0]"
                  >
                    <option value={50}>50 Transactions</option>
                    <option value={100}>100 Transactions</option>
                    <option value={250}>250 Transactions</option>
                    <option value={500}>500 Transactions</option>
                    <option value={1000}>1,000 Volume (Enterprise)</option>
                  </select>
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                  Populates {seedVolume} fresh realistic transactions with method-specific fee breakdowns, matched bank settlements, and detected anomalies.
                </p>
              </div>
              <button
                onClick={() => handleDataAction('regenerate_demo')}
                disabled={resetting !== false}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-[#528FF0] hover:bg-[#4080E0] text-white transition-colors disabled:opacity-50"
              >
                {resetting === 'regenerate_demo' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Seeding {seedVolume} Dataset...</> : <><RotateCcw className="w-3.5 h-3.5" /> Re-Seed {seedVolume} Transactions</>}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
