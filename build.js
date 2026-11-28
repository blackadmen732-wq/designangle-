#!/usr/bin/env node
/*
 * Design Angle site kit: builds one client website from sites/<name>/content.js.
 *
 *   node build.js            build every site in sites/
 *   node build.js hvac       build only sites/hvac
 *
 * Output goes to dist/<name>/ as plain static files (index.html, site.css, site.js, img/).
 * No dependencies. All page content is written into the HTML, so it is readable by
 * search engines and complete even if the animation scripts fail to load.
 *
 * SECTIONS
 * --------
 * Which sections a site has, and the order they appear in, is a flat list in
 * content.js:
 *
 *   sections: [
 *     'belt',
 *     'showcase',
 *     'list',
 *     'story',
 *     'band',
 *     'contact'
 *   ],
 *
 * One name per line, no nesting, no options. Each name is also the key its
 * content lives under, so 'story' renders site.story and nothing else.
 *
 * This exists because the kit used to emit the same four-part argument for
 * every business — show your work, list your prices, tell your story, take a
 * booking — which is right for a restaurant and wrong for a law firm. The hero
 * layouts varied; the argument did not.
 *
 * Everything below is checked before a single file is written, because the
 * failure mode this replaces is worse than the one it introduces: one generic
 * page is recoverable, five quietly broken ones are not. A typo, a missing
 * block, a duplicate or a dropped contact form stops the build and names the
 * file, the line's content and the fix.
 */
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const SITES = path.join(ROOT, 'sites');
const TEMPLATE = path.join(ROOT, 'template');
const DIST = path.join(ROOT, 'dist');

const DEFAULT_THEME = {
  bg: '#ffffff', ink: '#1e1512', muted: '#6f625c', line: '#eee7e2', soft: '#fff4f1',
  accent: '#db2235', tag: '#1f6b45', tint: '#ffe3dc',
  display: '"Bricolage Grotesque", "Avenir Next", "Segoe UI", system-ui, sans-serif',
  body: '"Instrument Sans", "Helvetica Neue", Arial, system-ui, sans-serif',
  fontsUrl: 'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,700;12..96,800&family=Instrument+Sans:wght@400;500;600&display=swap'
};

