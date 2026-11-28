// "Do you come out to me, and how far is it?" answered before the customer
// picks a time.
//
// Takes either a ZIP, or coordinates from the browser's own location button.
// Coordinates are resolved to the nearest ZIP we already hold, so the phone
// can answer the question with no geocoding service involved.
//
// This costs nothing to run. Distance between two points is arithmetic, and
// the ZIP coordinates are public Census data held locally. No maps key, no
// per-lookup fee, no rate limit.
//
// The drive time is an ESTIMATE, not a routed one. Roads are longer than a
// straight line, so distance is multiplied by the account's road factor. For
// a real routed time, put a routing engine behind this same response shape.
//
// KNOWN BUG, still live as deployed version 2: the minutes below divide by a
// flat avg_speed_mph, which treats a 110-mile motorway run as the same speed
// as a two-mile town errand and reported 242 minutes for a 110-minute drive.
// mk_drive_minutes() in portal/schema.sql is the fix — it tapers speed with
// distance — and this function has not yet been changed to call it.

import { createClient } from "jsr:@supabase/supabase-js@2";

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const CORS = {
  "access-control-allow-origin": "*",
  "access-control-allow-headers": "content-type",
  "access-control-allow-methods": "GET, OPTIONS",
  "content-type": "application/json",
  "cache-control": "public, max-age=300",
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// A located point further than this from any ZIP centre is not a useful
// answer: out at sea, or somewhere with no nearby postal area.
const MAX_SNAP_MILES = 12;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: CORS });
  if (req.method !== "GET") return new Response("{}", { status: 405, headers: CORS });

  const q = new URL(req.url).searchParams;
  const siteId = q.get("siteId") ?? "";
  if (!UUID.test(siteId)) {
    return Response.json({ error: "bad_site" }, { status: 400, headers: CORS });
  }

  const { data: site } = await db.from("mk_sites")
    .select("account_id, mk_accounts(base_lat, base_lon, service_radius, road_factor, avg_speed_mph)")
    .eq("id", siteId).maybeSingle();

  const acct = site?.mk_accounts as Record<string, unknown> | undefined;
  if (!acct) return Response.json({ error: "unknown_site" }, { status: 404, headers: CORS });

  // A business that has not set a base cannot judge distance. Say so plainly
  // rather than inventing a number or silently accepting every address.
  if (acct.base_lat == null || acct.base_lon == null) {
    return Response.json({ status: "not_configured", message: "We will confirm your address when we call." }, { headers: CORS });
  }

  let zip = (q.get("zip") ?? "").trim().slice(0, 5);
  let located = false;

  // Coordinates from the browser's location button.
  const latRaw = q.get("lat"), lonRaw = q.get("lon");
  if (!zip && latRaw && lonRaw) {
    const lat = Number(latRaw), lon = Number(lonRaw);
    if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      return Response.json({ status: "invalid_point", message: "We could not read that location." }, { headers: CORS });
    }
    const { data: near } = await db.rpc("mk_nearest_zip", { in_lat: lat, in_lon: lon });
    const hit = Array.isArray(near) ? near[0] : null;
    if (!hit || Number(hit.miles) > MAX_SNAP_MILES) {
      return Response.json({ status: "unknown_zip", message: "We could not match that location to a ZIP code. Type it instead." }, { headers: CORS });
    }
    zip = String(hit.zip);
    located = true;
  }

  if (!/^\d{5}$/.test(zip)) {
    return Response.json({ status: "invalid_zip", message: "Enter a 5-digit ZIP code." }, { headers: CORS });
  }

  const { data: point } = await db.from("mk_zip_points")
    .select("lat, lon").eq("zip", zip).maybeSingle();

  if (!point) {
    return Response.json({ status: "unknown_zip", message: "We could not find that ZIP code. Check it, or call us." }, { headers: CORS });
  }

  const { data: d } = await db.rpc("mk_miles", {
    lat1: acct.base_lat, lon1: acct.base_lon, lat2: point.lat, lon2: point.lon,
  });

  const straight = Number(d);
  const factor = Number(acct.road_factor ?? 1.3);
  const speed = Number(acct.avg_speed_mph ?? 32);
  const roadMiles = Math.round(straight * factor);
  const minutes = Math.max(5, Math.round((straight * factor / speed) * 60 / 5) * 5);
  const radius = acct.service_radius == null ? null : Number(acct.service_radius);
  const inArea = radius == null ? true : straight <= radius;

  return Response.json({
    status: inArea ? "in_area" : "outside_area",
    zip,
    located,
    straight_miles: Math.round(straight * 10) / 10,
    road_miles: roadMiles,
    drive_minutes: minutes,
    estimate: true,
    message: inArea
      ? `Yes, we cover ${zip}. That is about ${roadMiles} miles from us, roughly ${minutes} minutes' drive.`
      : `${zip} is about ${roadMiles} miles away, outside our usual ${radius}-mile area. Send the form anyway and we will tell you if we can come.`,
  }, { headers: CORS });
});
