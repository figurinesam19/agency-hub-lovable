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

  try {
    const META_APP_SECRET = Deno.env.get("META_APP_SECRET");
    if (!META_APP_SECRET) {
      throw new Error("META_APP_SECRET is not configured");
    }

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const url = new URL(req.url);
    const code = url.searchParams.get("code");
    const userId = url.searchParams.get("state");

    if (!code || !userId) {
      // Redirect URI for the frontend
      const redirectUri = `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;
      const scopes = "instagram_basic,instagram_content_publish,pages_read_engagement,pages_manage_posts";
      const authUrl = `https://www.facebook.com/v21.0/dialog/oauth?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scopes}&state=${url.searchParams.get("user_id") || ""}&response_type=code`;

      return new Response(JSON.stringify({ auth_url: authUrl }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Exchange code for short-lived token
    const redirectUri = `${SUPABASE_URL}/functions/v1/meta-oauth-callback`;
    const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${META_APP_ID}&redirect_uri=${encodeURIComponent(redirectUri)}&client_secret=${META_APP_SECRET}&code=${code}`;

    const tokenRes = await fetch(tokenUrl);
    const tokenData = await tokenRes.json();

    if (tokenData.error) {
      throw new Error(tokenData.error.message || "Failed to exchange code for token");
    }

    // Exchange for long-lived token
    const longLivedUrl = `https://graph.facebook.com/v21.0/oauth/access_token?grant_type=fb_exchange_token&client_id=${META_APP_ID}&client_secret=${META_APP_SECRET}&fb_exchange_token=${tokenData.access_token}`;
    const longLivedRes = await fetch(longLivedUrl);
    const longLivedData = await longLivedRes.json();

    const accessToken = longLivedData.access_token || tokenData.access_token;
    const expiresIn = longLivedData.expires_in || 5184000; // 60 days default

    // Get Facebook pages
    const pagesRes = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`);
    const pagesData = await pagesRes.json();

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString();

    // Save Facebook connection
    await supabase.from("social_connections").upsert({
      user_id: userId,
      platform: "facebook",
      access_token: accessToken,
      page_id: pagesData.data?.[0]?.id || null,
      expires_at: expiresAt,
    }, { onConflict: "user_id,platform" });

    // If user has Instagram linked to a page, save that too
    if (pagesData.data?.length > 0) {
      const pageToken = pagesData.data[0].access_token;
      const igRes = await fetch(`https://graph.facebook.com/v21.0/${pagesData.data[0].id}?fields=instagram_business_account&access_token=${pageToken}`);
      const igData = await igRes.json();

      if (igData.instagram_business_account?.id) {
        await supabase.from("social_connections").upsert({
          user_id: userId,
          platform: "instagram",
          access_token: pageToken,
          page_id: igData.instagram_business_account.id,
          expires_at: expiresAt,
        }, { onConflict: "user_id,platform" });
      }
    }

    // Redirect back to app settings page
    const appUrl = Deno.env.get("SITE_URL") || "https://id-preview--0fd004a2-f25d-4893-bc99-5bccf4a3c51f.lovable.app";
    return Response.redirect(`${appUrl}/parametres?meta=success`, 302);

  } catch (error) {
    console.error("Meta OAuth error:", error);
    const appUrl = Deno.env.get("SITE_URL") || "https://id-preview--0fd004a2-f25d-4893-bc99-5bccf4a3c51f.lovable.app";
    return Response.redirect(`${appUrl}/parametres?meta=error`, 302);
  }
});
