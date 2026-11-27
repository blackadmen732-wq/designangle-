#!/usr/bin/env node
/*
 * A redesign told as a short vertical video, built the way her reels are
 * (docs/research/her-redesigns.md, the redesign-eye skill): a hook, the
 * problem on the old screen, "Let's fix it", each change with the camera on
 * it, before and after, and the ask. Her structure and her timing; our title
 * card, our mark and our captions, never hers.
 *
 *   node tools/reel.js app-style/examples/chick-fil-a/reel.json
 *   node tools/reel.js <script.json> [--out file.mp4] [--fps 30] [--until 12]
 *
 * Writes .check/reel/<name>.mp4 (1080 x 1920, silent: the words are on
 * screen, as most people watch) and <name>-sheet.png, one frame from every
 * beat, to look at before watching.
 *
 * The script:
 *   {
 *     "name": "chick-fil-a",
 *     "title": ["Chick-fil-A", "redesign study"],     the hook, in two tones
 *     "note": "Unofficial. Not affiliated with Chick-fil-A.",
 *     "mark": "Design Angle",
 *     "shots": {
 *       "before": { "page": "git:2c2fc96:app-style/examples/chick-fil-a/index.html" },
 *       "after":  { "page": "app-style/examples/chick-fil-a/index.html", "hash": "#/home" }
 *     },
 *     "beats": [
 *       { "say": "Let's redesign our Chick-fil-A study.", "hook": true },
 *       { "say": "This is it right now.", "shot": "before" },
 *       { "say": "A photo takes the top third...", "shot": "before", "focus": [".cf-hero", ".cf-h1"] },
 *       { "say": "Let's fix it, step by step.", "shot": "after" },
 *       { "say": "The restaurant is the headline now...", "shot": "after", "focus": ".cf-head" },
 *       { "say": "Which app next?", "ask": true }
 *     ]
 *   }
 *
 * A shot is a page photographed at 393 x 852 points (2x): a path, a URL, or
 * git:<rev>:<path>, the same page at an earlier commit. It can set a hash,
 * run steps first ("do": [{ "click": "#again" }, { "wait": 600 }]) and
 * scroll ("scroll": 400). A beat's focus is a selector, a list of them (the
 * box around all), or [x, y, w, h] in points: the camera moves in on it and a
 * box marks it. A beat without one shows the whole screen. A beat without a
 * shot keeps the last one.
 *
 * Her numbers, measured (tools/watch.py): the camera moves to 1.2 times in
 * 600ms on an S-curve and holds; the box comes as it lands; a change of
 * screen dissolves in place in 280ms, nothing slides; words come one at a
 * time, 3.4 a second; a countdown runs top right.
 */
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const { chromium } = require('playwright');
const { mirror } = require('./cdn');

const ROOT = path.join(__dirname, '..');
const W = 1080, H = 1920, PT_W = 393, PT_H = 852;
const PACE = 0.29;          // seconds a word: 3.4 a second, as she speaks
const MOVE = 0.6;           // the camera's move, on an S-curve
const ZOOM = 1.2;           // how far it moves in
const PULL = 0.25;          // and how far the focus comes toward the middle
const FADE = 0.28;          // a change of screen, dissolved in place

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); return i >= 0 ? args[i + 1] : d; };
const scriptPath = args.find((a) => a.endsWith('.json'));
if (!scriptPath) { console.error('usage: node tools/reel.js <script.json> [--out file.mp4] [--fps 30] [--until seconds]'); process.exit(2); }
const S = JSON.parse(fs.readFileSync(scriptPath, 'utf8'));
const name = S.name || path.basename(scriptPath, '.json');
const FPS = +opt('--fps', 30);
const UNTIL = opt('--until') ? +opt('--until') : null;
const OUT_DIR = path.join(ROOT, '.check', 'reel');
const out = path.resolve(opt('--out', path.join(OUT_DIR, `${name}.mp4`)));
fs.mkdirSync(path.join(OUT_DIR, name), { recursive: true });

// ---- the pages, photographed ---------------------------------------------
// git:<rev>:<path> is the page as it was at that commit, with everything it
// links to, from `git archive` (kept in .check/reel/git-<rev>).
function pageUrl(p) {
  if (/^https?:\/\//.test(p)) return p;
  const m = p.match(/^git:([^:]+):(.+)$/);
  if (m) {
    const dir = path.join(OUT_DIR, `git-${m[1]}`);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      const tar = execFileSync('git', ['archive', m[1]], { cwd: ROOT, maxBuffer: 1 << 30 });
      execFileSync('tar', ['-x', '-C', dir], { input: tar, maxBuffer: 1 << 30 });
    }
    return 'file://' + path.join(dir, m[2]);
  }
  return 'file://' + path.resolve(ROOT, p);
}

