#!/usr/bin/env node
/*
 * The section list is the one part of content.js that a client or an agent is
 * most likely to edit and most likely to get wrong, and the cost of getting it
 * wrong is not one ugly page — it is a page that silently ships without its
 * prices, or without the form that takes the lead.
 *
 * So every wrong edit has to stop the build and say what to do. This file
 * checks that it does.
 *
 *   node tools/test-sections.js      exit 0 = every bad edit was caught
 *
 * It writes nothing and builds nothing; it calls the resolver directly with
 * fabricated content.
 */
'use strict';
const { resolveSections, SECTION_NAMES, DEFAULT_SECTIONS } = require('../build.js');

/* A site with every section present, so the only thing under test is the list. */
function site(sections) {
  const s = {};
  for (const n of SECTION_NAMES) s[n] = { id: n };
  if (sections !== undefined) s.sections = sections;
  return s;
}

let failed = 0, ran = 0;

/* The list is wrong: resolveSections must throw, and the message must contain
   each of `wants` so the person reading it knows what to change. */
function rejects(label, sections, ...wants) {
  ran++;
  let msg = null;
  try { resolveSections(site(sections), 'testsite'); }
  catch (e) { msg = e.message; }

  if (msg === null) {
    console.log(`  FAIL  ${label}\n        accepted a list that should have been refused`);
    failed++; return;
  }
  const missing = wants.filter((w) => !msg.includes(w));
  if (missing.length) {
    console.log(`  FAIL  ${label}\n        message did not mention: ${missing.join(' | ')}`
      + `\n        got: ${msg.split('\n')[0]}`);
    failed++; return;
  }
  console.log(`  ok    ${label}`);
}

/* The list is fine: resolveSections must return exactly `expect`. */
function accepts(label, sections, expect) {
  ran++;
  try {
    const got = resolveSections(site(sections), 'testsite');
    if (got.join(',') !== expect.join(',')) {
      console.log(`  FAIL  ${label}\n        got [${got}], expected [${expect}]`);
      failed++; return;
    }
    console.log(`  ok    ${label}`);
  } catch (e) {
    console.log(`  FAIL  ${label}\n        refused a valid list: ${e.message.split('\n')[0]}`);
    failed++;
  }
}

console.log('\nsection list, bad edits that must be caught\n');

rejects('a misspelled name is caught, and the right one suggested',
  ['showcase', 'stroy', 'contact'], 'not a section', 'Did you mean "story"?');

rejects('a name that is not a section at all',
  ['showcase', 'pricing', 'contact'], 'not a section', 'Valid names');

rejects('the same section listed twice',
  ['showcase', 'story', 'showcase', 'contact'], 'twice');

/* Listed but absent needs a site that is missing the block, so it is built by
   hand rather than through site(). */
(function listedButAbsent() {
  ran++;
  const s = { contact: { id: 'contact' }, sections: ['story', 'contact'] };
  let msg = null;
  try { resolveSections(s, 'testsite'); } catch (e) { msg = e.message; }
  const ok = msg && msg.includes('no `story:` block') && msg.includes('remove "story"');
  console.log(`  ${ok ? 'ok   ' : 'FAIL '} a section listed with no matching block`);
  if (!ok) { failed++; console.log(`        got: ${msg ? msg.split('\n')[0] : '(accepted)'}`); }
})();

rejects('dropping the contact form', ['showcase', 'story'],
  'must include "contact"', 'cannot take a lead');

rejects('sections written as a string instead of a list',
  'showcase, contact', 'must be an array');

rejects('an empty list', [], 'empty');

rejects('an entry that is an object rather than a name',
  ['showcase', { name: 'story' }, 'contact'], 'plain names', 'no objects');

console.log('\nlists that must be accepted\n');

accepts('no sections key at all falls back to the default set',
  undefined, DEFAULT_SECTIONS);

accepts('a short list is kept in its own order',
  ['story', 'contact'], ['story', 'contact']);

accepts('order is respected, not normalised',
  ['contact', 'story', 'showcase'], ['contact', 'story', 'showcase']);

accepts('every section at once',
  SECTION_NAMES.slice(), SECTION_NAMES.slice());

console.log(`\n${ran - failed}/${ran} checks passed.`
  + (failed ? `  ${failed} FAILED\n` : '  A wrong section list cannot reach a built page.\n'));
process.exit(failed ? 1 : 0);
