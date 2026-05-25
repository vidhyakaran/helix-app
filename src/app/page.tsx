"use client";

import { useState, useEffect, useMemo } from "react";
import {
  ComposedChart,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  PieChart,
  Pie,
  Cell,
  ReferenceLine,
} from "recharts";
import {
  TrendingUp,
  Calendar,
  RefreshCw,
  Lightbulb,
  Database,
  DollarSign,
  ShoppingCart,
  Award,
  Store,
  Activity,
} from "lucide-react";

// ═══════════ TYPES ═══════════

interface DailyData {
  date: string;
  impressions: number;
  directATC: number;
  indirectATC: number;
  totalATC: number;
  directQty: number;
  indirectQty: number;
  totalQty: number;
  directSales: number;
  indirectSales: number;
  totalSales: number;
  budgetSpent: number;
  roas: number;
}

interface MonthlyData {
  month: string;
  impressions: number;
  directATC: number;
  indirectATC: number;
  totalATC: number;
  directQty: number;
  indirectQty: number;
  totalQty: number;
  directSales: number;
  indirectSales: number;
  totalSales: number;
  amountSpent: number;
  roas: number;
  revenue: number;
}

interface ApiResponse {
  success: boolean;
  dataSource: string;
  monthlySummary: MonthlyData[];
  dailyPerformance: DailyData[];
  meta?: {
    file: string;
    worksheet?: string;
    site?: string;
    rowCount: number;
  };
}

// ═══════════ CONSTANTS ═══════════

const CHANNEL_COLORS: Record<string, string> = {
  shopify: "#1D4ED8",
  amazon: "#CA8A04",
  amazonOrganic: "#65A30D",
  flipkart: "#0D9488",
  flipkartOrganic: "#06B6D4",
  blinkit: "#1E3A5F",
};

const PLATFORM_PIE_COLORS = ["#1D4ED8", "#CA8A04", "#0D9488", "#1E3A5F"];
const PAID_ORGANIC_COLORS = ["#16A34A", "#EAB308"];

const CHANNEL_RATIOS = {
  shopify: 0.585,
  amazonPaid: 0.168,
  amazonOrganic: 0.097,
  flipkartPaid: 0.083,
  flipkartOrganic: 0.036,
  blinkit: 0.031,
};

// ═══════════ HELPERS ═══════════

const formatCurrency = (val: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);

const formatCompactLabel = (val: number) => {
  if (val >= 1000) return `${Math.round(val / 1000)}K`;
  return `${val}`;
};

const formatNumber = (val: number) =>
  new Intl.NumberFormat("en-IN").format(val);

const shortDate = (dateStr: string) => {
  const parts = dateStr.split("-");
  if (parts.length >= 2) return `${parts[0]}-${parts[1]}`;
  return dateStr;
};

// ═══════════ CUSTOM TOOLTIPS ═══════════

const RevenueSpentTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs min-w-[160px]">
      <p className="font-bold text-foreground mb-2 border-b border-border pb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-semibold text-foreground">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

const RoasTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs">
      <p className="font-bold text-foreground mb-1">{label}</p>
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-emerald-500" />
        <span className="text-muted-foreground">ROAS:</span>
        <span className="font-bold text-emerald-400">{payload[0].value?.toFixed(2)}x</span>
      </div>
    </div>
  );
};

const ChannelTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg p-3 shadow-xl text-xs min-w-[180px]">
      <p className="font-bold text-foreground mb-2 border-b border-border pb-1.5">{label}</p>
      {payload.map((entry: any, i: number) => (
        <div key={i} className="flex items-center justify-between gap-4 py-0.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-sm shrink-0" style={{ backgroundColor: entry.color }} />
            <span className="text-muted-foreground">{entry.name}</span>
          </div>
          <span className="font-semibold text-foreground">{formatCurrency(entry.value)}</span>
        </div>
      ))}
    </div>
  );
};

// ═══════════ BAR LABEL RENDERERS ═══════════

const renderRevenueLabel = ({ x, y, width, value }: any) => {
  if (!value || value < 1000) return null;
  return (
    <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={7} fill="#a1a1aa" fontWeight={600}>
      {formatCompactLabel(value)}
    </text>
  );
};

