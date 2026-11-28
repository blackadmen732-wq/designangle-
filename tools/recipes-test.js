#!/usr/bin/env node
/*
 * Test each interaction recipe on its own: does it answer at once, survive
 * being pressed again and again, work from the keyboard, keep still under
 * reduced motion, and keep frames smooth while it moves?
 *
 *   node tools/recipes-test.js                 every recipe in app-style/recipes
 *   node tools/recipes-test.js dropdown modal  just these
 *   node tools/recipes-test.js --video         also record each one, calm and lively,
 *                                              into .check/recipes/ (webm, then mp4 if ffmpeg exists)
 *
 * These checks catch breakage, not taste. Passing them does not prove an
 * interaction feels good; that is judged by trying it (app-style/recipes/index.html).
 *
 * Where Playwright's own browser cannot be downloaded, point CHROME_PATH at
 * any Chromium.
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
let chromium;
try { ({ chromium } = require('playwright')); } catch { console.error('This needs Playwright.'); process.exit(2); }

const DIR = path.resolve('app-style/recipes');
const args = process.argv.slice(2);
const video = args.includes('--video');
const only = args.filter(a => !a.startsWith('--'));
const url = (n, q = '') => 'file://' + path.join(DIR, n, 'index.html') + q;
const visible = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return !!e && !e.hidden && e.getClientRects().length > 0 && (e.tagName !== 'DIALOG' || e.open); }, sel);
const focused = p => p.evaluate(() => (document.activeElement.id || document.activeElement.textContent || '').trim().slice(0, 30));
const settle = p => p.evaluate(() => Promise.all(document.getAnimations().map(a => a.finished.catch(() => {}))));
// after everything settles, nothing may be left half-faded or displaced
const stuck = p => p.evaluate(() => [...document.querySelectorAll('main *')].filter(e => {
  if (e.closest('[hidden]') || !e.getClientRects().length) return false;
  const s = getComputedStyle(e); return parseFloat(s.opacity) < 0.99 && !e.matches('.skel') || (s.transform !== 'none' && !e.matches('dialog.sheet, button, .toast'));
}).length);

// What to press, what should be open after, and how the keyboard should work.
const R = {
  'product-expand': { press: '#card', open: '#detail', close: '#detail [data-close]',
    keys: async p => { await p.focus('#card'); await p.keyboard.press('Enter'); await p.waitForTimeout(600); const a = await visible(p, '#detail'); const inDetail = await p.evaluate(() => document.getElementById('detail').contains(document.activeElement)); await p.keyboard.press('Escape'); await p.waitForTimeout(600); return a && inDetail && !(await visible(p, '#detail')) && (await focused(p)) === 'card'; } },
  'dropdown': { press: '#trigger', open: '#menu',
    keys: async p => { await p.focus('#trigger'); await p.keyboard.press('Enter'); await settle(p); const f1 = await focused(p); await p.keyboard.press('ArrowDown'); const f2 = await focused(p); await p.keyboard.press('Escape'); await settle(p); return f1 === 'Newest' && f2.startsWith('Price') && (await focused(p)) === 'trigger'; } },
  'modal': { press: '#open', open: '#dlg', close: '#dlg [data-close]',
    keys: async p => { await p.focus('#open'); await p.keyboard.press('Enter'); await settle(p); const a = await visible(p, '#dlg'); await p.keyboard.press('Escape'); await settle(p); return a && !(await visible(p, '#dlg')) && (await focused(p)) === 'open'; } },
  'bottom-sheet': { press: '#open', open: '#sheet', close: '#sheet [data-close]',
    keys: async p => { await p.focus('#open'); await p.keyboard.press('Enter'); await settle(p); const a = await visible(p, '#sheet'); await p.keyboard.press('Escape'); await settle(p); return a && !(await visible(p, '#sheet')); } },
  'steps': { press: '#steps [data-step]:not([hidden]) [data-next]', state: p => p.evaluate(() => document.getElementById('steps').dataset.at),
    keys: async p => { await p.focus('#steps [data-next]'); await p.keyboard.press('Enter'); await settle(p); return (await focused(p)).startsWith('2.'); } },
  'add-to-cart': { press: '#add', state: p => p.evaluate(() => document.getElementById('count').textContent),
    keys: async p => { await p.focus('#add'); await p.keyboard.press('Enter'); await settle(p); return (await p.evaluate(() => document.getElementById('count').textContent)) === '1'; } },
  'remove-undo': { press: '#rows li:first-child [data-remove]', state: p => p.evaluate(() => document.querySelectorAll('#rows li').length),
    keys: async p => { await p.focus('#rows li [data-remove]'); await p.keyboard.press('Enter'); await settle(p); const n = await p.evaluate(() => document.querySelectorAll('#rows li').length); await p.click('#toast button'); await settle(p); return n === 2 && (await p.evaluate(() => document.querySelectorAll('#rows li').length)) === 3; } },
  'filter-reflow': { press: '#rev', state: p => p.evaluate(() => document.querySelector('#grid li').textContent),
    keys: async p => { await p.focus('#odd'); await p.keyboard.press('Enter'); await settle(p); return (await p.evaluate(() => [...document.querySelectorAll('#grid li')].filter(l => !l.hidden).length)) === 6; } },
  'states': { press: '#b-empty', state: p => p.evaluate(() => document.getElementById('box').dataset.state),
    keys: async p => { await p.focus('#b-load'); await p.keyboard.press('Enter'); const busy = await p.evaluate(() => document.getElementById('box').getAttribute('aria-busy')); await p.waitForTimeout(700); return busy === 'true' && (await p.evaluate(() => document.getElementById('box').dataset.state)) === 'success'; } },
};

(async () => {
  const browser = await chromium.launch(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {});
  let bad = 0;
  for (const [n, t] of Object.entries(R)) {
    if (only.length && !only.includes(n)) continue;
    const res = {};
    // 1. answers at once: the state changes within one frame of the press
    let p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await p.goto(url(n)); await p.waitForTimeout(150);
    const before = t.state ? await t.state(p) : null;
    // a visible answer within 100ms: the state changed, or something started moving
    await p.click(t.press);
    res.answers = false;
    for (let i = 0; i < 6 && !res.answers; i++) {
      const after = t.state ? await t.state(p) : await visible(p, t.open);
      const moving = await p.evaluate(() => document.getAnimations().some(a => a.playState === 'running'));
      res.answers = (t.state ? after !== before : after) || moving;
      if (!res.answers) await p.waitForTimeout(16);
    }
    // frames while it moves: the longest gap between frames
    res.frame = await p.evaluate(() => new Promise(r => { let last = performance.now(), worst = 0, n = 0; (function f(now) { worst = Math.max(worst, now - last); last = now; if (++n < 24) requestAnimationFrame(f); else r(Math.round(worst)); })(last); }));
    await settle(p); await p.close();
    // 2. pressed again and again: ends in a sound state, nothing stuck half-way, no ghosts left
    p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await p.goto(url(n)); await p.waitForTimeout(150);
    for (let i = 0; i < 6; i++) {
      if (t.close && await visible(p, t.open)) await p.click(t.close, { timeout: 500 }).catch(() => {});
      else await p.click(t.press, { timeout: 500, force: true }).catch(() => {});
      await p.waitForTimeout(30);
    }
    await settle(p); await p.waitForTimeout(100);
    res.interrupt = (await stuck(p)) === 0 && (await p.evaluate(() => document.querySelectorAll('body > img, body > [aria-hidden="true"]:not(.ia-sr)').length)) === 0;
    await p.close();
    // 3. keyboard
    p = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await p.goto(url(n)); await p.waitForTimeout(150);
    res.keyboard = await t.keys(p).catch(() => false);
    await p.close();
    // 4. reduced motion: the state still changes, nothing travels (a fade may stay)
    p = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
    await p.goto(url(n)); await p.waitForTimeout(150);
    const b2 = t.state ? await t.state(p) : null;
    await p.click(t.press); await p.waitForTimeout(20);
    // a fade may stay (reduced motion means gentler, not none); nothing may travel or grow
    const moving = await p.evaluate(() => document.getAnimations().filter(a => {
      if (a.playState !== 'running' || !a.effect || !(a.effect.getTiming().duration > 0) || String(a.animationName || '').includes('skel')) return false;
      const props = a.transitionProperty ? [a.transitionProperty] : a.effect.getKeyframes().flatMap(k => Object.keys(k));
      return props.some(k => /transform|translate|scale|rotate|top|left|width|height/.test(k));
    }).length);
    res.still = moving === 0 && (t.state ? (await t.state(p)) !== b2 : await visible(p, t.open));
    await p.close();
    const ok = res.answers && res.interrupt && res.keyboard && res.still;
    if (!ok) bad++;
    const m = v => (v ? 'ok' : 'FAIL');
    console.log(`${ok ? 'ok  ' : 'FAIL'}  ${n.padEnd(16)} answers ${m(res.answers)}  repeat-press ${m(res.interrupt)}  keyboard ${m(res.keyboard)}  reduced-motion ${m(res.still)}  longest frame ${res.frame}ms`);
  }
  if (video) {
    const OUT = path.resolve('.check/recipes'); fs.mkdirSync(OUT, { recursive: true });
    for (const persona of ['calm', 'lively']) {
      const ctx = await browser.newContext({ viewport: { width: 960, height: 600 }, recordVideo: { dir: OUT, size: { width: 960, height: 600 } } });
      const p = await ctx.newPage();
      for (const [n, t] of Object.entries(R)) {
        if (only.length && !only.includes(n)) continue;
        await p.goto(url(n, '?motion=' + persona)); await p.waitForTimeout(700);
        await p.click(t.press); await p.waitForTimeout(1100);
        if (t.close && await visible(p, t.open)) { await p.click(t.close); await p.waitForTimeout(900); }
        else if (n === 'remove-undo') { await p.click('#toast button'); await p.waitForTimeout(900); }
        else if (n === 'filter-reflow') { await p.click('#odd'); await p.waitForTimeout(900); await p.click('#all'); await p.waitForTimeout(900); }
        else if (n === 'dropdown') { await p.keyboard.press('Escape'); await p.waitForTimeout(800); }
        else if (n === 'steps') { await p.click('#steps [data-step]:not([hidden]) [data-back]'); await p.waitForTimeout(900); }
        else if (n === 'states') { await p.click('#b-load'); await p.waitForTimeout(1300); }
      }
      const v = p.video(); await ctx.close();
      const webm = path.join(OUT, `recipes-${persona}.webm`); fs.renameSync(await v.path(), webm);
      try { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', webm.replace('.webm', '.mp4')]); } catch {}
      console.log(`  video: ${path.relative(process.cwd(), webm.replace('.webm', fs.existsSync(webm.replace('.webm', '.mp4')) ? '.mp4' : '.webm'))}`);
    }
  }
  await browser.close();
  console.log(bad ? `\n${bad} recipe(s) broke. These checks catch breakage only; feel is judged by trying them.` : '\nNo recipe broke. That proves they work, not that they feel good: try them.');
  process.exit(bad ? 1 : 0);
})();
