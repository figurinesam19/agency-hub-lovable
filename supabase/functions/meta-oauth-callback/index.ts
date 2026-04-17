import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const META_APP_ID = Deno.env.get("META_APP_ID") || "1456904832097817";

type MetaPage = {
  id?: string;
  name?: string;
  access_token?: string;
  instagram_business_account?: {
    id?: string;
    username?: string;
    name?: string;
    profile_picture_url?: string;
  } | null;
};

const jsonHeaders = { ...corsHeaders, "Content-Type": "application/json" };

function redirectToApp(appUrl: string, status: "success" | "error") {
  return Response.redirect(`${appUrl}/parametres?meta=${status}`, 302);
}

async function fetchMetaJson(url: string, label: string) {
  const response = await fetch(url);
  const rawText = await response.text();

  console.log(`[meta-oauth-callback] ${label} status`, response.status);
  console.log(`[meta-oauth-callback] ${label} raw`, rawText);

  let data: any = null;
  try {
    data = rawText ? JSON.parse(rawText) : null;
  } catch (parseError) {
    throw new Error(`${label}: invalid JSON response (${String(parseError)})`);
  }

  if (!response.ok || data?.error) {
    throw new Error(data?.error?.message || `${label}: request failed with status ${response.status}`);
  }

  return data;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
  const META_APP_SECRET = Deno.env.get("META_APP_SECRET");
  const appUrl = Deno.env.get("SITE_URL") || "https://id-preview--0fd004a2-f25d-4893-bc99-5bccf4a3c51f.lovable.app";

  try {
    if (!META_APP_SECRET) {
      throw new Error("META_APP_SECRET is not configured");
    }

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const userId = url.searchParams.get("state");

    console.log("[meta-oauth-callback] incoming", JSON.stringify({ hasCode: Boolean(code), userId }));

    if (!code || !userId) {
      const redirectUri = `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;
      const scopes = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,pages_manage_posts";
      const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${encodeURIComponent(scopes)}&state=${url.searchParams.get("user_id") || ""}&response_type=code`;

      return new Response(JSON.stringify({ auth_url: authUrl }), { headers: jsonHeaders });
    }

    const redirectUri = `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;
    const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${META_APP_SECRET}&code=${encodeURIComponent(code)}`;
    const tokenData = await fetchMetaJson(tokenUrl, "token exchange");

    const longLivedUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${encodeURIComponent(tokenData.access_token)}`;
    const longLivedData = await fetchMetaJson(longLivedUrl, "long lived token exchange");

    const userAccessToken = longLivedData?.access_token || tokenData?.access_token;
    const expiresIn = Number(longLivedData?.expires_in || 5184000);
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    if (!userAccessToken) {
      throw new Error("No Meta access token available after exchange");
    }

    const pagesUrl = `https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${encodeURIComponent(userAccessToken)}`;
    const pagesData = await fetchMetaJson(pagesUrl, "/me/accounts");
    console.log("[meta-oauth-callback] pagesData structured", JSON.stringify(pagesData));

    const pages: MetaPage[] = Array.isArray(pagesData?.data) ? pagesData.data : [];
    console.log(`[meta-oauth-callback] pages count: ${pages.length}`);

    if (pages.length === 0) {
      console.warn("[meta-oauth-callback] /me/accounts returned an EMPTY list. Likely causes: (1) the user did not tick any Page in the OAuth consent dialog, (2) the 'pages_show_list' permission was not granted/approved on the Meta app, or (3) the user has no Facebook Page admin role.");
    }

    let selectedPage: MetaPage | null = pages.find((page) => page?.instagram_business_account?.id) || pages[0] || null;

    // Fallback ciblé : si une page est sélectionnée mais sans IG, on interroge directement la page avec son page token
    if (selectedPage && !selectedPage.instagram_business_account?.id && selectedPage.id && selectedPage.access_token) {
      try {
        const probeUrl = `https://graph.facebook.com/v21.0/${selectedPage.id}?fields=instagram_business_account{id,username,name,profile_picture_url}&access_token=${encodeURIComponent(selectedPage.access_token)}`;
        const probeRes = await fetch(probeUrl);
        const probeText = await probeRes.text();
        console.log(`[meta-oauth-callback] IG probe status ${probeRes.status} raw`, probeText);
        const probeData = probeText ? JSON.parse(probeText) : null;
        if (probeData?.instagram_business_account?.id) {
          selectedPage = { ...selectedPage, instagram_business_account: probeData.instagram_business_account };
          console.log("[meta-oauth-callback] IG probe SUCCESS", JSON.stringify(probeData.instagram_business_account));
        } else {
          console.warn("[meta-oauth-callback] IG probe returned no instagram_business_account");
        }
      } catch (probeError) {
        console.error("[meta-oauth-callback] IG probe failed (non-fatal)", String(probeError));
      }
    }

    const facebookPageId = selectedPage?.id || null;
    const instagramBusinessId = selectedPage?.instagram_business_account?.id || null;
    const facebookAccessToken = selectedPage?.access_token || userAccessToken;

    console.log("[meta-oauth-callback] selected account", JSON.stringify({
      facebookPageId,
      instagramBusinessId,
      hasPageToken: Boolean(selectedPage?.access_token),
    }));

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const { error: fbErr } = await supabase.from("social_connections").upsert({
      user_id: userId,
      platform: "facebook",
      access_token: facebookAccessToken,
      page_id: facebookPageId,
      expires_at: expiresAt,
    }, { onConflict: "user_id,platform" });

    if (fbErr) {
      console.error("[meta-oauth-callback] FB upsert error", JSON.stringify(fbErr));
      throw new Error(fbErr.message || "Failed to save Facebook connection");
    }

    console.log("[meta-oauth-callback] FB connection saved", JSON.stringify({ facebookPageId }));

    if (instagramBusinessId) {
      const { error: igErr } = await supabase.from("social_connections").upsert({
        user_id: userId,
        platform: "instagram",
        access_token: selectedPage?.access_token || userAccessToken,
        page_id: instagramBusinessId,
        expires_at: expiresAt,
      }, { onConflict: "user_id,platform" });

      if (igErr) {
        console.error("[meta-oauth-callback] IG upsert error", JSON.stringify(igErr));
        throw new Error(igErr.message || "Failed to save Instagram connection");
      }

      console.log("[meta-oauth-callback] IG connection saved", JSON.stringify({ instagramBusinessId }));
    } else {
      console.warn("[meta-oauth-callback] No instagram_business_account.id returned by /me/accounts");
    }

    return redirectToApp(appUrl, "success");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[meta-oauth-callback] fatal error", message);
    return redirectToApp(appUrl, "error");
  }
});
