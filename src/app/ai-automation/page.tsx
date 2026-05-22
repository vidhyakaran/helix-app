"use client";

import { useState, useEffect, useRef } from "react";
import {
  Bot,
  Play,
  Pause,
  RefreshCw,
  Cpu,
  Zap,
  ShieldCheck,
  Activity,
  Terminal,
  Server,
  ArrowRight,
  Sparkles,
  Layers,
  Database,
  Search,
  CheckCircle,
  AlertTriangle,
  History,
  CheckCircle2,
  Hourglass
} from "lucide-react";

interface AgentConfig {
  id: string;
  name: string;
  role: string;
  status: "idle" | "running" | "paused";
  efficiency: number;
  tasksCompleted: number;
  lastRun: string;
  color: string;
  avatarText: string;
}

const initialAgents: AgentConfig[] = [
  {
    id: "scraper",
    name: "Citation Scraper",
    role: "LLM Citation Auditor",
    status: "running",
    efficiency: 98.4,
    tasksCompleted: 412,
    lastRun: "2 mins ago",
    color: "from-purple-500 to-indigo-500",
    avatarText: "CS"
  },
  {
    id: "pulse",
    name: "Competitor Pulse",
    role: "SERP Competitor Scraper",
    status: "idle",
    efficiency: 94.2,
    tasksCompleted: 189,
    lastRun: "1 hour ago",
    color: "from-emerald-500 to-teal-500",
    avatarText: "CP"
  },
  {
    id: "schema",
    name: "Schema Generator",
    role: "JSON-LD Validation Agent",
    status: "running",
    efficiency: 100,
    tasksCompleted: 982,
    lastRun: "Just now",
    color: "from-amber-500 to-orange-500",
    avatarText: "SG"
  },
  {
    id: "brief",
    name: "Auto-Brief Agent",
    role: "AI Context Synthesizer",
    status: "idle",
    efficiency: 96.8,
    tasksCompleted: 304,
    lastRun: "3 hours ago",
    color: "from-rose-500 to-pink-500",
    avatarText: "AB"
  }
];

const mockLogs = [
  "[SYSTEM] All core cognitive pipelines initialized.",
  "[SYSTEM] SharePoint active sync established.",
  "[CS] Crawling perplexity.ai/search?q=best-healthy-energy-bars...",
  "[CS] Citation Scraper found 2 organic mentions for 'Millex snacks'.",
  "[SG] Validation passed for products/energy-bar schema (0 errors).",
  "[CP] Scanning ACME Corp keyword ranks in google.co.in...",
  "[AB] Auto-Brief Agent spawned for 'Gluten-Free Snack Ideas'.",
  "[SYSTEM] Background scheduler set to active (re-runs every 60s)."
];

