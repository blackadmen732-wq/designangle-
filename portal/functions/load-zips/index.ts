// One-off loader for US ZIP centroids from the Census Bureau Gazetteer
// (public domain). Runs server-side so the data never passes through a
// client. Requires a valid JWT, so it is not open to the internet.
//
// Safe to run more than once: rows conflict on zip and are skipped.

import { createClient } from "jsr:@supabase/supabase-js@2";

const db = createClient(
  Deno.env.get("SUPABASE_URL")!,
  Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  { auth: { persistSession: false } },
);

const SRC = "https://www2.census.gov/geo/docs/maps-data/data/gazetteer/2024_Gazetteer/2024_Gaz_zcta_national.zip";

Deno.serve(async () => {
  const res = await fetch(SRC);
  if (!res.ok) {
    return Response.json({ ok: false, step: "download", status: res.status }, { status: 502 });
  }

  // The archive holds one tab-separated text file. Read its single deflate
  // stream directly rather than pulling in a zip library.
  const buf = new Uint8Array(await res.arrayBuffer());
  const dv = new DataView(buf.buffer);
  if (dv.getUint32(0, true) !== 0x04034b50) {
    return Response.json({ ok: false, step: "parse", reason: "not a zip" }, { status: 500 });
  }

  const flag = dv.getUint16(6, true);
  const method = dv.getUint16(8, true);
  const csize = dv.getUint32(18, true);
  const nameLen = dv.getUint16(26, true);
  const extraLen = dv.getUint16(28, true);
  const start = 30 + nameLen + extraLen;

  // The compressed size must come from the header. Slicing to the end of the
  // file instead feeds the central directory into the decoder, which fails
  // with "failed to write whole buffer".
  if (flag & 8 || csize === 0) {
    return Response.json({ ok: false, step: "parse", reason: "size only in data descriptor" }, { status: 500 });
  }
  const body = buf.slice(start, start + csize);

  let text: string;
  if (method === 0) {
    text = new TextDecoder("utf-8").decode(body);
  } else if (method === 8) {
    const stream = new Blob([body]).stream()
      .pipeThrough(new DecompressionStream("deflate-raw"));
    text = await new Response(stream).text();
  } else {
    return Response.json({ ok: false, step: "parse", method }, { status: 500 });
  }

  const rows: { zip: string; lat: number; lon: number }[] = [];
  const lines = text.split("\n");
  for (let i = 1; i < lines.length; i++) {
    const p = lines[i].split("\t");
    if (p.length < 7) continue;
    const zip = p[0].trim();
    const lat = Number(p[5].trim());
    const lon = Number(p[6].trim());
    if (/^\d{5}$/.test(zip) && Number.isFinite(lat) && Number.isFinite(lon)) {
      rows.push({ zip, lat: Math.round(lat * 1e5) / 1e5, lon: Math.round(lon * 1e5) / 1e5 });
    }
  }
  if (rows.length < 20000) {
    return Response.json({ ok: false, step: "parse", parsed: rows.length }, { status: 500 });
  }

  let written = 0;
  const BATCH = 2000;
  for (let i = 0; i < rows.length; i += BATCH) {
    const slice = rows.slice(i, i + BATCH);
    const { error } = await db.from("mk_zip_points")
      .upsert(slice, { onConflict: "zip", ignoreDuplicates: true });
    if (error) {
      return Response.json({ ok: false, step: "insert", at: i, error: error.message }, { status: 500 });
    }
    written += slice.length;
  }

  const { count } = await db.from("mk_zip_points").select("zip", { count: "exact", head: true });
  return Response.json({ ok: true, parsed: rows.length, written, total_in_table: count });
});
