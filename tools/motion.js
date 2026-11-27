#!/usr/bin/env node
/*
 * The motion audit: press through a page, measure every animation it plays,
 * and name the one thing to fix first. Screenshots cannot see motion; this
 * can.
 *
 *   node tools/motion.js app-style/examples/tickets       the page's own tour
 *   node tools/motion.js page.html --desktop              1280 x 900 only
 *   node tools/motion.js page.html --phone                400 x 860 only
 *   node tools/motion.js page.html --steps '[{"click":"#menu"},{"key":"Escape"}]'
 *   node tools/motion.js page.html --no-frames            skip the filmstrips
 *
 * The tour is what to press, in order. A page can carry its own, as JSON in
 * <script type="application/json" id="motion-tour">. Each step is one of
 *   {"click": "<selector>"}  {"key": "Escape"}  {"back": true}  {"wait": 300}
 *   {"drag": "<selector>", "to": "<selector>"}   press, move in steps, release
 * with an optional "why", and "phone": true or "desktop": true to run it at
 * one size only.
 *
 * Every animation is read from the browser itself (document.getAnimations,
 * view transitions included), then held against the rules the app-style
 * skill took from Emil Kowalski's animation standards, ibelick's
 * fixing-motion-performance, Vercel's web interface guidelines and Apple's
 * "Designing Fluid Interfaces":
 *
 *   - animates layout (width, height, top, margin...) instead of transform  fail
 *   - feels slow: not 95% done within 400ms (warn above 300)                fail
 *   - ease-in: starts slow, so the moment being watched comes late          fail
 *   - moves when the visitor asked for reduced motion                       fail
 *   - a press with no visible answer within 300ms (warn above 100)          fail
 *   - linear on something that moves, and is not a loop                     warn
 *   - over before it can be seen (under 60ms)                               warn
 *   - a view transition longer than 600ms: the page ignores input meanwhile warn
 *   - more than four curves across the page: no one tempo                   warn
 *   - transition: all; hover motion not kept to mouse users; scale(0)       warn
 *   - a frame longer than 120ms while something moves                       warn
 *
 * Filmstrips: each step's animations are paused the frame they start, then
 * seeked to 0, 40, 80, 120, 180, 240, 320 and 450ms and photographed, so the
 * frames are exact, not whatever a recording happened to catch. They go in
 * .check/motion/. Exit code 1 if anything fails.
 */
const fs = require('fs');
const path = require('path');
const { mirror } = require('./cdn');

