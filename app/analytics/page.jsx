'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, IndianRupee } from 'lucide-react';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch('/api/analytics');
        const json = await res.json();
        setData(json.data);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);
  };

  const COLORS = ['#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];

  if (loading) {
    return <div className="flex items-center justify-center h-[calc(100vh-4rem)]"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  // Fallback if exception distribution is empty
  const exceptionData = data?.exceptionDistribution?.length > 0 
    ? data.exceptionDistribution 
    : [{ name: 'None', value: 1 }];

  // Mocking settlement delays for visual demonstration
  const delayData = [
    { day: 'Mon', t0: 45, t1: 30, t2: 15, delayed: 10 },
    { day: 'Tue', t0: 50, t1: 25, t2: 20, delayed: 5 },
    { day: 'Wed', t0: 55, t1: 20, t2: 15, delayed: 10 },
    { day: 'Thu', t0: 60, t1: 25, t2: 10, delayed: 5 },
    { day: 'Fri', t0: 65, t1: 20, t2: 10, delayed: 5 },
    { day: 'Sat', t0: 80, t1: 10, t2: 5, delayed: 5 },
    { day: 'Sun', t0: 85, t1: 5, t2: 5, delayed: 5 },
  ];

  return (
    <div className="flex-1 space-y-8 p-8 pt-6 bg-slate-50 dark:bg-slate-900 min-h-screen">
      <div>
        <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-emerald-500 to-teal-400 bg-clip-text text-transparent">
          Operations Analytics
        </h2>
        <p className="text-muted-foreground mt-1">
          Deep insights into reconciliation health and settlement efficiency.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-4">
        <div className="rounded-xl border bg-white dark:bg-slate-950 p-6 shadow-sm">
          <div className="flex items-center text-slate-500 mb-2">
            <Activity className="w-4 h-4 mr-2" /> <span>Total Processed</span>
          </div>
          <div className="text-3xl font-bold">{data?.totalTransactions}</div>
        </div>
        <div className="rounded-xl border bg-white dark:bg-slate-950 p-6 shadow-sm">
          <div className="flex items-center text-emerald-500 mb-2">
            <CheckCircle2 className="w-4 h-4 mr-2" /> <span>Global Match Rate</span>
          </div>
          <div className="text-3xl font-bold text-emerald-600 dark:text-emerald-400">{data?.matchRate}%</div>
        </div>
        <div className="rounded-xl border bg-white dark:bg-slate-950 p-6 shadow-sm">
          <div className="flex items-center text-amber-500 mb-2">
            <AlertTriangle className="w-4 h-4 mr-2" /> <span>Open Exceptions</span>
          </div>
          <div className="text-3xl font-bold text-amber-600 dark:text-amber-400">{data?.pending}</div>
        </div>
        <div className="rounded-xl border bg-white dark:bg-slate-950 p-6 shadow-sm">
          <div className="flex items-center text-rose-500 mb-2">
            <IndianRupee className="w-4 h-4 mr-2" /> <span>Risk Exposure</span>
          </div>
          <div className="text-3xl font-bold text-rose-600 dark:text-rose-400">{formatCurrency(data?.financialImpact)}</div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Exception Distribution */}
        <div className="rounded-xl border bg-white dark:bg-slate-950 shadow-sm p-6">
          <h3 className="font-semibold mb-4">Exception Distribution</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={exceptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {exceptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Settlement Velocity */}
        <div className="rounded-xl border bg-white dark:bg-slate-950 shadow-sm p-6">
          <h3 className="font-semibold mb-4">Settlement Velocity (T+ Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
                <Tooltip 
                  contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                />
                <Legend />
                <Bar dataKey="t0" stackId="a" fill="#10b981" name="T+0 (Same Day)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="t1" stackId="a" fill="#3b82f6" name="T+1" />
                <Bar dataKey="t2" stackId="a" fill="#f59e0b" name="T+2" />
                <Bar dataKey="delayed" stackId="a" fill="#ef4444" name="T+3 or more" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
