// Public read of the details an owner can change themselves: phone, hours,
// and a closure notice. Websites fetch this on load.
//
// Read-only, one site at a time, and it returns nothing else about the
// business. Deployed with verify_jwt disabled because visitors are anonymous.

import { createClient } from "jsr:@supabase/supabase-js@2";

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "GET, OPTIONS",
  "content-type": "application/json",
  // A minute of caching keeps a busy site off the database without making an
  // hours change wait long to appear.
  "cache-control": "public, max-age=60",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "GET") return new Response("{}", { status: 405, headers: CORS });

  const siteId = new URL(req.url).searchParams.get("siteId") ?? "";
  if (!UUID.test(siteId)) return new Response("{}", { status: 400, headers: CORS });

  const { data } = await db
    .from("mk_site_settings")
    .select("phone, hours, notice, notice_until, updated_at")
    .eq("site_id", siteId)
    .maybeSingle();

  if (!data) return new Response("{}", { headers: CORS });

  // A notice past its date is simply not sent, so an owner who forgets to
  // clear it does not leave a stale "Closed for the holidays" on the site.
  const expired = data.notice_until && new Date(data.notice_until + "T23:59:59") < new Date();
  return new Response(JSON.stringify({
    phone: data.phone ?? null,
    hours: Array.isArray(data.hours) ? data.hours : [],
    notice: expired ? null : (data.notice || null),
    updated_at: data.updated_at,
  }), { headers: CORS });
});