// The client's accent, darkened in its own hue until small text in it passes
// 4.5:1 on the page (DESIGN.md: body text needs 4.5:1). Large text and fills
// keep the accent itself.
function lum(hex) {
  const c = hex.replace('#', '').match(/../g).map((h) => parseInt(h, 16) / 255).map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
function textSafe(accent, bg) {
  let c = accent.replace('#', '').match(/../g).map((h) => parseInt(h, 16));
  const hex = () => '#' + c.map((v) => Math.round(v).toString(16).padStart(2, '0')).join('');
  for (let i = 0; i < 40 && ratio(hex(), bg) < 4.6; i++) c = c.map((v) => v * 0.97);
  return hex();
}

const esc = (s) => String(s == null ? '' : s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const ext = (href) => (/^https?:/.test(href || '') ? ' target="_blank" rel="noopener"' : '');
const arrow = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M3 9h12M10 4l5 5-5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
const arrowBack = '<svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true"><path d="M15 9H3M8 4L3 9l5 5" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>';

function photo(src, alt, opts) {
  const o = opts || {};
  return `<img class="photo" src="img/${esc(src)}" alt="${esc(alt || '')}"${o.eager ? ' fetchpriority="high"' : ' loading="lazy"'}${o.id ? ` id="${o.id}"` : ''}>`;
}

// A phone number becomes a tel: link (tappable, and countable). An email
// becomes a mailto: link. Anything else is plain selectable text.
function contactLine(line) {
  var t = String(line).trim();
  var digits = t.replace(/[^0-9+]/g, '');
  if (/^[+(]?[0-9][0-9().\-\s]{6,}$/.test(t) && digits.length >= 7)
    return `<a class="sel" data-live="phone" href="tel:${esc(digits)}">${esc(t)}</a>`;
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(t))
    return `<a class="sel" href="mailto:${esc(t)}">${esc(t)}</a>`;
  return `<span class="sel">${esc(t)}</span>`;
}

function jsonLd(site) {
  const s = site.seo || {};
  if (!s.type) return '';
  const data = { '@context': 'https://schema.org', '@type': s.type, name: site.name };
  if (s.url) data.url = s.url;
  if (s.telephone) data.telephone = s.telephone;
  if (s.priceRange) data.priceRange = s.priceRange;
  if (s.servesCuisine) data.servesCuisine = s.servesCuisine;
  if (s.menu) data.menu = s.menu;
  if (s.areaServed) data.areaServed = s.areaServed;
  if (s.address) data.address = Object.assign({ '@type': 'PostalAddress' }, s.address);
  if (s.openingHours) data.openingHours = s.openingHours;
  // Note: do not add aggregateRating for the business's own reviews. Google does not show it.
  return `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, '\\u003c')}</script>`;
}

/* ===========================================================================
   Sections
   ---------------------------------------------------------------------------
   One function per section. Each takes the whole site plus the resolved theme
   and returns its own markup. Nothing here reaches for a section that is not
   its own, so removing one from the list cannot break another.
   =========================================================================== */

function heroSection(site, t) {
  const hero = site.hero, seo = site.seo || {};
  const thumbImgs = hero.slides.map((s) => photo(s.img, '')).join('');

  if (site.layout === 'atelier') return `
  <section class="hero hero-atelier" aria-label="${esc(hero.label || 'Featured')}">
    <div class="shot">
      <div class="shot-img">${photo(hero.slides[0].img, hero.slides[0].alt, { eager: true })}</div>
      <div class="hero-scrim" aria-hidden="true"></div>
    </div>
    <div class="wrap">
      <div class="atelier-text">
        <p class="eyebrow">${esc(hero.eyebrow)}</p>
        <h1 id="headline">${esc(hero.headline)} <em>${esc(hero.headlineAccent || '')}</em></h1>
        ${hero.lead ? `<p class="atelier-lead">${esc(hero.lead)}</p>` : ''}
        <div class="hero-cta">
          <a class="btn" href="${esc(hero.primary.href)}"${ext(hero.primary.href)}>${esc(hero.primary.label)} ${arrow}</a>
          ${seo.telephone ? `<a class="hero-tel" href="tel:${esc(String(seo.telephone).replace(/[^0-9+]/g, ''))}">${esc(seo.telephone)}</a>` : ''}
        </div>
      </div>
    </div>
    <div class="hero-foot" aria-hidden="true"><span>${esc(hero.footNote || '')}</span><i></i></div>
  </section>`;

  if (site.layout === 'still') return `
  <section class="hero hero-still" aria-label="${esc(hero.label || 'Featured')}">
    <div class="wrap">
      <div class="still-text">
        <p class="eyebrow">${esc(hero.eyebrow)}</p>
        <h1 id="headline">${esc(hero.headline)} <em>${esc(hero.headlineAccent || '')}</em></h1>
        ${hero.lead ? `<p class="still-lead">${esc(hero.lead)}</p>` : ''}
        <div class="hero-cta">
          <a class="btn" href="${esc(hero.primary.href)}"${ext(hero.primary.href)}>${esc(hero.primary.label)} ${arrow}</a>
        </div>
      </div>
      <figure class="still-shot">
        ${photo(hero.slides[0].img, hero.slides[0].alt, { eager: true })}
        ${hero.slides[0].text ? `<figcaption>${esc(hero.slides[0].text)}</figcaption>` : ''}
      </figure>
    </div>
  </section>`;

  return `
  <section class="hero" aria-label="${esc(hero.label || 'Featured')}">
    <div class="wrap">
      <div class="hero-text">
        <p class="eyebrow">${esc(hero.eyebrow)}</p>
        <h1 id="headline">${esc(hero.headline)} <em>${esc(hero.headlineAccent || '')}</em></h1>
        <div class="dish-info" id="dishInfo" aria-live="polite">
          ${hero.slides.map((s, i) => `<div${i === 0 ? ' class="on"' : ''}><h2>${esc(s.title)}</h2><p>${esc(s.text)}</p>${s.meta ? `<span class="price">${esc(s.meta)}</span>` : ''}</div>`).join('\n          ')}
        </div>
        <div class="hero-cta">
          <a class="btn" href="${esc(hero.primary.href)}"${ext(hero.primary.href)}>${esc(hero.primary.label)} ${arrow}</a>
          <div class="ctrl">
            <button class="round" id="prev" type="button" aria-label="Previous">${arrowBack}</button>
            <button class="round" id="next" type="button" aria-label="Next">${arrow}</button>
            <div class="dots" id="dots"></div>
          </div>
        </div>
      </div>
      <div class="stage" id="stage">
        <div class="blob"></div>
        <div class="frame" id="frame">
          ${hero.slides.map((s, i) => `<div class="slide${i === 0 ? ' on' : ''}" data-tint="${esc(s.tint || t.tint)}">${photo(s.img, s.alt, { eager: i === 0 })}</div>`).join('\n          ')}
        </div>
        <button class="thumb t2" id="thumb2" type="button">${thumbImgs}</button>
        <button class="thumb t1" id="thumb1" type="button">${thumbImgs}</button>
      </div>
    </div>
  </section>`;
}

function beltSection(site) {
  const beltSet = `<div class="belt-set">${site.belt.map((b) => `<span>${photo(b.img, '')}${esc(b.text)}</span>`).join('')}</div>`;
  return `
  <div class="belt" aria-hidden="true"><div class="belt-track" id="belt">${beltSet.repeat(4)}</div></div>`;
}

function showcaseSection(site) {
  const show = site.showcase;
  if (site.layout === 'atelier') return `
  <section class="sec gallery" id="${esc(show.id)}" aria-label="${esc(show.title)}">
    <div class="wrap">
      <div class="sec-head">
        <p class="eyebrow" data-reveal>${esc(show.eyebrow)}</p>
        <h2 data-split>${esc(show.title)}</h2>
        <p data-reveal>${esc(show.text)}</p>
      </div>
      <div class="plates">
        ${show.cards.map((c, i) => `<figure class="plate plate-${i % 5}"><div class="plate-pic">${photo(c.img, c.alt)}</div><figcaption><h3>${esc(c.title)}</h3>${c.meta ? `<span class="p">${esc(c.meta)}</span>` : ''}<p>${esc(c.text)}</p></figcaption></figure>`).join('\n        ')}
      </div>
    </div>
  </section>`;

  return `
  <section class="hs" id="${esc(show.id)}" aria-label="${esc(show.title)}">
    <div class="hs-track" id="hsTrack">
      <div class="hs-intro">
        <p class="eyebrow">${esc(show.eyebrow)}</p>
        <h2 data-split>${esc(show.title)}</h2>
        <p>${esc(show.text)}</p>
      </div>
      ${show.cards.map((c) => `<article class="card"><div class="pic">${photo(c.img, c.alt)}</div><div class="row"><h3>${esc(c.title)}</h3>${c.meta ? `<span class="p">${esc(c.meta)}</span>` : ''}</div><p>${esc(c.text)}</p></article>`).join('\n      ')}
    </div>
    <div class="hs-bar" aria-hidden="true"><i id="hsBar"></i></div>
  </section>`;
}

function listSection(site) {
  const list = site.list;
  return `
  <section class="sec" id="${esc(list.id)}">
    <div class="wrap">
      <div class="sec-head">
        <p class="eyebrow" data-reveal>${esc(list.eyebrow)}</p>
        <h2 data-split>${esc(list.title)}</h2>
        <p data-reveal>${esc(list.text)}</p>
      </div>
      <div class="tabs" role="tablist" aria-label="${esc(list.eyebrow)}" id="tabs" data-reveal>
        ${list.groups.map((g, i) => `<button type="button" role="tab" aria-selected="${i === 0}" data-panel="${i}">${esc(g.name)}</button>`).join('\n        ')}
      </div>
      ${list.groups.map((g, i) => `<ul class="menu-list${site.layout === 'atelier' ? ' ledger' : ''}" role="tabpanel" data-panel="${i}"${i ? ' hidden' : ''}>
        ${g.items.map((it, k) => `<li style="--i:${k}"><h3>${esc(it.title)}${it.tag ? `<span class="tag">${esc(it.tag)}</span>` : ''}</h3><span class="p">${esc(it.meta || '')}</span><p>${esc(it.text)}</p></li>`).join('\n        ')}
      </ul>`).join('\n      ')}
      ${list.note ? `<p class="menu-note">${esc(list.note)}</p>` : ''}
    </div>
  </section>`;
}

function storySection(site) {
  const story = site.story;
  // A story with no numbers (a preview, which has been given none) draws no
  // empty row where they would go.
  const facts = (story.facts || []).map((f) => `<div><b data-count="${esc(f.value)}" data-suffix="${esc(f.suffix || '')}">${esc(f.value)}${esc(f.suffix || '')}</b><span>${esc(f.label)}</span></div>`);
  return `
  <section class="sec story" id="${esc(story.id)}">
    <div class="wrap">
      <div class="story-pic" id="storyPic">${photo(story.img, story.alt)}</div>
      <div class="story-text">
        <p class="eyebrow" data-reveal>${esc(story.eyebrow)}</p>
        <h2 data-split>${esc(story.title)}</h2>
        ${story.paragraphs.map((p) => `<p data-reveal>${esc(p)}</p>`).join('\n        ')}
        ${facts.length ? `<div class="facts" data-reveal>
          ${facts.join('\n          ')}
        </div>` : ''}
      </div>
    </div>
  </section>`;
}

function bandSection(site) {
  const band = site.band;
  return `
  <section class="band" aria-label="${esc(band.title)}">
    ${photo(band.img, band.alt, { id: 'bandImg' })}
    <div class="wrap">
      <h2 data-split>${esc(band.title)}</h2>
      ${band.link ? `<a href="${esc(band.link.href)}"${ext(band.link.href)}>${esc(band.link.label)}</a>` : ''}
    </div>
  </section>`;
}

function contactSection(site) {
  const contact = site.contact, form = contact.form;
  return `
  <section class="sec" id="${esc(contact.id)}">
    <div class="wrap">
      <div class="sec-head">
        <p class="eyebrow" data-reveal>${esc(contact.eyebrow)}</p>
        <h2 data-split>${esc(contact.title)}</h2>
      </div>
      <div class="visit-grid">
        <div class="info" data-reveal>
          <div>
            <h3>${esc(contact.hoursTitle || 'Hours')}</h3>
            <table class="hours" data-live="hours">
              ${contact.hours.map((h) => `<tr><td>${esc(h[0])}</td><td>${esc(h[1])}</td></tr>`).join('\n              ')}
            </table>
          </div>
          ${contact.blocks.map((b) => `<div><h3>${esc(b.title)}</h3><address>${b.lines.map(contactLine).join('<br>')}</address></div>`).join('\n          ')}
        </div>
        <form id="reqForm" novalidate data-reveal
              data-confirm="${esc(form.confirm)}" data-note="${esc(form.note || '')}"
              data-name-error="${esc(form.nameError || 'Add your name so we know who to ask for.')}"
              data-phone-error="${esc(form.phoneError || 'Add a phone number so we can confirm.')}"
              data-address-error="${esc(form.addressError || 'Add the address so we know where to come.')}"
              data-date-error="${esc(form.dateError || 'Pick a date.')}"
              data-sending="${esc(form.sending || 'Sending your request…')}"
              data-failed="${esc(form.failed || 'That did not send. Please call us instead — we do not have your request.')}"
              data-callfallback="${esc(form.callFallback || (site.seo && site.seo.telephone) || '')}">
          <h3>${esc(form.title)}</h3>

          <fieldset class="group">
            <legend>${esc(form.contactLegend || 'How we reach you')}</legend>
            <div class="fields">
              <label class="full" for="bk-name">${esc(form.nameLabel || 'Name')}
                <input id="bk-name" name="name" type="text" autocomplete="name" placeholder="${esc(form.namePlaceholder || 'Your name')}" required>
              </label>
              <label for="bk-phone">${esc(form.phoneLabel || 'Phone')}
                <input id="bk-phone" name="phone" type="tel" autocomplete="tel" placeholder="${esc(form.phonePlaceholder || '(555) 000-0000')}" required>
              </label>
              <label for="bk-email">${esc(form.emailLabel || 'Email')} <span class="opt">optional</span>
                <input id="bk-email" name="email" type="email" autocomplete="email" placeholder="${esc(form.emailPlaceholder || 'you@example.com')}">
              </label>
            </div>
          </fieldset>

          ${form.serviceArea ? `<fieldset class="group">
            <legend>${esc(form.whereLegend || 'Where the work is')}</legend>
            <button class="btn ghost locate" type="button" id="bk-locate">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"><circle cx="8" cy="8" r="2.5" fill="currentColor"/><circle cx="8" cy="8" r="5.5" stroke="currentColor" stroke-width="1.5"/><path d="M8 .5v2M8 13.5v2M.5 8h2M13.5 8h2" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>
              ${esc(form.locateLabel || 'Use my current location')}
            </button>
            <div class="fields" style="margin-top:12px">
              <label class="full" for="bk-address">${esc(form.addressLabel || 'Street address')}
                <input id="bk-address" name="address" type="text" autocomplete="street-address" placeholder="${esc(form.addressPlaceholder || '18 Foundry Lane')}" required>
              </label>
              <label for="bk-city">${esc(form.cityLabel || 'Town or city')} <span class="opt">optional</span>
                <input id="bk-city" name="city" type="text" autocomplete="address-level2">
              </label>
              <label for="bk-zip">${esc(form.zipLabel || 'ZIP code')}
                <input id="bk-zip" name="zip" type="text" inputmode="numeric" autocomplete="postal-code" maxlength="5" placeholder="${esc(form.zipPlaceholder || '43215')}">
              </label>
              <span class="area-msg full" id="areaMsg" role="status" aria-live="polite"></span>
            </div>
          </fieldset>` : ''}

          <fieldset class="group">
            <legend>${esc(form.jobLegend || 'What you need')}</legend>
            <div class="fields">
              <label class="full" for="bk-choice">${esc(form.choiceLabel)}
                <select id="bk-choice" name="choice">${form.choices.map((x) => `<option${x === form.defaultChoice ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>
              </label>
              <label for="bk-date">${esc(form.dateLabel || 'Date')}
                <input id="bk-date" name="date" type="date" required>
              </label>
              <label for="bk-time">${esc(form.timeLabel || 'Time')}
                <select id="bk-time" name="time">${form.times.map((x) => `<option${x === form.defaultTime ? ' selected' : ''}>${esc(x)}</option>`).join('')}</select>
              </label>
              ${form.notesLabel ? `<label class="full" for="bk-notes">${esc(form.notesLabel)} <span class="opt">optional</span>
                <textarea id="bk-notes" name="notes" rows="3" placeholder="${esc(form.notesPlaceholder || '')}"></textarea>
              </label>` : ''}
            </div>
          </fieldset>

          <button class="btn" type="submit">${esc(form.button)}</button>
          <div class="msg" id="bk-msg" role="status" hidden></div>
        </form>
      </div>
    </div>
  </section>`;
}

/* The registry. A section's name here is the key its content lives under in
   content.js, and the two must stay identical: that one-to-one rule is what
   makes the list readable without documentation. */
const SECTIONS = {
  belt: beltSection,
  showcase: showcaseSection,
  list: listSection,
  story: storySection,
  band: bandSection,
  contact: contactSection
};

const SECTION_NAMES = Object.keys(SECTIONS);

/* What a site gets when it names no sections: what every site had before the
   list existed, so an older content.js builds unchanged. */
const DEFAULT_SECTIONS = ['belt', 'showcase', 'list', 'story', 'band', 'contact'];

/* What a site is for, set as `kind` in content.js. A business takes
   enquiries, so its page must carry the contact section and its form: a
   business site that has lost its form cannot take a lead, and that stops
   the build. Anything else (a product, a portfolio, a docs page, a plain
   page) needs no form and builds without one. No `kind` means business, so
   every older content.js builds exactly as before. */
const KINDS = ['business', 'product', 'portfolio', 'docs', 'page'];
const REQUIRED_BY_KIND = { business: ['contact'] };
const REQUIRED_SECTIONS = REQUIRED_BY_KIND.business;

function kindOf(site, where) {
  const k = site.kind === undefined ? 'business' : site.kind;
  if (!KINDS.includes(k)) {
    const guess = nearest(String(k), KINDS);
    throw new Error(`${where}: \`kind\` is "${k}", which is not a kind.\n`
      + `  Kinds: ${KINDS.join(', ')}` + (guess ? `\n  Did you mean "${guess}"?` : ''));
  }
  return k;
}

/* Levenshtein, small and plain, only ever run on a failing build. A typo in a
   section name should cost one line of output, not twenty minutes. */
function nearest(word, options) {
  let best = null, bestD = Infinity;
  for (const opt of options) {
    const d = [];
    for (let i = 0; i <= word.length; i++) d[i] = [i];
    for (let j = 0; j <= opt.length; j++) d[0][j] = j;
    for (let i = 1; i <= word.length; i++)
      for (let j = 1; j <= opt.length; j++)
        d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1,
          d[i - 1][j - 1] + (word[i - 1] === opt[j - 1] ? 0 : 1));
    if (d[word.length][opt.length] < bestD) { bestD = d[word.length][opt.length]; best = opt; }
  }
  return bestD <= 3 ? best : null;
}

