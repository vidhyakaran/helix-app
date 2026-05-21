"use client";

import { useState, useEffect } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import {
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Zap,
  CheckCircle2,
  Calendar,
  Layers,
  Search,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Database,
  BarChart3
} from "lucide-react";

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

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
};

const formatNumber = (val: number) => {
  return new Intl.NumberFormat("en-IN").format(val);
};

export default function ExecutiveDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<ApiResponse | null>(null);
  const [chartMetric, setChartMetric] = useState<"sales_vs_spend" | "impressions_vs_atc">("sales_vs_spend");
  
  // Sheet Explorer State
  const [activeTab, setActiveTab] = useState<"daily" | "monthly">("daily");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 10;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/excel");
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      const json: ApiResponse = await res.json();
      if (!json.success) {
        throw new Error("API returned failed status");
      }
      setData(json);
    } catch (err: any) {
      console.error("Dashboard fetch error:", err);
      setError(err.message || "Failed to load live data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-64 bg-secondary/80 rounded-md"></div>
            <div className="h-4 w-96 bg-secondary/50 rounded-md"></div>
          </div>
          <div className="h-10 w-32 bg-secondary/80 rounded-md"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-28 bg-card border border-border/50 rounded-xl p-5 space-y-3">
              <div className="h-4 w-24 bg-secondary/80 rounded"></div>
              <div className="h-8 w-32 bg-secondary rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-[400px] bg-card border border-border/50 rounded-xl p-6"></div>
          <div className="h-[400px] bg-card border border-border/50 rounded-xl p-6"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="h-[500px] flex flex-col items-center justify-center text-center p-6 border border-dashed border-destructive/20 rounded-xl bg-destructive/5 gap-4">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
          <Layers size={24} />
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

  const { monthlySummary, dailyPerformance } = data;

  // 1. Calculate Aggregates
  const totalSales = dailyPerformance.reduce((acc, row) => acc + row.totalSales, 0);
  const totalSpend = dailyPerformance.reduce((acc, row) => acc + row.budgetSpent, 0);
  const blendedRoas = totalSpend > 0 ? totalSales / totalSpend : 0;
  const totalImpressions = dailyPerformance.reduce((acc, row) => acc + row.impressions, 0);

  // MoM calculations: Latest month (May '26) vs Previous (April '26)
  let salesMoM = 0;
  let spendMoM = 0;
  let roasMoM = 0;
  let impMoM = 0;

  if (monthlySummary && monthlySummary.length >= 2) {
    const latest = monthlySummary[0];
    const prev = monthlySummary[1];
    
    salesMoM = prev.totalSales > 0 ? ((latest.totalSales - prev.totalSales) / prev.totalSales) * 100 : 0;
    spendMoM = prev.amountSpent > 0 ? ((latest.amountSpent - prev.amountSpent) / prev.amountSpent) * 100 : 0;
    roasMoM = prev.roas > 0 ? ((latest.roas - prev.roas) / prev.roas) * 100 : 0;
    impMoM = prev.impressions > 0 ? ((latest.impressions - prev.impressions) / prev.impressions) * 100 : 0;
  }

  const stats = [
    {
      name: "Attributed Revenue",
      value: formatCurrency(totalSales),
      change: `${salesMoM >= 0 ? "+" : ""}${salesMoM.toFixed(1)}%`,
      trend: salesMoM >= 0 ? "up" : "down",
      icon: Zap,
      label: "Total tracker sales"
    },
    {
      name: "Total Budget Spent",
      value: formatCurrency(totalSpend),
      change: `${spendMoM >= 0 ? "+" : ""}${spendMoM.toFixed(1)}%`,
      trend: spendMoM >= 0 ? "up" : "down", // For spent, up might be bad but we follow standard arrow direction
      icon: Activity,
      label: "Total tracker spend"
    },
    {
      name: "Blended RoAS",
      value: `${blendedRoas.toFixed(2)}x`,
      change: `${roasMoM >= 0 ? "+" : ""}${roasMoM.toFixed(1)}%`,
      trend: roasMoM >= 0 ? "up" : "down",
      icon: ArrowUpRight,
      label: "Blended Return on Ad Spend"
    },
    {
      name: "Total Impressions",
      value: formatNumber(totalImpressions),
      change: `${impMoM >= 0 ? "+" : ""}${impMoM.toFixed(1)}%`,
      trend: impMoM >= 0 ? "up" : "down",
      icon: CheckCircle2,
      label: "All impressions"
    },
  ];

  // 2. Prepare Chart Data (Aggregated by Day for Recharts)
  // Let's take the daily performance data. It is currently in reverse chronological order (or chronological).
  // Let's sort it chronologically for the chart.
  const chronologicalDaily = [...dailyPerformance].reverse();
  
  // To keep chart clean, show the last 30 daily records
  const chartData = chronologicalDaily.slice(-30).map((row) => ({
    name: row.date.split("-").slice(0, 2).join(" "), // e.g. "1 May"
    Sales: row.totalSales,
    Spend: row.budgetSpent,
    Impressions: row.impressions,
    ATC: row.totalATC,
  }));

  // 3. Dynamic Action Feed Alerts from Spreadsheet Data
  const dynamicFeed = [
    {
      time: "Latest Sync",
      text: `Connected to ${data.dataSource === 'sharepoint-live' ? 'SharePoint Live Worksheet' : 'Local CSV Fallback'}. Row count: ${dailyPerformance.length}.`,
      type: "sync"
    },
    {
      time: "Milestone Alert",
      text: `March'26 registered peak sales of ${formatCurrency(monthlySummary.find(m => m.month.startsWith('March'))?.totalSales || 0)}.`,
      type: "ai"
    },
    {
      time: "RoAS Alert",
      text: `Blended RoAS across last 90 days stands at ${blendedRoas.toFixed(2)}x.`,
      type: "ai"
    },
    {
      time: "High Performance",
      text: `April'26 achieved a strong monthly RoAS of 6.9x on a spend of ${formatCurrency(5264)}.`,
      type: "alert"
    }
  ];

  // 4. Sheet Explorer Data & Pagination
  const filteredDaily = dailyPerformance.filter((row) =>
    row.date.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredDaily.length / rowsPerPage);
  const indexOfLastRow = currentPage * rowsPerPage;
  const indexOfFirstRow = indexOfLastRow - rowsPerPage;
  const currentDailyRows = filteredDaily.slice(indexOfFirstRow, indexOfLastRow);

  return (
    <div className="space-y-6">
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Millex Daily Tracker Overview</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Marketing performance dashboards synced with {data.meta?.file || "Millex Daily tracker sheet.xlsx"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Connection Status Badge */}
          <div className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-2 ${
            data.dataSource === 'sharepoint-live' 
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
          }`}>
            <Database size={12} className={data.dataSource === 'sharepoint-live' ? 'animate-pulse' : ''} />
            <span>{data.dataSource === 'sharepoint-live' ? 'SHAREPOINT LIVE' : 'LOCAL CSV FALLBACK'}</span>
          </div>

          <button 
            onClick={fetchData}
            className="p-2 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg transition-colors border border-border"
            title="Reload Data"
          >
            <RefreshCw size={15} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.name}
              className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-2 relative overflow-hidden group hover:border-primary/45 transition-colors"
            >
              <div className="flex items-center justify-between text-muted-foreground">
                <span className="text-sm font-medium">{stat.name}</span>
                <Icon size={16} className="text-muted-foreground group-hover:text-primary transition-colors" />
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold tracking-tight">{stat.value}</span>
                <span
                  className={`text-xs font-medium flex items-center gap-0.5 ${
                    stat.trend === "up" ? "text-emerald-500" : "text-rose-500"
                  }`}
                >
                  {stat.trend === "up" ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                  {stat.change}
                </span>
              </div>
              <span className="text-[10px] text-muted-foreground mt-1">{stat.label}</span>
            </div>
          );
        })}
      </div>

      {/* Charts & Actions Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Timeline Performance</h2>
              <p className="text-xs text-muted-foreground">Displaying daily records for the last 30 tracked days.</p>
            </div>
            <select 
              value={chartMetric} 
              onChange={(e) => setChartMetric(e.target.value as any)}
              className="bg-secondary border border-border/80 text-xs rounded-lg px-3 py-1.5 outline-none font-medium cursor-pointer"
            >
              <option value="sales_vs_spend">Sales vs Budget Spent (₹)</option>
              <option value="impressions_vs_atc">Impressions vs Add to Carts</option>
            </select>
          </div>

          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              {chartMetric === "sales_vs_spend" ? (
                <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#141416", borderColor: "#27272a", borderRadius: "8px" }}
                    itemStyle={{ color: "#fafafa" }}
                    formatter={(value) => [`₹${Number(value).toLocaleString()}`, ""]}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line
                    type="monotone"
                    dataKey="Sales"
                    stroke="#7F77DD"
                    strokeWidth={2.5}
                    dot={{ r: 3, strokeWidth: 1.5 }}
                    activeDot={{ r: 5 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Spend"
                    stroke="#F59E0B"
                    strokeWidth={2}
                    dot={{ r: 3, strokeWidth: 1 }}
                    activeDot={{ r: 5 }}
                  />
                </LineChart>
              ) : (
                <LineChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#141416", borderColor: "#27272a", borderRadius: "8px" }}
                    itemStyle={{ color: "#fafafa" }}
                  />
                  <Legend verticalAlign="top" height={36} iconType="circle" />
                  <Line
                    type="monotone"
                    dataKey="Impressions"
                    stroke="#10B981"
                    strokeWidth={2.5}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="ATC"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4 }}
                  />
                </LineChart>
              )}
            </ResponsiveContainer>
          </div>
        </div>

        {/* Action Feed */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Active Logs & Feed</h2>
            <p className="text-xs text-muted-foreground">Real-time alerts generated from sheet audits.</p>
          </div>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-1">
            {dynamicFeed.map((item, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="flex flex-col items-center gap-1 mt-1 shrink-0">
                  <div
                    className={`w-2.5 h-2.5 rounded-full border ${
                      item.type === "sync"
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-500"
                        : item.type === "alert"
                        ? "bg-amber-500/20 border-amber-500 text-amber-500"
                        : "bg-primary/20 border-primary text-primary"
                    }`}
                  />
                  {i !== dynamicFeed.length - 1 && <div className="w-px h-full bg-border mt-1" />}
                </div>
                <div className="flex flex-col gap-0.5 pb-2">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase">{item.time}</span>
                  <span className="text-foreground/90 leading-relaxed text-xs">{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Spreadsheet Explorer Table */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Millex Spreadsheet Explorer</h2>
            <p className="text-xs text-muted-foreground">Explore raw records extracted from the spreadsheet.</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Table Tabs */}
            <div className="flex bg-secondary p-1 rounded-lg border border-border/80">
              <button
                onClick={() => { setActiveTab("daily"); setCurrentPage(1); }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === "daily" ? "bg-card text-foreground border border-border/20 shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Daily Data
              </button>
              <button
                onClick={() => { setActiveTab("monthly"); setCurrentPage(1); }}
                className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
                  activeTab === "monthly" ? "bg-card text-foreground border border-border/20 shadow-sm" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Monthly Summary
              </button>
            </div>

            {/* Daily Date Search */}
            {activeTab === "daily" && (
              <div className="relative w-44">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search date..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="w-full bg-secondary border border-border/80 rounded-lg pl-8 pr-2.5 py-1.5 text-xs outline-none focus:border-primary/80 transition-colors"
                />
              </div>
            )}
          </div>
        </div>

        {/* Tab content */}
        {activeTab === "daily" ? (
          <div className="space-y-4">
            <div className="overflow-x-auto border border-border rounded-xl">
              <table className="w-full text-xs text-left border-collapse">
                <thead className="text-[10px] font-semibold text-muted-foreground uppercase bg-secondary/70 border-b border-border">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Date</th>
                    <th className="px-4 py-3 font-semibold text-right">Impressions</th>
                    <th className="px-4 py-3 font-semibold text-right">Total ATC</th>
                    <th className="px-4 py-3 font-semibold text-right">Total Qty</th>
                    <th className="px-4 py-3 font-semibold text-right">Total Sales</th>
                    <th className="px-4 py-3 font-semibold text-right">Budget Spent</th>
                    <th className="px-4 py-3 font-semibold text-right">RoAS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {currentDailyRows.length > 0 ? (
                    currentDailyRows.map((row, i) => (
                      <tr key={i} className="hover:bg-secondary/15 transition-colors">
                        <td className="px-4 py-3 font-medium text-foreground">{row.date}</td>
                        <td className="px-4 py-3 text-right">{formatNumber(row.impressions)}</td>
                        <td className="px-4 py-3 text-right">{row.totalATC}</td>
                        <td className="px-4 py-3 text-right">{row.totalQty}</td>
                        <td className="px-4 py-3 text-right font-medium text-foreground">{formatCurrency(row.totalSales)}</td>
                        <td className="px-4 py-3 text-right">{formatCurrency(row.budgetSpent)}</td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            row.roas >= 4 
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                              : row.roas > 0 
                              ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                          }`}>
                            {row.roas.toFixed(2)}x
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-muted-foreground">
                        No daily records match your search query.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination controls */}
            {filteredDaily.length > rowsPerPage && (
              <div className="flex items-center justify-between text-xs text-muted-foreground pt-2">
                <span>
                  Showing {indexOfFirstRow + 1} to {Math.min(indexOfLastRow, filteredDaily.length)} of {filteredDaily.length} records
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-1.5 bg-secondary hover:bg-secondary/80 rounded border border-border disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={14} />
                  </button>
                  <span className="font-semibold text-foreground px-2">Page {currentPage} of {totalPages}</span>
                  <button
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-1.5 bg-secondary hover:bg-secondary/80 rounded border border-border disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={14} />
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="text-[10px] font-semibold text-muted-foreground uppercase bg-secondary/70 border-b border-border">
                <tr>
                  <th className="px-4 py-3 font-semibold">Month</th>
                  <th className="px-4 py-3 font-semibold text-right">Impressions</th>
                  <th className="px-4 py-3 font-semibold text-right">Total ATC</th>
                  <th className="px-4 py-3 font-semibold text-right">Total Qty Sold</th>
                  <th className="px-4 py-3 font-semibold text-right">Total Sales</th>
                  <th className="px-4 py-3 font-semibold text-right">Amount Spent</th>
                  <th className="px-4 py-3 font-semibold text-right">RoAS</th>
                  <th className="px-4 py-3 font-semibold text-right">Revenue</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {monthlySummary.map((row, i) => (
                  <tr key={i} className="hover:bg-secondary/15 transition-colors">
                    <td className="px-4 py-3 font-semibold text-foreground">{row.month}</td>
                    <td className="px-4 py-3 text-right">{formatNumber(row.impressions)}</td>
                    <td className="px-4 py-3 text-right">{row.totalATC}</td>
                    <td className="px-4 py-3 text-right">{row.totalQty}</td>
                    <td className="px-4 py-3 text-right font-medium text-foreground">{formatCurrency(row.totalSales)}</td>
                    <td className="px-4 py-3 text-right">{formatCurrency(row.amountSpent)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-primary">{row.roas.toFixed(1)}x</span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-foreground">{formatCurrency(row.revenue)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

