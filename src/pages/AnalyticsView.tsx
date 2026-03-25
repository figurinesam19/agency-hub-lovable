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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, AreaChart, Area, Tooltip, ComposedChart,
} from "recharts";
import {
  Eye, FileText, MousePointerClick, Heart, TrendingUp, TrendingDown,
  Download, ExternalLink, Pencil, CalendarIcon, Instagram, Facebook,
} from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { cn } from "@/lib/utils";
import type { DateRange } from "react-day-picker";

// --- Colors ---
const COLORS = {
  portee: "#00b4d8",
  impressions: "#90e0ef",
  impressionsFill: "#caf0f8",
  clicsSite: "#ff6000",
  engagement: "#5a189a",
};

// --- Mock Data ---
const topPosts = [
  { id: 1, title: "Découvrez notre gamme 100% bio", network: "Instagram", reach: "342K", engagement: "6,2%", color: "hsl(330, 80%, 60%)" },
  { id: 2, title: "Le brunch parfait, c'est celui qu'on partage", network: "Facebook", reach: "218K", engagement: "4,8%", color: "hsl(220, 70%, 55%)" },
  { id: 3, title: "Nos emballages éco-responsables arrivent !", network: "Instagram", reach: "189K", engagement: "5,1%", color: "hsl(330, 80%, 60%)" },
];

const formatData = [
  { name: "IG Réels", value: 25, fill: "hsl(330, 80%, 60%)" },
  { name: "IG Carrousels", value: 18, fill: "hsl(262, 60%, 55%)" },
  { name: "IG Photos", value: 12, fill: "hsl(170, 60%, 45%)" },
  { name: "FB Réels", value: 20, fill: "hsl(220, 70%, 55%)" },
  { name: "FB Photos", value: 13, fill: "hsl(200, 60%, 50%)" },
  { name: "FB Carrousels", value: 12, fill: "hsl(35, 80%, 55%)" },
];

const chartData = [
  { date: "1 Fév", portee: 24000, impressions: 38000, clicsSite: 180, engagement: 4.2 },
  { date: "3 Fév", portee: 26000, impressions: 42000, clicsSite: 210, engagement: 4.5 },
  { date: "5 Fév", portee: 35000, impressions: 52000, clicsSite: 280, engagement: 5.1 },
  { date: "7 Fév", portee: 34000, impressions: 48000, clicsSite: 250, engagement: 4.8 },
  { date: "9 Fév", portee: 30000, impressions: 45000, clicsSite: 220, engagement: 4.3 },
  { date: "11 Fév", portee: 36000, impressions: 50000, clicsSite: 260, engagement: 4.6 },
  { date: "13 Fév", portee: 40000, impressions: 56000, clicsSite: 310, engagement: 5.0 },
  { date: "15 Fév", portee: 44000, impressions: 62000, clicsSite: 340, engagement: 5.3 },
  { date: "17 Fév", portee: 46000, impressions: 65000, clicsSite: 360, engagement: 5.1 },
  { date: "19 Fév", portee: 48000, impressions: 68000, clicsSite: 380, engagement: 4.9 },
  { date: "21 Fév", portee: 50000, impressions: 72000, clicsSite: 400, engagement: 5.2 },
  { date: "23 Fév", portee: 54000, impressions: 76000, clicsSite: 420, engagement: 5.5 },
  { date: "25 Fév", portee: 52000, impressions: 74000, clicsSite: 410, engagement: 5.0 },
  { date: "27 Fév", portee: 55000, impressions: 78000, clicsSite: 430, engagement: 4.8 },
  { date: "1 Mar", portee: 58000, impressions: 82000, clicsSite: 460, engagement: 5.4 },
];

const kpis = [
  { label: "Portée totale", value: "1,24M", change: "+12,3%", positive: true, icon: Eye },
  { label: "Budget dépensé", value: "8 420 €", change: "+5,7%", positive: true, icon: FileText },
  { label: "Coût par clic", value: "0,34 €", change: "-8,1%", positive: false, icon: MousePointerClick },
  { label: "Engagement", value: "4,8%", change: "-2,4%", positive: false, icon: Heart },
];

