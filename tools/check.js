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
 *   - a broken image, text running into other text, words too wide for their column
 *   - a control on the first screen under a floating action (not a dock):
 *     a tap meant for it would press the action
 * (and warns when more than 24 controls crowd the first screen)
 * Warns (reported, never fails):
 *   - text under 12px
 *   - more than two weights of one typeface              DESIGN.md 3
 *
 * A link inside a sentence is exempt from the size rule, as in WCAG 2.5.8.
 * Text over a photo is skipped: its contrast cannot be read from the CSS.
 */
const fs = require('fs');
const path = require('path');
const { mirror } = require('./cdn');

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
  // rgb()/rgba(), and color(srgb r g b / a), which is how a color-mix() comes
  // back: its channels run 0 to 1, not 0 to 255.
  const rgb = (c) => {
    const s = String(c), m = s.match(/[\d.]+/g);
    if (!m || m.length < 3) return null;
    const k = /^color\(/.test(s) ? 255 : 1;
    return { r: +m[0] * k, g: +m[1] * k, b: +m[2] * k, a: m[3] === undefined ? 1 : +m[3] };
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
  // A recreation may keep a measured gutter, if it says so and why:
  // <meta name="design-check" content="gutter 12.5: measured from the original">
  const said = (document.querySelector('meta[name="design-check"]')?.content || '').match(/gutter\s+([\d.]+)/);
  const gutter = said ? +said[1] : document.querySelector('.ui') ? 16 : 20;
  const contrast = new Map(), small = new Map(), fields = new Map(), tiny = new Map(), weights = new Map(), edge = new Map();
  // Moving text (a marquee) crosses the edges on purpose.
  const moving = (el) => { for (let e = el; e; e = e.parentElement) if (e.getAnimations().length) return true; return false; };
  // In a row that scrolls sideways, running off the right edge is the scroll
  // cue (pattern 06). Running into the left edge is still a missing gutter.
  // Content a container is scrolling past (a pinned sideways section, a
  // carousel) is cut off by that container: it is passing the edge, not
  // sitting against it. Text flush with the screen while fully shown still fails.
  const passing = (el, box) => {
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      if (getComputedStyle(a).overflowX === 'visible') continue;
      const r = a.getBoundingClientRect();
      if (box.left < r.left - .5 || box.right > r.right + .5) return true;
    }
    return false;
  };
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
      if (!offScreen && !bleed && !el.closest('pre') && !moving(el) && !passing(el, box)) {
        // Where the words are, not the box: centred text in a full-width box
        // starts well inside it.
        let l = Infinity, rr = -Infinity;
        for (const n of el.childNodes) if (n.nodeType === 3 && n.textContent.trim()) {
          const rg = document.createRange(); rg.selectNodeContents(n);
          for (const q of rg.getClientRects()) { l = Math.min(l, q.left); rr = Math.max(rr, q.right); }
        }
        const left = l === Infinity ? box.left : l, right = innerWidth - (rr === -Infinity ? box.right : rr);
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
      // What counts is where a press lands: a control can look 36px tall and
      // still catch presses over 44 (a ::before or ::after hit area, the
      // native way to keep a small look). Probe 44px around its centre.
      const reach = (w, h) => {
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2, hw = w / 2 - 1, hh = h / 2 - 1;
        return [[cx, cy - hh], [cx, cy + hh], [cx - hw, cy], [cx + hw, cy]].every(([x, y]) => {
          if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) return true;
          const hit = document.elementFromPoint(x, y); return hit && (hit === el || el.contains(hit));
        });
      };
      const tooSmall = r.width < min - 0.5 || r.height < min - 0.5;
      if (!inSentence && r.width > 2 && r.height > 2 && tooSmall && !(r.top >= 0 && r.bottom <= innerHeight && reach(Math.max(r.width, min), Math.max(r.height, min)))) {
        small.set(name(el), `${Math.round(r.width)}x${Math.round(r.height)}px`);
      }
      if (phone && el.matches('input, select, textarea') && parseFloat(cs.fontSize) < 16) {
        fields.set(name(el), cs.fontSize);
      }
    }
  }

  // Legacy ugliness, the kind the unslop list does not cover.
  // Broken images: the alt text or a torn-picture icon where art should be.
  const broken = [...document.images].filter((im) => im.complete && im.naturalWidth === 0 && im.getClientRects().length);
  broken.slice(0, 3).forEach((im) => fails.push(`broken image  <img src="${(im.getAttribute('src') || '').slice(-40)}">${im.alt ? ` shows its alt text "${im.alt.slice(0, 40)}"` : ''}`));
  // Text running into other text.
  // Floating layers (a dock, a sticky bar) cover what scrolls under them on
  // purpose, so text inside them is left out of this check.
  // (A mockup floats its dock or its button with position: absolute and a
  // z-index above the content: layered on purpose, so that counts too.)
  const floating = (el) => { for (let e = el; e; e = e.parentElement) { const cs = getComputedStyle(e), p = cs.position; if (p === 'fixed' || p === 'sticky' || (p === 'absolute' && +cs.zIndex >= 1)) return true; } return false; };
  const painted = (el) => (el.checkVisibility ? el.checkVisibility({ contentVisibilityAuto: true, opacityProperty: true, visibilityProperty: true }) : el.getClientRects().length > 0);
  // Only the part a person can see: a chip scrolled out of its row, or text
  // cut off by a scrolling pane, is clipped by that ancestor.
  const seen = (el) => {
    let { left, top, right, bottom } = el.getBoundingClientRect();
    for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) {
      const cs = getComputedStyle(a);
      if (cs.overflowX === 'visible' && cs.overflowY === 'visible') continue;
      const c = a.getBoundingClientRect();
      left = Math.max(left, c.left); top = Math.max(top, c.top); right = Math.min(right, c.right); bottom = Math.min(bottom, c.bottom);
    }
    return { left, top, right, bottom, width: right - left, height: bottom - top };
  };
  // Text marked aria-hidden is decoration (a giant wordmark set with a tight
  // line height): its font box reaches into empty space below the letters.
  const leaves = [...document.body.querySelectorAll('*')].filter((el) =>
    [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && painted(el) && !floating(el) && !el.closest('[aria-hidden="true"]')
  ).slice(0, 500).map((el) => ({ el, r: seen(el) })).filter(({ r }) => r.width > 2 && r.height > 2);
  const clash = [];
  for (let i = 0; i < leaves.length && clash.length < 3; i++) for (let j = i + 1; j < leaves.length; j++) {
    const a = leaves[i], b = leaves[j];
    if (a.el.contains(b.el) || b.el.contains(a.el)) continue;
    const w = Math.min(a.r.right, b.r.right) - Math.max(a.r.left, b.r.left), h = Math.min(a.r.bottom, b.r.bottom) - Math.max(a.r.top, b.r.top);
    if (w > 3 && h > 3 && w * h > 0.2 * Math.min(a.r.width * a.r.height, b.r.width * b.r.height)) { clash.push(`${name(a.el)} and ${name(b.el)}`); break; }
  }
  clash.forEach((c) => fails.push(`text runs into other text  ${c}`));
  // Words broken in the middle by a column too narrow for them.
  // A word split across two lines: its own rectangles sit on different lines.
  const chopped = [];
  const tw = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  while (tw.nextNode() && chopped.length < 5) {
    const node = tw.currentNode, el = node.parentElement;
    if (!el || !painted(el)) continue;
    for (const m of node.textContent.matchAll(/[A-Za-z]{6,}/g)) {
      const range = document.createRange(); range.setStart(node, m.index); range.setEnd(node, m.index + m[0].length);
      const tops = [...range.getClientRects()].map((r) => Math.round(r.top));
      if (new Set(tops).size > 1) { chopped.push(el); break; }
    }
  }
  if (chopped.length) fails.push(`words too wide for their column: ${chopped.length}, e.g. ${name(chopped[0])}`);
  // A control under a floating one: on the first screen, a tap at its centre
  // lands on the floating button instead (a recording of the tickets example
  // closed a ticket this way: the Discussion tab sat under "Resolve as fixed").
  const CONTROL = 'a[href], button, input, select, textarea, [role=button], [role=tab]';
  const covered = [];
  for (const el of document.querySelectorAll(CONTROL)) {
    if (covered.length >= 3 || floating(el) || !painted(el)) continue;
    const r = el.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    if (r.width < 2 || y < 0 || y > innerHeight || x < 0 || x > innerWidth) continue;
    const hit = document.elementFromPoint(x, y);
    const over = hit && !el.contains(hit) && !hit.contains(el) && hit.closest(CONTROL);
    // A dock or tab bar is navigation: rows scroll under it on purpose, and a
    // mis-tap only changes the view. A floating action changes things.
    if (over && floating(over) && !over.closest('nav')) covered.push(`${name(el)} is under ${name(over)}: a tap there presses it`);
  }
  covered.forEach((c) => fails.push(`covered by a floating control  ${c}`));
  // Count the things: how many controls fight for the first screen.
  // A list of rows is one thing to scan, not one control per row.
  const seenLists = new Set();
  const crowd = [...document.querySelectorAll('a[href], button, input, select, textarea')].filter((el) => {
    const r = el.getBoundingClientRect(); if (!(r.width > 2 && r.top < innerHeight && r.bottom > 0)) return false;
    const list = el.closest('ol, ul, [role=list]');
    if (list && el.closest('li, [role=listitem]')) { if (seenLists.has(list)) return false; seenLists.add(list); }
    return true;
  }).length;
  if (crowd > 24) warns.push(`${crowd} controls on the first screen; the design skill says count the things and cut`);

  const wide = document.documentElement.scrollWidth;
  if (wide > innerWidth + 1) fails.push(`the page scrolls sideways: ${wide}px of content in a ${innerWidth}px window`);
  for (const [k, v] of contrast) fails.push(`contrast ${v}  ${k}`);
  for (const [k, v] of small) fails.push(`tap target ${v}, needs ${min}x${min}  ${k}`);
  for (const [k, v] of fields) fails.push(`form field text ${v}, needs 16px or iPhones zoom  ${k}`);
  for (const [k, v] of edge) fails.push(`text ${v}, needs a ${gutter}px gutter  ${k}`);
  for (const [k, v] of tiny) warns.push(`text ${v}  ${k}`);
  for (const [family, set] of weights) {
    // DESIGN.md allows two weights on the kit's websites; app-style uses four (200 for the one huge number, 400, 500, 600).
    const allowed = document.querySelector('.ui') ? 4 : 2;
    if (set.size > allowed) warns.push(`${set.size} weights of ${family} (${[...set].sort((a, b) => a - b).join(', ')}); ${allowed === 2 ? 'DESIGN.md allows two' : 'app-style uses four at most'}`);
  }
  return { fails, warns };
}

