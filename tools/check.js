#!/usr/bin/env node
/*
 * Look at every screen, at phone and desktop size, and check it against the
 * rules that can be measured.
 *
 *   node tools/check.js                 every built site, the owner panel, the docs pages
 *   node tools/check.js dist/hvac       one site (a folder or an .html file)
 *   node tools/check.js portal/app      the owner panel, filled with invented sample data
 *
 * Screenshots go to .check/ (ignored by git). Open them. A screen that passes
 * every check can still look wrong, and the checks cannot tell you that.
 *
 * Fails (exit code 1):
 *   - the page scrolls sideways                          DESIGN.md 4
 *   - text below 4.5:1 contrast (3:1 for large text)     DESIGN.md 2, design skill
 *   - anything tappable under 44 x 44px on a phone       design skill 3
 *     (24 x 24px on a desktop, where it is a mouse)      WCAG 2.5.8
 *   - a form field under 16px on a phone (iPhone zooms)  design skill 3
 *   - text closer than 20px to the side of the screen    DESIGN.md 4
 *     (16px on app screens built with app-style)
 *   - with scripts off, a heading or paragraph is invisible   DESIGN.md 5
 *   - a script error
 * Warns (reported, never fails):
 *   - text under 12px
 *   - more than two weights of one typeface              DESIGN.md 3
 *
 * A link inside a sentence is exempt from the size rule, as in WCAG 2.5.8.
 * Text over a photo is skipped: its contrast cannot be read from the CSS.
 */
const fs = require('fs');
const path = require('path');

let chromium;
try {
  ({ chromium } = require('playwright'));
} catch {
  console.error('This needs Playwright:  npm i -D playwright  then  npx playwright install chromium');
  process.exit(2);
}

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '.check');
const SIZES = [
  { name: 'phone', width: 400, height: 860 },
  { name: 'desktop', width: 1280, height: 900 },
];
const SAMPLE = fs.readFileSync(path.join(__dirname, 'panel-sample.js'), 'utf8');
const PANEL = path.join(ROOT, 'portal', 'app', 'index.html');

function pages(args) {
  if (args.length) return args.map(find);
  const list = [];
  const dist = path.join(ROOT, 'dist');
  if (fs.existsSync(dist)) {
    for (const d of fs.readdirSync(dist).sort()) {
      const f = path.join(dist, d, 'index.html');
      if (fs.existsSync(f)) list.push(f);
    }
  } else {
    console.log('No dist/ yet. Run  node build.js  first to check the sites.\n');
  }
  list.push(PANEL, path.join(ROOT, 'docs', 'app-patterns.html'));
  return list;
}

function find(arg) {
  let p = path.resolve(process.cwd(), arg);
  if (fs.existsSync(p) && fs.statSync(p).isDirectory()) p = path.join(p, 'index.html');
  if (!fs.existsSync(p)) { console.error(`Not found: ${arg}`); process.exit(2); }
  return p;
}

