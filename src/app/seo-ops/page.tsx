"use client";

import { useState, useEffect } from "react";
import {
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  CheckCircle,
  AlertTriangle,
  XCircle,
  RefreshCw,
  FileText,
  TrendingUp,
  Eye,
  MousePointerClick,
} from "lucide-react";

interface DailyData {
  date: string;
  impressions: number;
  totalATC: number;
  totalSales: number;
  budgetSpent: number;
  roas: number;
}

interface MonthlyData {
  month: string;
  impressions: number;
  totalATC: number;
  totalSales: number;
  amountSpent: number;
  roas: number;
}

interface ApiResponse {
  success: boolean;
  monthlySummary: MonthlyData[];
  dailyPerformance: DailyData[];
}

interface Keyword {
  keyword: string;
  category: "brand" | "category" | "transactional";
  volume: number;
  rank: number;
  change: number;
  ctr: number;
}

const initialKeywords: Keyword[] = [
  { keyword: "millex daily tracker", category: "brand", volume: 1200, rank: 1, change: 0, ctr: 42.5 },
  { keyword: "millex organic snacks", category: "brand", volume: 2400, rank: 2, change: 1, ctr: 28.1 },
  { keyword: "best healthy energy bars", category: "category", volume: 18500, rank: 8, change: -2, ctr: 4.8 },
  { keyword: "buy zero sugar snacks online", category: "transactional", volume: 5400, rank: 4, change: 3, ctr: 12.3 },
  { keyword: "blinkit instant delivery snacks", category: "category", volume: 8900, rank: 12, change: -1, ctr: 1.5 },
  { keyword: "millex energy bar price", category: "transactional", volume: 3200, rank: 1, change: 0, ctr: 38.9 },
  { keyword: "gluten free breakfast bars india", category: "category", volume: 6200, rank: 15, change: 4, ctr: 0.8 },
];

const auditPages = [
  { url: "/", title: "Millex Storefront Home", score: 94, status: "passing", issues: 2 },
  { url: "/products/energy-bar", title: "Millex Organic Energy Bar", score: 88, status: "passing", issues: 4 },
  { url: "/collections/snacks", title: "Snack Packs Collection", score: 72, status: "warning", issues: 9 },
  { url: "/about-us", title: "Brand Identity Story", score: 96, status: "passing", issues: 1 },
  { url: "/checkout", title: "Express Checkout Funnel", score: 58, status: "critical", issues: 14 },
];

