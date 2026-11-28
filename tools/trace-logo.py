#!/usr/bin/env python3
"""
Recreate a logo from a reference picture: a traced SVG and a clean cutout.

  python3 tools/trace-logo.py <reference.png> <x> <y> <w> <h> <out-dir> [--name mark]
                              [--threshold 120] [--levels 3] [--scale 4]

Crops the logo out of the reference (x, y, w, h in the reference's pixels)
and writes three files into <out-dir>:

  <name>.svg        the logo traced into paths, in layers: each --levels
                    band of brightness becomes its own path, filled with a
                    chrome gradient from dark to bright, so the bevels and the
                    hot edges of a 3D logo survive as shapes. Scales to any
                    size; use it in a window bar or a favicon.
  <name>-cut.webp   the logo's own pixels with the black taken out: alpha is
                    the brightness, so its glow and reflections come with it.
                    Use it where the logo is big; nothing drawn by hand gets
                    closer to a render.
  <name>-sheet.png  the crop, the traced SVG's mask and the cutout side by
                    side, to look at before using either.

Why both: a 3D chrome logo is a picture, and code that imitates it by hand
(a path or two with a gradient) looks cheap next to it. The cutout keeps the
picture; the traced SVG keeps the shape. See .claude/skills/logo-recreate.

Works for light logos on a dark ground (the usual splash screen). For a dark
logo on light, pass --invert.

Needs numpy and Pillow. No network.
"""
import sys, os, argparse
import numpy as np
from PIL import Image, ImageFilter


def lum(a):
    return 0.2126 * a[..., 0] + 0.7152 * a[..., 1] + 0.0722 * a[..., 2]


# ---------------------------------------------------------------- tracing

def contours(mask):
    """Marching squares on a boolean mask: closed loops of (x, y) points on
    the pixel grid's edges, outer shapes and holes alike."""
    h, w = mask.shape
    m = np.zeros((h + 2, w + 2), bool)
    m[1:-1, 1:-1] = mask
    # each cell (i, j) looks at m[i:i+2, j:j+2]; edges are midpoints
    segs = {}
    def add(a, b):
        segs.setdefault(a, []).append(b)
    for i in range(h + 1):
        row0, row1 = m[i], m[i + 1]
        for j in range(w + 1):
            c = (row0[j] << 3) | (row0[j + 1] << 2) | (row1[j + 1] << 1) | row1[j]
            if c == 0 or c == 15:
                continue
            T, R, B, L = (j + .5, i), (j + 1, i + .5), (j + .5, i + 1), (j, i + .5)
            table = {1: [(L, B)], 2: [(B, R)], 3: [(L, R)], 4: [(R, T)], 5: [(L, T), (R, B)],
                     6: [(B, T)], 7: [(L, T)], 8: [(T, L)], 9: [(T, B)], 10: [(T, R), (B, L)],
                     11: [(T, R)], 12: [(R, L)], 13: [(R, B)], 14: [(B, L)]}
            for a, b in table[c]:
                add(a, b)
    loops = []
    while segs:
        start = next(iter(segs))
        loop = [start]
        cur = start
        while True:
            nxt = segs[cur].pop()
            if not segs[cur]:
                del segs[cur]
            if nxt == start:
                break
            loop.append(nxt)
            cur = nxt
            if cur not in segs:
                break
        if len(loop) > 8:
            loops.append(loop)
    return loops


def rdp(points, eps):
    """Ramer-Douglas-Peucker: drop points that sit within eps of the line."""
    if len(points) < 3:
        return points
    p = np.array(points)
    a, b = p[0], p[-1]
    d = b - a
    n = np.hypot(*d) or 1
    dist = np.abs(d[0] * (p[:, 1] - a[1]) - d[1] * (p[:, 0] - a[0])) / n
    k = int(np.argmax(dist))
    if dist[k] > eps:
        return rdp(points[:k + 1], eps)[:-1] + rdp(points[k:], eps)
    return [points[0], points[-1]]


def smooth_path(loop, eps, scale):
    # a closed loop starts and ends at the same point, which RDP cannot split
    # on, so cut it at the point farthest from the start and simplify halves
    p = np.array(loop)
    k = int(np.argmax(np.hypot(p[:, 0] - p[0, 0], p[:, 1] - p[0, 1])))
    pts = rdp(loop[:k + 1], eps)[:-1] + rdp(loop[k:] + [loop[0]], eps)[:-1]
    if len(pts) < 3:
        return ''
    P = [(x / scale, y / scale) for x, y in pts]
    # quadratic curves through the midpoints: smooth, still exact at the corners' midpoints
    mids = [((P[i][0] + P[(i + 1) % len(P)][0]) / 2, (P[i][1] + P[(i + 1) % len(P)][1]) / 2) for i in range(len(P))]
    d = 'M%.2f %.2f' % mids[-1]
    for i in range(len(P)):
        d += 'Q%.2f %.2f %.2f %.2f' % (P[i][0], P[i][1], mids[i][0], mids[i][1])
    return d + 'Z'