const formatNumber = (v: number) => {
  if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
  if (v >= 1000) return `${(v / 1000).toFixed(1)}K`;
  return v.toString();
};

const LEGEND_ITEMS = [
  { key: "portee", label: "Portée", color: COLORS.portee },
  { key: "impressions", label: "Impressions", color: COLORS.impressions },
  { key: "clicsSite", label: "Clics Site", color: COLORS.clicsSite },
  { key: "engagement", label: "Engagement", color: COLORS.engagement },
] as const;

// --- Component ---
const AnalyticsView = () => {
  const [expertComment, setExpertComment] = useState(
    "Ce mois-ci, la stratégie de contenu vidéo a porté ses fruits avec une augmentation significative de la portée organique (+12,3%). Les Réels continuent de surperformer les autres formats. Nous recommandons d'augmenter la fréquence de publication des Réels à 4/semaine et de tester davantage de carrousels éducatifs pour LinkedIn."
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

  // Chart visibility toggles
  const [visibleLines, setVisibleLines] = useState<Record<string, boolean>>({
    portee: true, impressions: true, clicsSite: true, engagement: true,
  });

  // Chart view selector
  const [chartView, setChartView] = useState("global");

  // Constance score
  const [postsPublished] = useState(18);
  const [postsObjectif, setPostsObjectif] = useState(20);
  const [editingObjectif, setEditingObjectif] = useState(false);
  const [tempObjectif, setTempObjectif] = useState("20");

  const constancePercent = useMemo(
    () => Math.min(100, Math.round((postsPublished / postsObjectif) * 100)),
    [postsPublished, postsObjectif]
  );

  const toggleLine = (key: string) => {
    if (chartView !== "global") return;
    setVisibleLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handlePrint = () => window.print();

  const handleSaveObjectif = () => {
    const val = parseInt(tempObjectif);
    if (val > 0) setPostsObjectif(val);
    setEditingObjectif(false);
  };

  // Determine which lines to show based on chartView
  const activeLines = useMemo(() => {
    if (chartView === "global") return visibleLines;
    return {
      portee: chartView === "portee",
      impressions: chartView === "impressions",
      clicsSite: chartView === "clicsSite",
      engagement: chartView === "engagement",
    };
  }, [chartView, visibleLines]);

  const showRightAxis = activeLines.engagement;
  const showLeftAxis = activeLines.portee || activeLines.impressions || activeLines.clicsSite;

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
                      {format(dateRange.from, "d MMM", { locale: fr })} – {format(dateRange.to, "d MMM yyyy", { locale: fr })}
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
                <span className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${
                  kpi.positive
                    ? "bg-emerald-50 text-emerald-600"
                    : "bg-red-50 text-red-500"
                }`}>
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

      {/* Dual Axis Chart */}
      <Card className="bg-card border-border">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-lg">Évolution des KPIs</CardTitle>
              <CardDescription>Portée, impressions, clics et engagement</CardDescription>
            </div>
            <Select value={chartView} onValueChange={(v) => setChartView(v)}>
              <SelectTrigger className="w-[180px] print-hidden">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="global">Vue Globale</SelectItem>
                <SelectItem value="portee">Portée</SelectItem>
                <SelectItem value="impressions">Impressions</SelectItem>
                <SelectItem value="clicsSite">Clics Site</SelectItem>
                <SelectItem value="engagement">Engagement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {/* Interactive Legend */}
          <div className="flex flex-wrap gap-4 mt-3">
            {LEGEND_ITEMS.map((item) => (
              <button
                key={item.key}
                onClick={() => toggleLine(item.key)}
                className={cn(
                  "flex items-center gap-2 text-sm transition-opacity print-hidden",
                  chartView === "global" ? "cursor-pointer" : "cursor-default",
                  activeLines[item.key as keyof typeof activeLines] ? "opacity-100" : "opacity-30"
                )}
              >
                <span className="h-3 w-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                {item.label}
              </button>
            ))}
          </div>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={340}>
            <ComposedChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(216, 15%, 90%)" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} stroke="hsl(215, 14%, 55%)" />
              {showLeftAxis && (
                <YAxis
                  yAxisId="left"
                  tickFormatter={formatNumber}
                  tick={{ fontSize: 12 }}
                  stroke="hsl(215, 14%, 55%)"
                />
              )}
              {showRightAxis && (
                <YAxis
                  yAxisId="right"
                  orientation="right"
                  tickFormatter={(v) => `${v}%`}
                  tick={{ fontSize: 12 }}
                  stroke={COLORS.engagement}
                  domain={[0, 8]}
                />
              )}
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload?.length) return null;
                  return (
                    <div className="rounded-lg border border-border/50 bg-background px-3 py-2 text-xs shadow-xl">
                      <p className="font-medium mb-1.5">{label}</p>
                      {payload.map((p: any) => (
                        <div key={p.dataKey} className="flex items-center justify-between gap-4">
                          <span className="flex items-center gap-1.5">
                            <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
                            {LEGEND_ITEMS.find((l) => l.key === p.dataKey)?.label}
                          </span>
                          <span className="font-mono font-medium">
                            {p.dataKey === "engagement" ? `${p.value}%` : formatNumber(p.value)}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                }}
              />
              {activeLines.portee && (
                <Line yAxisId="left" type="monotone" dataKey="portee" stroke={COLORS.portee} strokeWidth={2} dot={false} />
              )}
              {activeLines.impressions && (
                <>
                  <defs>
                    <linearGradient id="gradImpressions" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.impressionsFill} stopOpacity={0.6} />
                      <stop offset="95%" stopColor={COLORS.impressionsFill} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Area yAxisId="left" type="monotone" dataKey="impressions" stroke={COLORS.impressions} fill="url(#gradImpressions)" strokeWidth={2} />
                </>
              )}
              {activeLines.clicsSite && (
                <Line yAxisId="left" type="monotone" dataKey="clicsSite" stroke={COLORS.clicsSite} strokeWidth={2} dot={false} />
              )}
              {activeLines.engagement && (
                <Line yAxisId="right" type="monotone" dataKey="engagement" stroke={COLORS.engagement} strokeWidth={2.5} dot={false} strokeDasharray="6 3" />
              )}
            </ComposedChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Posts + Pie Chart Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Top Posts</CardTitle>
            <CardDescription>Publications les plus performantes ce mois</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {topPosts.map((post, i) => (
              <div key={post.id} className="flex items-center justify-between p-3 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors">
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

        {/* Pie Chart - Format by Network */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-lg">Performance par format</CardTitle>
            <CardDescription>Segmenté par réseau</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center">
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={formatData}
                  cx="50%"
                  cy="45%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={3}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={{ strokeWidth: 1 }}
                >
                  {formatData.map((entry, idx) => (
                    <Cell key={idx} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number, name: string) => [`${value}%`, name]} />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

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
                  onClick={() => { setTempObjectif(String(postsObjectif)); setEditingObjectif(true); }}
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
                <Button size="sm" onClick={handleSaveObjectif}>OK</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingObjectif(false)}>✕</Button>
              </div>
            ) : (
              <div className="flex items-end gap-2 mb-3">
                <span className="text-4xl font-bold text-foreground">{postsPublished}</span>
                <span className="text-lg text-muted-foreground font-medium mb-0.5">/ {postsObjectif} posts</span>
              </div>
            )}
            <Progress value={constancePercent} className="h-3" />
            <p className="text-xs text-muted-foreground mt-2">
              {constancePercent}% de l'objectif atteint — {constancePercent >= 90 ? "Excellent" : constancePercent >= 70 ? "Bon" : "À améliorer"}
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
        onSave={(d) => { setLinkedinData(d as typeof linkedinData); setLinkedinModal(false); }}
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
        onSave={(d) => { setTiktokData(d as typeof tiktokData); setTiktokModal(false); }}
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
        onSave={(d) => { setXData(d as typeof xData); setXModal(false); }}
      />
    </div>
  );
};

// --- Sub-components ---

function NetworkCard({ name, color, metrics, onEdit }: {
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

function DataModal({ open, onOpenChange, title, fields, data, onSave }: {
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
          <Button variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
          <Button onClick={handleSave}>Enregistrer</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default AnalyticsView;
