#!/usr/bin/env node
/*
 * The match loop: render a screen at its reference's size, put the two side
 * by side, and score how close they are.
 *
 *   node tools/match.js app-style/examples/cinema-login .refs/cinema-login.png
 *   node tools/match.js <screen.html | folder> <reference.png> [--wait 1200]
 *
 * Writes into .check/match/:
 *   <name>-side.png     reference on the left, render on the right
 *   <name>-render.png   the render on its own, at the reference's size
 *
 * The score is out of 100 and has three parts, so a screen cannot pass by
 * being the right brightness while everything sits in the wrong place:
 *
 *   structure  SSIM of the two images in grey, at 1/4 size: are the same
 *              shapes in the same places                    (weight 0.5)
 *   layout     how well the edges line up, row by row and column by
 *              column: are the panels, lines and text blocks where the
 *              reference has them                           (weight 0.3)
 *   tone       how close the brightness is across a 16 x 9 grid: is the
 *              light where the reference's light is         (weight 0.2)
 *
 * Read it as a direction, not a verdict: about 70 means the right screen
 * with things out of place, 80 and up means the layout is right and what is
 * left is detail. Open the side-by-side every time; a number cannot see a
 * logo that is the wrong shape.
 *
 * Runs on a desktop screen, unlike tools/compare.js, which is for phone
 * recreations. The page is held still before the picture is taken (motion
 * paused at the end of its entrance), so the score does not depend on when
 * the shutter fell.
 *
 * Where Playwright's own browser cannot be downloaded, point CHROME_PATH at
 * any Chromium: CHROME_PATH=/path/to/chrome node tools/match.js ...
 */
const fs = require('fs');
const path = require('path');

let chromium;
try { ({ chromium } = require('playwright')); } catch {
  console.error('This needs Playwright:  npm i -D playwright  then  npx playwright install chromium');
  process.exit(2);
}

const args = process.argv.slice(2);
const files = args.filter((a, i) => !a.startsWith('--') && !(args[i - 1] || '').startsWith('--'));
const waitAt = args.indexOf('--wait');
const wait = waitAt >= 0 ? Number(args[waitAt + 1]) : 1400;
if (files.length < 2) { console.error('Usage: node tools/match.js <screen.html | folder> <reference.png> [--wait ms]'); process.exit(2); }

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '.check', 'match');
let screen = path.resolve(files[0]);
if (fs.existsSync(screen) && fs.statSync(screen).isDirectory()) screen = path.join(screen, 'index.html');
const ref = path.resolve(files[1]);
for (const f of [screen, ref]) if (!fs.existsSync(f)) { console.error('Not found: ' + f); process.exit(2); }
const name = path.basename(path.dirname(screen)) === 'examples' ? path.basename(screen, '.html') : path.basename(path.dirname(screen));

