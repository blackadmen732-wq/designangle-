#!/usr/bin/env node
/*
 * Put two or more versions of a screen on one sheet, labelled A, B, C, for a
 * blind pick: the self-correction step.
 *
 *   node tools/sheet.js <page-or-folder> <page-or-folder> [...] [--size 1440x900] [--out name]
 *
 * Renders each page at the size given (1440 x 900 by default; desktop
 * screens), waits for arrivals to finish, and writes:
 *   .check/sheet/<name>.png      the versions side by side, labelled A, B, ...
 *   .check/sheet/<name>-A.png    each version on its own, full size
 * and prints which letter is which page. Give the sheet, not the page names,
 * to a reviewer who has not seen the work (a fresh session or subagent), with
 * the brief, and ask: which would a paying client pick, and the three things
 * that would most improve it. Then fix the winner and delete the others.
 * See app-style/desktop/README.md, "Final pass".
 *
 * Where Playwright's own browser cannot be downloaded, point CHROME_PATH at
 * any Chromium.
 */
const fs = require('fs');
const path = require('path');

let chromium;
try { ({ chromium } = require('playwright')); } catch {
  console.error('This needs Playwright:  npm i -D playwright  then  npx playwright install chromium');
  process.exit(2);
}

const args = process.argv.slice(2);
const opt = (k, d) => { const i = args.indexOf(k); if (i < 0) return d; const v = args[i + 1]; args.splice(i, 2); return v; };
const [W, H] = opt('--size', '1440x900').split('x').map(Number);
const name = opt('--out', 'sheet');
const pages = args.map(p => {
  const f = fs.existsSync(p) && fs.statSync(p).isDirectory() ? path.join(p, 'index.html') : p;
  if (!fs.existsSync(f)) { console.error('No such page: ' + p); process.exit(2); }
  return path.resolve(f);
});
if (pages.length < 2) { console.error('Give two or more pages.'); process.exit(2); }

const OUT = path.join('.check', 'sheet');
fs.mkdirSync(OUT, { recursive: true });

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  const shots = [];
  for (let i = 0; i < pages.length; i++) {
    const L = String.fromCharCode(65 + i);
    const page = await browser.newPage({ viewport: { width: W, height: H } });
    await page.goto('file://' + pages[i]);
    await page.waitForTimeout(1600);                    // arrivals, bars, light settle
    const file = path.join(OUT, `${name}-${L}.png`);
    await page.screenshot({ path: file });
    shots.push({ L, file, src: pages[i] });
    await page.close();
  }
  const cols = shots.length <= 2 ? shots.length : 2;
  const cw = 960, ch = Math.round(cw * H / W);
  const html = '<body style="margin:0;background:#141416;font:600 22px system-ui;color:#eee">'
    + `<div style="display:grid;grid-template-columns:repeat(${cols},${cw}px);gap:20px;padding:20px">`
    + shots.map(s => `<div><div style="margin:0 0 10px">${s.L}</div><img style="display:block;width:${cw}px;height:${ch}px" src="data:image/png;base64,${fs.readFileSync(s.file).toString('base64')}"></div>`).join('')
    + '</div></body>';
  const lab = await browser.newPage({ viewport: { width: cols * cw + (cols + 1) * 20, height: 400 } });
  await lab.setContent(html);
  await lab.screenshot({ path: path.join(OUT, `${name}.png`), fullPage: true });
  await browser.close();
  shots.forEach(s => console.log(`  ${s.L}  ${path.relative(process.cwd(), s.src)}`));
  console.log(`\n  sheet: ${path.join(OUT, name + '.png')}`);
})();
