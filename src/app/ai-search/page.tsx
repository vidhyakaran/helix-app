"use client";

import { useState } from "react";
import { Sparkles, ArrowRight, BrainCircuit, Globe, ArrowUpRight } from "lucide-react";

const matrixData = [
  { prompt: "Best enterprise SEO software", gpt4: "cited", claude: "cited", perplexity: "omitted", gemini: "cited" },
  { prompt: "How to scale organic growth", gpt4: "omitted", claude: "cited", perplexity: "competitor", gemini: "omitted" },
  { prompt: "Top SEO agencies in 2026", gpt4: "competitor", claude: "competitor", perplexity: "cited", gemini: "cited" },
  { prompt: "AI search optimization guide", gpt4: "cited", claude: "cited", perplexity: "cited", gemini: "cited" },
];

export default function AISearchCenter() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">AI Search Optimization Center</h1>
          <p className="text-sm text-muted-foreground mt-1">LLM citation tracking and entity strength monitoring.</p>
        </div>
        <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium hover:bg-primary/90 flex items-center gap-2">
          <Sparkles size={16} />
          Run Visibility Scan
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 p-6 rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">Prompt Coverage Matrix</h2>
            <select className="bg-secondary border-none text-sm rounded-md px-3 py-1 outline-none">
              <option>All Clients</option>
              <option>Client A</option>
              <option>Client B</option>
            </select>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-muted-foreground uppercase bg-secondary/50">
                <tr>
                  <th className="px-4 py-3 font-medium rounded-tl-md">Target Prompt</th>
                  <th className="px-4 py-3 font-medium">GPT-4o</th>
                  <th className="px-4 py-3 font-medium">Claude 3.5</th>
                  <th className="px-4 py-3 font-medium">Perplexity</th>
                  <th className="px-4 py-3 font-medium rounded-tr-md">Gemini Advanced</th>
                </tr>
              </thead>
              <tbody>
                {matrixData.map((row, i) => (
                  <tr key={i} className="border-b border-border hover:bg-secondary/20 transition-colors">
                    <td className="px-4 py-4 font-medium">{row.prompt}</td>
                    {['gpt4', 'claude', 'perplexity', 'gemini'].map((llm) => (
                      <td key={llm} className="px-4 py-4">
                        <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                          row[llm as keyof typeof row] === 'cited' 
                            ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20'
                            : row[llm as keyof typeof row] === 'omitted'
                            ? 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                        }`}>
                          {row[llm as keyof typeof row]}
                        </div>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <div className="p-6 rounded-xl border border-border bg-card shadow-sm flex flex-col items-center justify-center text-center">
            <h2 className="text-lg font-semibold mb-2">Entity Strength Score</h2>
            <div className="relative w-32 h-32 flex items-center justify-center my-4">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-secondary" />
                <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="377" strokeDashoffset="94" className="text-primary" />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <span className="text-3xl font-bold">75</span>
                <span className="text-xs text-muted-foreground">/ 100</span>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mt-2">Knowledge graph presence is strong, but Wikidata needs updating.</p>
          </div>

          <div className="p-6 rounded-xl border border-border bg-card shadow-sm bg-gradient-to-br from-primary/10 to-transparent border-primary/20">
            <div className="flex items-center gap-2 mb-2 text-primary">
              <BrainCircuit size={18} />
              <h3 className="font-semibold text-sm">AI Insight</h3>
            </div>
            <p className="text-sm text-foreground/90 mb-4">
              Your client is consistently omitted from "scale organic growth" prompts across GPT-4 and Gemini. Generating a new guide structured with statistical density could capture these citations.
            </p>
            <button className="text-sm font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors">
              Generate Content Brief <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
