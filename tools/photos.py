#!/usr/bin/env python3
"""
Photos for a screen: fetch, credit, and look at them before using them.

  python3 tools/photos.py try <photo-id> ...            download small, write a
                                                        labelled contact sheet
  python3 tools/photos.py fetch <dir> name=<photo-id> ... [--w 1200]
                                                        save as <dir>/<name>.webp
                                                        and record the credit

<photo-id> is the part of an images.unsplash.com address after "photo-", for
example 1606755962773-d324e0a13086. Every photo served from
images.unsplash.com/photo-... is under the Unsplash License (free to use, no
attribution required; not for resale as is, or for a competing photo
service). Unsplash+ photos live elsewhere (plus.unsplash.com) and are refused.

Look at the contact sheet before fetching: an ID can be the wrong subject, or
show a brand's packaging (a competitor's logo on a bag is not a stand-in).
fetch writes <dir>/CREDITS.json: id, source address, licence, date.

Needs Pillow, and images.unsplash.com allowed in the environment's network.
"""
import sys, os, io, json, datetime, urllib.request
from PIL import Image, ImageDraw

CDN = 'https://images.unsplash.com/photo-{id}?w={w}&q=82&fm=jpg'


def get(pid, w):
    req = urllib.request.Request(CDN.format(id=pid, w=w), headers={'User-Agent': 'design-kit-photos/1.0'})
    with urllib.request.urlopen(req, timeout=30) as r:
        return Image.open(io.BytesIO(r.read())).convert('RGB')


def try_(ids, out='.check/photos-try.png'):
    W, cols = 220, 6
    ok = []
    for pid in ids:
        try:
            ok.append((pid, get(pid, 400)))
        except Exception as e:
            print('missing', pid, e.__class__.__name__)
    if not ok:
        return
    rows = (len(ok) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * W, rows * (W + 20)), 'white')
    d = ImageDraw.Draw(sheet)
    for i, (pid, im) in enumerate(ok):
        im = im.copy(); im.thumbnail((W - 6, W - 6))
        x, y = (i % cols) * W, (i // cols) * (W + 20)
        sheet.paste(im, (x + 3, y + 3)); d.text((x + 4, y + W - 2), f'{i:02d} {pid[:26]}', fill='black')
    os.makedirs(os.path.dirname(out) or '.', exist_ok=True)
    sheet.save(out)
    print(f'{len(ok)} found; look at {out}')


def fetch(folder, pairs, w=1200):
    os.makedirs(folder, exist_ok=True)
    credits_path = os.path.join(folder, 'CREDITS.json')
    credits = json.load(open(credits_path)) if os.path.exists(credits_path) else {}
    for pair in pairs:
        name, pid = pair.split('=', 1)
        im = get(pid, w)
        path = os.path.join(folder, name + '.webp')
        im.save(path, 'WEBP', quality=78, method=6)
        credits[name + '.webp'] = {
            'source': f'https://images.unsplash.com/photo-{pid}', 'licence': 'Unsplash License (https://unsplash.com/license)',
            'fetched': datetime.date.today().isoformat(), 'size': list(im.size)}
        print(f'{path}  {im.size[0]}x{im.size[1]}  {os.path.getsize(path) // 1024} KB')
    json.dump(credits, open(credits_path, 'w'), indent=1)


if __name__ == '__main__':
    a = sys.argv[1:]
    if not a or a[0] not in ('try', 'fetch'):
        print(__doc__); sys.exit(2)
    if a[0] == 'try':
        try_(a[1:])
    else:
        w = int(a[a.index('--w') + 1]) if '--w' in a else 1200
        fetch(a[1], [x for x in a[2:] if '=' in x], w)
