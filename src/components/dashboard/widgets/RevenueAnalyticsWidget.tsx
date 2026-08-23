import React, { useState } from 'react';
import { useApp } from '../../../context/AppContext';
import { useDashboardSystem } from '../../../context/DashboardSystemContext';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Sparkles, 
  Layers, 
  Download, 
  ArrowUpRight,
  Filter
} from 'lucide-react';

const REVENUE_DATA_7D = [
  { name: 'Mon', grooming: 820, retail: 140, total: 960 },
  { name: 'Tue', grooming: 940, retail: 180, total: 1120 },
  { name: 'Wed', grooming: 1100, retail: 220, total: 1320 },
  { name: 'Thu', grooming: 1050, retail: 190, total: 1240 },
  { name: 'Fri', grooming: 1450, retail: 340, total: 1790 },
  { name: 'Sat', grooming: 1850, retail: 460, total: 2310 },
  { name: 'Sun', grooming: 1200, retail: 280, total: 1480 }
];

const REVENUE_DATA_30D = [
  { name: 'Week 1', grooming: 6200, retail: 1250, total: 7450 },
  { name: 'Week 2', grooming: 7100, retail: 1480, total: 8580 },
  { name: 'Week 3', grooming: 8400, retail: 1920, total: 10320 },
  { name: 'Week 4', grooming: 9200, retail: 2150, total: 11350 }
];

const REVENUE_DATA_90D = [
  { name: 'Month 1', grooming: 24500, retail: 5200, total: 29700 },
  { name: 'Month 2', grooming: 28200, retail: 6100, total: 34300 },
  { name: 'Month 3', grooming: 32400, retail: 7400, total: 39800 }
];

export const RevenueAnalyticsWidget: React.FC = () => {
  const { formatPrice } = useApp();
  const { currentThemeDef } = useDashboardSystem();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('7d');
  const [chartType, setChartType] = useState<'area' | 'bar'>('area');

  const chartData = timeRange === '7d' 
    ? REVENUE_DATA_7D 
    : timeRange === '30d' 
    ? REVENUE_DATA_30D 
    : REVENUE_DATA_90D;

  const totalPeriodRevenue = chartData.reduce((acc, curr) => acc + curr.total, 0);
  const groomingTotal = chartData.reduce((acc, curr) => acc + curr.grooming, 0);
  const retailTotal = chartData.reduce((acc, curr) => acc + curr.retail, 0);

  const primaryColor = currentThemeDef.previewColors.primary || '#D4AF37';
  const accentColor = currentThemeDef.previewColors.accent || '#06B6D4';

  return (
    <div id="widget-revenue-analytics" className="card-box flex flex-col justify-between h-full">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-theme-subtle">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <h3 className="text-base font-bold text-theme-ink font-display flex items-center gap-2">
              Financial & Revenue Analytics
            </h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-theme-light text-theme-primary font-semibold border border-theme-subtle">
              Live Synchronized
            </span>
          </div>
          <p className="text-xs text-theme-muted mt-0.5">
            Gross grooming service volume vs retail pet supplies cashflow
          </p>
        </div>

        {/* Time filters & Chart Type Toggle */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="flex bg-theme-light p-0.5 rounded-lg border border-theme-subtle text-xs font-semibold">
            {(['7d', '30d', '90d'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  timeRange === range
                    ? 'bg-theme-primary text-black shadow-sm font-bold'
                    : 'text-theme-muted hover:text-theme-ink'
                }`}
              >
                {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
              </button>
            ))}
          </div>

          <button
            onClick={() => setChartType(chartType === 'area' ? 'bar' : 'area')}
            className="p-1.5 rounded-lg bg-theme-light text-theme-muted hover:text-theme-ink border border-theme-subtle text-xs"
            title="Toggle Chart Type"
          >
            <Layers className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Revenue High-Level Split Badges */}
      <div className="grid grid-cols-3 gap-3 my-4">
        <div className="p-3 rounded-xl bg-theme-light border border-theme-subtle">
          <div className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider">
            Total Inflow
          </div>
          <div className="text-lg font-bold text-theme-ink font-display mt-0.5">
            {formatPrice(totalPeriodRevenue)}
          </div>
          <div className="text-[10px] text-emerald-500 font-semibold flex items-center gap-0.5 mt-0.5">
            <ArrowUpRight className="w-3 h-3" /> +14.2% projected
          </div>
        </div>

        <div className="p-3 rounded-xl bg-theme-light border border-theme-subtle">
          <div className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider">
            Grooming Services
          </div>
          <div className="text-lg font-bold text-theme-primary font-display mt-0.5">
            {formatPrice(groomingTotal)}
          </div>
          <div className="text-[10px] text-theme-muted font-medium mt-0.5">
            {Math.round((groomingTotal / totalPeriodRevenue) * 100)}% of revenue
          </div>
        </div>

        <div className="p-3 rounded-xl bg-theme-light border border-theme-subtle">
          <div className="text-[11px] font-semibold text-theme-muted uppercase tracking-wider">
            Retail & Add-ons
          </div>
          <div className="text-lg font-bold text-theme-ink font-display mt-0.5">
            {formatPrice(retailTotal)}
          </div>
          <div className="text-[10px] text-theme-muted font-medium mt-0.5">
            {Math.round((retailTotal / totalPeriodRevenue) * 100)}% of revenue
          </div>
        </div>
      </div>

      {/* Chart Canvas */}
      <div className="h-64 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          {chartType === 'area' ? (
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorGrooming" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
                  <stop offset="95%" stopColor={primaryColor} stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="colorRetail" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={accentColor} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={accentColor} stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888888' }} stroke="none" />
              <YAxis tick={{ fontSize: 11, fill: '#888888' }} stroke="none" tickFormatter={(v) => `$${v}`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(20, 25, 35, 0.95)', 
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '12px'
                }}
                formatter={(value: any) => [`$${value}`, '']}
              />
              <Area type="monotone" dataKey="grooming" name="Grooming" stroke={primaryColor} strokeWidth={2.5} fillOpacity={1} fill="url(#colorGrooming)" />
              <Area type="monotone" dataKey="retail" name="Retail & Supplies" stroke={accentColor} strokeWidth={2} fillOpacity={1} fill="url(#colorRetail)" />
            </AreaChart>
          ) : (
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(150, 150, 150, 0.15)" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#888888' }} stroke="none" />
              <YAxis tick={{ fontSize: 11, fill: '#888888' }} stroke="none" tickFormatter={(v) => `$${v}`} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: 'rgba(20, 25, 35, 0.95)', 
                  border: '1px solid rgba(255, 255, 255, 0.15)',
                  borderRadius: '10px',
                  color: '#ffffff',
                  fontSize: '12px'
                }}
                formatter={(value: any) => [`$${value}`, '']}
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '6px' }} />
              <Bar dataKey="grooming" name="Grooming" fill={primaryColor} radius={[4, 4, 0, 0]} />
              <Bar dataKey="retail" name="Retail" fill={accentColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
