'use client';

import { useEffect, useState } from 'react';
import { 
  Activity, 
  AlertCircle, 
  CheckCircle2, 
  CreditCard,
  TrendingDown,
  TrendingUp,
  RefreshCw,
  Search
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

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div className="flex items-center justify-between space-y-2">
        <div>
          <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
            Reconciliation Overview
          </h2>
          <p className="text-muted-foreground mt-1">
            Real-time financial matching and exception detection engine.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={fetchData}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow hover:bg-primary/90 h-10 px-4 py-2 group"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : 'group-hover:animate-spin'}`} />
            Refresh Data
          </button>
        </div>
      </div>

      {loading && !analytics ? (
        <div className="flex items-center justify-center h-[50vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {/* KPI Cards */}
            <div className="rounded-xl border bg-white dark:bg-slate-950 text-card-foreground shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Total Volume</h3>
                <Activity className="h-4 w-4 text-slate-500" />
              </div>
              <div className="p-6 pt-0">
                <div className="text-3xl font-bold">{analytics?.totalTransactions}</div>
                <p className="text-xs text-slate-500 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                  +20.1% from last month
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-white dark:bg-slate-950 text-card-foreground shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Match Rate</h3>
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
              </div>
              <div className="p-6 pt-0">
                <div className="text-3xl font-bold">{analytics?.matchRate}%</div>
                <p className="text-xs text-slate-500 mt-1 flex items-center">
                  <TrendingUp className="h-3 w-3 mr-1 text-emerald-500" />
                  +4.5% from yesterday
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-white dark:bg-slate-950 text-card-foreground shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute inset-0 bg-rose-500/5 transition-colors group-hover:bg-rose-500/10"></div>
              <div className="relative p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium text-rose-600 dark:text-rose-400">Open Exceptions</h3>
                <AlertCircle className="h-4 w-4 text-rose-500" />
              </div>
              <div className="relative p-6 pt-0">
                <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{analytics?.pending}</div>
                <p className="text-xs text-rose-500/80 mt-1 flex items-center">
                  Requires immediate attention
                </p>
              </div>
            </div>

            <div className="rounded-xl border bg-white dark:bg-slate-950 text-card-foreground shadow-sm hover:shadow-md transition-shadow">
              <div className="p-6 flex flex-row items-center justify-between space-y-0 pb-2">
                <h3 className="tracking-tight text-sm font-medium">Value at Risk</h3>
                <CreditCard className="h-4 w-4 text-amber-500" />
              </div>
              <div className="p-6 pt-0">
                <div className="text-3xl font-bold">{formatCurrency(analytics?.financialImpact)}</div>
                <p className="text-xs text-slate-500 mt-1 flex items-center">
                  <TrendingDown className="h-3 w-3 mr-1 text-amber-500" />
                  Across open exceptions
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
            {/* Chart */}
            <div className="col-span-4 rounded-xl border bg-white dark:bg-slate-950 text-card-foreground shadow-sm">
              <div className="p-6 flex flex-col space-y-1.5">
                <h3 className="font-semibold leading-none tracking-tight">Match Rate Trend</h3>
                <p className="text-sm text-slate-500">7-day automatic reconciliation performance</p>
              </div>
              <div className="p-6 pt-0 px-2 sm:px-6 h-[350px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                    <Tooltip 
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      itemStyle={{ color: '#0f172a', fontWeight: 500 }}
                    />
                    <Area type="monotone" dataKey="rate" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorRate)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Exceptions Table */}
            <div className="col-span-3 rounded-xl border bg-white dark:bg-slate-950 text-card-foreground shadow-sm">
              <div className="p-6 flex flex-col space-y-1.5 border-b">
                <h3 className="font-semibold leading-none tracking-tight">Recent Exceptions</h3>
                <p className="text-sm text-slate-500">Latest unresolved discrepancies</p>
              </div>
              <div className="p-0">
                <div className="relative w-full overflow-auto max-h-[350px]">
                  <table className="w-full caption-bottom text-sm">
                    <thead className="[&_tr]:border-b">
                      <tr className="border-b transition-colors hover:bg-slate-100/50 dark:hover:bg-slate-800/50 data-[state=selected]:bg-slate-100">
                        <th className="h-10 px-4 text-left align-middle font-medium text-slate-500">Type</th>
                        <th className="h-10 px-4 text-left align-middle font-medium text-slate-500">Impact</th>
                        <th className="h-10 px-4 text-right align-middle font-medium text-slate-500">Action</th>
                      </tr>
                    </thead>
                    <tbody className="[&_tr:last-child]:border-0">
                      {exceptions.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-8 text-center text-slate-500">No open exceptions found.</td>
                        </tr>
                      ) : (
                        exceptions.map((ex) => (
                          <tr key={ex.id} className="border-b transition-colors hover:bg-slate-50 dark:hover:bg-slate-900/50 group">
                            <td className="p-4 align-middle">
                              <div className="font-medium text-xs bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded w-fit text-slate-800 dark:text-slate-300">
                                {ex.type.replace(/_/g, ' ')}
                              </div>
                            </td>
                            <td className="p-4 align-middle font-semibold text-rose-600 dark:text-rose-400">
                              {formatCurrency(ex.financialImpact)}
                            </td>
                            <td className="p-4 align-middle text-right">
                              <a href={`/exceptions/${ex.id}`} className="inline-flex items-center justify-center rounded-md text-xs font-medium border bg-transparent hover:bg-slate-100 dark:hover:bg-slate-800 h-8 px-3 transition-colors text-primary opacity-0 group-hover:opacity-100">
                                <Search className="w-3 h-3 mr-1" /> View
                              </a>
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
