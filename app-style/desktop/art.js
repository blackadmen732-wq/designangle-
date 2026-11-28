/*
 * Dark glass art: the light streaks and the chrome mark, drawn in code.
 *
 *   DG.streaks(el, lines)   draws light streaks into el (a .dg-art layer)
 *   DG.mark(size)           the chrome "C" mark as an SVG string
 *   DG.enter(root)          staggers [data-enter] children in, once
 *
 * What code can and cannot do here. A reference made in a 3D or image tool
 * has streaks with real depth: a lit sheet of glass that bends, catches a
 * hot white edge and falls off into black. This draws the same idea from
 * three layers per streak, a wide soft sheet, a blurred glow and a thin hot
 * core, and gets the composition and the feel, not the photograph. Where a
 * screen needs the photograph, render the art in an image tool, export it
 * as a WebP with a transparent or black ground, and put it in .dg-art as an
 * <img>: the rest of the screen does not change.
 *
 * Every streak drifts slowly (20 to 40 seconds a cycle) and a highlight
 * travels along its core. Both stop under prefers-reduced-motion, which is
 * the right call for a background nobody asked to watch.
 *
 * Lines are given in the reference's own pixels, on a 1672 x 941 canvas;
 * the SVG is scaled to cover the screen, so they keep their place.
 */
(function () {
  var NS = 'http://www.w3.org/2000/svg';
  var uid = 0;

  function streaks(el, lines) {
    var id = 'dg' + (++uid);
    var defs = '<filter id="' + id + 'b" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>'
      + '<filter id="' + id + 'bb" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="26"/></filter>';
    var body = '';
    lines.forEach(function (l, i) {
      var g = id + 'g' + i, s = id + 's' + i;
      var a = l.from || [0, 0], b = l.to || [1672, 941];
      // the core is hottest at l.hot (0..1 along the line) and fades out to both ends
      var hot = l.hot == null ? 0.55 : l.hot;
      defs += '<linearGradient id="' + g + '" gradientUnits="userSpaceOnUse" x1="' + a[0] + '" y1="' + a[1] + '" x2="' + b[0] + '" y2="' + b[1] + '">'
        + '<stop offset="0" stop-color="#fff" stop-opacity="0"/>'
        + '<stop offset="' + Math.max(0, hot - 0.3) + '" stop-color="#fff" stop-opacity=".35"/>'
        + '<stop offset="' + hot + '" stop-color="#fff" stop-opacity="1"/>'
        + '<stop offset="' + Math.min(1, hot + 0.25) + '" stop-color="#fff" stop-opacity=".45"/>'
        + '<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>';
      if (l.sheet) {
        defs += '<linearGradient id="' + s + '" gradientUnits="userSpaceOnUse" x1="' + (l.sheetFrom || a)[0] + '" y1="' + (l.sheetFrom || a)[1] + '" x2="' + (l.sheetTo || b)[0] + '" y2="' + (l.sheetTo || b)[1] + '">'
          + '<stop offset="0" stop-color="#fff" stop-opacity="0"/>'
          + '<stop offset=".55" stop-color="#d8d8e0" stop-opacity="' + (l.sheetOpacity || 0.14) + '"/>'
          + '<stop offset="1" stop-color="#fff" stop-opacity="0"/></linearGradient>';
      }
      var o = l.opacity == null ? 1 : l.opacity;
      body += '<g class="dg-streak" style="--dx:' + (l.drift ? l.drift[0] : 14) + 'px;--dy:' + (l.drift ? l.drift[1] : -8) + 'px;--rot:' + (l.drift ? l.drift[2] : 0.6) + 'deg;--dur:' + (l.dur || 28) + 's;--delay:' + (-i * 3.1) + 's;opacity:' + o + '">'
        + (l.sheet ? '<path d="' + l.sheet + '" fill="url(#' + s + ')"/>' : '')
        + '<path d="' + l.d + '" fill="none" stroke="url(#' + g + ')" stroke-width="' + (l.glow || 26) + '" stroke-linecap="round" opacity=".22" filter="url(#' + id + 'bb)"/>'
        + '<path d="' + l.d + '" fill="none" stroke="url(#' + g + ')" stroke-width="' + ((l.width || 2) * 3) + '" stroke-linecap="round" opacity=".55" filter="url(#' + id + 'b)"/>'
        + '<path d="' + l.d + '" fill="none" stroke="url(#' + g + ')" stroke-width="' + (l.width || 2) + '" stroke-linecap="round"/>'
        + '<path class="dg-sheen" pathLength="100" d="' + l.d + '" fill="none" stroke="#fff" stroke-width="' + ((l.width || 2) + 0.6) + '" stroke-linecap="round" filter="url(#' + id + 'b)"/>'
        + '</g>';
    });
    el.innerHTML = '<svg xmlns="' + NS + '" viewBox="0 0 1672 941" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><defs>' + defs + '</defs>' + body + '</svg>';
  }

  /* The mark: a C cut at an angle, an inner blade, and three slanted bars,
     in brushed chrome. Drawn on a 120 x 100 box. */
  function mark(size, opts) {
    opts = opts || {};
    var id = 'dgm' + (++uid), w = size || 64, h = Math.round(w * 100 / 120);
    var glow = opts.glow === false ? '' : ' filter="url(#' + id + 'f)"';
    return '<svg class="dg-mark" width="' + w + '" height="' + h + '" viewBox="0 0 120 100" aria-hidden="true">'
      + '<defs><linearGradient id="' + id + 'c" x1="0" y1="0" x2="1" y2="1">'
      + '<stop offset="0" stop-color="#ffffff"/><stop offset=".38" stop-color="#e9e9ee"/>'
      + '<stop offset=".52" stop-color="#9c9da6"/><stop offset=".6" stop-color="#d9dae0"/>'
      + '<stop offset="1" stop-color="#f7f7fa"/></linearGradient>'
      + '<linearGradient id="' + id + 'd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f4f4f7"/><stop offset="1" stop-color="#8d8e97"/></linearGradient>'
      + '<filter id="' + id + 'f" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur in="SourceAlpha" stdDeviation="3.2" result="b"/>'
      + '<feFlood flood-color="#fff" flood-opacity=".45"/><feComposite in2="b" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter></defs>'
      + '<g' + glow + '>'
      // the C: angled cut top right, a beak bottom right
      + '<path fill="url(#' + id + 'c)" d="M104 6H58C30 6 10 25 10 50s20 44 48 44h34L78 79H59C40 79 27 66 27 50s13-29 32-29h31Z"/>'
      // the blade inside the C
      + '<path fill="url(#' + id + 'd)" opacity=".85" d="M46 26C36 31 31 40 31 50s5 19 15 24c-8-1-16-11-16-24s8-23 16-24Z"/>'
      // three slanted bars
      + '<path fill="url(#' + id + 'd)" d="M58 30h9l-6 11h-9ZM71 30h9l-6 11h-9ZM84 30h9l-6 11h-9Z"/>'
      + '</g></svg>';
  }

  function enter(root) {
    var items = (root || document).querySelectorAll('[data-enter]');
    items.forEach(function (el, i) { el.style.setProperty('--i', i); });
    requestAnimationFrame(function () { document.documentElement.classList.add('dg-in'); });
  }

  window.DG = { streaks: streaks, mark: mark, enter: enter };
})();
