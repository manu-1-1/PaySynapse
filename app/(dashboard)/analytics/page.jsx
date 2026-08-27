'use client';

import { useEffect, useState } from 'react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, AlertTriangle, CheckCircle2, IndianRupee, BarChart3 } from 'lucide-react';

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
    return (
      <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
        <div className="relative">
          <div className="h-14 w-14 rounded-full border-[3px] border-emerald-500/20 border-t-emerald-500 animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center">
            <Activity className="h-5 w-5 text-emerald-500 animate-pulse" />
          </div>
        </div>
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
      <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-border/50 rounded-xl px-4 py-3 shadow-xl shadow-black/5 dark:shadow-black/20">
        <p className="text-xs text-slate-500 font-medium mb-2">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-xs font-semibold" style={{ color: p.color }}>
            {p.name}: {p.value}%
          </p>
        ))}
      </div>
    );
  };

  const kpiCards = [
    { label: 'Total Processed', value: data?.totalTransactions, icon: Activity, color: 'blue', gradient: 'from-blue-500 to-indigo-500' },
    { label: 'Global Match Rate', value: `${data?.matchRate}%`, icon: CheckCircle2, color: 'emerald', gradient: 'from-emerald-500 to-teal-500', valueClass: 'text-emerald-600 dark:text-emerald-400' },
    { label: 'Open Exceptions', value: data?.pending, icon: AlertTriangle, color: 'amber', gradient: 'from-amber-500 to-orange-500', valueClass: 'text-amber-600 dark:text-amber-400' },
    { label: 'Risk Exposure', value: formatCurrency(data?.financialImpact), icon: IndianRupee, color: 'rose', gradient: 'from-rose-500 to-pink-500', valueClass: 'text-rose-600 dark:text-rose-400' },
  ];

  return (
    <div className="flex-1 space-y-6 p-8 pt-6 min-h-screen">
      <div className="animate-fade-in-up">
        <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3 bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 bg-clip-text text-transparent">
          <div className="p-2.5 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg shadow-emerald-500/20">
            <BarChart3 className="h-5 w-5 text-white" />
          </div>
          Operations Analytics
        </h2>
        <p className="text-muted-foreground mt-1">
          Deep insights into reconciliation health and settlement efficiency.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-5 md:grid-cols-4">
        {kpiCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div 
              key={card.label}
              className={`animate-fade-in-up stagger-${idx + 1} group relative rounded-2xl border border-border/50 bg-white dark:bg-slate-950/60 backdrop-blur-sm p-6 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden`}
            >
              <div className={`absolute top-0 inset-x-0 h-[2px] bg-gradient-to-r ${card.gradient} opacity-60 group-hover:opacity-100 transition-opacity`} />
              <div className={`flex items-center text-${card.color}-500 mb-3`}>
                <div className={`p-2 rounded-xl bg-${card.color}-50 dark:bg-${card.color}-950/30 mr-3`}>
                  <Icon className="w-4 h-4" />
                </div>
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{card.label}</span>
              </div>
              <div className={`text-3xl font-bold tracking-tight ${card.valueClass || ''}`}>{card.value}</div>
            </div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Exception Distribution */}
        <div className="animate-fade-in-up stagger-5 rounded-2xl border border-border/50 bg-white dark:bg-slate-950/60 backdrop-blur-sm shadow-sm p-6">
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
                  strokeWidth={0}
                >
                  {exceptionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend verticalAlign="bottom" height={36} formatter={(value) => <span className="text-xs text-slate-500">{value}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Settlement Velocity */}
        <div className="animate-fade-in-up stagger-6 rounded-2xl border border-border/50 bg-white dark:bg-slate-950/60 backdrop-blur-sm shadow-sm p-6">
          <h3 className="font-semibold mb-4">Settlement Velocity (T+ Days)</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={delayData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border)" strokeOpacity={0.5} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend formatter={(value) => <span className="text-xs text-slate-500">{value}</span>} />
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
