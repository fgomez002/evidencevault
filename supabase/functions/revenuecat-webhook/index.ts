// EvidenceVault — RevenueCat webhook (Supabase Edge Function, Deno).
//
// Keeps profiles.subscription_tier in sync with App Store / Google Play
// subscription state so server-side logic can trust the tier. The mobile app
// still reads entitlements directly from RevenueCat for instant UX; this is the
// durable source of truth.
//
// Deployed with verify_jwt = false because RevenueCat (not a Supabase user)
// calls it. It authenticates with a shared secret you configure in BOTH places:
//   RevenueCat dashboard → Integrations → Webhooks → Authorization header
//   supabase secrets set REVENUECAT_WEBHOOK_AUTH=some-long-random-string
//
// We use the service-role key (auto-injected) to update the row past RLS.

import { createClient } from "@supabase/supabase-js";

// Event types that mean the user currently has premium access.
const GRANTS = new Set([
  "INITIAL_PURCHASE",
  "RENEWAL",
  "UNCANCELLATION",
  "PRODUCT_CHANGE",
  "NON_RENEWING_PURCHASE",
  "SUBSCRIPTION_EXTENDED",
]);
// Event types that revoke access.
const REVOKES = new Set(["EXPIRATION", "SUBSCRIPTION_PAUSED"]);

Deno.serve(async (req) => {
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405 });

  const expected = Deno.env.get("REVENUECAT_WEBHOOK_AUTH");
  if (!expected || req.headers.get("Authorization") !== expected) {
    return new Response("Unauthorized", { status: 401 });
  }

  try {
    const payload = await req.json();
    const event = payload?.event ?? {};
    const appUserId: string | undefined = event.app_user_id;
    const type: string | undefined = event.type;
    if (!appUserId || !type) return new Response("Ignored", { status: 200 });

    let tier: "premium" | "free" | null = null;
    if (GRANTS.has(type)) tier = "premium";
    else if (REVOKES.has(type)) tier = "free";
    if (!tier) return new Response("No-op", { status: 200 });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error } = await supabase
      .from("profiles")
      .update({ subscription_tier: tier })
      .eq("id", appUserId);
    if (error) return new Response(error.message, { status: 500 });

    return new Response(JSON.stringify({ ok: true, tier }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response((e as Error).message ?? "error", { status: 500 });
  }
});
