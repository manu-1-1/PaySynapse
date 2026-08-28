'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  Flame, 
  Activity, 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sliders, 
  Terminal, 
  Server, 
  TrendingUp, 
  Clock,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import Link from 'next/link';

export default function SimulatorPage() {
  const [isRunning, setIsRunning] = useState(false);
  const [tpsTarget, setTpsTarget] = useState(60);
  const [preset, setPreset] = useState('flash_sale'); // 'normal', 'flash_sale', 'stress_test', 'chaos'
  
  // Chaos Injection switches
  const [injectMissingSettlement, setInjectMissingSettlement] = useState(true);
  const [injectFeeMismatch, setInjectFeeMismatch] = useState(false);
  const [injectWebhookDelay, setInjectWebhookDelay] = useState(false);
  const [injectDuplicate, setInjectDuplicate] = useState(false);

  // Live Metrics
  const [stats, setStats] = useState({
    processed: 1240,
    matched: 1198,
    exceptions: 42,
    valueProcessed: 6850000,
    valueSafeguarded: 245000,
    currentTps: 0,
    latencyMs: 1.8,
  });

  // Streaming Live Terminal Logs
  const [logs, setLogs] = useState([
    { id: 1, time: '00:00:01', type: 'INFO', msg: 'PaySynapse Deterministic Engine v2.4 initialized. Ready for load injection.' },
    { id: 2, time: '00:00:02', type: 'MATCH', msg: 'pay_98214902 ➔ ord_82910 matched with nodal bank settlement (₹4,500.00)' },
    { id: 3, time: '00:00:03', type: 'MATCH', msg: 'pay_10928401 ➔ ord_10294 matched with nodal bank settlement (₹12,200.00)' },
  ]);

  // Live Chart Data (Rolling 15 data points)
  const [chartData, setChartData] = useState([
    { time: '10s', tps: 20, latency: 1.4 },
    { time: '20s', tps: 25, latency: 1.6 },
    { time: '30s', tps: 30, latency: 1.5 },
    { time: '40s', tps: 45, latency: 1.8 },
    { time: '50s', tps: 55, latency: 2.1 },
    { time: '60s', tps: 60, latency: 1.9 },
  ]);

  const terminalContainerRef = useRef(null);

  // Apply preset configurations
  const applyPreset = (key) => {
    setPreset(key);
    if (key === 'normal') {
      setTpsTarget(25);
      setInjectMissingSettlement(false);
      setInjectFeeMismatch(false);
    } else if (key === 'flash_sale') {
      setTpsTarget(120);
      setInjectMissingSettlement(true);
      setInjectFeeMismatch(false);
    } else if (key === 'stress_test') {
      setTpsTarget(350);
      setInjectMissingSettlement(true);
      setInjectFeeMismatch(true);
    } else if (key === 'chaos') {
      setTpsTarget(180);
      setInjectMissingSettlement(true);
      setInjectFeeMismatch(true);
      setInjectWebhookDelay(true);
      setInjectDuplicate(true);
    }
  };

  // Simulation Runner Loop
  useEffect(() => {
    let interval = null;
    if (isRunning) {
      interval = setInterval(() => {
        // Random batch calculations
        const batchCount = Math.floor(tpsTarget / 5) + Math.floor(Math.random() * 5);
        const hasAnomaly = Math.random() < (injectMissingSettlement || injectFeeMismatch ? 0.35 : 0.05);
        const randomAmount = Math.floor(Math.random() * 8000) + 500;
        const nowStr = new Date().toLocaleTimeString('en-IN', { hour12: false });

        setStats(prev => ({
          processed: prev.processed + batchCount,
          matched: prev.matched + (hasAnomaly ? batchCount - 1 : batchCount),
          exceptions: prev.exceptions + (hasAnomaly ? 1 : 0),
          valueProcessed: prev.valueProcessed + (batchCount * randomAmount),
          valueSafeguarded: prev.valueSafeguarded + (hasAnomaly ? randomAmount : 0),
          currentTps: tpsTarget + Math.floor(Math.random() * 10 - 5),
          latencyMs: +(1.2 + (tpsTarget / 200) + Math.random() * 0.4).toFixed(1),
        }));

        // Generate logs
        const newLog = hasAnomaly ? {
          id: Date.now() + Math.random(),
          time: nowStr,
          type: 'ANOMALY',
          msg: `EXCEPTION: pay_${Math.floor(Math.random() * 899999 + 100000)} variance detected (₹${randomAmount.toLocaleString('en-IN')}) — Flagged in ${+(Math.random() * 1.5 + 0.8).toFixed(1)}ms`
        } : {
          id: Date.now() + Math.random(),
          time: nowStr,
          type: 'MATCH',
          msg: `pay_${Math.floor(Math.random() * 899999 + 100000)} -> ord_${Math.floor(Math.random() * 89999 + 10000)} reconciled perfectly (₹${randomAmount.toLocaleString('en-IN')})`
        };

        setLogs(prev => [...prev.slice(-40), newLog]);

        // Update chart
        setChartData(prev => {
          const next = [...prev.slice(-14), {
            time: nowStr.slice(3),
            tps: tpsTarget + Math.floor(Math.random() * 12 - 6),
            latency: +(1.2 + (tpsTarget / 220) + Math.random() * 0.5).toFixed(1)
          }];
          return next;
        });

      }, 800);
    } else {
      setStats(prev => ({ ...prev, currentTps: 0 }));
    }
    return () => clearInterval(interval);
  }, [isRunning, tpsTarget, injectMissingSettlement, injectFeeMismatch, injectWebhookDelay, injectDuplicate]);

  // Auto-scroll inside the terminal box container only (not the whole page)
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTo({
        top: terminalContainerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [logs]);

  const injectBurst = () => {
    const burstCount = 100;
    const nowStr = new Date().toLocaleTimeString('en-IN', { hour12: false });
    setStats(prev => ({
      ...prev,
      processed: prev.processed + burstCount,
      matched: prev.matched + 92,
      exceptions: prev.exceptions + 8,
      valueProcessed: prev.valueProcessed + 450000,
      valueSafeguarded: prev.valueSafeguarded + 36000,
    }));
    setLogs(prev => [
      ...prev,
      { id: Date.now(), time: nowStr, type: 'BURST', msg: `BURST INJECTED: 100 concurrent webhook transactions delivered to engine.` },
      { id: Date.now() + 1, time: nowStr, type: 'ANOMALY', msg: `BURST ENGINE CATCH: 8 orphaned settlement anomalies captured and contained.` }
    ]);
  };

  const resetStats = () => {
    setIsRunning(false);
    setStats({
      processed: 0,
      matched: 0,
      exceptions: 0,
      valueProcessed: 0,
      valueSafeguarded: 0,
      currentTps: 0,
      latencyMs: 1.2,
    });
    setLogs([
      { id: Date.now(), time: new Date().toLocaleTimeString('en-IN', { hour12: false }), type: 'INFO', msg: 'Traffic Simulator counters reset. Ready.' }
    ]);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  return (
    <div className="flex-1 space-y-5 p-6 pt-5 min-h-screen">
      
      {/* Sticky Header with Action Controls */}
      <div className="sticky top-14 z-20 bg-[var(--background)]/95 backdrop-blur-md pb-3 pt-1 border-b border-[var(--border)] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold text-[var(--foreground)]">Traffic & Stress Test Studio</h2>
            <span className={`text-xs px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1 ${
              isRunning 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20' 
                : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${isRunning ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
              {isRunning ? `${stats.currentTps} TPS Active` : 'Engine Idle'}
            </span>
          </div>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Simulate flash sales, burst load, and chaos failure injection to test deterministic reconciliation speed.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`px-4 py-2 rounded-lg font-semibold text-sm flex items-center gap-2 transition-all shadow-sm ${
              isRunning 
                ? 'bg-amber-500 hover:bg-amber-600 text-white ring-2 ring-amber-500/30' 
                : 'bg-[#528FF0] hover:bg-[#4080E0] text-white'
            }`}
          >
            {isRunning ? <><Pause className="w-4 h-4" /> Pause Simulator</> : <><Play className="w-4 h-4 fill-white" /> Start Traffic Generator</>}
          </button>
          <button
            onClick={injectBurst}
            className="px-3.5 py-2 rounded-lg font-medium text-sm border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] flex items-center gap-1.5 transition-colors"
          >
            <Zap className="w-4 h-4 text-amber-500" /> Burst 100
          </button>
          <button
            onClick={resetStats}
            title="Reset Simulation Counters"
            className="p-2 rounded-lg border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] text-gray-400 hover:text-gray-600"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-5">
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <span className="text-xs text-[var(--muted-foreground)] block">Live Throughput</span>
          <div className="text-2xl font-bold text-[#528FF0] mt-1 flex items-baseline gap-1">
            {stats.currentTps} <span className="text-xs font-normal text-[var(--muted-foreground)]">tx/sec</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Engine: Active</span>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <span className="text-xs text-[var(--muted-foreground)] block">Processed Volume</span>
          <div className="text-2xl font-bold text-[var(--foreground)] mt-1">
            {stats.processed.toLocaleString()}
          </div>
          <span className="text-[11px] text-[var(--muted-foreground)] mt-1 block">{formatCurrency(stats.valueProcessed)} GMV</span>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <span className="text-xs text-[var(--muted-foreground)] block">Reconciled Match Rate</span>
          <div className="text-2xl font-bold text-emerald-600 mt-1">
            {stats.processed ? ((stats.matched / stats.processed) * 100).toFixed(1) : 100}%
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">{stats.matched} matched</span>
        </div>

        <div className="rounded-lg border border-red-200 dark:border-red-900/40 bg-[var(--surface)] p-4 shadow-sm">
          <span className="text-xs text-red-600 dark:text-red-400 block font-medium">Anomalies Contained</span>
          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
            {stats.exceptions}
          </div>
          <span className="text-[11px] text-red-500 font-medium mt-1 block">{formatCurrency(stats.valueSafeguarded)} recovered</span>
        </div>

        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-4 shadow-sm">
          <span className="text-xs text-[var(--muted-foreground)] block">P99 Engine Latency</span>
          <div className="text-2xl font-bold text-slate-800 dark:text-slate-200 mt-1 flex items-baseline gap-1">
            {stats.latencyMs} <span className="text-xs font-normal text-[var(--muted-foreground)]">ms</span>
          </div>
          <span className="text-[11px] text-emerald-600 font-medium mt-1 block">Sub-2ms Determinism</span>
        </div>
      </div>

      {/* Controls & Presets Section */}
      <div className="grid gap-5 md:grid-cols-3">
        
        {/* Preset Selector */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-4">
          <h3 className="font-semibold text-sm text-[var(--foreground)] flex items-center gap-2">
            <Sliders className="w-4 h-4 text-[#528FF0]" /> Traffic Profiles
          </h3>
          
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => applyPreset('normal')}
              className={`p-3 rounded-lg border text-left text-xs transition-all ${
                preset === 'normal' 
                  ? 'border-[#528FF0] bg-blue-50/50 dark:bg-blue-900/20 text-[#528FF0] font-semibold ring-1 ring-[#528FF0]' 
                  : 'border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--foreground)]'
              }`}
            >
              <div className="font-bold">Standard Flow</div>
              <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">25 TPS • 100% Match</div>
            </button>

            <button
              onClick={() => applyPreset('flash_sale')}
              className={`p-3 rounded-lg border text-left text-xs transition-all ${
                preset === 'flash_sale' 
                  ? 'border-[#528FF0] bg-blue-50/50 dark:bg-blue-900/20 text-[#528FF0] font-semibold ring-1 ring-[#528FF0]' 
                  : 'border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--foreground)]'
              }`}
            >
              <div className="font-bold">Flash Sale</div>
              <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">120 TPS • 5% Drops</div>
            </button>

            <button
              onClick={() => applyPreset('stress_test')}
              className={`p-3 rounded-lg border text-left text-xs transition-all ${
                preset === 'stress_test' 
                  ? 'border-[#528FF0] bg-blue-50/50 dark:bg-blue-900/20 text-[#528FF0] font-semibold ring-1 ring-[#528FF0]' 
                  : 'border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--foreground)]'
              }`}
            >
              <div className="font-bold">Stress Peak</div>
              <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">350 TPS • Overcharge</div>
            </button>

            <button
              onClick={() => applyPreset('chaos')}
              className={`p-3 rounded-lg border text-left text-xs transition-all ${
                preset === 'chaos' 
                  ? 'border-[#528FF0] bg-blue-50/50 dark:bg-blue-900/20 text-[#528FF0] font-semibold ring-1 ring-[#528FF0]' 
                  : 'border-[var(--border)] hover:bg-[var(--surface-hover)] text-[var(--foreground)]'
              }`}
            >
              <div className="font-bold">Chaos Matrix</div>
              <div className="text-[11px] text-[var(--muted-foreground)] mt-0.5">180 TPS • All Faults</div>
            </button>
          </div>

          <div className="space-y-2 pt-2 border-t border-[var(--border)]">
            <div className="flex justify-between text-xs">
              <span className="text-[var(--muted-foreground)]">Target TPS Rate</span>
              <span className="font-mono font-bold text-[#528FF0]">{tpsTarget} TPS</span>
            </div>
            <input 
              type="range"
              min={10}
              max={500}
              step={10}
              value={tpsTarget}
              onChange={(e) => setTpsTarget(parseInt(e.target.value))}
              className="w-full h-1.5 bg-[var(--muted)] rounded-lg appearance-none cursor-pointer accent-[#528FF0]"
            />
          </div>
        </div>

        {/* Chaos & Anomaly Injection Toggles */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm space-y-3">
          <h3 className="font-semibold text-sm text-[var(--foreground)] flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" /> Active Fault Injection
          </h3>

          <div className="space-y-2.5 text-xs">
            <label className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] cursor-pointer">
              <span>Drop Gateway Settlement Batch (5%)</span>
              <input 
                type="checkbox"
                checked={injectMissingSettlement}
                onChange={(e) => setInjectMissingSettlement(e.target.checked)}
                className="w-4 h-4 accent-[#528FF0]"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] cursor-pointer">
              <span>MDR Commission Fee Overcharge (3%)</span>
              <input 
                type="checkbox"
                checked={injectFeeMismatch}
                onChange={(e) => setInjectFeeMismatch(e.target.checked)}
                className="w-4 h-4 accent-[#528FF0]"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] cursor-pointer">
              <span>Webhook Delivery Timeout / Latency (2%)</span>
              <input 
                type="checkbox"
                checked={injectWebhookDelay}
                onChange={(e) => setInjectWebhookDelay(e.target.checked)}
                className="w-4 h-4 accent-[#528FF0]"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-lg border border-[var(--border)] bg-[var(--muted)] cursor-pointer">
              <span>Duplicate Settlement Ledger Entry (1%)</span>
              <input 
                type="checkbox"
                checked={injectDuplicate}
                onChange={(e) => setInjectDuplicate(e.target.checked)}
                className="w-4 h-4 accent-[#528FF0]"
              />
            </label>
          </div>
        </div>

        {/* Live TPS & Latency Graph */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-semibold text-sm text-[var(--foreground)] flex items-center justify-between">
              <span>Throughput & Latency Trend</span>
              <span className="text-xs font-mono text-emerald-600 font-normal">Real-Time</span>
            </h3>
            <p className="text-xs text-[var(--muted-foreground)] mt-0.5">TPS execution vs millisecond latency</p>
          </div>

          <div className="h-[140px] w-full mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id="tpsGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#528FF0" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#528FF0" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
                <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#9CA3AF' }} />
                <Area type="monotone" dataKey="tps" stroke="#528FF0" strokeWidth={2} fillOpacity={1} fill="url(#tpsGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="text-[11px] text-[var(--muted-foreground)] flex items-center justify-between pt-2 border-t border-[var(--border)]">
            <span>Reconciliation Engine State:</span>
            <span className="text-emerald-600 font-semibold font-mono">100% Deterministic</span>
          </div>
        </div>

      </div>

      {/* Streaming Live Terminal Logs */}
      <div className="rounded-lg border border-slate-800 bg-[#0B132B] shadow-sm overflow-hidden text-white font-mono text-xs">
        <div className="p-3 bg-[#1E293B] border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-[#528FF0]" />
            <span className="font-semibold text-xs text-slate-200">Real-Time Webhook Reconciliation Log Stream</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsRunning(!isRunning)}
              className="text-[10px] px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 flex items-center gap-1 font-semibold transition-colors"
            >
              {isRunning ? <><Pause className="w-3 h-3 text-amber-400" /> Pause Stream</> : <><Play className="w-3 h-3 text-emerald-400" /> Resume Stream</>}
            </button>
            <span className="text-[10px] text-slate-400 bg-slate-900 px-2 py-1 rounded border border-slate-700">
              {logs.length} events
            </span>
          </div>
        </div>

        <div ref={terminalContainerRef} className="p-4 h-[240px] overflow-y-auto space-y-1.5 select-text">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
              <span className="text-slate-500 shrink-0 text-[11px]">{log.time}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] shrink-0 font-bold ${
                log.type === 'ANOMALY' 
                  ? 'bg-red-950 text-red-400 border border-red-800' 
                  : log.type === 'BURST'
                  ? 'bg-amber-950 text-amber-300 border border-amber-800'
                  : log.type === 'MATCH'
                  ? 'bg-emerald-950 text-emerald-400'
                  : 'bg-slate-800 text-slate-400'
              }`}>
                {log.type}
              </span>
              <span className={log.type === 'ANOMALY' ? 'text-red-300 font-medium' : log.type === 'BURST' ? 'text-amber-200 font-bold' : 'text-slate-300'}>
                {log.msg}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}
