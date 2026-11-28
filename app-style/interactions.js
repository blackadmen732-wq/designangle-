/* =========================================================================
   Interactions: small recipes for how things move when people act, each
   one isolated and tested on its own (app-style/recipes, tools/recipes-test.js).
     <script src="../../interactions.js"></script>   then Interact.*

   Every recipe:
   - moves only transform and opacity (never layout), on the token timings
     in tokens/tokens.css: --t-dropdown, --t-modal, --t-page, --t-expand;
   - can be interrupted: a second press reverses or finishes the first,
     it never stacks;
   - works from the keyboard and puts focus where the person expects it;
   - under reduced motion changes state at once, with no travel.

   expand(card, detail, opts)   a product opens into its detail from where
                                it was (View Transitions where supported,
                                else a FLIP); close() returns it, focus and
                                scroll restored
   dropdown(trigger, menu)      opens from its trigger; arrows, Escape, click
                                outside; focus returns to the trigger
   modal(dialog, opener)        a <dialog> scales up a touch and fades;
                                Escape and the backdrop close it, animated
   steps(root)                  next goes left, back goes right; focus moves
                                to the new step's heading
   removeWithUndo(row, toast)   the row leaves, the rest close the gap, and
                                Undo puts it back where it was
   reflow(list, change)         filter or sort: items move to their new
                                places instead of jumping
   state(el, name, message)     loading, success, error, empty or ready, with
                                aria-busy and a polite announcement
   The bottom sheet, the toast and add-to-cart are AppMotion's (app-motion.js).
   ========================================================================= */
