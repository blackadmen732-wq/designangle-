#!/usr/bin/env node
/*
 * Regression test for the design rules: re-check every screen that was
 * once judged good, and fail if a rule change made any of them worse.
 *
 *   node tools/regress.js            check them all against rules/baselines.json
 *   node tools/regress.js --update   after a deliberate improvement, store the new scores
 *
 * A screen fails when tools/check.js no longer passes it (breakage). Its
 * tools/slop.js score is shown beside it as advice, never as a failure. A new
 * rule (rules/RULES.md) is kept only when this passes.
 *
 * Where Playwright's own browser cannot be downloaded, point CHROME_PATH at
 * any Chromium.
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const BASE = path.join('rules', 'baselines.json');
const update = process.argv.includes('--update');
const base = JSON.parse(fs.readFileSync(BASE, 'utf8'));
const run = (tool, args) => spawnSync(process.execPath, [path.join('tools', tool), ...args], { encoding: 'utf8', env: process.env });

let bad = 0;
for (const s of base.screens) {
  const check = run('check.js', [s.page]);
  const pass = check.status === 0;
  const slop = run('slop.js', [s.page, ...(s.desktop ? ['--desktop'] : [])]);
  const m = (slop.stdout || '').match(/score\s+(\d+)\/100/);
  const score = m ? +m[1] : null;
  const ok = pass;   // breakage blocks; the taste score is shown, never a failure
  if (!ok) bad++;
  console.log(`${ok ? 'ok  ' : 'FAIL'}  ${s.page.padEnd(44)} check ${pass ? 'pass' : 'FAIL'}   slop ${score} (was ${s.slop})`);
  if (update && pass && score != null) s.slop = score;
}
if (update) { base.updated = new Date().toISOString().slice(0, 10); fs.writeFileSync(BASE, JSON.stringify(base, null, 2) + '\n'); console.log('\nBaselines stored.'); }
else console.log(bad ? `\n${bad} screen(s) got worse. Undo or fix the rule before keeping it.` : '\nNo screen got worse.');
process.exit(bad && !update ? 1 : 0);
