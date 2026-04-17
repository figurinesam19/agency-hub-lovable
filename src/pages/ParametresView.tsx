import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/hooks/use-toast";
import { Link2, Unlink, Facebook, Instagram, Loader2 } from "lucide-react";
import { useSearchParams } from "react-router-dom";

const META_APP_ID = "1456904832097817";
const SCOPES = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,pages_manage_posts";

interface SocialConnection {
  id: string;
  platform: string;
  page_id: string | null;
  expires_at: string | null;
  created_at: string;
}

export default function ParametresView() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [connections, setConnections] = useState<SocialConnection[]>([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);

  useEffect(() => {
    const metaStatus = searchParams.get("meta");
    if (metaStatus === "success") {
      toast({ title: "Connexion Meta réussie !", description: "Vos comptes Instagram et Facebook ont été connectés." });
    } else if (metaStatus === "error") {
      toast({ title: "Erreur de connexion", description: "La connexion Meta a échoué. Veuillez réessayer.", variant: "destructive" });
    }
  }, [searchParams]);

  const fetchConnections = async () => {
    if (!user) return;
    const { data } = await supabase
      .from("social_connections")
      .select("id, platform, page_id, expires_at, created_at")
      .eq("user_id", user.id);
    setConnections(data || []);
    setLoading(false);
  };

  useEffect(() => { fetchConnections(); }, [user]);

  const handleConnectMeta = () => {
    if (!user) return;
    setConnecting(true);
    const redirectUri = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/meta-oauth-callback`;
    // auth_type=rerequest force Meta à réafficher le dialog des permissions même si déjà accordées
    // display=popup + extras force le sélecteur de pages (sinon Meta peut ne renvoyer aucune page)
    const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(SCOPES)}&state=${user.id}&response_type=code&auth_type=rerequest&display=page`;
    console.log("[Meta OAuth] Redirecting to:", authUrl);
    window.location.href = authUrl;
  };

  const handleDisconnect = async (id: string, platform: string) => {
    await supabase.from("social_connections").delete().eq("id", id);
    toast({ title: `${platform} déconnecté`, description: "Le compte a été dissocié." });
    fetchConnections();
  };

  const fbConn = connections.find(c => c.platform === "facebook");
  const igConn = connections.find(c => c.platform === "instagram");

  const isExpired = (expiresAt: string | null) => {
    if (!expiresAt) return false;
    return new Date(expiresAt) < new Date();
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Paramètres</h1>
        <p className="text-muted-foreground text-sm mt-1">Gérez vos intégrations et connexions aux réseaux sociaux.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Connexions Meta
          </CardTitle>
          <CardDescription>
            Connectez vos comptes Facebook et Instagram pour publier du contenu directement depuis Agency Hub.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <>
              {/* Facebook status */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#1877F2] flex items-center justify-center">
                    <Facebook className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Facebook</p>
                    {fbConn ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={isExpired(fbConn.expires_at) ? "destructive" : "default"} className="text-[10px]">
                          {isExpired(fbConn.expires_at) ? "Expiré" : "Connecté"}
                        </Badge>
                        {fbConn.page_id && <span className="text-xs text-muted-foreground">Page: {fbConn.page_id}</span>}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Non connecté</span>
                    )}
                  </div>
                </div>
                {fbConn && (
                  <Button variant="ghost" size="sm" onClick={() => handleDisconnect(fbConn.id, "Facebook")}>
                    <Unlink className="h-4 w-4 mr-1" /> Dissocier
                  </Button>
                )}
              </div>

              {/* Instagram status */}
              <div className="flex items-center justify-between p-4 rounded-lg border bg-card">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: "linear-gradient(135deg, #f58529, #dd2a7b, #8134af)" }}>
                    <Instagram className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">Instagram</p>
                    {igConn ? (
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant={isExpired(igConn.expires_at) ? "destructive" : "default"} className="text-[10px]">
                          {isExpired(igConn.expires_at) ? "Expiré" : "Connecté"}
                        </Badge>
                        {igConn.page_id && <span className="text-xs text-muted-foreground">ID: {igConn.page_id}</span>}
                      </div>
                    ) : (
                      <span className="text-xs text-muted-foreground">Non connecté</span>
                    )}
                  </div>
                </div>
                {igConn && (
                  <Button variant="ghost" size="sm" onClick={() => handleDisconnect(igConn.id, "Instagram")}>
                    <Unlink className="h-4 w-4 mr-1" /> Dissocier
                  </Button>
                )}
              </div>

              {/* Connect button */}
              <Button onClick={handleConnectMeta} disabled={connecting} className="w-full mt-2" size="lg">
                {connecting ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <Facebook className="h-4 w-4 mr-2" />
                )}
                {fbConn ? "Reconnecter mon agence à Meta" : "Connecter mon agence à Meta"}
              </Button>

              <div className="rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-3 text-xs text-foreground/90">
                <p className="font-semibold text-yellow-600 dark:text-yellow-500 mb-1">⚠️ Étape critique sur l'écran Meta</p>
                <p>Quand Meta vous demande quoi autoriser, cliquez sur <strong>« Modifier les paramètres »</strong> / <strong>« Choisir ce que vous autorisez »</strong>, puis <strong>cochez explicitement votre Page Facebook</strong> et laissez TOUTES les permissions activées. Sans cela, Meta ne transmet aucune page (cause du <code>pages count: 0</code>) et Instagram reste introuvable.</p>
              </div>

              <p className="text-xs text-muted-foreground text-center">
                Permissions demandées : <code className="text-[10px]">instagram_basic</code>, <code className="text-[10px]">instagram_content_publish</code>, <code className="text-[10px]">pages_show_list</code>, <code className="text-[10px]">pages_read_engagement</code>, <code className="text-[10px]">pages_manage_posts</code>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
