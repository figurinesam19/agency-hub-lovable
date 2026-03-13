import { useState } from "react";
import { Lightbulb, CheckCircle, Eye, FileText } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type Status = "Validé Client" | "À relire" | "Brouillon";

interface Post {
  date: string;
  thematique: string;
  format: string;
  reseau: string;
  reseauCode: string;
  statut: Status;
}

const posts: Post[] = [
  { date: "17 Mar 2026", thematique: "Lancement gamme printemps", format: "Carrousel", reseau: "Instagram", reseauCode: "IG", statut: "Validé Client" },
  { date: "19 Mar 2026", thematique: "Recette smoothie détox", format: "Réel / Vidéo courte", reseau: "TikTok", reseauCode: "TK", statut: "À relire" },
  { date: "21 Mar 2026", thematique: "Témoignage client fidèle", format: "Post statique", reseau: "Facebook", reseauCode: "FB", statut: "Validé Client" },
  { date: "24 Mar 2026", thematique: "Coulisses production", format: "Story", reseau: "Instagram", reseauCode: "IG", statut: "Brouillon" },
  { date: "26 Mar 2026", thematique: "Offre parrainage été", format: "Visuel promo", reseau: "LinkedIn", reseauCode: "LI", statut: "À relire" },
];

const statusConfig: Record<Status, { dot: string; bg: string; text: string }> = {
  "Validé Client": { dot: "bg-green-500", bg: "bg-green-50", text: "text-green-700" },
  "À relire": { dot: "bg-yellow-500", bg: "bg-yellow-50", text: "text-yellow-700" },
  "Brouillon": { dot: "bg-gray-400", bg: "bg-gray-50", text: "text-gray-600" },
};

const reseauColors: Record<string, string> = {
  IG: "bg-red-100 text-red-600",
  TK: "bg-gray-900 text-white",
  FB: "bg-blue-100 text-blue-600",
  LI: "bg-blue-100 text-blue-700",
};

const filters: ("Tous" | Status)[] = ["Tous", "Validé Client", "À relire", "Brouillon"];

const SuiviEditorialView = () => {
  const [activeFilter, setActiveFilter] = useState<"Tous" | Status>("Tous");

  const filtered = activeFilter === "Tous" ? posts : posts.filter((p) => p.statut === activeFilter);

  const counts = {
    total: posts.length,
    valide: posts.filter((p) => p.statut === "Validé Client").length,
    relire: posts.filter((p) => p.statut === "À relire").length,
    brouillon: posts.filter((p) => p.statut === "Brouillon").length,
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-4 gap-4">
        <KpiCard icon={<Lightbulb className="h-6 w-6 text-yellow-500" />} label="Total idées" value={counts.total} badge="Aperçu" />
        <KpiCard icon={<CheckCircle className="h-6 w-6 text-green-500" />} label="Validé Client" value={counts.valide} />
        <KpiCard icon={<Eye className="h-6 w-6 text-yellow-600" />} label="À relire" value={counts.relire} valueColor="text-yellow-600" />
        <KpiCard icon={<FileText className="h-6 w-6 text-muted-foreground" />} label="Brouillons" value={counts.brouillon} />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3">
        {filters.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              activeFilter === f
                ? "bg-primary text-primary-foreground"
                : "bg-card text-muted-foreground border border-border hover:bg-secondary"
            }`}
          >
            {f}
          </button>
        ))}
        <span className="text-sm text-muted-foreground ml-2">{filtered.length} résultats</span>
      </div>

      {/* Table */}
      <div className="bg-card rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="uppercase text-xs tracking-wider text-muted-foreground">Date prévue</TableHead>
              <TableHead className="uppercase text-xs tracking-wider text-muted-foreground">Thématique</TableHead>
              <TableHead className="uppercase text-xs tracking-wider text-muted-foreground">Format</TableHead>
              <TableHead className="uppercase text-xs tracking-wider text-muted-foreground">Réseau</TableHead>
              <TableHead className="uppercase text-xs tracking-wider text-muted-foreground">Statut Validation</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((post, i) => {
              const sc = statusConfig[post.statut];
              const rc = reseauColors[post.reseauCode] ?? "bg-secondary text-foreground";
              return (
                <TableRow key={i} className="h-16">
                  <TableCell className="text-muted-foreground">{post.date}</TableCell>
                  <TableCell className="font-semibold text-foreground max-w-[180px] truncate">{post.thematique}</TableCell>
                  <TableCell className="text-muted-foreground">{post.format}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rc}`}>{post.reseauCode}</span>
                      <span className="text-muted-foreground">{post.reseau}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${sc.bg} ${sc.text}`}>
                      <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                      {post.statut}
                    </span>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

function KpiCard({ icon, label, value, badge, valueColor }: { icon: React.ReactNode; label: string; value: number; badge?: string; valueColor?: string }) {
  return (
    <div className="bg-card rounded-xl border border-border p-5 flex items-center gap-4 relative">
      {badge && (
        <span className="absolute top-3 left-3 text-[10px] font-medium bg-secondary text-muted-foreground px-2 py-0.5 rounded">
          {badge}
        </span>
      )}
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold ${valueColor ?? "text-foreground"}`}>{value}</p>
      </div>
    </div>
  );
}

export default SuiviEditorialView;