export default function AIAutomationCenter() {
  const [agents, setAgents] = useState<AgentConfig[]>(initialAgents);
  const [isAutomationActive, setIsAutomationActive] = useState(true);
  const [consoleLogs, setConsoleLogs] = useState<string[]>(mockLogs);
  
  // Custom job launcher states
  const [selectedAgent, setSelectedAgent] = useState("scraper");
  const [customInput, setCustomInput] = useState("Millex healthy bars");
  const [jobProgress, setJobProgress] = useState(-1); // -1 means not running
  const [jobStatusText, setJobStatusText] = useState("");
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto Scroll Terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [consoleLogs]);

  // Periodic simulated agent background loops when automation is active
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isAutomationActive) {
      interval = setInterval(() => {
        const events = [
          {
            agentId: "scraper",
            log: "[CS] Citation Scraper checking gemini.google.com for organic mentions...",
            status: "[CS] [SUCCESS] Millex organic bar cited in 'Top low sugar breakfast options' outline."
          },
          {
            agentId: "pulse",
            log: "[CP] Competitor Pulse scanning ACME Corp organic ranking fluctuations...",
            status: "[CP] [WARN] Competitor ACME Corp rank for 'gluten free snack' rose from #5 to #3."
          },
          {
            agentId: "schema",
            log: "[SG] Schema Generator running JSON-LD audit on /collections/snacks...",
            status: "[SG] [SUCCESS] Schema verification complete. Validated Organization & Product graphs."
          },
          {
            agentId: "brief",
            log: "[AB] Auto-Brief Agent analyzing keyword density for 'healthy instant snacks'...",
            status: "[AB] [SUCCESS] Context brief generated successfully: ACME-brief-9904."
          }
        ];

        // Randomly select one agent event
        const randomIndex = Math.floor(Math.random() * events.length);
        const event = events[randomIndex];
        const timestamp = new Date().toLocaleTimeString();

        // Append logs
        setConsoleLogs(prev => [
          ...prev, 
          `[${timestamp}] ${event.log}`, 
          `[${timestamp}] ${event.status}`
        ]);

        // Increment tasks completed and set status to running briefly
        setAgents(prevAgents => 
          prevAgents.map(a => {
            if (a.id === event.agentId) {
              return {
                ...a,
                status: "running",
                tasksCompleted: a.tasksCompleted + 1,
                lastRun: "Just now"
              };
            }
            return a;
          })
        );

        // Reset running status back to idle after 1.2s if they were idle previously
        setTimeout(() => {
          setAgents(prevAgents =>
            prevAgents.map(a => {
              if (a.id === event.agentId && initialAgents.find(x => x.id === a.id)?.status === "idle") {
                return { ...a, status: "idle" };
              }
              return a;
            })
          );
        }, 1200);

      }, 3500);
    }
    return () => clearInterval(interval);
  }, [isAutomationActive]);

  // Toggle Global Automation Loop
  const handleToggleAutomation = () => {
    setIsAutomationActive(!isAutomationActive);
    const timestamp = new Date().toLocaleTimeString();
    setConsoleLogs(prev => [
      ...prev,
      `[${timestamp}] [SYSTEM] Global Automation scheduler ${!isAutomationActive ? "RESUMED" : "PAUSED"}.`
    ]);
  };

  // Trigger Custom Job Execution
  const triggerCustomJob = () => {
    if (jobProgress !== -1) return; // job already in progress

    const agentObj = agents.find(a => a.id === selectedAgent);
    if (!agentObj) return;

    // Start progress emulation
    setJobProgress(0);
    setJobStatusText("Initializing cognitive context...");

    // Update state to running
    setAgents(prev => prev.map(a => a.id === selectedAgent ? { ...a, status: "running" } : a));

    const steps = [
      { p: 20, t: "Retrieving SharePoint live datasets..." },
      { p: 45, t: `Scraping queries for '${customInput}'...` },
      { p: 70, t: "Running neural correlation check..." },
      { p: 90, t: "Synthesizing validation audit report..." },
      { p: 100, t: "Job complete!" }
    ];

    steps.forEach((step, idx) => {
      setTimeout(() => {
        setJobProgress(step.p);
        setJobStatusText(step.t);

        const timestamp = new Date().toLocaleTimeString();
        setConsoleLogs(prev => [
          ...prev,
          `[${timestamp}] [${agentObj.avatarText}] ${step.t}`
        ]);

        if (step.p === 100) {
          // Finalize job
          setTimeout(() => {
            setJobProgress(-1);
            setJobStatusText("");
            setAgents(prev => prev.map(a => {
              if (a.id === selectedAgent) {
                return {
                  ...a,
                  status: initialAgents.find(x => x.id === a.id)?.status || "idle",
                  tasksCompleted: a.tasksCompleted + 1,
                  lastRun: "Just now"
                };
              }
              return a;
            }));
          }, 800);
        }
      }, (idx + 1) * 700);
    });
  };

  const clearLogs = () => {
    setConsoleLogs(["[SYSTEM] Console history cleared."]);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header section with Global Run Toggle */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-card border border-border rounded-2xl relative overflow-hidden shadow-lg">
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-primary/5 rounded-full blur-[100px] pointer-events-none" />
        
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-primary/10 text-primary">
              <Bot size={22} className="animate-pulse" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight">AI Agent Automation Command</h1>
          </div>
          <p className="text-sm text-muted-foreground mt-1 max-w-2xl">
            Deploy, schedule, and trigger autonomous workflows across LLM citation metrics, competitor SERPs, and schema structure validation.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={handleToggleAutomation}
            className={`px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 border shadow-lg transition-all ${
              isAutomationActive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/35 hover:bg-emerald-500/20 shadow-emerald-950/20"
                : "bg-amber-500/10 text-amber-400 border-amber-500/35 hover:bg-amber-500/20 shadow-amber-950/20"
            }`}
          >
            {isAutomationActive ? (
              <>
                <Play size={15} className="animate-spin text-emerald-400" />
                <span>Scheduler: Active</span>
              </>
            ) : (
              <>
                <Pause size={15} className="text-amber-400" />
                <span>Scheduler: Paused</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Grid of Automation Performance Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 bg-card border border-border rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-primary/40 transition-all">
          <div className="p-3 bg-primary/10 text-primary rounded-lg">
            <Cpu size={20} className="group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Global Core Usage</span>
            <span className="text-xl font-bold text-foreground mt-0.5 block">99.8% Efficiency</span>
          </div>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-emerald-500/40 transition-all">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <ShieldCheck size={20} className="group-hover:scale-110 transition-transform duration-300" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Valid Assertions</span>
            <span className="text-xl font-bold text-foreground mt-0.5 block">99.4% Success Rate</span>
          </div>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
            <Activity size={20} className="group-hover:translate-x-0.5 transition-transform duration-300" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Avg API Latency</span>
            <span className="text-xl font-bold text-foreground mt-0.5 block">420 ms Response</span>
          </div>
        </div>

        <div className="p-5 bg-card border border-border rounded-xl flex items-center gap-4 relative overflow-hidden group hover:border-indigo-500/40 transition-all">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
            <Server size={20} className="group-hover:rotate-6 transition-transform duration-300" />
          </div>
          <div>
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider block">Active Agent Workers</span>
            <span className="text-xl font-bold text-foreground mt-0.5 block">{agents.filter(a => a.status === "running").length} / {agents.length} Running</span>
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Side: Agent Config & Launcher */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Agent Deployment Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold tracking-tight">Registered Cognitive Agents</h2>
              <span className="text-xs text-muted-foreground bg-secondary/80 px-2.5 py-1 rounded-md border border-border font-medium">4 Agents Configured</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {agents.map((agent) => (
                <div
                  key={agent.id}
                  className="p-5 border border-border bg-card rounded-xl flex flex-col justify-between gap-4 hover:border-primary/30 transition-all group relative overflow-hidden shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${agent.color} flex items-center justify-center font-bold text-sm text-white shadow-md shadow-black/10`}>
                        {agent.avatarText}
                      </div>
                      <div>
                        <h4 className="font-semibold text-sm flex items-center gap-1.5 text-foreground/95">
                          {agent.name}
                          {agent.status === "running" && <Bot size={13} className="text-primary animate-bounce" />}
                        </h4>
                        <p className="text-[11px] text-muted-foreground">{agent.role}</p>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider flex items-center gap-1 ${
                      agent.status === "running"
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        : agent.status === "paused"
                        ? "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                        : "bg-secondary text-muted-foreground border border-border"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        agent.status === "running" ? "bg-emerald-400 animate-ping" : agent.status === "paused" ? "bg-rose-400" : "bg-muted-foreground/50"
                      }`} />
                      {agent.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 pt-3 border-t border-border/60 text-xs">
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">Efficiency</span>
                      <span className="font-bold text-foreground mt-0.5 block">{agent.efficiency}%</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">Runs</span>
                      <span className="font-bold text-foreground mt-0.5 block">{agent.tasksCompleted} tasks</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">Last Sync</span>
                      <span className="font-bold text-foreground mt-0.5 block truncate">{agent.lastRun}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Interactive Job Launcher Panel */}
          <div className="p-6 border border-border bg-card rounded-2xl shadow-sm relative overflow-hidden">
            <div className="absolute top-0 left-0 w-44 h-44 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-primary" />
              <h2 className="text-base font-bold tracking-tight">Manual Agent Task Launcher</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Target Agent</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs font-medium outline-none focus:border-primary/80 transition-colors cursor-pointer"
                >
                  <option value="scraper">Citation Scraper (Mentions Search)</option>
                  <option value="pulse">Competitor Pulse (SERP Indexing)</option>
                  <option value="schema">Schema Generator (JSON-LD QA)</option>
                  <option value="brief">Auto-Brief Agent (Brief Outlines)</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider block">Target Context / Query</label>
                <input
                  type="text"
                  value={customInput}
                  onChange={(e) => setCustomInput(e.target.value)}
                  placeholder="e.g. products/energy-bar or 'healthy food organic'"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-xs outline-none focus:border-primary/80 transition-colors"
                />
              </div>
            </div>

            {/* Progress view when a task is running */}
            {jobProgress !== -1 && (
              <div className="mt-5 space-y-2 p-4 bg-secondary/35 border border-border rounded-xl animate-pulse">
                <div className="flex justify-between items-center text-xs font-medium">
                  <span className="text-primary font-bold flex items-center gap-1.5">
                    <Hourglass size={12} className="animate-spin" />
                    Executing: {agents.find(a => a.id === selectedAgent)?.name}
                  </span>
                  <span className="text-muted-foreground">{jobProgress}%</span>
                </div>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-primary to-indigo-500 rounded-full transition-all duration-300"
                    style={{ width: `${jobProgress}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground italic flex items-center gap-1">
                  <Activity size={10} className="text-primary" />
                  <span>{jobStatusText}</span>
                </div>
              </div>
            )}

            <div className="mt-5 flex justify-end">
              <button
                onClick={triggerCustomJob}
                disabled={jobProgress !== -1 || !customInput.trim()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/95 flex items-center gap-1.5 disabled:opacity-40 transition-colors shadow-md shadow-primary/20 cursor-pointer"
              >
                <span>Initiate Pipeline</span>
                <ArrowRight size={13} />
              </button>
            </div>
          </div>

        </div>

        {/* Right Side: Live Log Terminal Console */}
        <div className="p-6 rounded-2xl border border-border bg-card shadow-sm flex flex-col gap-4 min-h-[450px]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Terminal size={16} className="text-primary" />
              <h2 className="text-base font-bold tracking-tight">Active Automation Logs</h2>
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={clearLogs}
                className="px-2 py-1 bg-secondary text-muted-foreground hover:text-foreground border border-border rounded-md text-[9px] font-semibold transition-colors cursor-pointer"
              >
                Clear Screen
              </button>
            </div>
          </div>

          {/* CRT Terminal Screen */}
          <div className="flex-1 bg-neutral-950 rounded-xl p-4 font-mono text-[10px] text-indigo-400 border border-indigo-500/10 overflow-y-auto max-h-[380px] flex flex-col gap-2 shadow-inner relative">
            {/* Terminal reflection glass line */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/5 to-transparent pointer-events-none rounded-xl" />
            
            {consoleLogs.map((log, i) => {
              const isSuccess = log.includes("[SUCCESS]");
              const isWarn = log.includes("[WARN]");
              const isSystem = log.includes("[SYSTEM]");
              
              let textColor = "text-indigo-400";
              if (isSuccess) textColor = "text-emerald-400 font-medium";
              if (isWarn) textColor = "text-amber-400 font-medium";
              if (isSystem) textColor = "text-sky-400 font-semibold";
              
              return (
                <div key={i} className={`leading-relaxed break-all ${textColor}`}>
                  {log}
                </div>
              );
            })}
            <div ref={terminalEndRef} />
          </div>
        </div>

      </div>
    </div>
  );
}
