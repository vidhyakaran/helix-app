import { Bell, Search, Settings } from "lucide-react";

export function Header() {
  return (
    <header className="h-14 border-b border-border bg-card flex items-center justify-between px-6 sticky top-0 z-10">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative w-96 hidden md:block">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={14} className="text-muted-foreground" />
          </div>
          <input
            type="text"
            className="block w-full pl-9 pr-3 py-1.5 bg-secondary border-transparent rounded-md text-sm placeholder-muted-foreground focus:ring-1 focus:ring-primary focus:border-transparent outline-none"
            placeholder="Search clients, tasks, or metrics... (Cmd+K)"
          />
        </div>
      </div>
      <div className="flex items-center gap-4">
        <button className="text-muted-foreground hover:text-foreground">
          <Bell size={18} />
        </button>
        <button className="text-muted-foreground hover:text-foreground">
          <Settings size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center text-sm font-medium border border-primary/30">
          SD
        </div>
      </div>
    </header>
  );
}
