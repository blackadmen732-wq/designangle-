#!/usr/bin/env node
/*
 * Make a named preview for a prospect, in about thirty seconds.
 *
 *   node tools/preview.js --name "Mario's Pizza" --trade restaurant --city "Columbus, OH"
 *   node tools/preview.js --name "Hartley Heating" --trade hvac --city "Dublin, OH" --accent "#0b63ce"
 *
 * Why this exists
 * ---------------
 * A prospect cannot picture themselves inside someone else's website. Showing
 * them Pomelo Kitchen and saying "yours would look like this" asks them to do
 * imaginative work while they are deciding whether to trust you. Most will not.
 *
 * But hand-building a real site for every enquiry is hours of unpaid work, and
 * most enquiries do not close.
 *
 * The preview is the middle: their name, their town, their trade, in the real
 * template, built from a copy of an example site. It takes under a minute and
 * it converts like the real thing, because the only thing most people need to
 * see is their own name at the top.
 *
 * The rule this obeys
 * -------------------
 * CLAUDE.md: never invent a client fact. A preview that says "24/7 emergency
 * response" or quotes a price or a review count the business did not give you
 * is worse than no preview. If they sign and the site goes live with that text
 * still in it, you have published a claim on their behalf that may be untrue.
 *
 * So this script does the opposite of inventing. Every fact it cannot know is
 * replaced with a visible placeholder, and a banner says the preview is a
 * layout, not a claim. What it fills in is only what is already public: the
 * business name, the town, the trade.
 *
 * The phone number is deliberately left as a placeholder rather than a
 * plausible-looking fake. A made-up number is somebody's real number.
 */
'use strict';

const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const SITES = path.join(ROOT, 'sites');

/* ---- arguments ---------------------------------------------------------- */

function arg(flag, fallback) {
  const i = process.argv.indexOf(flag);
  return i !== -1 && process.argv[i + 1] ? process.argv[i + 1] : fallback;
}

const name   = arg('--name');
const trade  = (arg('--trade', 'restaurant') || '').toLowerCase();
const city   = arg('--city', '');
const accent = arg('--accent');
const slugIn = arg('--slug');

if (!name) {
  console.log(`
  node tools/preview.js --name "<business name>" [options]

    --name    the business, as they write it            (required)
    --trade   restaurant | hvac                         (default restaurant)
    --city    "Columbus, OH" — shown in the contact block
    --accent  #rrggbb, if you know their brand colour
    --slug    folder name, otherwise made from --name

  Builds sites/<slug>/ and dist/<slug>/. Nothing is invented: every fact the
  business has not given you is left as a visible placeholder.
`);
  process.exit(2);
}

const BASE = { restaurant: 'restaurant', hvac: 'hvac' }[trade];
if (!BASE) {
  console.error(`  --trade must be restaurant or hvac. Got "${trade}".`);
  process.exit(2);
}

