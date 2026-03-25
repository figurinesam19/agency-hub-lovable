import { useState } from "react";
import { ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const clients = ["Alteas", "Vacherand Immobilier", "Notaire Ronchin", "Notaire 20.F"];

export function AppHeader() {
  const [activeClient, setActiveClient] = useState(clients[0]);

  return (
    <header className="h-[70px] min-h-[70px] bg-header border-b border-header-border flex items-center justify-between px-6">
      {/* Client selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 border border-border rounded-full px-4 py-2 hover:bg-secondary transition-colors outline-none">
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
              {activeClient.charAt(0)}
            </div>
            <div className="leading-tight text-left">
              <span className="text-[11px] text-muted-foreground">Client actif</span>
              <p className="text-sm font-semibold text-foreground">{activeClient}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {clients.map((client) => (
            <DropdownMenuItem
              key={client}
              onClick={() => setActiveClient(client)}
              className={client === activeClient ? "bg-accent font-semibold" : ""}
            >
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground mr-2">
                {client.charAt(0)}
              </div>
              {client}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Right section */}
      <div className="flex items-center gap-4">
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
