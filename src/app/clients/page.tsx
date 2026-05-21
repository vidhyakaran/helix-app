"use client";

import { useState } from "react";
import { 
  Building2, 
  Plus, 
  ExternalLink, 
  ArrowUpRight, 
  Users, 
  Search, 
  CheckCircle,
  X,
  Sparkles
} from "lucide-react";

interface Client {
  name: string;
  domain: string;
  status: "active" | "onboarding" | "paused";
  health: number;
  revenueAttributed: string;
  spent: string;
  activeBriefs: number;
}

const initialClients: Client[] = [
  { name: "Millex", domain: "millex.in", status: "active", health: 96, revenueAttributed: "₹329,549", spent: "₹64,970", activeBriefs: 4 },
  { name: "ACME Corp", domain: "acme.com", status: "active", health: 88, revenueAttributed: "$120,400", spent: "$15,200", activeBriefs: 2 },
  { name: "TechFlow", domain: "techflow.io", status: "active", health: 91, revenueAttributed: "$45,900", spent: "$8,400", activeBriefs: 3 },
  { name: "Startup Inc", domain: "startup.co", status: "onboarding", health: 100, revenueAttributed: "$0", spent: "$0", activeBriefs: 1 },
];

export default function ClientPortals() {
  const [clients, setClients] = useState<Client[]>(initialClients);
  const [search, setSearch] = useState("");
  
  // Drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [newClientName, setNewClientName] = useState("");
  const [newClientDomain, setNewClientDomain] = useState("");
  const [newClientBudget, setNewClientBudget] = useState("");

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newClientName || !newClientDomain) return;

    const newClient: Client = {
      name: newClientName,
      domain: newClientDomain,
      status: "onboarding",
      health: 100,
      revenueAttributed: "$0",
      spent: newClientBudget ? `$${Number(newClientBudget).toLocaleString()}` : "$0",
      activeBriefs: 0
    };

    setClients([...clients, newClient]);
    
    // Reset form
    setNewClientName("");
    setNewClientDomain("");
    setNewClientBudget("");
    setIsDrawerOpen(false);
  };

  const filteredClients = clients.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.domain.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative space-y-6 min-h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Client Portals Command</h1>
          <p className="text-sm text-muted-foreground mt-1">Onboard clients, manage access rights, and inspect campaign growth.</p>
        </div>
        <button
          onClick={() => setIsDrawerOpen(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm font-semibold hover:bg-primary/95 flex items-center gap-2 shadow-md shadow-primary/10"
        >
          <Plus size={15} />
          <span>Onboard New Client</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-3">
        <div className="relative w-80">
          <Search size={12} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search by client name or website domain..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary border border-border rounded-lg pl-8 pr-2.5 py-1.5 text-xs outline-none focus:border-primary/80 transition-colors"
          />
        </div>
      </div>

      {/* Clients Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredClients.map((client, i) => (
          <div 
            key={i} 
            className="border border-border bg-card rounded-xl p-5 hover:border-primary/35 transition-all group flex flex-col gap-4 relative overflow-hidden"
          >
            {/* Top client detail */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-secondary/80 flex items-center justify-center text-muted-foreground border border-border">
                  <Building2 size={18} />
                </div>
                <div>
                  <h3 className="font-semibold text-sm flex items-center gap-1.5">
                    {client.name}
                    <a href={`https://${client.domain}`} target="_blank" rel="noopener noreferrer" className="text-muted-foreground hover:text-foreground">
                      <ExternalLink size={11} />
                    </a>
                  </h3>
                  <p className="text-xs text-muted-foreground">{client.domain}</p>
                </div>
              </div>

              <span className={`px-2 py-0.5 rounded text-[9px] font-bold uppercase ${
                client.status === "active"
                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                  : client.status === "onboarding"
                  ? "bg-indigo-500/10 text-indigo-400 border border-indigo-500/20"
                  : "bg-muted/10 text-muted-foreground border border-border"
              }`}>
                {client.status}
              </span>
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-3 gap-2 py-3 border-y border-border/50 text-xs">
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">Health</span>
                <span className={`font-semibold mt-0.5 block ${
                  client.health >= 90 ? "text-emerald-500" : "text-amber-500"
                }`}>
                  {client.health}%
                </span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">Revenue</span>
                <span className="font-semibold text-foreground mt-0.5 block">{client.revenueAttributed}</span>
              </div>
              <div>
                <span className="text-muted-foreground block text-[9px] uppercase font-bold tracking-wider">Ad Spend</span>
                <span className="font-semibold text-foreground mt-0.5 block">{client.spent}</span>
              </div>
            </div>

            {/* Bottom brief stats */}
            <div className="flex items-center justify-between text-[11px] text-muted-foreground">
              <span>{client.activeBriefs} active pipelines</span>
              <button className="text-primary font-medium hover:underline text-[11px] flex items-center gap-0.5">
                Manage Portal
                <ArrowUpRight size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Client Onboarding Slide-over Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="w-[400px] h-full bg-card border-l border-border p-6 shadow-2xl flex flex-col gap-6 animate-in slide-in-from-right duration-250">
            
            {/* Drawer Header */}
            <div className="flex items-center justify-between pb-4 border-b border-border">
              <div className="flex items-center gap-2">
                <Sparkles size={16} className="text-primary" />
                <h2 className="text-lg font-semibold">Onboard New Client</h2>
              </div>
              <button 
                onClick={() => setIsDrawerOpen(false)}
                className="p-1 hover:bg-secondary rounded-md text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAddClient} className="flex-1 flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Client Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Zepto Snacks"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/80 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Website Domain</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. zepto.com"
                  value={newClientDomain}
                  onChange={(e) => setNewClientDomain(e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/80 transition-colors"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Monthly Ad Budget (₹ or $)</label>
                <input
                  type="number"
                  placeholder="e.g. 50000"
                  value={newClientBudget}
                  onChange={(e) => setNewClientBudget(e.target.value)}
                  className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm outline-none focus:border-primary/80 transition-colors"
                />
              </div>

              <div className="mt-auto flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="flex-1 px-4 py-2.5 bg-secondary text-secondary-foreground hover:bg-secondary/80 rounded-lg text-sm font-semibold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2.5 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg text-sm font-semibold transition-colors"
                >
                  Submit Setup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
