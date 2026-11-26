#!/usr/bin/env node
/*
 * The unslop audit: does this page look AI-made, and what is the one thing
 * to fix first?
 *
 *   node tools/slop.js app-style/screens/sign-in.html
 *   node tools/slop.js dist/hvac            a folder means its index.html
 *   node tools/slop.js portal/app           the owner panel, with sample data
 *   node tools/slop.js page.html --desktop  1280 x 900 instead of a phone
 *   node tools/slop.js http://localhost:8000/  a running app, as it is
 *
 * Scores the page against the 18 points in "18 things to give to Claude to
 * unslop your website" (@julianxuofficial), reading the rendered page rather
 * than the code, then names the BOTTLENECK: the failing point that costs
 * the most, weighted by how much it shows. Fix that one, run it again.
 *
 * 15 of the 18 are measured. Three are judgement (8 benefits first, 9
 * specific copy, 18 premium assets): for those it measures what it can
 * (hype words, title-case headlines, soft images) and says what a person
 * still has to look at. Exit code 1 if anything fails.
 *
 * check.js asks "is it usable?" (contrast, tap size, gutters). This asks
 * "does it look made by someone?". Run both.
 */
const fs = require('fs');
const path = require('path');

let chromium;
try { ({ chromium } = require('playwright')); } catch {
  console.error('This needs Playwright:  npm i -D playwright  then  npx playwright install chromium');
  process.exit(2);
}

