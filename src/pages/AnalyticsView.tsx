import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Eye,
  FileText,
  MousePointerClick,
  Heart,
  TrendingUp,
  TrendingDown,
  Download,
  ExternalLink,
  Pencil,
  CalendarIcon,
} from "lucide-react";
import { format, isWithinInterval, startOfWeek, endOfWeek, addWeeks } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

// --- Mock Data with dates ---
const topPosts = [
  {
    id: 1,
    title: "Contrôle Technique 2026 : Info ou Intox ?",
    network: "Instagram",
    reach: "342K",
    engagement: "6,2%",
    color: "hsl(330, 80%, 60%)",
  },
  {
    id: 2,
    title: "L'expertice Alteas en chiffres",
    network: "Facebook",
    reach: "218K",
    engagement: "4,8%",
    color: "hsl(220, 70%, 55%)",
  },
  {
    id: 3,
    title: "Décennale : pas de chèque blanc ! ",
    network: "Instagram",
    reach: "189K",
    engagement: "5,1%",
    color: "hsl(330, 80%, 60%)",
  },
];

const allChartData = [
  { name: "Sem 1", date: new Date(2026, 1, 2), portee: 280000, impressions: 420000, clics: 1800, engagement: 4.2 },
  { name: "Sem 2", date: new Date(2026, 1, 9), portee: 310000, impressions: 460000, clics: 2100, engagement: 4.5 },
  { name: "Sem 3", date: new Date(2026, 1, 16), portee: 295000, impressions: 440000, clics: 1950, engagement: 3.9 },
  { name: "Sem 4", date: new Date(2026, 1, 23), portee: 350000, impressions: 510000, clics: 2400, engagement: 5.1 },
  { name: "Sem 5", date: new Date(2026, 2, 2), portee: 320000, impressions: 480000, clics: 2200, engagement: 4.7 },
  { name: "Sem 6", date: new Date(2026, 2, 9), portee: 340000, impressions: 500000, clics: 2350, engagement: 5.0 },
];

const COLORS = {
  portee: "#3B82F6",
  engagement: "#8B5CF6",
  impressions: "#9CA3AF",
  clics: "#10B981",
};

const formatK = (v: number) => (v >= 1000 ? `${(v / 1000).toFixed(v >= 10000 ? 0 : 1)}K` : String(v));

const kpis = [
  { label: "Portée totale", value: "1,24M", change: "+12,3%", positive: true, icon: Eye },
  { label: "Budget dépensé", value: "8 420 €", change: "+5,7%", positive: true, icon: FileText },
  { label: "Coût par clic", value: "0,34 €", change: "-8,1%", positive: false, icon: MousePointerClick },
  { label: "Engagement", value: "4,8%", change: "-2,4%", positive: false, icon: Heart },
];

