#!/usr/bin/env node
/**
 * Contrast maths, WCAG 2.1 relative luminance.
 *
 * Two jobs:
 *   check   — what is the ratio between two colours, and does it pass
 *   darken  — find the nearest colour to a brand hue that DOES pass,
 *             keeping hue and saturation so the brand still reads
 *
 * Usage:
 *   node tools/contrast.js check "#e03a4b" "#ffffff"
 *   node tools/contrast.js check "#e03a4b" "#ffffff" --large
 *   node tools/contrast.js darken "#e03a4b" "#ffffff" 4.5
 *
 * No dependencies. Exported so the audit script can require() it.
 */

function hex(c) {
  var s = String(c).trim().replace(/^#/, '');
  if (s.length === 3) s = s[0]+s[0]+s[1]+s[1]+s[2]+s[2];
  if (!/^[0-9a-fA-F]{6}$/.test(s)) throw new Error('not a hex colour: ' + c);
  return [parseInt(s.slice(0,2),16), parseInt(s.slice(2,4),16), parseInt(s.slice(4,6),16)];
}

function toHex(rgb) {
  return '#' + rgb.map(function (v) {
    var n = Math.max(0, Math.min(255, Math.round(v)));
    return (n < 16 ? '0' : '') + n.toString(16);
  }).join('');
}

/** WCAG 2.1 relative luminance. The 0.03928 branch is the sRGB transfer curve. */
function luminance(rgb) {
  var a = rgb.map(function (v) {
    var s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * a[0] + 0.7152 * a[1] + 0.0722 * a[2];
}

function ratio(a, b) {
  var la = luminance(hex(a)), lb = luminance(hex(b));
  var hi = Math.max(la, lb), lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

/* ---- HSL, so darkening keeps the hue instead of muddying it ---- */

function rgbToHsl(rgb) {
  var r = rgb[0]/255, g = rgb[1]/255, b = rgb[2]/255;
  var max = Math.max(r,g,b), min = Math.min(r,g,b), d = max - min;
  var h = 0, s = 0, l = (max + min) / 2;
  if (d !== 0) {
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r)      h = ((g - b) / d + (g < b ? 6 : 0));
    else if (max === g) h = ((b - r) / d + 2);
    else                h = ((r - g) / d + 4);
    h /= 6;
  }
  return [h, s, l];
}

function hslToRgb(hsl) {
  var h = hsl[0], s = hsl[1], l = hsl[2];
  if (s === 0) return [l*255, l*255, l*255];
  var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  var p = 2 * l - q;
  function hue(t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  }
  return [hue(h + 1/3) * 255, hue(h) * 255, hue(h - 1/3) * 255];
}

/**
 * Walk lightness down (or up, on a dark ground) in small steps until the
 * ratio passes. Hue and saturation are untouched, so #e03a4b stays the
 * same red, just deep enough to read.
 */
function fix(colour, against, target) {
  target = target || 4.5;
  if (ratio(colour, against) >= target) return { hex: colour, ratio: ratio(colour, against), changed: false };

  var hsl = rgbToHsl(hex(colour));
  var groundIsLight = luminance(hex(against)) > 0.5;
  var step = groundIsLight ? -0.002 : 0.002;

  for (var i = 0; i < 600; i++) {
    hsl[2] += step;
    if (hsl[2] <= 0 || hsl[2] >= 1) break;
    var candidate = toHex(hslToRgb(hsl));
    if (ratio(candidate, against) >= target) {
      return { hex: candidate, ratio: ratio(candidate, against), changed: true };
    }
  }
  return { hex: groundIsLight ? '#000000' : '#ffffff', ratio: ratio(groundIsLight ? '#000000' : '#ffffff', against), changed: true };
}

module.exports = { ratio: ratio, fix: fix, luminance: luminance, hex: hex, toHex: toHex };

/* ---- command line ---- */
if (require.main === module) {
  var a = process.argv.slice(2);
  var cmd = a[0];

  if (cmd === 'check') {
    var large = a.indexOf('--large') !== -1;
    var need = large ? 3 : 4.5;
    var r = ratio(a[1], a[2]);
    var pass = r >= need;
    console.log(a[1] + ' on ' + a[2] + '  ' + r.toFixed(2) + ':1  needs ' + need + ':1  ' + (pass ? 'PASS' : 'FAIL'));
    process.exit(pass ? 0 : 1);
  }

  if (cmd === 'darken') {
    var want = parseFloat(a[3] || '4.5');
    var before = ratio(a[1], a[2]);
    var out = fix(a[1], a[2], want);
    console.log('was  ' + a[1] + '  ' + before.toFixed(2) + ':1');
    console.log('now  ' + out.hex + '  ' + out.ratio.toFixed(2) + ':1  (target ' + want + ')');
    process.exit(0);
  }

  console.log('usage:\n  node tools/contrast.js check <fg> <bg> [--large]\n  node tools/contrast.js darken <colour> <against> [target]');
  process.exit(2);
}
