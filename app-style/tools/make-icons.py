# Generates app-style/app-icons.css: one class per icon, drawn with a CSS mask so the
# icon takes the colour of the text around it (background: currentColor).
#
#   python3 app-style/tools/make-icons.py
#
# To add an icon, add its SVG body below on a 24x24 grid, then run this again.
# Keep the house style: 1.8 stroke, round ends and joins, nothing filled unless
# the reference fills it. They should read as SF Symbols at regular weight.
import os, urllib.parse
S = 'fill="none" stroke="black" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"'
F = 'fill="black"'
icons = {
 'close':   f'<path {S} d="M6 6l12 12M18 6 6 18"/>',
 'mute':    f'<path {S} d="M4 9.5h3.2L12 5.5v13l-4.8-4H4z"/><path {S} d="m16 9.5 5 5m0-5-5 5"/>',
 'send':    f'<path {S} d="M21 3 10.5 13.5M21 3l-6.5 18-4-7.5L3 9.5z"/>',
 'download':f'<path {S} d="M12 4v11m0 0 4.5-4.5M12 15l-4.5-4.5M4.5 15.5v2.8c0 .9.7 1.7 1.7 1.7h11.6c.9 0 1.7-.8 1.7-1.7v-2.8"/>',
 'plus':    f'<path {S} d="M12 4.5v15M4.5 12h15"/>',
 'play':    f'<path {S} d="M7.5 4.8v14.4c0 .5.5.8 1 .6l11.2-7.2c.4-.3.4-.9 0-1.2L8.5 4.2c-.5-.3-1 0-1 .6z"/>',
 'chev-up': f'<path {S} d="m6 15 6-6 6 6"/>',
 'chev-down':f'<path {S} d="m6 9 6 6 6-6"/>',
 'chev-right':f'<path {S} d="m9 5.5 6.5 6.5L9 18.5"/>',
 'cc':      f'<rect {S} x="3" y="5.5" width="18" height="13" rx="2.5"/><path {S} d="M10.2 10.3a2.2 2.2 0 1 0 0 3.4M16.4 10.3a2.2 2.2 0 1 0 0 3.4"/>',
 'bars':    f'<path fill="black" d="M5 20V12.5h3V20zm5.5 0V7h3v13zM16 20v-9h3v9z"/>',
 'search':  f'<circle {S} cx="10.8" cy="10.8" r="6.3"/><path {S} d="m15.5 15.5 4.5 4.5"/>',
 'bell':    f'<path {S} d="M6 16.5V11a6 6 0 1 1 12 0v5.5l1.5 2h-15zM10 20.5a2 2 0 0 0 4 0"/>',
 'sliders': f'<path {S} d="M4 8h9m4 0h3M4 16h3m4 0h9"/><circle {S} cx="15" cy="8" r="2"/><circle {S} cx="9" cy="16" r="2"/>',
 'car':     f'<path {S} d="M5 16.5V12l1.8-4.6A2 2 0 0 1 8.7 6h6.6a2 2 0 0 1 1.9 1.4L19 12v4.5M3.8 12h16.4M5 16.5h14v1.5a1 1 0 0 1-1 1h-1.5a1 1 0 0 1-1-1v-1.5M8.5 16.5V18a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-1.5"/>',
 'basket':  f'<path {S} d="M4 10h16l-1.6 8.3a1.6 1.6 0 0 1-1.6 1.2H7.2a1.6 1.6 0 0 1-1.6-1.2zM8 10l3-5.5M16 10l-3-5.5M9.5 13.5v3M14.5 13.5v3"/>',
 'store':   f'<path {S} d="M4.5 9.5v9.5h15V9.5M3.5 9.5l1.6-4.5h13.8l1.6 4.5zM9.5 19v-4.5h5V19M3.5 9.5a2.8 2.8 0 0 0 5.5 0 2.8 2.8 0 0 0 5.6 0 2.8 2.8 0 0 0 5.5 0"/>',
 'bag':     f'<path fill="black" d="M5 8.5h14l-.9 11a1.5 1.5 0 0 1-1.5 1.4H7.4A1.5 1.5 0 0 1 5.9 19.5z"/><path {S} d="M9 8.5V7a3 3 0 0 1 6 0v1.5"/>',
 'fork':    f'<path {S} d="M7 3.5v6.2a2 2 0 0 0 4 0V3.5M9 3.5V21M17 21V3.5c-2.2 1.1-3.3 3.7-3.3 6.8V13H17"/>',
 'compass': f'<circle {S} cx="12" cy="12" r="8.5"/><path {S} d="m15.3 8.7-2 4.6-4.6 2 2-4.6z"/>',
 'pizza':   f'<path {S} d="M3.5 6.5C9 2.6 15 2.6 20.5 6.5L12 21z"/><path {S} d="M5.6 9.8c4.2-2.4 8.6-2.4 12.8 0"/><circle fill="black" cx="10.2" cy="12.4" r="1.2"/><circle fill="black" cx="13.6" cy="15.3" r="1.1"/>',
 'icecream':f'<path {S} d="M7.5 11a4.5 4.5 0 1 1 9 0zM8 11l4 10 4-10"/>',
 'takeout': f'<path {S} d="M4.5 9.5h15l-2 10h-11zM8 9.5 10 4.5h4l2 5"/>',
 'crown':   f'<path {S} d="M4 17.5 3 8l5 4 4-6 4 6 5-4-1 9.5z"/>',
 'walk':    f'<circle {S} cx="13.5" cy="4.8" r="1.6"/><path {S} d="m9 21 2.2-6.2L14 17v4M8.2 12.5l1.3-4.2 3.8-.6 2 3.3 2.7 1.1M11.2 14.8l1.6-4.8"/>',
 'tag':     f'<path {S} d="M3.5 12.6V5a1.5 1.5 0 0 1 1.5-1.5h7.6l8 8a1.5 1.5 0 0 1 0 2.1l-7 7a1.5 1.5 0 0 1-2.1 0z"/><circle fill="black" cx="8" cy="8" r="1.4"/>',
 'timer':   f'<circle {S} cx="12" cy="13.2" r="7.3"/><path {S} d="M12 9.3v4l2.3 1.5M9.5 2.8h5"/>',
 'arrow-right':f'<path {S} d="M4.5 12h15m0 0-6-6m6 6-6 6"/>',
 'arrow-left':f'<path {S} d="M19.5 12h-15m0 0 6-6m-6 6 6 6"/>',
 'heart':   f'<path {S} d="M12 19.5s-7.5-4.4-7.5-10A4.2 4.2 0 0 1 12 7a4.2 4.2 0 0 1 7.5 2.5c0 5.6-7.5 10-7.5 10z"/>',
 'heart-fill':f'<path fill="black" d="M12 20.3s-8.3-4.8-8.3-11A4.8 4.8 0 0 1 12 6.4a4.8 4.8 0 0 1 8.3 2.9c0 6.2-8.3 11-8.3 11z"/>',
 'home':    f'<path {S} d="M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1h-4.5v-5.5h-5V20H5a1 1 0 0 1-1-1z"/>',
 'globe':   f'<circle {S} cx="12" cy="12" r="8.5"/><path {S} d="M3.5 12h17M12 3.5c2.4 2.4 3.4 5.3 3.4 8.5s-1 6.1-3.4 8.5c-2.4-2.4-3.4-5.3-3.4-8.5S9.6 5.9 12 3.5z"/>',
 'cart':    f'<path {S} d="M3 4.5h2.3l2.2 11h10.3l2-7.8H6.4"/><circle {S} cx="9" cy="19.2" r="1.3"/><circle {S} cx="16.3" cy="19.2" r="1.3"/>',
 'user':    f'<circle {S} cx="12" cy="12" r="8.5"/><circle {S} cx="12" cy="10" r="2.9"/><path {S} d="M6.6 18.2c1.2-2.2 3.2-3.3 5.4-3.3s4.2 1.1 5.4 3.3"/>',
 'qr':      f'<path {S} d="M4.5 4.5h5v5h-5zM14.5 4.5h5v5h-5zM4.5 14.5h5v5h-5zM14.5 14.5h2v2h-2zM18 18h1.5v1.5H18zM14.5 18.5v1M18.5 14.5h1"/>',
 'cup':     f'<path {S} d="M5 9h11.5v5.5A4.5 4.5 0 0 1 12 19H9.5A4.5 4.5 0 0 1 5 14.5zM16.5 10.5h1.2a2.3 2.3 0 0 1 0 4.6h-1.5M9 3.5v2.5M12 3.5v2.5"/>',
 'gift':    f'<path {S} d="M4.5 11h15v8.5h-15zM3.5 7.5h17V11h-17zM12 7.5v12M12 7.5C10.5 4 7 4 7.2 6s3 1.5 4.8 1.5zM12 7.5c1.5-3.5 5-3.5 4.8-1.5s-3 1.5-4.8 1.5z"/>',
 'star':    '<path fill="black" d="M12 3.2l2.6 5.5 6 .7-4.4 4.1 1.2 5.9L12 16.4l-5.4 3 1.2-5.9L3.4 9.4l6-.7z"/>',
 'star-half':'<path fill="black" d="M12 3.2v13.2l-5.4 3 1.2-5.9L3.4 9.4l6-.7z"/><path fill="none" stroke="black" stroke-width="1.4" d="M12 3.2l2.6 5.5 6 .7-4.4 4.1 1.2 5.9L12 16.4"/>',
 'cube':    f'<path {S} d="m12 3.5 7.5 4.2v8.6L12 20.5l-7.5-4.2V7.7zM12 12l7.5-4.3M12 12 4.5 7.7M12 12v8.5"/>',
 'accessible':f'<circle fill="black" cx="12" cy="4.5" r="1.8"/><path {S} d="M10.5 8.5v5h5l2 5M10.5 10.5h4.5M8.3 11.6a5 5 0 1 0 7.4 5.6"/>',
 'contacts':f'<rect {S} x="5.5" y="3.5" width="13" height="17" rx="1.5"/><circle {S} cx="12" cy="10.2" r="2.3"/><path {S} d="M8.6 16.3c.7-1.6 2-2.4 3.4-2.4s2.7.8 3.4 2.4M3.8 7.5h3.4M3.8 12h3.4M3.8 16.5h3.4"/>',
 'bookmark':f'<path {S} d="M6.5 4.5c0-.6.4-1 1-1h9c.6 0 1 .4 1 1V20L12 16.2 6.5 20z"/>',
 'share':   f'<path {S} d="M12 14V3.8m0 0L8.3 7.5M12 3.8l3.7 3.7M8 10.5H6.5c-.6 0-1 .4-1 1V19c0 .6.4 1 1 1h11c.6 0 1-.4 1-1v-7.5c0-.6-.4-1-1-1H16"/>',
 'info':    f'<circle {S} cx="12" cy="12" r="8.5"/><path {S} d="M12 11v5"/><circle fill="black" cx="12" cy="8" r="1.1"/>',
 'ticket':  '<path fill="black" d="M3.5 7.5c0-.8.7-1.5 1.5-1.5h14c.8 0 1.5.7 1.5 1.5V10a2 2 0 0 0 0 4v2.5c0 .8-.7 1.5-1.5 1.5H5c-.8 0-1.5-.7-1.5-1.5V14a2 2 0 0 0 0-4z"/>',
 'directions':'<path fill="black" fill-rule="evenodd" d="M10.6 2.6a2 2 0 0 1 2.8 0l8 8a2 2 0 0 1 0 2.8l-8 8a2 2 0 0 1-2.8 0l-8-8a2 2 0 0 1 0-2.8zM8 15.5h2v-3.2h4.2V15l3.5-3.6-3.5-3.5V10.5H9.2A1.2 1.2 0 0 0 8 11.7z"/>',
 'more':    '<circle fill="black" cx="6" cy="12" r="1.6"/><circle fill="black" cx="12" cy="12" r="1.6"/><circle fill="black" cx="18" cy="12" r="1.6"/>',
 'bed':     f'<path {S} d="M3.5 18.5v-12M3.5 15h17v3.5M20.5 15v-3a2 2 0 0 0-2-2H11v5M6.5 12.3a1.6 1.6 0 1 0 3.2 0 1.6 1.6 0 0 0-3.2 0"/>',
 'shower':  f'<path {S} d="M5 20 14.5 10.5M14.5 10.5a4 4 0 0 0-5.7 0l5.7 5.7a4 4 0 0 0 0-5.7zM18.5 6.5l1.5-1.5"/><circle fill="black" cx="8.5" cy="17" r=".8"/><circle fill="black" cx="10.5" cy="19.5" r=".8"/><circle fill="black" cx="6" cy="14.5" r=".8"/>',
 'medal':   '<path fill="black" d="M8.2 2.5h2.6l1.2 3.4 1.2-3.4h2.6l-2 5.6a6 6 0 1 1-3.6 0z"/>',
 'calendar':f'<rect {S} x="4" y="5.5" width="16" height="14.5" rx="2.5"/><path {S} d="M4 10h16M8.5 3.5V7M15.5 3.5V7"/>',
 'mail':    f'<rect {S} x="3.5" y="5.5" width="17" height="13" rx="2.5"/><path {S} d="m4.5 7 7.5 6 7.5-6"/>',
 'phone':   f'<path {S} d="M5.3 3.8h3.3l1.6 4.4-2.2 1.4a11 11 0 0 0 6.4 6.4l1.4-2.2 4.4 1.6v3.3a1.8 1.8 0 0 1-1.9 1.8A16.5 16.5 0 0 1 3.5 5.7a1.8 1.8 0 0 1 1.8-1.9z"/>',
 'pin':     f'<path {S} d="M12 21s6.5-5.6 6.5-11a6.5 6.5 0 0 0-13 0c0 5.4 6.5 11 6.5 11z"/><circle {S} cx="12" cy="10" r="2.4"/>',
 'pin-fill':'<path fill="black" fill-rule="evenodd" d="M12 21.5s7-6 7-11.5a7 7 0 0 0-14 0c0 5.5 7 11.5 7 11.5zm0-8.8a2.7 2.7 0 1 0 0-5.4 2.7 2.7 0 0 0 0 5.4z"/>',
 'chart':   f'<path {S} d="M4.5 19.5h15M7 16v-4M11 16V8M15 16v-6M19 16V5.5"/>',
 'pencil':  f'<path {S} d="M4.5 19.5l1-4.5L15.8 4.7a2 2 0 0 1 2.9 0l.6.6a2 2 0 0 1 0 2.9L9 18.5z"/>',
 'clock':   f'<circle {S} cx="12" cy="12" r="8.5"/><path {S} d="M12 7.5V12l3 2"/>',
 'apple':   '<path fill="black" d="M16.4 12.6c0-2.5 2.1-3.7 2.2-3.8-1.2-1.7-3-2-3.7-2-1.6-.2-3.1.9-3.9.9-.8 0-2-.9-3.4-.9-1.7 0-3.3 1-4.2 2.6-1.8 3.1-.5 7.7 1.3 10.2.8 1.2 1.8 2.6 3.1 2.6 1.3-.1 1.7-.8 3.3-.8 1.5 0 1.9.8 3.3.8 1.4 0 2.2-1.2 3-2.5.9-1.4 1.3-2.8 1.4-2.9-.1 0-2.4-.9-2.4-4.2zM13.9 5.2c.7-.8 1.2-2 1-3.2-1 .1-2.2.7-3 1.5-.6.7-1.2 1.9-1 3 1.1.1 2.3-.6 3-1.3z"/>',
 'signal':  '<path fill="black" d="M2 16h3v4H2zM7 13h3v7H7zM12 10h3v10h-3zM17 6h3v14h-3z"/>',
 'wifi':    '<path fill="black" d="M12 19.5 9.4 16.6a3.7 3.7 0 0 1 5.2 0zM6.6 13.8a7.7 7.7 0 0 1 10.8 0l-1.5 1.6a5.6 5.6 0 0 0-7.8 0zM3.8 11a11.8 11.8 0 0 1 16.4 0l-1.5 1.6a9.6 9.6 0 0 0-13.4 0z"/>',
 'logout':  f'<path {S} d="M14 4.5H6.5c-.6 0-1 .4-1 1v13c0 .6.4 1 1 1H14M10.5 12h10m0 0-3.5-3.5M20.5 12 17 15.5"/>',
 'inbox':   f'<path {S} d="M4 13.5 6.4 6a1.5 1.5 0 0 1 1.4-1h8.4a1.5 1.5 0 0 1 1.4 1l2.4 7.5V18a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18zM4 13.5h4.5l1.2 2.2h4.6l1.2-2.2H20"/>',
 'battery': '<rect x="1.5" y="7" width="19" height="10" rx="2.6" fill="none" stroke="black" stroke-opacity=".4" stroke-width="1"/><rect x="3" y="8.5" width="16" height="7" rx="1.5" fill="black"/><path d="M21.7 10.3v3.4c.6-.2 1-.9 1-1.7s-.4-1.5-1-1.7z" fill="black" fill-opacity=".45"/>',
}
out = ['/* Icons for app-style.css, drawn as CSS masks: an icon takes the colour of the',
       '   text around it. Generated by app-style/tools/make-icons.py: edit that, not this.',
       '   24x24 grid, 1.8 stroke, round ends: the weight of SF Symbols at regular. */',
       '.ic { display: inline-block; flex: none; width: var(--ic, 22px); height: var(--ic, 22px);',
       '      background: currentColor; -webkit-mask: var(--m) center / contain no-repeat; mask: var(--m) center / contain no-repeat; }']
for name, body in icons.items():
    svg = f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">{body}</svg>'
    uri = 'data:image/svg+xml,' + urllib.parse.quote(svg, safe=' =:/"-.,')
    out.append(f'.ic-{name} {{ --m: url(\'{uri}\'); }}')
open(os.path.join(os.path.dirname(os.path.abspath(__file__)), '..', 'app-icons.css'), 'w').write('\n'.join(out) + '\n')
print(len(icons), 'icons')