// --- Component ---
const AnalyticsView = () => {
  const [expertComment, setExpertComment] = useState(
    "Ce mois-ci, la stratégie de contenu vidéo a porté ses fruits avec une augmentation significative de la portée organique (+12,3%). Les Réels continuent de surperformer les autres formats. Nous recommandons d'augmenter la fréquence de publication des Réels à 4/semaine et de tester davantage de carrousels éducatifs pour LinkedIn.",
  );
  const [linkedinModal, setLinkedinModal] = useState(false);
  const [tiktokModal, setTiktokModal] = useState(false);
  const [xModal, setXModal] = useState(false);

  const [linkedinData, setLinkedinData] = useState({ impressions: "45 200", engagement: "3,2%", followers: "+320" });
  const [tiktokData, setTiktokData] = useState({ vues: "128 000", likes: "8 400", followers: "+1 200" });
  const [xData, setXData] = useState({ impressions: "32 100", engagement: "2,1%", followers: "+85" });

  // Date range
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(2026, 1, 1),
    to: new Date(2026, 2, 1),
  });

  // Constance score
  const [postsPublished] = useState(18);
  const [postsObjectif, setPostsObjectif] = useState(20);
  const [editingObjectif, setEditingObjectif] = useState(false);
  const [tempObjectif, setTempObjectif] = useState("20");

  const constancePercent = useMemo(
    () => Math.min(100, Math.round((postsPublished / postsObjectif) * 100)),
    [postsPublished, postsObjectif],
  );

  const handlePrint = () => window.print();

  const handleSaveObjectif = () => {
    const val = parseInt(tempObjectif);
    if (val > 0) setPostsObjectif(val);
    setEditingObjectif(false);
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
          <p className="text-sm text-muted-foreground">Vue d'ensemble des performances — GreenLife Bio</p>
        </div>
        <div className="flex items-center gap-3 print-hidden">
          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" className="gap-2 text-sm font-normal">
                <CalendarIcon className="h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "d MMM", { locale: fr })} –{" "}
                      {format(dateRange.to, "d MMM yyyy", { locale: fr })}
                    </>
                  ) : (
                    format(dateRange.from, "d MMM yyyy", { locale: fr })
                  )
                ) : (
                  "Sélectionner une période"
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="end">
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>

          <Button onClick={handlePrint} className="bg-primary text-primary-foreground gap-2">
            <Download className="h-4 w-4" />
            Exporter Rapport
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className="bg-card border-border">
            <CardContent className="p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
                  <kpi.icon className="h-5 w-5 text-muted-foreground" />
                </div>
                <span
                  className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                    kpi.positive ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-500"
                  }`}
                >
                  {kpi.positive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {kpi.change}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{kpi.label}</p>
              <p className="text-2xl font-bold text-foreground mt-1">{kpi.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Évolution des KPIs — Chart without legend */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Évolution des KPIs</CardTitle>
          <CardDescription>Tendances hebdomadaires sur la période sélectionnée</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="left" tickFormatter={formatK} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <YAxis yAxisId="right" orientation="right" tickFormatter={(v) => `${v}%`} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                <Tooltip
                  contentStyle={{ backgroundColor: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: 8, fontSize: 12 }}
                  formatter={(value: number, name: string) => {
                    if (name === "engagement") return [`${value}%`, "Engagement"];
                    return [formatK(value), name.charAt(0).toUpperCase() + name.slice(1)];
                  }}
                />
                <Area yAxisId="left" type="monotone" dataKey="impressions" fill="#caf0f8" stroke="#90e0ef" strokeWidth={2} fillOpacity={0.5} />
                <Line yAxisId="left" type="monotone" dataKey="portee" stroke="#023e8a" strokeWidth={2.5} dot={{ r: 4 }} />
                <Bar yAxisId="left" dataKey="clics" fill="#ff6000" barSize={20} radius={[4, 4, 0, 0]} />
                <Line yAxisId="right" type="monotone" dataKey="engagement" stroke="#e63946" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Top Posts */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Top Posts</CardTitle>
          <CardDescription>Publications les plus performantes ce mois</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {topPosts.map((post, i) => (
            <div
              key={post.id}
              className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center text-sm font-bold text-muted-foreground">
                  #{i + 1}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{post.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: post.color }} />
                    <span className="text-xs text-muted-foreground">{post.network}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-6 text-right">
                <div>
                  <p className="text-xs text-muted-foreground">Portée</p>
                  <p className="text-sm font-semibold text-foreground">{post.reach}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground">Engagement</p>
                  <p className="text-sm font-semibold text-primary">{post.engagement}</p>
                </div>
                <ExternalLink className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Conversion + Constance Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Conversion Business</CardTitle>
            <CardDescription>Clics vers le site web ce mois</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2">
              <span className="text-4xl font-bold text-foreground">2 847</span>
              <span className="text-sm text-emerald-600 font-medium mb-1">+18,4%</span>
            </div>
            <p className="text-xs text-muted-foreground mt-2">vs. 2 403 le mois dernier</p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg">Score de Constance</CardTitle>
                <CardDescription>Posts publiés vs objectif mensuel</CardDescription>
              </div>
              {!editingObjectif && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTempObjectif(String(postsObjectif));
                    setEditingObjectif(true);
                  }}
                  className="print-hidden text-muted-foreground"
                >
                  <Pencil className="h-3.5 w-3.5 mr-1" />
                  Modifier
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {editingObjectif ? (
              <div className="flex items-center gap-3 mb-3 print-hidden">
                <span className="text-4xl font-bold text-foreground">{postsPublished}</span>
                <span className="text-lg text-muted-foreground font-medium">/</span>
                <Input
                  type="number"
                  value={tempObjectif}
                  onChange={(e) => setTempObjectif(e.target.value)}
                  className="w-20 text-lg font-bold"
                  min={1}
                />
                <span className="text-lg text-muted-foreground">posts</span>
                <Button size="sm" onClick={handleSaveObjectif}>
                  OK
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingObjectif(false)}>
                  ✕
                </Button>
              </div>
            ) : (
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-foreground">{postsPublished}</span>
                <span className="text-lg text-muted-foreground font-medium mb-0.5">/ {postsObjectif} posts</span>
              </div>
            )}
            <Progress value={constancePercent} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {constancePercent}% de l'objectif atteint —{" "}
              {constancePercent >= 90 ? "Excellent" : constancePercent >= 70 ? "Bon" : "À améliorer"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tiers Networks */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <NetworkCard
          name="LinkedIn"
          color="hsl(210, 80%, 40%)"
          metrics={[
            { label: "Impressions", value: linkedinData.impressions },
            { label: "Engagement", value: linkedinData.engagement },
            { label: "Nouveaux abonnés", value: linkedinData.followers },
          ]}
          onEdit={() => setLinkedinModal(true)}
        />
        <NetworkCard
          name="TikTok"
          color="hsl(0, 0%, 10%)"
          metrics={[
            { label: "Vues totales", value: tiktokData.vues },
            { label: "Likes", value: tiktokData.likes },
            { label: "Nouveaux abonnés", value: tiktokData.followers },
          ]}
          onEdit={() => setTiktokModal(true)}
        />
        <NetworkCard
          name="X (Twitter)"
          color="hsl(0, 0%, 15%)"
          metrics={[
            { label: "Impressions", value: xData.impressions },
            { label: "Engagement", value: xData.engagement },
            { label: "Nouveaux abonnés", value: xData.followers },
          ]}
          onEdit={() => setXModal(true)}
        />
      </div>

      {/* Expert Analysis */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-lg">Analyse de l'expert Pulsar</CardTitle>
          <CardDescription>Commentaire synthétique inclus dans le rapport client</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea
            value={expertComment}
            onChange={(e) => setExpertComment(e.target.value)}
            className="min-h-[120px] text-sm leading-relaxed print-static"
            placeholder="Rédigez votre analyse ici..."
          />
        </CardContent>
      </Card>

      {/* Data Entry Modals */}
      <DataModal
        open={linkedinModal}
        onOpenChange={setLinkedinModal}
        title="Mise à jour LinkedIn"
        fields={[
          { key: "impressions", label: "Impressions" },
          { key: "engagement", label: "Engagement (%)" },
          { key: "followers", label: "Nouveaux abonnés" },
        ]}
        data={linkedinData}
        onSave={(d) => {
          setLinkedinData(d as typeof linkedinData);
          setLinkedinModal(false);
        }}
      />
      <DataModal
        open={tiktokModal}
        onOpenChange={setTiktokModal}
        title="Mise à jour TikTok"
        fields={[
          { key: "vues", label: "Vues totales" },
          { key: "likes", label: "Likes" },
          { key: "followers", label: "Nouveaux abonnés" },
        ]}
        data={tiktokData}
        onSave={(d) => {
          setTiktokData(d as typeof tiktokData);
          setTiktokModal(false);
        }}
      />
      <DataModal
        open={xModal}
        onOpenChange={setXModal}
        title="Mise à jour X (Twitter)"
        fields={[
          { key: "impressions", label: "Impressions" },
          { key: "engagement", label: "Engagement (%)" },
          { key: "followers", label: "Nouveaux abonnés" },
        ]}
        data={xData}
        onSave={(d) => {
          setXData(d as typeof xData);
          setXModal(false);
        }}
      />
    </div>
  );
};

// --- Sub-components ---

function NetworkCard({
  name,
  color,
  metrics,
  onEdit,
}: {
  name: string;
  color: string;
  metrics: { label: string; value: string }[];
  onEdit: () => void;
}) {
  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
            <CardTitle className="text-base">{name}</CardTitle>
          </div>
          <Button variant="ghost" size="sm" onClick={onEdit} className="print-hidden text-muted-foreground">
            <Pencil className="h-3.5 w-3.5 mr-1" />
            Modifier
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {metrics.map((m) => (
          <div key={m.label} className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{m.label}</span>
            <span className="text-sm font-semibold text-foreground">{m.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function DataModal({
  open,
  onOpenChange,
  title,
  fields,
  data,
  onSave,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  title: string;
  fields: { key: string; label: string }[];
  data: Record<string, string>;
  onSave: (d: Record<string, string>) => void;
}) {
  const [local, setLocal] = useState({ ...data });

  const handleSave = () => onSave(local);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 py-2">
          {fields.map((f) => (
            <div key={f.key} className="space-y-1.5">
              <Label>{f.label}</Label>
              <Input
                value={local[f.key] || ""}
                onChange={(e) => setLocal((p) => ({ ...p, [f.key]: e.target.value }))}
              />
            </div>
          ))}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AnalyticsView;
