/* =========================================================================
   App motion: the few behaviours CSS cannot do on its own. No build step:
     <script src="../../app-motion.js"></script>   then AppMotion.*

   sheet(dialog)        a <dialog class="sheet">: closes on its backdrop, and
                        on a flick of its .sheet-grip (a flick is enough:
                        about 0.11px/ms, Emil Kowalski's gestures rule)
   toast(el, text, action, onAction)
                        one line and one way back, gone after 4.2s
   flyTo(from, to)      a copy of `from` travels on a curve into `to`, then
                        `to` gives a small bump: where the thing went
   bump(el)             the small bump alone (a count changed)

   Every one respects prefers-reduced-motion: nothing travels, nothing
   bumps; the state still changes. Durations and curves are the tokens in
   tokens/tokens.css; tools/motion.js checks them.
   ========================================================================= */
(function () {
  var EASE_OUT = 'cubic-bezier(.23, 1, .32, 1)';
  function still() { return matchMedia('(prefers-reduced-motion: reduce)').matches; }

  function sheet(el) {
    el.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { el.close(); }); });
    // A tap on the dim backdrop closes it, where closedby="any" is not yet understood.
    el.addEventListener('click', function (e) { if (e.target === el && e.clientY < el.getBoundingClientRect().top) el.close(); });
    var grip = el.querySelector('.sheet-grip');
    if (!grip) return el;
    var y0 = 0, trail = [], held = false;
    grip.addEventListener('pointerdown', function (e) {
      held = true; grip.setPointerCapture(e.pointerId); y0 = e.clientY; trail = [[e.clientY, e.timeStamp]]; el.style.transition = 'none';
    });
    grip.addEventListener('pointermove', function (e) {
      if (!held) return;
      var dy = e.clientY - y0;
      el.style.setProperty('--drag', (dy < 0 ? dy / 6 : dy) + 'px');   // upward, it resists
      trail.push([e.clientY, e.timeStamp]); if (trail.length > 6) trail.shift();
    });
    function release(e) {
      if (!held) return; held = false;
      var speed = (e.clientY - trail[0][0]) / Math.max(1, e.timeStamp - trail[0][1]);   // px per ms
      el.style.transition = '';
      if (speed > 0.11 || e.clientY - y0 > el.offsetHeight * 0.3) el.close();
      el.style.removeProperty('--drag');
    }
    grip.addEventListener('pointerup', release);
    grip.addEventListener('pointercancel', release);
    return el;
  }

  var toastTimer;
  function toast(el, text, action, onAction) {
    el.querySelector('span').textContent = text;
    var b = el.querySelector('button');
    b.textContent = action || ''; b.hidden = !action;
    b.onclick = function () { el.hidden = true; if (onAction) onAction(); };
    el.hidden = false;
    clearTimeout(toastTimer); toastTimer = setTimeout(function () { el.hidden = true; }, 4200);
  }

  function bump(el) {
    if (!el || still() || !el.animate) return;
    el.animate([{ scale: 1 }, { scale: 1.14 }, { scale: 1 }], { duration: 280, easing: EASE_OUT });
  }

  // The copy is an image when `from` holds one (a photo travels best), else
  // the element itself. It flies over 420ms on the house ease-out: done to
  // the eye at about 200ms, lifting on the way like something tossed.
  function flyTo(from, to) {
    if (!from || !to || still() || !document.body.animate) { bump(to); return Promise.resolve(); }
    var a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
    var img = from.tagName === 'IMG' ? from : from.querySelector('img');
    var ghost = img ? img.cloneNode() : from.cloneNode(true);
    var size = Math.min(a.width, a.height, 160);
    Object.assign(ghost.style, {
      position: 'fixed', zIndex: 90, pointerEvents: 'none', margin: 0, objectFit: 'cover',
      left: a.left + a.width / 2 - size / 2 + 'px', top: a.top + a.height / 2 - size / 2 + 'px',
      width: size + 'px', height: size + 'px', borderRadius: '50%', boxShadow: '0 12px 30px rgba(0,0,0,.2)'
    });
    ghost.setAttribute('aria-hidden', 'true');
    document.body.appendChild(ghost);
    var dx = b.left + b.width / 2 - (a.left + a.width / 2), dy = b.top + b.height / 2 - (a.top + a.height / 2);
    var end = Math.max(0.18, Math.min(1, b.width / size) * 0.7);
    var lift = Math.min(120, Math.abs(dy) * 0.35 + 40);
    var anim = ghost.animate([
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: 'translate(' + dx * 0.55 + 'px, ' + (dy * 0.45 - lift) + 'px) scale(' + (1 + end) / 2 + ')', opacity: 1, offset: 0.5 },
      { transform: 'translate(' + dx + 'px, ' + dy + 'px) scale(' + end + ')', opacity: 0.6 }
    ], { duration: 420 * (parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--ia-k')) || 1), easing: EASE_OUT });   // --ia-k: the motion personality, interactions.js
    return anim.finished.then(function () { ghost.remove(); bump(to); }, function () { ghost.remove(); });
  }

  window.AppMotion = { sheet: sheet, toast: toast, flyTo: flyTo, bump: bump, still: still };
})();
