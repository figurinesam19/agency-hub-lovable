import { Search, Download } from "lucide-react";

export function AppHeader() {
  return (
    <header className="h-[70px] min-h-[70px] bg-header border-b border-header-border flex items-center justify-between px-6">
      {/* Client selector */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 border border-border rounded-full px-4 py-2">
          <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
            G
          </div>
          <div className="leading-tight">
            <span className="text-[11px] text-muted-foreground">Client actif</span>
            <p className="text-sm font-semibold text-foreground">GreenLife Bio</p>
          </div>
        </div>
      </div>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Rechercher un post..."
            className="pl-9 pr-4 py-2 text-sm bg-secondary border-none rounded-lg w-56 outline-none placeholder:text-muted-foreground"
          />
        </div>

        <button className="flex items-center gap-2 border border-border rounded-lg px-4 py-2 text-sm font-medium text-foreground hover:bg-secondary transition-colors">
          <Download className="h-4 w-4" />
          Exporter
        </button>

        <div className="flex items-center gap-2.5">
          <div className="leading-tight text-right">
            <p className="text-sm font-medium text-foreground">Sophie M.</p>
            <span className="text-[11px] text-muted-foreground">Admin</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            SM
          </div>
        </div>
      </div>
    </header>
  );
}
