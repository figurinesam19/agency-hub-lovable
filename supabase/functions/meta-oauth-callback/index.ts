import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const META_APP_ID = "1456904832097817";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
  const appUrl = Deno.env.get("SITE_URL") || "https://id-preview--0fd004a2-f25d-4893-bc99-5bccf4a3c51f.lovable.app";

  try {
    const META_APP_SECRET = Deno.env.get("META_APP_SECRET");
    if (!META_APP_SECRET) {
      throw new Error("META_APP_SECRET is not configured");
    }

    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const userId = url.searchParams.get("state");

    console.log("[meta-oauth-callback] incoming", { hasCode: !!code, userId });

    if (!code || !userId) {
      const redirectUri = `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;
      const scopes = "instagram_basic,instagram_content_publish,pages_show_list,pages_read_engagement,pages_manage_posts";
      const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${url.searchParams.get("user_id") || ""}&response_type=code`;

      return new Response(JSON.stringify({ auth_url: authUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Exchange code → short-lived token
    const redirectUri = `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;
    const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${META_APP_SECRET}&code=${code}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();
    console.log("[meta-oauth-callback] tokenData", JSON.stringify(tokenData));

    if (tokenData.error) {
      throw new Error(tokenData.error.message || "Failed to exchange code for token");
    }

    // Long-lived token
    const longLivedUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();
    console.log("[meta-oauth-callback] longLivedData", JSON.stringify(longLivedData));

    const userAccessToken = longLivedData.access_token || tokenData.access_token;
    const expiresIn = longLivedData.expires_in || 5184000;
    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Fetch pages
    const pagesRes = await fetch(`https://graph.facebook.com/v21.0/me/accounts?fields=id,name,access_token,instagram_business_account&access_token=${userAccessToken}`);
    const pagesData = await pagesRes.json();
    console.log("[meta-oauth-callback] pagesData", JSON.stringify(pagesData));

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const pages = Array.isArray(pagesData?.data) ? pagesData.data : [];
    // Prefer a page that has Instagram linked, otherwise first page
    const page = pages.find((p: any) => p?.instagram_business_account?.id) || pages[0] || null;

    // Always save Facebook connection — use page token if a page exists, else user token
    const fbAccessToken = page?.access_token || userAccessToken;
    const fbPageId = page?.id || null;

    const { error: fbErr } = await supabase.from("social_connections").upsert({
      user_id: userId,
      platform: "facebook",
      access_token: fbAccessToken,
      page_id: fbPageId,
      expires_at: expiresAt,
    }, { onConflict: "user_id,platform" });
    if (fbErr) console.error("[meta-oauth-callback] FB upsert error", fbErr);
    else console.log("[meta-oauth-callback] FB connection saved", { fbPageId });

    if (!page) {
      console.warn("[meta-oauth-callback] No Facebook page returned. Check pages_show_list scope and that the user is admin of at least one page.");
    }

    // Instagram (linked to the chosen page)
    const igId = page?.instagram_business_account?.id || null;
    if (igId && page?.access_token) {
      const { error: igErr } = await supabase.from("social_connections").upsert({
        user_id: userId,
        platform: "instagram",
        access_token: page.access_token,
        page_id: igId,
        expires_at: expiresAt,
      }, { onConflict: "user_id,platform" });
      if (igErr) console.error("[meta-oauth-callback] IG upsert error", igErr);
      else console.log("[meta-oauth-callback] IG connection saved", { igId });
    } else {
      console.log("[meta-oauth-callback] No Instagram business account linked to page");
    }

    return Response.redirect(`${appUrl}/parametres?meta=success`, 302);

  } catch (error) {
    console.error("[meta-oauth-callback] error:", error);
    return Response.redirect(`${appUrl}/parametres?meta=error`, 302);
  }
});
