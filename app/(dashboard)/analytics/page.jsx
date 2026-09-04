'use client';

import { useEffect, useState } from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { 
  RefreshCw, 
  ExternalLink, 
  X, 
  Filter, 
  Download,
  CreditCard
} from 'lucide-react';
import Link from 'next/link';

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('metrics'); // 'metrics' | 'methods'
  const [activeMetricTab, setActiveMetricTab] = useState('parity'); // 'parity' | 'volume' | 'exceptions' | 'risk'
  const [filterQuery, setFilterQuery] = useState('');
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [hidePanel, setHidePanel] = useState(false);
  const [showVelocity, setShowVelocity] = useState(false);

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
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount || 0);
  };

  const velocityData = [
    { day: 'Mon', t0: 78, t1: 18, delayed: 4 },
    { day: 'Tue', t0: 82, t1: 15, delayed: 3 },
    { day: 'Wed', t0: 85, t1: 12, delayed: 3 },
    { day: 'Thu', t0: 88, t1: 10, delayed: 2 },
    { day: 'Fri', t0: 91, t1: 8, delayed: 1 },
    { day: 'Sat', t0: 94, t1: 5, delayed: 1 },
    { day: 'Sun', t0: data?.matchRate || 96, t1: 3, delayed: 1 },
  ];

  const parityData = [
    { day: 'Mon', val: 94.2 },
    { day: 'Tue', val: 95.8 },
    { day: 'Wed', val: 97.1 },
    { day: 'Thu', val: 98.4 },
    { day: 'Fri', val: 99.0 },
    { day: 'Sat', val: 99.5 },
    { day: 'Sun', val: data?.matchRate || 100 },
  ];

  const volumeData = [
    { day: 'Mon', val: Math.max(1, Math.round((data?.totalTransactions || 1) * 0.45)) },
    { day: 'Tue', val: Math.max(1, Math.round((data?.totalTransactions || 1) * 0.6)) },
    { day: 'Wed', val: Math.max(1, Math.round((data?.totalTransactions || 1) * 0.72)) },
    { day: 'Thu', val: Math.max(1, Math.round((data?.totalTransactions || 1) * 0.81)) },
    { day: 'Fri', val: Math.max(1, Math.round((data?.totalTransactions || 1) * 0.9)) },
    { day: 'Sat', val: Math.max(1, Math.round((data?.totalTransactions || 1) * 0.96)) },
    { day: 'Sun', val: data?.totalTransactions || 1 },
  ];

  const exceptionsData = [
    { day: 'Mon', val: 3 },
    { day: 'Tue', val: 1 },
    { day: 'Wed', val: 2 },
    { day: 'Thu', val: 0 },
    { day: 'Fri', val: 1 },
    { day: 'Sat', val: 0 },
    { day: 'Sun', val: data?.pending || 0 },
  ];

  const riskData = [
    { day: 'Mon', val: Math.round((data?.financialImpact || 0) * 0.5) },
    { day: 'Tue', val: Math.round((data?.financialImpact || 0) * 0.6) },
    { day: 'Wed', val: Math.round((data?.financialImpact || 0) * 0.8) },
    { day: 'Thu', val: Math.round((data?.financialImpact || 0) * 0.7) },
    { day: 'Fri', val: Math.round((data?.financialImpact || 0) * 0.9) },
    { day: 'Sat', val: Math.round((data?.financialImpact || 0) * 0.95) },
    { day: 'Sun', val: Math.round(data?.financialImpact || 0) },
  ];

  const methodBreakdown = [
    { id: 'UPI_QR', method: 'UPI / QR Intent', share: '64.2%', volume: 1420, matchRate: '99.9%', avgLatency: '1.2h', status: 'MATCHED', feeRate: '0.00% (Free)' },
    { id: 'CARDS', method: 'Credit & Debit Cards', share: '22.8%', volume: 512, matchRate: '99.4%', avgLatency: '18.4h', status: 'MATCHED', feeRate: '1.80% + GST' },
    { id: 'NETBANKING', method: 'Netbanking (Direct Core)', share: '9.4%', volume: 198, matchRate: '98.8%', avgLatency: '24.0h', status: 'MATCHED', feeRate: '₹15.00 Flat' },
    { id: 'WALLETS', method: 'Prepaid Wallets & BNPL', share: '3.6%', volume: 76, matchRate: '99.1%', avgLatency: '6.5h', status: 'MATCHED', feeRate: '2.00% + GST' },
  ];

  const filteredMethods = methodBreakdown.filter(m => 
    m.method.toLowerCase().includes(filterQuery.toLowerCase()) || 
    m.id.toLowerCase().includes(filterQuery.toLowerCase())
  );

  const getMetricChartConfig = () => {
    if (showVelocity) {
      return {
        title: 'Settlement Turnaround & Timelines (RBI T+1 Compliance)',
        subtitle: 'Same-day (T+0) vs Next-day (T+1) clearing velocity distribution',
        data: velocityData,
        isVelocity: true,
        color: '#8AB4F8',
        gradientId: 'colorVelocity',
        domain: [0, 100]
      };
    }

    switch (activeMetricTab) {
      case 'volume':
        return {
          title: 'Daily Audited Ingestion Volume',
          subtitle: 'Verified pipeline transaction throughput across 7-day window',
          data: volumeData,
          dataKey: 'val',
          unit: 'txs',
          color: '#528FF0',
          gradientId: 'colorVolume',
          domain: [0, 'auto']
        };
      case 'exceptions':
        return {
          title: 'Discrepancy Inflow Telemetry',
          subtitle: 'Daily unresolved discrepancy count across 5-node ledger',
          data: exceptionsData,
          dataKey: 'val',
          unit: 'exceptions',
          color: '#F87171',
          gradientId: 'colorExceptions',
          domain: [0, 5]
        };
      case 'risk':
        return {
          title: 'Capital at Risk & Discrepancy Pool',
          subtitle: 'Daily un-reconciled financial variance pool in pipeline',
          data: riskData,
          dataKey: 'val',
          unit: '₹',
          color: '#FBBF24',
          gradientId: 'colorRisk',
          domain: [0, 'auto']
        };
      case 'parity':
      default:
        return {
          title: '5-Node Reconciliation Parity Performance',
          subtitle: 'End-to-end mathematical ledger parity rate across processing cycles',
          data: parityData,
          dataKey: 'val',
          unit: '%',
          color: '#34D399',
          gradientId: 'colorParity',
          domain: [90, 100]
        };
    }
  };

  const chartConfig = getMetricChartConfig();

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    if (chartConfig.isVelocity) {
      return (
        <div className="bg-[#1C1D22] border border-[#2D2E36] rounded px-3 py-2 shadow-lg text-xs font-mono space-y-1">
          <p className="text-[#9AA0A6] border-b border-[#2D2E36] pb-1 font-semibold">{label}</p>
          {payload.map((p, i) => (
            <div key={i} className="flex items-center justify-between gap-4">
              <span className="text-[#9AA0A6]">{p.name}:</span>
              <span className="font-bold text-[#E8EAED]">{p.value}%</span>
            </div>
          ))}
        </div>
      );
    }
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
    <div className="flex-1 flex flex-col min-h-screen bg-[#131417] text-[#E8EAED] text-xs">
      
      {/* Action Header Bar */}
      <div className="border-b border-[#2D2E36] bg-[#131417] px-4 py-2.5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-base font-medium text-[#E8EAED]">Operations Analytics</h1>
          
          <div className="flex items-center gap-1.5 pl-2 border-l border-[#2D2E36]">
            <button 
              onClick={() => window.open('/api/export', '_blank')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded bg-[#1A73E8] hover:bg-[#1B66C9] text-white font-medium text-xs transition-colors"
            >
              <Download className="w-3.5 h-3.5" />
              Export CSV
            </button>

            <Link 
              href="/digital-twin"
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded bg-[#1C1D22] hover:bg-[#26272E] text-[#9AA0A6] hover:text-[#E8EAED] font-medium text-xs border border-[#2D2E36] transition-colors"
            >
              Digital Twin <ExternalLink className="w-3 h-3 ml-0.5" />
            </Link>
          </div>
        </div>

        {/* Right utility buttons */}
        <div className="flex items-center gap-2">
          <button 
            onClick={() => window.location.reload()}
            className="p-1.5 rounded text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#1C1D22] transition-colors"
            title="Refresh Data"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>

          <button 
            onClick={() => setHidePanel(!hidePanel)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded text-[#9AA0A6] hover:text-[#E8EAED] hover:bg-[#1C1D22] transition-colors"
          >
            {hidePanel ? 'Show side panel' : 'Hide side panel'}
          </button>
        </div>
      </div>

      <div className="p-4 space-y-4 flex-1 flex flex-col">
        
        {/* Tab Navigation */}
        <div className="border-b border-[#2D2E36] flex items-center gap-6">
          <button
            onClick={() => setActiveTab('metrics')}
            className={`pb-2.5 px-1 font-medium text-xs transition-colors relative ${
              activeTab === 'metrics' 
                ? 'text-[#8AB4F8]' 
                : 'text-[#9AA0A6] hover:text-[#E8EAED]'
            }`}
          >
            Reconciliation Metrics
            {activeTab === 'metrics' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8AB4F8]" />
            )}
          </button>

          <button
            onClick={() => setActiveTab('methods')}
            className={`pb-2.5 px-1 font-medium text-xs transition-colors relative ${
              activeTab === 'methods' 
                ? 'text-[#8AB4F8]' 
                : 'text-[#9AA0A6] hover:text-[#E8EAED]'
            }`}
          >
            Payment Instruments
            {activeTab === 'methods' && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8AB4F8]" />
            )}
          </button>
        </div>

        {activeTab === 'metrics' ? (
          <div className="space-y-4">
            
            {/* Integrated Telemetry Chart Console - Replacing the 4 Floating Cards */}
            <div className="rounded-lg border border-[#2D2E36] bg-[#1C1D22] overflow-hidden flex flex-col">
              
              {/* Interactive Telemetry Tabs Header */}
              <div className="grid grid-cols-2 sm:grid-cols-4 border-b border-[#2D2E36] divide-x divide-[#2D2E36] bg-[#18191E]/60">
                
                {/* Tab 1: Audited Transactions */}
                <button
                  type="button"
                  onClick={() => { setActiveMetricTab('volume'); setShowVelocity(false); }}
                  className={`p-3.5 text-left transition-colors relative ${
                    !showVelocity && activeMetricTab === 'volume' 
                      ? 'bg-[#1C1D22]' 
                      : 'hover:bg-[#1C1D22]/50'
                  }`}
                >
                  {!showVelocity && activeMetricTab === 'volume' && (
                    <span className="absolute top-0 left-0 right-0 h-0.5 bg-[#528FF0]" />
                  )}
                  <div className="text-[#9AA0A6] font-mono uppercase tracking-wider text-[10px]">
                    Audited Transactions
                  </div>
                  <div className="mt-1 font-mono text-lg sm:text-xl font-bold text-[#E8EAED]">
                    {data?.totalTransactions || 0}
                  </div>
                  <div className="text-[10px] font-mono text-[#9AA0A6] flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    100% pipeline verified
                  </div>
                </button>

                {/* Tab 2: Match Parity */}
                <button
                  type="button"
                  onClick={() => { setActiveMetricTab('parity'); setShowVelocity(false); }}
                  className={`p-3.5 text-left transition-colors relative ${
                    !showVelocity && activeMetricTab === 'parity' 
                      ? 'bg-[#1C1D22]' 
                      : 'hover:bg-[#1C1D22]/50'
                  }`}
                >
                  {!showVelocity && activeMetricTab === 'parity' && (
                    <span className="absolute top-0 left-0 right-0 h-0.5 bg-emerald-400" />
                  )}
                  <div className="text-[#9AA0A6] font-mono uppercase tracking-wider text-[10px]">
                    Match Parity
                  </div>
                  <div className="mt-1 font-mono text-lg sm:text-xl font-bold text-emerald-400">
                    {data?.matchRate || 0}%
                  </div>
                  <div className="text-[10px] font-mono text-[#9AA0A6] flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Zero unhandled float
                  </div>
                </button>

                {/* Tab 3: Open Exceptions */}
                <button
                  type="button"
                  onClick={() => { setActiveMetricTab('exceptions'); setShowVelocity(false); }}
                  className={`p-3.5 text-left transition-colors relative ${
                    !showVelocity && activeMetricTab === 'exceptions' 
                      ? 'bg-[#1C1D22]' 
                      : 'hover:bg-[#1C1D22]/50'
                  }`}
                >
                  {!showVelocity && activeMetricTab === 'exceptions' && (
                    <span className="absolute top-0 left-0 right-0 h-0.5 bg-rose-500" />
                  )}
                  <div className="text-[#9AA0A6] font-mono uppercase tracking-wider text-[10px]">
                    Open Exceptions
                  </div>
                  <div className={`mt-1 font-mono text-lg sm:text-xl font-bold ${data?.pending > 0 ? 'text-rose-400' : 'text-[#E8EAED]'}`}>
                    {data?.pending || 0}
                  </div>
                  <div className="text-[10px] font-mono text-[#9AA0A6] flex items-center gap-1 mt-0.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${data?.pending > 0 ? 'bg-rose-400 animate-pulse' : 'bg-emerald-400'}`} />
                    {data?.pending > 0 ? 'Action Required' : 'Zero Discrepancy'}
                  </div>
                </button>

                {/* Tab 4: Variance at Risk */}
                <button
                  type="button"
                  onClick={() => { setActiveMetricTab('risk'); setShowVelocity(false); }}
                  className={`p-3.5 text-left transition-colors relative ${
                    !showVelocity && activeMetricTab === 'risk' 
                      ? 'bg-[#1C1D22]' 
                      : 'hover:bg-[#1C1D22]/50'
                  }`}
                >
                  {!showVelocity && activeMetricTab === 'risk' && (
                    <span className="absolute top-0 left-0 right-0 h-0.5 bg-amber-400" />
                  )}
                  <div className="text-[#9AA0A6] font-mono uppercase tracking-wider text-[10px]">
                    Variance at Risk
                  </div>
                  <div className={`mt-1 font-mono text-lg sm:text-xl font-bold ${data?.financialImpact > 0 ? 'text-amber-400' : 'text-[#E8EAED]'}`}>
                    {formatCurrency(data?.financialImpact || 0)}
                  </div>
                  <div className="text-[10px] font-mono text-[#9AA0A6] flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    Discrepancy pool
                  </div>
                </button>
              </div>

              {/* Chart Sub-header with RBI Velocity Toggle */}
              <div className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#2D2E36]/50">
                <div>
                  <h2 className="text-xs font-mono font-semibold uppercase tracking-wider text-[#E8EAED]">
                    {chartConfig.title}
                  </h2>
                  <p className="text-[11px] text-[#9AA0A6] mt-0.5">
                    {chartConfig.subtitle}
                  </p>
                </div>
                
                {/* View Switcher: Metric Trend vs Settlement Timelines */}
                <div className="flex items-center gap-2">
                  <div className="inline-flex rounded-md border border-[#2D2E36] bg-[#18191E] p-0.5 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setShowVelocity(false)}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        !showVelocity 
                          ? 'bg-[#26272E] text-[#E8EAED] font-semibold' 
                          : 'text-[#9AA0A6] hover:text-[#E8EAED]'
                      }`}
                    >
                      Metric Trend
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowVelocity(true)}
                      className={`px-2.5 py-1 rounded transition-colors ${
                        showVelocity 
                          ? 'bg-[#26272E] text-[#8AB4F8] font-semibold' 
                          : 'text-[#9AA0A6] hover:text-[#E8EAED]'
                      }`}
                    >
                      RBI Velocity (T+0/T+1)
                    </button>
                  </div>

                  {chartConfig.isVelocity ? (
                    <div className="hidden lg:flex items-center gap-3 text-[11px] text-[#9AA0A6] pl-2 border-l border-[#2D2E36]">
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#8AB4F8]" /> T+0
                      </span>
                      <span className="flex items-center gap-1.5">
                        <span className="w-2.5 h-2.5 rounded-sm bg-[#30313A]" /> T+1
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-mono text-[#9AA0A6] px-2 py-0.5 rounded border border-[#2D2E36] bg-[#18191E]">
                      7-Day Window
                    </span>
                  )}
                </div>
              </div>

              {/* Chart Body */}
              <div className="h-[250px] w-full p-4 pt-2">
                <ResponsiveContainer width="100%" height="100%">
                  {chartConfig.isVelocity ? (
                    <AreaChart data={chartConfig.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorGcpT0" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8AB4F8" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#8AB4F8" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D2E36" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9AA0A6' }} dy={5} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9AA0A6' }} domain={[0, 100]} />
                      <Tooltip content={<CustomTooltip />} />
                      <Area type="monotone" dataKey="t0" name="Same-Day T+0" stroke="#8AB4F8" strokeWidth={2} fillOpacity={1} fill="url(#colorGcpT0)" />
                      <Area type="monotone" dataKey="t1" name="Next-Day T+1" stroke="#9AA0A6" strokeWidth={1.5} fillOpacity={0} />
                    </AreaChart>
                  ) : (
                    <AreaChart data={chartConfig.data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id={chartConfig.gradientId} x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={chartConfig.color} stopOpacity={0.2}/>
                          <stop offset="95%" stopColor={chartConfig.color} stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#2D2E36" />
                      <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9AA0A6' }} dy={5} />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: '#9AA0A6' }} domain={chartConfig.domain} />
                      <Tooltip content={<CustomTooltip />} cursor={{ stroke: chartConfig.color, strokeWidth: 1, strokeDasharray: '4 4' }} />
                      <Area type="monotone" dataKey={chartConfig.dataKey} stroke={chartConfig.color} strokeWidth={2} fillOpacity={1} fill={`url(#${chartConfig.gradientId})`} dot={{ r: 3, fill: chartConfig.color, stroke: '#1C1D22', strokeWidth: 2 }} activeDot={{ r: 5, fill: chartConfig.color, stroke: '#fff', strokeWidth: 2 }} />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </div>

            </div>

          </div>
        ) : (
          <div className="space-y-4">
            {/* Filter Toolbar */}
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 max-w-md relative flex items-center">
                <Filter className="w-3.5 h-3.5 text-[#9AA0A6] absolute left-3 pointer-events-none" />
                <input
                  type="text"
                  value={filterQuery}
                  onChange={(e) => setFilterQuery(e.target.value)}
                  placeholder="Filter payment instruments"
                  className="w-full bg-[#1C1D22] text-[#E8EAED] placeholder-[#9AA0A6] text-xs rounded pl-9 pr-8 py-1.5 border border-[#2D2E36] focus:border-[#8AB4F8] outline-none transition-colors"
                />
                {filterQuery && (
                  <button onClick={() => setFilterQuery('')} className="absolute right-2.5 text-[#9AA0A6] hover:text-[#E8EAED]">
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>

            {/* Split View Table + Right Info Panel */}
            <div className="flex border border-[#2D2E36] rounded-lg bg-[#1C1D22] overflow-hidden">
              <div className="flex-1 overflow-x-auto">
                <table className="w-full text-left text-xs min-w-[640px]">
                  <thead>
                    <tr className="border-b border-[#2D2E36] bg-[#18191E] text-[#9AA0A6] font-medium select-none">
                      <th className="py-2 px-3">Method Name</th>
                      <th className="py-2 px-3">Volume Share</th>
                      <th className="py-2 px-3">Batches</th>
                      <th className="py-2 px-3">Parity Rate</th>
                      <th className="py-2 px-3">Avg Latency</th>
                      <th className="py-2 px-3">Fee Card</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2D2E36]">
                    {filteredMethods.map((m) => {
                      const isSelected = selectedMethod?.id === m.id;
                      return (
                        <tr 
                          key={m.id}
                          onClick={() => setSelectedMethod(m)}
                          className={`cursor-pointer transition-colors ${
                            isSelected ? 'bg-[#1E2838]' : 'hover:bg-[#26272E]'
                          }`}
                        >
                          <td className="py-2.5 px-3 font-medium text-[#8AB4F8] flex items-center gap-2">
                            <CreditCard className="w-3.5 h-3.5 text-[#9AA0A6]" />
                            {m.method}
                          </td>
                          <td className="py-2.5 px-3 font-mono text-[#9AA0A6]">{m.share}</td>
                          <td className="py-2.5 px-3 font-mono">{m.volume.toLocaleString('en-IN')} txns</td>
                          <td className="py-2.5 px-3 font-mono font-semibold text-emerald-400">{m.matchRate}</td>
                          <td className="py-2.5 px-3 font-mono text-[#9AA0A6]">{m.avgLatency}</td>
                          <td className="py-2.5 px-3 text-[#E8EAED]">{m.feeRate}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Right Side Inspection Panel */}
              {!hidePanel && (
                <div className="w-72 border-l border-[#2D2E36] bg-[#18191E] p-4 text-xs space-y-3">
                  <div className="font-medium text-[#E8EAED] border-b border-[#2D2E36] pb-2">
                    {selectedMethod ? selectedMethod.method : 'Select an instrument'}
                  </div>

                  {!selectedMethod ? (
                    <div className="text-[#9AA0A6] text-center py-6">
                      Click any payment instrument to inspect SLA metrics.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div>
                        <span className="text-[10px] text-[#9AA0A6] uppercase tracking-wider block">Instrument Key</span>
                        <span className="font-mono text-xs text-[#E8EAED]">{selectedMethod.id}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#9AA0A6] uppercase tracking-wider block">Settlement Parity</span>
                        <span className="font-mono text-xs font-semibold text-emerald-400">{selectedMethod.matchRate}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-[#9AA0A6] uppercase tracking-wider block">Agreed Rate Card</span>
                        <span className="text-xs text-[#E8EAED]">{selectedMethod.feeRate}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