# ------------------------------------------------------------------ main

def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('ref'); ap.add_argument('x', type=int); ap.add_argument('y', type=int)
    ap.add_argument('w', type=int); ap.add_argument('h', type=int); ap.add_argument('out')
    ap.add_argument('--name', default='mark')
    ap.add_argument('--threshold', type=float, default=110)
    ap.add_argument('--levels', type=int, default=3)
    ap.add_argument('--scale', type=int, default=4)
    ap.add_argument('--invert', action='store_true')
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)

    crop = Image.open(a.ref).convert('RGB').crop((a.x, a.y, a.x + a.w, a.y + a.h))
    arr = np.asarray(crop).astype(float)
    L = lum(arr)
    if a.invert:
        L = 255 - L

    # 1. the cutout: alpha from brightness, colour un-premultiplied so it
    #    stays white where it was white
    lo, hi = 14.0, 200.0
    alpha = np.clip((L - lo) / (hi - lo), 0, 1)
    rgb = np.where(alpha[..., None] > 0.02, np.clip(arr / np.maximum(alpha[..., None], 0.02), 0, 255), 0)
    cut = np.dstack([rgb, alpha * 255]).astype(np.uint8)
    Image.fromarray(cut, 'RGBA').save(os.path.join(a.out, a.name + '-cut.webp'), lossless=True)

    # 2. the trace: upsample, blur a touch, threshold at levels of brightness
    big = crop.resize((a.w * a.scale, a.h * a.scale), Image.LANCZOS).filter(ImageFilter.GaussianBlur(a.scale * 0.35))
    BL = lum(np.asarray(big).astype(float))
    if a.invert:
        BL = 255 - BL
    tops = np.linspace(a.threshold, 235, a.levels + 1)[:-1]
    stops = [('#8e8f98', '#d9dae0'), ('#c9cad1', '#f4f4f7'), ('#eeeef2', '#ffffff')]
    layers = []
    for k, t in enumerate(tops):
        loops = contours(BL > t)
        d = ''.join(smooth_path(lp, eps=a.scale * 0.45, scale=a.scale) for lp in loops)
        if d:
            c0, c1 = stops[min(k, len(stops) - 1)] if a.levels <= 3 else stops[min(int(k * 3 / a.levels), 2)]
            layers.append((d, c0, c1, k))
    gid = a.name
    defs = ''.join(
        '<linearGradient id="%s-g%d" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="%s"/><stop offset=".55" stop-color="%s"/><stop offset="1" stop-color="%s"/></linearGradient>'
        % (gid, k, c1, c0, c1) for _, c0, c1, k in layers)
    defs += ('<filter id="%s-glow" x="-30%%" y="-30%%" width="160%%" height="160%%"><feGaussianBlur in="SourceAlpha" stdDeviation="%.1f" result="b"/>'
             '<feFlood flood-color="#fff" flood-opacity=".45"/><feComposite in2="b" operator="in"/><feMerge><feMergeNode/><feMergeNode in="SourceGraphic"/></feMerge></filter>') % (gid, max(1.5, a.w / 70))
    paths = ''.join('<path fill="url(#%s-g%d)" fill-rule="evenodd" d="%s"/>' % (gid, k, d) for d, _, _, k in layers)
    svg = ('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 %d %d" width="%d" height="%d"><defs>%s</defs><g filter="url(#%s-glow)">%s</g></svg>'
           % (a.w, a.h, a.w, a.h, defs, gid, paths))
    with open(os.path.join(a.out, a.name + '.svg'), 'w') as f:
        f.write(svg)

    # 3. a sheet to look at: crop | first-level mask | cutout on dark grey
    mask = Image.fromarray(((BL > tops[0]) * 255).astype(np.uint8)).resize((a.w, a.h))
    bg = Image.new('RGBA', (a.w, a.h), (40, 40, 44, 255))
    bg.alpha_composite(Image.fromarray(cut, 'RGBA'))
    sheet = Image.new('RGB', (a.w * 3 + 16, a.h), (20, 20, 22))
    sheet.paste(crop, (0, 0)); sheet.paste(mask.convert('RGB'), (a.w + 8, 0)); sheet.paste(bg.convert('RGB'), (a.w * 2 + 16, 0))
    sheet.save(os.path.join(a.out, a.name + '-sheet.png'))

    size = os.path.getsize(os.path.join(a.out, a.name + '.svg'))
    print('  %s.svg        %d layer(s), %.1f KB' % (a.name, len(layers), size / 1024))
    print('  %s-cut.webp   %d x %d, alpha from brightness' % (a.name, a.w, a.h))
    print('  %s-sheet.png  look at it before using either' % a.name)


if __name__ == '__main__':
    main()