// Runs inside the page. Returns what failed and what to warn about.
function audit({ phone }) {
  const fails = [], warns = [];
  const rgb = (c) => {
    const m = String(c).match(/[\d.]+/g);
    if (!m || m.length < 3) return null;
    return { r: +m[0], g: +m[1], b: +m[2], a: m[3] === undefined ? 1 : +m[3] };
  };
  const lum = ({ r, g, b }) => {
    const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
    return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
  };
  // The colour actually behind an element: the nearest opaque background.
  // Over a photo there is no answer, so it returns null and the text is skipped.
  const behind = (el) => {
    for (let e = el; e; e = e.parentElement) {
      const cs = getComputedStyle(e);
      const c = rgb(cs.backgroundColor);
      if (cs.backgroundImage.includes('url(')) return null;
      if (c && c.a >= 0.9) return c;
      if (cs.backgroundImage !== 'none') return null;   // a gradient with nothing solid under it
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  const name = (el) => {
    const t = (el.getAttribute('aria-label') || el.textContent || el.getAttribute('placeholder') || el.id || '')
      .replace(/\s+/g, ' ').trim().slice(0, 44);
    return `<${el.tagName.toLowerCase()}> "${t}"`;
  };
  const shown = (el, cs) =>
    cs.display !== 'none' && cs.visibility !== 'hidden' && +cs.opacity > 0.05 && el.getClientRects().length > 0;

  // 44px for a thumb (design skill, phone rules); 24px for a mouse (WCAG 2.5.8).
  const min = phone ? 44 : 24;
  // Words keep a gutter: 20px on the kit's websites (DESIGN.md 4); 16px on
  // app screens built with app-style (.ui), the iOS margin every redesign uses.
  const gutter = document.querySelector('.ui') ? 16 : 20;
  const contrast = new Map(), small = new Map(), fields = new Map(), tiny = new Map(), weights = new Map(), edge = new Map();
  // Moving text (a marquee) crosses the edges on purpose.
  const moving = (el) => { for (let e = el; e; e = e.parentElement) if (e.getAnimations().length) return true; return false; };
  // In a row that scrolls sideways, running off the right edge is the scroll
  // cue (pattern 06). Running into the left edge is still a missing gutter.
  const inScroller = (el) => {
    for (let e = el.parentElement; e && e !== document.body; e = e.parentElement) {
      const o = getComputedStyle(e).overflowX;
      if ((o === 'auto' || o === 'scroll') && e.scrollWidth > e.clientWidth + 1) return true;
    }
    return false;
  };
  for (const el of document.body.querySelectorAll('*')) {
    const cs = getComputedStyle(el);
    if (!shown(el, cs) || el.closest('[aria-hidden="true"]')) continue;

    const ownText = [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
    if (ownText) {
      const size = parseFloat(cs.fontSize);
      const weight = +cs.fontWeight || 400;
      if (size < 12) tiny.set(name(el), `${size}px`);
      // Words keep a 20px gutter. Text wider than the screen is a deliberate
      // bleed (a giant wordmark), and text off the screen is not being read.
      const box = el.getBoundingClientRect();
      const offScreen = box.right <= 0 || box.left >= innerWidth;
      const bleed = box.width >= innerWidth - 40;
      if (!offScreen && !bleed && !el.closest('pre') && !moving(el)) {
        const left = box.left, right = innerWidth - box.right;
        if (left < gutter - .5) edge.set(name(el), `${Math.round(left)}px from the left edge`);
        else if (right < gutter - .5 && !inScroller(el)) edge.set(name(el), `${Math.round(right)}px from the right edge`);
      }
      if (!(el instanceof SVGElement)) {
        const family = cs.fontFamily.split(',')[0].replace(/["']/g, '').trim();
        if (!weights.has(family)) weights.set(family, new Set());
        weights.get(family).add(weight);
        let fg = rgb(cs.color);
        const bg = behind(el);
        if (fg && bg) {
          if (fg.a < 1) fg = { r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a) };
          const [hi, lo] = [lum(fg), lum(bg)].sort((a, b) => b - a);
          const ratio = (hi + 0.05) / (lo + 0.05);
          const large = size >= 24 || (size >= 18.66 && weight >= 700);
          const need = large ? 3 : 4.5;
          if (ratio < need - 0.01) contrast.set(name(el), `${ratio.toFixed(2)}:1, needs ${need}:1`);
        }
      }
    }

    if (el.matches('a[href], button, input:not([type=hidden]), select, textarea, summary, [role=button]')) {
      const r = el.getBoundingClientRect();
      const inSentence = el.tagName === 'A' && cs.display === 'inline';
      if (!inSentence && r.width > 2 && r.height > 2 && (r.width < min - 0.5 || r.height < min - 0.5)) {
        small.set(name(el), `${Math.round(r.width)}x${Math.round(r.height)}px`);
      }
      if (phone && el.matches('input, select, textarea') && parseFloat(cs.fontSize) < 16) {
        fields.set(name(el), cs.fontSize);
      }
    }
  }

  const wide = document.documentElement.scrollWidth;
  if (wide > innerWidth + 1) fails.push(`the page scrolls sideways: ${wide}px of content in a ${innerWidth}px window`);
  for (const [k, v] of contrast) fails.push(`contrast ${v}  ${k}`);
  for (const [k, v] of small) fails.push(`tap target ${v}, needs ${min}x${min}  ${k}`);
  for (const [k, v] of fields) fails.push(`form field text ${v}, needs 16px or iPhones zoom  ${k}`);
  for (const [k, v] of edge) fails.push(`text ${v}, needs a ${gutter}px gutter  ${k}`);
  for (const [k, v] of tiny) warns.push(`text ${v}  ${k}`);
  for (const [family, set] of weights) {
    if (set.size > 2) warns.push(`${set.size} weights of ${family} (${[...set].sort((a, b) => a - b).join(', ')}); DESIGN.md allows two`);
  }
  return { fails, warns };
}

async function open(browser, file, opts = {}) {
  const context = await browser.newContext({ deviceScaleFactor: 1, ...opts });
  const page = await context.newPage();
  const blocked = new Set(), errors = [];
  page.on('requestfailed', (r) => { const u = r.url(); if (/^https?:/.test(u)) blocked.add(new URL(u).host); });
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));
  if (file === PANEL) {
    await page.route(/supabase-js/, (r) => r.fulfill({ contentType: 'application/javascript', body: SAMPLE }));
  }
  // Sites report to the collector and read their settings from it. A check
  // must never write to the real database.
  await page.route(/supabase\.co/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.goto('file://' + file, { waitUntil: 'load' });
  await page.waitForTimeout(1200);
  return { context, page, blocked, errors };
}

// Scroll to the bottom and back, so anything that reveals on scroll has.
async function scrollThrough(page) {
  const height = await page.evaluate(() => document.documentElement.scrollHeight);
  for (let y = 0; y < height; y += 500) {
    await page.mouse.wheel(0, 500);
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(600);
  await page.evaluate(() => scrollTo(0, 0));
  await page.waitForTimeout(600);
}

async function check(browser, file) {
  const rel = path.relative(ROOT, file);
  const slug = rel.replace(/[\\/]/g, '_').replace(/\.html$/, '');
  const found = new Map();   // message -> sizes it happened at
  const note = (kind, size, msg) => {
    const key = `${kind}\u0000${msg}`;
    if (!found.has(key)) found.set(key, new Set());
    found.get(key).add(size);
  };
  const blockedHosts = new Set(), shots = [];

  for (const size of SIZES) {
    const { context, page, blocked, errors } = await open(browser, file, { viewport: { width: size.width, height: size.height } });
    await page.mouse.move(size.width / 2, 10);
    await scrollThrough(page);
    const shot = path.join(OUT, `${slug}-${size.name}.png`);
    await page.screenshot({ path: shot, fullPage: true });
    shots.push(path.relative(ROOT, shot));
    const r = await page.evaluate(audit, { phone: size.name === 'phone' });
    r.fails.forEach((m) => note('fail', size.name, m));
    r.warns.forEach((m) => note('warn', size.name, m));
    errors.forEach((m) => note('fail', size.name, `script error: ${m}`));
    blocked.forEach((h) => blockedHosts.add(h));
    await context.close();
  }

  // Scripts off: the page must still be complete. (The panel is an app and
  // says so; it is checked for showing that message instead.)
  {
    const { context, page } = await open(browser, file, { viewport: { width: 400, height: 860 }, javaScriptEnabled: false });
    const hidden = await page.evaluate(() =>
      [...document.querySelectorAll('h1, h2, h3, p, li, label, a, button')]
        .filter((e) => {
          if (!e.getClientRects().length || !e.textContent.trim()) return false;
          const s = getComputedStyle(e);
          return s.visibility === 'hidden' || +s.opacity < 0.05;
        })
        .map((e) => e.textContent.replace(/\s+/g, ' ').trim().slice(0, 40)));
    hidden.slice(0, 5).forEach((t) => note('fail', 'no scripts', `invisible without scripts: "${t}"`));
    if (hidden.length > 5) note('fail', 'no scripts', `...and ${hidden.length - 5} more invisible without scripts`);
    await context.close();
  }

  const fails = [...found].filter(([k]) => k.startsWith('fail'));
  const warns = [...found].filter(([k]) => k.startsWith('warn'));
  const line = ([k, sizes]) => `      ${[...sizes].join('+').padEnd(14)} ${k.split('\u0000')[1]}`;
  console.log(`${fails.length ? 'FAIL' : 'pass'}  ${rel}${fails.length ? `  (${fails.length} to fix)` : ''}`);
  fails.slice(0, 15).forEach((f) => console.log(line(f)));
  if (fails.length > 15) console.log(`      ...and ${fails.length - 15} more`);
  warns.slice(0, 6).forEach((w) => console.log(line(w).replace(/^ {6}/, '      warn ')));
  if (blockedHosts.size) console.log(`      note: could not load from ${[...blockedHosts].join(', ')}, so this checked the page without it`);
  console.log(`      look: ${shots.join('  ')}\n`);
  return fails.length;
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  let failed = 0;
  try {
    for (const file of pages(process.argv.slice(2))) failed += (await check(browser, file)) ? 1 : 0;
  } finally {
    await browser.close();
  }
  console.log(failed ? `${failed} page(s) need fixing.` : 'Every page passes. Now look at the screenshots.');
  process.exit(failed ? 1 : 0);
})();
