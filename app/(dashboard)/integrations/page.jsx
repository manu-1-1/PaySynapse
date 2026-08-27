'use client';

import { useState, useEffect } from 'react';
import { Settings, CheckCircle2, Key, Bot, CreditCard, Loader2, Eye, EyeOff, ExternalLink } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-[3px] border-blue-500/20 border-t-blue-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Settings className="h-5 w-5 text-blue-500 animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto min-h-screen">
      <div className="flex items-center justify-between mb-8 animate-fade-in-up">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-300 dark:to-slate-500 bg-clip-text text-transparent">
            <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/20">
              <Settings className="h-5 w-5 text-white" />
            </div>
            Integrations
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure your API keys to connect PaySynapse with external services.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl">
        {/* Gemini API Card */}
        <div className="animate-fade-in-up stagger-1 group rounded-2xl border border-border/50 bg-white dark:bg-slate-950/60 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 to-cyan-500 opacity-60 group-hover:opacity-100 transition-opacity" style={{ position: 'relative' }} />
          <div className="p-6 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Google Gemini AI</h3>
                  <p className="text-sm text-muted-foreground">Powers the Investigation Copilot</p>
                </div>
              </div>
              {settings.GEMINI_API_KEY ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ring-1 ring-slate-500/20">
                  Disconnected
                </span>
              )}
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                API Key
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showKeys.GEMINI_API_KEY ? 'text' : 'password'}
                    name="GEMINI_API_KEY"
                    value={settings.GEMINI_API_KEY}
                    onChange={handleChange}
                    placeholder="AIzaSy..."
                    className="w-full h-11 rounded-xl border border-border/50 bg-slate-50 dark:bg-slate-800/50 px-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 dark:focus:border-blue-700 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('GEMINI_API_KEY')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showKeys.GEMINI_API_KEY ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={() => handleSave('GEMINI_API_KEY', settings.GEMINI_API_KEY)}
                  disabled={saving === 'GEMINI_API_KEY'}
                  className="h-11 px-5 rounded-xl text-sm font-medium bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-sm hover:shadow-lg hover:shadow-blue-500/20 transition-all duration-200 disabled:opacity-60 whitespace-nowrap"
                >
                  {saving === 'GEMINI_API_KEY' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saved === 'GEMINI_API_KEY' ? (
                    <span className="flex items-center gap-1.5"><CheckCircle2 className="h-4 w-4" /> Saved!</span>
                  ) : 'Save'}
                </button>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5">
                <span className="h-1 w-1 rounded-full bg-emerald-500" />
                Your API key is securely stored in the database.
              </p>
            </div>
            <a href="https://aistudio.google.com/apikey" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline mt-2">
              Get an API key from Google AI Studio <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>

        {/* Razorpay Card */}
        <div className="animate-fade-in-up stagger-2 group rounded-2xl border border-border/50 bg-white dark:bg-slate-950/60 backdrop-blur-sm shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-indigo-500 to-purple-500 opacity-60 group-hover:opacity-100 transition-opacity" style={{ position: 'relative' }} />
          <div className="p-6 border-b border-border/50 bg-slate-50/50 dark:bg-slate-900/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <CreditCard className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Razorpay Gateway</h3>
                  <p className="text-sm text-muted-foreground">Payment processor integration</p>
                </div>
              </div>
              {settings.RAZORPAY_KEY_ID ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400 ring-1 ring-emerald-500/20">
                  <span className="relative flex h-2 w-2">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
                  </span>
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 ring-1 ring-slate-500/20">
                  Disconnected
                </span>
              )}
            </div>
          </div>
          <div className="p-6 space-y-5">
            {/* Key ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Key ID
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    name="RAZORPAY_KEY_ID"
                    value={settings.RAZORPAY_KEY_ID}
                    onChange={handleChange}
                    placeholder="rzp_test_..."
                    className="w-full h-11 rounded-xl border border-border/50 bg-slate-50 dark:bg-slate-800/50 px-3 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 dark:focus:border-indigo-700 transition-all duration-200"
                  />
                </div>
                <button
                  onClick={() => handleSave('RAZORPAY_KEY_ID', settings.RAZORPAY_KEY_ID)}
                  disabled={saving === 'RAZORPAY_KEY_ID'}
                  className="h-11 px-5 rounded-xl text-sm font-medium border border-border/50 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 disabled:opacity-60 whitespace-nowrap"
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
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-600 dark:text-slate-300">
                Key Secret
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type={showKeys.RAZORPAY_KEY_SECRET ? 'text' : 'password'}
                    name="RAZORPAY_KEY_SECRET"
                    value={settings.RAZORPAY_KEY_SECRET}
                    onChange={handleChange}
                    placeholder="••••••••••••"
                    className="w-full h-11 rounded-xl border border-border/50 bg-slate-50 dark:bg-slate-800/50 px-3 pl-10 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-300 dark:focus:border-indigo-700 transition-all duration-200"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowKey('RAZORPAY_KEY_SECRET')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                  >
                    {showKeys.RAZORPAY_KEY_SECRET ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                <button
                  onClick={() => handleSave('RAZORPAY_KEY_SECRET', settings.RAZORPAY_KEY_SECRET)}
                  disabled={saving === 'RAZORPAY_KEY_SECRET'}
                  className="h-11 px-5 rounded-xl text-sm font-medium border border-border/50 bg-white dark:bg-slate-900 hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 disabled:opacity-60 whitespace-nowrap"
                >
                  {saving === 'RAZORPAY_KEY_SECRET' ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : saved === 'RAZORPAY_KEY_SECRET' ? (
                    <span className="flex items-center gap-1.5 text-emerald-600"><CheckCircle2 className="h-4 w-4" /> Saved!</span>
                  ) : 'Save'}
                </button>
              </div>
            </div>

            <a href="https://dashboard.razorpay.com/app/keys" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline mt-1">
              Get keys from Razorpay Dashboard <ExternalLink className="h-3 w-3" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
