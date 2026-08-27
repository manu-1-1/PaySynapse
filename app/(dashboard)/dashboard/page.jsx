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

  const animatedTotal = useAnimatedCounter(analytics?.totalTransactions || 0);
  const animatedMatch = useAnimatedCounter(analytics?.matchRate || 0, 1500);
  const animatedPending = useAnimatedCounter(analytics?.pending || 0);

  // Mock trend data since we don't have historical data stored
  const trendData = [
    { name: 'Mon', rate: 45 },
    { name: 'Tue', rate: 52 },
    { name: 'Wed', rate: 58 },
    { name: 'Thu', rate: 61 },
    { name: 'Fri', rate: 64 },
    { name: 'Sat', rate: 66 },
    { name: 'Sun', rate: analytics?.matchRate || 0 },
  ];

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-border/50 rounded-xl px-4 py-3 shadow-xl shadow-black/5 dark:shadow-black/20">
        <p className="text-xs text-slate-500 font-medium mb-1">{label}</p>
        <p className="text-sm font-bold text-slate-800 dark:text-slate-100">{payload[0].value}% match rate</p>
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between animate-fade-in-up stagger-1">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-500 dark:from-white dark:via-slate-300 dark:to-slate-500 bg-clip-text text-transparent">
            Reconciliation Overview
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time financial matching and exception detection engine.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchData}
            className="inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-300 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 h-10 px-5 group"
          >
            <RefreshCw className={`mr-2 h-4 w-4 transition-transform duration-500 ${loading ? 'animate-spin' : 'group-hover:rotate-180'}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {loading && !analytics ? (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="relative">
            <div className="h-14 w-14 rounded-full border-[3px] border-blue-500/20 border-t-blue-500 animate-spin" />
            <div className="absolute inset-0 flex items-center justify-center">
              <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Volume */}
            <div className="animate-fade-in-up stagger-1 group relative rounded-2xl border border-border/50 bg-white dark:bg-slate-950/60 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-blue-500 to-indigo-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="p-6 flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-medium text-slate-500 dark:text-slate-400">Total Volume</h3>
                <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/30">
                  <Activity className="h-4 w-4 text-blue-500" />
                </div>
              </div>
              <div className="p-6 pt-0">
                <div className="text-3xl font-bold tracking-tight">{animatedTotal}</div>
                <p className="text-xs text-slate-500 mt-2 flex items-center">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                    <TrendingUp className="h-3 w-3" />
                    +20.1%
                  </span>
                  <span className="ml-2 text-slate-400">from last month</span>
                </p>
              </div>
            </div>

            {/* Match Rate */}
            <div className="animate-fade-in-up stagger-2 group relative rounded-2xl border border-border/50 bg-white dark:bg-slate-950/60 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="p-6 flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-medium text-slate-500 dark:text-slate-400">Match Rate</h3>
                <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
              <div className="p-6 pt-0">
                <div className="text-3xl font-bold tracking-tight">{animatedMatch}%</div>
                <p className="text-xs text-slate-500 mt-2 flex items-center">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full">
                    <TrendingUp className="h-3 w-3" />
                    +4.5%
                  </span>
                  <span className="ml-2 text-slate-400">from yesterday</span>
                </p>
              </div>
            </div>

            {/* Open Exceptions */}
            <div className="animate-fade-in-up stagger-3 group relative rounded-2xl border border-rose-200/60 dark:border-rose-900/30 bg-white dark:bg-slate-950/60 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-rose-500 to-orange-500 opacity-80 group-hover:opacity-100 transition-opacity" />
              <div className="absolute inset-0 bg-rose-500/[0.02] group-hover:bg-rose-500/[0.04] transition-colors duration-500" />
              <div className="relative p-6 flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-medium text-rose-600 dark:text-rose-400">Open Exceptions</h3>
                <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/30">
                  <AlertCircle className="h-4 w-4 text-rose-500" />
                </div>
              </div>
              <div className="relative p-6 pt-0">
                <div className="text-3xl font-bold tracking-tight text-rose-600 dark:text-rose-400">{animatedPending}</div>
                <p className="text-xs text-rose-500/80 mt-2 flex items-center font-medium">
                  Requires immediate attention
                </p>
              </div>
            </div>

            {/* Value at Risk */}
            <div className="animate-fade-in-up stagger-4 group relative rounded-2xl border border-border/50 bg-white dark:bg-slate-950/60 backdrop-blur-sm shadow-sm hover:shadow-xl hover:shadow-amber-500/5 transition-all duration-500 overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r from-amber-500 to-orange-500 opacity-60 group-hover:opacity-100 transition-opacity" />
              <div className="p-6 flex flex-row items-center justify-between pb-2">
                <h3 className="tracking-tight text-sm font-medium text-slate-500 dark:text-slate-400">Value at Risk</h3>
                <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/30">
                  <CreditCard className="h-4 w-4 text-amber-500" />
                </div>
              </div>
              <div className="p-6 pt-0">
                <div className="text-3xl font-bold tracking-tight">{formatCurrency(analytics?.financialImpact)}</div>
                <p className="text-xs text-slate-500 mt-2 flex items-center">
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-950/30 px-2 py-0.5 rounded-full">
                    <TrendingDown className="h-3 w-3" />
                    At risk
                  </span>
                  <span className="ml-2 text-slate-400">across open exceptions</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {/* Chart */}
            <div className="col-span-4 animate-fade-in-up stagger-5 rounded-2xl border border-border/50 bg-white dark:bg-slate-950/60 backdrop-blur-sm shadow-sm">
              <div className="p-6 flex flex-col space-y-1.5">
                <h3 className="font-semibold leading-none tracking-tight">Match Rate Trend</h3>
                <p className="text-sm text-slate-500">7-day automatic reconciliation performance</p>
              </div>
              <div className="p-6 pt-0 px-2 sm:px-6 h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRate)" dot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6, fill: '#3b82f6', stroke: '#fff', strokeWidth: 3, className: 'drop-shadow-lg' }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Exceptions Table */}
            <div className="col-span-3 animate-fade-in-up stagger-6 rounded-2xl border border-border/50 bg-white dark:bg-slate-950/60 backdrop-blur-sm shadow-sm flex flex-col">
              <div className="p-6 flex flex-col space-y-1.5 border-b border-border/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold leading-none tracking-tight">Recent Exceptions</h3>
                    <p className="text-sm text-slate-500 mt-1">Latest unresolved discrepancies</p>
                  </div>
                  <Link href="/exceptions" className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                    View all <ArrowUpRight className="h-3 w-3" />
                  </Link>
                </div>
              </div>
              <div className="flex-1">
                <div className="relative w-full overflow-auto max-h-[350px]">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b border-border/50 transition-colors">
                        <th className="h-10 px-4 text-left align-middle font-medium text-slate-500 text-xs uppercase tracking-wider">Type</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-slate-500 text-xs uppercase tracking-wider">Impact</th>
                        <th className="h-10 px-4 text-right align-middle font-medium text-slate-500 text-xs uppercase tracking-wider">Action</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {exceptions.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-slate-400">
                            <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-emerald-400" />
                            <span className="text-sm">No open exceptions</span>
                          </td>
                        </tr>
                      ) : (
                        exceptions.map((ex, idx) => (
                          <tr key={ex.id} className="border-b border-border/30 transition-all duration-200 hover:bg-blue-50/30 dark:hover:bg-blue-950/10 group" style={{ animationDelay: `${idx * 60}ms` }}>
                            <td className="p-4 align-middle">
                              <div className="font-medium text-xs bg-slate-100 dark:bg-slate-800/60 px-2.5 py-1 rounded-lg w-fit text-slate-700 dark:text-slate-300">
                                {ex.type.replace(/_/g, ' ')}
                              </div>
                            </td>
                            <td className="p-4 align-middle font-semibold text-rose-600 dark:text-rose-400 text-sm">
                              {formatCurrency(ex.financialImpact)}
                            </td>
                            <td className="p-4 align-middle text-right">
                              <Link href={`/exceptions/${ex.id}`} className="inline-flex items-center justify-center rounded-lg text-xs font-medium border border-border/50 bg-white dark:bg-slate-900 hover:bg-blue-50 dark:hover:bg-blue-950/20 h-8 px-3 transition-all duration-200 text-blue-600 dark:text-blue-400 opacity-0 group-hover:opacity-100 translate-x-1 group-hover:translate-x-0">
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