async function open(browser, file, opts = {}) {
  const context = await browser.newContext({ deviceScaleFactor: 1, ...opts });
  const page = await context.newPage();
  const blocked = new Set(), errors = [];
  page.on('requestfailed', (r) => { const u = r.url(); if (/^https?:/.test(u)) blocked.add(new URL(u).host); });
  page.on('pageerror', (e) => errors.push(e.message.split('\n')[0]));
  // Where a CDN is blocked, the same library version comes from npm instead,
  // so this checks the page visitors get, animation libraries and all.
  await mirror(page);
  if (file === PANEL) {
    await page.route(/supabase-js/, (r) => r.fulfill({ contentType: 'application/javascript', body: SAMPLE }));
  }
  // Sites report to the collector and read their settings from it. A check
  // must never write to the real database.
  await page.route(/supabase\.co/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.goto('file://' + file, { waitUntil: 'load' });
  await page.waitForTimeout(600);
  await settle(page);
  return { context, page, blocked, errors };
}

// Measure the page at rest: wait (up to 5s) until nothing is animating, CSS,
// the Web Animations API or GSAP, so an entrance mid-way is not measured.
async function settle(page, ms = 5000) {
  const t = Date.now();
  while (Date.now() - t < ms) {
    const busy = await page.evaluate(() =>
      document.getAnimations().some((a) => a.playState === 'running' && a.timeline === document.timeline && a.effect && a.effect.getTiming().iterations !== Infinity) ||
      !!(window.gsap && gsap.globalTimeline.getChildren(true, true, false).some((x) => x.isActive() && !(x.repeat && x.repeat() === -1))));
    if (!busy) break;
    await page.waitForTimeout(100);
  }
  await page.waitForTimeout(100);
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
  if (mirror.served && mirror.served.size) console.log(`      note: the CDN was blocked, so ${[...mirror.served].join(', ')} came from npm (same version)`);
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
