import { ChevronDown, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { useActiveClient } from "@/hooks/useActiveClient";

export function AppHeader() {
  const { user, signOut } = useAuth();
  const { clients, activeClient, setActiveClientId } = useActiveClient();

  const displayName = user?.email?.split("@")[0] ?? "Utilisateur";
  const initials = displayName.slice(0, 2).toUpperCase();
  const clientName = activeClient?.entreprise || "Aucun client";

  return (
    <header className="h-[70px] min-h-[70px] bg-header border-b border-header-border flex items-center justify-between px-6">
      {/* Client selector */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="flex items-center gap-2.5 border border-border rounded-full px-4 py-2 hover:bg-secondary transition-colors outline-none">
            <div className="w-7 h-7 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground">
              {clientName.charAt(0)}
            </div>
            <div className="leading-tight text-left">
              <span className="text-[11px] text-muted-foreground">Client actif</span>
              <p className="text-sm font-semibold text-foreground">{clientName}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-muted-foreground ml-1" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {clients.length === 0 && (
            <DropdownMenuItem disabled className="text-muted-foreground text-sm">
              Aucun client dans le CRM
            </DropdownMenuItem>
          )}
          {clients.map((client) => (
            <DropdownMenuItem
              key={client.id}
              onClick={() => setActiveClientId(client.id)}
              className={client.id === activeClient?.id ? "bg-accent font-semibold" : ""}
            >
              <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-bold text-foreground mr-2">
                {(client.entreprise || "?").charAt(0)}
              </div>
              {client.entreprise || `Client #${client.id}`}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Right section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2.5">
          <div className="leading-tight text-right">
            <p className="text-sm font-medium text-foreground">{displayName}</p>
            <span className="text-[11px] text-muted-foreground">{user?.email}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
            {initials}
          </div>
        </div>
        <button
          onClick={signOut}
          className="p-2 rounded-md hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
          title="Déconnexion"
        >
          <LogOut className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
