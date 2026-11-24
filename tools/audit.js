#!/usr/bin/env node
/**
 * Opens a built page or a standalone HTML file in a real browser, reads the
 * computed styles, and checks the rules that can be measured exactly.
 *
 * This is the half of review that does NOT need a model. tools/critique.py
 * keeps the half that does — whether the thing looks good. Never ask a
 * vision model whether 4.31:1 passes; it cannot divide.
 *
 *   node tools/audit.js dist/restaurant/index.html
 *   node tools/audit.js docs/app-patterns.html --width 400
 *   node tools/audit.js dist/hvac/index.html --json
 *
 * Exit code 1 if any rule fails, so it can gate a build.
 */

var path = require('path');
var fs = require('fs');
var C = require('./contrast.js');

var MIN_TARGET = 44;     // px, the tappable box
var MIN_INPUT_FONT = 16; // px, below this iOS zooms on focus
var MIN_BODY_FONT = 15;  // px, the floor for body copy on a phone
var MIN_ANY_FONT  = 11;  // px, the floor for labels, tags and captions
/* Why two lists, not one.
 *
 * The rule exists because animating a property that forces the browser to
 * re-run layout on every frame drops frames. Those are the LAYOUT ones, and
 * they are a real fault.
 *
 * Paint-only properties (background, colour, border-colour, box-shadow) do
 * not re-run layout. They are cheap, every shipping design system animates
 * them on hover and focus, and banning them was my rule being stricter than
 * its own reason. They are reported separately, as a note, and only when the
 * duration is long enough to be felt. */
var LAYOUT_PROPS = [
  'width', 'height', 'top', 'left', 'right', 'bottom', 'inset',
  'margin', 'margin-top', 'margin-left', 'margin-right', 'margin-bottom',
  'padding', 'padding-top', 'padding-left', 'padding-right', 'padding-bottom',
  'font-size', 'line-height', 'border-width', 'flex', 'flex-basis', 'gap'
];
var SLOW_PAINT_MS = 400;

function parseRGB(s) {
  var m = String(s).match(/rgba?\(([^)]+)\)/);
  if (!m) return null;
  var p = m[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat);
  return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
}

/** Flatten a translucent colour onto what is behind it. */
function over(fg, bg) {
  var a = fg.a;
  return {
    r: fg.r * a + bg.r * (1 - a),
    g: fg.g * a + bg.g * (1 - a),
    b: fg.b * a + bg.b * (1 - a),
    a: 1
  };
}

function toHex(c) { return C.toHex([c.r, c.g, c.b]); }

