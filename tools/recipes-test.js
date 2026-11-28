#!/usr/bin/env node
/*
 * Test each interaction recipe on its own, in every browser engine, on a
 * desktop and on a phone:
 *
 *   answers         the press shows a change within 100ms
 *   interrupt       a second, opposite press in the middle of the motion wins,
 *                   and nothing is left half-faded or displaced
 *   repeat-press    six quick presses end in a sound state; every press must land
 *   keyboard        works from the keyboard, focus where people expect it (desktop)
 *   reduced-motion  the state still changes and nothing travels (a fade may stay)
 *   frames          no frame takes longer than the limit while it moves
 *   touch           phone only: real finger drags on the bottom sheet (Chromium)
 *
 *   node tools/recipes-test.js                     all recipes, chromium firefox webkit
 *   node tools/recipes-test.js dropdown modal      just these
 *   node tools/recipes-test.js --browsers chromium only this engine
 *   node tools/recipes-test.js --frame-limit 50    the longest frame allowed, ms (default 50)
 *   node tools/recipes-test.js --video             also record calm and lively (Chromium)
 *
 * An engine that is not installed is reported as NOT RUN and fails the run,
 * so a missing browser is never mistaken for a pass. Install them with
 * `npx playwright install chromium firefox webkit`; CI does
 * (.github/workflows/recipes.yml). Where Playwright's own Chromium cannot be
 * downloaded, CHROME_PATH points at any Chromium.
 *
 * Touch drags use Chromium's DevTools protocol, which sends real touch
 * events, so the browser scrolls and cancels exactly as on a phone. Firefox
 * and WebKit have no way to send a touch drag from Playwright; there the
 * phone run taps instead, and the report says so.
 *
 * These checks catch breakage, not taste. Passing them does not prove an
 * interaction feels good; that is judged by trying it (app-style/recipes/index.html).
 */
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
let pw;
try { pw = require('playwright'); } catch { console.error('This needs Playwright.'); process.exit(2); }

const DIR = path.resolve('app-style/recipes');
const args = process.argv.slice(2);
const opt = (name, dflt) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : dflt; };
const video = args.includes('--video');
const engines = opt('--browsers', 'chromium,firefox,webkit').split(',');
const FRAME = +opt('--frame-limit', 50);
const only = args.filter((a, i) => !a.startsWith('--') && !['--browsers', '--frame-limit'].includes(args[i - 1]));
const url = (n, q = '') => 'file://' + path.join(DIR, n, 'index.html') + q;
const visible = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return !!e && !e.hidden && e.getClientRects().length > 0 && (e.tagName !== 'DIALOG' || e.open); }, sel);
const focused = p => p.evaluate(() => (document.activeElement.id || document.activeElement.textContent || '').trim().slice(0, 30));
const settle = p => p.evaluate(() => Promise.all(document.getAnimations().map(a => a.finished.catch(() => {}))));
const count = (p, sel) => p.evaluate(s => document.querySelectorAll(s).length, sel);
// after everything settles, nothing may be left half-faded or displaced
const stuck = p => p.evaluate(() => [...document.querySelectorAll('main *')].filter(e => {
  if (e.closest('[hidden]') || !e.getClientRects().length) return false;
  const s = getComputedStyle(e); return parseFloat(s.opacity) < 0.99 && !e.matches('.skel') || (s.transform !== 'none' && !e.matches('dialog.sheet, button, .toast'));
}).length);
// longest gap between frames over the next n frames
const frames = (p, n = 30) => p.evaluate(n => new Promise(r => { let last = performance.now(), worst = 0, i = 0; (function f(now) { worst = Math.max(worst, now - last); last = now; if (++i < n) requestAnimationFrame(f); else r(Math.round(worst)); })(last); }), n);
const rowText = p => p.evaluate(() => [...document.querySelectorAll('#rows li')].map(l => l.firstChild.textContent.trim()).join('|'));

