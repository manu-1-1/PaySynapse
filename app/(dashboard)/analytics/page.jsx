'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, IndianRupee, BarChart3, Download } from 'lucide-react';

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

  const COLORS = ['#EF4444', '#F59E0B', '#528FF0', '#10B981', '#8B5CF6'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="h-10 w-10 rounded-full border-[3px] border-[#528FF0]/20 border-t-[#528FF0] animate-spin" />
      </div>
    );
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

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-[var(--surface)] border border-[var(--border)] rounded-lg px-3 py-2 shadow-md">
        <p className="text-xs text-[var(--muted-foreground)] font-medium mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}%
          </p>
        ))}
      </div>
    );
  };

  const kpiCards = [
    { label: 'Total Processed', value: data?.totalTransactions, icon: Activity, color: '#528FF0', bgClass: 'bg-blue-50 dark:bg-blue-900/20' },
    { label: 'Global Match Rate', value: `${data?.matchRate}%`, icon: CheckCircle2, color: '#10B981', bgClass: 'bg-emerald-50 dark:bg-emerald-900/20', valueClass: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Open Exceptions', value: data?.pending, icon: AlertTriangle, color: '#F59E0B', bgClass: 'bg-amber-50 dark:bg-amber-900/20', valueClass: 'text-amber-600 dark:text-amber-400' },
    { label: 'Risk Exposure', value: formatCurrency(data?.financialImpact), icon: IndianRupee, color: '#EF4444', bgClass: 'bg-red-50 dark:bg-red-900/20', valueClass: 'text-red-600 dark:text-red-400' },
  ];

  return (
    <div className="flex-1 space-y-5 p-6 pt-5 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold text-[var(--foreground)]">Operations Analytics</h2>
          <p className="text-sm text-[var(--muted-foreground)] mt-0.5">
            Deep insights into reconciliation health, settlement velocity, and exception distribution.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        {kpiCards.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <div key={idx} className="rounded-lg border border-[var(--border)] bg-[var(--surface)] p-5 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[var(--muted-foreground)] uppercase tracking-wider">{kpi.label}</span>
                <div className={`p-2 rounded-md ${kpi.bgClass}`}>
                  <Icon className="w-4 h-4" style={{ color: kpi.color }} />
                </div>
              </div>
              <div className="mt-3">
                <div className={`text-2xl font-bold ${kpi.valueClass || 'text-[var(--foreground)]'}`}>
                  {kpi.value ?? 0}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Exception Distribution */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm p-5">
          <h3 className="font-semibold text-sm mb-4">Exception Distribution</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={exceptionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {exceptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-[var(--muted-foreground)]">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Settlement Velocity */}
        <div className="rounded-lg border border-[var(--border)] bg-[var(--surface)] shadow-sm p-5">
          <h3 className="font-semibold text-sm mb-4">Settlement Velocity (T+ Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.6} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-xs text-[var(--muted-foreground)]">{value}</span>} />
                <Bar dataKey="t0" stackId="a" fill="#10B981" name="T+0 (Same Day)" radius={[0, 0, 4, 4]} />
                <Bar dataKey="t1" stackId="a" fill="#528FF0" name="T+1" />
                <Bar dataKey="t2" stackId="a" fill="#F59E0B" name="T+2" />
                <Bar dataKey="delayed" stackId="a" fill="#EF4444" name="T+3 or more" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
