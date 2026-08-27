'use client';

import { useState, useEffect } from 'react';
import { Settings, Save, CheckCircle2, Key, Bot, CreditCard, ShieldCheck } from 'lucide-react';

export default function IntegrationsPage() {
  const [settings, setSettings] = useState({
    GEMINI_API_KEY: '',
    RAZORPAY_KEY_ID: '',
    RAZORPAY_KEY_SECRET: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

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

  if (loading) {
    return (
      <div className="flex-1 p-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Settings className="h-8 w-8 text-primary" />
            Integrations
          </h1>
          <p className="text-muted-foreground mt-2">
            Configure your API keys to connect PaySynapse with external services.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
        {/* Gemini API Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Bot className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Google Gemini AI</h3>
                  <p className="text-sm text-muted-foreground">Powers the Investigation Copilot</p>
                </div>
              </div>
              {settings.GEMINI_API_KEY ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-500 border border-slate-500/20">
                  Disconnected
                </span>
              )}
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                API Key
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Key className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                  <input
                    type="password"
                    name="GEMINI_API_KEY"
                    value={settings.GEMINI_API_KEY}
                    onChange={handleChange}
                    placeholder="AIzaSy..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 pl-9 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  />
                </div>
                <button
                  onClick={() => handleSave('GEMINI_API_KEY', settings.GEMINI_API_KEY)}
                  disabled={saving === 'GEMINI_API_KEY'}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                >
                  {saving === 'GEMINI_API_KEY' ? 'Saving...' : saved === 'GEMINI_API_KEY' ? 'Saved!' : 'Save'}
                </button>
              </div>
              <p className="text-[0.8rem] text-muted-foreground">
                Your API key is securely stored in the database.
              </p>
            </div>
          </div>
        </div>

        {/* Razorpay Card */}
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm overflow-hidden">
          <div className="p-6 border-b bg-muted/30">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-indigo-500/10 flex items-center justify-center">
                  <CreditCard className="h-5 w-5 text-indigo-500" />
                </div>
                <div>
                  <h3 className="font-semibold text-lg">Razorpay Gateway</h3>
                  <p className="text-sm text-muted-foreground">Payment processor integration</p>
                </div>
              </div>
              {settings.RAZORPAY_KEY_ID ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Connected
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-500/10 text-slate-500 border border-slate-500/20">
                  Disconnected
                </span>
              )}
            </div>
          </div>
          <div className="p-6 space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Key ID
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  name="RAZORPAY_KEY_ID"
                  value={settings.RAZORPAY_KEY_ID}
                  onChange={handleChange}
                  placeholder="rzp_test_..."
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  onClick={() => handleSave('RAZORPAY_KEY_ID', settings.RAZORPAY_KEY_ID)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4"
                >
                  Save
                </button>
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium leading-none">
                Key Secret
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  name="RAZORPAY_KEY_SECRET"
                  value={settings.RAZORPAY_KEY_SECRET}
                  onChange={handleChange}
                  placeholder="••••••••••••"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                />
                <button
                  onClick={() => handleSave('RAZORPAY_KEY_SECRET', settings.RAZORPAY_KEY_SECRET)}
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