const asList = (f) => (f == null ? [] : Array.isArray(f) && typeof f[0] === 'number' ? [] : [].concat(f));
// the shot a beat is on: its own, or the last one named before it
const shotOf = (i) => { for (let j = i; j >= 0; j--) if (S.beats[j].shot) return S.beats[j].shot; return Object.keys(S.shots)[0]; };

async function photograph(browser) {
  const shots = {};
  for (const [key, spec] of Object.entries(S.shots)) {
    const ctx = await browser.newContext({ viewport: { width: PT_W, height: PT_H }, deviceScaleFactor: 2 });
    const page = await ctx.newPage();
    await mirror(page);
    await page.goto(pageUrl(spec.page) + (spec.hash || ''), { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(700);
    for (const step of spec.do || []) {
      if (step.click) await page.click(step.click);
      if (step.hash) await page.evaluate((h) => (location.hash = h), step.hash);
      if (step.wait) await page.waitForTimeout(step.wait);
    }
    if (spec.scroll) await page.evaluate((y) => scrollTo(0, y), spec.scroll);
    await page.waitForTimeout(900);
    const file = path.join(OUT_DIR, name, `${key}.png`);
    await page.screenshot({ path: file });
    // every focus this shot is asked for, in points on the screen
    const wanted = [...new Set(S.beats.filter((b, i) => shotOf(i) === key).flatMap((b) => asList(b.focus)))];
    const rects = await page.evaluate((sels) => Object.fromEntries(sels.map((s) => {
      const e = document.querySelector(s); if (!e) return [s, null];
      const r = e.getBoundingClientRect(); return [s, [r.left, r.top, r.width, r.height]];
    })), wanted);
    for (const [s, r] of Object.entries(rects)) if (!r) console.warn(`  focus not found in shot "${key}": ${s}`);
    shots[key] = { file, rects };
    await ctx.close();
  }
  return shots;
}

// ---- the timeline ---------------------------------------------------------
function timeline(shots) {
  let t = 0, shot = null, lastFocus = null;
  const beats = S.beats.map((b) => {
    const words = b.say.trim().split(/\s+/);
    const speak = 0.25 + words.length * PACE;
    const dur = Math.max(b.hook ? 3.2 : 1.9, speak + 0.75) + (b.ask ? 1.6 : 0);
    const prev = shot;
    shot = b.shot || shot || Object.keys(shots)[0];
    let focus = null;
    if (Array.isArray(b.focus) && typeof b.focus[0] === 'number') focus = b.focus;
    else {
      const rs = asList(b.focus).map((s) => shots[shot].rects[s]).filter(Boolean);
      if (rs.length) {
        const x0 = Math.min(...rs.map((r) => r[0])), y0 = Math.min(...rs.map((r) => r[1]));
        const x1 = Math.max(...rs.map((r) => r[0] + r[2])), y1 = Math.max(...rs.map((r) => r[1] + r[3]));
        focus = [x0, y0, x1 - x0, y1 - y0];
      }
    }
    if (focus) {   // keep the box on the screen
      const x0 = Math.max(4, focus[0] - 6), y0 = Math.max(4, focus[1] - 6);
      focus = [x0, y0, Math.min(PT_W - 4, focus[0] + focus[2] + 6) - x0, Math.min(PT_H - 4, focus[1] + focus[3] + 6) - y0];
    }
    const beat = {
      t0: t, t1: t + dur, hook: !!b.hook, ask: !!b.ask, shot, prev, focus,
      // a new screen dissolves in once the camera has landed (moving in to a
      // box, or back out from the last one) and the box is on it
      swap: prev && prev !== shot ? t + (focus || lastFocus ? MOVE + 0.15 : 0.12) : null,
      words: b.ask ? [{ w: b.say, t: t + 0.25 }] : words.map((w, i) => ({ w: w.replace(/[.,:;]+$/, ''), t: t + 0.25 + i * PACE })),
    };
    t += dur; lastFocus = focus;
    return beat;
  });
  return { beats, total: t };
}

// ---- the stage: one page, drawn for any moment by render(t) ---------------
function stage(shots, tl) {
  const phoneW = 700, k = phoneW / PT_W, phoneH = PT_H * k;
  const X0 = (W - phoneW) / 2, Y0 = (H - phoneH) / 2 + 20;
  const imgs = Object.entries(shots).map(([key, s]) => `<img class="shot" data-k="${key}" src="data:image/png;base64,${fs.readFileSync(s.file).toString('base64')}">`).join('');
  const [t1, t2] = [].concat(S.title || [S.name || '', '']);
  const esc = (s) => String(s || '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  html, body { margin: 0; width: ${W}px; height: ${H}px; overflow: hidden; background: #0d0e0f; }
  * { box-sizing: border-box; }
  body { font-family: Inter, system-ui, sans-serif; -webkit-font-smoothing: antialiased; color: #fff; }
  .bg { position: absolute; inset: 0; background-size: cover; background-position: center; }
  .shade { position: absolute; inset: 0; background: radial-gradient(120% 80% at 50% 45%, rgba(0,0,0,.25), rgba(0,0,0,.72)); }
  .cam { position: absolute; inset: 0; transform-origin: ${W / 2}px ${H / 2}px; will-change: transform; }
  .phone { position: absolute; left: ${X0 - 16}px; top: ${Y0 - 16}px; width: ${phoneW + 32}px; height: ${phoneH + 32}px; border-radius: 112px; background: #050505;
    box-shadow: 0 0 0 2px #2a2b2d, 0 40px 120px rgba(0,0,0,.55); }
  .screen { position: absolute; left: 16px; top: 16px; width: ${phoneW}px; height: ${phoneH}px; border-radius: 96px; overflow: hidden; background: #fff; }
  .shot { position: absolute; inset: 0; width: 100%; height: 100%; opacity: 0; }
  .box { position: absolute; z-index: 5; border: 4px solid ${S.box || '#2f80ff'}; border-radius: 10px; opacity: 0; }
  .status { position: absolute; z-index: 6; left: 0; right: 0; top: 0; height: ${54 * k}px; display: flex; align-items: center; justify-content: space-between; padding: ${10 * k}px ${27 * k}px 0 ${30 * k}px;
    font-size: ${17 * k}px; font-weight: 600; letter-spacing: -0.01em; }
  .island { position: absolute; z-index: 7; top: ${11 * k}px; left: 50%; width: ${120 * k}px; height: ${35 * k}px; transform: translateX(-50%); border-radius: 999px; background: #000; }
  .bars { display: flex; gap: ${5 * k}px; align-items: center; }
  .bars i { display: block; background: currentColor; border-radius: ${2 * k}px; }
  .box i { position: absolute; width: 16px; height: 16px; background: #fff; border: 4px solid ${S.box || '#2f80ff'}; border-radius: 3px; }
  .box i:nth-child(1) { left: -10px; top: -10px; } .box i:nth-child(2) { right: -10px; top: -10px; }
  .box i:nth-child(3) { left: -10px; bottom: -10px; } .box i:nth-child(4) { right: -10px; bottom: -10px; }
  .title { position: absolute; left: 80px; right: 80px; top: 560px; text-align: center; }
  .title h1 { margin: 0; font-size: 120px; font-weight: 500; line-height: 1.05; letter-spacing: -0.03em; }
  .title h1 span { display: block; color: rgba(255,255,255,.55); }
  .note { position: absolute; left: 80px; right: 80px; bottom: 150px; text-align: center; font-size: 34px; color: rgba(255,255,255,.6); }
  .cap { position: absolute; left: 50%; top: 0; transform: translate(-50%, -50%); white-space: nowrap; padding: 18px 34px; border-radius: 999px;
    background: #fff; color: #0c0e0b; font-size: 58px; font-weight: 700; letter-spacing: -0.02em; box-shadow: 0 16px 40px rgba(0,0,0,.35); opacity: 0; }
  /* on dark glass, so they stay readable when the phone moves in under them */
  .top { position: absolute; z-index: 10; top: 72px; padding: 12px 26px; border-radius: 999px; font-size: 38px; font-weight: 600; letter-spacing: -0.01em;
    background: rgba(14, 14, 15, .5); -webkit-backdrop-filter: blur(16px); backdrop-filter: blur(16px); }
  .mark { left: 48px; } .clock { right: 48px; font-variant-numeric: tabular-nums; }
  .cap { z-index: 10; }
  </style></head><body>
  <div class="bg" id="bgA"></div><div class="bg" id="bgB"></div><div class="shade"></div>
  <div class="cam" id="cam"><div class="phone" id="phone"><div class="screen">${imgs}<div class="box" id="box"><i></i><i></i><i></i><i></i></div>${S.statusBar === false ? '' : `<div class="island"></div><div class="status" id="status"><span>9:41</span><span class="bars"><i style="width:${3.2 * k}px;height:${5 * k}px"></i><i style="width:${3.2 * k}px;height:${7.5 * k}px"></i><i style="width:${3.2 * k}px;height:${10 * k}px"></i><i style="width:${3.2 * k}px;height:${12 * k}px"></i><i style="width:${25 * k}px;height:${12 * k}px;margin-left:${6 * k}px;border-radius:${4 * k}px"></i></span></div>`}</div></div></div>
  <div class="title" id="title"><h1>${esc(t1)}<span>${esc(t2)}</span></h1></div>
  <div class="note" id="note">${esc(S.note)}</div>
  <div class="cap" id="cap"></div>
  <div class="top mark">${esc(S.mark || '')}</div><div class="top clock" id="clock"></div>
  <script>
  const TL = ${JSON.stringify(tl)};
  const W = ${W}, H = ${H}, X0 = ${X0}, Y0 = ${Y0}, K = ${k}, MOVE = ${MOVE}, ZOOM = ${ZOOM}, PULL = ${PULL}, FADE = ${FADE};
  const $ = (id) => document.getElementById(id);
  const shots = Object.fromEntries([...document.querySelectorAll('.shot')].map((i) => [i.dataset.k, i]));
  // blurred, dimmed copies of each screen for the ground behind the phone, made once
  const blurred = {}, ink = {};
  async function prepare() {
    for (const [k, img] of Object.entries(shots)) {
      await img.decode();
      const c = document.createElement('canvas'); c.width = 270; c.height = 480;
      const x = c.getContext('2d'); x.filter = 'blur(18px) brightness(.55) saturate(1.2)';
      x.drawImage(img, -40, -40, 350, 560);
      blurred[k] = 'url(' + c.toDataURL('image/jpeg', .8) + ')';
      const top = document.createElement('canvas'); top.width = 40; top.height = 4;
      top.getContext('2d').drawImage(img, 0, 0, img.naturalWidth, img.naturalHeight * 0.05, 0, 0, 40, 4);
      const d = top.getContext('2d').getImageData(0, 0, 40, 4).data; let l = 0;
      for (let j = 0; j < d.length; j += 4) l += (d[j] * .299 + d[j + 1] * .587 + d[j + 2] * .114);
      ink[k] = l / (d.length / 4) > 150 ? '#0c0e0b' : '#ffffff';
    }
  }
  const clamp = (v) => Math.max(0, Math.min(1, v));
  const ease = (p) => (p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);   // her S-curve
  function cam(b) {
    if (!b || !b.focus) return { s: 1, x: 0, y: 0 };
    const fx = X0 + K * (b.focus[0] + b.focus[2] / 2), fy = Y0 + K * (b.focus[1] + b.focus[3] / 2);
    const dx = fx - W / 2, dy = fy - H / 2;
    return { s: ZOOM, x: dx * (1 - ZOOM - PULL), y: dy * (1 - ZOOM - PULL) };
  }
  function render(t) {
    let i = TL.beats.findIndex((b) => t < b.t1); if (i < 0) i = TL.beats.length - 1;
    const b = TL.beats[i];
    const prev = TL.beats[i - 1];
    // the camera: from where the last beat left it to this beat's framing
    const a = cam(prev && !prev.hook ? prev : null), z = cam(b), p = ease(clamp((t - b.t0) / MOVE));
    const hold = clamp((t - b.t0 - MOVE) / Math.max(.1, b.t1 - b.t0 - MOVE));
    const s = (a.s + (z.s - a.s) * p) * (1 + 0.012 * hold);
    $('cam').style.transform = 'translate(' + (a.x + (z.x - a.x) * p) + 'px,' + (a.y + (z.y - a.y) * p) + 'px) scale(' + s + ')';
    // the screens: the old one until this beat's change, then a dissolve in place
    const mix = b.swap == null ? 1 : clamp((t - b.swap) / FADE);
    // the incoming screen always on top of the outgoing one, whichever it is
    for (const [k, img] of Object.entries(shots)) {
      const incoming = k === b.shot, outgoing = k === b.prev && b.swap != null;
      img.style.zIndex = incoming ? 2 : outgoing ? 1 : 0;
      img.style.opacity = incoming ? mix : outgoing ? 1 : 0;
    }
    $('bgA').style.backgroundImage = blurred[b.prev && b.swap != null ? b.prev : b.shot]; $('bgB').style.backgroundImage = blurred[b.shot]; $('bgB').style.opacity = mix;
    // the hook: our title over the old screen, blurred; the phone dissolves in at its end
    if ($('status')) $('status').style.color = ink[mix > 0.5 ? b.shot : (b.prev || b.shot)];
    const hookOut = b.hook ? clamp((t - (b.t1 - 0.3)) / 0.3) : 1;
    $('title').style.opacity = $('note').style.opacity = b.hook ? 1 - hookOut : 0;
    $('phone').style.opacity = b.hook ? hookOut : 1;
    // the box: on as the camera lands, off as the beat ends
    const box = $('box');
    if (b.focus) {
      Object.assign(box.style, { left: b.focus[0] * K + 'px', top: b.focus[1] * K + 'px', width: b.focus[2] * K + 'px', height: b.focus[3] * K + 'px' });
      box.style.opacity = Math.min(clamp((t - b.t0 - MOVE + 0.05) / 0.15), clamp((b.t1 - t) / 0.12));
    } else box.style.opacity = 0;
    // the words, one at a time, away from what changes
    const w = [...b.words].reverse().find((x) => t >= x.t);
    const cap = $('cap');
    if (w && t < b.t1 - 0.05) {
      cap.textContent = w.w; const age = t - w.t;
      const r = b.focus ? (Y0 + K * (b.focus[1] + b.focus[3] / 2)) : 0;
      const y = b.hook ? 1180 : b.ask ? 1500 : b.focus ? (r < H * 0.5 ? 1560 : 360) : 1560;
      cap.style.top = y + 'px';
      cap.style.opacity = clamp(age / 0.06);
      cap.style.transform = 'translate(-50%,-50%) scale(' + (0.92 + 0.08 * clamp(age / 0.09)) + ')';
    } else cap.style.opacity = 0;
    const left = Math.max(0, Math.ceil(TL.total - t));
    $('clock').textContent = Math.floor(left / 60) + ':' + String(left % 60).padStart(2, '0');
  }
  window.ready = prepare();
  window.render = render;
  </script></body></html>`;
}

// ---- frames into ffmpeg -----------------------------------------------------
(async () => {
  const browser = await chromium.launch();
  console.log(`reel: ${name}`);
  const shots = await photograph(browser);
  const tl = timeline(shots);
  const total = UNTIL ? Math.min(UNTIL, tl.total) : tl.total;
  console.log(`  ${tl.beats.length} beats, ${tl.total.toFixed(1)}s`);
  const html = path.join(OUT_DIR, name, 'stage.html');
  fs.writeFileSync(html, stage(shots, tl));
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto('file://' + html);
  await page.evaluate(() => window.ready);
  const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
  // one frame from late in every beat, for the contact sheet
  const sample = tl.beats.map((b) => Math.round((b.t0 + (b.t1 - b.t0) * 0.8) * FPS));
  const sheet = [];
  const n = Math.round(total * FPS);
  for (let f = 0; f < n; f++) {
    await page.evaluate((t) => window.render(t), f / FPS);
    const jpg = await page.screenshot({ type: 'jpeg', quality: 90 });
    if (!ff.stdin.write(jpg)) await new Promise((r) => ff.stdin.once('drain', r));
    if (sample.includes(f)) { const p = path.join(OUT_DIR, name, `beat-${String(sheet.length).padStart(2, '0')}.jpg`); fs.writeFileSync(p, jpg); sheet.push(p); }
    if (f % (FPS * 5) === 0) process.stdout.write(`  ${(f / FPS).toFixed(0)}s `);
  }
  ff.stdin.end();
  await new Promise((r) => ff.on('close', r));
  await browser.close();
  if (sheet.length) {
    const cols = Math.min(sheet.length, 7), sheetPng = path.join(OUT_DIR, `${name}-sheet.png`);
    execFileSync('ffmpeg', ['-v', 'error', '-y', '-i', path.join(OUT_DIR, name, 'beat-%02d.jpg'), '-vf', `scale=270:-1,tile=${cols}x${Math.ceil(sheet.length / cols)}:padding=8:color=white`, '-frames:v', '1', sheetPng]);
    console.log(`\n  sheet: ${path.relative(ROOT, sheetPng)}`);
  }
  console.log(`  video: ${path.relative(ROOT, out)} (${total.toFixed(1)}s)`);
})().catch((e) => { console.error(e); process.exit(1); });
