#!/usr/bin/env node
/*
 * Refuse to launch a site that still has somebody else's words in it.
 *
 *   node tools/launch-check.js hartley-heating
 *   node tools/launch-check.js                   # every site in sites/
 *
 * Why this and not a rule about previews
 * --------------------------------------
 * A preview should look finished. Filling it with visible placeholders makes
 * it look broken instead, and a preview that looks broken cannot do the one
 * job it has. So tools/preview.js makes a page that reads as real: neutral
 * copy, no invented prices, no invented promises.
 *
 * The actual risk was never the preview. It is the preview quietly becoming
 * the live site. The prospect says yes, a few things get filled in, it ships —
 * and the parts nobody got to are still example text about a business that
 * does not exist. Now a real company is publicly advertising a response time
 * it cannot meet or a price it does not charge, and it is the client who
 * carries that, and the client who blames you for it.
 *
 * So the check belongs at launch, where it is cheap to obey and catches the
 * one case that matters. Exit code 1 means do not ship.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SITES = path.join(ROOT, 'sites');

// Sites that are meant to contain example content and are never launched.
// Named here on purpose, not detected from the "EXAMPLE CONTENT" header: a
// client's site begun as a copy of an example keeps that header, and must
// still be checked. A new example site goes in this list; a stale list only
// checks too much.
const EXAMPLES = new Set(['restaurant', 'hvac', 'salon', 'meditation', 'barber', 'ninefold']);

/* Things that must not reach a live client site. ------------------------- */

const BLOCKERS = [
  { id: 'placeholder',
    re: /\[(?:phone number|email|your hours|your details here|their own words|brackets|[a-z][a-z ]{2,24})\]/i,
    why: 'a preview placeholder is still in the content' },

  { id: 'preview-banner',
    re: /this is a layout for/i,
    why: 'the preview banner is still on. Delete the `preview` key from content.js' },

  { id: 'example-phone',
    re: /\(?555\)?[\s.-]?01[05]/,
    why: '555-01xx is the example phone number' },

  { id: 'example-domain',
    re: /@(?:pomelokitchen|northwindhvac)\.exam|\.example\b|\.test\b/i,
    why: 'an example email or domain' },

  { id: 'demo-note',
    re: /\bdemonstration site\b|\bdemo panel\b|\bthis is a preview\b/i,
    why: "the example form's demo note: say what really happens to a request" },

  { id: 'lorem',
    re: /\blorem ipsum\b|\bTODO\b|\bFIXME\b|\bXXX\b/i,
    why: 'placeholder or note text' }
];

/* A claim is not blocked — the client is entitled to make claims about their
   own business. It is flagged, so somebody confirms they actually said it. */
const CONFIRM = [
  { id: 'promise', re: /\b24\s*\/\s*7\b|\b(?:same|next)[- ]day\b|\bwithin\s+\d|\bguarantee\w*/i,
    why: 'a promise about service' },
  { id: 'credential', re: /\blicen[cs]ed\b|\binsured\b|\bcertified\b|\baward\w*/i,
    why: 'a credential' },
  { id: 'price', re: /\$\s?\d|\bfrom\s+[£€\$]/i,
    why: 'a price' },
  { id: 'count', re: /\b\d+\s*(?:\+|plus)?\s*(?:years?|reviews?|stars?|customers?)\b/i,
    why: 'a count or a rating' }
];

function textOf(site) {
  const file = path.join(SITES, site, 'content.js');
  if (!fs.existsSync(file)) return null;
  delete require.cache[require.resolve(file)];
  const c = require(file);
  const out = [];
  (function walk(n) {
    if (typeof n === 'string') { out.push(n); return; }
    if (Array.isArray(n)) { n.forEach(walk); return; }
    if (n && typeof n === 'object') Object.values(n).forEach(walk);
  })(c);
  return { lines: out, content: c };
}

/* What the example sites say about themselves. A client site begins as a copy
   of one (tools/preview.js), so anything still carried over is a fact about a
   business that does not exist, presented as the client's: the example's
   name, its street address, a sentence written for it. Read from the example
   sites themselves, so a new example is covered the day it is added. The
   first version knew two full names, so "Everything at Pomelo passes through
   a single oak-fired oven" would have shipped. */
