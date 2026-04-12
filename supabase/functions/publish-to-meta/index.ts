import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;

    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    const userId = user.id;

    const body = await req.json();
    const { platform, message, image_url } = body;

    if (!platform || !message) {
      return new Response(JSON.stringify({ error: "platform and message are required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Get the social connection for this platform
    const { data: connection, error: connError } = await supabase
      .from("social_connections")
      .select("access_token, page_id, expires_at")
      .eq("user_id", userId)
      .eq("platform", platform)
      .single();

    if (connError || !connection) {
      return new Response(JSON.stringify({ error: `No ${platform} connection found. Please connect your account in Settings.` }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check token expiration
    if (connection.expires_at && new Date(connection.expires_at) < new Date()) {
      return new Response(JSON.stringify({ error: "Token expired. Please reconnect your Meta account in Settings." }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const accessToken = connection.access_token;
    const pageId = connection.page_id;
    let result: any = {};

    if (platform === "facebook") {
      if (!pageId) {
        return new Response(JSON.stringify({ error: "No Facebook page linked." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get page access token
      const pagesRes = await fetch(`https://graph.facebook.com/v21.0/me/accounts?access_token=${accessToken}`);
      const pagesData = await pagesRes.json();
      const page = pagesData.data?.find((p: any) => p.id === pageId);
      const pageToken = page?.access_token || accessToken;

      if (image_url) {
        // Photo post
        const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/photos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url: image_url, message, access_token: pageToken }),
        });
        result = await res.json();
      } else {
        // Text post
        const res = await fetch(`https://graph.facebook.com/v21.0/${pageId}/feed`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ message, access_token: pageToken }),
        });
        result = await res.json();
      }
    } else if (platform === "instagram") {
      if (!pageId) {
        return new Response(JSON.stringify({ error: "No Instagram Business account linked." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (!image_url) {
        return new Response(JSON.stringify({ error: "Instagram requires an image URL to publish." }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Step 1: Create media container
      const containerRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}/media`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          image_url,
          caption: message,
          access_token: accessToken,
        }),
      });
      const containerData = await containerRes.json();

      if (containerData.error) {
        throw new Error(containerData.error.message);
      }

      // Step 2: Publish the container
      const publishRes = await fetch(`https://graph.facebook.com/v21.0/${pageId}/media_publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          creation_id: containerData.id,
          access_token: accessToken,
        }),
      });
      result = await publishRes.json();
    }

    if (result.error) {
      throw new Error(result.error.message || JSON.stringify(result.error));
    }

    return new Response(JSON.stringify({ success: true, result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Publish error:", error);
    return new Response(JSON.stringify({ error: error.message || "Publication failed" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
