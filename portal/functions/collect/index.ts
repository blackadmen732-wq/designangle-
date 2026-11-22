// Collector: the only way a website writes to the portal database.
//
// Websites are public static files, so they can never hold a database key.
// They post here, this function validates everything, and only this function
// talks to the database using the service role key from the environment.
//
// Deploy with verify_jwt disabled: visitors are anonymous.

import { createClient } from "jsr:@supabase/supabase-js@2";

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "POST, OPTIONS",
};

// Only these are accepted. An unknown kind is dropped, so a stray script
// cannot fill the table with junk categories.
const KINDS = new Set(["view", "call_tap", "form_submit", "book_click", "menu_view", "lead"]);
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const clip = (v: unknown, n: number) =>
  typeof v === "string" ? v.slice(0, n) : null;

// Sites are looked up once and remembered, so a flood of traffic does not
// become a flood of lookups.
const known = new Map<string, number>();
async function siteExists(id: string) {
  const hit = known.get(id);
  if (hit && Date.now() - hit < 300_000) return true;
  const { data } = await db.from("mk_sites").select("id").eq("id", id).maybeSingle();
  if (!data) return false;
  known.set(id, Date.now());
  return true;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "POST") return new Response("Method not allowed", { status: 405, headers: CORS });

  let body: Record<string, unknown>;
  try {
    const raw = await req.text();
    if (raw.length > 4000) return new Response("Too large", { status: 413, headers: CORS });
    body = JSON.parse(raw);
  } catch {
    return new Response("Bad JSON", { status: 400, headers: CORS });
  }

  const siteId = String(body.siteId ?? "");
  const kind = String(body.kind ?? "");
  if (!UUID.test(siteId) || !KINDS.has(kind)) {
    return new Response("Bad request", { status: 400, headers: CORS });
  }
  if (!(await siteExists(siteId))) {
    return new Response("Unknown site", { status: 404, headers: CORS });
  }

  // A lead carries the person's own details, so it is stored apart from the
  // anonymous event stream and is the only place personal data is kept.
  if (kind === "lead") {
    const name = clip(body.name, 120);
    if (!name) return new Response("Missing name", { status: 400, headers: CORS });
    const { error } = await db.from("mk_leads").insert({
      site_id: siteId,
      name,
      contact: clip(body.contact, 160),
      requested: clip(body.requested, 120),
      preferred: clip(body.preferred, 120),
      message: clip(body.message, 2000),
    });
    if (error) return new Response("Could not save", { status: 500, headers: CORS });
    return new Response(null, { status: 204, headers: CORS });
  }

  const meta = body.meta && typeof body.meta === "object" ? body.meta : {};
  const { error } = await db.from("mk_events").insert({
    site_id: siteId,
    kind,
    path: clip(body.path, 300),
    referrer: clip(body.referrer, 200),
    device: body.device === "phone" ? "phone" : "desktop",
    visitor: clip(body.visitor, 40),
    meta: JSON.stringify(meta).length > 1000 ? {} : meta,
  });
  if (error) return new Response("Could not save", { status: 500, headers: CORS });
  return new Response(null, { status: 204, headers: CORS });
});