const ROOT = path.resolve(__dirname, '..');
const args = process.argv.slice(2);
const desktop = args.includes('--desktop');
const target = args.find((a) => !a.startsWith('--'));
if (!target) { console.error('Usage: node tools/slop.js <page.html | folder> [--desktop]'); process.exit(2); }
// A live URL works too, so a running app can be scored as it is.
const isUrl = /^https?:\/\//.test(target);
let file = isUrl ? target : path.resolve(process.cwd(), target);
if (!isUrl && fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
if (!isUrl && !fs.existsSync(file)) { console.error('Not found: ' + target); process.exit(2); }
const PANEL = path.join(ROOT, 'portal', 'app', 'index.html');
const VIEW = desktop ? { width: 1280, height: 900 } : { width: 393, height: 852 };

// How much each point shows when it fails, so the worst one is the one to fix
// first. A purple gradient is seen before a stray 13px gap.
const WEIGHT = { 1: 10, 2: 7, 3: 9, 4: 6, 5: 7, 6: 8, 7: 8, 8: 5, 9: 6, 10: 7, 11: 3, 12: 7, 13: 9, 14: 4, 15: 5, 16: 5, 17: 4, 18: 6 };

function audit() {
  const out = [];
  const add = (n, name, status, evidence) => out.push({ n, name, status, evidence });
  const vw = innerWidth, vh = innerHeight;
  const all = [document.documentElement, document.body, ...document.body.querySelectorAll('*')];
  const shown = (el) => {
    const cs = getComputedStyle(el);
    if (cs.display === 'none' || cs.visibility === 'hidden' || +cs.opacity < 0.05) return false;
    const r = el.getBoundingClientRect();
    return r.width > 0 && r.height > 0;
  };
  const vis = all.filter(shown);
  const firstScreen = (el) => { const r = el.getBoundingClientRect(); return r.top < vh && r.bottom > 0; };
  const ownText = (el) => [...el.childNodes].filter((n) => n.nodeType === 3).map((n) => n.textContent).join('').trim();
  const label = (el) => `<${el.tagName.toLowerCase()}> "${(el.getAttribute('aria-label') || el.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 36)}"`;
  const rgba = (c) => { const m = String(c).match(/[\d.]+/g); return m && m.length >= 3 ? { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] } : null; };
  const hsl = ({ r, g, b }) => {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return { h: 0, s: 0, l };
    const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return { h: h * 60, s, l };
  };
  const stops = (img) => (String(img).match(/rgba?\([^)]+\)/g) || []).map(rgba).filter(Boolean);
  const hex = (c) => '#' + [c.r, c.g, c.b].map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  const isPurple = (c) => { const x = hsl(c); return c.a > 0.15 && x.s > 0.3 && x.l > 0.12 && x.l < 0.9 && x.h >= 240 && x.h <= 300; };

  // 1. Purple gradient
  const purple = vis.filter((el) => { const bi = getComputedStyle(el).backgroundImage; return bi.includes('gradient') && stops(bi).some(isPurple); });
  const purpleFill = vis.filter((el) => { const c = rgba(getComputedStyle(el).backgroundColor), r = el.getBoundingClientRect(); return c && isPurple(c) && r.width * r.height > vw * vh * 0.15; });
  add(1, 'Purple gradient', purple.length || purpleFill.length ? 'fail' : 'pass',
    purple.length ? `${purple.length} gradient(s) with purple/indigo stops, e.g. ${label(purple[0])}` : purpleFill.length ? `large purple fill on ${label(purpleFill[0])}` : 'none');

  // 2. Radial glows: decorative radial gradients in a saturated colour
  const glows = vis.filter((el) => {
    const bi = getComputedStyle(el).backgroundImage;
    return bi.includes('radial-gradient') && stops(bi).some((c) => { const x = hsl(c); return c.a >= 0.1 && x.s > 0.35 && x.l > 0.15 && x.l < 0.85; });
  });
  const blobs = vis.filter((el) => { const f = getComputedStyle(el).filter.match(/blur\(([\d.]+)px\)/); const c = rgba(getComputedStyle(el).backgroundColor); return f && +f[1] >= 24 && c && c.a > 0.2 && hsl(c).s > 0.35; });
  const nGlow = glows.length + blobs.length;
  add(2, 'Radial glows', nGlow === 0 ? 'pass' : nGlow === 1 ? 'warn' : 'fail', nGlow ? `${nGlow} coloured glow(s), e.g. ${label((glows[0] || blobs[0]))}` : 'none');

  // 3. Gradient text
  const gtext = vis.filter((el) => { const cs = getComputedStyle(el); return (cs.backgroundClip === 'text' || cs.webkitBackgroundClip === 'text') && cs.backgroundImage !== 'none'; });
  add(3, 'Gradient text', gtext.length ? 'fail' : 'pass', gtext.length ? label(gtext[0]) : 'none');

  // 4. Extra badges: small labelled pills; promotional ones count double
  const PROMO = /\b(new|sale|hot|trending|bestseller|best seller|limited|exclusive|popular|free|% ?off|off|deal|online only|back in stock)\b/i;
  const badges = vis.filter((el) => {
    if (el.closest('a, button, input, label, select, textarea, nav')) return false;
    const t = ownText(el), r = el.getBoundingClientRect(), cs = getComputedStyle(el);
    if (!t || t.length > 22 || r.height > 32 || r.height < 14) return false;
    const bg = rgba(cs.backgroundColor), hasBg = (bg && bg.a > 0.05) || cs.backgroundImage !== 'none', border = parseFloat(cs.borderTopWidth) > 0;
    return (hasBg || border) && parseFloat(cs.borderTopLeftRadius) >= 4;
  });
  const promo = badges.filter((el) => PROMO.test(ownText(el)));
  const firstBadges = badges.filter(firstScreen).length;
  add(4, 'Extra badges', promo.length > 1 || firstBadges > 6 ? 'fail' : promo.length === 1 || firstBadges > 4 ? 'warn' : 'pass',
    `${badges.length} badge(s), ${firstBadges} on the first screen, ${promo.length} promotional${promo.length ? ` (${promo.slice(0, 3).map(ownText).join(', ')})` : ''}`);

  // 5. Two CTAs max on the first screen: filled or outlined buttons with words
  const ctas = vis.filter((el) => {
    if (!el.matches('a, button, [role=button]') || !firstScreen(el)) return false;
    // Filters, tabs and segments choose a view; they are not calls to action.
    if (el.matches('[aria-pressed], [role=tab], [aria-current]') || el.closest('nav, [role=tablist], .chips, .segmented')) return false;
    const r = el.getBoundingClientRect(), cs = getComputedStyle(el), words = (el.textContent || '').trim();
    if (r.height < 34 || words.length < 3 || r.width < 72) return false;
    const bg = rgba(cs.backgroundColor);
    return (bg && bg.a > 0.12) || cs.backgroundImage.includes('gradient') || parseFloat(cs.borderTopWidth) >= 1;
  });
  // The same action on every card is one action; "Continue with Apple" and
  // "Continue with Google" are one choice offered two ways.
  const key = (el) => el.textContent.trim().replace(/\s+/g, ' ').toLowerCase().split(' ').slice(0, 2).join(' ');
  const kinds = [...new Set(ctas.map(key))];
  add(5, 'Two CTAs max', kinds.length > 2 ? 'fail' : 'pass', `${kinds.length} different call(s) to action on the first screen${kinds.length ? ': ' + kinds.slice(0, 4).map((k) => `"${k}…"`).join(', ') : ''}`);

  // 6. Emoji overload
  const EMOJI = /\p{Extended_Pictographic}/gu;
  const textNodes = []; const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (walk.nextNode()) { const n = walk.currentNode; if (n.parentElement && shown(n.parentElement) && n.textContent.trim()) textNodes.push(n); }
  const emojis = textNodes.flatMap((n) => (n.textContent.match(EMOJI) || []).map((e) => ({ e, el: n.parentElement })));
  const inHeads = emojis.filter((x) => x.el.closest('h1, h2, h3, button, a'));
  add(6, 'Emoji overload', inHeads.length || emojis.length > 2 ? 'fail' : emojis.length ? 'warn' : 'pass', emojis.length ? `${emojis.length} emoji (${emojis.slice(0, 6).map((x) => x.e).join(' ')}), ${inHeads.length} in headings or buttons` : 'none');

  // 7. Readable type: body copy size, line length, line height
  const paras = vis.filter((el) => { const t = ownText(el); return t.split(/\s+/).length >= 8 && !el.closest('button, a'); });
  const tooSmall = paras.filter((el) => parseFloat(getComputedStyle(el).fontSize) < (vw < 600 ? 15 : 15));
  const tooLong = paras.filter((el) => { const cs = getComputedStyle(el); return el.getBoundingClientRect().width / (parseFloat(cs.fontSize) * 0.5) > 90; });
  const tooTight = paras.filter((el) => { const cs = getComputedStyle(el); const lh = cs.lineHeight === 'normal' ? 1.2 : parseFloat(cs.lineHeight) / parseFloat(cs.fontSize); return el.getBoundingClientRect().height > parseFloat(cs.fontSize) * 2.2 && lh < 1.3; });
  const readFail = tooSmall.length + tooLong.length + tooTight.length;
  add(7, 'Readable type', tooSmall.length ? 'fail' : readFail ? 'warn' : 'pass',
    `${paras.length} paragraph(s); ${tooSmall.length} under 15px, ${tooLong.length} over ~90 characters a line, ${tooTight.length} with line height under 1.3${tooSmall.length ? `, e.g. ${label(tooSmall[0])}` : ''}`);

  // The hero: the biggest text on the first screen.
  const sized = vis.filter((el) => ownText(el) && firstScreen(el)).map((el) => ({ el, size: parseFloat(getComputedStyle(el).fontSize) })).sort((a, b) => b.size - a.size);
  const hero = sized[0];
  const headline = hero ? hero.el.textContent.replace(/\s+/g, ' ').trim() : '';

  // 8. Benefits first (judgement): flag the headlines that are not about the reader
  const SELF = /^(welcome|introducing|meet|the (best|ultimate|future)|we are|we're|about us|our )/i;
  add(8, 'Benefits first', SELF.test(headline) ? 'fail' : 'look', `headline: "${headline.slice(0, 60)}"${SELF.test(headline) ? ' talks about itself' : '. Look: does it say what the person gets?'}`);

  // 9. Specific copy: hype words, exclamation marks, Title Case Headlines
  const HYPE = /\b(seamless(ly)?|elevate[sd]?|unlock|unleash|revolution(ary|i[sz]e)|cutting[- ]edge|next[- ](level|gen(eration)?)|game[- ]chang(er|ing)|effortless(ly)?|transform(ative)?|empower(ing)?|supercharge|innovative|world[- ]class|best[- ]in[- ]class|magic(al)?|stunning|amazing|ultimate|inspire[sd]?|every moment|designed to|all[- ]in[- ]one|one[- ]stop|skyrocket|harness|leverage|robust|journey|embark|dive into|curated|elevated|reimagined|like never before)\b/gi;
  const body = textNodes.map((n) => n.textContent).join(' ');
  const hype = [...new Set((body.match(HYPE) || []).map((w) => w.toLowerCase()))];
  const bangs = (body.match(/!/g) || []).length;
  const titleCase = vis.filter((el) => el.matches('h1, h2, h3') && ownText(el).split(/\s+/).filter((w) => w.length > 3).length >= 3
    && ownText(el).split(/\s+/).filter((w) => w.length > 3).every((w) => /^[A-Z]/.test(w)));
  const nine = hype.length + bangs + titleCase.length;
  add(9, 'Specific copy', hype.length > 2 || nine > 4 ? 'fail' : nine ? 'warn' : 'pass',
    `${hype.length} hype word(s)${hype.length ? ` (${hype.slice(0, 5).join(', ')})` : ''}, ${bangs} exclamation mark(s), ${titleCase.length} Title Case heading(s)`);

  // 10. One accent colour: saturated hues, weighted by how much of the page they cover
  const hues = [];
  for (const el of vis) {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    if (el.closest('svg') && el.tagName.toLowerCase() !== 'svg') continue;
    const bg = rgba(cs.backgroundColor);
    if (bg && bg.a > 0.35) hues.push({ c: bg, w: Math.min(r.width * r.height, vw * 200) });
    if (ownText(el)) { const fg = rgba(cs.color); if (fg) hues.push({ c: fg, w: ownText(el).length * parseFloat(cs.fontSize) * 4 }); }
    if (el.matches('.ic, i[class*=ic-]')) { const fg = rgba(cs.backgroundColor) || rgba(cs.color); if (fg) hues.push({ c: fg, w: r.width * r.height }); }
  }
  const sat = hues.filter(({ c }) => { const x = hsl(c); return x.s >= 0.4 && x.l >= 0.25 && x.l <= 0.8 && c.a > 0.35; });
  const total = sat.reduce((t, x) => t + x.w, 0) || 1;
  const groups = [];
  for (const x of sat) {
    const h = hsl(x.c).h, g = groups.find((g) => Math.min(Math.abs(g.h - h), 360 - Math.abs(g.h - h)) < 24);
    if (g) { g.w += x.w; if (x.w > g.bw) { g.bw = x.w; g.c = x.c; } } else groups.push({ h, w: x.w, bw: x.w, c: x.c });
  }
  const accents = groups.filter((g) => g.w / total > 0.04).sort((a, b) => b.w - a.w);
  add(10, 'One accent colour', accents.length <= 1 ? 'pass' : accents.length === 2 ? 'warn' : 'fail',
    accents.length ? `${accents.length} accent hue(s): ${accents.map((g) => `${hex(g.c)} ${Math.round(g.w / total * 100)}%`).join(', ')}` : 'no saturated colour');

  // 11. 4-point spacing
  const gaps = [];
  for (const el of vis) {
    const cs = getComputedStyle(el);
    for (const p of ['marginTop', 'marginBottom', 'marginLeft', 'marginRight', 'paddingTop', 'paddingBottom', 'paddingLeft', 'paddingRight', 'rowGap', 'columnGap']) {
      const v = parseFloat(cs[p]); if (v >= 3 && v < 200 && cs[p] !== 'normal') gaps.push({ v, el, p });
    }
  }
  const off = gaps.filter(({ v }) => Math.abs(v / 4 - Math.round(v / 4)) > 0.13);
  const onGrid = gaps.length ? 1 - off.length / gaps.length : 1;
  const offVals = [...new Set(off.map(({ v }) => +v.toFixed(1)))].slice(0, 8);
  add(11, '4-point spacing', onGrid >= 0.9 ? 'pass' : onGrid >= 0.75 ? 'warn' : 'fail', `${Math.round(onGrid * 100)}% of ${gaps.length} spacing values on the 4pt grid${offVals.length ? `; off: ${offVals.join(', ')}` : ''}`);

  // 12. Type hierarchy: few sizes, clearly apart, a real jump at the top
  const textEls = vis.filter((el) => ownText(el));
  const sizes = [...new Set(textEls.map((el) => Math.round(parseFloat(getComputedStyle(el).fontSize))))].sort((a, b) => a - b);
  const bodySize = (() => { const c = {}; textEls.forEach((el) => { const s = Math.round(parseFloat(getComputedStyle(el).fontSize)); c[s] = (c[s] || 0) + ownText(el).length; }); return +Object.entries(c).sort((a, b) => b[1] - a[1])[0]?.[0] || 16; })();
  const ratio = sizes.length ? sizes[sizes.length - 1] / bodySize : 1;
  const near = sizes.filter((s, i) => i && s - sizes[i - 1] === 1).length;
  add(12, 'Type hierarchy', sizes.length > 9 || ratio < 1.6 ? 'fail' : sizes.length > 7 || ratio < 2.2 || near > 2 ? 'warn' : 'pass',
    `${sizes.length} sizes (${sizes.join(', ')}); largest is ${ratio.toFixed(1)}x the body (${bodySize}px)${near ? `; ${near} pair(s) only 1px apart` : ''}`);

  // 13. Visual priority: one thing clearly first on the first screen
  const second = sized.find((x) => x.el !== hero?.el && !hero?.el.contains(x.el) && !x.el.contains(hero?.el) && x.el.textContent.trim() !== headline);
  const lead = hero && second ? hero.size / second.size : 9;
  const filledFirst = ctas.filter((el) => { const cs = getComputedStyle(el), c = rgba(cs.backgroundColor); return (c && c.a > 0.5) || cs.backgroundImage.includes('gradient'); }).length;
  // Said twice: the same words in two places on the first screen, outside
  // navigation. Rows of a list repeat their labels by nature (two tickets can
  // both be Critical), and a control's label is not a statement, so words in
  // list rows, buttons and links are left out.
  const seen = new Map(), twice = new Set();
  vis.filter((el) => firstScreen(el) && !el.closest('nav, li, [role=listitem], .list-row, button, a, [role=button], [role=tab]') && ownText(el).length >= 6).forEach((el) => {
    const t = ownText(el).toLowerCase(); if (seen.has(t) && !seen.get(t).contains(el) && !el.contains(seen.get(t))) twice.add(ownText(el)); else seen.set(t, el); });
  add(13, 'Visual priority', lead < 1.25 ? 'fail' : lead < 1.6 || filledFirst > 1 || twice.size ? 'warn' : 'pass',
    `the biggest text is ${lead === 9 ? 'alone' : lead.toFixed(2) + 'x the next'}${hero ? ` ("${headline.slice(0, 28)}", ${hero.size}px)` : ''}; ${filledFirst} filled button(s) on the first screen${twice.size ? `; said twice: ${[...twice].slice(0, 3).map((t) => `"${t.slice(0, 24)}"`).join(', ')}` : ''}`);

  // 14. Corner radius: a few radii, used consistently; inner smaller than outer
  const radii = new Map();
  for (const el of vis) {
    const r = parseFloat(getComputedStyle(el).borderTopLeftRadius), box = el.getBoundingClientRect();
    if (!(r > 1)) continue;
    const key = r >= Math.min(box.width, box.height) / 2 - 1 ? 'round' : Math.round(r);
    radii.set(key, (radii.get(key) || 0) + 1);
  }
  const square = [...radii.keys()].filter((k) => k !== 'round').sort((a, b) => a - b);
  add(14, 'Corner radius', square.length > 6 ? 'fail' : square.length > 4 ? 'warn' : 'pass', `${square.length} radii besides pills and circles (${square.join(', ') || 'none'})`);

  // 15. Selective glass: blur behind a few floating controls, not every card
  const glass = vis.filter((el) => { const cs = getComputedStyle(el); return (cs.backdropFilter && cs.backdropFilter !== 'none') || (cs.webkitBackdropFilter && cs.webkitBackdropFilter !== 'none'); });
  const bigGlass = glass.filter((el) => { const r = el.getBoundingClientRect(); return r.width * r.height > vw * vh * 0.12; });
  add(15, 'Selective glass', glass.length > 8 || bigGlass.length > 1 ? 'fail' : glass.length > 5 || bigGlass.length ? 'warn' : 'pass', `${glass.length} blurred element(s), ${bigGlass.length} large`);

  // 16. Scannable cards: a heading, a number or a short line, not a paragraph
  const cards = vis.filter((el) => {
    const cs = getComputedStyle(el), r = el.getBoundingClientRect();
    const bg = rgba(cs.backgroundColor), pbg = el.parentElement ? rgba(getComputedStyle(el.parentElement).backgroundColor) : null;
    const lifted = (bg && bg.a > 0.04 && (!pbg || Math.abs(hsl(bg).l - hsl(pbg).l) > 0.02 || bg.a !== pbg.a)) || cs.boxShadow !== 'none';
    return lifted && parseFloat(cs.borderTopLeftRadius) >= 12 && r.width >= 140 && r.height >= 70 && el.textContent.trim().length > 0 && !el.matches('a, button');
  });
  const wordy = cards.filter((el) => (el.innerText || '').trim().split(/\s+/).length > 45);   // rendered text only
  add(16, 'Scannable cards', cards.length && wordy.length / cards.length > 0.3 ? 'fail' : wordy.length ? 'warn' : 'pass',
    cards.length ? `${cards.length} card(s); ${wordy.length} with more than 45 words${wordy.length ? `, e.g. ${label(wordy[0])}` : ''}` : 'no cards');

  // 17. Interaction cues: pressed, hover and keyboard focus states exist
  let hover = 0, active = 0, focus = 0;
  for (const sh of document.styleSheets) { let rules; try { rules = sh.cssRules; } catch { continue; }
    const scan = (list) => { for (const r of list) { if (r.cssRules) scan(r.cssRules); const s = r.selectorText || ''; if (s.includes(':hover')) hover++; if (s.includes(':active')) active++; if (s.includes(':focus')) focus++; } };
    scan(rules); }
  const controls = vis.filter((el) => el.matches('a[href], button, [role=button], summary'));
  const noPointer = controls.filter((el) => getComputedStyle(el).cursor !== 'pointer');
  add(17, 'Interaction cues', !focus || !active ? 'fail' : !hover || noPointer.length > controls.length * 0.3 ? 'warn' : 'pass',
    `${active} pressed, ${hover} hover and ${focus} focus rule(s); ${noPointer.length} of ${controls.length} controls without a pointer cursor`);

  // 18. Premium assets (judgement): real imagery, sharp enough, no emoji as art
  const imgs = vis.filter((el) => el.tagName === 'IMG');
  const soft = imgs.filter((im) => im.naturalWidth && im.naturalWidth < im.getBoundingClientRect().width * 1.5);
  const bigEmoji = emojis.filter((x) => parseFloat(getComputedStyle(x.el).fontSize) >= 24);
  const art = imgs.filter(firstScreen).length || vis.some((el) => firstScreen(el) && el.getBoundingClientRect().height > vh * 0.25 && getComputedStyle(el).backgroundImage.includes('url('));
  add(18, 'Premium assets', bigEmoji.length ? 'fail' : soft.length ? 'warn' : 'look',
    `${imgs.length} image(s), ${soft.length} too small for a 2x screen${bigEmoji.length ? `, ${bigEmoji.length} emoji used as art` : ''}${art ? '' : ', no image on the first screen'}. Look: is the imagery real and of this subject?`);

  return { items: out, headline };
}

