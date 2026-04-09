import { useState, useEffect, useCallback } from "react";
import { Lightbulb, CheckCircle, Eye, FileText, Plus, MoreVertical, Search, MessageCircle, List, CalendarDays, Image as ImageIcon, Check, Receipt, Printer } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription,
} from "@/components/ui/sheet";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "@/hooks/use-toast";

type Status = "Validé Client" | "À relire" | "Brouillon";

interface Post {
  id: string;
  date_prevue: string;
  thematique: string;
  format: string;
  reseau: string;
  reseau_code: string;
  statut: Status;
  legende: string;
  hashtags: string;
  thumbnail_url: string;
  has_comments?: boolean;
}

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
  X: "bg-gray-200 text-gray-800",
};

const allStatuses: Status[] = ["Brouillon", "À relire", "Validé Client"];
const filters: ("Tous" | Status)[] = ["Tous", ...allStatuses];

const formatDate = (d: string) => {
  const date = new Date(d);
  return date.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
};

interface Comment {
  id: string;
  author_name: string;
  content: string;
  created_at: string;
}

const SuiviEditorialView = () => {
  const { user } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<"Tous" | Status>("Tous");
  const [searchQuery, setSearchQuery] = useState("");
  const [calendarView, setCalendarView] = useState(false);

  // Side panel
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");

  // Create/Edit dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState({ thematique: "", format: "Post statique", reseau: "Instagram", reseau_code: "IG", date_prevue: "", legende: "", hashtags: "" });

  // Delete confirm
  const [deleteTarget, setDeleteTarget] = useState<Post | null>(null);

  // Quote / Devis
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [quoteOpen, setQuoteOpen] = useState(false);
  const [quotePrices, setQuotePrices] = useState<Record<string, string>>({});
  const [quoteQty, setQuoteQty] = useState<Record<string, string>>({});
  const [quoteTva, setQuoteTva] = useState<Record<string, string>>({});
  const [quoteClient, setQuoteClient] = useState("");
  const [quoteClientEmail, setQuoteClientEmail] = useState("");
  const [quoteClientAddress, setQuoteClientAddress] = useState("");
  const [quoteClientSiret, setQuoteClientSiret] = useState("");
  const [quoteClientRef, setQuoteClientRef] = useState("");
  const [quoteSelectedClientId, setQuoteSelectedClientId] = useState<string>("");
  const [crmClients, setCrmClients] = useState<{ id: number; entreprise: string | null; email: string | null; telephone: string | null; siret: string | null }[]>([]);
  const [quoteAgencyName, setQuoteAgencyName] = useState("Pulsar Agency");
  const [quoteAgencyAddress, setQuoteAgencyAddress] = useState("12 Rue de l'Innovation, 59000 Lille");
  const [quoteAgencySiret, setQuoteAgencySiret] = useState("");
  const [quoteAgencyEmail, setQuoteAgencyEmail] = useState("");
  const [quoteAgencyPhone, setQuoteAgencyPhone] = useState("");
  const [quoteAgencyTva, setQuoteAgencyTva] = useState("");
  const [quotePayment, setQuotePayment] = useState("Virement bancaire");
  const [quotePaymentTerms, setQuotePaymentTerms] = useState("30 jours");

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleSelectAll = () => {
    if (selectedIds.size === filtered.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filtered.map((p) => p.id)));
    }
  };

  const openQuoteDialog = () => {
    const prices: Record<string, string> = {};
    const qty: Record<string, string> = {};
    const tva: Record<string, string> = {};
    selectedIds.forEach((id) => { prices[id] = ""; qty[id] = "1"; tva[id] = "20"; });
    setQuotePrices(prices);
    setQuoteQty(qty);
    setQuoteTva(tva);
    setQuoteClient("");
    setQuoteClientEmail("");
    setQuoteClientAddress("");
    setQuoteClientSiret("");
    setQuoteClientRef("");
    setQuoteSelectedClientId("");
    fetchCrmClients();
    setQuoteOpen(true);
  };

  const selectedPosts = posts.filter((p) => selectedIds.has(p.id));

  const quoteLines = selectedPosts.map((p) => {
    const qty = parseFloat(quoteQty[p.id] || "1") || 1;
    const price = parseFloat(quotePrices[p.id] || "0") || 0;
    const tvaRate = parseFloat(quoteTva[p.id] || "20") || 0;
    const lineHT = qty * price;
    const lineTVA = lineHT * (tvaRate / 100);
    return { post: p, qty, price, tvaRate, lineHT, lineTVA };
  });

  const quoteTotalHT = quoteLines.reduce((s, l) => s + l.lineHT, 0);
  const quoteTotalTVA = quoteLines.reduce((s, l) => s + l.lineTVA, 0);
  const quoteTotalTTC = quoteTotalHT + quoteTotalTVA;

  const quoteNumber = `DEV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999) + 1).padStart(3, "0")}`;

  const fetchPosts = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("posts")
      .select("*")
      .order("date_prevue", { ascending: true });
    if (error) {
      toast({ title: "Erreur", description: error.message, variant: "destructive" });
      return;
    }

    // Check which posts have comments
    const { data: commentCounts } = await supabase
      .from("post_comments")
      .select("post_id");

    const postsWithComments = new Set(commentCounts?.map((c: { post_id: string }) => c.post_id) ?? []);

    setPosts(
      (data ?? []).map((p) => ({
        id: p.id,
        date_prevue: p.date_prevue,
        thematique: p.thematique,
        format: p.format,
        reseau: p.reseau,
        reseau_code: p.reseau_code,
        statut: p.statut as Status,
        legende: p.legende ?? "",
        hashtags: p.hashtags ?? "",
        thumbnail_url: p.thumbnail_url ?? "",
        has_comments: postsWithComments.has(p.id),
      }))
    );
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // Fetch CRM clients for quote dropdown
  const fetchCrmClients = useCallback(async () => {
    if (!user) return;
    const { data } = await supabase.from("clients").select("id, entreprise, email, telephone, siret").order("entreprise");
    setCrmClients(data ?? []);
  }, [user]);

  useEffect(() => { fetchCrmClients(); }, [fetchCrmClients]);

  const handleSelectClient = (clientId: string) => {
    setQuoteSelectedClientId(clientId);
    if (clientId === "__manual__") {
      setQuoteClient("");
      setQuoteClientEmail("");
      setQuoteClientAddress("");
      setQuoteClientSiret("");
      return;
    }
    const c = crmClients.find((cl) => String(cl.id) === clientId);
    if (c) {
      setQuoteClient(c.entreprise || "");
      setQuoteClientEmail(c.email || "");
      setQuoteClientSiret(c.siret || "");
      setQuoteClientAddress("");
    }
  };

  const filtered = (activeFilter === "Tous" ? posts : posts.filter((p) => p.statut === activeFilter))
    .filter((p) => !searchQuery || p.thematique.toLowerCase().includes(searchQuery.toLowerCase()));

  const counts = {
    total: posts.length,
    valide: posts.filter((p) => p.statut === "Validé Client").length,
    relire: posts.filter((p) => p.statut === "À relire").length,
    brouillon: posts.filter((p) => p.statut === "Brouillon").length,
  };

  // CRUD
  const reseauMap: Record<string, string> = { Instagram: "IG", Facebook: "FB", LinkedIn: "LI", TikTok: "TK", X: "X" };

  const openCreateDialog = () => {
    setEditingPost(null);
    setFormData({ thematique: "", format: "Post statique", reseau: "Instagram", reseau_code: "IG", date_prevue: new Date().toISOString().split("T")[0], legende: "", hashtags: "" });
    setDialogOpen(true);
  };

  const openEditDialog = (post: Post) => {
    setEditingPost(post);
    setFormData({ thematique: post.thematique, format: post.format, reseau: post.reseau, reseau_code: post.reseau_code, date_prevue: post.date_prevue, legende: post.legende, hashtags: post.hashtags });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    const payload = { ...formData, reseau_code: reseauMap[formData.reseau] ?? "IG", user_id: user?.id };
    if (editingPost) {
      const { error } = await supabase.from("posts").update(payload).eq("id", editingPost.id);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Contenu mis à jour" });
    } else {
      const { error } = await supabase.from("posts").insert(payload);
      if (error) { toast({ title: "Erreur", description: error.message, variant: "destructive" }); return; }
      toast({ title: "Contenu créé" });
    }
    setDialogOpen(false);
    fetchPosts();
  };

  const handleDuplicate = async (post: Post) => {
    const { error } = await supabase.from("posts").insert({
      thematique: post.thematique + " (copie)",
      format: post.format,
      reseau: post.reseau,
      reseau_code: post.reseau_code,
      date_prevue: post.date_prevue,
      legende: post.legende,
      hashtags: post.hashtags,
      statut: "Brouillon",
      user_id: user?.id,
    });
    if (!error) { toast({ title: "Contenu dupliqué" }); fetchPosts(); }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase.from("posts").delete().eq("id", deleteTarget.id);
    if (!error) { toast({ title: "Contenu supprimé" }); fetchPosts(); }
    setDeleteTarget(null);
    if (selectedPost?.id === deleteTarget.id) setSelectedPost(null);
  };

  const handleStatusChange = async (post: Post, newStatus: Status) => {
    const { error } = await supabase.from("posts").update({ statut: newStatus }).eq("id", post.id);
    if (!error) {
      toast({ title: `Statut → ${newStatus}` });
      fetchPosts();
      if (selectedPost?.id === post.id) setSelectedPost({ ...post, statut: newStatus });
    }
  };

  const handleApprove = async (post: Post) => {
    await handleStatusChange(post, "Validé Client");
  };

  // Comments
  const openSidePanel = async (post: Post) => {
    setSelectedPost(post);
    const { data } = await supabase.from("post_comments").select("*").eq("post_id", post.id).order("created_at", { ascending: true });
    setComments((data ?? []) as Comment[]);
  };

  const addComment = async () => {
    if (!newComment.trim() || !selectedPost) return;
    const { error } = await supabase.from("post_comments").insert({ post_id: selectedPost.id, content: newComment, user_id: user?.id, author_name: user?.email?.split("@")[0] ?? "Moi" });
    if (!error) {
      setNewComment("");
      const { data } = await supabase.from("post_comments").select("*").eq("post_id", selectedPost.id).order("created_at", { ascending: true });
      setComments((data ?? []) as Comment[]);
      fetchPosts();
    }
  };

  // Calendar view helpers
  const calendarPosts = filtered;
  const today = new Date();
  const calMonth = today.getMonth();
  const calYear = today.getFullYear();
  const firstDay = new Date(calYear, calMonth, 1).getDay();
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();
  const offset = firstDay === 0 ? 6 : firstDay - 1;
  const DAYS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <KpiCard icon={<Lightbulb className="h-6 w-6 text-yellow-500" />} label="Total idées" value={counts.total} badge="Aperçu" />
        <KpiCard icon={<CheckCircle className="h-6 w-6 text-green-500" />} label="Validé Client" value={counts.valide} />
        <KpiCard icon={<Eye className="h-6 w-6 text-yellow-600" />} label="À relire" value={counts.relire} valueColor="text-yellow-600" />
        <KpiCard icon={<FileText className="h-6 w-6 text-muted-foreground" />} label="Brouillons" value={counts.brouillon} />
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-wrap">
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
          <span className="text-sm text-muted-foreground">{filtered.length} résultats</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 w-[200px]"
            />
          </div>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <List className="h-4 w-4" />
            <Switch checked={calendarView} onCheckedChange={setCalendarView} />
            <CalendarDays className="h-4 w-4" />
          </div>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-1" /> Nouveau Contenu
          </Button>
          {selectedIds.size > 0 && (
            <Button variant="outline" onClick={openQuoteDialog}>
              <Receipt className="h-4 w-4 mr-1" /> Générer Devis ({selectedIds.size})
            </Button>
          )}
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Chargement…</div>
      ) : calendarView ? (
        /* Calendar View */
        <div className="bg-card rounded-xl border border-border p-4">
          <h3 className="font-semibold text-foreground mb-4">
            {new Date(calYear, calMonth).toLocaleDateString("fr-FR", { month: "long", year: "numeric" })}
          </h3>
          <div className="grid grid-cols-7 gap-px bg-border rounded-lg overflow-hidden">
            {DAYS.map((d) => (
              <div key={d} className="bg-secondary text-center text-xs font-medium text-muted-foreground py-2">{d}</div>
            ))}
            {Array.from({ length: offset }).map((_, i) => (
              <div key={`e-${i}`} className="bg-card min-h-[80px]" />
            ))}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const dateStr = `${calYear}-${String(calMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
              const dayPosts = calendarPosts.filter((p) => p.date_prevue === dateStr);
              return (
                <div key={day} className="bg-card min-h-[80px] p-1 border-t border-border">
                  <span className="text-xs text-muted-foreground">{day}</span>
                  {dayPosts.slice(0, 2).map((p) => {
                    const rc = reseauColors[p.reseau_code] ?? "bg-secondary text-foreground";
                    return (
                      <div
                        key={p.id}
                        onClick={() => openSidePanel(p)}
                        className="mt-0.5 px-1.5 py-0.5 rounded text-[10px] truncate cursor-pointer hover:opacity-80 bg-primary/10 text-primary"
                      >
                        <span className={`inline-block w-1.5 h-1.5 rounded-full mr-1 ${rc.split(" ")[0]}`} />
                        {p.thematique}
                      </div>
                    );
                  })}
                  {dayPosts.length > 2 && <span className="text-[10px] text-muted-foreground">+{dayPosts.length - 2}</span>}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* List View */
        <div className="bg-card rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px]">
                  <Checkbox
                    checked={filtered.length > 0 && selectedIds.size === filtered.length}
                    onCheckedChange={toggleSelectAll}
                  />
                </TableHead>
                <TableHead className="uppercase text-xs tracking-wider text-muted-foreground w-[50px]">Aperçu</TableHead>
                <TableHead className="uppercase text-xs tracking-wider text-muted-foreground">Date prévue</TableHead>
                <TableHead className="uppercase text-xs tracking-wider text-muted-foreground">Thématique</TableHead>
                <TableHead className="uppercase text-xs tracking-wider text-muted-foreground">Format</TableHead>
                <TableHead className="uppercase text-xs tracking-wider text-muted-foreground">Réseau</TableHead>
                <TableHead className="uppercase text-xs tracking-wider text-muted-foreground">Statut</TableHead>
                <TableHead className="uppercase text-xs tracking-wider text-muted-foreground w-[60px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Aucun contenu trouvé. Cliquez sur "Nouveau Contenu" pour commencer.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((post) => {
                  const sc = statusConfig[post.statut];
                  const rc = reseauColors[post.reseau_code] ?? "bg-secondary text-foreground";
                  return (
                    <TableRow
                      key={post.id}
                      className="h-16 cursor-pointer hover:bg-muted/30"
                      onClick={() => openSidePanel(post)}
                    >
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <Checkbox
                          checked={selectedIds.has(post.id)}
                          onCheckedChange={() => toggleSelect(post.id)}
                        />
                      </TableCell>
                      <TableCell>
                        {post.thumbnail_url ? (
                          <img src={post.thumbnail_url} alt="" className="w-10 h-10 rounded object-cover" />
                        ) : (
                          <div className="w-10 h-10 rounded bg-muted flex items-center justify-center">
                            <ImageIcon className="h-4 w-4 text-muted-foreground" />
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(post.date_prevue)}</TableCell>
                      <TableCell className="font-semibold text-foreground max-w-[180px] truncate">{post.thematique}</TableCell>
                      <TableCell className="text-muted-foreground">{post.format}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${rc}`}>{post.reseau_code}</span>
                          <span className="text-muted-foreground">{post.reseau}</span>
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium cursor-pointer ${sc.bg} ${sc.text}`}>
                                <span className={`w-2 h-2 rounded-full ${sc.dot}`} />
                                {post.statut}
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                              {allStatuses.map((s) => (
                                <DropdownMenuItem key={s} onClick={() => handleStatusChange(post, s)}>
                                  <span className={`w-2 h-2 rounded-full mr-2 ${statusConfig[s].dot}`} />
                                  {s}
                                  {post.statut === s && <Check className="h-3 w-3 ml-auto" />}
                                </DropdownMenuItem>
                              ))}
                            </DropdownMenuContent>
                          </DropdownMenu>
                          {post.has_comments && <MessageCircle className="h-3.5 w-3.5 text-muted-foreground" />}
                          {post.statut === "À relire" && (
                            <Button size="sm" variant="ghost" className="h-7 px-2 text-green-600 hover:text-green-700 hover:bg-green-50 text-xs" onClick={(e) => { e.stopPropagation(); handleApprove(post); }}>
                              Approuver
                            </Button>
                          )}
                        </div>
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(post)}>Modifier</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleDuplicate(post)}>Dupliquer</DropdownMenuItem>
                            <DropdownMenuItem className="text-destructive" onClick={() => setDeleteTarget(post)}>Supprimer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Side Panel */}
      <Sheet open={!!selectedPost} onOpenChange={(open) => { if (!open) setSelectedPost(null); }}>
        <SheetContent className="w-[420px] sm:max-w-[420px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>{selectedPost?.thematique}</SheetTitle>
            <SheetDescription>Détails du contenu</SheetDescription>
          </SheetHeader>
          {selectedPost && (
            <div className="mt-6 space-y-5">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase">Réseau</Label>
                <p className="text-sm text-foreground">{selectedPost.reseau}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase">Format</Label>
                <p className="text-sm text-foreground">{selectedPost.format}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase">Date prévue</Label>
                <p className="text-sm text-foreground">{formatDate(selectedPost.date_prevue)}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase">Statut</Label>
                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${statusConfig[selectedPost.statut].bg} ${statusConfig[selectedPost.statut].text}`}>
                  <span className={`w-2 h-2 rounded-full ${statusConfig[selectedPost.statut].dot}`} />
                  {selectedPost.statut}
                </span>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase">Légende / Copywriting</Label>
                <p className="text-sm text-foreground whitespace-pre-wrap">{selectedPost.legende || "—"}</p>
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground uppercase">Hashtags</Label>
                <p className="text-sm text-primary">{selectedPost.hashtags || "—"}</p>
              </div>

              {/* Comments */}
              <div className="border-t border-border pt-4 space-y-3">
                <Label className="text-xs text-muted-foreground uppercase">Commentaires ({comments.length})</Label>
                {comments.length === 0 && <p className="text-sm text-muted-foreground">Aucun commentaire.</p>}
                {comments.map((c) => (
                  <div key={c.id} className="bg-muted rounded-lg p-3 space-y-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-medium text-foreground">{c.author_name}</span>
                      <span className="text-[10px] text-muted-foreground">{new Date(c.created_at).toLocaleDateString("fr-FR")}</span>
                    </div>
                    <p className="text-sm text-foreground">{c.content}</p>
                  </div>
                ))}
                <div className="flex gap-2">
                  <Textarea
                    placeholder="Ajouter un commentaire..."
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="min-h-[60px]"
                  />
                </div>
                <Button size="sm" onClick={addComment} disabled={!newComment.trim()}>
                  Envoyer
                </Button>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingPost ? "Modifier le contenu" : "Nouveau contenu"}</DialogTitle>
            <DialogDescription>Remplissez les informations du post.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Thématique</Label>
              <Input value={formData.thematique} onChange={(e) => setFormData({ ...formData, thematique: e.target.value })} placeholder="Ex: Lancement gamme printemps" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Format</Label>
                <Select value={formData.format} onValueChange={(v) => setFormData({ ...formData, format: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Post statique", "Carrousel", "Réel / Vidéo courte", "Story", "Visuel promo"].map((f) => (
                      <SelectItem key={f} value={f}>{f}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Réseau</Label>
                <Select value={formData.reseau} onValueChange={(v) => setFormData({ ...formData, reseau: v, reseau_code: reseauMap[v] ?? "IG" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Instagram", "Facebook", "LinkedIn", "TikTok", "X"].map((r) => (
                      <SelectItem key={r} value={r}>{r}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Date prévue</Label>
              <Input type="date" value={formData.date_prevue} onChange={(e) => setFormData({ ...formData, date_prevue: e.target.value })} />
            </div>
            <div className="grid gap-2">
              <Label>Légende</Label>
              <Textarea value={formData.legende} onChange={(e) => setFormData({ ...formData, legende: e.target.value })} placeholder="Texte du post..." />
            </div>
            <div className="grid gap-2">
              <Label>Hashtags</Label>
              <Input value={formData.hashtags} onChange={(e) => setFormData({ ...formData, hashtags: e.target.value })} placeholder="#marketing #branding" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave} disabled={!formData.thematique}>Enregistrer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer ce contenu ?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.thematique}" sera supprimé définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Quote / Devis Modal */}
      <Dialog open={quoteOpen} onOpenChange={setQuoteOpen}>
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto print:max-w-none print:shadow-none print:border-none print:max-h-none">
          <DialogHeader className="print:hidden">
            <DialogTitle className="text-xl">Aperçu du Devis</DialogTitle>
            <DialogDescription>Personnalisez et exportez votre devis professionnel.</DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-2" id="quote-content">
            {/* Header: Agency left, Doc info right */}
            <div className="flex justify-between items-start gap-6">
              {/* Left: Agency */}
              <div className="space-y-1 flex-1">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-2">
                  <FileText className="h-6 w-6 text-primary" />
                </div>
                <Input value={quoteAgencyName} onChange={(e) => setQuoteAgencyName(e.target.value)} className="font-bold text-lg border-none p-0 h-auto shadow-none focus-visible:ring-0 print:text-foreground" placeholder="Nom de l'agence" />
                <Input value={quoteAgencyAddress} onChange={(e) => setQuoteAgencyAddress(e.target.value)} className="text-sm border-none p-0 h-auto shadow-none focus-visible:ring-0 text-muted-foreground" placeholder="Adresse" />
                <Input value={quoteAgencySiret} onChange={(e) => setQuoteAgencySiret(e.target.value)} className="text-sm border-none p-0 h-auto shadow-none focus-visible:ring-0 text-muted-foreground" placeholder="SIRET : ..." />
                <Input value={quoteAgencyEmail} onChange={(e) => setQuoteAgencyEmail(e.target.value)} className="text-sm border-none p-0 h-auto shadow-none focus-visible:ring-0 text-muted-foreground" placeholder="email@agence.com" />
                <Input value={quoteAgencyPhone} onChange={(e) => setQuoteAgencyPhone(e.target.value)} className="text-sm border-none p-0 h-auto shadow-none focus-visible:ring-0 text-muted-foreground" placeholder="Téléphone" />
              </div>

              {/* Right: Document info */}
              <div className="text-right space-y-1 flex-1">
                <h2 className="text-2xl font-extrabold tracking-tight text-foreground">DEVIS</h2>
                <p className="text-sm font-semibold text-muted-foreground">{quoteNumber}</p>
                <p className="text-sm text-muted-foreground">
                  Date d'émission : {new Date().toLocaleDateString("fr-FR")}
                </p>
                <p className="text-sm text-muted-foreground">
                  Validité : {new Date(Date.now() + 30 * 86400000).toLocaleDateString("fr-FR")}
                </p>
              </div>
            </div>

            {/* Client block */}
            <div className="bg-muted/50 rounded-lg p-4 space-y-2 border border-border">
              <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Client</p>
              <Input value={quoteClient} onChange={(e) => setQuoteClient(e.target.value)} placeholder="Nom du client" className="font-semibold border-none p-0 h-auto shadow-none focus-visible:ring-0 bg-transparent" />
              <Input value={quoteClientAddress} onChange={(e) => setQuoteClientAddress(e.target.value)} placeholder="Adresse du client" className="text-sm border-none p-0 h-auto shadow-none focus-visible:ring-0 bg-transparent text-muted-foreground" />
              <Input value={quoteClientSiret} onChange={(e) => setQuoteClientSiret(e.target.value)} placeholder="SIRET du client" className="text-sm border-none p-0 h-auto shadow-none focus-visible:ring-0 bg-transparent text-muted-foreground" />
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Réf. client :</span>
                <Input value={quoteClientRef} onChange={(e) => setQuoteClientRef(e.target.value)} placeholder="—" className="text-sm border-none p-0 h-auto shadow-none focus-visible:ring-0 bg-transparent w-[120px]" />
              </div>
            </div>

            {/* Items table */}
            <div className="border border-border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-primary/5 hover:bg-primary/5">
                    <TableHead className="text-xs uppercase font-semibold text-foreground">Contenu</TableHead>
                    <TableHead className="text-xs uppercase font-semibold text-foreground">Format</TableHead>
                    <TableHead className="text-xs uppercase font-semibold text-foreground">Réseau</TableHead>
                    <TableHead className="text-xs uppercase font-semibold text-foreground text-center w-[70px]">Qté</TableHead>
                    <TableHead className="text-xs uppercase font-semibold text-foreground text-right w-[110px]">Prix unit. €</TableHead>
                    <TableHead className="text-xs uppercase font-semibold text-foreground text-center w-[80px]">TVA %</TableHead>
                    <TableHead className="text-xs uppercase font-semibold text-foreground text-right w-[100px]">Montant €</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {quoteLines.map((line) => (
                    <TableRow key={line.post.id}>
                      <TableCell className="font-medium text-sm">{line.post.thematique}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{line.post.format}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{line.post.reseau}</TableCell>
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <Input type="number" min="1" value={quoteQty[line.post.id] || "1"} onChange={(e) => setQuoteQty({ ...quoteQty, [line.post.id]: e.target.value })} className="w-[55px] mx-auto text-center text-sm print:border-none print:p-0" />
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        <Input type="number" min="0" step="0.01" value={quotePrices[line.post.id] || ""} onChange={(e) => setQuotePrices({ ...quotePrices, [line.post.id]: e.target.value })} placeholder="0,00" className="w-[90px] ml-auto text-right text-sm print:border-none print:p-0" />
                      </TableCell>
                      <TableCell className="text-center" onClick={(e) => e.stopPropagation()}>
                        <Input type="number" min="0" step="0.5" value={quoteTva[line.post.id] || "20"} onChange={(e) => setQuoteTva({ ...quoteTva, [line.post.id]: e.target.value })} className="w-[60px] mx-auto text-center text-sm print:border-none print:p-0" />
                      </TableCell>
                      <TableCell className="text-right font-medium text-sm">{line.lineHT.toFixed(2)} €</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {/* Totals */}
            <div className="flex justify-end">
              <div className="w-[280px] space-y-2 border border-border rounded-lg p-4">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total HT</span>
                  <span className="font-medium text-foreground">{quoteTotalHT.toFixed(2)} €</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">TVA</span>
                  <span className="font-medium text-foreground">{quoteTotalTVA.toFixed(2)} €</span>
                </div>
                <div className="border-t border-border pt-2 flex justify-between">
                  <span className="font-bold text-foreground">Total TTC</span>
                  <span className="text-xl font-extrabold text-foreground">{quoteTotalTTC.toFixed(2)} €</span>
                </div>
              </div>
            </div>

            {/* Payment & Terms */}
            <div className="grid grid-cols-2 gap-6 border-t border-border pt-4">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Moyens de paiement</p>
                <Input value={quotePayment} onChange={(e) => setQuotePayment(e.target.value)} className="text-sm border-none p-0 h-auto shadow-none focus-visible:ring-0" placeholder="Virement bancaire" />
              </div>
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase text-muted-foreground tracking-wider">Conditions de paiement</p>
                <Input value={quotePaymentTerms} onChange={(e) => setQuotePaymentTerms(e.target.value)} className="text-sm border-none p-0 h-auto shadow-none focus-visible:ring-0" placeholder="30 jours" />
              </div>
            </div>

            {/* Legal footer */}
            <div className="border-t border-border pt-3 text-center space-y-0.5">
              <p className="text-[11px] text-muted-foreground font-medium">{quoteAgencyName}</p>
              <p className="text-[10px] text-muted-foreground">{quoteAgencyAddress}</p>
              <p className="text-[10px] text-muted-foreground">
                {quoteAgencySiret && `SIRET : ${quoteAgencySiret}`}
                {quoteAgencyTva && ` — N° TVA : ${quoteAgencyTva}`}
              </p>
              <Input value={quoteAgencyTva} onChange={(e) => setQuoteAgencyTva(e.target.value)} className="text-[10px] text-center border-none p-0 h-auto shadow-none focus-visible:ring-0 text-muted-foreground print:hidden mx-auto w-[250px]" placeholder="N° TVA intracommunautaire (optionnel)" />
            </div>
          </div>

          <DialogFooter className="print:hidden">
            <Button variant="outline" onClick={() => setQuoteOpen(false)}>Fermer</Button>
            <Button onClick={() => window.print()}>
              <Printer className="h-4 w-4 mr-1" /> Imprimer / PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
