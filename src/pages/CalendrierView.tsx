import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronLeft, ChevronRight, Plus, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

type Network = "all" | "instagram" | "linkedin" | "facebook" | "tiktok" | "x";
type Status = "all" | "published" | "scheduled" | "draft";

interface CalendarEvent {
  id: number;
  day: number;
  month: number;
  year: number;
  title: string;
  network: Network;
  status: "published" | "scheduled" | "draft";
}

const networkConfig: Record<Exclude<Network, "all">, { dot: string; label: string; icon: string; dropdownColor: string }> = {
  instagram: { dot: "bg-rose-500", label: "Instagram", icon: "IG", dropdownColor: "text-rose-500" },
  linkedin: { dot: "bg-blue-600", label: "LinkedIn", icon: "in", dropdownColor: "text-blue-700" },
  facebook: { dot: "bg-blue-500", label: "Facebook", icon: "f", dropdownColor: "text-blue-500" },
  tiktok: { dot: "bg-gray-900", label: "TikTok", icon: "TK", dropdownColor: "text-gray-900" },
  x: { dot: "bg-gray-900", label: "X", icon: "X", dropdownColor: "text-gray-900" },
};

const statusConfig: Record<Exclude<Status, "all">, { label: string; color: string }> = {
  published: { label: "Publié", color: "bg-emerald-400" },
  scheduled: { label: "Programmé", color: "bg-amber-400" },
  draft: { label: "Brouillon", color: "bg-gray-300" },
};

const statusColors: Record<string, string> = {
  published: "bg-emerald-400",
  scheduled: "bg-amber-400",
  draft: "bg-gray-300",
};

const mockEvents: CalendarEvent[] = [
  { id: 1, day: 2, month: 3, year: 2026, title: "Lancement gamme printemps", network: "instagram", status: "published" },
  { id: 2, day: 3, month: 3, year: 2026, title: "Thread conseils immobilier", network: "tiktok", status: "published" },
  { id: 3, day: 4, month: 3, year: 2026, title: "Recette smoothie détox", network: "facebook", status: "published" },
  { id: 4, day: 4, month: 3, year: 2026, title: "Story coulisses atelier", network: "instagram", status: "published" },
  { id: 5, day: 6, month: 3, year: 2026, title: "Article expertise notariale", network: "linkedin", status: "published" },
  { id: 6, day: 7, month: 3, year: 2026, title: "Conseils skincare bio", network: "instagram", status: "published" },
  { id: 7, day: 9, month: 3, year: 2026, title: "Sondage communauté", network: "tiktok", status: "published" },
  { id: 8, day: 10, month: 3, year: 2026, title: "Partenariat local annonce", network: "facebook", status: "published" },
  { id: 9, day: 10, month: 3, year: 2026, title: "Offre d'emploi design", network: "linkedin", status: "published" },
  { id: 10, day: 12, month: 3, year: 2026, title: "Nouveau packaging reveal", network: "instagram", status: "scheduled" },
  { id: 11, day: 12, month: 3, year: 2026, title: "Live Q&A nutrition", network: "facebook", status: "scheduled" },
  { id: 12, day: 12, month: 3, year: 2026, title: "Behind the scenes", network: "tiktok", status: "scheduled" },
  { id: 13, day: 14, month: 3, year: 2026, title: "Réaction tendance", network: "tiktok", status: "published" },
  { id: 14, day: 15, month: 3, year: 2026, title: "Promo week-end spéciale", network: "instagram", status: "scheduled" },
  { id: 15, day: 17, month: 3, year: 2026, title: "Case study client", network: "linkedin", status: "scheduled" },
  { id: 16, day: 18, month: 3, year: 2026, title: "Témoignage client fidèle", network: "facebook", status: "draft" },
  { id: 17, day: 18, month: 3, year: 2026, title: "Réponse commentaires", network: "tiktok", status: "draft" },
  { id: 18, day: 20, month: 3, year: 2026, title: "Carousel 5 astuces", network: "instagram", status: "draft" },
  { id: 19, day: 23, month: 3, year: 2026, title: "Article blog recyclage", network: "facebook", status: "draft" },
  { id: 20, day: 23, month: 3, year: 2026, title: "Post RH - Alteas", network: "linkedin", status: "draft" },
  { id: 21, day: 24, month: 3, year: 2026, title: "Infographie impact local", network: "linkedin", status: "draft" },
  { id: 22, day: 26, month: 3, year: 2026, title: "Annonce collection été", network: "instagram", status: "scheduled" },
  { id: 23, day: 26, month: 3, year: 2026, title: "Story - Notaire Ronchin", network: "facebook", status: "scheduled" },
];

