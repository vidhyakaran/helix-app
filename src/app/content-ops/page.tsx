"use client";

import { CheckCircle2, Clock, Plus, Settings2, Sparkles } from "lucide-react";

const columns = [
  {
    id: "briefing",
    title: "Briefing & AI Setup",
    cards: [
      { id: 1, title: "Enterprise Security Architecture", client: "ACME Corp", llmScore: 88, googleScore: 92, tags: ["Technical"] },
      { id: 2, title: "How to Scale Organic Growth", client: "Startup Inc", llmScore: 95, googleScore: 85, tags: ["Strategy"] },
    ]
  },
  {
    id: "drafting",
    title: "Drafting",
    cards: [
      { id: 3, title: "Top SEO Agencies 2026", client: "Marketing LLC", llmScore: 70, googleScore: 90, tags: ["Listicle"] },
    ]
  },
  {
    id: "review",
    title: "Review & QA",
    cards: [
      { id: 4, title: "AI Search Optimization Guide", client: "TechFlow", llmScore: 98, googleScore: 94, tags: ["Pillar Page"] },
    ]
  },
  {
    id: "published",
    title: "Published",
    cards: []
  }
];

export default function ContentOperations() {
  return (
    <div className="h-full flex flex-col gap-6">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Content Operations</h1>
          <p className="text-sm text-muted-foreground mt-1">Dual-engine content pipeline (Google + LLM optimized).</p>
        </div>
        <div className="flex gap-2">
          <button className="px-3 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 flex items-center gap-2">
            <Settings2 size={16} />
            Pipeline Settings
          </button>
          <button className="px-3 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
            <Plus size={16} />
            New Content Brief
          </button>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-x-auto pb-4">
        {columns.map((col) => (
          <div key={col.id} className="flex-shrink-0 w-80 flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm text-foreground/90">{col.title}</h3>
                <span className="px-1.5 py-0.5 rounded-full bg-secondary text-xs font-medium text-muted-foreground">
                  {col.cards.length}
                </span>
              </div>
              <button className="text-muted-foreground hover:text-foreground">
                <Plus size={14} />
              </button>
            </div>

            <div className="flex-1 flex flex-col gap-3 bg-card/50 rounded-xl border border-border/50 p-2 overflow-y-auto min-h-[500px]">
              {col.cards.map((card) => (
                <div key={card.id} className="bg-card border border-border rounded-lg p-3 shadow-sm hover:border-primary/50 transition-colors cursor-pointer group">
                  <div className="flex items-start justify-between mb-2">
                    <span className="text-xs font-medium text-muted-foreground">{card.client}</span>
                    <button className="opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-foreground">
                      <Settings2 size={14} />
                    </button>
                  </div>
                  <h4 className="font-semibold text-sm mb-3 leading-snug">{card.title}</h4>
                  
                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {card.tags.map(tag => (
                      <span key={tag} className="px-2 py-0.5 rounded-sm bg-secondary text-[10px] font-medium text-secondary-foreground">
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center justify-between text-xs pt-3 border-t border-border">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 text-emerald-500 font-medium" title="Google SERP Score">
                        <CheckCircle2 size={12} />
                        {card.googleScore}
                      </div>
                      <div className="flex items-center gap-1 text-primary font-medium" title="LLM Extractability Score">
                        <Sparkles size={12} />
                        {card.llmScore}
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <Clock size={12} />
                      <span>2d</span>
                    </div>
                  </div>
                </div>
              ))}
              
              {col.cards.length === 0 && (
                <div className="h-24 border-2 border-dashed border-border rounded-lg flex items-center justify-center text-muted-foreground text-sm">
                  Drop items here
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
