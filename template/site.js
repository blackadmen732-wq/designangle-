/*
 * Design Angle site kit: behaviour and motion.
 * The HTML is already complete (build.js writes all content). This file only adds
 * the hero slider, tabs, form message and the GSAP/Lenis motion layer.
 * Motion rules live in DESIGN.md. Keep to them: one tempo, expo easing, transform/opacity only.
 */
(function () {
  'use strict';
  var root = document.documentElement;
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var G = window.gsap, ST = window.ScrollTrigger, SPLIT = window.SplitText;
  var motion = !!(G && ST) && !reduce;
  if (G && ST) G.registerPlugin(ST);
  if (G && SPLIT) G.registerPlugin(SPLIT);
  function $(id) { return document.getElementById(id); }
  function all(sel, ctx) { return Array.prototype.slice.call((ctx || document).querySelectorAll(sel)); }

  /* ---------- Hero slider ---------- */
  var stage = $('stage'), frame = $('frame'), dots = $('dots');
  var slides = all('.slide', frame), infos = all('#dishInfo > div'), thumbs = [$('thumb1'), $('thumb2')];
  var n = slides.length, active = 0, timer = null, DUR = 5200, paused = true, dotBtns = [];
  var names = infos.map(function (b) { return b.querySelector('h2').textContent; });

  slides.forEach(function (s, i) {
    var dot = document.createElement('button'); dot.type = 'button'; dot.setAttribute('aria-label', names[i]); dot.innerHTML = '<span></span>';
    dot.addEventListener('click', function () { go(i, i > active ? 1 : -1); });
    dots.appendChild(dot); dotBtns.push(dot);
  });
  thumbs.forEach(function (t, k) { t.addEventListener('click', function () { go(active + k + 1, 1); }); });

  var FULL = 'inset(0% 0% 0% 0%)';
  function slideTo(prev, dir) {
    var inn = slides[active], out = slides[prev];
    if (!motion) { slides.forEach(function (s, k) { s.classList.toggle('on', k === active); }); return; }
    G.killTweensOf(slides.concat(slides.map(function (s) { return s.firstElementChild; })));
    slides.forEach(function (s) { if (s !== inn && s !== out) { s.classList.remove('on'); G.set([s, s.firstElementChild], { clearProps: 'all' }); } });
    inn.classList.add('on'); out.classList.add('on');
    G.set(out, { zIndex: 1, clipPath: FULL }); G.set(inn, { zIndex: 2 });
    G.fromTo(inn, { clipPath: dir > 0 ? 'inset(0% 0% 0% 100%)' : 'inset(0% 100% 0% 0%)' }, {
      clipPath: FULL, duration: 1.15, ease: 'expo.inOut',
      onComplete: function () { out.classList.remove('on'); G.set([inn, out, out.firstElementChild], { clearProps: 'all' }); }
    });
    G.fromTo(inn.firstElementChild, { xPercent: dir * 24, scale: 1.28 }, { xPercent: 0, scale: 1, duration: 1.15, ease: 'expo.inOut' });
    G.to(out.firstElementChild, { xPercent: -dir * 18, duration: 1.15, ease: 'expo.inOut' });
  }
  function render(prev, dir) {
    if (prev >= 0 && prev !== active) slideTo(prev, dir);
    infos.forEach(function (b, i) {
      b.classList.toggle('on', i === active); b.classList.toggle('out', i === prev && i !== active);
      b.setAttribute('aria-hidden', i === active ? 'false' : 'true');
    });
    dotBtns.forEach(function (b, i) { b.classList.remove('run'); b.classList.toggle('on', i === active); b.setAttribute('aria-current', i === active ? 'true' : 'false'); });
    thumbs.forEach(function (t, k) {
      var show = (active + k + 1) % n;
      all('img', t).forEach(function (im, i) { im.classList.toggle('on', i === show); });
      t.setAttribute('aria-label', 'Show ' + names[show]);
    });
    stage.style.setProperty('--tint', slides[active].dataset.tint);
    schedule();
  }
  function schedule() {
    clearTimeout(timer);
    if (reduce || paused || document.hidden || n < 2) return;
    var b = dotBtns[active]; b.style.setProperty('--dur', DUR + 'ms'); void b.offsetWidth; b.classList.add('run');
    timer = setTimeout(function () { go(active + 1, 1); }, DUR);
  }
  function go(i, dir) { var prev = active; active = (i + n) % n; if (prev === active) return; render(prev, dir || 1); }
  $('next').addEventListener('click', function () { go(active + 1, 1); });
  $('prev').addEventListener('click', function () { go(active - 1, -1); });
  var hero = document.querySelector('.hero'), hovering = false;
  function hold(v) { paused = v; if (v) { clearTimeout(timer); dotBtns[active].classList.remove('run'); } else { schedule(); } }
  hero.addEventListener('mouseenter', function () { hovering = true; hold(true); });
  hero.addEventListener('mouseleave', function () { hovering = false; hold(false); });
  hero.addEventListener('focusin', function () { hold(true); });
  hero.addEventListener('focusout', function () { if (!hovering) hold(false); });
  document.addEventListener('visibilitychange', schedule);
  var sx = null;
  stage.addEventListener('touchstart', function (e) { sx = e.touches[0].clientX; }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    if (sx === null) return; var dx = e.changedTouches[0].clientX - sx; sx = null;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  }, { passive: true });
  render(-1, 1);

  /* ---------- Tabs ---------- */
  var tabBtns = all('#tabs button'), panels = all('.menu-list');
  tabBtns.forEach(function (b) {
    b.addEventListener('click', function () {
      tabBtns.forEach(function (x) { x.setAttribute('aria-selected', x === b ? 'true' : 'false'); });
      panels.forEach(function (p) { p.hidden = p.dataset.panel !== b.dataset.panel; });
      if (ST) ST.refresh();
    });
  });

  /* ---------- Header ---------- */
  var top = $('top');
  function onScroll() { top.classList.toggle('scrolled', window.scrollY > 8); }
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  /* ---------- Motion (GSAP + Lenis). Without them the page is complete and static. ---------- */
  function startAuto() { paused = hovering; schedule(); }
  if (!motion) { root.classList.remove('gs-wait'); startAuto(); }
  else {
    var EASE = 'expo.out';
    var track = $('hsTrack');
    if (window.Lenis) {
      var lenis = new window.Lenis({ autoRaf: false });
      lenis.on('scroll', ST.update);
      G.ticker.add(function (t) { lenis.raf(t * 1000); });
      G.ticker.lagSmoothing(0);
      all('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          var t = document.querySelector(a.getAttribute('href')); if (!t) return;
          e.preventDefault(); lenis.scrollTo(t, { offset: t.id === 'top' ? 0 : -70, duration: 1.4 });
        });
      });
    }

    var fonts = (document.fonts && document.fonts.ready) || Promise.resolve();
    Promise.race([fonts, new Promise(function (r) { setTimeout(r, 1200); })]).then(function () {
      /* Intro: one orchestrated load sequence */
      var tl = G.timeline({ defaults: { ease: EASE }, onComplete: startAuto });
      var lines = SPLIT ? SPLIT.create('#headline', { type: 'lines', mask: 'lines' }).lines : ['#headline'];
      tl.from('.hero .eyebrow', { y: 18, opacity: 0, duration: .8 }, 0)
        .from(lines, { yPercent: 110, duration: 1.1, stagger: .09 }, .05)
        .from(frame, { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut' }, 0)
        .from(slides[0].firstElementChild, { scale: 1.4, duration: 1.9 }, 0)
        .from('.blob', { opacity: 0, duration: 1.2 }, .5)
        .from(['#dishInfo', '.hero-cta'], { y: 28, opacity: 0, duration: .9, stagger: .1 }, .65)
        .from('.thumb', { scale: .6, opacity: 0, duration: .8, stagger: .12, ease: 'back.out(1.6)' }, 1);
      root.classList.remove('gs-wait');

      /* Masked heading reveals */
      all('[data-split]').forEach(function (h) {
        var parts = SPLIT ? SPLIT.create(h, { type: 'lines', mask: 'lines' }).lines : [h];
        G.from(parts, { yPercent: 110, duration: .9, stagger: .08, ease: EASE, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
      });
      ST.refresh();
    });

    /* Quiet reveals for supporting blocks */
    all('[data-reveal]').forEach(function (e) {
      G.from(e, { y: 34, opacity: 0, duration: .9, ease: EASE, scrollTrigger: { trigger: e, start: 'top 90%', once: true } });
    });

    /* Belt speeds up with scroll velocity */
    var beltAnim = null, boost = 0;
    try { beltAnim = $('belt').getAnimations()[0]; } catch (e) {}
    ST.create({ onUpdate: function (self) { boost = Math.min(Math.abs(self.getVelocity()) / 350, 5); } });
    if (beltAnim) G.ticker.add(function () { boost *= .93; beltAnim.playbackRate = 1 + boost; });

    /* Signature moment: pinned horizontal showcase on wide screens */
    var mm = G.matchMedia();
    mm.add('(min-width: 861px)', function () {
      var sec = track.parentNode; sec.classList.add('is-pinned');
      var dist = function () { return Math.max(0, track.scrollWidth - window.innerWidth); };
      var tween = G.to(track, {
        x: function () { return -dist(); }, ease: 'none',
        scrollTrigger: { trigger: sec, pin: true, scrub: .6, start: 'top top', end: function () { return '+=' + dist(); }, invalidateOnRefresh: true }
      });
      G.to('#hsBar', { scaleX: 1, ease: 'none', scrollTrigger: { trigger: sec, start: 'top top', end: function () { return '+=' + dist(); }, scrub: .6 } });
      all('.card', track).forEach(function (c) {
        G.fromTo(c.querySelector('img'), { xPercent: -7 }, { xPercent: 7, ease: 'none', scrollTrigger: { trigger: c, containerAnimation: tween, start: 'left right', end: 'right left', scrub: true } });
      });
      return function () { sec.classList.remove('is-pinned'); G.set(track, { clearProps: 'all' }); };
    });

    /* Story photo: clip reveal + slow parallax */
    G.from('#storyPic', { clipPath: 'inset(100% 0% 0% 0%)', duration: 1.4, ease: 'expo.inOut', scrollTrigger: { trigger: '#storyPic', start: 'top 80%', once: true } });
    G.fromTo('#storyPic img', { yPercent: -13 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: '#storyPic', start: 'top bottom', end: 'bottom top', scrub: true } });
    G.fromTo('#bandImg', { yPercent: -8 }, { yPercent: 8, ease: 'none', scrollTrigger: { trigger: '.band', start: 'top bottom', end: 'bottom top', scrub: true } });

    /* Counters (whole numbers only; anything else stays as written) */
    all('[data-count]').forEach(function (b) {
      var end = Number(b.dataset.count), suf = b.dataset.suffix || '';
      if (!isFinite(end) || Math.round(end) !== end) return;
      var o = { v: 0 };
      G.to(o, { v: end, duration: 1.6, ease: 'power3.out', snap: { v: 1 }, scrollTrigger: { trigger: b, start: 'top 92%', once: true }, onUpdate: function () { b.textContent = o.v + suf; } });
    });

    /* Footer wordmark */
    var chars = SPLIT ? SPLIT.create('#mark', { type: 'chars', mask: 'chars' }).chars : ['#mark'];
    G.from(chars, { yPercent: 105, duration: 1, stagger: .05, ease: EASE, scrollTrigger: { trigger: '#mark', start: 'top 96%', once: true } });

    window.addEventListener('load', function () { ST.refresh(); });
  }

  /* ---------- Details the owner changes in their panel ----------
     The page already contains the hours and phone built into it, so if this
     fetch fails or is slow the visitor still sees correct information. This
     only overwrites them when newer values actually arrive. */
  (function liveDetails() {
    var cfg = window.DA_TRACK;
    if (!cfg || !cfg.endpoint || !cfg.siteId) return;
    var url = cfg.endpoint.replace(/\/collect$/, '/settings') + '?siteId=' + encodeURIComponent(cfg.siteId);
    fetch(url).then(function (r) { return r.ok ? r.json() : null; }).then(function (d) {
      if (!d) return;

      if (d.phone) {
        all('[data-live="phone"]').forEach(function (a) {
          a.textContent = d.phone;
          a.setAttribute('href', 'tel:' + d.phone.replace(/[^0-9+]/g, ''));
        });
      }

      if (d.hours && d.hours.length) {
        all('[data-live="hours"]').forEach(function (t) {
          var body = t.tBodies[0] || t;
          body.textContent = '';
          d.hours.forEach(function (row) {
            var tr = body.insertRow();
            tr.insertCell().textContent = row[0];
            tr.insertCell().textContent = row[1];
          });
        });
      }

      if (d.notice) {
        var bar = $('noticeBar');
        bar.querySelector('span').textContent = d.notice;
        bar.hidden = false;
        if (window.ScrollTrigger) window.ScrollTrigger.refresh();
      }
    }).catch(function () { /* the built-in details stand */ });
  })();

  /* ---------- Request form. It only shows a message; connect it to a real service before launch. ---------- */
  var form = $('reqForm'), msg = $('bk-msg'), date = $('bk-date');
  var now = new Date(), iso = new Date(now.getTime() - now.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
  date.min = iso; if (!date.value) date.value = iso;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var name = $('bk-name').value.trim();
    msg.hidden = false; msg.textContent = '';
    if (!name || !date.value) {
      msg.className = 'msg err';
      msg.textContent = !name ? form.dataset.nameError : form.dataset.dateError;
      (name ? date : $('bk-name')).focus(); return;
    }
    var nice = new Date(date.value + 'T12:00').toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' });
    var text = form.dataset.confirm
      .replace('{choice}', $('bk-choice').value).replace('{date}', nice)
      .replace('{time}', $('bk-time').value).replace('{name}', name);
    msg.className = 'msg';
    var b = document.createElement('b'); b.textContent = text; msg.appendChild(b);
    if (form.dataset.note) msg.appendChild(document.createTextNode(' ' + form.dataset.note));

    // Send the enquiry to the owner's panel. Unlike the anonymous counts in
    // track.js this carries the person's own details, so it is only ever sent
    // because they filled the form in and pressed the button.
    var cfg = window.DA_TRACK;
    if (cfg && cfg.endpoint && cfg.siteId) {
      try {
        fetch(cfg.endpoint, {
          method: 'POST', keepalive: true, headers: { 'Content-Type': 'text/plain;charset=UTF-8' },
          body: JSON.stringify({
            siteId: cfg.siteId, kind: 'lead', name: name,
            requested: $('bk-choice').value,
            preferred: nice + ', ' + $('bk-time').value
          })
        }).catch(function () {});
      } catch (e) { /* the confirmation above still stands */ }
    }
  });
})();