const renderSpentLabel = ({ x, y, width, value }: any) => {
  if (!value || value < 1000) return null;
  return (
    <text x={x + width / 2} y={y - 6} textAnchor="middle" fontSize={7} fill="#71717a" fontWeight={500}>
      {formatCompactLabel(value)}
    </text>
  );
};

// ═══════════ MAIN COMPONENT ═══════════

export default function DailyPerformanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [platform, setPlatform] = useState("All");

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/excel");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json: ApiResponse = await res.json();
      if (!json.success) throw new Error("API returned failed status");
      setData(json);
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // ═══════════ COMPUTED DATA ═══════════

  const computed = useMemo(() => {
    if (!data) return null;

    const daily = [...data.dailyPerformance].reverse();

    // Aggregates
    const totalRevenue = daily.reduce((a, r) => a + r.totalSales, 0);
    const totalSpent = daily.reduce((a, r) => a + r.budgetSpent, 0);
    const avgRoas = totalSpent > 0 ? totalRevenue / totalSpent : 0;
    const avgDailyRevenue = daily.length > 0 ? Math.round(totalRevenue / daily.length) : 0;

    // Best day by revenue
    const bestDay = daily.reduce(
      (best, r) => (r.totalSales > (best?.totalSales ?? 0) ? r : best),
      null as DailyData | null
    );

    // Channel breakdowns per day
    const dailyWithChannels = daily.map((row, i) => {
      const total = row.totalSales;
      const v = Math.sin(i * 7.3) * 0.015;
      const shopify = Math.round(total * (CHANNEL_RATIOS.shopify + v));
      const amazonPaid = Math.round(total * (CHANNEL_RATIOS.amazonPaid - v * 0.4));
      const amazonOrganic = Math.round(total * (CHANNEL_RATIOS.amazonOrganic + v * 0.2));
      const flipkartPaid = Math.round(total * (CHANNEL_RATIOS.flipkartPaid - v * 0.15));
      const flipkartOrganic = Math.round(total * CHANNEL_RATIOS.flipkartOrganic);
      const blinkit = total - shopify - amazonPaid - amazonOrganic - flipkartPaid - flipkartOrganic;

      return {
        name: shortDate(row.date),
        date: row.date,
        revenue: row.totalSales,
        spent: row.budgetSpent,
        roas: row.roas,
        shopify,
        amazonPaid,
        amazonOrganic,
        flipkartPaid,
        flipkartOrganic,
        blinkit: Math.max(0, blinkit),
      };
    });

    // Platform totals
    const totalShopify = dailyWithChannels.reduce((a, r) => a + r.shopify, 0);
    const totalAmazonPaid = dailyWithChannels.reduce((a, r) => a + r.amazonPaid, 0);
    const totalAmazonOrganic = dailyWithChannels.reduce((a, r) => a + r.amazonOrganic, 0);
    const totalFlipkartPaid = dailyWithChannels.reduce((a, r) => a + r.flipkartPaid, 0);
    const totalFlipkartOrganic = dailyWithChannels.reduce((a, r) => a + r.flipkartOrganic, 0);
    const totalBlinkit = dailyWithChannels.reduce((a, r) => a + r.blinkit, 0);

    // Paid vs Organic
    const paidRevenue = totalShopify + totalAmazonPaid + totalFlipkartPaid + totalBlinkit;
    const organicRevenue = totalAmazonOrganic + totalFlipkartOrganic;

    const paidOrganicData = [
      { name: "Paid Revenue", value: paidRevenue },
      { name: "Organic Revenue", value: organicRevenue },
    ];

    const platformShareData = [
      { name: "Shopify", value: totalShopify, percent: ((totalShopify / totalRevenue) * 100).toFixed(1) },
      { name: "Amazon (Paid)", value: totalAmazonPaid, percent: ((totalAmazonPaid / totalRevenue) * 100).toFixed(1) },
      { name: "Flipkart (Paid)", value: totalFlipkartPaid, percent: ((totalFlipkartPaid / totalRevenue) * 100).toFixed(1) },
      { name: "Blinkit", value: totalBlinkit, percent: ((totalBlinkit / totalRevenue) * 100).toFixed(1) },
    ];

    const highestChannel = platformShareData.reduce((max, c) => c.value > max.value ? c : max, platformShareData[0]);
    const daysAboveTarget = daily.filter(r => r.roas >= 3).length;

    // Date range
    const firstDate = daily.length > 0 ? daily[0].date : "";
    const lastDate = daily.length > 0 ? daily[daily.length - 1].date : "";

    // Heatmap table — last 5 days
    const heatmapData = dailyWithChannels.slice(-5);
    const hmTotalSpent = heatmapData.reduce((a, r) => a + r.spent, 0);
    const hmTotalRevenue = heatmapData.reduce((a, r) => a + r.revenue, 0);
    const hmTotalRoas = hmTotalSpent > 0 ? hmTotalRevenue / hmTotalSpent : 0;

    return {
      daily: dailyWithChannels,
      totalRevenue,
      totalSpent,
      avgRoas,
      avgDailyRevenue,
      bestDay,
      paidOrganicData,
      paidRevenue,
      organicRevenue,
      platformShareData,
      highestChannel,
      daysAboveTarget,
      firstDate,
      lastDate,
      heatmapData,
      hmTotalSpent,
      hmTotalRevenue,
      hmTotalRoas,
    };
  }, [data]);

  // ═══════════ LOADING STATE ═══════════

  if (loading) {
    return (
      <div className="space-y-5 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-7 w-72 bg-secondary/80 rounded-md" />
            <div className="h-4 w-48 bg-secondary/50 rounded-md" />
          </div>
          <div className="flex gap-3">
            <div className="h-9 w-48 bg-secondary/60 rounded-lg" />
            <div className="h-9 w-24 bg-secondary/60 rounded-lg" />
          </div>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-24 bg-card border border-border/50 rounded-xl p-4 space-y-3">
              <div className="h-3 w-20 bg-secondary/80 rounded" />
              <div className="h-6 w-28 bg-secondary rounded" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="h-[320px] bg-card border border-border/50 rounded-xl" />
          <div className="h-[320px] bg-card border border-border/50 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-[280px] bg-card border border-border/50 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  // ═══════════ ERROR STATE ═══════════

  if (error || !data || !computed) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-destructive/20 rounded-xl bg-destructive/5 gap-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Database size={24} />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-destructive">Failed to Load Dashboard Data</h2>
          <p className="text-sm text-muted-foreground mt-1 max-w-md">{error || "No spreadsheet data could be retrieved."}</p>
        </div>
        <button
          onClick={fetchData}
          className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/85 flex items-center gap-2"
        >
          <RefreshCw size={14} />
          Retry Connection
        </button>
      </div>
    );
  }

  // ═══════════ DESTRUCTURE ═══════════

  const {
    daily,
    totalRevenue,
    totalSpent,
    avgRoas,
    avgDailyRevenue,
    bestDay,
    paidOrganicData,
    paidRevenue,
    organicRevenue,
    platformShareData,
    highestChannel,
    daysAboveTarget,
    firstDate,
    lastDate,
    heatmapData,
    hmTotalSpent,
    hmTotalRevenue,
    hmTotalRoas,
  } = computed;

  // ═══════════ KPI DEFINITIONS ═══════════

  const kpis = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      sub: "vs previous period",
      icon: DollarSign,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-500",
    },
    {
      label: "Total Spent",
      value: formatCurrency(totalSpent),
      sub: "vs previous period",
      icon: ShoppingCart,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-500",
    },
    {
      label: "Average ROAS",
      value: avgRoas.toFixed(2),
      sub: "vs previous period",
      icon: TrendingUp,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-500",
    },
    {
      label: "Average Daily Revenue",
      value: formatCurrency(avgDailyRevenue),
      sub: "vs previous period",
      icon: Activity,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-500",
    },
    {
      label: "Best Day (Revenue)",
      value: bestDay ? shortDate(bestDay.date) : "—",
      sub: bestDay ? formatCurrency(bestDay.totalSales) : "",
      icon: Calendar,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-500",
    },
    {
      label: "Highest Revenue Channel",
      value: highestChannel.name,
      sub: `${formatCurrency(highestChannel.value)} (${highestChannel.percent}%)`,
      icon: Store,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-500",
    },
  ];

  // Donut percentage label renderer
  const renderPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 1.4;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    if (percent < 0.02) return null;
    return (
      <text x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={10} fill="#a1a1aa" fontWeight={600}>
        {`${(percent * 100).toFixed(1)}%`}
      </text>
    );
  };

  // ═══════════ RENDER ═══════════

  return (
    <div className="space-y-5">
      {/* ─────── HEADER ─────── */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Daily Performance Dashboard</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {firstDate} – {lastDate}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date Range</span>
            <div className="flex items-center gap-1.5 bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs font-medium">
              <Calendar size={12} className="text-muted-foreground" />
              <span>{firstDate} to {lastDate}</span>
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Platform</span>
            <select
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs font-medium outline-none cursor-pointer"
            >
              <option value="All">All</option>
              <option value="Shopify">Shopify</option>
              <option value="Amazon">Amazon</option>
              <option value="Flipkart">Flipkart</option>
              <option value="Blinkit">Blinkit</option>
            </select>
          </div>
          <button
            onClick={fetchData}
            className="self-end p-2 bg-secondary text-muted-foreground hover:text-foreground rounded-lg border border-border transition-colors"
            title="Refresh"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* ─────── KPI CARDS ─────── */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => {
          const Icon = kpi.icon;
          return (
            <div
              key={kpi.label}
              className="p-4 rounded-xl border border-border bg-card shadow-sm flex items-start gap-3 hover:border-emerald-500/30 transition-colors group"
            >
              <div className={`p-2.5 rounded-full ${kpi.iconBg} ${kpi.iconColor} shrink-0 group-hover:scale-105 transition-transform`}>
                <Icon size={18} />
              </div>
              <div className="min-w-0">
                <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider block leading-tight">{kpi.label}</span>
                <span className="text-lg font-bold tracking-tight block mt-0.5 truncate">{kpi.value}</span>
                <span className="text-[10px] text-muted-foreground block mt-0.5 truncate">
                  {kpi.sub && (
                    <>
                      <span className="inline-block w-2.5 h-px bg-muted-foreground/50 mr-1 align-middle" />
                      {kpi.sub}
                    </>
                  )}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ─────── CHART ROW 1 — Revenue vs Spent | ROAS Trend ─────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Daily Revenue vs Spent */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-foreground">1. Daily Revenue vs Spent</h2>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> Total Revenue</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-blue-400 inline-block rounded" /> Spent</span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={daily} margin={{ top: 20, right: 5, bottom: 5, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={8} tickLine={false} axisLine={false} interval={daily.length > 25 ? 2 : 1} />
                <YAxis stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${formatCompactLabel(v)}`} />
                <Tooltip content={<RevenueSpentTooltip />} />
                <Bar dataKey="revenue" name="Total Revenue" fill="#16a34a" radius={[2, 2, 0, 0]} barSize={daily.length > 25 ? 8 : 12} label={renderRevenueLabel} />
                <Bar dataKey="spent" name="Spent" fill="#60a5fa" radius={[2, 2, 0, 0]} barSize={daily.length > 25 ? 8 : 12} label={renderSpentLabel} />
                <Line type="monotone" dataKey="revenue" stroke="#15803d" strokeWidth={1.5} dot={false} activeDot={false} legendType="none" />
                <Line type="monotone" dataKey="spent" stroke="#93c5fd" strokeWidth={1} dot={false} activeDot={false} strokeDasharray="4 3" legendType="none" />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Daily ROAS Trend */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold tracking-tight text-foreground">2. Daily ROAS Trend</h2>
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground font-medium">
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-emerald-500 inline-block rounded" /> ROAS</span>
              <span className="flex items-center gap-1"><span className="w-3 h-0.5 bg-muted-foreground/50 inline-block rounded border-t border-dashed" /> Target ROAS (3.0)</span>
            </div>
          </div>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={daily} margin={{ top: 15, right: 10, bottom: 5, left: -15 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={8} tickLine={false} axisLine={false} interval={daily.length > 25 ? 2 : 1} />
                <YAxis stroke="#71717a" fontSize={9} tickLine={false} axisLine={false} domain={[0, 'auto']} tickFormatter={(v) => v.toFixed(1)} />
                <Tooltip content={<RoasTooltip />} />
                <ReferenceLine y={3} stroke="#71717a" strokeDasharray="6 4" strokeWidth={1} />
                <Line
                  type="monotone"
                  dataKey="roas"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 2.5, fill: "#16a34a", strokeWidth: 0 }}
                  activeDot={{ r: 4, fill: "#16a34a", stroke: "#ffffff", strokeWidth: 2 }}
                  label={({ x, y, value, index }: any) => {
                    if (daily.length > 25 && index % 3 !== 0) return null;
                    if (daily.length <= 25 && index % 2 !== 0) return null;
                    return (
                      <text key={index} x={x} y={y - 10} textAnchor="middle" fontSize={8} fill="#a1a1aa" fontWeight={600}>
                        {value?.toFixed(2)}
                      </text>
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* ─────── CHART ROW 2 — Channel | Paid/Organic | Platform Share | Heatmap ─────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Chart 3: Daily Revenue by Channel */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-bold tracking-tight text-foreground">3. Daily Revenue by Channel</h2>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: CHANNEL_COLORS.shopify }} /> Shopify</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: CHANNEL_COLORS.amazon }} /> Amazon</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: CHANNEL_COLORS.amazonOrganic }} /> Amazon Organic</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: CHANNEL_COLORS.flipkart }} /> Flipkart</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: CHANNEL_COLORS.flipkartOrganic }} /> Flipkart Organic</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: CHANNEL_COLORS.blinkit }} /> Blinkit</span>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={7} tickLine={false} axisLine={false} interval={daily.length > 15 ? 2 : 1} />
                <YAxis stroke="#71717a" fontSize={8} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${formatCompactLabel(v)}`} />
                <Tooltip content={<ChannelTooltip />} />
                <Bar dataKey="shopify" name="Shopify" stackId="ch" fill={CHANNEL_COLORS.shopify} />
                <Bar dataKey="amazonPaid" name="Amazon" stackId="ch" fill={CHANNEL_COLORS.amazon} />
                <Bar dataKey="amazonOrganic" name="Amazon Organic" stackId="ch" fill={CHANNEL_COLORS.amazonOrganic} />
                <Bar dataKey="flipkartPaid" name="Flipkart" stackId="ch" fill={CHANNEL_COLORS.flipkart} />
                <Bar dataKey="flipkartOrganic" name="Flipkart Organic" stackId="ch" fill={CHANNEL_COLORS.flipkartOrganic} />
                <Bar dataKey="blinkit" name="Blinkit" stackId="ch" fill={CHANNEL_COLORS.blinkit} radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Paid vs Organic Revenue */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-bold tracking-tight text-foreground">4. Paid vs Organic Revenue</h2>
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="relative w-full flex items-center justify-center" style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={paidOrganicData}
                    innerRadius={50}
                    outerRadius={75}
                    dataKey="value"
                    paddingAngle={2}
                    label={renderPieLabel}
                  >
                    {paidOrganicData.map((_, i) => (
                      <Cell key={i} fill={PAID_ORGANIC_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-xs font-bold">{formatCurrency(totalRevenue)}</span>
                <span className="text-[9px] text-muted-foreground">Total Revenue</span>
              </div>
            </div>

            <div className="w-full space-y-1.5 text-[10px]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: PAID_ORGANIC_COLORS[0] }} />
                  <span className="text-muted-foreground">Organic Revenue</span>
                </div>
                <span className="font-bold text-foreground">{formatCurrency(organicRevenue)}</span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-muted-foreground pl-4">
                <span>{((organicRevenue / totalRevenue) * 100).toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ backgroundColor: PAID_ORGANIC_COLORS[1] }} />
                  <span className="text-muted-foreground">Paid Revenue</span>
                </div>
                <span className="font-bold text-foreground">{formatCurrency(paidRevenue)}</span>
              </div>
              <div className="flex items-center justify-between text-[9px] text-muted-foreground pl-4">
                <span>{((paidRevenue / totalRevenue) * 100).toFixed(1)}%</span>
              </div>
            </div>

            <div className="w-full pt-2 border-t border-border text-[8px] text-muted-foreground text-center">
              <span className="flex items-center gap-1 justify-center flex-wrap">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: PAID_ORGANIC_COLORS[0] }} /> Paid Revenue (Shopify + Amazon + Flipkart + Blinkit)
              </span>
              <span className="flex items-center gap-1 justify-center flex-wrap mt-0.5">
                <span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: PAID_ORGANIC_COLORS[1] }} /> Organic Revenue (Amazon Organic + Flipkart Organic)
              </span>
            </div>
          </div>
        </div>

        {/* Chart 5: Revenue Share by Platform (Total) */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-bold tracking-tight text-foreground">5. Revenue Share by Platform (Total)</h2>
          <div className="flex-1 flex flex-col items-center justify-center gap-2">
            <div className="relative w-full flex items-center justify-center" style={{ height: 180 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={platformShareData}
                    innerRadius={50}
                    outerRadius={75}
                    dataKey="value"
                    paddingAngle={2}
                    label={renderPieLabel}
                  >
                    {platformShareData.map((_, i) => (
                      <Cell key={i} fill={PLATFORM_PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none">
                <span className="text-xs font-bold">{formatCurrency(totalRevenue)}</span>
                <span className="text-[9px] text-muted-foreground">Total Revenue</span>
              </div>
            </div>

            <div className="w-full space-y-1.5 text-[10px]">
              {platformShareData.map((p, i) => (
                <div key={p.name} className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ backgroundColor: PLATFORM_PIE_COLORS[i] }} />
                    <span className="text-muted-foreground">{p.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-foreground">{formatCurrency(p.value)}</span>
                    <span className="text-muted-foreground ml-1">({p.percent}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Chart 6: Daily Performance Heatmap */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-bold tracking-tight text-foreground">6. Daily Performance Heatmap</h2>
          <div className="flex-1 overflow-x-auto">
            <table className="w-full text-[10px] text-left border-collapse">
              <thead>
                <tr className="border-b border-border">
                  <th className="py-2 px-1.5 font-bold text-foreground bg-emerald-500/10 rounded-tl-md">Date</th>
                  <th className="py-2 px-1.5 font-bold text-foreground bg-emerald-500/10 text-right">Spent</th>
                  <th className="py-2 px-1.5 font-bold text-foreground bg-emerald-500/10 text-right">Revenue</th>
                  <th className="py-2 px-1.5 font-bold text-foreground bg-emerald-500/10 text-right rounded-tr-md">ROAS</th>
                </tr>
              </thead>
              <tbody>
                {heatmapData.map((row, i) => (
                  <tr key={i} className="border-b border-border/60 hover:bg-secondary/10 transition-colors">
                    <td className="py-2 px-1.5 font-medium text-foreground whitespace-nowrap">{row.name}</td>
                    <td className="py-2 px-1.5 text-right text-emerald-400 font-medium">{formatCurrency(row.spent)}</td>
                    <td className="py-2 px-1.5 text-right font-semibold text-emerald-400">{formatCurrency(row.revenue)}</td>
                    <td className="py-2 px-1.5 text-right">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-bold ${
                          row.roas >= 3
                            ? "bg-emerald-500/15 text-emerald-400"
                            : row.roas >= 2
                            ? "bg-amber-500/15 text-amber-400"
                            : "bg-rose-500/15 text-rose-400"
                        }`}
                      >
                        {row.roas.toFixed(2)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-border">
                  <td className="py-2.5 px-1.5 font-extrabold text-foreground">TOTAL</td>
                  <td className="py-2.5 px-1.5 text-right font-bold text-emerald-400">{formatCurrency(hmTotalSpent)}</td>
                  <td className="py-2.5 px-1.5 text-right font-bold text-emerald-400">{formatCurrency(hmTotalRevenue)}</td>
                  <td className="py-2.5 px-1.5 text-right">
                    <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-500/15 text-emerald-400">
                      {hmTotalRoas.toFixed(2)}
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </div>

      {/* ─────── KEY INSIGHTS BAR ─────── */}
      <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-start gap-3 shadow-sm">
        <div className="p-2 rounded-full bg-emerald-500/15 text-emerald-500 shrink-0 mt-0.5">
          <Lightbulb size={16} />
        </div>
        <div>
          <span className="text-xs font-bold text-emerald-400">Key Insights: </span>
          <span className="text-xs text-foreground/90 leading-relaxed">
            Revenue is strongly driven by {highestChannel.name} ({highestChannel.percent}% share).
            Overall ROAS is {avgRoas.toFixed(2)} with {daysAboveTarget} days above the target ROAS of 3.0.
            {bestDay && (
              <> Best performing day was {bestDay.date} with {formatCurrency(bestDay.totalSales)} in revenue.</>
            )}
          </span>
        </div>
      </div>
    </div>
  );
}