/*
 * Turn content.js's `sections` into a checked list, or stop the build.
 *
 * Every message names the file, quotes the offending value, and says what to
 * do about it. The point of this function is that a wrong edit — by a person
 * or by an agent — fails here rather than shipping a page with its prices
 * missing and nobody looking.
 */
function resolveSections(site, name) {
  const where = `sites/${name}/content.js`;

  if (site.sections === undefined) {
    if (kindOf(site, where) === 'business') return DEFAULT_SECTIONS.slice();
    /* Not a business, and no list: every section the file has a block for,
       in the usual order, so a product page is not asked for a form. */
    const have = DEFAULT_SECTIONS.filter((s) => site[s]);
    if (!have.length)
      throw new Error(`${where}: there is no \`sections\` list and no section blocks,\n`
        + `  so the page would be a header and a footer.\n`
        + `  Add some of: ${SECTION_NAMES.join(', ')}`);
    return have;
  }

  if (!Array.isArray(site.sections))
    throw new Error(`${where}: \`sections\` must be an array of names, one per line.\n`
      + `  Got ${typeof site.sections}. Valid names: ${SECTION_NAMES.join(', ')}`);

  if (!site.sections.length)
    throw new Error(`${where}: \`sections\` is empty, so the page would be a header and a footer.\n`
      + `  Either list some of: ${SECTION_NAMES.join(', ')}\n`
      + `  Or remove \`sections\` entirely to get the default set.`);

  const seen = new Set();
  for (const s of site.sections) {
    if (typeof s !== 'string')
      throw new Error(`${where}: \`sections\` must hold plain names, not ${typeof s}.\n`
        + `  Write one name per line, e.g. 'story' — no objects, no options.`);

    if (!SECTIONS[s]) {
      const guess = nearest(s, SECTION_NAMES);
      throw new Error(`${where}: \`sections\` lists "${s}", which is not a section.\n`
        + `  Valid names: ${SECTION_NAMES.join(', ')}`
        + (guess ? `\n  Did you mean "${guess}"?` : ''));
    }

    if (seen.has(s))
      throw new Error(`${where}: \`sections\` lists "${s}" twice.\n`
        + `  Each section can appear once. Remove the duplicate.`);
    seen.add(s);

    if (!site[s])
      throw new Error(`${where}: \`sections\` lists "${s}", but the file has no \`${s}:\` block.\n`
        + `  Either add a \`${s}:\` block, or remove "${s}" from \`sections\`.`);
  }

  for (const req of REQUIRED_BY_KIND[kindOf(site, where)] || [])
    if (!seen.has(req))
      throw new Error(`${where}: \`sections\` must include "${req}".\n`
        + `  The ${req} section carries the enquiry form. Without it this business\n`
        + `  site cannot take a lead, which is the one job a business site has.\n`
        + `  (A page that is not a business sets \`kind: 'product'\`, 'portfolio',\n`
        + `  'docs' or 'page', and needs no form.)`);

  /* Content that exists but is not listed renders nowhere. That is a legitimate
     thing to do — keeping a price list around while it is switched off — so it
     is said out loud rather than treated as an error. */
  const unused = SECTION_NAMES.filter((s) => site[s] && !seen.has(s));
  if (unused.length)
    console.warn(`  note: sites/${name} has ${unused.map((s) => `\`${s}\``).join(', ')} `
      + `written but not in \`sections\`, so ${unused.length > 1 ? 'they do' : 'it does'} not render.`);

  return site.sections.slice();
}

