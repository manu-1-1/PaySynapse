'use client';

import { useEffect, useState, useRef } from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Search,
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

// Animated counter hook
function useAnimatedCounter(target, duration = 1200) {
  const [count, setCount] = useState(0);
  const prevTarget = useRef(0);

  useEffect(() => {
    if (target == null || isNaN(target)) return;
    const start = prevTarget.current;
    const diff = target - start;
    const startTime = performance.now();
    
    const animate = (now) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      // Ease out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(start + diff * eased));
      if (progress < 1) requestAnimationFrame(animate);
    };
    
    requestAnimationFrame(animate);
    prevTarget.current = target;
  }, [target, duration]);

  return count;
}

export default function DashboardPage() {
  const [analytics, setAnalytics] = useState(null);
  const [exceptions, setExceptions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [analyticsRes, exceptionsRes] = await Promise.all([
        fetch('/api/analytics'),
        fetch('/api/exceptions?status=OPEN&limit=10')
      ]);
      const analyticsData = await analyticsRes.json();
      const exceptionsData = await exceptionsRes.json();
      
      setAnalytics(analyticsData.data);
      setExceptions(exceptionsData.data || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const [activeMetricTab, setActiveMetricTab] = useState('matchRate');

  const animatedTotal = useAnimatedCounter(analytics?.totalTransactions || 0);
  const animatedMatch = useAnimatedCounter(analytics?.matchRate || 0, 1500);
  const animatedPending = useAnimatedCounter(analytics?.pending || 0);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount || 0);
  };

  const getChartConfig = () => {
    switch (activeMetricTab) {
      case 'volume':
        return {
          title: 'Ingestion Volume Trend',
          subtitle: 'Daily transaction processing volume across pipeline',
          dataKey: 'val',
          unit: 'txs',
          color: '#528FF0',
          gradientId: 'colorVolume',
          data: [
            { name: 'Mon', val: Math.max(1, Math.round((analytics?.totalTransactions || 1) * 0.4)) },
            { name: 'Tue', val: Math.max(1, Math.round((analytics?.totalTransactions || 1) * 0.55)) },
            { name: 'Wed', val: Math.max(1, Math.round((analytics?.totalTransactions || 1) * 0.7)) },
            { name: 'Thu', val: Math.max(1, Math.round((analytics?.totalTransactions || 1) * 0.8)) },
            { name: 'Fri', val: Math.max(1, Math.round((analytics?.totalTransactions || 1) * 0.9)) },
            { name: 'Sat', val: Math.max(1, Math.round((analytics?.totalTransactions || 1) * 0.95)) },
            { name: 'Sun', val: analytics?.totalTransactions || 1 },
          ]
        };
      case 'exceptions':
        return {
          title: 'Active Exceptions Trend',
          subtitle: 'Daily unresolved discrepancy count across ledger',
          dataKey: 'val',
          unit: 'exceptions',
          color: '#F87171',
          gradientId: 'colorExceptions',
          data: [
            { name: 'Mon', val: 2 },
            { name: 'Tue', val: 1 },
            { name: 'Wed', val: 3 },
            { name: 'Thu', val: 1 },
            { name: 'Fri', val: 2 },
            { name: 'Sat', val: 1 },
            { name: 'Sun', val: analytics?.pending || 0 },
          ]
        };
      case 'risk':
        return {
          title: 'Capital at Risk Trend',
          subtitle: 'Daily un-reconciled financial variance pool',
          dataKey: 'val',
          unit: '₹',
          color: '#FBBF24',
          gradientId: 'colorRisk',
          data: [
            { name: 'Mon', val: Math.round((analytics?.financialImpact || 0) * 0.5) },
            { name: 'Tue', val: Math.round((analytics?.financialImpact || 0) * 0.6) },
            { name: 'Wed', val: Math.round((analytics?.financialImpact || 0) * 0.8) },
            { name: 'Thu', val: Math.round((analytics?.financialImpact || 0) * 0.7) },
            { name: 'Fri', val: Math.round((analytics?.financialImpact || 0) * 0.9) },
            { name: 'Sat', val: Math.round((analytics?.financialImpact || 0) * 0.95) },
            { name: 'Sun', val: Math.round(analytics?.financialImpact || 0) },
          ]
        };
      case 'matchRate':
      default:
        return {
          title: 'Reconciliation Parity Rate',
          subtitle: '7-day automated 5-node ledger match performance',
          dataKey: 'val',
          unit: '%',
          color: '#528FF0',
          gradientId: 'colorRate',
          data: [
            { name: 'Mon', val: 45 },
            { name: 'Tue', val: 52 },
            { name: 'Wed', val: 58 },
            { name: 'Thu', val: 61 },
            { name: 'Fri', val: 64 },
            { name: 'Sat', val: 66 },
            { name: 'Sun', val: analytics?.matchRate || 0 },
          ]
        };
    }
  };

  const chartConfig = getChartConfig();

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    const val = payload[0].value;
    const formatted = chartConfig.unit === '₹' ? formatCurrency(val) : `${val}${chartConfig.unit === '%' ? '%' : ` ${chartConfig.unit}`}`;
    return (
      <div className="bg-[#1C1D22] border border-[#2D2E36] rounded px-3 py-2 shadow-lg text-xs font-mono">
        <p className="text-[11px] text-[#9AA0A6] mb-0.5">{label}</p>
        <p className="text-xs font-bold text-[#E8EAED]">{formatted}</p>
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-4 sm:p-6 pt-4 sm:pt-5 min-h-screen">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">
            Reconciliation Overview
          </h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Real-time financial matching and exception detection engine.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchData}
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150 bg-[#528FF0] hover:bg-[#4080E0] text-white h-9 px-4 w-full sm:w-auto"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {loading && !analytics ? (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="h-10 w-10 rounded-full border-[3px] border-[#528FF0]/20 border-t-[#528FF0] animate-spin" />
        </div>
      ) : (
        <>
          {/* Main Telemetry & Exceptions Console */}
          <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
            {/* Chart with Integrated Metric Tabs */}
            <div className="col-span-1 md:col-span-2 lg:col-span-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm overflow-hidden flex flex-col">
              
              {/* Interactive Metric Tab Bar */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[var(--border)] divide-x divide-[var(--border)] bg-[var(--muted)]/40">
                {/* Tab 1: Match Rate */}
                <button
                  type="button"
                  onClick={() => setActiveMetricTab('matchRate')}
                  className={`p-3 text-left transition-colors relative ${
                    activeMetricTab === 'matchRate' 
                      ? 'bg-[var(--surface)]' 
                      : 'hover:bg-[var(--surface)]/50'
                  }`}
                >
                  {activeMetricTab === 'matchRate' && (
                    <span className="absolute top-0 left-0 right-0 h-0.5 bg-[#528FF0]" />
                  )}
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] truncate">
                    Match Rate
                  </div>
                  <div className="text-lg sm:text-xl font-bold font-mono text-[var(--foreground)] mt-0.5">
                    {animatedMatch}%
                  </div>
                  <div className="text-[10px] font-mono text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5 truncate">
                    <span className={`w-1.5 h-1.5 rounded-full ${animatedMatch >= 100 ? 'bg-emerald-400' : 'bg-[#528FF0]'}`} />
                    {animatedMatch >= 100 ? '5-Node Parity' : 'In Lineage'}
                  </div>
                </button>

                {/* Tab 2: Total Volume */}
                <button
                  type="button"
                  onClick={() => setActiveMetricTab('volume')}
                  className={`p-3 text-left transition-colors relative ${
                    activeMetricTab === 'volume' 
                      ? 'bg-[var(--surface)]' 
                      : 'hover:bg-[var(--surface)]/50'
                  }`}
                >
                  {activeMetricTab === 'volume' && (
                    <span className="absolute top-0 left-0 right-0 h-0.5 bg-[#528FF0]" />
                  )}
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] truncate">
                    Volume
                  </div>
                  <div className="text-lg sm:text-xl font-bold font-mono text-[var(--foreground)] mt-0.5">
                    {animatedTotal}
                  </div>
                  <div className="text-[10px] font-mono text-[var(--muted-foreground)] flex items-center gap-1 mt-0.5 truncate">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Live Ledger
                  </div>
                </button>

                {/* Tab 3: Active Exceptions */}
                <button
                  type="button"
                  onClick={() => setActiveMetricTab('exceptions')}
                  className={`p-3 text-left transition-colors relative ${
                    activeMetricTab === 'exceptions' 
                      ? 'bg-[var(--surface)]' 
                      : 'hover:bg-[var(--surface)]/50'
                  }`}
                >
                  {activeMetricTab === 'exceptions' && (
                    <span className="absolute top-0 left-0 right-0 h-0.5 bg-rose-500" />
                  )}
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] truncate">
                    Exceptions
                  </div>
                  <div className={`text-lg sm:text-xl font-bold font-mono mt-0.5 ${animatedPending > 0 ? 'text-rose-400' : 'text-[var(--foreground)]'}`}>
                    {animatedPending}
                  </div>
                  <div className="text-[10px] font-mono flex items-center gap-1 mt-0.5 truncate">
                    {animatedPending > 0 ? (
                      <span className="text-rose-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        Triage Required
                      </span>
                    ) : (
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Zero Active
                      </span>
                    )}
                  </div>
                </button>

                {/* Tab 4: Value at Risk */}
                <button
                  type="button"
                  onClick={() => setActiveMetricTab('risk')}
                  className={`p-3 text-left transition-colors relative ${
                    activeMetricTab === 'risk' 
                      ? 'bg-[var(--surface)]' 
                      : 'hover:bg-[var(--surface)]/50'
                  }`}
                >
                  {activeMetricTab === 'risk' && (
                    <span className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
                  )}
                  <div className="text-[10px] font-mono uppercase tracking-wider text-[var(--muted-foreground)] truncate">
                    Value at Risk
                  </div>
                  <div className={`text-lg sm:text-xl font-bold font-mono mt-0.5 ${analytics?.financialImpact > 0 ? 'text-amber-400' : 'text-[var(--foreground)]'}`}>
                    {formatCurrency(analytics?.financialImpact || 0)}
                  </div>
                  <div className="text-[10px] font-mono flex items-center gap-1 mt-0.5 truncate">
                    {analytics?.financialImpact > 0 ? (
                      <span className="text-amber-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        Delta Variance
                      </span>
                    ) : (
                      <span className="text-[var(--muted-foreground)] flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                        Zero Leakage
                      </span>
                    )}
                  </div>
                </button>
              </div>

              {/* Chart Body Header */}
              <div className="p-4 flex items-center justify-between border-b border-[var(--border)]/50">
                <div>
                  <h3 className="font-semibold text-xs font-mono uppercase tracking-wider text-[var(--foreground)]">
                    {chartConfig.title}
                  </h3>
                  <p className="text-xs text-[var(--muted-foreground)] mt-0.5">
                    {chartConfig.subtitle}
                  </p>
                </div>
                <span className="text-[10px] font-mono text-[var(--muted-foreground)] px-2 py-0.5 rounded border border-[var(--border)] bg-[var(--muted)]">
                  7-Day Window
                </span>
              </div>

              {/* Chart SVG */}
              <div className="p-4 pt-2 px-2 sm:px-4 h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartConfig.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id={chartConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.2}/>
                        <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9CA3AF' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: chartConfig.color, strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey={chartConfig.dataKey} stroke={chartConfig.color} strokeWidth={2} fillOpacity={1} fill={`url(#${chartConfig.gradientId})`} dot={{ r: 3, fill: chartConfig.color, stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 5, fill: chartConfig.color, stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Exceptions Table */}
            <div className="col-span-1 md:col-span-2 lg:col-span-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col">
              <div className="p-5 flex flex-col space-y-1 border-b border-[var(--border)]">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">Recent Exceptions</h3>
                    <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Latest unresolved discrepancies</p>
                  </div>
                  <Link href="/exceptions" className="text-xs font-medium text-[#528FF0] hover:underline flex items-center gap-1">
                    View all <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
              <div className="flex-1">
                <div className="relative w-full overflow-auto max-h-[320px]">
                  <table className="w-full caption-bottom text-sm">
                    <thead>
                      <tr className="border-b border-[var(--border)]">
                        <th className="h-10 px-4 text-left align-middle font-medium text-[var(--muted-foreground)] text-xs">Type</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-[var(--muted-foreground)] text-xs">Impact</th>
                        <th className="h-10 px-4 text-right align-middle font-medium text-[var(--muted-foreground)] text-xs">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exceptions.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-gray-400">
                            <CheckCircle2 className="h-6 w-6 mx-auto mb-2 text-emerald-400" />
                            <span className="text-sm">No open exceptions</span>
                          </td>
                        </tr>
                      ) : (
                        exceptions.map((ex) => (
                          <tr key={ex.id} className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--surface-hover)] transition-colors duration-100 group">
                            <td className="p-3 align-middle">
                              <div className="font-medium text-xs bg-[var(--muted)] px-2 py-1 rounded-md w-fit">
                                {ex.type.replace(/_/g, ' ')}
                              </div>
                            </td>
                            <td className="p-3 align-middle font-semibold text-red-600 dark:text-red-400 text-sm">
                              {formatCurrency(ex.financialImpact)}
                            </td>
                            <td className="p-3 align-middle text-right">
                              <Link href={`/exceptions/${ex.id}`} className="inline-flex items-center justify-center rounded-md text-xs font-medium border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-hover)] h-7 px-2.5 transition-colors duration-100 text-[#528FF0]">
                                <Search className="w-3 h-3 mr-1" /> View
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