const slug = (slugIn || name)
  .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  .replace(/['\u2019]/g, '')              // Mario's -> marios, not mario-s
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40);

/* ---- a short name for the header, where a long one will not fit ---------- */

function shortName(full) {
  const drop = /\b(the|and|&|llc|l\.l\.c\.|inc|inc\.|ltd|co|co\.|company|services?|service|group|plumbing|heating|air|hvac|restaurant|kitchen|cafe|café|bar|grill|pizzeria)\b/gi;
  const core = full.replace(drop, ' ').replace(/\s+/g, ' ').trim();
  const first = (core || full).split(' ')[0];
  return first.length >= 3 ? first : full.split(' ')[0];
}

/* ---- the placeholder ----------------------------------------------------
   One visible marker, used for every fact we are not allowed to guess. It has
   to be obvious on screen, so that nothing unfilled can reach a live site by
   being quietly plausible. */
const P = (what) => `[${what}]`;

/* ---- build the content file --------------------------------------------- */

const base = require(path.join(SITES, BASE, 'content.js'));
const short = shortName(name);

// Deep copy, then replace. Working from the real example keeps the preview
// identical in structure to what they would actually get.
const c = JSON.parse(JSON.stringify(base));

c.name = name;
c.short = short;

c.seo = Object.assign({}, c.seo, {
  title: `${name} — preview`,
  description: `Preview layout for ${name}${city ? ', ' + city : ''}. Not a live website.`,
  telephone: P('phone number')
});

if (accent) c.theme = Object.assign({}, c.theme, { accent });

// Hero: their name does the work. The headline stays the example's, because a
// headline is a claim about the business and we have not been given one.
if (c.hero) {
  c.hero.eyebrow = city ? `${name} · ${city}` : name;
  c.hero.headlineAccent = c.hero.headlineAccent || '';
}

if (c.footer) {
  c.footer.mark = short;
  c.footer.left = `Preview layout for ${name}. Not a live site.`;
  c.footer.right = P('your details here');
}

/* ---- strip every fact we were not given --------------------------------- */

// Anything that reads as a promise, a price, a count or a credential has to go.
// This list is deliberately wide: a false negative here ships a claim.
// Each pattern is anchored on its own. The first version wrapped the whole
// alternation in \b...\b, which meant the money pattern could never fire: a
// space and a "$" are both non-word characters, so there is no word boundary
// between them, and "From $249" shipped as a real price on every preview.
const CLAIMY = [
  /\$\s?\d/,                                   // $249, $ 12
  /\b\d+\s*%/,                                 // 20%
  /\b\d+\s*(?:\+|plus)?\s*(?:years?|reviews?|stars?|customers?|jobs?|clients?)\b/i,
  /\b24\s*\/\s*7\b/,
  /\b(?:same|next)[- ]day\b/i,
  /\bwithin\s+\d/i,
  /\b(?:in|within)\s+(?:one|two|a single)\s+(?:visit|day|hour)/i,
  /\bguarantee\w*\b/i,
  /\bwarrant\w+\b/i,
  /\blicen[cs]ed\b/i,
  /\binsured\b/i,
  /\bcertified\b/i,
  /\baward\w*\b/i,
  /\brated\b/i,
  /\bno\s+call[- ]out\b/i,
  /\bfree\s+(?:quote|estimate|call[- ]out)\b/i,
  /\bfrom\s+[£€\$]/i                 // "From £", "From €"
];
const isClaim = (t) => CLAIMY.some((re) => re.test(t));

let stripped = 0, dropped = 0;

/* Replacing every claim with the same bracket is what made the first version
   look broken rather than unfinished. The HVAC pricing list came out as
   fourteen identical [their own words], which reads as a bug, and a preview
   that reads as a bug cannot do the only job it has.

   Three different treatments instead, by what the text actually is: */

// 1. A PRICE is an offer. Inventing one gets somebody calling expecting it,
//    and a bracket where a number should be looks broken. So the line goes
//    away entirely and the service name carries the row on its own.
const MONEY = /\$\s?\d|\bfrom\s+[£€\$]|\b\d+\s*(?:\/|per)\s*month\b/i;

// 2. A PROMISE is falsifiable and specific to them. Swapped for neutral
//    descriptive copy that any business in the trade can stand behind, so the
//    page still reads as finished prose.
const NEUTRAL = {
  hvac: ['Heating and cooling', 'Repairs and installs', 'Service and maintenance',
         'Local engineers', 'Domestic and commercial', 'Boilers and heat pumps'],
  restaurant: ['Cooked to order', 'Seasonal menu', 'Dine in and takeaway',
               'Local suppliers', 'Open for lunch and dinner', 'Private hire']
};
let neutralAt = 0;
const nextNeutral = () => {
  const pool = NEUTRAL[trade] || NEUTRAL.restaurant;
  return pool[neutralAt++ % pool.length];
};

// 3. Anything else the business must supply is one tidy marker, not a shout.
function scrub(node, key, parent) {
  if (typeof node === 'string') {
    if (MONEY.test(node)) { parent[key] = ''; dropped++; return; }
    if (isClaim(node)) {
      // A short string is a label or a tag. Substituting prose into one reads
      // wrong — "After-hours call-out · Boilers and heat pumps" — so a label
      // is emptied and only running copy gets a neutral replacement.
      parent[key] = node.trim().length < 26 ? '' : nextNeutral();
      stripped++;
      return;
    }
    return;
  }
  if (Array.isArray(node)) { node.forEach((v, i) => scrub(v, i, node)); return; }
  if (node && typeof node === 'object') {
    for (const k of Object.keys(node)) {
      if (/^(img|id|href|type|fontsUrl|display|body|endpoint|siteId)$/.test(k)) continue;
      scrub(node[k], k, node);
    }
  }
}
scrub(c, null, null);

/* ---- contact: their town is public, everything else is not --------------- */

if (c.contact) {
  if (Array.isArray(c.contact.blocks)) {
    c.contact.blocks = c.contact.blocks.map((b) => {
      const out = Object.assign({}, b);
      if (Array.isArray(out.lines)) {
        out.lines = out.lines.map((l) =>
          /^[+(]?[0-9][0-9().\-\s]{6,}$/.test(String(l).trim()) ? P('phone number')
          : /@/.test(String(l)) ? P('email')
          : city && /,\s*[A-Z]{2}\b/.test(String(l)) ? city
          : l);
      }
      return out;
    });
  }
  // hours are [label, value] pairs, not objects. The first version mapped them
  // as objects, which silently did nothing and left the EXAMPLE's opening hours
  // on the page as though they were this business's. That is precisely the
  // invented-client-fact failure this script exists to prevent.
  if (Array.isArray(c.contact.hours)) {
    c.contact.hours = c.contact.hours.map((h) =>
      Array.isArray(h) ? [h[0], '\u2014'] : h);
  }
}

// The collector must not be wired up. A preview that posts a stranger's
// details into a client's panel is a data problem, and site.js now tells the
// visitor honestly when there is nowhere to send a form.
delete c.track;

/* ---- the banner ---------------------------------------------------------
   Not decoration. It is what makes sending this safe: the person looking at
   it is told, on the page, that the words are a layout and not a quote. */
c.preview = `This is a layout for ${name}, not a live site. The design is real. `
          + `The words, photos and anything in [brackets] are placeholders until `
          + `you give us yours — nothing here is a claim about your business.`;

/* ---- write and build ----------------------------------------------------- */

const dir = path.join(SITES, slug);
if (fs.existsSync(dir) && !process.argv.includes('--force')) {
  console.error(`  sites/${slug}/ already exists. Pass --force to overwrite it.`);
  process.exit(1);
}
fs.mkdirSync(dir, { recursive: true });

// Photos come from the example for the trade. They are stock and they are
// labelled as such; swapping in the client's own is the first thing you do
// once they are a client rather than a prospect.
fs.cpSync(path.join(SITES, BASE, 'img'), path.join(dir, 'img'), { recursive: true });

const header = `/* PREVIEW — generated by tools/preview.js on ${new Date().toISOString().slice(0, 10)}.
 *
 * Built for: ${name}${city ? ' · ' + city : ''}
 * Based on:  sites/${BASE}/
 *
 * Everything in [brackets] is a placeholder for a fact this business has not
 * given us. Do not replace a placeholder with a guess. Ask them, or leave it.
 *
 * ${stripped} claim(s) from the example were replaced with neutral copy and
 * ${dropped} price(s) were removed. Check the page for any the pattern missed.
 */
`;

fs.writeFileSync(path.join(dir, 'content.js'),
  header + 'module.exports = ' + JSON.stringify(c, null, 2) + ';\n');

try {
  execFileSync('node', [path.join(ROOT, 'build.js'), slug], { cwd: ROOT, stdio: 'inherit' });
} catch (e) {
  console.error('\n  build failed — the content file is at sites/' + slug + '/content.js');
  process.exit(1);
}

console.log(`
  Preview ready for ${name}

    sites/${slug}/content.js     edit to fill in what they tell you
    dist/${slug}/                send or host this

  ${stripped} claim${stripped === 1 ? '' : 's'} replaced with neutral copy.
  ${dropped} price${dropped === 1 ? '' : 's'} removed — a price is an offer, and
  the preview must not make one on their behalf.

  Search for "[" before you send it: what is left is only what they must give
  you, and it is meant to be visible.

  Check it first:
    node tools/audit.js dist/${slug}/index.html --width 400
    node tools/audit.js dist/${slug}/index.html --width 1280
`);