let chromium;
try { ({ chromium } = require('playwright')); } catch {
  console.error('This needs Playwright:  npm i -D playwright  then  npx playwright install chromium');
  process.exit(2);
}

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '.check', 'motion');
const args = process.argv.slice(2);
const flag = (f) => args.includes(f);
const opt = (f) => { const i = args.indexOf(f); return i >= 0 ? args[i + 1] : null; };
const target = args.find((a, i) => !a.startsWith('--') && args[i - 1] !== '--steps');
if (!target) { console.error('Usage: node tools/motion.js <page.html | folder | url> [--phone | --desktop] [--steps <json>] [--no-frames]'); process.exit(2); }
const isUrl = /^https?:\/\//.test(target);
let file = isUrl ? target : path.resolve(process.cwd(), target);
if (!isUrl && fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
if (!isUrl && !fs.existsSync(file)) { console.error('Not found: ' + target); process.exit(2); }
const URL0 = isUrl ? file : 'file://' + file;
const SIZES = [
  ...(flag('--desktop') ? [] : [['phone', { width: 400, height: 860 }]]),
  ...(flag('--phone') ? [] : [['desktop', { width: 1280, height: 900 }]]),
];
const FRAMES = [0, 40, 80, 120, 180, 240, 320, 450];
const slug = (isUrl ? target.replace(/^https?:\/\//, '') : path.relative(ROOT, file)).replace(/[^a-z0-9]+/gi, '_').replace(/^_|_$/g, '');

// ---- easing: how far along a curve is at a moment ---------------------------
const KEYWORD = { ease: [0.25, 0.1, 0.25, 1], 'ease-in': [0.42, 0, 1, 1], 'ease-out': [0, 0, 0.58, 1], 'ease-in-out': [0.42, 0, 0.58, 1] };
function curve(easing) {
  const e = String(easing || 'linear').trim();
  if (e === 'linear') return (x) => x;
  if (KEYWORD[e] || e.startsWith('cubic-bezier')) {
    const [x1, y1, x2, y2] = KEYWORD[e] || e.slice(13, -1).split(',').map(Number);
    const bez = (t, a, b) => 3 * a * t * (1 - t) ** 2 + 3 * b * t * t * (1 - t) + t ** 3;
    return (x) => { let lo = 0, hi = 1; for (let i = 0; i < 40; i++) { const m = (lo + hi) / 2; if (bez(m, x1, x2) < x) lo = m; else hi = m; } return bez((lo + hi) / 2, y1, y2); };
  }
  if (e.startsWith('linear(')) {
    const stops = e.slice(7, -1).split(',').map((s) => s.trim().split(/\s+/)).flatMap(([v, ...ps]) => ps.length ? ps.map((p) => [+v, parseFloat(p) / 100]) : [[+v, null]]);
    if (stops[0][1] === null) stops[0][1] = 0;
    if (stops[stops.length - 1][1] === null) stops[stops.length - 1][1] = 1;
    for (let i = 1; i < stops.length; i++) if (stops[i][1] !== null && stops[i][1] < stops[i - 1][1]) stops[i][1] = stops[i - 1][1];
    for (let i = 1; i < stops.length - 1; i++) if (stops[i][1] === null) {
      let j = i; while (stops[j][1] === null) j++;
      const a = stops[i - 1][1], b = stops[j][1];
      for (let k = i; k < j; k++) stops[k][1] = a + ((b - a) * (k - i + 1)) / (j - i + 1);
    }
    return (x) => { for (let i = 1; i < stops.length; i++) if (x <= stops[i][1]) { const [v0, p0] = stops[i - 1], [v1, p1] = stops[i]; return p1 === p0 ? v1 : v0 + ((v1 - v0) * (x - p0)) / (p1 - p0); } return stops[stops.length - 1][0]; };
  }
  if (e.startsWith('steps') || e.startsWith('step-')) return (x) => (x < 1 ? 0 : 1);
  return (x) => x;
}
// The share of the time it takes to cover 95% of the change: when it reads as done.
function done95(easing) {
  const f = curve(easing);
  for (let x = 0; x <= 1; x += 0.005) if (f(x) >= 0.95) return x;
  return 1;
}
const easeIn = (easing) => { const f = curve(easing); return f(0.5) < 0.35 && f(0.9) < 0.9; };
const isLinear = (easing) => { const f = curve(easing); return [0.1, 0.25, 0.5, 0.75, 0.9].every((x) => Math.abs(f(x) - x) < 0.02); };
const nameCurve = (e) => (/^linear\(/.test(e) ? `linear(${e.split(',').length} points)` : e.replace(/\s+/g, ''));

const LAYOUT = /^(width|height|top|left|right|bottom|inset.*|margin.*|padding.*|font-size|line-height|letter-spacing|border(-\w+)*-width|gap|row-gap|column-gap|grid-template.*|flex(-basis|-grow|-shrink)?|min-.*|max-.*)$/;
const MOVES = /^(transform|translate|scale|rotate|offset-.*)$/;
const PAINT = /^(background(-color|-position|-size)?|color|box-shadow|filter|backdrop-filter|clip-path|mask.*|border(-\w+)*-color|outline-color|text-shadow|fill|stroke)$/;

// ---- what runs in the page ----------------------------------------------------
function recorder() {
  const M = (window.__motion = { seen: new Map(), list: [], step: null, freeze: false, frames: [], muts: [], input: null });
  const describe = (el) => !el ? '?' : el === document.documentElement ? 'html' : el.tagName.toLowerCase() + (el.id ? '#' + el.id : '') + [...el.classList].slice(0, 2).map((c) => '.' + c).join('');
  const props = (a) => {
    if (a.transitionProperty) return [a.transitionProperty];
    try { return [...new Set(a.effect.getKeyframes().flatMap((k) => Object.keys(k)).filter((k) => !['offset', 'computedOffset', 'easing', 'composite'].includes(k)))]; } catch { return []; }
  };
  const look = () => {
    const now = performance.now();
    for (const a of document.getAnimations()) {
      if (M.seen.has(a)) continue;
      if (a.timeline && a.timeline !== document.timeline) { M.seen.set(a, { scroll: true }); continue; }   // scroll-driven: not timed motion
      const fx = a.effect, t = fx.getTiming(), kf = (() => { try { return fx.getKeyframes(); } catch { return []; } })();
      const kEase = kf.length === 2 && kf[0].easing && kf[0].easing !== 'linear' ? kf[0].easing : null;
      const pseudo = fx.pseudoElement || '';
      const r = fx.target && !pseudo ? fx.target.getBoundingClientRect() : { width: innerWidth, height: innerHeight };
      const rec = {
        at: now, step: M.step, kind: a.constructor.name, name: a.transitionProperty || a.animationName || a.id || '',
        target: describe(fx.target) + pseudo, pseudo, props: props(a),
        duration: +t.duration || 0, delay: +t.delay || 0, iterations: t.iterations, easing: kEase || t.easing || 'linear',
        area: (r.width * r.height) / (innerWidth * innerHeight),
        values: JSON.stringify(kf).slice(0, 400),
      };
      M.seen.set(a, rec);
      if (M.step !== null) { M.list.push(rec); if (M.freeze && rec.iterations !== Infinity) { a.pause(); a.currentTime = 0; M.frozen.push([a, now]); } }
    }
    if (M.step !== null) M.frames.push(now);
    requestAnimationFrame(look);
  };
  requestAnimationFrame(look);
  new MutationObserver((ms) => { if (M.step !== null) M.muts.push(performance.now()); }).observe(document, { subtree: true, childList: true, attributes: true, characterData: true });
  for (const type of ['pointerdown', 'keydown']) addEventListener(type, () => { if (M.step !== null && M.input === null) M.input = performance.now(); }, true);
  // A press that scrolls (a jump to a section) answers the moment it starts moving.
  addEventListener('scroll', () => { if (M.step !== null) M.muts.push(performance.now()); }, { capture: true, passive: true });
  M.begin = (step, freeze) => {
    for (const a of document.getAnimations()) if (!M.seen.has(a)) M.seen.set(a, { old: true });
    Object.assign(M, { step, freeze, list: [], frames: [], muts: [], frozen: [], first: null, input: null, t0: performance.now(), url: location.href, focus: document.activeElement, y: scrollY });
  };
  M.end = () => {
    const out = { list: M.list, frames: M.frames, muts: M.muts, input: M.input, t0: M.t0, urlChanged: location.href !== M.url, focusChanged: document.activeElement !== M.focus, scrolled: Math.abs(scrollY - M.y) > 2 };
    M.step = null;
    return out;
  };
  // Frames are taken in time order, so an animation seeked past its end is
  // finished for real: its finish handlers run (a removed row is taken out),
  // as they would have when it played.
  M.seek = (t) => {
    const first = M.frozen.length ? M.frozen[0][1] : 0;
    M.first = M.first ?? first;
    M.frozen = M.frozen.filter(([a, at]) => {
      const local = t - (at - M.first), timing = a.effect.getComputedTiming();
      try { if (local >= timing.endTime) { a.finish(); return false; } a.currentTime = Math.max(0, local); } catch {}
      return true;
    });
  };
  M.release = () => { for (const [a] of M.frozen) { try { a.iterations === Infinity ? a.play() : a.finish(); } catch {} } M.frozen = []; M.freeze = false; };
  M.running = () => document.getAnimations().filter((a) => a.playState === 'running' && a.timeline === document.timeline && a.effect.getTiming().iterations !== Infinity).length;
}

// The stylesheet rules that are wrong before anything moves.
function staticRules() {
  const found = { all: [], hover: [], zero: [] };
  const walk = (rules, media) => {
    for (const r of rules) {
      if (r.constructor.name === 'CSSKeyframesRule') { if (/scale\(\s*0\s*\)|scale:\s*0\s*(;|$|!)/.test(r.cssText)) found.zero.push('@keyframes ' + r.name); continue; }
      if (r.cssRules && !r.selectorText) { walk(r.cssRules, (media || '') + (r.conditionText || r.media?.mediaText || '')); continue; }
      if (!r.style) continue;
      const tp = r.style.transitionProperty || '', tr = r.style.transition || '';
      if (/(^|,\s*)all(\s|,|$)/.test(tp) || /(^|,\s*)all\s/.test(tr)) found.all.push(r.selectorText);
      if (/:hover/.test(r.selectorText || '') && (r.style.transform || r.style.translate || r.style.scale || r.style.rotate) && !/hover:\s*hover/.test(media || '')) found.hover.push(r.selectorText);
      if (/scale\(\s*0\s*\)|scale:\s*0\s*(;|$|!)/.test(r.cssText)) found.zero.push(r.selectorText || r.name);   // uniform 0; 'scale: 0 1' is a bar filling
      if (r.cssRules) walk(r.cssRules, media);
    }
  };
  for (const s of document.styleSheets) { try { walk(s.cssRules, ''); } catch {} }
  return found;
}

async function act(page, step) {
  if (step.drag) {
    // Press, travel in small steps (so the page sees a drag, not a jump), let go.
    const a = await page.locator(step.drag).first().boundingBox(), b = await page.locator(step.to).first().boundingBox();
    if (!a || !b) throw new Error(`nothing to drag from ${step.drag} to ${step.to}`);
    await page.mouse.move(a.x + a.width / 2, a.y + a.height / 2); await page.mouse.down();
    await page.mouse.move(b.x + b.width / 2, b.y + Math.min(b.height / 2, 40), { steps: 16 });
    await page.mouse.up();
  } else if (step.click) await page.click(step.click, { timeout: 3000 });
  else if (step.key) await page.keyboard.press(step.key);
  else if (step.back) await page.goBack();
  else if (step.wait) await page.waitForTimeout(step.wait);
}
// A press often answers in two parts: something now, the rest after a wait
// (a request, then a success state that animates). Keep watching until
// nothing is moving and the page has been quiet for 700ms.
async function settle(page, ms = 2500) {
  const t = Date.now();
  await page.waitForTimeout(60);
  while (Date.now() - t < ms) {
    const busy = await page.evaluate(() => __motion.running() > 0 || (__motion.muts.length && performance.now() - __motion.muts[__motion.muts.length - 1] < 700));
    if (!busy) break;
    await page.waitForTimeout(50);
  }
  await page.waitForTimeout(80);
}

async function run(browser, view, tour, { reduce = false, frames = false, tag }) {
  const context = await browser.newContext({ viewport: view, deviceScaleFactor: 1, reducedMotion: reduce ? 'reduce' : 'no-preference' });
  await context.addInitScript(recorder);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  await mirror(page);   // first: routes added later take precedence
  await page.route(/supabase\.co/, (r) => r.fulfill({ status: 200, contentType: 'application/json', body: '{}' }));
  await page.goto(URL0, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(400);
  const results = [];
  for (const [i, step] of tour.entries()) {
    if ((step.phone && tag !== 'phone') || (step.desktop && tag !== 'desktop')) { results.push({ step, skipped: true }); continue; }
    await page.evaluate(([n, f]) => __motion.begin(n, f), [i, frames]);
    let error = null;
    try { await act(page, step); } catch (e) { error = e.message.split('\n')[0]; }
    let shots = [];
    if (frames && !error) {
      await page.waitForTimeout(500);                       // let late starters appear (and be held)
      const held = await page.evaluate(() => __motion.frozen.length);
      if (held) for (const t of FRAMES) {
        await page.evaluate((x) => __motion.seek(x), t);
        await page.evaluate(() => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))));
        shots.push({ t, png: (await page.screenshot()).toString('base64') });
      }
      await page.evaluate(() => __motion.release());
      await settle(page);
      shots.push({ t: 'end', png: (await page.screenshot()).toString('base64') });
    } else await settle(page);
    const rec = await page.evaluate(() => __motion.end());
    results.push({ step, error, ...rec, shots });
  }
  const css = await page.evaluate(staticRules);
  await context.close();
  return { results, css, errors };
}

function judge(live, reduced) {
  const raw = [];     // [level, step index or null, text, element]
  const notes = [];
  const tempo = new Map();
  live.results.forEach((r, i) => {
    if (r.skipped) return;
    if (r.error) { raw.push(['fail', i, `could not run: ${r.error}`]); return; }
    const anims = r.list.filter((a) => a.iterations !== Infinity);
    const changed = r.list.length || r.muts.length || r.urlChanged || r.focusChanged || r.scrolled;   // a jump that scrolls is an answer
    const firstAt = Math.min(...[...r.list.map((a) => a.at), ...r.muts].filter((x) => x >= r.t0), Infinity);
    const latency = firstAt - (r.input ?? r.t0);
    if (!changed) raw.push(['fail', i, 'nothing visibly happened']);
    else if (r.step.click && Number.isFinite(latency) && latency > 300) raw.push(['fail', i, `the first visible change came ${Math.round(latency)}ms after the press`]);
    else if (r.step.click && Number.isFinite(latency) && latency > 100) raw.push(['warn', i, `the first visible change came ${Math.round(latency)}ms after the press`]);
    let vtLong = 0;
    for (const a of anims) {
      const ua = a.name.startsWith('-ua-');
      const moving = a.props.some((p) => MOVES.test(p));
      if (!ua) tempo.set(nameCurve(a.easing), (tempo.get(nameCurve(a.easing)) || 0) + 1);
      if (a.pseudo.startsWith('::view-transition')) vtLong = Math.max(vtLong, a.delay + a.duration);
      if (!a.pseudo.startsWith('::view-transition')) {
        const lay = a.props.filter((p) => LAYOUT.test(p));
        if (lay.length) raw.push(['fail', i, `animates ${lay.join(', ')} on {el}: move it with transform, or let it change instantly`, a.target]);
        const paint = a.props.filter((p) => PAINT.test(p));
        if (paint.length && a.area > 0.25 && a.duration > 200) raw.push(['warn', i, `animates ${paint.join(', ')} across a large area on {el}: repaints every frame`, a.target]);
      }
      if (ua) continue;
      const seen = a.delay + a.duration * done95(a.easing);
      if (a.duration > 0 && seen > 400) raw.push(['fail', i, `{el} takes ${Math.round(seen)}ms to read as done (${a.duration}ms, ${nameCurve(a.easing)}): keep it under 300`, a.target]);
      else if (a.duration > 0 && seen > 300) raw.push(['warn', i, `{el} takes ${Math.round(seen)}ms to read as done: under 300 feels quicker`, a.target]);
      if (a.duration > 0 && a.duration < 60) raw.push(['warn', i, `{el} lasts ${a.duration}ms, too quick to see: make it instant, or 100ms or more`, a.target]);
      if (a.duration > 0 && easeIn(a.easing)) raw.push(['fail', i, `{el} eases in (${nameCurve(a.easing)}): it starts slow, so what is being watched comes late. Use ease-out`, a.target]);
      if (moving && a.duration > 0 && isLinear(a.easing)) raw.push(['warn', i, `{el} moves at a constant speed (linear): only loops and scrolling should`, a.target]);
      if (/scale\(0\)|"scale":"0"/.test(a.values)) raw.push(['warn', i, `{el} grows from nothing (scale 0): start at .95 with opacity 0`, a.target]);
    }
    if (vtLong > 600) raw.push(['warn', i, `the view transition runs ${vtLong}ms, and the page ignores presses until it ends`]);
    const from = Math.min(...anims.map((a) => a.at)), to = Math.max(...anims.map((a) => a.at + a.delay + a.duration));
    const inside = r.frames.filter((t) => t >= from && t <= to);
    const worst = Math.max(0, ...inside.slice(1).map((t, k) => t - inside[k]));
    if (anims.length && worst > 120) raw.push(['warn', i, `a ${Math.round(worst)}ms frame while it moved: something blocks the main thread`]);
  });
  reduced.results.forEach((r, i) => {
    if (r.skipped || r.error) return;
    const moving = r.list.filter((a) => a.iterations !== Infinity && a.duration > 0 && a.props.some((p) => MOVES.test(p)) && !/vt-fade|fade/.test(a.name));
    if (moving.length) raw.push(['fail', i, `moves with reduced motion on: ${[...new Set(moving.map((a) => a.target))].slice(0, 3).join(', ')}. Keep the fade, drop the movement`]);
  });
  // The same finding on several elements in one step is one note.
  const merged = new Map();
  for (const [lvl, at, text, el] of raw) {
    const key = `${lvl}|${at}|${text}`;
    if (!merged.has(key)) merged.set(key, [lvl, at, text, []]);
    if (el) merged.get(key)[3].push(el);
  }
  for (const [lvl, at, text, els] of merged.values()) {
    const named = [...new Set(els)], n = els.length;
    notes.push([lvl, at, named.length ? text.replace('{el}', named.slice(0, 3).join(', ') + (n > 1 ? ` (${n} elements)` : '')) : text]);
  }
  if (tempo.size > 4) notes.push(['warn', null, `${tempo.size} different curves: one tempo reads as one product (${[...tempo.keys()].slice(0, 6).join(', ')})`]);
  const css = live.css;
  if (css.all.length) notes.push(['warn', null, `transition: all on ${css.all.slice(0, 3).join(', ')}: name the properties`]);
  if (css.hover.length) notes.push(['warn', null, `hover moves things for touch too (${css.hover.slice(0, 3).join(', ')}): wrap in @media (hover: hover) and (pointer: fine)`]);
  if (css.zero.length) notes.push(['warn', null, `scale(0) in ${css.zero.slice(0, 3).join(', ')}: nothing appears from nothing; start at .95`]);
  for (const e of live.errors) notes.push(['fail', null, `script error: ${e}`]);
  return { notes, tempo };
}

async function strip(browser, label, shots, outFile, view) {
  const page = await browser.newPage({ viewport: { width: 1600, height: 600 }, deviceScaleFactor: 1 });
  // Wide screens get wide frames, or a desktop filmstrip is unreadable.
  const w = view && view.width > 600 ? 400 : shots.length > 6 ? 180 : 240;
  await page.setContent(`<body style="margin:0;padding:16px;background:#e9e8e4;font:500 13px system-ui;color:#333">
    <div style="margin:0 0 10px">${label.replace(/</g, '&lt;')}</div>
    <div style="display:flex;gap:10px;align-items:flex-start">${shots.map((s) => `<figure style="margin:0"><img style="width:${w}px;display:block;border-radius:6px;box-shadow:0 1px 3px rgba(0,0,0,.2)" src="data:image/png;base64,${s.png}"><figcaption style="margin-top:6px;text-align:center">${s.t === 'end' ? 'settled' : s.t + 'ms'}</figcaption></figure>`).join('')}</div></body>`);
  await page.waitForTimeout(100);
  const box = await page.evaluate(() => ({ width: document.body.scrollWidth, height: document.body.scrollHeight }));
  await page.setViewportSize({ width: Math.max(600, box.width), height: box.height });
  await page.screenshot({ path: outFile, fullPage: true });
  await page.close();
}

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  let tour = opt('--steps') ? JSON.parse(opt('--steps')) : null;
  if (!tour) {
    const p = await browser.newPage();
    await p.goto(URL0, { waitUntil: 'load' });
    tour = await p.evaluate(() => { const s = document.getElementById('motion-tour'); return s ? JSON.parse(s.textContent) : null; });
    await p.close();
  }
  if (!tour || !tour.length) { console.error('No tour: add <script type="application/json" id="motion-tour"> to the page, or pass --steps'); await browser.close(); process.exit(2); }
  fs.mkdirSync(OUT, { recursive: true });
  let failed = false;
  const report = { page: target, sizes: {} };
  for (const [tag, view] of SIZES) {
    const live = await run(browser, view, tour, { tag });
    const reduced = await run(browser, view, tour, { tag, reduce: true });
    const { notes, tempo } = judge(live, reduced);
    console.log(`\n${tag} ${view.width}x${view.height}  ${target}`);
    live.results.forEach((r, i) => {
      const s = r.step, what = s.click || (s.key && 'key ' + s.key) || (s.back && 'back') || (s.wait && `wait ${s.wait}`);
      if (r.skipped) { console.log(`  ${i + 1}. ${s.why || what}  (${tag === 'phone' ? 'desktop' : 'phone'} only)`); return; }
      const anims = (r.list || []).filter((a) => a.iterations !== Infinity && !a.name.startsWith('-ua-'));
      const vt = anims.some((a) => a.pseudo.startsWith('::view-transition'));
      const longest = Math.max(0, ...anims.map((a) => a.delay + a.duration));
      const readsDone = Math.max(0, ...anims.map((a) => a.delay + a.duration * done95(a.easing)));
      const props = [...new Set(anims.flatMap((a) => a.props))].filter((p) => !/^-|^(z-index|mix-blend-mode)$/.test(p));
      const sum = anims.length ? `${anims.length} animation${anims.length > 1 ? 's' : ''}${vt ? ' (view transition)' : ''}, ${longest}ms, done to the eye at ${Math.round(readsDone)}ms; ${props.slice(0, 5).join(', ')}` : (r.error ? '' : 'changes instantly');
      console.log(`  ${i + 1}. ${s.why || what}\n     ${sum}`);
      for (const [lvl, at, text] of notes) if (at === i) console.log(`     ${lvl === 'fail' ? 'FAIL' : 'warn'}  ${text}`);
    });
    for (const [lvl, at, text] of notes) if (at === null) console.log(`  ${lvl === 'fail' ? 'FAIL' : 'warn'}  ${text}`);
    console.log(`  curves: ${[...tempo].map(([c, n]) => `${c} x${n}`).join(', ') || 'none'}`);
    const fails = notes.filter((n) => n[0] === 'fail'), warns = notes.filter((n) => n[0] === 'warn');
    const score = Math.max(0, 100 - fails.length * 12 - warns.length * 4);
    const worst = fails[0] || warns[0];
    console.log(`  SCORE ${score}/100${worst ? `   BOTTLENECK: ${worst[2]}` : '   nothing to fix'}`);
    if (fails.length) failed = true;
    report.sizes[tag] = { score, notes, steps: live.results.map((r) => ({ step: r.step, skipped: !!r.skipped, error: r.error, animations: (r.list || []).map(({ values, ...a }) => a) })) };
    if (!flag('--no-frames')) {
      const shot = await run(browser, view, tour, { tag, frames: true });
      const files = [];
      for (const [i, r] of shot.results.entries()) {
        if (r.skipped || !r.shots || r.shots.length < 2) continue;
        const f = path.join(OUT, `${slug}-${tag}-${i + 1}.png`);
        await strip(browser, `${i + 1}. ${r.step.why || r.step.click || r.step.key || r.step.drag || ''}  (${tag})`, r.shots, f, view);
        files.push(path.relative(process.cwd(), f));
      }
      if (files.length) console.log(`  look: ${files.join('  ')}`);
    }
  }
  fs.writeFileSync(path.join(OUT, `${slug}.json`), JSON.stringify(report, null, 1));
  await browser.close();
  process.exit(failed ? 1 : 0);
})();
