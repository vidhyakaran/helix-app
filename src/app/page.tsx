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

const parseDateString = (dateStr: string): Date => {
  const parts = dateStr.split("-");
  if (parts.length < 3) return new Date();
  const day = parseInt(parts[0], 10);
  const monthName = parts[1].toLowerCase();
  let year = parseInt(parts[2], 10);
  if (year < 100) year += 2000;

  const monthMap: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
  };
  const month = monthMap[monthName.substring(0, 3)] ?? 0;
  return new Date(year, month, day);
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

export default function MonthlyPerformanceDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [platform, setPlatform] = useState("All");
  const [dateRangeType, setDateRangeType] = useState("All");
  const [customStartDate, setCustomStartDate] = useState("");
  const [customEndDate, setCustomEndDate] = useState("");

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

    const summaryData = [...data.monthlySummary].reverse();

    // 1. Map row data directly from Excel sheet summary
    const summaryWithAllChannels = summaryData.map((row) => {
      const total = row.totalSales || 0;
      
      // Since the sheet is specifically for Blinkit, all revenue maps to Blinkit
      const shopify = 0;
      const amazonPaid = 0;
      const amazonOrganic = 0;
      const flipkartPaid = 0;
      const flipkartOrganic = 0;
      const blinkit = total;

      return {
        name: row.month,
        date: row.month,
        shopify,
        amazonPaid,
        amazonOrganic,
        flipkartPaid,
        flipkartOrganic,
        blinkit,
        originalRevenue: total,
        originalSpent: row.amountSpent || 0,
        originalRoas: row.roas || 0,
        directSales: row.directSales || 0,
        indirectSales: row.indirectSales || 0,
      };
    });

    // 2. Filter by date range first
    let dateFiltered = summaryWithAllChannels;

    if (dateRangeType === "May26") {
      dateFiltered = summaryWithAllChannels.filter(r => r.name.toLowerCase().includes("may"));
    } else if (dateRangeType === "Apr26") {
      dateFiltered = summaryWithAllChannels.filter(r => r.name.toLowerCase().includes("apr"));
    } else if (dateRangeType === "Mar26") {
      dateFiltered = summaryWithAllChannels.filter(r => r.name.toLowerCase().includes("mar"));
    } else if (dateRangeType === "Last7" || dateRangeType === "Last30" || dateRangeType === "Custom") {
      dateFiltered = summaryWithAllChannels;
    }

    // 3. Filter/re-project based on selected platform
    const dailyWithChannels = dateFiltered.map((row) => {
      let revenue = 0;
      let spent = 0;
      let roas = 0;

      // Filter by platform - actual data mapped directly
      if (platform === "All" || platform === "Blinkit") {
        revenue = row.originalRevenue;
        spent = row.originalSpent;
        roas = row.originalRoas;
      } else {
        // Other platforms have no data in the current Blinkit spreadsheet
        revenue = 0;
        spent = 0;
        roas = 0;
      }

      return {
        ...row,
        revenue,
        spent,
        roas,
        // Zero-out non-active channels so that Stacked Bar Chart automatically reflects active platform channels
        shopify: (platform === "All" || platform === "Shopify") ? row.shopify : 0,
        amazonPaid: (platform === "All" || platform === "Amazon") ? row.amazonPaid : 0,
        amazonOrganic: (platform === "All" || platform === "Amazon") ? row.amazonOrganic : 0,
        flipkartPaid: (platform === "All" || platform === "Flipkart") ? row.flipkartPaid : 0,
        flipkartOrganic: (platform === "All" || platform === "Flipkart") ? row.flipkartOrganic : 0,
        blinkit: (platform === "All" || platform === "Blinkit") ? row.blinkit : 0,
      };
    });

    // Aggregates based on active/filtered view
    const totalRevenue = dailyWithChannels.reduce((a, r) => a + r.revenue, 0);
    const totalSpent = dailyWithChannels.reduce((a, r) => a + r.spent, 0);
    const avgRoas = totalSpent > 0 ? totalRevenue / totalSpent : 0;
    const avgDailyRevenue = dailyWithChannels.length > 0 ? Math.round(totalRevenue / dailyWithChannels.length) : 0;

    // Best day based on platform revenue
    const bestDay = dailyWithChannels.reduce(
      (best, r) => (r.revenue > (best?.revenue ?? 0) ? r : best),
      null as typeof dailyWithChannels[0] | null
    );

    // Platform totals across the timeline
    const totalShopify = dateFiltered.reduce((a, r) => a + r.shopify, 0);
    const totalAmazonPaid = dateFiltered.reduce((a, r) => a + r.amazonPaid, 0);
    const totalAmazonOrganic = dateFiltered.reduce((a, r) => a + r.amazonOrganic, 0);
    const totalFlipkartPaid = dateFiltered.reduce((a, r) => a + r.flipkartPaid, 0);
    const totalFlipkartOrganic = dateFiltered.reduce((a, r) => a + r.flipkartOrganic, 0);
    const totalBlinkit = dateFiltered.reduce((a, r) => a + r.blinkit, 0);

    const overallTotalRevenue = totalShopify + totalAmazonPaid + totalFlipkartPaid + totalBlinkit;

    // Direct vs Indirect share
    const directRev = dailyWithChannels.reduce((a, r) => a + (r.directSales || 0), 0);
    const indirectRev = dailyWithChannels.reduce((a, r) => a + (r.indirectSales || 0), 0);
    
    // We update paidRevenue/organicRevenue so we don't have to rename everything in the JSX right now
    const paidRevenue = directRev;
    const organicRevenue = indirectRev;

    const paidOrganicData = [
      { name: "Direct Sales", value: paidRevenue },
      { name: "Indirect Sales", value: organicRevenue },
    ].filter(item => item.value > 0);

    if (paidOrganicData.length === 0) {
      paidOrganicData.push({ name: "Revenue", value: totalRevenue });
    }

    // Platform share using static/overall reference
    const platformShareData = [
      { name: "Shopify", value: totalShopify, percent: ((totalShopify / Math.max(1, overallTotalRevenue)) * 100).toFixed(1) },
      { name: "Amazon (Paid)", value: totalAmazonPaid, percent: ((totalAmazonPaid / Math.max(1, overallTotalRevenue)) * 100).toFixed(1) },
      { name: "Flipkart (Paid)", value: totalFlipkartPaid, percent: ((totalFlipkartPaid / Math.max(1, overallTotalRevenue)) * 100).toFixed(1) },
      { name: "Blinkit", value: totalBlinkit, percent: ((totalBlinkit / Math.max(1, overallTotalRevenue)) * 100).toFixed(1) },
    ];

    const highestChannel = platformShareData.reduce((max, c) => c.value > max.value ? c : max, platformShareData[0]);
    const daysAboveTarget = dailyWithChannels.filter(r => r.roas >= 3).length;

    // Date range
    const firstDate = dateFiltered.length > 0 ? dateFiltered[0].date : "";
    const lastDate = dateFiltered.length > 0 ? dateFiltered[dateFiltered.length - 1].date : "";

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
      bestDay: bestDay ? { date: bestDay.date, totalSales: bestDay.revenue } : null,
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
  }, [data, platform, dateRangeType, customStartDate, customEndDate]);

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
      label: "Average Revenue / Period",
      value: formatCurrency(avgDailyRevenue),
      sub: "vs previous period",
      icon: Activity,
      iconBg: "bg-emerald-500/15",
      iconColor: "text-emerald-500",
    },
    {
      label: "Best Period (Revenue)",
      value: bestDay ? bestDay.date : "—",
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
          <h1 className="text-2xl font-bold tracking-tight">Monthly Performance Summary</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {firstDate} – {lastDate}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex flex-col gap-1">
            <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Date Range</span>
            <select
              value={dateRangeType}
              onChange={(e) => setDateRangeType(e.target.value)}
              className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-xs font-medium outline-none cursor-pointer"
            >
              <option value="All">All Time</option>
              <option value="May26">May 2026</option>
              <option value="Apr26">April 2026</option>
              <option value="Mar26">March 2026</option>
              <option value="Last7">Last 7 Days</option>
              <option value="Last30">Last 30 Days</option>
              <option value="Custom">Custom...</option>
            </select>
          </div>

          {dateRangeType === "Custom" && (
            <>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">Start Date</span>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-2.5 py-1 text-xs font-medium outline-none text-foreground cursor-pointer"
                />
              </div>
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">End Date</span>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-2.5 py-1 text-xs font-medium outline-none text-foreground cursor-pointer"
                />
              </div>
            </>
          )}
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
            <h2 className="text-sm font-bold tracking-tight text-foreground">1. Monthly Revenue vs Spent</h2>
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
            <h2 className="text-sm font-bold tracking-tight text-foreground">2. Monthly ROAS Trend</h2>
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
        {/* Chart 3: Monthly Sales (Direct vs Indirect) */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-bold tracking-tight text-foreground">3. Monthly Sales (Direct vs Indirect)</h2>
          <div className="flex flex-wrap gap-x-3 gap-y-1 text-[9px] text-muted-foreground font-medium">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#1D4ED8" }} /> Direct Sales</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-sm inline-block" style={{ backgroundColor: "#0D9488" }} /> Indirect Sales</span>
          </div>
          <div className="flex-1 min-h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={daily} margin={{ top: 5, right: 0, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={7} tickLine={false} axisLine={false} interval={daily.length > 15 ? 2 : 1} />
                <YAxis stroke="#71717a" fontSize={8} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${formatCompactLabel(v)}`} />
                <Tooltip content={<ChannelTooltip />} />
                <Bar dataKey="directSales" name="Direct Sales" stackId="ch" fill="#1D4ED8" />
                <Bar dataKey="indirectSales" name="Indirect Sales" stackId="ch" fill="#0D9488" radius={[2, 2, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Direct vs Indirect Sales */}
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-3">
          <h2 className="text-sm font-bold tracking-tight text-foreground">4. Direct vs Indirect Sales</h2>
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
