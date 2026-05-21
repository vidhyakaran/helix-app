"use client";

import { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";
import { 
  BarChart3, 
  Download, 
  FileText, 
  ArrowUpRight, 
  CheckCircle,
  Database,
  RefreshCw,
  TrendingUp
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
}

const formatCurrency = (val: number) => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
};

export default function AnalyticsReports() {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);
  
  // Exporter states
  const [exportSuccess, setExportSuccess] = useState(false);
  const [reportType, setReportType] = useState("marketing");
  const [includeConversion, setIncludeConversion] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/excel");
      const json = await res.json();
      if (json.success) setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = (e: React.FormEvent) => {
    e.preventDefault();
    setExportSuccess(true);
    setTimeout(() => {
      setExportSuccess(false);
    }, 3000);
  };

  if (loading || !data) {
    return (
      <div className="h-full flex items-center justify-center p-12">
        <RefreshCw size={24} className="animate-spin text-primary" />
      </div>
    );
  }

  const { monthlySummary, dailyPerformance } = data;

  // 1. Funnel Math (Aggregate across all daily)
  const impressions = dailyPerformance.reduce((acc, r) => acc + r.impressions, 0);
  const atc = dailyPerformance.reduce((acc, r) => acc + r.totalATC, 0);
  const qty = dailyPerformance.reduce((acc, r) => acc + r.totalQty, 0);
  const sales = dailyPerformance.reduce((acc, r) => acc + r.totalSales, 0);

  const atcRate = impressions > 0 ? (atc / impressions) * 100 : 0;
  const purchaseRate = atc > 0 ? (qty / atc) * 100 : 0;

  // 2. Bar Chart Data (Reversing monthly for chronological order)
  const chartData = [...monthlySummary].reverse().map(m => ({
    name: m.month,
    Sales: m.totalSales,
    Spend: m.amountSpent,
    RoAS: m.roas
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Analytics & Report Builder</h1>
          <p className="text-sm text-muted-foreground mt-1">Deep analysis of marketing performance, conversion funnels, and ROAS metrics.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="px-2.5 py-1 bg-secondary border border-border text-[10px] font-semibold text-muted-foreground rounded-lg flex items-center gap-1.5">
            <Database size={10} />
            <span>SYNCED TRACKER DATA</span>
          </div>
        </div>
      </div>

      {/* Conversion Funnel Widget */}
      <div className="p-6 rounded-xl border border-border bg-card shadow-sm space-y-6">
        <div>
          <h2 className="text-lg font-semibold tracking-tight">Millex Conversion Funnel</h2>
          <p className="text-xs text-muted-foreground">Traffic attribution and conversion ratios across tracked channels.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-center">
          <div className="p-4 bg-secondary/10 border border-border rounded-xl">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">1. Impressions</span>
            <h3 className="text-2xl font-bold mt-1">{impressions.toLocaleString()}</h3>
            <span className="text-[9px] text-muted-foreground">Total views generated</span>
          </div>

          <div className="p-4 bg-secondary/15 border border-border rounded-xl relative">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">2. Add to Carts</span>
            <h3 className="text-2xl font-bold mt-1">{atc.toLocaleString()}</h3>
            <span className="text-[9px] text-primary font-semibold block mt-0.5">{atcRate.toFixed(2)}% ATC Rate</span>
          </div>

          <div className="p-4 bg-secondary/15 border border-border rounded-xl">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">3. Quantity Sold</span>
            <h3 className="text-2xl font-bold mt-1">{qty.toLocaleString()}</h3>
            <span className="text-[9px] text-primary font-semibold block mt-0.5">{purchaseRate.toFixed(1)}% Conversion</span>
          </div>

          <div className="p-4 bg-secondary/10 border border-border rounded-xl">
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">4. Total Sales</span>
            <h3 className="text-2xl font-bold mt-1 text-primary">{formatCurrency(sales)}</h3>
            <span className="text-[9px] text-muted-foreground">Total checkout value</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Performance Chart */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Monthly Marketing Spend vs. Sales</h2>
            <p className="text-xs text-muted-foreground">Comparison of budget invested versus total sales output per month.</p>
          </div>

          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, bottom: 5, left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#141416", borderColor: "#27272a", borderRadius: "8px" }}
                  itemStyle={{ color: "#fafafa" }}
                  formatter={(value) => [`₹${Number(value).toLocaleString()}`, ""]}
                />
                <Legend verticalAlign="top" height={36} iconType="circle" />
                <Bar dataKey="Sales" fill="#7F77DD" radius={[4, 4, 0, 0]} maxBarSize={45} />
                <Bar dataKey="Spend" fill="#F59E0B" radius={[4, 4, 0, 0]} maxBarSize={45} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Report Exporter */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">Export PDF/CSV Reports</h2>
            <p className="text-xs text-muted-foreground">Compile and generate custom diagnostic reports.</p>
          </div>

          <form onSubmit={handleExport} className="flex-1 flex flex-col gap-4 text-xs">
            <div className="flex flex-col gap-1.5">
              <label className="font-semibold text-muted-foreground uppercase">Report Focus</label>
              <select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="bg-secondary border border-border rounded-lg px-3 py-2 outline-none font-medium cursor-pointer"
              >
                <option value="marketing">Sales & Spend ROI Report</option>
                <option value="conversion">Attribution Funnel Audit</option>
                <option value="seo">Organic Keywords Visibility</option>
              </select>
            </div>

            <div className="flex flex-col gap-2.5 pt-2">
              <label className="font-semibold text-muted-foreground uppercase">Custom Inclusions</label>
              
              <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground/80">
                <input
                  type="checkbox"
                  checked={includeConversion}
                  onChange={(e) => setIncludeConversion(e.target.checked)}
                  className="w-3.5 h-3.5 rounded border border-border bg-secondary accent-primary"
                />
                Include conversion rates
              </label>

              <label className="flex items-center gap-2 cursor-pointer font-medium text-foreground/80">
                <input
                  type="checkbox"
                  defaultChecked
                  className="w-3.5 h-3.5 rounded border border-border bg-secondary accent-primary"
                />
                Include granular daily logs
              </label>
            </div>

            <button
              type="submit"
              className="mt-auto w-full py-2.5 bg-primary text-primary-foreground font-semibold rounded-lg hover:bg-primary/95 flex items-center justify-center gap-2 transition-all shadow-md shadow-primary/10"
            >
              <Download size={14} />
              Compile & Download
            </button>

            {exportSuccess && (
              <div className="p-3 border border-emerald-500/25 bg-emerald-500/10 text-emerald-400 rounded-lg flex items-center gap-2 animate-in fade-in duration-200">
                <CheckCircle size={14} />
                <span>Compilation successful. Download started!</span>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
