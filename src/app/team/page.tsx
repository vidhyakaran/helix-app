"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Bot, 
  User, 
  Terminal, 
  Play, 
  Pause, 
  Plus, 
  UserCheck, 
  Shield, 
  Activity, 
  Cpu 
} from "lucide-react";

interface TeamMember {
  id: string;
  name: string;
  role: string;
  type: "human" | "agent";
  status: "idle" | "active" | "offline";
  efficiency: number;
  tasksCompleted: number;
  avatarText: string;
}

const initialTeam: TeamMember[] = [
  { id: "1", name: "Citation Scraper", role: "LLM Citation Auditor", type: "agent", status: "active", efficiency: 98, tasksCompleted: 412, avatarText: "CS" },
  { id: "2", name: "Competitor Pulse", role: "SERP Competitor Scraper", type: "agent", status: "idle", efficiency: 94, tasksCompleted: 189, avatarText: "CP" },
  { id: "3", name: "Sarah Devine", role: "SEO Director & Editor", type: "human", status: "active", efficiency: 92, tasksCompleted: 84, avatarText: "SD" },
  { id: "4", name: "John K.", role: "Search Strategist", type: "human", status: "active", efficiency: 89, tasksCompleted: 56, avatarText: "JK" },
  { id: "5", name: "Schema Generator", role: "JSON-LD Validation Agent", type: "agent", status: "idle", efficiency: 100, tasksCompleted: 982, avatarText: "SG" },
  { id: "6", name: "Alex Mercer", role: "Fullstack Engineer", type: "human", status: "offline", efficiency: 85, tasksCompleted: 23, avatarText: "AM" }
];

export default function TeamManagement() {
  const [team, setTeam] = useState<TeamMember[]>(initialTeam);
  const [consoleLogs, setConsoleLogs] = useState<string[]>([
    "System initialized. Awaiting agent execution...",
    "All cognitive pipelines ready."
  ]);
  const [isConsoleRunning, setIsConsoleRunning] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLogs]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isConsoleRunning) {
      interval = setInterval(() => {
        const events = [
          "[INFO] Citation Scraper checking Perplexity mentions for 'Millex snacks'...",
          "[SUCCESS] Found 3 new citations on perplexity.ai/search?q=healthy-snacks-india",
          "[INFO] Schema Generator checking products/energy-bar markup validation...",
          "[SUCCESS] JSON-LD valid: 0 errors, 2 warnings (missing optional fields: sku, gtin8)",
          "[INFO] Competitor Pulse scanning ACME Corp organic rankings changes...",
          "[WARN] Competitor ACME Corp rank for 'gluten free snack' rose from #5 to #3",
          "[INFO] Auto-Brief Agent generating content brief: 'Scale organic growth'...",
          "[SUCCESS] Drafted content brief index: ACME-brief-9902"
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        const timestamp = new Date().toLocaleTimeString();
        setConsoleLogs(prev => [...prev, `[${timestamp}] ${randomEvent}`]);
      }, 2000);
    }
    return () => clearInterval(interval);
  }, [isConsoleRunning]);

  const toggleConsole = () => {
    setIsConsoleRunning(!isConsoleRunning);
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [
      ...prev,
      `[${timestamp}] ${isConsoleRunning ? "Agent console paused." : "Agent console booted. Core pipelines active."}`
    ]);
  };

  const clearConsole = () => {
    setConsoleLogs(["Terminal logs cleared."]);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Team & Agent Management</h1>
          <p className="text-sm text-muted-foreground mt-1">Manage human operators and configure autonomous AI agents.</p>
        </div>
        <button
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/95 flex items-center gap-2 shadow-md shadow-primary/10"
        >
          <Plus size={15} />
          <span>Deploy Custom Agent</span>
        </button>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 border border-border bg-card rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-primary/15 text-primary">
            <Bot size={20} />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">AI Agents Active</span>
            <h3 className="text-xl font-bold mt-0.5">3 Agents</h3>
          </div>
        </div>

        <div className="p-4 border border-border bg-card rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-emerald-500/15 text-emerald-400">
            <UserCheck size={20} />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Humans Online</span>
            <h3 className="text-xl font-bold mt-0.5">2 Members</h3>
          </div>
        </div>

        <div className="p-4 border border-border bg-card rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-amber-500/15 text-amber-400">
            <Activity size={20} />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">System Load</span>
            <h3 className="text-xl font-bold mt-0.5">42% (Normal)</h3>
          </div>
        </div>

        <div className="p-4 border border-border bg-card rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-indigo-500/15 text-indigo-400">
            <Cpu size={20} />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Total Executions</span>
            <h3 className="text-xl font-bold mt-0.5">1,583 Runs</h3>
          </div>
        </div>
      </div>

      {/* Split grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team Grid */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-lg font-semibold tracking-tight">Active Workgroups</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {team.map((member) => (
              <div 
                key={member.id}
                className="p-5 border border-border bg-card rounded-xl flex flex-col gap-4 hover:border-primary/30 transition-all group"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm border ${
                      member.type === "agent"
                        ? "bg-primary/10 border-primary/20 text-primary"
                        : "bg-secondary border-border text-foreground"
                    }`}>
                      {member.avatarText}
                    </div>
                    <div>
                      <h4 className="font-semibold text-sm flex items-center gap-1.5">
                        {member.name}
                        {member.type === "agent" && <Bot size={13} className="text-primary" />}
                      </h4>
                      <p className="text-xs text-muted-foreground">{member.role}</p>
                    </div>
                  </div>
                  
                  {/* Status Indicator */}
                  <span className={`w-2 h-2 rounded-full ${
                    member.status === "active"
                      ? "bg-emerald-500 shadow-sm shadow-emerald-500/50"
                      : member.status === "idle"
                      ? "bg-amber-500"
                      : "bg-muted-foreground/30"
                  }`} />
                </div>

                <div className="grid grid-cols-2 gap-2 pt-3 border-t border-border/60 text-xs">
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Efficiency</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{member.efficiency}%</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground block text-[10px] uppercase font-bold tracking-wider">Executions</span>
                    <span className="font-semibold text-foreground mt-0.5 block">{member.tasksCompleted} tasks</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Live Terminal Console */}
        <div className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col gap-4 min-h-[350px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-primary" />
              <h2 className="text-lg font-semibold tracking-tight">Agent Terminal</h2>
            </div>
            
            <div className="flex items-center gap-1.5">
              <button
                onClick={toggleConsole}
                className={`p-1.5 rounded border transition-colors ${
                  isConsoleRunning 
                    ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20" 
                    : "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                }`}
                title={isConsoleRunning ? "Pause Terminal" : "Start Terminal"}
              >
                {isConsoleRunning ? <Pause size={12} /> : <Play size={12} />}
              </button>
              <button
                onClick={clearConsole}
                className="px-2 py-1 bg-secondary text-muted-foreground hover:text-foreground border border-border rounded text-[10px] font-semibold transition-colors"
              >
                Clear
              </button>
            </div>
          </div>

          {/* CRT Terminal screen */}
          <div className="flex-1 bg-black rounded-lg p-3 font-mono text-[10px] text-emerald-400 border border-emerald-500/10 overflow-y-auto max-h-[300px] flex flex-col gap-1.5 shadow-inner">
            {consoleLogs.map((log, i) => (
              <div key={i} className="leading-relaxed break-all">
                {log}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
        </div>
      </div>
    </div>
  );
}
