"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ArrowUpRight, ArrowDownRight, Activity, Zap, CheckCircle2 } from "lucide-react";

const data = [
  { name: "Week 1", traffic: 4000, aiVisibility: 2400 },
  { name: "Week 2", traffic: 3000, aiVisibility: 1398 },
  { name: "Week 3", traffic: 2000, aiVisibility: 9800 },
  { name: "Week 4", traffic: 2780, aiVisibility: 3908 },
  { name: "Week 5", traffic: 1890, aiVisibility: 4800 },
  { name: "Week 6", traffic: 2390, aiVisibility: 3800 },
  { name: "Week 7", traffic: 3490, aiVisibility: 4300 },
];

const stats = [
  {
    name: "Portfolio Health",
    value: "92/100",
    change: "+4.1%",
    trend: "up",
    icon: Activity,
  },
  {
    name: "Attributed Revenue",
    value: "$1.2M",
    change: "+12.5%",
    trend: "up",
    icon: Zap,
  },
  {
    name: "AI Visibility Delta",
    value: "+24%",
    change: "WoW",
    trend: "up",
    icon: ArrowUpRight,
  },
  {
    name: "Tasks Completed",
    value: "142",
    change: "-2.1%",
    trend: "down",
    icon: CheckCircle2,
  },
];

const feed = [
  { time: "10m ago", text: "Citation Scraper Agent detected 3 new mentions in Perplexity for Client A.", type: "ai" },
  { time: "1h ago", text: "Sarah approved Content Brief: Enterprise Security.", type: "human" },
  { time: "2h ago", text: "Competitor Pulse Agent logged 5 new pages from ACME Corp.", type: "ai" },
  { time: "4h ago", text: "Schema validation failed on Client B's pricing page.", type: "alert" },
];

export default function ExecutiveDashboard() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Executive Overview</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80">
            Export Report
          </button>
          <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90">
            Run Diagnostics
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="p-5 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-2"
          >
            <div className="flex items-center justify-between text-muted-foreground">
              <span className="text-sm font-medium">{stat.name}</span>
              <stat.icon size={16} />
            </div>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-3xl font-bold">{stat.value}</span>
              <span
                className={`text-xs font-medium ${
                  stat.trend === "up" ? "text-emerald-500" : "text-rose-500"
                }`}
              >
                {stat.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col">
          <div className="flex flex-col gap-1 mb-6">
            <h2 className="text-lg font-semibold">Organic Traffic vs. AI Visibility</h2>
            <p className="text-sm text-muted-foreground">
              Portfolio-wide correlation over the last 7 weeks.
            </p>
          </div>
          <div className="flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#141416", borderColor: "#27272a", borderRadius: "8px" }}
                  itemStyle={{ color: "#fafafa" }}
                />
                <Line
                  type="monotone"
                  dataKey="traffic"
                  stroke="#fafafa"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="aiVisibility"
                  stroke="#7F77DD"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col">
          <div className="flex flex-col gap-1 mb-6">
            <h2 className="text-lg font-semibold">Action Feed</h2>
            <p className="text-sm text-muted-foreground">Real-time portfolio pulse.</p>
          </div>
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
            {feed.map((item, i) => (
              <div key={i} className="flex gap-3 text-sm">
                <div className="flex flex-col items-center gap-1 mt-1">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      item.type === "ai"
                        ? "bg-primary"
                        : item.type === "alert"
                        ? "bg-destructive"
                        : "bg-emerald-500"
                    }`}
                  />
                  {i !== feed.length - 1 && <div className="w-px h-full bg-border" />}
                </div>
                <div className="flex flex-col gap-1 pb-4">
                  <span className="text-xs font-medium text-muted-foreground">{item.time}</span>
                  <span className="text-foreground/90">{item.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