(function () {
  var root = document.documentElement, css = getComputedStyle(root);
  function tok(name, fallback) { return (css.getPropertyValue(name) || '').trim() || fallback; }
  var EASE = tok('--ease-out', 'cubic-bezier(.23, 1, .32, 1)');
  /* Personalities: one mechanism, two characters. Calm is a little slower,
     travels less and never overshoots: for tools used all day and quiet
     brands. Lively is quicker, travels further and settles with a slight
     spring: for rare moments and playful brands. Choose from the product
     and from how often the action happens: the more often, the calmer.
     Set with Interact.personality('calm' | 'lively') or
     <html data-motion="lively">. */
  var PERSONA = {
    calm:   { k: 1.15, travel: 0.75, ease: EASE },
    lively: { k: 0.85, travel: 1.3,  ease: tok('--spring-sheet', EASE) }
  };
  function P() { return PERSONA[root.dataset.motion] || PERSONA.calm; }
  function personality(name) {
    if (name) { root.dataset.motion = name; root.style.setProperty('--ia-k', P().k); }
    return root.dataset.motion || 'calm';
  }
  var q = new URLSearchParams(location.search).get('motion') || (/^#(calm|lively)$/.test(location.hash) ? location.hash.slice(1) : ''); if (q) personality(q);
  function ms(name, fallback) { var v = parseFloat(css.getPropertyValue(name)); return (isNaN(v) ? fallback : v) * P().k; }
  function px(n) { return n * P().travel; }
  function still() { return matchMedia('(prefers-reduced-motion: reduce)').matches; }
  // one running animation per element: a new one finishes the old first
  function play(el, frames, opts) {
    if (el._ia) { try { el._ia.finish(); } catch (e) {} }
    var a = el.animate(frames, Object.assign({ easing: P().ease, fill: 'none' }, opts));
    el._ia = a;
    a.finished.then(function () { if (el._ia === a) el._ia = null; }, function () {});
    return a;
  }
  function rects(nodes) { var m = new Map(); nodes.forEach(function (n) { m.set(n, n.getBoundingClientRect()); }); return m; }
  function flip(before, dur) {
    if (still()) return;
    before.forEach(function (r, n) {
      if (!n.isConnected) return;
      var now = n.getBoundingClientRect(), dx = r.left - now.left, dy = r.top - now.top;
      if (dx || dy) play(n, [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], { duration: dur });
    });
  }

  /* ------------------------------------------------ expand and return */
  function expand(card, detail, opts) {
    opts = opts || {};
    var from = card.querySelector(opts.media || 'img') || card;
    var to = detail.querySelector(opts.media || 'img') || detail;
    var scrollY = window.scrollY, busy = null;
    function show(open) {
      detail.hidden = !open;
      document.documentElement.classList.toggle('ia-detail-open', open);
    }
    function vt(open, after) {
      from.style.viewTransitionName = open ? 'ia-hero' : '';
      to.style.viewTransitionName = open ? '' : 'ia-hero';
      var t = document.startViewTransition(function () {
        show(open);
        from.style.viewTransitionName = open ? '' : 'ia-hero';
        to.style.viewTransitionName = open ? 'ia-hero' : '';
      });
      t.finished.finally(function () { from.style.viewTransitionName = ''; to.style.viewTransitionName = ''; after(); });
      return t;
    }
    function flipMove(open, after) {
      var a = (open ? from : to).getBoundingClientRect();
      show(open);
      var target = open ? to : from, b = target.getBoundingClientRect();
      var anim = play(target, [
        { transform: 'translate(' + (a.left - b.left) + 'px,' + (a.top - b.top) + 'px) scale(' + a.width / b.width + ',' + a.height / b.height + ')', transformOrigin: '0 0' },
        { transform: 'none', transformOrigin: '0 0' }
      ], { duration: ms('--t-expand', 360) });
      anim.finished.then(after, after);
      return anim;
    }
    function go(open) {
      if (busy && busy.skipTransition) busy.skipTransition();
      var after = function () {
        busy = null;
        if (open) { var h = detail.querySelector('h1, h2, [data-focus]') || detail; if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
        else { window.scrollTo(0, scrollY); card.focus({ preventScroll: true }); }
      };
      if (open) scrollY = window.scrollY;
      if (still()) { show(open); after(); return; }
      busy = document.startViewTransition ? vt(open, after) : flipMove(open, after);
    }
    card.addEventListener('click', function (e) { e.preventDefault(); go(true); });
    detail.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { go(false); }); });
    detail.addEventListener('keydown', function (e) { if (e.key === 'Escape') go(false); });
    return { open: function () { go(true); }, close: function () { go(false); } };
  }

  /* ------------------------------------------------ dropdown */
  function dropdown(trigger, menu) {
    var items = function () { return Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"], a, button')); };
    var open = false;
    trigger.setAttribute('aria-haspopup', 'true'); trigger.setAttribute('aria-expanded', 'false');
    menu.hidden = true;
    function set(on, focusBack) {
      if (on === open) return; open = on;
      trigger.setAttribute('aria-expanded', String(on));
      if (on) {
        menu.hidden = false;
        if (!still()) play(menu, [{ opacity: 0, transform: 'translateY(' + px(-4) + 'px) scale(.97)' }, { opacity: 1, transform: 'none' }], { duration: ms('--t-dropdown', 180) });
        var f = items()[0]; if (f) f.focus();
      } else {
        var done = function () { if (!open) menu.hidden = true; };
        if (still()) done(); else play(menu, [{ opacity: 1 }, { opacity: 0 }], { duration: ms('--t-dropdown', 180) * 0.7 }).finished.then(done, done);
        if (focusBack) trigger.focus();
      }
    }
    trigger.addEventListener('click', function () { set(!open, false); });
    menu.addEventListener('keydown', function (e) {
      var list = items(), i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
      else if (e.key === 'Escape') { e.preventDefault(); set(false, true); }
      else if (e.key === 'Tab') set(false, false);
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('[role="menuitem"], a, button')) set(false, true); });
    document.addEventListener('pointerdown', function (e) { if (open && !menu.contains(e.target) && !trigger.contains(e.target)) set(false, false); });
    return { open: function () { set(true); }, close: function () { set(false, true); } };
  }

  /* ------------------------------------------------ modal */
  function modal(dialog, opener) {
    function open() {
      dialog.showModal();
      if (!still()) play(dialog, [{ opacity: 0, transform: 'scale(' + (1 - px(.04)) + ')' }, { opacity: 1, transform: 'none' }], { duration: ms('--t-modal', 250) });
    }
    function close() {
      if (!dialog.open) return;
      var done = function () { dialog.close(); if (opener) opener.focus(); };
      if (still()) return done();
      play(dialog, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'scale(.98)' }], { duration: ms('--t-modal', 250) * 0.7 }).finished.then(done, done);
    }
    if (opener) opener.addEventListener('click', open);
    dialog.addEventListener('cancel', function (e) { e.preventDefault(); close(); });   // Escape, animated
    dialog.addEventListener('click', function (e) { if (e.target === dialog) close(); });  // the backdrop
    dialog.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', close); });
    return { open: open, close: close };
  }

  /* ------------------------------------------------ steps */
  function steps(root) {
    var panels = Array.prototype.slice.call(root.querySelectorAll('[data-step]')), at = 0;
    panels.forEach(function (p, i) { p.hidden = i !== 0; });
    function go(dir) {
      var next = at + dir; if (next < 0 || next >= panels.length) return;
      var out = panels[at], inn = panels[next]; at = next;
      out.hidden = true; inn.hidden = false;
      root.setAttribute('data-at', String(at));
      if (!still()) play(inn, [{ opacity: 0, transform: 'translateX(' + px(24) * dir + 'px)' }, { opacity: 1, transform: 'none' }], { duration: ms('--t-page', 280) });
      var h = inn.querySelector('h1, h2, h3') || inn; if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true });
    }
    root.addEventListener('click', function (e) {
      if (e.target.closest('[data-next]')) go(1);
      else if (e.target.closest('[data-back]')) go(-1);
    });
    return { next: function () { go(1); }, back: function () { go(-1); }, at: function () { return at; } };
  }

  /* ------------------------------------------------ remove with undo */
  function removeWithUndo(row, toastEl, label) {
    var list = row.parentNode, after = row.nextSibling;
    var others = Array.prototype.slice.call(list.children).filter(function (n) { return n !== row; });
    var focusNext = row.nextElementSibling || row.previousElementSibling;
    function out() {
      var before = rects(others);
      row.remove();
      flip(before, ms('--t-quick', 180));
      if (focusNext) { var f = focusNext.querySelector('button, a') || focusNext; f.focus({ preventScroll: true }); }
    }
    if (still()) out();
    else play(row, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + px(-16) + 'px)' }], { duration: ms('--t-quick', 180) }).finished.then(out, out);
    if (toastEl && window.AppMotion) AppMotion.toast(toastEl, (label || 'Removed') + '.', 'Undo', function () {
      var before = rects(others);
      list.insertBefore(row, after && after.parentNode === list ? after : null);
      flip(before, ms('--t-quick', 180));
      if (!still()) play(row, [{ opacity: 0 }, { opacity: 1 }], { duration: ms('--t-quick', 180) });
      var f = row.querySelector('button, a') || row; f.focus({ preventScroll: true });
    });
  }

  /* ------------------------------------------------ reflow */
  function reflow(list, change) {
    var kids = Array.prototype.slice.call(list.children), before = rects(kids);
    change();
    var now = Array.prototype.slice.call(list.children);
    flip(new Map(Array.from(before).filter(function (e) { return now.indexOf(e[0]) >= 0 && !e[0].hidden; })), ms('--t-page', 280));
    if (!still()) now.forEach(function (n) { if (!before.has(n) && !n.hidden) play(n, [{ opacity: 0 }, { opacity: 1 }], { duration: ms('--t-quick', 180) }); });
  }

  /* ------------------------------------------------ states */
  var live;
  function state(el, name, message) {
    el.setAttribute('data-state', name);
    el.setAttribute('aria-busy', String(name === 'loading'));
    if (!live) { live = document.createElement('div'); live.setAttribute('aria-live', 'polite'); live.className = 'ia-sr'; document.body.appendChild(live); }
    if (message) live.textContent = message;
  }

  window.Interact = { personality: personality, expand: expand, dropdown: dropdown, modal: modal, steps: steps, removeWithUndo: removeWithUndo, reflow: reflow, state: state, still: still };
})();