function render(site, sections) {
  const t = Object.assign({}, DEFAULT_THEME, site.theme || {});
  const seo = site.seo || {};
  const hero = site.hero, contact = site.contact;

  /* The nav follows the section list, in its order. A section earns a nav link
     by having an id — belt and band are scenery and have none — so adding a
     section to the list adds its link, and removing it removes the link too. */
  const nav = sections
    .map((s) => site[s])
    .filter((b) => b && b.id)
    .map((b) => ({ label: b.navLabel || b.eyebrow, href: '#' + b.id }));

  // The header's button: the site's own, else the contact section if there
  // is one, else none (a page with nowhere to send people has no button).
  const cta = site.cta || (contact && contact.id ? { label: 'Contact', href: '#' + contact.id } : null);
  const body = sections.map((s) => SECTIONS[s](site, t)).join('\n');

  return `<!doctype html>
<html lang="${esc(site.lang || 'en')}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(seo.title || site.name)}</title>
<meta name="description" content="${esc(seo.description || '')}">
<meta property="og:title" content="${esc(seo.title || site.name)}">
<meta property="og:description" content="${esc(seo.description || '')}">
<meta property="og:image" content="img/${esc(hero.slides[0].img)}">
<meta name="theme-color" content="${esc(t.bg)}">
<script>document.documentElement.classList.add('gs-wait');setTimeout(function(){document.documentElement.classList.remove('gs-wait');},3000);</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="${esc(t.fontsUrl)}">
<link rel="stylesheet" href="site.css">
<style>:root{--bg:${t.bg};--ink:${t.ink};--muted:${t.muted};--line:${t.line};--soft:${t.soft};--accent:${t.accent};--accent-text:${textSafe(t.accent, t.bg)};--leaf:${t.tag};--tint:${t.tint};--display:${t.display};--body:${t.body}}</style>
${jsonLd(site)}
</head>
<body class="layout-${esc(site.layout || 'studio')}">
${site.preview ? `<div class="preview-bar"><div class="wrap"><b>Preview</b><span>${esc(site.preview)}</span></div></div>` : ''}
<div class="notice-bar" id="noticeBar" hidden><div class="wrap"><span></span></div></div>
<header class="top" id="top">
  <div class="wrap">
    <a class="logo" href="#top"><i></i>${esc(site.short || site.name)}</a>
    <nav class="nav" aria-label="Main">
      ${nav.map((n) => `<a href="${esc(n.href)}">${esc(n.label)}</a>`).join('\n      ')}
    </nav>
    ${cta ? `<a class="btn small" href="${esc(cta.href)}"${ext(cta.href)}>${esc(cta.label)}</a>` : ''}
  </div>
</header>

<main>
${heroSection(site, t)}
${body}
</main>

<footer>
  <div class="mark" id="mark" aria-hidden="true">${esc(site.footer.mark)}<em>.</em></div>
  <div class="wrap">
    <span>${esc(site.footer.left)}</span>
    <span>${esc(site.footer.right)}</span>
  </div>
</footer>

<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/gsap.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/ScrollTrigger.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/gsap/3.13.0/SplitText.min.js"></script>
<script src="https://cdn.jsdelivr.net/npm/lenis@1.3.4/dist/lenis.min.js"></script>
${site.track ? `<script>window.DA_TRACK={endpoint:"${esc(site.track.endpoint)}",siteId:"${esc(site.track.siteId)}"};</script>
<script src="track.js" defer></script>` : ''}
<script src="site.js"></script>
</body>
</html>
`;
}

