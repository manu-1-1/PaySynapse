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
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 shadow-md">
        <p className="text-xs text-[var(--muted-foreground)] font-medium mb-0.5">{label}</p>
        <p className="text-sm font-bold text-[var(--foreground)]">{payload[0].value}% match rate</p>
      </div>
    );
  };

  return (
    <div className="flex-1 space-y-6 p-6 pt-5 min-h-screen">
      {/* Page Header */}
      <div className="flex items-center justify-between">
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
            className="inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors duration-150 bg-[#528FF0] hover:bg-[#4080E0] text-white h-9 px-4"
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
          {/* KPI Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {/* Total Volume */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5 flex flex-row items-center justify-between pb-2">
                <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Total Volume</h3>
                <div className="p-1.5 rounded-md bg-blue-50 dark:bg-blue-900/20">
                  <Activity className="h-4 w-4 text-[#528FF0]" />
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="text-2xl font-bold tracking-tight">{animatedTotal}</div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1.5 flex items-center">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-md text-[11px]">
                    <TrendingUp className="h-3 w-3" />
                    +20.1%
                  </span>
                  <span className="ml-1.5">from last month</span>
                </p>
              </div>
            </div>

            {/* Match Rate */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5 flex flex-row items-center justify-between pb-2">
                <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Match Rate</h3>
                <div className="p-1.5 rounded-md bg-emerald-50 dark:bg-emerald-900/20">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="text-2xl font-bold tracking-tight">{animatedMatch}%</div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1.5 flex items-center">
                  <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded-md text-[11px]">
                    <TrendingUp className="h-3 w-3" />
                    +4.5%
                  </span>
                  <span className="ml-1.5">from yesterday</span>
                </p>
              </div>
            </div>

            {/* Open Exceptions */}
            <div className="rounded-lg border border-red-200 dark:border-red-800/30 bg-[var(--surface)] shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5 flex flex-row items-center justify-between pb-2">
                <h3 className="text-sm font-medium text-red-600 dark:text-red-400">Open Exceptions</h3>
                <div className="p-1.5 rounded-md bg-red-50 dark:bg-red-900/20">
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="text-2xl font-bold tracking-tight text-red-600 dark:text-red-400">{animatedPending}</div>
                <p className="text-xs text-red-500/80 mt-1.5 font-medium">
                  Requires immediate attention
                </p>
              </div>
            </div>

            {/* Value at Risk */}
            <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm hover:shadow-md transition-shadow duration-200">
              <div className="p-5 flex flex-row items-center justify-between pb-2">
                <h3 className="text-sm font-medium text-[var(--muted-foreground)]">Value at Risk</h3>
                <div className="p-1.5 rounded-md bg-amber-50 dark:bg-amber-900/20">
                  <CreditCard className="h-4 w-4 text-amber-500" />
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="text-2xl font-bold tracking-tight">{formatCurrency(analytics?.financialImpact)}</div>
                <p className="text-xs text-[var(--muted-foreground)] mt-1.5 flex items-center">
                  <span className="inline-flex items-center gap-1 text-amber-600 dark:text-amber-400 font-semibold bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-md text-[11px]">
                    <TrendingDown className="h-3 w-3" />
                    At risk
                  </span>
                  <span className="ml-1.5">across open exceptions</span>
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-7">
            {/* Chart */}
            <div className="col-span-4 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm">
              <div className="p-5 flex flex-col space-y-1">
                <h3 className="font-semibold text-sm">Match Rate Trend</h3>
                <p className="text-xs text-[var(--muted-foreground)]">7-day automatic reconciliation performance</p>
              </div>
              <div className="p-5 pt-0 px-2 sm:px-5 h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#528FF0" stopOpacity={0.15}/>
                        <stop offset="95%" stopColor="#528FF0" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                    <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#528FF0', strokeWidth: 1, strokeDasharray: '4 4' }} />
                    <Area type="monotone" dataKey="rate" stroke="#528FF0" strokeWidth={2} fillOpacity={1} fill="url(#colorRate)" dot={{ r: 3, fill: '#528FF0', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 5, fill: '#528FF0', stroke: '#fff', strokeWidth: 2 }} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Exceptions Table */}
            <div className="col-span-3 rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm flex flex-col">
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
