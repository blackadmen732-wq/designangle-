#!/usr/bin/env node
/*
 * One set of tokens, kept that way.
 *
 * tokens/tokens.css holds the space scale, the corners, the touch sizes and
 * the motion that the websites, the app screens and the owner panel share,
 * and the names of the colour roles they all give. This checks that it is
 * still the only place those values are set:
 *
 *   - the owner panel's copy (it ships as one file) matches the source
 *   - no stylesheet sets a shared value itself, so two values cannot drift
 *   - the app style imports the file, and every built site starts with it
 *   - every system still gives the colour roles: --ground, --surface,
 *     --ink, --ink-quiet, --line
 *
 *   node tools/tokens.js           exit 1 if anything has drifted
 *   node tools/tokens.js --sync    rewrite the panel's copy, then check
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');

const TOKENS = 'tokens/tokens.css';
const APP = 'app-style/app-style.css';
const SITE = 'template/site.css';
const PANEL = 'portal/app/index.html';
const BEGIN = '/* tokens:begin. A copy of tokens/tokens.css, written by '
  + '`node tools/tokens.js --sync`. Change that file, not this block. */';
const END = '/* tokens:end */';
const ROLES = ['--ground', '--surface', '--ink', '--ink-quiet', '--line'];

const noComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, '');
const defined = (css) => [...noComments(css).matchAll(/(--[a-z0-9-]+)\s*:/gi)].map((m) => m[1]);

const source = read(TOKENS);
const start = source.indexOf(':root {');
const rule = source.slice(start, source.lastIndexOf('}') + 1);
const copy = `${BEGIN}\n${rule}\n${END}`;

if (process.argv.includes('--sync')) {
  let panel = read(PANEL);
  const a = panel.indexOf(BEGIN), b = panel.indexOf(END);
  if (a >= 0 && b > a) panel = panel.slice(0, a) + copy + panel.slice(b + END.length);
  else panel = panel.replace('<style>\n', `<style>\n${copy}\n`);
  fs.writeFileSync(path.join(ROOT, PANEL), panel);
  console.log(`  wrote the tokens into ${PANEL}`);
}

let failed = 0, ran = 0;
function check(label, problems) {
  ran++;
  if (!problems.length) { console.log(`  ok    ${label}`); return; }
  failed++;
  console.log(`  FAIL  ${label}`);
  for (const p of problems) console.log(`        ${p}`);
}

console.log('\ntokens: one source for the websites, the apps and the panel\n');

const names = defined(rule);
const tokenSet = new Set(names);
check(`${TOKENS} sets each of its ${names.length} tokens once`,
  names.filter((n, i) => names.indexOf(n) !== i).map((n) => `${n} is set twice`));

const panel = read(PANEL);
const a = panel.indexOf(BEGIN), b = panel.indexOf(END);
const panelCopy = a >= 0 && b > a ? panel.slice(a, b + END.length) : null;
check(`the owner panel carries an exact copy`,
  panelCopy === null ? [`${PANEL} has no tokens block. Run: node tools/tokens.js --sync`]
    : panelCopy !== copy ? [`${PANEL}'s copy differs from ${TOKENS}. Run: node tools/tokens.js --sync`] : []);

const panelOwn = (panel.match(/<style>([\s\S]*?)<\/style>/g) || []).join('\n')
  .split(panelCopy || '\u0000').join('');
const own = { [APP]: read(APP), [SITE]: read(SITE), [PANEL]: panelOwn };
for (const [file, css] of Object.entries(own)) {
  const clash = [...new Set(defined(css).filter((n) => tokenSet.has(n)))];
  check(`${file} leaves the shared values to the tokens`,
    clash.map((n) => `sets ${n} itself; take it from ${TOKENS}, or give the local value its own name`));
}

const app = noComments(read(APP));
const firstRule = app.search(/[^\s@][^;{]*\{/);
const imp = app.indexOf('@import url("../tokens/tokens.css")');
check(`${APP} imports the tokens before its first rule`,
  imp < 0 ? ['no @import url("../tokens/tokens.css")']
    : imp > firstRule ? ['the @import comes after a rule, so browsers ignore it'] : []);

const dist = path.join(ROOT, 'dist');
const built = fs.existsSync(dist)
  ? fs.readdirSync(dist).filter((d) => fs.existsSync(path.join(dist, d, 'site.css'))) : [];
if (built.length)
  check(`every built site's stylesheet starts with the tokens (${built.length} in dist/)`,
    built.filter((d) => !fs.readFileSync(path.join(dist, d, 'site.css'), 'utf8').startsWith(source))
      .map((d) => `dist/${d}/site.css does not. Rebuild: node build.js ${d}`));

for (const [file, css] of Object.entries(own)) {
  const has = new Set(defined(css));
  check(`${file} gives the colour roles`,
    ROLES.filter((r) => !has.has(r)).map((r) => `no ${r}; set it (an alias of the local name is fine)`));
}

console.log(`\n${ran - failed}/${ran} checks passed.`
  + (failed ? `  ${failed} FAILED\n` : '  One set of tokens.\n'));
process.exit(failed ? 1 : 0);