/* Only the sections actually in use are checked, so a site that has no belt is
   not asked for belt photographs. */
function check(site, name, sections) {
  const need = ['name', 'hero', 'footer'].concat(kindOf(site, `sites/${name}/content.js`) === 'business' ? ['contact'] : []);
  const missing = need.filter((k) => !site[k]);
  if (missing.length) throw new Error(`sites/${name}/content.js is missing: ${missing.join(', ')}`);

  const imgs = site.hero.slides.map((s) => s.img);
  if (sections.includes('belt')) imgs.push(...site.belt.map((b) => b.img));
  if (sections.includes('showcase')) imgs.push(...site.showcase.cards.map((c) => c.img));
  if (sections.includes('story')) imgs.push(site.story.img);
  if (sections.includes('band')) imgs.push(site.band.img);

  const gone = [...new Set(imgs)].filter((f) => !fs.existsSync(path.join(SITES, name, 'img', f)));
  if (gone.length) throw new Error(`sites/${name}/img is missing: ${gone.join(', ')}`);
}

function build(name) {
  const file = path.join(SITES, name, 'content.js');
  if (!fs.existsSync(file)) throw new Error(`No such site: sites/${name}/content.js`);
  delete require.cache[require.resolve(file)];
  const site = require(file);
  const sections = resolveSections(site, name);
  check(site, name, sections);
  const out = path.join(DIST, name);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, 'index.html'), render(site, sections));
  /* The shared tokens go at the top of the site's one stylesheet, so a
     website still makes a single request for its styles. */
  fs.writeFileSync(path.join(out, 'site.css'),
    fs.readFileSync(path.join(ROOT, 'tokens', 'tokens.css'), 'utf8') + '\n'
    + fs.readFileSync(path.join(TEMPLATE, 'site.css'), 'utf8'));
  fs.copyFileSync(path.join(TEMPLATE, 'site.js'), path.join(out, 'site.js'));
  if (site.track) fs.copyFileSync(path.join(TEMPLATE, 'track.js'), path.join(out, 'track.js'));
  fs.cpSync(path.join(SITES, name, 'img'), path.join(out, 'img'), { recursive: true });
  // The first hero photo again, at a path that never changes. The owner
  // panel shows it behind the owner's numbers, so their panel carries their
  // own business rather than a stock gradient.
  const first = site.hero.slides[0].img;
  if (path.extname(first) === '.webp') fs.copyFileSync(path.join(SITES, name, 'img', first), path.join(out, 'og.webp'));
  console.log(`Built dist/${name}/  (${site.name})  ${sections.join(' → ')}`);
}

/* Only run as a command. Requiring this file gives you the pieces instead, so
   the section rules can be tested without writing sites to disk — see
   tools/test-sections.js. */
if (require.main === module) {
  const wanted = process.argv.slice(2);
  const names = wanted.length ? wanted : fs.readdirSync(SITES).filter((n) => fs.existsSync(path.join(SITES, n, 'content.js')));
  try { names.forEach(build); } catch (e) { console.error('\nBuild failed.\n  ' + e.message + '\n'); process.exit(1); }
}

module.exports = { resolveSections, SECTION_NAMES, DEFAULT_SECTIONS, REQUIRED_SECTIONS, KINDS, REQUIRED_BY_KIND, build, render };
