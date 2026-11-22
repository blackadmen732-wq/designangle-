/*
 * Design Angle: what the website reports to the owner's panel.
 *
 * No cookies, no fingerprinting, no personal data. A visitor is a random id
 * that is regenerated every day, so this cannot follow anyone between days
 * or between sites. If no endpoint is configured, this file does nothing.
 *
 * It records: page views, taps on a phone number, form submissions, and
 * clicks on an outside booking link.
 *
 * A tap on a phone button is NOT a completed phone call. It is reported as
 * "call_tap" and the panel must label it that way. Real call counts need a
 * tracking number.
 */
(function () {
  'use strict';
  var cfg = window.DA_TRACK;
  if (!cfg || !cfg.endpoint || !cfg.siteId) return;
  if (navigator.doNotTrack === '1' || window.doNotTrack === '1') return;

  function visitorId() {
    var today = new Date().toISOString().slice(0, 10);
    try {
      var saved = JSON.parse(sessionStorage.getItem('da_v') || '{}');
      if (saved.day === today && saved.id) return saved.id;
      var id = (crypto.randomUUID ? crypto.randomUUID() : String(Math.random())).slice(0, 12);
      sessionStorage.setItem('da_v', JSON.stringify({ day: today, id: id }));
      return id;
    } catch (e) { return 'anon'; }
  }

  var visitor = visitorId();
  var device = window.matchMedia('(max-width: 860px)').matches ? 'phone' : 'desktop';

  function send(kind, meta) {
    var body = JSON.stringify({
      siteId: cfg.siteId, kind: kind, path: location.pathname,
      referrer: document.referrer ? new URL(document.referrer).hostname : '',
      device: device, visitor: visitor, meta: meta || {}
    });
    // text/plain is a CORS-safelisted content type, so the browser sends the
    // POST straight away. With application/json it sends a preflight first and
    // then silently drops the beacon, which loses taps on outbound links.
    // The collector reads the body as text and parses it, so this changes
    // nothing on the server.
    try {
      if (navigator.sendBeacon) navigator.sendBeacon(cfg.endpoint, new Blob([body], { type: 'text/plain;charset=UTF-8' }));
      else fetch(cfg.endpoint, { method: 'POST', body: body, headers: { 'Content-Type': 'text/plain;charset=UTF-8' }, keepalive: true });
    } catch (e) { /* never let reporting break the page */ }
  }

  send('view');

  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a');
    if (!a) return;
    var href = a.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0) send('call_tap', { number: href.slice(4) });
    else if (/^https?:/.test(href)) send('book_click', { host: new URL(href, location.href).hostname });
  }, { passive: true, capture: true });

  var form = document.getElementById('reqForm');
  if (form) form.addEventListener('submit', function () {
    var choice = document.getElementById('bk-choice');
    send('form_submit', { requested: choice ? choice.value : '' });
  });
})();