const DAYS = ["LUN", "MAR", "MER", "JEU", "VEN", "SAM", "DIM"];
const MONTH_NAMES = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

function getCalendarDays(year: number, month: number) {
  const firstDay = new Date(year, month - 1, 1);
  let startDow = firstDay.getDay() - 1;
  if (startDow < 0) startDow = 6;
  const daysInMonth = new Date(year, month, 0).getDate();
  const daysInPrev = new Date(year, month - 1, 0).getDate();

  const cells: { day: number; currentMonth: boolean }[] = [];
  for (let i = startDow - 1; i >= 0; i--) {
    cells.push({ day: daysInPrev - i, currentMonth: false });
  }
  for (let d = 1; d <= daysInMonth; d++) {
    cells.push({ day: d, currentMonth: true });
  }
  while (cells.length % 7 !== 0) {
    cells.push({ day: cells.length - startDow - daysInMonth + 1, currentMonth: false });
  }
  return cells;
}

const networkOptions: { key: Network; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "instagram", label: "Instagram" },
  { key: "facebook", label: "Facebook" },
  { key: "x", label: "X" },
  { key: "linkedin", label: "LinkedIn" },
  { key: "tiktok", label: "TikTok" },
];

const statusOptions: { key: Status; label: string }[] = [
  { key: "all", label: "Tous" },
  { key: "published", label: "Publié" },
  { key: "scheduled", label: "Programmé" },
  { key: "draft", label: "Brouillon" },
];

const MAX_VISIBLE = 2;