export default function SeoOperations() {
  const [keywords, setKeywords] = useState<Keyword[]>(initialKeywords);
  const [search, setSearch] = useState("");
  const [activeFilter, setActiveFilter] = useState<"all" | "brand" | "category" | "transactional">("all");
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<ApiResponse | null>(null);

  useEffect(() => {
    fetch("/api/excel")
      .then((r) => r.json())
      .then((json) => { if (json.success) setData(json); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleScan = () => {
    setScanning(true);
    setTimeout(() => {
      setKeywords((prev) =>
        prev.map((k) => {
          const rand = Math.random();
          if (rand > 0.6) {
            const rankChange = Math.floor(Math.random() * 3) - 1;
            return { ...k, rank: Math.max(1, k.rank + rankChange), change: k.change + rankChange, ctr: Math.max(0.5, +(k.ctr + (Math.random() * 2 - 1)).toFixed(1)) };
          }
          return k;
        })
      );
      setScanning(false);
    }, 1500);
  };

  const filteredKeywords = keywords.filter((k) => {
    const matchesSearch = k.keyword.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = activeFilter === "all" || k.category === activeFilter;
    return matchesSearch && matchesFilter;
  });

  // Derive real stats from CSV
  const totalImpressions = data?.dailyPerformance.reduce((a, r) => a + r.impressions, 0) ?? 0;
  const totalATC = data?.dailyPerformance.reduce((a, r) => a + r.totalATC, 0) ?? 0;
  const atcRate = totalImpressions > 0 ? ((totalATC / totalImpressions) * 100).toFixed(2) : "0.00";
  const bestRoasDay = data?.dailyPerformance.reduce((best, r) => (r.roas > (best?.roas ?? 0) ? r : best), null as DailyData | null);
  const top3Keywords = keywords.filter((k) => k.rank <= 3).length;
  const avgCtr = (keywords.reduce((a, k) => a + k.ctr, 0) / keywords.length).toFixed(1);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">SEO Operations Command</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage search engine indexing, keyword ranks, and Millex performance metrics.</p>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/95 flex items-center gap-2 disabled:opacity-50 transition-all shadow-md shadow-primary/10"
        >
          {scanning ? <RefreshCw size={15} className="animate-spin" /> : <Sparkles size={15} />}
          <span>{scanning ? "Auditing ranks..." : "Run Organic Rank Scan"}</span>
        </button>
      </div>

      {/* Stats Cards — real CSV data */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-2">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5"><Eye size={12} /> Total Impressions</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold">{loading ? "—" : totalImpressions.toLocaleString("en-IN")}</span>
          </div>
          <span className="text-[10px] text-muted-foreground">All daily records from tracker</span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-2">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5"><MousePointerClick size={12} /> ATC Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold">{loading ? "—" : `${atcRate}%`}</span>
            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-0.5"><ArrowUpRight size={12} />Strong</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Add-to-cart rate (ATC / Impressions)</span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-2">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider flex items-center gap-1.5"><TrendingUp size={12} /> Top 3 Keywords</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold">{top3Keywords} / {keywords.length}</span>
            <span className="text-xs text-emerald-500 font-semibold flex items-center gap-0.5"><ArrowUpRight size={12} />Steady</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Keywords ranked #1 to #3</span>
        </div>

        <div className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-2">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Avg CTR</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold">{avgCtr}%</span>
            <span className="text-xs text-rose-500 font-semibold flex items-center gap-0.5"><ArrowDownRight size={12} />-1.2%</span>
          </div>
          <span className="text-[10px] text-muted-foreground">Blended organic search CTR</span>
        </div>
      </div>

      {/* Best RoAS Day banner */}
      {bestRoasDay && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 flex items-center gap-3">
          <Sparkles size={16} className="text-emerald-400 shrink-0" />
          <p className="text-sm text-foreground/90">
            <span className="font-semibold text-emerald-400">Peak RoAS Day:</span>{" "}
            <span className="font-medium">{bestRoasDay.date}</span> — achieved{" "}
            <span className="font-bold text-emerald-400">{bestRoasDay.roas.toFixed(2)}x RoAS</span> on ₹{bestRoasDay.budgetSpent.toLocaleString("en-IN")} spend,
            generating ₹{bestRoasDay.totalSales.toLocaleString("en-IN")} in sales. (Source: Millex Blinkit Tracker)
          </p>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Keyword Ranks */}
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold tracking-tight">Keyword Rank Tracker</h2>
              <p className="text-xs text-muted-foreground">Track organic visibility across target phrases.</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Filter keywords..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="bg-secondary border border-border rounded-lg pl-8 pr-2.5 py-1.5 text-xs outline-none focus:border-primary/80 transition-colors w-36"
                />
              </div>
              <select
                value={activeFilter}
                onChange={(e: any) => setActiveFilter(e.target.value)}
                className="bg-secondary border border-border text-xs rounded-lg px-2 py-1.5 outline-none font-medium cursor-pointer"
              >
                <option value="all">All Intent</option>
                <option value="brand">Brand</option>
                <option value="category">Category</option>
                <option value="transactional">Transactional</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-border rounded-xl">
            <table className="w-full text-xs text-left border-collapse">
              <thead className="text-[10px] font-semibold text-muted-foreground uppercase bg-secondary/60 border-b border-border">
                <tr>
                  <th className="px-4 py-3">Keyword</th>
                  <th className="px-4 py-3">Intent</th>
                  <th className="px-4 py-3 text-right">Search Vol</th>
                  <th className="px-4 py-3 text-right">Rank</th>
                  <th className="px-4 py-3 text-right">CTR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredKeywords.map((k, i) => (
                  <tr key={i} className="hover:bg-secondary/10 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">{k.keyword}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded text-[9px] font-semibold uppercase ${k.category === "brand" ? "bg-primary/10 text-primary border border-primary/20" : k.category === "transactional" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" : "bg-amber-500/10 text-amber-400 border border-amber-500/20"}`}>
                        {k.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-medium">{k.volume.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end w-full">
                        <span className="font-semibold text-foreground">#{k.rank}</span>
                        {k.change !== 0 && (
                          <span className={`text-[10px] flex items-center font-bold ${k.change > 0 ? "text-emerald-500" : "text-rose-500"}`}>
                            {k.change > 0 ? "+" : ""}{k.change}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-muted-foreground">{k.ctr}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column - Page Audit scores */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-4">
          <div>
            <h2 className="text-lg font-semibold tracking-tight">On-Page SEO Audits</h2>
            <p className="text-xs text-muted-foreground">Index audit results and crawl validation scores.</p>
          </div>
          <div className="flex-1 flex flex-col gap-3">
            {auditPages.map((page, i) => (
              <div key={i} className="p-3.5 border border-border bg-secondary/15 rounded-lg flex items-center justify-between hover:border-primary/20 transition-all cursor-pointer group">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 text-muted-foreground group-hover:text-primary transition-colors">
                    <FileText size={16} />
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-xs font-semibold text-foreground/90 leading-tight">{page.title}</span>
                    <span className="text-[10px] text-muted-foreground">{page.url}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs font-bold ${page.score >= 90 ? "text-emerald-500" : page.score >= 70 ? "text-amber-500" : "text-rose-500"}`}>{page.score}</span>
                    <span className="text-[8px] text-muted-foreground leading-none">{page.issues} issues</span>
                  </div>
                  <div>
                    {page.status === "passing" ? <CheckCircle size={14} className="text-emerald-500" /> : page.status === "warning" ? <AlertTriangle size={14} className="text-amber-500" /> : <XCircle size={14} className="text-rose-500" />}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Live Tracker Impressions Summary */}
          {!loading && data && (
            <div className="pt-4 border-t border-border">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2">Blinkit Tracker Impressions by Month</p>
              <div className="flex flex-col gap-1.5">
                {data.monthlySummary.map((m, i) => (
                  <div key={i} className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground/80">{m.month}</span>
                    <span className="font-semibold text-foreground">{m.impressions.toLocaleString("en-IN")}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
