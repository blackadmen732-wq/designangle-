#!/usr/bin/env node
/*
 * Put a screen next to the reference it is meant to match.
 *
 *   node tools/compare.js app-style/screens/netflix-title.html .refs/netflix-hero.png
 *   node tools/compare.js <screen.html> <reference.png> [--band 16,150]
 *
 * Renders the screen as an iPhone 15/16 (393 x 852 points at 2x), then writes
 * three images into .check/compare/:
 *   <name>-side.png      reference | render
 *   <name>-overlay.png   the render at 50% over the reference: anything that
 *                        doubles up is out of place
 *   <name>-render.png    the render on its own
 * and prints where each line of content starts and stops, in points, for the
 * reference and the render, inside an x band (16 to 150 by default). Matching
 * rows is the fastest way to find what is too high, too low, too big or too
 * small before looking at the pictures.
 *
 * A reference is a 786 x 1704 crop of the phone screen from a recording; see
 * app-style/README.md for how to cut one from a video.
 */
const fs = require('fs');
const path = require('path');

let chromium;
try { ({ chromium } = require('playwright')); } catch {
  console.error('This needs Playwright:  npm i -D playwright  then  npx playwright install chromium');
  process.exit(2);
}

const args = process.argv.slice(2);
const files = args.filter((a) => !a.startsWith('--'));
const bandArg = args.find((a) => a.startsWith('--band'));
const band = bandArg ? (args[args.indexOf(bandArg) + 1] || '16,150').split(',').map(Number) : [16, 150];
if (files.length < 2) { console.error('Usage: node tools/compare.js <screen.html> <reference.png> [--band x0,x1]'); process.exit(2); }

const ROOT = path.resolve(__dirname, '..');
const OUT = path.join(ROOT, '.check', 'compare');
const screen = path.resolve(files[0]);
const ref = path.resolve(files[1]);
const name = path.basename(screen, '.html');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 393, height: 852 }, deviceScaleFactor: 2 });
  await page.goto('file://' + screen, { waitUntil: 'load' });
  await page.evaluate(() => document.fonts && document.fonts.ready);
  await page.waitForTimeout(400);
  const renderPath = path.join(OUT, `${name}-render.png`);
  await page.screenshot({ path: renderPath, clip: { x: 0, y: 0, width: 393, height: 852 } });

  const b64 = (p) => 'data:image/png;base64,' + fs.readFileSync(p).toString('base64');
  const sheet = await browser.newPage({ viewport: { width: 786 * 2 + 20, height: 1704 }, deviceScaleFactor: 1 });
  await sheet.setContent(`<body style="margin:0;background:#888;display:flex;gap:20px">
    <img id="a" src="${b64(ref)}" width="786" height="1704"><img id="b" src="${b64(renderPath)}" width="786" height="1704"></body>`);
  await sheet.waitForTimeout(200);
  await sheet.screenshot({ path: path.join(OUT, `${name}-side.png`) });

  await sheet.setViewportSize({ width: 786, height: 1704 });
  await sheet.setContent(`<body style="margin:0;position:relative">
    <img src="${b64(ref)}" width="786" height="1704" style="position:absolute;inset:0">
    <img src="${b64(renderPath)}" width="786" height="1704" style="position:absolute;inset:0;opacity:.5"></body>`);
  await sheet.waitForTimeout(200);
  await sheet.screenshot({ path: path.join(OUT, `${name}-overlay.png`) });

  // Row runs inside the band, computed on a canvas in the page.
  const runs = await sheet.evaluate(async ({ srcs, band }) => {
    const load = (src) => new Promise((ok) => { const i = new Image(); i.onload = () => ok(i); i.src = src; });
    const out = [];
    for (const src of srcs) {
      const img = await load(src);
      const c = document.createElement('canvas'); c.width = 786; c.height = 1704;
      const g = c.getContext('2d'); g.drawImage(img, 0, 0, 786, 1704);
      const x0 = band[0] * 2, x1 = band[1] * 2;
      const d = g.getImageData(x0, 0, x1 - x0, 1704).data;
      const w = x1 - x0, list = []; let start = null;
      for (let y = 0; y < 1704; y++) {
        const lum = [];
        for (let x = 0; x < w; x++) { const i = (y * w + x) * 4; lum.push(0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]); }
        const sorted = [...lum].sort((a, b) => a - b), med = sorted[sorted.length >> 1];
        const hit = lum.filter((v) => Math.abs(v - med) > 60).length > 2;
        if (hit && start === null) start = y;
        if (!hit && start !== null) { if (y - start >= 3) list.push([start / 2, y / 2]); start = null; }
      }
      out.push(list.map(([a, b]) => `${Math.round(a)}-${Math.round(b)}`).join(' '));
    }
    return out;
  }, { srcs: [b64(ref), b64(renderPath)], band });

  console.log(`rows in x ${band[0]}-${band[1]}pt`);
  console.log('  reference:', runs[0]);
  console.log('  render:   ', runs[1]);
  console.log(`look: .check/compare/${name}-side.png  .check/compare/${name}-overlay.png`);
  await browser.close();
})();
