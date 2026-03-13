import { Lightbulb, FileText, CalendarDays, BarChart3, Users, CreditCard, LogOut } from "lucide-react";
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";

const socialMediaLinks = [
  { title: "Création", path: "/creation", icon: Lightbulb },
  { title: "Suivi Éditorial", path: "/suivi-editorial", icon: FileText },
  { title: "Calendrier", path: "/calendrier", icon: CalendarDays },
  { title: "Analytics", path: "/analytics", icon: BarChart3 },
];

const agenceLinks = [
  { title: "Pipeline CRM", path: "/crm", icon: Users },
  { title: "Abonnements", path: "/abonnements", icon: CreditCard },
];

function SidebarLink({ to, icon: Icon, label }: { to: string; icon: React.ElementType; label: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors",
          isActive
            ? "bg-sidebar-accent text-sidebar-accent-foreground"
            : "text-sidebar-foreground hover:bg-secondary"
        )
      }
    >
      <Icon className="h-[18px] w-[18px]" />
      <span>{label}</span>
    </NavLink>
  );
}

export function AppSidebar() {
  return (
    <aside className="w-[250px] min-w-[250px] h-screen bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="h-[70px] flex items-center gap-2.5 px-5 border-b border-sidebar-border">
        <div className="w-8 h-8 rounded-full bg-sidebar-primary flex items-center justify-center">
          <span className="text-sidebar-primary-foreground text-xs font-bold">⚡</span>
        </div>
        <div>
          <span className="text-foreground font-bold text-base leading-tight block">Pulsar</span>
          <span className="text-sidebar-foreground text-[11px] uppercase tracking-wider">Agency</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-6 px-3 space-y-6">
        <div>
          <p className="px-4 mb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-section-label">
            Social Media
          </p>
          <div className="space-y-0.5">
            {socialMediaLinks.map((link) => (
              <SidebarLink key={link.path} to={link.path} icon={link.icon} label={link.title} />
            ))}
          </div>
        </div>

        <div>
          <p className="px-4 mb-2 text-[11px] font-semibold uppercase tracking-wider text-sidebar-section-label">
            Agence
          </p>
          <div className="space-y-0.5">
            {agenceLinks.map((link) => (
              <SidebarLink key={link.path} to={link.path} icon={link.icon} label={link.title} />
            ))}
          </div>
        </div>
      </nav>

      {/* Footer */}
      <div className="px-3 py-4 border-t border-sidebar-border">
        <button className="flex items-center gap-3 px-4 py-2.5 text-sm text-sidebar-foreground hover:bg-secondary rounded-lg w-full transition-colors">
          <LogOut className="h-[18px] w-[18px]" />
          <span>Déconnexion</span>
        </button>
      </div>
    </aside>
  );
}