async function audit(target, opts) {
  var { chromium } = require('playwright');
  var browser = await chromium.launch();
  var page = await browser.newPage({ viewport: { width: opts.width, height: opts.height } });

  var url = /^https?:/.test(target) ? target : 'file://' + path.resolve(target);
  await page.goto(url, { waitUntil: 'load' });
  await page.waitForTimeout(1200);

  var found = await page.evaluate(function (cfg) {
    var out = { text: [], targets: [], inputs: [], motion: [], overflow: null };

    function visible(el) {
      var r = el.getBoundingClientRect();
      if (r.width === 0 || r.height === 0) return false;
      var cs = getComputedStyle(el);
      return cs.visibility !== 'hidden' && cs.display !== 'none' && parseFloat(cs.opacity) > 0.05;
    }

    /* Walk up for the first ancestor that actually paints a background. */
    function groundOf(el) {
      var n = el;
      while (n && n !== document.documentElement) {
        var bg = getComputedStyle(n).backgroundColor;
        var m = bg.match(/rgba?\(([^)]+)\)/);
        if (m) {
          var p = m[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat);
          var a = p.length > 3 ? p[3] : 1;
          if (a > 0.92) return bg;
        }
        n = n.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor || 'rgb(255,255,255)';
    }

    /* --- text nodes with real content --- */
    document.querySelectorAll('*').forEach(function (el) {
      if (!visible(el)) return;
      var own = Array.from(el.childNodes)
        .filter(function (n) { return n.nodeType === 3 && n.textContent.trim().length > 1; })
        .map(function (n) { return n.textContent.trim(); }).join(' ');
      if (!own) return;

      var cs = getComputedStyle(el);
      var size = parseFloat(cs.fontSize);
      var weight = parseInt(cs.fontWeight, 10) || 400;
      // WCAG "large" = 18.66px bold, or 24px
      var large = size >= 24 || (size >= 18.66 && weight >= 700);

      // Body copy is what the 15px floor is about. A nav label, a tag, a
      // caption or a code sample is allowed to be smaller — every shipping
      // app does that. Flag those only when they get genuinely unreadable.
      var bodyish = ['P','LI','BLOCKQUOTE','DD','TD'].indexOf(el.tagName) !== -1;
      var inCode = !!el.closest('pre, code');
      // An uppercase, letter-spaced run is an eyebrow or a label, whatever
      // element it happens to use. Those are meant to be small.
      if (cs.textTransform === 'uppercase' || parseFloat(cs.letterSpacing) > 0.6) bodyish = false;

      out.text.push({
        bodyish: bodyish,
        inCode: inCode,
        tag: el.tagName.toLowerCase(),
        sample: own.slice(0, 44),
        color: cs.color,
        ground: groundOf(el),
        size: size,
        large: large,
        sel: el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/)[0] : el.tagName.toLowerCase()
      });
    });

    /* --- things you tap --- */
    var tappable = 'button, a[href], input, select, textarea, [role="button"], [role="tab"], [onclick]';
    document.querySelectorAll(tappable).forEach(function (el) {
      if (!visible(el)) return;
      var r = el.getBoundingClientRect();
      var w = r.width, h = r.height;

      // A pseudo-element may be growing the hit area on purpose.
      ['::after', '::before'].forEach(function (pe) {
        var ps = getComputedStyle(el, pe);
        if (ps.content === 'none') return;
        var ph = parseFloat(ps.height), pw = parseFloat(ps.width);
        var top = parseFloat(ps.top), bottom = parseFloat(ps.bottom);
        // Take the pseudo-element's own measured box. Do not also add the
        // negative insets on top of it: that counted the same growth twice
        // and reported a 44px target as 88px.
        if (!isNaN(ph) && ph > h) h = ph;
        if (!isNaN(pw) && pw > w) w = pw;
        if (isNaN(ph) && !isNaN(top) && top < 0) h = Math.max(h, r.height - 2 * top);
        if (isNaN(ph) && !isNaN(bottom) && bottom < 0) h = Math.max(h, r.height - 2 * bottom);
      });

      if (w < cfg.MIN_TARGET - 0.5 || h < cfg.MIN_TARGET - 0.5) {
        out.targets.push({
          sel: el.className && typeof el.className === 'string'
            ? '.' + el.className.trim().split(/\s+/)[0] : el.tagName.toLowerCase(),
          text: (el.textContent || '').trim().slice(0, 24),
          w: Math.round(w), h: Math.round(h)
        });
      }
    });

    /* --- inputs that would make iOS zoom --- */
    document.querySelectorAll('input, select, textarea').forEach(function (el) {
      if (!visible(el)) return;
      var size = parseFloat(getComputedStyle(el).fontSize);
      if (size < cfg.MIN_INPUT_FONT) {
        out.inputs.push({ name: el.name || el.type || el.tagName.toLowerCase(), size: size });
      }
    });

    /* --- transitions on properties that cause layout or paint --- */
    document.querySelectorAll('*').forEach(function (el) {
      if (!visible(el)) return;
      var cs2 = getComputedStyle(el);
      var props = cs2.transitionProperty;
      if (!props || props === 'none') return;
      var durs = (cs2.transitionDuration || '').split(',').map(function (d) {
        d = d.trim();
        return d.slice(-2) === 'ms' ? parseFloat(d) : parseFloat(d) * 1000;
      });
      props.split(',').map(function (s) { return s.trim(); }).forEach(function (p, i) {
        if (p === 'transform' || p === 'opacity' || p === 'none') return;
        var ms = durs[i] != null ? durs[i] : (durs[0] || 0);
        // transitionProperty computes to "all" on every element that has no
        // transition at all. A zero-length transition is not a transition.
        if (!ms) return;
        var isLayout = cfg.LAYOUT_PROPS.indexOf(p) !== -1 || p === 'all';
        // A long paint transition is only a fault where someone is waiting
        // for it to answer them. On a decorative element that nobody taps,
        // a slow colour drift is the effect, not a delay.
        var interactive = el.matches('a,button,input,select,textarea,[role="button"],[role="tab"],[tabindex]')
          || getComputedStyle(el).cursor === 'pointer';
        if (!isLayout && (ms < cfg.SLOW_PAINT_MS || !interactive)) return;
        out.motion.push({
          sel: el.className && typeof el.className === 'string'
            ? '.' + el.className.trim().split(/\s+/)[0] : el.tagName.toLowerCase(),
          prop: p, ms: Math.round(ms), layout: isLayout
        });
      });
    });

    /* --- sideways scroll --- */
    var de = document.documentElement;
    if (de.scrollWidth > de.clientWidth + 1) {
      var widest = null, max = 0;
      document.querySelectorAll('*').forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.right > max) { max = r.right; widest = el; }
      });
      out.overflow = {
        page: de.scrollWidth, viewport: de.clientWidth,
        widest: widest ? (widest.className && typeof widest.className === 'string'
          ? '.' + widest.className.trim().split(/\s+/)[0] : widest.tagName.toLowerCase()) : '?',
        right: Math.round(max)
      };
    }
    return out;
  }, { MIN_TARGET: MIN_TARGET, MIN_INPUT_FONT: MIN_INPUT_FONT, LAYOUT_PROPS: LAYOUT_PROPS, SLOW_PAINT_MS: SLOW_PAINT_MS });

  await browser.close();

  /* ---- grade it here, in Node, where the maths is reliable ---- */
  var fails = [];
  var seen = {};

  found.text.forEach(function (t) {
    var fg = parseRGB(t.color), bg = parseRGB(t.ground);
    if (!fg || !bg) return;
    if (fg.a < 1) fg = over(fg, bg);
    var fgHex = toHex(fg), bgHex = toHex(bg);
    var need = t.large ? 3 : 4.5;
    var r;
    try { r = C.ratio(fgHex, bgHex); } catch (e) { return; }
    if (r < need) {
      var key = fgHex + bgHex + t.sel;
      if (seen[key]) return;
      seen[key] = 1;
      var fixed = C.fix(fgHex, bgHex, need);
      fails.push({
        rule: 'contrast',
        where: t.sel,
        detail: fgHex + ' on ' + bgHex + ' is ' + r.toFixed(2) + ':1, needs ' + need + ':1',
        sample: t.sample,
        fix: 'use ' + fixed.hex + ' (' + fixed.ratio.toFixed(2) + ':1)'
      });
    }
    // Two different floors. Body copy must clear 15px. Anything else only
    // has to stay readable at all, which is 11px.
    var floor = (t.bodyish && !t.inCode) ? MIN_BODY_FONT : MIN_ANY_FONT;
    if (t.size < floor && !t.large) {
      var k2 = 'size' + t.sel + t.size;
      if (!seen[k2]) { seen[k2] = 1;
        fails.push({ rule: 'font-size', where: t.sel,
          detail: t.size + 'px, floor for ' + (t.bodyish ? 'body copy' : 'labels') + ' is ' + floor + 'px',
          sample: t.sample,
          fix: 'raise to ' + floor + 'px or demote this text' });
      }
    }
  });

  found.targets.forEach(function (t) {
    var key = 'tgt' + t.sel + t.w + t.h;
    if (seen[key]) return; seen[key] = 1;
    fails.push({ rule: 'touch-target', where: t.sel,
      detail: t.w + 'x' + t.h + 'px, needs ' + MIN_TARGET + 'px in both directions',
      sample: t.text,
      fix: 'keep the look, grow the box: ::after { content:""; position:absolute; inset:-Npx }' });
  });

  found.inputs.forEach(function (i) {
    fails.push({ rule: 'input-zoom', where: i.name,
      detail: i.size + 'px font, iOS zooms the page below ' + MIN_INPUT_FONT + 'px',
      sample: '', fix: 'set font-size: ' + MIN_INPUT_FONT + 'px' });
  });

  found.motion.forEach(function (m) {
    var key = 'mot' + m.sel + m.prop;
    if (seen[key]) return; seen[key] = 1;
    fails.push({
      rule: m.layout ? 'motion-layout' : 'motion-slow-paint',
      where: m.sel,
      detail: m.layout
        ? 'transitions ' + m.prop + ', which re-runs layout every frame'
        : 'transitions ' + m.prop + ' over ' + m.ms + 'ms, long enough to feel sluggish',
      sample: '',
      fix: m.layout
        ? 'move the change to transform, or drop the transition'
        : 'shorten it to under ' + SLOW_PAINT_MS + 'ms' });
  });

  if (found.overflow) {
    fails.push({ rule: 'overflow', where: found.overflow.widest,
      detail: 'page is ' + found.overflow.page + 'px wide in a ' + found.overflow.viewport + 'px viewport',
      sample: '', fix: 'add min-width: 0, or wrap it in an element that scrolls' });
  }

  return { target: target, width: opts.width, checked: found.text.length, fails: fails };
}