// What to press, what is open after, how the keyboard works, and how a
// second press in the middle of the motion should end.
const R = {
  'product-expand': { press: '#card', open: '#detail', close: '#detail [data-close]',
    keys: async p => { await p.focus('#card'); await p.keyboard.press('Enter'); await p.waitForTimeout(600); const a = await visible(p, '#detail'); const inDetail = await p.evaluate(() => document.getElementById('detail').contains(document.activeElement)); await p.keyboard.press('Escape'); await p.waitForTimeout(600); return a && inDetail && !(await visible(p, '#detail')) && (await focused(p)) === 'card'; },
    interrupt: async (p, act) => { await act('#card'); await p.waitForTimeout(60); await p.keyboard.press('Escape'); await p.waitForTimeout(700); return !(await visible(p, '#detail')); } },
  'dropdown': { press: '#trigger', open: '#menu',
    keys: async p => { await p.focus('#trigger'); await p.keyboard.press('Enter'); await settle(p); const f1 = await focused(p); await p.keyboard.press('ArrowDown'); const f2 = await focused(p); await p.keyboard.press('Escape'); await settle(p); return f1 === 'Newest' && f2.startsWith('Price') && (await focused(p)) === 'trigger'; },
    interrupt: async (p, act) => { await act('#trigger'); await p.waitForTimeout(60); await act('#trigger'); await settle(p); return !(await visible(p, '#menu')); } },
  'modal': { press: '#open', open: '#dlg', close: '#dlg [data-close]',
    keys: async p => { await p.focus('#open'); await p.keyboard.press('Enter'); await settle(p); const a = await visible(p, '#dlg'); await p.keyboard.press('Escape'); await settle(p); return a && !(await visible(p, '#dlg')) && (await focused(p)) === 'open'; },
    interrupt: async (p, act) => { await act('#open'); await p.waitForTimeout(60); await act('#dlg [data-close]'); await settle(p); await p.waitForTimeout(100); return !(await visible(p, '#dlg')); } },
  'bottom-sheet': { press: '#open', open: '#sheet', close: '#sheet [data-close]',
    keys: async p => { await p.focus('#open'); await p.keyboard.press('Enter'); await settle(p); const a = await visible(p, '#sheet'); await p.keyboard.press('Escape'); await settle(p); return a && !(await visible(p, '#sheet')) && (await focused(p)) === 'open'; },
    // while it is still rising, Done is below the screen: a person taps outside it instead
    interrupt: async (p, act, phone) => { await act('#open'); await p.waitForTimeout(60); if (phone) await p.touchscreen.tap(195, 60); else await p.mouse.click(640, 40); await settle(p); await p.waitForTimeout(300); return !(await visible(p, '#sheet')); } },
  'steps': { press: '#steps [data-step]:not([hidden]) [data-next]', alt: '#steps [data-step]:not([hidden]) [data-back]', state: p => p.evaluate(() => document.getElementById('steps').dataset.at),
    keys: async p => { await p.focus('#steps [data-next]'); await p.keyboard.press('Enter'); await settle(p); return (await focused(p)).startsWith('2.'); },
    interrupt: async (p, act) => { await act('#steps [data-step]:not([hidden]) [data-next]'); await p.waitForTimeout(60); await act('#steps [data-step]:not([hidden]) [data-back]'); await settle(p); return (await p.evaluate(() => document.getElementById('steps').dataset.at)) === '0'; } },
  'add-to-cart': { press: '#add', state: p => p.evaluate(() => document.getElementById('count').textContent),
    keys: async p => { await p.focus('#add'); await p.keyboard.press('Enter'); await settle(p); return (await p.evaluate(() => document.getElementById('count').textContent)) === '1'; },
    interrupt: async (p, act) => { for (let i = 0; i < 3; i++) { await act('#add'); await p.waitForTimeout(60); } await settle(p); return (await p.evaluate(() => document.getElementById('count').textContent)) === '3'; } },
  'remove-undo': { press: '#rows li [data-remove]', alt: '#toast button', state: p => count(p, '#rows li'),
    keys: async p => { await p.focus('#rows li [data-remove]'); await p.keyboard.press('Enter'); await settle(p); const n = await count(p, '#rows li'); await p.click('#toast button'); await settle(p); return n === 2 && (await count(p, '#rows li')) === 3; },
    interrupt: async (p, act) => { const before = await rowText(p); await act('#rows li:first-child [data-remove]'); await p.waitForTimeout(60); await act('#toast button'); await settle(p); await p.waitForTimeout(100); return before === await rowText(p); } },
  'filter-reflow': { press: '#rev', state: p => p.evaluate(() => document.querySelector('#grid li').textContent),
    keys: async p => { await p.focus('#odd'); await p.keyboard.press('Enter'); await settle(p); return (await count(p, '#grid li')) === 6; },
    interrupt: async (p, act) => { await act('#odd'); await p.waitForTimeout(60); await act('#all'); await settle(p); await p.waitForTimeout(100); return (await p.evaluate(() => [...document.querySelectorAll('#grid li')].map(l => l.textContent).join(','))) === '1,2,3,4,5,6,7,8,9,10,11,12'; } },
  'states': { press: '#b-empty', state: p => p.evaluate(() => document.getElementById('box').dataset.state),
    keys: async p => { await p.focus('#b-load'); await p.keyboard.press('Enter'); const busy = await p.evaluate(() => document.getElementById('box').getAttribute('aria-busy')); await p.waitForTimeout(700); return busy === 'true' && (await p.evaluate(() => document.getElementById('box').dataset.state)) === 'success'; },
    interrupt: async (p, act) => { await act('#b-load'); await p.waitForTimeout(60); await act('#b-empty'); await p.waitForTimeout(800); return (await p.evaluate(() => document.getElementById('box').dataset.state)) === 'empty'; } },
};

