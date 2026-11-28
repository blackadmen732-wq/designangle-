/*
 * Desktop icons: one stroke family, drawn on a 24 grid at 1.6 weight, put
 * (names: home plus layers film folder users user-plus settings search bell
 * chev-down chev-right arrow-right user lock eye clock history cube bolt
 * sparkle record import grid list diamond activity minus plus-plain play
 * check receipt dollar send calendar alert download filter trend-up square
 * close truck map-pin box flower bag cart; brands: google discord github) and
 * into the page as an SVG sprite so a screen opened from disk still shows
 * them. Use: <svg class="i"><use href="#i-home"/></svg>
 *
 * The three brand marks (Google, Discord, GitHub) are filled, in their own
 * colours, because a sign-in button with a grey Google "G" reads as fake.
 */
(function () {
  var S = 'fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"';
  var icons = {
    home: '<path d="M3.5 10.5 12 3.8l8.5 6.7"/><path d="M5.5 9v10.2h4.6v-6h3.8v6h4.6V9"/>',
    plus: '<rect x="3.5" y="3.5" width="17" height="17" rx="3"/><path d="M12 8v8M8 12h8"/>',
    layers: '<path d="m12 3.5 8.5 4.3L12 12 3.5 7.8 12 3.5Z"/><path d="m3.5 12 8.5 4.3 8.5-4.3"/><path d="m3.5 16.2 8.5 4.3 8.5-4.3"/>',
    film: '<rect x="3.5" y="5" width="17" height="14" rx="2"/><path d="M3.5 9h17M8 5l-2 4M13 5l-2 4M18 5l-2 4"/>',
    folder: '<path d="M3.5 7.5a2 2 0 0 1 2-2h4l2 2.3h7a2 2 0 0 1 2 2v7.7a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2Z"/><path d="M3.5 10h17"/>',
    users: '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5"/><circle cx="16.6" cy="9.2" r="2.6"/><path d="M16.2 14.1c2.4.1 4 1.6 4.4 4.4"/>',
    'user-plus': '<circle cx="9" cy="8.5" r="3.2"/><path d="M3.5 19c.6-3.3 2.8-5 5.5-5s4.9 1.7 5.5 5"/><path d="M18 8v6M15 11h6"/>',
    settings: '<circle cx="12" cy="12" r="3"/><path d="M12 2.8v2.4M12 18.8v2.4M21.2 12h-2.4M5.2 12H2.8M18.5 5.5l-1.7 1.7M7.2 16.8l-1.7 1.7M18.5 18.5l-1.7-1.7M7.2 7.2 5.5 5.5"/><circle cx="12" cy="12" r="6.6"/>',
    search: '<circle cx="10.8" cy="10.8" r="6.3"/><path d="m15.5 15.5 4.8 4.8"/>',
    bell: '<path d="M6.5 16.5V11a5.5 5.5 0 0 1 11 0v5.5l1.5 2h-14Z"/><path d="M10 20.5a2 2 0 0 0 4 0"/>',
    'chev-down': '<path d="m6.5 9.5 5.5 5.5 5.5-5.5"/>',
    'chev-right': '<path d="m9.5 6 6 6-6 6"/>',
    'arrow-right': '<path d="M4.5 12h15M14 6.5l5.5 5.5-5.5 5.5"/>',
    user: '<circle cx="12" cy="8.3" r="3.8"/><path d="M4.8 20c.8-3.9 3.6-6 7.2-6s6.4 2.1 7.2 6Z"/>',
    lock: '<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/><path d="M12 14.6v2"/>',
    eye: '<path d="M2.8 12S6.2 5.8 12 5.8 21.2 12 21.2 12 17.8 18.2 12 18.2 2.8 12 2.8 12Z"/><circle cx="12" cy="12" r="3"/>',
    clock: '<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>',
    history: '<path d="M3.8 12a8.2 8.2 0 1 0 2.4-5.8L3.8 8.5"/><path d="M3.8 4.5v4h4M12 8v4l2.8 1.8"/>',
    cube: '<path d="m12 3 8 4.5v9L12 21l-8-4.5v-9Z"/><path d="m4 7.5 8 4.5 8-4.5M12 12v9"/>',
    bolt: '<path d="M13 2.8 5.5 13.2h6l-1 8 7.9-10.5h-6Z"/>',
    sparkle: '<path d="M12 3.5c.6 4.4 2.1 5.9 6.5 6.5-4.4.6-5.9 2.1-6.5 6.5-.6-4.4-2.1-5.9-6.5-6.5 4.4-.6 5.9-2.1 6.5-6.5Z"/><path d="M18.5 15.5c.2 1.5.7 2 2.2 2.2-1.5.2-2 .7-2.2 2.2-.2-1.5-.7-2-2.2-2.2 1.5-.2 2-.7 2.2-2.2Z"/>',
    record: '<circle cx="12" cy="12" r="8.5"/><circle cx="12" cy="12" r="3.6" fill="currentColor"/>',
    import: '<path d="M12 3.5v10.5M7.8 10l4.2 4.2 4.2-4.2"/><path d="M4.5 14.5v3.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-3.5"/>',
    grid: '<rect x="4" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5"/>',
    list: '<path d="M9 6.5h11M9 12h11M9 17.5h11"/><circle cx="5" cy="6.5" r=".9" fill="currentColor"/><circle cx="5" cy="12" r=".9" fill="currentColor"/><circle cx="5" cy="17.5" r=".9" fill="currentColor"/>',
    diamond: '<path d="M6.5 4.5h11l3.3 4.3L12 20 3.2 8.8Z"/><path d="M3.2 8.8h17.6M9.3 4.5 8 8.8l4 11.2 4-11.2-1.3-4.3"/>',
    activity: '<path d="M2.8 12.5h4l2.5-6 4.3 12 2.6-6h5"/>',
    minus: '<path d="M5 12h14"/>',
    'plus-plain': '<path d="M12 5v14M5 12h14"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    receipt: '<path d="M6 3.5h12v17l-2.4-1.6-2.4 1.6-2.4-1.6-2.4 1.6L6 20.5Z"/><path d="M9 8h6M9 11.5h6M9 15h3.5"/>',
    dollar: '<path d="M12 3.5v17M16.5 7.5c-.6-1.6-2.3-2.5-4.5-2.5-2.6 0-4.5 1.3-4.5 3.4 0 4.7 9.5 2.4 9.5 7.2 0 2-1.9 3.4-4.8 3.4-2.4 0-4.2-1-4.8-2.8"/>',
    send: '<path d="M20.5 3.5 10 14M20.5 3.5l-6.5 17-4-6.5-6.5-4Z"/>',
    truck: '<path d="M2.5 6.5h11v10h-11Z"/><path d="M13.5 10h4l3 3.2v3.3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>',
    'map-pin': '<path d="M12 21s-6.5-6-6.5-11a6.5 6.5 0 0 1 13 0c0 5-6.5 11-6.5 11Z"/><circle cx="12" cy="10" r="2.4"/>',
    box: '<path d="m12 3 8 4v10l-8 4-8-4V7Z"/><path d="m4 7 8 4 8-4M12 11v10"/>',
    flower: '<circle cx="12" cy="9" r="2"/><path d="M12 7c-1.8-3.2 1.8-3.2 0 0M14 9c3.2-1.8 3.2 1.8 0 0M12 11c1.8 3.2-1.8 3.2 0 0M10 9c-3.2 1.8-3.2-1.8 0 0"/><path d="M12 12.5V21M12 17c-2.5-.2-4-1.6-4.5-3.5 2.4 0 4 1.2 4.5 3.5ZM12 18.5c2.3-.3 3.8-1.6 4.3-3.6-2.3 0-3.9 1.2-4.3 3.6Z"/>',
    bag: '<path d="M5 8h14l-1 12.5H6Z"/><path d="M9 8V6.5a3 3 0 0 1 6 0V8"/>',
    cart: '<path d="M3 4h2.5l2.2 11h10.8l2-8H6.6"/><circle cx="9" cy="19" r="1.5"/><circle cx="17" cy="19" r="1.5"/>',
    calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    alert: '<path d="M12 3.8 21 19.5H3Z"/><path d="M12 10v4.2M12 17v.2"/>',
    download: '<path d="M12 3.5v11M7.5 10l4.5 4.5 4.5-4.5M4.5 19.5h15"/>',
    filter: '<path d="M4 5.5h16l-6.2 7.2v5.6l-3.6 1.8v-7.4Z"/>',
    'trend-up': '<path d="m3.5 16.5 6-6 4 4 7-7M15 7.5h5.5V13"/>',
    play: '<path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.6-6.8a.8.8 0 0 0 0-1.4L9.2 4.5A.8.8 0 0 0 8 5.2Z" fill="currentColor" stroke="none"/>',
    square: '<rect x="5.5" y="5.5" width="13" height="13" rx="1"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>'
  };
  var filled = {
    google: '<path fill="#4285F4" d="M21.6 12.2c0-.7-.1-1.4-.2-2H12v3.8h5.4a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 3-4.3 3-7.3Z"/><path fill="#34A853" d="M12 22c2.7 0 5-.9 6.6-2.5l-3.2-2.5c-.9.6-2 1-3.4 1-2.6 0-4.8-1.8-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.4 13.9a6 6 0 0 1 0-3.8V7.5H3.1a10 10 0 0 0 0 9Z"/><path fill="#EA4335" d="M12 6c1.5 0 2.8.5 3.8 1.5l2.9-2.9A10 10 0 0 0 3.1 7.5l3.3 2.6C7.2 7.8 9.4 6 12 6Z"/>',
    discord: '<path fill="#6F7BF7" d="M19.3 5.4A16.6 16.6 0 0 0 15.2 4l-.5 1a15.3 15.3 0 0 0-5.4 0l-.5-1a16.5 16.5 0 0 0-4.1 1.4C2 9.3 1.3 13.2 1.6 17a16.7 16.7 0 0 0 5 2.6l1.1-1.7c-.6-.2-1.2-.5-1.7-.9l.4-.3a11.9 11.9 0 0 0 11.2 0l.4.3c-.5.4-1.1.7-1.7.9l1.1 1.7a16.6 16.6 0 0 0 5-2.6c.4-4.4-.7-8.2-3.1-11.6ZM8.5 14.6c-1 0-1.8-.9-1.8-2.1s.8-2.1 1.8-2.1 1.8 1 1.8 2.1-.8 2.1-1.8 2.1Zm7 0c-1 0-1.8-.9-1.8-2.1s.8-2.1 1.8-2.1 1.8 1 1.8 2.1-.8 2.1-1.8 2.1Z"/>',
    github: '<path fill="#fff" d="M12 2.2a10 10 0 0 0-3.2 19.5c.5.1.7-.2.7-.5v-1.8c-2.8.6-3.4-1.2-3.4-1.2-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.4 1.1 2.9.8.1-.7.4-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.7 0 0 .8-.3 2.8 1a9.6 9.6 0 0 1 5 0c1.9-1.3 2.8-1 2.8-1 .5 1.4.2 2.4.1 2.7.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .4.3.7.9.7 1.9v2.8c0 .3.2.6.7.5A10 10 0 0 0 12 2.2Z"/>'
  };
  var out = '<svg xmlns="http://www.w3.org/2000/svg" style="display:none" aria-hidden="true">';
  for (var k in icons) out += '<symbol id="i-' + k + '" viewBox="0 0 24 24" ' + S + '>' + icons[k] + '</symbol>';
  for (var f in filled) out += '<symbol id="i-' + f + '" viewBox="0 0 24 24">' + filled[f] + '</symbol>';
  out += '</svg>';
  document.body.insertAdjacentHTML('afterbegin', out);
})();