(async () => {
  // File pages are opaque origins: without this, linked stylesheets cannot be
  // read, and every hover and focus rule in them goes uncounted.
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ viewport: VIEW, deviceScaleFactor: 1 });
  if (file === PANEL) {
    const SAMPLE = fs.readFileSync(path.join(__dirname, 'panel-sample.js'), 'utf8');
    await page.route(/supabase-js/, (r) => r.fulfill({ contentType: 'application/javascript', body: SAMPLE }));
  }
  await page.route(/supabase\.co/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.goto(isUrl ? file : 'file://' + file, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(900);
  const { items } = await page.evaluate(audit);
  await browser.close();

  const mark = { pass: 'pass', warn: 'warn', fail: 'FAIL', look: 'look' };
  console.log(`unslop audit  ${isUrl ? file : path.relative(ROOT, file)}  (${VIEW.width}x${VIEW.height})\n`);
  for (const it of items) console.log(`  ${mark[it.status].padEnd(4)}  ${String(it.n).padStart(2)}. ${it.name.padEnd(18)} ${it.evidence}`);
  const cost = (it) => WEIGHT[it.n] * (it.status === 'fail' ? 3 : it.status === 'warn' ? 1 : 0);
  const worst = [...items].sort((a, b) => cost(b) - cost(a))[0];
  const fails = items.filter((i) => i.status === 'fail').length, warns = items.filter((i) => i.status === 'warn').length;
  const score = Math.round(items.reduce((t, i) => t + (i.status === 'fail' ? 0 : i.status === 'warn' ? 0.6 : 1), 0) / items.length * 100);
  console.log(`\n  score ${score}/100   ${fails} fail, ${warns} warn, ${items.filter((i) => i.status === 'look').length} for a person to look at`);
  console.log(cost(worst) ? `  BOTTLENECK  ${worst.n}. ${worst.name}: ${worst.evidence}` : '  no bottleneck: nothing measurable fails. Now look at it.');
  process.exit(fails ? 1 : 0);
})();