/* ---- command line ---- */
if (require.main === module) {
  var argv = process.argv.slice(2);
  var target = argv.find(function (a) { return a[0] !== '-'; });
  if (!target) {
    console.log('usage: node tools/audit.js <file-or-url> [--width 400] [--json]');
    process.exit(2);
  }
  var wi = argv.indexOf('--width');
  var opts = {
    width: wi !== -1 ? parseInt(argv[wi + 1], 10) : 400,
    height: 900,
    json: argv.indexOf('--json') !== -1
  };

  audit(target, opts).then(function (res) {
    if (opts.json) { console.log(JSON.stringify(res, null, 2)); process.exit(res.fails.length ? 1 : 0); }

    console.log('\n' + res.target + '  at ' + res.width + 'px   (' + res.checked + ' text runs read)');
    if (!res.fails.length) { console.log('\n  nothing measurable is wrong.\n'); process.exit(0); }

    var byRule = {};
    res.fails.forEach(function (f) { (byRule[f.rule] = byRule[f.rule] || []).push(f); });
    Object.keys(byRule).forEach(function (rule) {
      console.log('\n  ' + rule + '  (' + byRule[rule].length + ')');
      byRule[rule].forEach(function (f) {
        console.log('    ' + f.where + '  ' + f.detail);
        if (f.sample) console.log('      "' + f.sample + '"');
        console.log('      -> ' + f.fix);
      });
    });
    console.log('\n  ' + res.fails.length + ' to fix.\n');
    process.exit(1);
  }).catch(function (e) {
    console.error('audit failed: ' + e.message);
    process.exit(2);
  });
}

module.exports = { audit: audit };