// Real finger drags on the sheet: [name, from y, to y, steps, ms per step, hold still ms, should it stay open]
const DRAGS = [
  ['short drag, held still, let go', 500, 540, 10, 30, 300, true],
  ['long slow drag down', 500, 800, 20, 30, 300, false],
  ['quick flick down', 500, 620, 4, 8, 0, false],
  ['drag up to full height', 600, 300, 15, 30, 300, true],
];
async function touchDrag(ctx, p, [name, from, to, steps, ms, hold, stays]) {
  const cdp = await ctx.newCDPSession(p);
  await p.goto(url('bottom-sheet')); await p.tap('#open'); await p.waitForTimeout(800);
  const top0 = await p.evaluate(() => document.querySelector('#sheet h2').getBoundingClientRect().top);
  const t = (type, y) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: y == null ? [] : [{ x: 195, y }] });
  await t('touchStart', from);
  for (let i = 1; i <= steps; i++) { await t('touchMove', from + (to - from) * i / steps); await p.waitForTimeout(ms); }
  for (let k = 0; k < hold / 16; k++) { await t('touchMove', to); await p.waitForTimeout(16); }
  await t('touchEnd'); await p.waitForTimeout(1300);
  const open = await p.evaluate(() => document.getElementById('sheet').open);
  const top1 = open ? await p.evaluate(() => document.querySelector('#sheet h2').getBoundingClientRect().top) : null;
  const ok = open === stays && (name.indexOf('up') < 0 || (top1 != null && top1 < top0 - 100));
  return { name, ok, got: open ? 'stayed open' : 'closed' };
}

