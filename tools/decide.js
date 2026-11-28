#!/usr/bin/env node
/*
 * Make the design decisions a brief implies, by rule, so the model building
 * the screen does not have to: the layout pattern, the figure's size, the
 * brand colour and what it may touch, the status tones, the picture, the
 * icons, what moves, and the second version for the final pass.
 *
 *   node tools/decide.js brief/<project>.md
 *
 * Prints a "Decisions" block. Paste it at the top of the screen's file as a
 * comment and build to it. Where a rule could not decide (no number in "the
 * one thing", no brand colour), it says so and gives the default. Change a
 * decision only for a reason you can write in one line next to it.
 *
 * Reads a brief written from brief/TEMPLATE.md, with "## 1. What it is"
 * headings, or the short form "1. What it is: ...". Desktop screens only for
 * now (app-style/desktop); phone screens follow .claude/skills/app-style.
 */
const fs = require('fs');
const path = require('path');

const file = process.argv[2];
if (!file || !fs.existsSync(file)) { console.error('Usage: node tools/decide.js brief/<project>.md'); process.exit(2); }
const text = fs.readFileSync(file, 'utf8');

// ---------------------------------------------------------------- the brief
const B = {};
const lines = text.split('\n');
let cur = null;
for (const raw of lines) {
  const l = raw.replace(/\*\*/g, '');
  const h = l.match(/^#{0,3}\s*(\d{1,2})\.\s*([^:*]+?)(?:\s*\*\(needed\)\*)?\s*(?::\s*(.*))?$/);
  if (h && +h[1] >= 1 && +h[1] <= 11) { cur = +h[1]; B[cur] = (h[3] || '').trim(); continue; }
  if (cur && l.trim() && !l.startsWith('---')) B[cur] = (B[cur] + ' ' + l.trim()).trim();
}
const what = (B[1] || '').toLowerCase(), job = (B[3] || ''), jobL = job.toLowerCase();
const brand = B[7] || '', art = B[10] || '', mood = (B[5] || '').toLowerCase();
const all = (what + ' ' + jobL);

// ---------------------------------------------------------------- pattern
const oneThing = (job.match(/one thing[:\s]+(.*)/i) || [, job])[1];
const figure = ((oneThing.match(/\$?\d[\d,.]*\s?%?/) || [])[0] || '').trim().replace(/[,.]+$/, '') || null;
let pattern, why;
if (/sign[ -]?in|log[ -]?in|sign[ -]?up|splash|password/.test(all)) { pattern = 'auth'; why = 'the job is getting in'; }
else if (/browse|watch|gallery|catalog|films?|series|shop front|products? to|collection/.test(all)) { pattern = 'media'; why = 'the job is choosing among pictures'; }
else if (/ways in|doors|launcher|get (back )?in(to)? (a |your )?(project|work)|start (one|a new|work)|open (a |your )?recent|recent projects/.test(all)) { pattern = 'doors'; why = 'the job is getting somewhere: ways in, and recent work'; }
else if (figure) { pattern = 'number'; why = `"the one thing" is a figure (${figure.trim()})`; }
else if (/launcher|studio|start (a|work)|open (a|recent)|doors|create/.test(all)) { pattern = 'doors'; why = 'the job is getting somewhere'; }
else { pattern = 'number'; why = 'no rule matched; "number" is the default for a home screen. Say so in the file'; }
const EX = { number: 'tally-home', doors: 'cinevora-home', auth: 'cinema-login', media: 'streaming-study' };

// ---------------------------------------------------------------- figure size
// The figure carries the screen: it should take about 40% of the stage's
// width. Fewer characters, bigger type; the scale stops at 160 and 72.
let figSize = null;
if (figure) {
  const chars = figure.replace(/\s/g, '').length;
  figSize = Math.max(72, Math.min(160, Math.round(440 / (chars * 0.62) / 4) * 4));
}

// ---------------------------------------------------------------- colour
function hex2rgb(h) { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map(c => c + c).join(''); return [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16)); }
function hue([r, g, b]) { r /= 255; g /= 255; b /= 255; const M = Math.max(r, g, b), m = Math.min(r, g, b), d = M - m; if (!d) return null; let h = M === r ? ((g - b) / d) % 6 : M === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; }
function lift([r, g, b]) {           // on near-black a brand colour needs to glow: raise it to a light enough value
  const L = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (L >= 0.45) return [r, g, b];
  const k = 0.45 / Math.max(L, 0.05);
  return [r, g, b].map(c => Math.min(255, Math.round(c * k)));
}
const hexM = brand.match(/#[0-9a-f]{6}\b|#[0-9a-f]{3}\b/i);
let colour = null;
if (hexM) {
  const rgb = hex2rgb(hexM[0]), up = lift(rgb), h = hue(rgb);
  const near = (a, b) => h != null && Math.min(Math.abs(h - a), 360 - Math.abs(h - a)) < 28;
  colour = {
    hex: hexM[0], rgb: up.join(' '), hexUp: '#' + up.map(c => c.toString(16).padStart(2, '0')).join(''), lifted: up.join() !== rgb.join(),
    late: near(38) || near(20) ? '255 107 107' : null,   // brand is amber or orange: late moves to red
    good: near(140) ? '94 214 220' : null                // brand is green: done moves to teal
  };
}

// ---------------------------------------------------------------- picture
let picture = null;
const dirM = art.match(/([\w./-]+\/img)\b/);
if (dirM && fs.existsSync(dirM[1])) {
  const imgs = fs.readdirSync(dirM[1]).filter(f => /\.(webp|jpe?g|png|avif)$/i.test(f));
  const rank = f => (/room|interior|hero|shop|store|studio|space|table|counter|window/.test(f) ? 0 : /team|work|kitchen/.test(f) ? 1 : 2);
  imgs.sort((a, b) => rank(a) - rank(b));
  picture = { dir: dirM[1], pick: imgs[0], others: imgs.slice(1, 4) };
} else if (/photo|picture|image|shot/i.test(art) && !/none/i.test(art)) picture = { dir: null };

// ---------------------------------------------------------------- icons
const WORLD = [
  [/flower|florist|bouquet|garden/, ['flower', 'truck', 'map-pin']],
  [/restaurant|osteria|cafe|café|bistro|kitchen|dinner|table|covers/, ['calendar', 'users', 'clock']],
  [/invoice|billing|payment|freelanc|accounting|finance|bank|budget/, ['receipt', 'dollar', 'trend-up']],
  [/deliver|courier|shipping|logistic|warehouse|order/, ['truck', 'box', 'map-pin']],
  [/shop|store|retail|e-?commerce|product/, ['bag', 'cart', 'box']],
  [/gym|fitness|studio class|yoga|class/, ['calendar', 'users', 'activity']],
  [/film|video|edit|render|creative|design|music|audio/, ['film', 'layers', 'sparkle']],
  [/ticket|support|help ?desk|issue/, ['alert', 'list', 'check']],
];
const icons = (WORLD.find(([re]) => re.test(what + ' ' + jobL)) || [, ['activity', 'list', 'clock']])[1];

// ---------------------------------------------------------------- motion
const MOTION = {
  number: 'sidebar from the left, side panels from the right, the rest rises in order (DG.enter); bars grow once; rows answer hover with light; streaks drift. Nothing loops but the light.',
  doors: 'sidebar from the left, panels from the right, tiles rise in order; tiles lift 4px and glow on hover, their arrow moves; streaks drift.',
  auth: 'the card rises once; fields brighten on focus; the white button glows on hover; the light sweeps once and rests.',
  media: 'the still pushes in slowly; rows rise in; cards lift, zoom and show play on hover.',
};

// ---------------------------------------------------------------- candidates
// Cheap layout candidates, scored by rule before anything is built, so only
// the winner gets built. Each candidate is a structure, not a recolour: it
// changes what leads, where the picture goes and how dense the list is.
// Scores use the critic's weights (tools/critic.json) on what the brief
// says: the figure's length, whether there is a picture, how long the list
// is, and whether the brand has a colour.
const modeArg = (process.argv.find(a => a.startsWith('--mode=')) || '--mode=pro').split('=')[1];
const MODES = { fast: { n: 1, repairs: 1, critic: 'basic' }, pro: { n: 3, repairs: 2, critic: 'detailed' }, studio: { n: 5, repairs: 5, critic: 'independent, two reviewers' } };
const mode = MODES[modeArg] || MODES.pro;
const content = (B[8] || '').toLowerCase();
const rowsAsked = Math.max(0, ...(content.match(/\d+/g) || ['0']).map(Number).filter(n => n < 60));
const longList = rowsAsked > 8 || /busy|many|dozens|all of today|every/.test(content + ' ' + jobL);
const hasPic = !!(picture && picture.dir);
const shortFig = figure ? figure.replace(/\D/g, '').length <= 3 : false;
const W = JSON.parse(fs.readFileSync(path.join(__dirname, 'critic.json'), 'utf8')).weights;
const C = {
  number: [
    { id: 'side', say: 'figure on the left, its button on the right of it, facts strip, list, side panels (tally-home as it is)',
      hier: 8, ident: 5 + (colour ? 1 : 0), use: 8, fit: !hasPic && !shortFig ? 2 : 0 },
    { id: 'stacked', say: 'the figure alone and centred (`<section class="figure stacked">`), button under it, the picture behind it in a `.scene`, then facts and list',
      hier: 9, ident: hasPic ? 9 : 6, use: 7, fit: (hasPic ? 2 : 0) + (shortFig ? 1 : 0) },
    { id: 'split', say: 'figure, button and facts in the left half; the picture fills the right half (`<main class="stage split">` with a `.scene`), the list under both',
      hier: 7, ident: hasPic ? 10 : 3, use: 7, fit: hasPic ? 1 : -3 },
    { id: 'list-first', say: 'a short figure strip at the top, the list leads and is dense (`.ledger.dense`, ten rows), side panels for what is urgent',
      hier: 6, ident: 5, use: 9, fit: longList ? 3 : -1 },
    { id: 'story', say: 'figure with its breakdown beside it in the stage (where it comes from), one side panel for the week, list below',
      hier: 7, ident: 6, use: 8, fit: /area|categor|split|by |across/.test(jobL + ' ' + content) ? 2 : 0 },
  ],
}[pattern];
let ranked = [];
if (C) {
  ranked = C.map(c => ({ ...c, score: Math.round((W.composition * c.hier + W.identity * c.ident + W.usability * c.use) / (W.composition + W.identity + W.usability) * 10 + c.fit * 3) / 10 }))
    .sort((a, b) => b.score - a.score).slice(0, mode.n);
}
const ALT = {
  doors: 'the welcome with the picture or light behind it and the tiles in one row of four larger tiles',
  auth: 'the card on the left third with the art filling the right two thirds',
  media: 'a taller billboard with one row under it, cards larger',
};

// ---------------------------------------------------------------- print
const name = (brand.match(/name\s+"?([^".,]+)"?/i) || brand.match(/"([^"]+)"/) || [, 'the product'])[1].trim();
const o = [];

o.push(`Decisions for ${name} (tools/decide.js, from ${path.basename(file)})`, '');
o.push(`Pattern:   ${pattern}, because ${why}. Start from app-style/examples/${EX[pattern]} for its structure; write your own words, figures and rows.`);
if (pattern === 'number') {
  o.push(`Figure:    "${figure ? figure.trim() : 'none found'}" in .figure .amount${figSize ? ` at ${figSize}px (style="font-size:${figSize}px")` : ''}; its label names it, the line under it says what is urgent in the warning tone, the one white button sits beside it.`);
  o.push(`           Under it: three facts in a .facts strip (never three cards). Then the list (.ledger), six rows at most. Side panels must add what the list does not: a .breakdown with .meter, and .bars over time.`);
}
if (colour) {
  o.push(`Colour:    ${colour.hex} -> <body class="dg" style="--accent: ${colour.rgb}${colour.late ? '; --late: ' + colour.late : ''}${colour.good ? '; --good: ' + colour.good : ''}">${colour.lifted ? ' (lifted so it glows on black)' : ''}.`);
  o.push(`           Light takes it too: color: '${colour.hexUp}' on the main DG.streaks line, '${colour.rgb}' as DG.glow's last argument. Nothing else is coloured; the white button stays white.`);
  if (colour.late) o.push(`           The brand is close to the warning tone, so "late" moves to red (--late above).`);
  if (colour.good) o.push(`           The brand is close to green, so "done" moves to teal (--good above).`);
} else o.push(`Colour:    no brand colour in the brief: stay monochrome (white light, white accent).`);
if (picture && picture.dir) o.push(`Picture:   .scene with ${picture.dir}/${picture.pick} behind the figure (first child of .stage).${picture.others.length ? ` Others for side panels or cards: ${picture.others.join(', ')}.` : ''}`);
else if (picture) o.push(`Picture:   the brief mentions photos but no folder: leave a .scene slot with a comment saying which photo goes there.`);
else o.push(`Picture:   none supplied: no .scene; the light is drawn (DG.streaks, DG.glow). Never a stock photo.`);
o.push(`Icons:     ${icons.map(i => '#i-' + i).join(', ')}: the first in the figure's label, the rest in the nav.`);
o.push(`Brand:     "${name}" as .brand-word unless a logo file is supplied.`);
o.push(`Motion:    ${MOTION[pattern]}${/calm|quiet|still/.test(mood) ? ' Keep it at that; the brief says calm.' : ''}`);
if (ranked.length) {
  o.push(`Mode:      ${modeArg}: ${mode.n} layout candidate(s), ${mode.repairs} repair pass(es), ${mode.critic} review.`);
  ranked.forEach((c, i) => o.push(`${i ? '          ' : 'Layouts:  '} ${i + 1}. ${c.id} (${c.score}): ${c.say}${i ? '' : '  <- build this one'}`));
  if (longList) o.push(`Density:   the brief has a long list (${rowsAsked || 'many'} items): use .ledger.dense and "View all" after ten rows.`);
} else o.push(`Version B: ${ALT[pattern]}. Build it only for the final pass (README, "Final pass").`);
o.push(`Check:     node tools/check.js <page>; node tools/slop.js <page> --desktop; look at the screenshots.`);
console.log(o.join('\n'));
