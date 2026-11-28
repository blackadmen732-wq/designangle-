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

   Reuse first: the browser and two small MIT libraries do the heavy work.
   This file only joins them up and adds the personality.
     native View Transitions   expand and return
     native popover + <dialog> dropdown and modal: top layer, Escape, light dismiss
     Floating UI (vendor/)     where the dropdown sits, flipping at the edges
     AutoAnimate (vendor/)     lists: remove, undo, filter, sort
   Load vendor/floating-ui.core.umd.min.js, vendor/floating-ui.dom.umd.min.js
   and vendor/auto-animate.js before this file when you use dropdown or lists.

   expand(card, detail, opts)   a product opens into its detail from where
                                it was (View Transitions; where a browser has
                                none it changes at once); close() returns it,
                                focus and scroll restored
   dropdown(trigger, menu)      a popover placed by Floating UI; arrows move,
                                Escape and a click outside close it (native);
                                focus returns to the trigger
   modal(dialog, opener)        a <dialog> scales up a touch and fades;
                                Escape and the backdrop close it, animated
   steps(root)                  next goes left, back goes right; focus moves
                                to the new step's heading
   removeWithUndo(row, toast)   the row leaves, the rest close the gap, and
                                Undo puts it back where it was (AutoAnimate)
   reflow(list, change)         filter or sort: items move to their new
                                places instead of jumping (AutoAnimate). Add
                                and remove the children; hiding them is not
                                seen
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
    if (name) { root.dataset.motion = name; root.style.setProperty('--ia-k', P().k); root.style.setProperty('--ia-travel', P().travel); }
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
  /* Lists: AutoAnimate does the FLIP. The plugin keeps it to transform and
     opacity on the personality's timing; a plugin skips AutoAnimate's own
     reduced-motion check, so that is made here (see docs/research/motion-sources.md). */
  function lists(list) {
    if (list._ia_aa || still()) return;
    if (!window.autoAnimate) throw new Error('Interact lists need vendor/auto-animate.js loaded first');
    var d = ms('--t-quick', 180), o = { easing: P().ease };
    list._ia_aa = autoAnimate(list, function (el, action, from, to) {
      if (action === 'add') return new KeyframeEffect(el, [{ opacity: 0, transform: 'scale(.98)' }, { opacity: 1, transform: 'none' }], Object.assign({ duration: d * 1.2 }, o));
      if (action === 'remove') return new KeyframeEffect(el, [{ opacity: 1, transform: 'none' }, { opacity: 0, transform: 'translateX(' + px(-16) + 'px)' }], Object.assign({ duration: d }, o));
      var dx = from.left - to.left, dy = from.top - to.top;
      if (el === list || (!dx && !dy)) return new KeyframeEffect(el, [], { duration: 0 });
      return new KeyframeEffect(el, [{ transform: 'translate(' + dx + 'px,' + dy + 'px)' }, { transform: 'none' }], Object.assign({ duration: ms('--t-page', 280) }, o));
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
    function go(open) {
      if (busy && busy.skipTransition) busy.skipTransition();
      var after = function () {
        busy = null;
        if (open) { var h = detail.querySelector('h1, h2, [data-focus]') || detail; if (!h.hasAttribute('tabindex')) h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
        else { window.scrollTo(0, scrollY); card.focus({ preventScroll: true }); }
      };
      if (open) scrollY = window.scrollY;
      if (still()) { show(open); after(); return; }
      if (!document.startViewTransition) { show(open); after(); return; }
      busy = vt(open, after);
    }
    card.addEventListener('click', function (e) { e.preventDefault(); go(true); });
    detail.querySelectorAll('[data-close]').forEach(function (b) { b.addEventListener('click', function () { go(false); }); });
    detail.addEventListener('keydown', function (e) { if (e.key === 'Escape') go(false); });
    return { open: function () { go(true); }, close: function () { go(false); } };
  }

  /* ------------------------------------------------ dropdown */
  var popCss = false;
  function dropdown(trigger, menu) {
    var F = window.FloatingUIDOM;
    if (!F) throw new Error('Interact.dropdown needs vendor/floating-ui.core.umd.min.js and floating-ui.dom.umd.min.js loaded first');
    if (!popCss) {   // the enter and exit motion is CSS, so a second press retargets it
      popCss = true;
      var st = document.createElement('style');
      st.textContent = '[data-ia-pop]{position:fixed;inset:auto;margin:0;transform-origin:var(--ia-origin,top left);' +
        'transition:opacity calc(var(--t-dropdown,180ms)*var(--ia-k,1.15)) var(--ease-out,ease-out),transform calc(var(--t-dropdown,180ms)*var(--ia-k,1.15)) var(--ease-out,ease-out),display calc(var(--t-dropdown,180ms)*var(--ia-k,1.15)) allow-discrete,overlay calc(var(--t-dropdown,180ms)*var(--ia-k,1.15)) allow-discrete}' +
        '[data-ia-pop]:not(:popover-open){opacity:0;transform:translateY(calc(-4px*var(--ia-travel,.75))) scale(.97)}' +
        '@starting-style{[data-ia-pop]:popover-open{opacity:0;transform:translateY(calc(-4px*var(--ia-travel,.75))) scale(.97)}}' +
        '[data-motion="lively"] [data-ia-pop]:popover-open{transition-timing-function:var(--spring-sheet,ease-out)}' +
        '@media (prefers-reduced-motion:reduce){[data-ia-pop]{transition:opacity 120ms ease-out}[data-ia-pop]:not(:popover-open),[data-ia-pop]:popover-open{transform:none}}';
      document.head.appendChild(st);
    }
    var items = function () { return Array.prototype.slice.call(menu.querySelectorAll('[role="menuitem"], a, button')); };
    if (!menu.id) menu.id = 'ia-menu-' + Math.random().toString(36).slice(2, 8);
    menu.hidden = false; menu.setAttribute('popover', 'auto'); menu.setAttribute('data-ia-pop', '');
    trigger.setAttribute('popovertarget', menu.id);
    trigger.setAttribute('aria-haspopup', 'true'); trigger.setAttribute('aria-expanded', 'false');
    var stop = null;
    function place() {
      F.computePosition(trigger, menu, { placement: 'bottom-start', strategy: 'fixed', middleware: [F.offset(6), F.flip(), F.shift({ padding: 8 })] })
        .then(function (r) { menu.style.left = r.x + 'px'; menu.style.top = r.y + 'px'; menu.style.setProperty('--ia-origin', r.placement.indexOf('top') === 0 ? 'bottom left' : 'top left'); });
    }
    menu.addEventListener('toggle', function (e) {
      var on = e.newState === 'open';
      trigger.setAttribute('aria-expanded', String(on));
      if (on) { stop = F.autoUpdate(trigger, menu, place); var f = items()[0]; if (f) f.focus(); }
      else if (stop) { stop(); stop = null; }
    });
    menu.addEventListener('keydown', function (e) {
      var list = items(), i = list.indexOf(document.activeElement);
      if (e.key === 'ArrowDown') { e.preventDefault(); list[(i + 1) % list.length].focus(); }
      else if (e.key === 'ArrowUp') { e.preventDefault(); list[(i - 1 + list.length) % list.length].focus(); }
      else if (e.key === 'Tab') menu.hidePopover();
    });
    menu.addEventListener('click', function (e) { if (e.target.closest('[role="menuitem"], a, button')) { menu.hidePopover(); trigger.focus(); } });
    return { open: function () { menu.showPopover(); }, close: function () { menu.hidePopover(); trigger.focus(); } };
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
    var list = row.parentNode, after = row.nextElementSibling;
    var focusNext = row.nextElementSibling || row.previousElementSibling;
    lists(list);
    row.remove();
    if (focusNext) { var f = focusNext.querySelector('button, a') || focusNext; f.focus({ preventScroll: true }); }
    if (toastEl && window.AppMotion) AppMotion.toast(toastEl, (label || 'Removed') + '.', 'Undo', function () {
      list.insertBefore(row, after && after.parentNode === list ? after : null);
      var g = row.querySelector('button, a') || row; g.focus({ preventScroll: true });
    });
  }

  /* ------------------------------------------------ reflow */
  function reflow(list, change) { lists(list); change(); }

  /* ------------------------------------------------ states */
  var live;
  function state(el, name, message) {
    el.setAttribute('data-state', name);
    el.setAttribute('aria-busy', String(name === 'loading'));
    if (!live) { live = document.createElement('div'); live.setAttribute('aria-live', 'polite'); live.className = 'ia-sr'; document.body.appendChild(live); }
    if (message) live.textContent = message;
  }

  window.Interact = { personality: personality, expand: expand, dropdown: dropdown, modal: modal, steps: steps, removeWithUndo: removeWithUndo, reflow: reflow, lists: lists, state: state, still: still };
})();