let examples = null;
// Keys that hold no words a visitor reads as a claim: the design (fonts,
// colours), file names, links, a photo's description (true for as long as the
// photo is used, on anyone's site) and the page's structure.
const NOT_WORDS = /^(theme|img|href|id|type|layout|lang|kind|sections|alt|tint)$/;
function exampleText() {
  if (examples) return examples;
  const names = new Set(), places = new Set(), prose = new Set();
  for (const ex of EXAMPLES) {
    const got = textOf(ex);
    if (!got) continue;
    const c = got.content;
    for (const n of [c.name, c.short, c.footer && c.footer.mark]) if (n && String(n).length > 2) names.add(String(n));
    for (const b of (c.contact && c.contact.blocks) || []) for (const l of b.lines || []) places.add(String(l).trim());
    const a = (c.seo && c.seo.address) || {};
    for (const k of ['streetAddress', 'postalCode']) if (a[k]) places.add(String(a[k]).trim());
    // Sentences, from 24 characters up ("Evenings, weekends and holidays."
    // is a promise in 31). Not a photo's description, which stays true for as
    // long as the photo does, and not the form's own words ("Add your name so
    // we know who to ask for"), which fit any business; the form's demo note
    // is a blocker of its own above.
    (function walk(n, key, inForm) {
      if (typeof n === 'string') { if (!inForm && n.trim().length >= 24) prose.add(n.trim()); return; }
      if (Array.isArray(n)) { n.forEach((v) => walk(v, key, inForm)); return; }
      if (n && typeof n === 'object') for (const [k, v] of Object.entries(n)) if (!NOT_WORDS.test(k)) walk(v, k, inForm || k === 'form');
    })(c);
  }
  // The preview bases (tools/preview-bases/) say nothing untrue of a trade,
  // but nothing in them came from the client either: each sentence is listed
  // for somebody to confirm it describes this business, or to rewrite it.
  const neutral = new Set();
  const bases = path.join(ROOT, 'tools', 'preview-bases');
  for (const f of fs.existsSync(bases) ? fs.readdirSync(bases) : []) {
    if (!f.endsWith('.js')) continue;
    const b = require(path.join(bases, f));
    (function walk(n, key, inForm) {
      if (typeof n === 'string') { if (!inForm && n.trim().length >= 16 && !/^\[/.test(n.trim())) neutral.add(n.trim()); return; }
      if (Array.isArray(n)) { n.forEach((v) => walk(v, key, inForm)); return; }
      if (n && typeof n === 'object') for (const [k, v] of Object.entries(n)) if (!NOT_WORDS.test(k)) walk(v, k, inForm || k === 'form');
    })(b);
  }
  return (examples = { names, places, prose, neutral });
}
const escRe = (t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

function check(site) {
  const got = textOf(site);
  if (!got) return { site, missing: true };

  const blocked = [], confirm = [];
  for (const line of got.lines) {
    for (const b of BLOCKERS) if (b.re.test(line)) blocked.push({ ...b, line });
    for (const c of CONFIRM) if (c.re.test(line)) confirm.push({ ...c, line });
  }
  if (!EXAMPLES.has(site)) {
    const ex = exampleText();
    const own = `${got.content.name || ''} ${got.content.short || ''}`;
    for (const line of got.lines) {
      for (const n of ex.names) {
        if (own.includes(n)) continue;   // their name happens to contain an example's
        if (new RegExp(`(^|[^\\w])${escRe(n)}([^\\w]|$)`, 'i').test(line))
          blocked.push({ id: 'example-name', why: `"${n}" is an example business, not this one`, line });
      }
      if (ex.places.has(line.trim()))
        blocked.push({ id: 'example-place', why: "an example site's address, not this business's", line });
      else if (ex.prose.has(line.trim()))
        blocked.push({ id: 'example-copy', why: 'written for an example business: rewrite it in their words, or delete it', line });
      else if (ex.neutral.has(line.trim()))
        confirm.push({ id: 'preview-copy', why: 'preview wording, not theirs', line });
    }
  }
  if (got.content.preview) {
    blocked.push({ id: 'preview-key', why: 'content.js still has a `preview` key',
                   line: String(got.content.preview).slice(0, 60) });
  }
  return { site, blocked, confirm };
}

/* ---- run ---------------------------------------------------------------- */

const wanted = process.argv.slice(2).filter((a) => a[0] !== '-');
const sites = (wanted.length ? wanted : fs.readdirSync(SITES))
  .filter((n) => fs.existsSync(path.join(SITES, n, 'content.js')));

let failed = 0;

for (const site of sites) {
  if (!wanted.length && EXAMPLES.has(site)) continue;   // examples are meant to be examples

  const r = check(site);
  if (r.missing) { console.log(`\n  ${site}: no content.js`); continue; }

  const uniqB = [...new Map(r.blocked.map((x) => [x.id + x.line, x])).values()];
  const uniqC = [...new Map(r.confirm.map((x) => [x.id + x.line, x])).values()];

  console.log(`\n  ${site}`);

  if (!uniqB.length && !uniqC.length) { console.log('    ready to launch.'); continue; }

  if (uniqB.length) {
    failed++;
    console.log(`    DO NOT LAUNCH — ${uniqB.length} blocker${uniqB.length === 1 ? '' : 's'}`);
    for (const b of uniqB) {
      console.log(`      ${b.why}`);
      console.log(`        "${String(b.line).trim().slice(0, 64)}"`);
    }
  }

  if (uniqC.length) {
    console.log(`    confirm with the client — ${uniqC.length} claim${uniqC.length === 1 ? '' : 's'}`);
    for (const c of uniqC) {
      console.log(`      ${c.why}: "${String(c.line).trim().slice(0, 56)}"`);
    }
    console.log('      Each of these is a statement the client is responsible for.');
    console.log('      It is fine to ship — once they have actually said it.');
  }
}

if (failed) {
  console.log(`\n  ${failed} site${failed === 1 ? '' : 's'} not ready.\n`);
  process.exit(1);
}
const checked = sites.filter((n) => wanted.length || !EXAMPLES.has(n));
console.log(checked.length
  ? `\n  ${checked.length} site${checked.length === 1 ? '' : 's'} ready to launch.\n`
  : `\n  No client sites yet: the ${EXAMPLES.size} in sites/ are examples. Name one to check it anyway.\n`);
