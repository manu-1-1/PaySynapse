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
  Database
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

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.settings) {
          setSettings({
            GEMINI_API_KEY: data.settings.GEMINI_API_KEY || '',
            RAZORPAY_KEY_ID: data.settings.RAZORPAY_KEY_ID || '',
            RAZORPAY_KEY_SECRET: data.settings.RAZORPAY_KEY_SECRET || '',
          });
        }
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
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

  const handleDataAction = async (action) => {
    const confirmMsg = action === 'clear_all'
      ? 'Are you sure you want to PURGE ALL transaction ledger data? The transaction count will reset to 0.'
      : 'This will replace existing transactions with a fresh realistic 60-transaction demo dataset. Continue?';
    
    if (!window.confirm(confirmMsg)) return;

    setResetting(action);
    setResetSuccess('');
    try {
      const res = await fetch('/api/settings/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
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
        <h1 className="text-xl font-semibold text-[var(--foreground)]">Settings & Integrations</h1>
        <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
          Configure API credentials and manage transaction ledger state.
        </p>
      </div>

      {resetSuccess && (
        <div className="p-3.5 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg text-emerald-800 dark:text-emerald-300 text-sm flex items-center gap-2 font-medium">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          {resetSuccess}
        </div>
      )}

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
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  Not Configured
                </span>
              )}
            </div>
          </div>
          <div className="p-5 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-[var(--muted-foreground)]">
                Gemini API Key
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
                  className="h-10 px-4 rounded-lg text-sm font-medium bg-[#528FF0] hover:bg-[#4080E0] text-white transition-colors duration-150 disabled:opacity-60 whitespace-nowrap"
                >
                  {saving === 'GEMINI_API_KEY' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saved === 'GEMINI_API_KEY' ? (
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Saved!</span>
                  ) : 'Save'}
                </button>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                Your API key is securely stored in the database.
              </p>
            </div>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-[#528FF0] hover:underline mt-1">
              Get an API key from Google AI Studio <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Razorpay Card */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden">
          <div className="p-5 border-b border-[var(--border)] bg-[var(--muted)]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-[#528FF0] flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold">Razorpay Gateway</h3>
                  <p className="text-sm text-[var(--muted-foreground)]">Payment processor integration</p>
                </div>
              </div>
              {settings.RAZORPAY_KEY_ID ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
                  Disconnected
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
                <div className="flex items-center gap-2 text-[var(--foreground)] font-semibold text-sm">
                  <RotateCcw className="w-4 h-4 text-[#528FF0]" />
                  Re-Seed Demo Dataset
                </div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1 leading-relaxed">
                  Populates 60 fresh realistic transactions with fee breakdowns, matched bank settlements, and detected anomalies.
                </p>
              </div>
              <button
                onClick={() => handleDataAction('regenerate_demo')}
                disabled={resetting !== false}
                className="w-full flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg text-xs font-semibold bg-[#528FF0] hover:bg-[#4080E0] text-white transition-colors disabled:opacity-50"
              >
                {resetting === 'regenerate_demo' ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Seeding Dataset...</> : <><RotateCcw className="w-3.5 h-3.5" /> Re-Seed Demo Transactions</>}
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