/* The PNG's own size, read from its header, so the render matches it. */
const head = fs.readFileSync(ref);
const W = head.readUInt32BE(16), H = head.readUInt32BE(20);
const refURL = 'data:image/png;base64,' + head.toString('base64');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  await page.goto('file://' + screen);
  await page.waitForTimeout(wait);
  /* Hold everything still: finish entrances, stop drifts where they are. */
  await page.evaluate(() => document.getAnimations().forEach((a) => {
    const t = a.effect && a.effect.getComputedTiming();
    if (t && t.iterations === Infinity) a.pause(); else try { a.finish(); } catch (e) { a.pause(); }
  }));
  await page.waitForTimeout(100);
  const renderPath = path.join(OUT, `${name}-render.png`);
  const shot = await page.screenshot({ path: renderPath });
  const renderURL = 'data:image/png;base64,' + shot.toString('base64');

  /* Score and lay out the side-by-side in a blank page, with a canvas. */
  const lab = await browser.newPage({ viewport: { width: W * 2 + 24, height: H + 56 }, deviceScaleFactor: 1 });
  await lab.setContent(`<body style="margin:0;background:#1a1a1d;font:600 18px Inter,system-ui,sans-serif;color:#ddd">
    <div style="display:flex;gap:24px;padding:0">
      <figure style="margin:0"><figcaption style="height:56px;line-height:56px;padding-left:12px">Reference</figcaption><img id="a" src="${refURL}" width="${W}" height="${H}"></figure>
      <figure style="margin:0"><figcaption style="height:56px;line-height:56px;padding-left:12px">Render</figcaption><img id="b" src="${renderURL}" width="${W}" height="${H}"></figure>
    </div></body>`);
  await lab.waitForFunction(() => [...document.images].every((i) => i.complete && i.naturalWidth));
  const result = await lab.evaluate(() => {
    const grey = (img, w, h) => {
      const c = document.createElement('canvas'); c.width = w; c.height = h;
      const x = c.getContext('2d'); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, w, h);
      const d = x.getImageData(0, 0, w, h).data, g = new Float32Array(w * h);
      for (let i = 0; i < g.length; i++) g[i] = 0.2126 * d[i * 4] + 0.7152 * d[i * 4 + 1] + 0.0722 * d[i * 4 + 2];
      return g;
    };
    const A = document.getElementById('a'), B = document.getElementById('b');
    const w = Math.round(A.naturalWidth / 4), h = Math.round(A.naturalHeight / 4);
    const a = grey(A, w, h), b = grey(B, w, h);

    // structure: mean SSIM over 8 x 8 windows
    const C1 = (0.01 * 255) ** 2, C2 = (0.03 * 255) ** 2;
    let ssim = 0, n = 0;
    for (let y = 0; y + 8 <= h; y += 4) for (let x = 0; x + 8 <= w; x += 4) {
      let ma = 0, mb = 0;
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) { ma += a[(y + j) * w + x + i]; mb += b[(y + j) * w + x + i]; }
      ma /= 64; mb /= 64;
      let va = 0, vb = 0, cov = 0;
      for (let j = 0; j < 8; j++) for (let i = 0; i < 8; i++) {
        const da = a[(y + j) * w + x + i] - ma, db = b[(y + j) * w + x + i] - mb;
        va += da * da; vb += db * db; cov += da * db;
      }
      va /= 63; vb /= 63; cov /= 63;
      ssim += ((2 * ma * mb + C1) * (2 * cov + C2)) / ((ma * ma + mb * mb + C1) * (va + vb + C2)); n++;
    }
    const structure = Math.max(0, ssim / n);

    // layout: edge energy per row and per column, correlated
    const edges = (g) => {
      const rows = new Float32Array(h), cols = new Float32Array(w);
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const gx = g[y * w + x + 1] - g[y * w + x - 1], gy = g[(y + 1) * w + x] - g[(y - 1) * w + x];
        const m = Math.hypot(gx, gy); rows[y] += m; cols[x] += m;
      }
      return [rows, cols];
    };
    const corr = (p, q) => {
      const N = p.length; let mp = 0, mq = 0;
      for (let i = 0; i < N; i++) { mp += p[i]; mq += q[i]; }
      mp /= N; mq /= N; let s = 0, sp = 0, sq = 0;
      for (let i = 0; i < N; i++) { s += (p[i] - mp) * (q[i] - mq); sp += (p[i] - mp) ** 2; sq += (q[i] - mq) ** 2; }
      return sp && sq ? s / Math.sqrt(sp * sq) : 0;
    };
    const [ra, ca] = edges(a), [rb, cb] = edges(b);
    const layout = Math.max(0, (corr(ra, rb) + corr(ca, cb)) / 2);

    // tone: mean brightness in a 16 x 9 grid
    let diff = 0;
    for (let gy = 0; gy < 9; gy++) for (let gx = 0; gx < 16; gx++) {
      let sa = 0, sb = 0, k = 0;
      for (let y = Math.floor(gy * h / 9); y < Math.floor((gy + 1) * h / 9); y++)
        for (let x = Math.floor(gx * w / 16); x < Math.floor((gx + 1) * w / 16); x++) { sa += a[y * w + x]; sb += b[y * w + x]; k++; }
      diff += Math.abs(sa - sb) / k;
    }
    const tone = Math.max(0, 1 - diff / 144 / 48);   // 48 grey levels apart on average scores 0

    const score = 100 * (0.5 * structure + 0.3 * layout + 0.2 * tone);
    return { structure, layout, tone, score };
  });
  await lab.screenshot({ path: path.join(OUT, `${name}-side.png`) });
  await browser.close();

  const pct = (v) => Math.round(v * 100);
  console.log(`\n  ${name}   ${W} x ${H}`);
  console.log(`    structure ${pct(result.structure)}   layout ${pct(result.layout)}   tone ${pct(result.tone)}`);
  console.log(`    match     ${result.score.toFixed(1)} / 100`);
  console.log(`    .check/match/${name}-side.png\n`);
})().catch((e) => { console.error('match failed: ' + e.message); process.exit(1); });
