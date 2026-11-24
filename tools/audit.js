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
 *   node tools/audit.js dist/hvac/index.html --motion   (the motion spec too)
 *
 * Exit code 1 if any rule fails, so it can gate a build.
 */

var path = require('path');
var fs = require('fs');
var C = require('./contrast.js');
var PNG = require('./png.js');

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

    /* Walk up for the first ancestor that actually paints a background.
       `found` records whether one was really there: when the walk falls all the
       way through to the page default, the answer is a guess, and that is the
       only case where the pixels need photographing. */
    var groundFound = false;
    function groundOf(el) {
      var n = el;
      groundFound = false;
      while (n && n !== document.documentElement) {
        var bg = getComputedStyle(n).backgroundColor;
        var m = bg.match(/rgba?\(([^)]+)\)/);
        if (m) {
          var p = m[1].split(/[,\s/]+/).filter(Boolean).map(parseFloat);
          var a = p.length > 3 ? p[3] : 1;
          /* body does not count as "found": it is the page default, which is
             exactly the fall-through case that needs its pixels read. */
          if (a > 0.92) { groundFound = (n !== document.body); return bg; }
        }
        n = n.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor || 'rgb(255,255,255)';
    }

    /* Does something paint between this text and the background the walk
       found? A full-bleed hero puts its photograph in an absolutely positioned
       sibling, so groundOf() walks straight past it and returns the page
       colour. elementsFromPoint sees what the screen sees. */
    var stamp = 0;
    function paintedOver(el) {
      var r = el.getBoundingClientRect();
      if (!r.width || !r.height) return false;
      if (r.bottom < 0 || r.top > innerHeight || r.right < 0 || r.left > innerWidth) return false;
      var pts = [[r.left + r.width * .5, r.top + r.height * .5],
                 [r.left + 4, r.top + 4], [r.right - 4, r.bottom - 4]];
      for (var i = 0; i < pts.length; i++) {
        var stack = document.elementsFromPoint(pts[i][0], pts[i][1]);
        var at = stack.indexOf(el);
        if (at < 0) continue;
        for (var k = at + 1; k < stack.length; k++) {
          var n = stack[k], ns = getComputedStyle(n);
          if (n.tagName === 'IMG' || n.tagName === 'VIDEO' || n.tagName === 'CANVAS') return true;
          if (ns.backgroundImage && ns.backgroundImage !== 'none') return true;
        }
      }
      return false;
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

      // Text painted by a clipped background gradient reports color:transparent,
      // and flattening that onto its own background gives a false 1:1. The
      // audit cannot evaluate a gradient per-glyph, so it says so rather than
      // reporting a failure it did not actually measure.
      var clipped = (cs.webkitBackgroundClip === 'text' || cs.backgroundClip === 'text')
                    && (cs.color === 'rgba(0, 0, 0, 0)' || cs.color === 'transparent');

      // When the paint comes from a gradient, pull every colour stop out of the
      // computed background-image. The worst stop is what decides whether the
      // text is readable, and finding it is arithmetic — which is this tool's
      // half of the job, so it should not be handed back to a person.
      var stops = null;
      if (clipped) {
        stops = (cs.backgroundImage || '').match(/rgba?\([^)]*\)/g) || null;
      }

      /* groundOf() must run before this: it sets groundFound, and an element
         that sits on a real opaque background (a white pill button over a
         photograph) needs no sampling — the walk already had it right. */
      var ground = groundOf(el);
      var over = groundFound ? false : paintedOver(el);
      var mark = null, rect = null;
      if (over) {
        mark = 'da' + (++stamp);
        el.setAttribute('data-da-audit', mark);
        var rr = el.getBoundingClientRect();
        rect = { x: Math.max(0, Math.floor(rr.left)), y: Math.max(0, Math.floor(rr.top)),
                 width: Math.max(1, Math.ceil(Math.min(rr.width, innerWidth - rr.left))),
                 height: Math.max(1, Math.ceil(Math.min(rr.height, innerHeight - rr.top))) };
      }

      out.text.push({
        overPaint: over,
        mark: mark,
        rect: rect,
        clipped: clipped,
        stops: stops,
        bodyish: bodyish,
        inCode: inCode,
        tag: el.tagName.toLowerCase(),
        sample: own.slice(0, 44),
        color: cs.color,
        ground: ground,
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

    /* --- motion spec facts (docs/phone/motion-spec.md) --- */
    out.spec = { bounce: [], press: [], stagger: [], dropdown: [],
                 reduced: false, sheetsUnread: 0 };

    // Does a reduced-motion block exist anywhere in the page's stylesheets?
    // An external sheet loaded over file:// throws on .cssRules in Chromium,
    // so count what could not be read. Not being able to see a rule is not
    // the same as the rule being absent, and reporting it as absent was
    // this tool telling the page off for its own blind spot.
    for (var si = 0; si < document.styleSheets.length; si++) {
      var rules = null;
      try { rules = document.styleSheets[si].cssRules; } catch (e) { rules = null; }
      if (!rules) { out.spec.sheetsUnread++; continue; }
      for (var ri = 0; ri < rules.length; ri++) {
        var cond = rules[ri].conditionText || (rules[ri].media && rules[ri].media.mediaText) || '';
        if (/prefers-reduced-motion/.test(cond)) out.spec.reduced = true;
      }
    }

    function bez(str) {
      var m = String(str).match(/cubic-bezier\(([^)]+)\)/);
      if (!m) return null;
      var p = m[1].split(',').map(parseFloat);
      return p.length === 4 ? p : null;
    }

    var everyday = 'button, [role="button"], [role="tab"], input, select, a[href]';
    document.querySelectorAll(everyday).forEach(function (el) {
      if (!visible(el)) return;
      var cs = getComputedStyle(el);
      var sel = el.className && typeof el.className === 'string'
        ? '.' + el.className.trim().split(/\s+/)[0] : el.tagName.toLowerCase();

      // Rule 6: overshoot on something pressed often
      [cs.transitionTimingFunction, cs.animationTimingFunction].forEach(function (tf) {
        (tf || '').split(',').forEach(function (one) {
          var b = bez(one);
          if (b && (b[1] > 1.001 || b[3] > 1.001)) {
            out.spec.bounce.push({ sel: sel, curve: one.trim() });
          }
        });
      });
    });

    // Rule 3: stagger step between siblings that carry animation-delay
    document.querySelectorAll('*').forEach(function (el) {
      var kids = Array.from(el.children).filter(function (c) {
        var d = getComputedStyle(c).animationDelay;
        return d && d !== '0s' && parseFloat(d) > 0;
      });
      if (kids.length < 3) return;
      var ds = kids.map(function (c) { return parseFloat(getComputedStyle(c).animationDelay) * 1000; });
      ds.sort(function (a, b) { return a - b; });
      var steps = [];
      for (var i = 1; i < ds.length; i++) steps.push(ds[i] - ds[i - 1]);
      var step = steps.reduce(function (a, b) { return a + b; }, 0) / steps.length;
      out.spec.stagger.push({
        sel: el.className && typeof el.className === 'string'
          ? '.' + el.className.trim().split(/\s+/)[0] : el.tagName.toLowerCase(),
        step: Math.round(step), count: kids.length, total: Math.round(ds[ds.length - 1])
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

  /* ---- Read the pixels actually behind text that sits over a photograph ----
     The text is hidden, the region is photographed, and the worst-contrasting
     pixel in it becomes the ground. Worst, not average: a headline is readable
     only if its palest letter clears the brightest thing behind it. This is the
     one case the DOM walk cannot answer, and guessing it either waves through
     white-on-white or condemns every photographic hero on the web. */
  for (var ti = 0; ti < found.text.length; ti++) {
    var tr = found.text[ti];
    if (!tr.overPaint || !tr.mark || !tr.rect) continue;
    var sel = '[data-da-audit="' + tr.mark + '"]';
    try {
      /* The glyphs are made transparent rather than the element hidden. Hiding
         it also removes its own background — a white pill button vanished and
         the audit measured the photograph behind the button instead of the
         button, then reported the label as 1.08:1 against it. */
      await page.$eval(sel, function (e) {
        e.setAttribute('data-da-colour', e.style.color || '');
        e.style.color = 'transparent'; e.style.textShadow = 'none';
        /* Child elements are beside the glyphs, not behind them. A logo's mark
           sits inside the same box as its wordmark, and taking the worst pixel
           in that box reported the white mark as the background of the white
           text — 1.00:1 for something plainly readable on the screen. */
        Array.prototype.forEach.call(e.children, function (c) {
          c.setAttribute('data-da-vis', c.style.visibility || '');
          c.style.visibility = 'hidden';
        });
      });
      var shot = await page.screenshot({ clip: tr.rect });
      await page.$eval(sel, function (e) {
        e.style.color = e.getAttribute('data-da-colour') || '';
        e.style.textShadow = ''; e.removeAttribute('data-da-colour');
        Array.prototype.forEach.call(e.children, function (c) {
          c.style.visibility = c.getAttribute('data-da-vis') || '';
          c.removeAttribute('data-da-vis');
        });
      });
      var px = PNG.pixels(PNG.decode(shot));
      var ink = parseRGB(tr.color);
      if (!ink || !px.length) continue;
      var inkHex = toHex(ink), worstR = null, worstPx = null, worstRGB = null;
      /* Sample on a grid rather than every pixel: a 680x300 headline box is
         200k pixels and the answer does not change. */
      var step = Math.max(1, Math.floor(px.length / 4000));
      for (var pi = 0; pi < px.length; pi += step) {
        var q = px[pi];
        var qh = toHex({ r: q[0], g: q[1], b: q[2], a: 1 }), rr2;
        try { rr2 = C.ratio(inkHex, qh); } catch (e) { continue; }
        if (worstR === null || rr2 < worstR) {
          worstR = rr2; worstPx = qh;
          /* rgb(), not hex: the grader parses computed-style strings, and a
             hex ground made parseRGB return null, so every sampled run was
             dropped before it was ever compared. */
          worstRGB = 'rgb(' + q[0] + ', ' + q[1] + ', ' + q[2] + ')';
        }
      }
      if (worstPx) {
        tr.ground = worstRGB; tr.measured = true;
        if (process.env.DA_DEBUG) console.error('MEASURED', tr.sel, tr.sample.slice(0,18), '->', worstPx);
      }
    } catch (e) { if (process.env.DA_DEBUG) console.error("SAMPLE FAIL", tr.sel, e.message); }
  }

  await browser.close();

  /* ---- grade it here, in Node, where the maths is reliable ---- */
  var fails = [];
  var seen = {};

  found.text.forEach(function (t) {
    if (t.clipped) {
      var ck = 'clip' + t.sel;
      if (seen[ck]) return;
      seen[ck] = 1;

      var gb = parseRGB(t.ground);
      if (!t.stops || !t.stops.length || !gb) {
        fails.push({ rule: 'contrast-unverified', where: t.sel,
          detail: 'painted by a clipped background whose colours could not be read',
          sample: t.sample,
          fix: 'check the darkest part of the fill against the ground by hand' });
        return;
      }

      // Grade the gradient on its worst stop against the real ground.
      var need = t.large ? 3 : 4.5;
      var worst = null, worstHex = null;
      t.stops.forEach(function (st) {
        var c = parseRGB(st); if (!c) return;
        if (c.a < 1) c = over(c, gb);
        var h = toHex(c), r;
        try { r = C.ratio(h, toHex(gb)); } catch (e) { return; }
        if (worst === null || r < worst) { worst = r; worstHex = h; }
      });

      if (worst !== null && worst < need) {
        var fixed = C.fix(worstHex, toHex(gb), need);
        fails.push({ rule: 'contrast', where: t.sel,
          detail: 'gradient text: worst stop ' + worstHex + ' on ' + toHex(gb)
                + ' is ' + worst.toFixed(2) + ':1, needs ' + need + ':1',
          sample: t.sample,
          fix: 'lighten that stop to ' + fixed.hex + ' (' + fixed.ratio.toFixed(2) + ':1)' });
      }
      return;
    }
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
      /* When the ink is already as far as it can go — white on a mid-tone, say
         — "use #ffffff" is not advice, it is the colour that just failed. Say
         what would actually work instead. */
      var advice = (fixed.ratio + 0.005 < need || fixed.hex.toLowerCase() === fgHex.toLowerCase())
        ? 'ink cannot go further on this ground (best ' + fixed.ratio.toFixed(2)
          + ':1) — darken what is behind it'
          + (t.measured ? ', which here is the photograph: deepen the scrim' : '')
        : 'use ' + fixed.hex + ' (' + fixed.ratio.toFixed(2) + ':1)';
      fails.push({
        rule: 'contrast',
        where: t.sel,
        detail: fgHex + ' on ' + bgHex + ' is ' + r.toFixed(2) + ':1, needs ' + need + ':1'
              + (t.measured ? ' (background read from the rendered pixels)' : ''),
        sample: t.sample,
        fix: advice
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

  /* ---- motion spec, only when asked ---- */
  if (opts.motion) {
    found.spec.bounce.forEach(function (b) {
      var key = 'bnc' + b.sel + b.curve;
      if (seen[key]) return; seen[key] = 1;
      fails.push({ rule: 'motion-spec-bounce', where: b.sel,
        detail: b.curve + ' overshoots, on something pressed often',
        sample: '', fix: 'keep bounce for the rare moment; use a curve that ends at 1' });
    });

    found.spec.stagger.forEach(function (st) {
      // 30ms per row, and the last row should not wait longer than ~240ms
      if (st.step > 45) {
        fails.push({ rule: 'motion-spec-stagger', where: st.sel,
          detail: st.step + 'ms per row across ' + st.count + ' rows; the spec is ~30ms',
          sample: '', fix: 'drop to 30ms on a dense list, or keep 55ms only on a marketing page' });
      }
      if (st.total > 240) {
        fails.push({ rule: 'motion-spec-stagger', where: st.sel,
          detail: 'the last row waits ' + st.total + 'ms',
          sample: '', fix: 'cap it: animation-delay: min(calc(var(--i) * 30ms), 240ms)' });
      }
    });

    if (!found.spec.reduced) {
      if (found.spec.sheetsUnread) {
        fails.push({ rule: 'motion-spec-reduced', where: 'stylesheet',
          detail: 'could not verify: ' + found.spec.sheetsUnread + ' stylesheet(s) unreadable '
                + '(external sheets over file:// throw on .cssRules)',
          sample: '', fix: 'serve the page over http to check this, e.g. npx serve dist/<site>' });
      } else {
        fails.push({ rule: 'motion-spec-reduced', where: 'stylesheet',
          detail: 'no @media (prefers-reduced-motion: reduce) block found',
          sample: '', fix: 'add one and disable transitions and animations inside it' });
      }
    }
  }

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
    console.log('usage: node tools/audit.js <file-or-url> [--width 400] [--json] [--motion]');
    process.exit(2);
  }
  var wi = argv.indexOf('--width');
  var opts = {
    width: wi !== -1 ? parseInt(argv[wi + 1], 10) : 400,
    height: 900,
    json: argv.indexOf('--json') !== -1,
    motion: argv.indexOf('--motion') !== -1
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