const CalendrierView = () => {
  const navigate = useNavigate();
  const [month, setMonth] = useState(3);
  const [year, setYear] = useState(2026);
  const [networkFilter, setNetworkFilter] = useState<Network>("all");
  const [statusFilter, setStatusFilter] = useState<Status>("all");

  const cells = useMemo(() => getCalendarDays(year, month), [year, month]);

  const filteredEvents = useMemo(
    () => mockEvents.filter((e) =>
      e.month === month && e.year === year &&
      (networkFilter === "all" || e.network === networkFilter) &&
      (statusFilter === "all" || e.status === statusFilter)
    ),
    [month, year, networkFilter, statusFilter],
  );

  const eventsByDay = useMemo(() => {
    const map: Record<number, CalendarEvent[]> = {};
    filteredEvents.forEach((e) => {
      (map[e.day] ||= []).push(e);
    });
    return map;
  }, [filteredEvents]);

  const today = new Date();
  const isToday = (day: number) => day === today.getDate() && month === today.getMonth() + 1 && year === today.getFullYear();

  const prev = () => {
    if (month === 1) { setMonth(12); setYear(year - 1); } else setMonth(month - 1);
  };
  const next = () => {
    if (month === 12) { setMonth(1); setYear(year + 1); } else setMonth(month + 1);
  };

  return (
    <div className="space-y-5">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">Planning Editorial</h1>
          <p className="text-sm text-muted-foreground">Organisez et planifiez vos publications</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Network dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 font-medium">
                Réseau : {networkFilter === "all" ? "Tous" : networkConfig[networkFilter].label}
                <ChevronRight className="h-3.5 w-3.5 rotate-90 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-52">
              {networkOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.key}
                  onClick={() => setNetworkFilter(opt.key)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  {opt.key !== "all" && (
                    <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-bold ${networkConfig[opt.key].dot} text-white shrink-0`}>
                      {networkConfig[opt.key].icon}
                    </span>
                  )}
                  <span className="flex-1">{opt.label}</span>
                  {networkFilter === opt.key && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 font-medium">
                Statut : {statusFilter === "all" ? "Tous" : statusConfig[statusFilter].label}
                <ChevronRight className="h-3.5 w-3.5 rotate-90 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              {statusOptions.map((opt) => (
                <DropdownMenuItem
                  key={opt.key}
                  onClick={() => setStatusFilter(opt.key)}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  {opt.key !== "all" && (
                    <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${statusConfig[opt.key].color}`} />
                  )}
                  <span className="flex-1">{opt.label}</span>
                  {statusFilter === opt.key && <Check className="h-4 w-4 text-primary" />}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button onClick={() => navigate("/creation")} className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2">
            <Plus className="h-4 w-4" />
            Nouveau Post
          </Button>
        </div>
      </div>

      {/* Calendar */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        {/* Month nav */}
        <div className="flex items-center justify-between px-6 py-4">
          <button onClick={prev} className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
            <ChevronLeft className="h-4 w-4 text-muted-foreground" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-lg font-semibold text-foreground">
              {MONTH_NAMES[month - 1]} {year}
            </span>
            <span className="text-xs font-medium bg-secondary text-muted-foreground px-2.5 py-1 rounded-full">
              {filteredEvents.length} posts
            </span>
          </div>
          <button onClick={next} className="p-2 rounded-lg border border-border hover:bg-secondary transition-colors">
            <ChevronRight className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Day headers */}
        <div className="grid grid-cols-7 border-t border-border">
          {DAYS.map((d) => (
            <div key={d} className="py-3 text-center text-xs font-semibold text-muted-foreground tracking-wider">
              {d}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-7 border-t border-border">
          {cells.map((cell, idx) => {
            const dayEvents = cell.currentMonth ? eventsByDay[cell.day] || [] : [];
            const visibleEvents = dayEvents.slice(0, MAX_VISIBLE);
            const extraCount = dayEvents.length - MAX_VISIBLE;

            return (
              <div
                key={idx}
                className={`min-h-[110px] border-b border-r border-border p-2 ${
                  cell.currentMonth ? "bg-card" : "bg-secondary/40"
                } ${idx % 7 === 0 ? "border-l-0" : ""}`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span
                    className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full ${
                      isToday(cell.day) && cell.currentMonth
                        ? "bg-primary text-primary-foreground"
                        : cell.currentMonth
                        ? "text-foreground"
                        : "text-muted-foreground/50"
                    }`}
                  >
                    {cell.day}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="text-[10px] font-semibold text-muted-foreground bg-secondary rounded px-1.5 py-0.5">
                      {dayEvents.length}
                    </span>
                  )}
                </div>
                <div className="space-y-1">
                  {visibleEvents.map((ev) => {
                    const net = networkConfig[ev.network];
                    return (
                      <button
                        key={ev.id}
                        onClick={() => console.log("Event clicked:", ev)}
                        className="w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-left hover:bg-secondary/80 transition-colors group"
                      >
                        <span className={`w-4 h-4 rounded text-[8px] font-bold flex items-center justify-center shrink-0 ${
                          ev.network === "instagram" ? "bg-rose-100 text-rose-600" :
                          ev.network === "linkedin" ? "bg-blue-100 text-blue-700" :
                          ev.network === "facebook" ? "bg-blue-100 text-blue-500" :
                          "bg-gray-200 text-gray-700"
                        }`}>
                          {net.icon}
                        </span>
                        <span className="text-xs text-foreground truncate flex-1">{ev.title}</span>
                        <span className={`w-2 h-2 rounded-full shrink-0 ${statusColors[ev.status]}`} />
                      </button>
                    );
                  })}
                  {extraCount > 0 && (
                    <p className="text-[11px] text-primary font-medium px-2">+{extraCount} de plus</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendrierView;