(async () => {
  let bad = 0;
  for (const engine of engines) {
    let browser;
    try { browser = await pw[engine].launch(engine === 'chromium' && process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : {}); }
    catch (e) { console.log(`\nNOT RUN  ${engine}: not installed here (${e.message.split('\n')[0].slice(0, 80)})`); bad++; continue; }
    for (const device of ['desktop', 'phone']) {
      const phone = device === 'phone';
      const ctxOpts = phone ? { viewport: { width: 390, height: 844 }, hasTouch: true, ...(engine === 'firefox' ? {} : { isMobile: true }) } : { viewport: { width: 1280, height: 900 } };
      console.log(`\n${engine} ${device}${phone ? ' (390 x 844, touch)' : ' (1280 x 900)'}`);
      for (const [n, t] of Object.entries(R)) {
        if (only.length && !only.includes(n)) continue;
        const res = {}, notes = [];
        const fresh = async (extra = {}) => { const ctx = await browser.newContext({ ...ctxOpts, ...extra }); const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message)); await p.goto(url(n)); await p.waitForTimeout(150); return { ctx, p, errs }; };
        const actOn = p => sel => phone ? p.tap(sel, { timeout: 1500 }) : p.click(sel, { timeout: 1500 });
        const allErrs = [];
        // answers, and frames while it moves
        let { ctx, p, errs } = await fresh();
        const before = t.state ? await t.state(p) : null;
        await actOn(p)(t.press);
        res.answers = false;
        for (let i = 0; i < 6 && !res.answers; i++) {
          const after = t.state ? await t.state(p) : await visible(p, t.open);
          const moving = await p.evaluate(() => document.getAnimations().some(a => a.playState === 'running'));
          res.answers = (t.state ? after !== before : after) || moving;
          if (!res.answers) await p.waitForTimeout(16);
        }
        res.frame = await frames(p);
        res.frames = res.frame <= FRAME;
        await settle(p); allErrs.push(...errs); await ctx.close();
        // interrupt: an opposite press in the middle of the motion
        ({ ctx, p, errs } = await fresh());
        try { res.interrupt = (await t.interrupt(p, actOn(p), phone)) && (await stuck(p)) === 0; }
        catch (e) { res.interrupt = false; notes.push('interrupt: ' + e.message.split('\n')[0]); }
        allErrs.push(...errs); await ctx.close();
        // six quick presses, as a person makes them: at the spot on the screen,
        // without waiting for the motion to stop. If the button to press is
        // gone or covered, that is a failure, not ignored.
        ({ ctx, p, errs } = await fresh());
        let landed = true;
        for (let i = 0; i < 6; i++) {
          let sel = t.close && await visible(p, t.open) ? t.close : t.press;
          if (t.alt && !(await count(p, sel))) sel = t.alt;   // the end of the steps or the list: press the way back
          const aim = () => p.evaluate(s => {
            const all = [...document.querySelectorAll(s)]; if (!all.length) return { why: 'not on the page' };
            let why = '';
            for (const e of all) {   // the first one a finger could actually reach
              const b = e.getBoundingClientRect(); if (!b.width) { why = why || 'not visible'; continue; }
              const x = b.left + b.width / 2, y = b.top + b.height / 2;
              if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) { why = why || 'off the screen'; continue; }
              const top = document.elementFromPoint(x, y);
              if (top && (top === e || e.contains(top))) return { x, y };
              why = why || 'covered by ' + (top ? top.tagName.toLowerCase() + (top.id ? '#' + top.id : '') : 'nothing');
            }
            const vt = document.getAnimations().some(a => String(a.effect && a.effect.pseudoElement || '').startsWith('::view-transition'));
            return { why, vt };
          }, sel);
          let hit = await aim();
          if (hit.why && t.alt && sel !== t.alt) { const s2 = t.alt; const h2 = await p.evaluate(x => !!document.querySelector(x), s2); if (h2) { sel = s2; hit = await aim(); } }
          if (hit.why && hit.vt) {   // the browser ignores input while a view transition runs: say so, wait, press
            notes.push(`repeat-press: press ${i + 1} waited, the browser ignores input while a view transition runs`);
            await settle(p); hit = await aim();
          } else if (hit.why === 'off the screen' && await p.evaluate(() => document.getAnimations().some(a => a.playState === 'running'))) {
            notes.push(`repeat-press: press ${i + 1} waited, ${sel} was still moving onto the screen`);
            await settle(p); hit = await aim();
          }
          if (hit.why) { landed = false; notes.push(`repeat-press: press ${i + 1} on ${sel}: ${hit.why}`); break; }
          if (phone) await p.touchscreen.tap(hit.x, hit.y); else await p.mouse.click(hit.x, hit.y);
          await p.waitForTimeout(30);
        }
        const fr = await frames(p, 20); res.frame = Math.max(res.frame, fr); res.frames = res.frames && fr <= FRAME;
        await settle(p); await p.waitForTimeout(100);
        res.repeat = landed && (await stuck(p)) === 0 && (await p.evaluate(() => document.querySelectorAll('body > img, body > [aria-hidden="true"]:not(.ia-sr)').length)) === 0;
        allErrs.push(...errs); await ctx.close();
        if (!phone) {
          // keyboard
          ({ ctx, p, errs } = await fresh());
          try { res.keyboard = await t.keys(p); } catch (e) { res.keyboard = false; notes.push('keyboard: ' + e.message.split('\n')[0]); }
          allErrs.push(...errs); await ctx.close();
          // reduced motion: the state still changes and nothing travels or grows
          ({ ctx, p, errs } = await fresh({ reducedMotion: 'reduce' }));
          const b2 = t.state ? await t.state(p) : null;
          await actOn(p)(t.press); await p.waitForTimeout(20);
          const moving = await p.evaluate(() => document.getAnimations().filter(a => {
            if (a.playState !== 'running' || !a.effect || !(a.effect.getTiming().duration > 0) || String(a.animationName || '').includes('skel')) return false;
            const props = a.transitionProperty ? [a.transitionProperty] : a.effect.getKeyframes().flatMap(k => Object.keys(k));
            return props.some(k => /transform|translate|scale|rotate|^top$|^left$|width|height/.test(k));
          }).length);
          res.still = moving === 0 && (t.state ? (await t.state(p)) !== b2 : await visible(p, t.open));
          allErrs.push(...errs); await ctx.close();
        }
        // a script error on the page fails the recipe too
        const checks = { answers: res.answers, interrupt: res.interrupt, 'repeat-press': res.repeat, ...(phone ? {} : { keyboard: res.keyboard, 'reduced-motion': res.still }), frames: res.frames, 'no errors': allErrs.length === 0 };
        if (allErrs.length) notes.push('page error: ' + allErrs[0]);
        const ok = Object.values(checks).every(Boolean);
        if (!ok) bad++;
        const m = v => (v ? 'ok' : 'FAIL');
        console.log(`${ok ? 'ok  ' : 'FAIL'}  ${n.padEnd(15)} ${Object.entries(checks).map(([k, v]) => `${k} ${m(v)}`).join('  ')}  longest frame ${res.frame}ms`);
        notes.forEach(x => console.log('        ' + x));
      }
      // real finger drags on the sheet
      if (phone && (!only.length || only.includes('bottom-sheet'))) {
        if (engine !== 'chromium') { console.log(`note  touch drags not run in ${engine}: Playwright cannot send a touch drag there; taps were tested above`); continue; }
        const ctx = await browser.newContext(ctxOpts); const p = await ctx.newPage();
        for (const d of DRAGS) {
          const r = await touchDrag(ctx, p, d);
          if (!r.ok) bad++;
          console.log(`${r.ok ? 'ok  ' : 'FAIL'}  sheet touch     ${r.name}: ${r.got}`);
        }
        await ctx.close();
      }
    }
    if (video && engine === 'chromium') {
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
        try { execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', webm, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '-crf', '26', webm.replace('.webm', '.mp4')]); }
        catch (e) { console.log('  video: ffmpeg could not make an mp4 (' + e.message.split('\n')[0] + '); the webm is kept'); }
        console.log(`  video: ${path.relative(process.cwd(), webm.replace('.webm', fs.existsSync(webm.replace('.webm', '.mp4')) ? '.mp4' : '.webm'))}`);
      }
    }
    await browser.close();
  }
  console.log(bad ? `\n${bad} failure(s). These checks catch breakage only; feel is judged by trying them.` : `\nNothing broke in ${engines.join(', ')}. That proves they work, not that they feel good: try them.`);
  process.exit(bad ? 1 : 0);
})();
