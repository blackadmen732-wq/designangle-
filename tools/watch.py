#!/usr/bin/env python3
"""Watches a redesign video the way docs/research/her-redesigns.md was made:
what she says, what changes while she says it, and how the camera moves.

    python3 -m venv .venv-watch
    .venv-watch/bin/pip install rapidocr-onnxruntime numpy pillow
    .venv-watch/bin/python -I tools/watch.py all video.mp4

    words   her narration, read off the one-word captions (10 frames a second)
    story   one row per sentence: three frames across it, and the words
    motion  the camera's holds and moves, and every change, with durations
    all     the three, in that order

Everything is written to .refs/<video name>/ (git ignores it: the frames are
the designer's work). Needs ffmpeg. The caption boxes default to where
uidesignmahsa puts them in a 1080x1920 video; --caption x,y,w,h and
--intro x,y,w,h move them for another layout.

The words come back with reading errors and the odd word from the screen
behind the caption; read the transcript once by eye and clean it, as the
research doc did. A sentence starts at a capital after a pause of 0.45s or
more, or after any pause of 0.9s.
"""
import argparse, glob, json, os, re, subprocess, sys

def frames(video, fps, crop, out, limit=None):
    os.makedirs(out, exist_ok=True)
    for f in glob.glob(out + '/*.png'):
        os.remove(f)
    x, y, w, h = crop
    cmd = ['ffmpeg', '-v', 'error'] + (['-t', str(limit)] if limit else []) + ['-i', video, '-vf', f'fps={fps},crop={w}:{h}:{x}:{y}', out + '/f%05d.png']
    subprocess.run(cmd, check=True)
    return sorted(glob.glob(out + '/*.png'))

NOISE = re.compile(r'\d:\d|\.\.\.|…')

def read(paths, fps, pill, end=None):
    """One word (or two) per caption: kept where it sits on a white pill,
    has no clock time or ellipsis, is not cut by the region's left edge (the
    pill never is: screen text is), and does not stay for over a second (a
    caption changes every quarter second; screen text holds while the camera
    does), except in the last six seconds, where the closing question sits.
    Repeats are merged."""
    import numpy as np
    from PIL import Image
    from rapidocr_onnxruntime import RapidOCR
    ocr = RapidOCR()
    seen = []
    for i, p in enumerate(paths):
        img = np.asarray(Image.open(p).convert('RGB'))
        res, _ = ocr(img[:, :, ::-1])
        for box, text, conf in res or []:
            text = text.strip()
            if float(conf) < 0.6 or not text or NOISE.search(text):
                continue
            xs, ys = [q[0] for q in box], [q[1] for q in box]
            x0, x1, y0, y1 = int(max(0, min(xs) - 6)), int(min(img.shape[1], max(xs) + 6)), int(max(0, min(ys) - 4)), int(min(img.shape[0], max(ys) + 4))
            patch = img[y0:y1, x0:x1]
            if pill and (not patch.size or np.percentile(patch.mean(axis=2), 75) <= 215 or min(xs) <= 3):
                continue
            # the intro's words are white over the video, not dark on a screen
            if not pill and (not patch.size or np.percentile(patch.mean(axis=2), 50) > 150):
                continue
            seen.append({'t': round(i / fps, 2), 'w': text, 'h': y1 - y0, 'y': (y0 + y1) / 2})
    def lingers(x):
        near = sum(1 for y in seen if y['w'] == x['w'] and abs(y['t'] - x['t']) <= 1.5)
        # numbers on screen (a date tile) are read in fewer frames: half the bar
        bar = fps * (0.6 if x['w'].isdigit() else 1.2)
        return near >= bar and not (end and x['t'] >= end - 6)
    seen = [x for x in seen if not lingers(x) and not (len(x['w']) > 16 and ' ' not in x['w'])]
    # the caption's own size and line: its words are one height, on one line
    if seen:
        hs = sorted(s['h'] for s in seen); mid = hs[len(hs) // 2]
        seen = [s for s in seen if 0.75 * mid <= s['h'] <= 1.35 * mid]
    if seen and pill:
        ys = sorted(s['y'] for s in seen); line = ys[len(ys) // 2]
        seen = [s for s in seen if abs(s['y'] - line) <= 16]
    words, last = [], None
    for t in sorted({s['t'] for s in seen}):
        word = ' '.join(s['w'] for s in seen if s['t'] == t)
        # a word typed out letter by letter is one word
        if words and t - words[-1]['t'] <= 0.5 and (word.startswith(words[-1]['w']) or words[-1]['w'].startswith(word)):
            words[-1]['w'] = max(word, words[-1]['w'], key=len)
        elif word != last:
            words.append({'t': t, 'w': word})
        last = word
    return words

def sentences(words):
    out, cur = [], []
    for i, w in enumerate(words):
        gap = w['t'] - words[i - 1]['t'] if i else 0
        if cur and ((w['w'][:1].isupper() and gap >= 0.45) or gap >= 0.9):
            out.append(cur); cur = []
        cur.append(w)
    if cur:
        out.append(cur)
    return [{'t': s[0]['t'], 'text': ' '.join(w['w'] for w in s)} for s in out]

def duration(video):
    r = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', video], capture_output=True, text=True, check=True)
    return float(r.stdout)

def story(video, sents, out):
    from PIL import Image, ImageDraw, ImageFont
    try:
        font = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 18)
    except OSError:
        font = ImageFont.load_default()
    W, H, end = 220, 462, duration(video)
    sheet = Image.new('RGB', (W * 3 + 16 + 520, (H + 20) * len(sents) + 20), 'white')
    d = ImageDraw.Draw(sheet)
    tmp = out + '/story.d'; os.makedirs(tmp, exist_ok=True)
    for i, s in enumerate(sents):
        t0 = s['t']; t1 = sents[i + 1]['t'] if i + 1 < len(sents) else end
        y = 20 + i * (H + 20)
        for k, t in enumerate((t0 + 0.3, (t0 + t1) / 2, t1 - 0.25)):
            p = f'{tmp}/{i}-{k}.png'
            subprocess.run(['ffmpeg', '-v', 'error', '-y', '-ss', f'{max(0, t):.2f}', '-i', video, '-frames:v', '1', '-vf', f'crop=660:1386:210:240,scale={W}:{H}', p], check=True)
            sheet.paste(Image.open(p), (k * (W + 8), y))
        lines, line = [], ''
        for word in s['text'].split():
            if d.textlength(line + ' ' + word, font=font) > 480:
                lines.append(line); line = word
            else:
                line = (line + ' ' + word).strip()
        lines.append(line)
        d.text((W * 3 + 32, y + 6), f'{i}.  {t0:.1f}s to {t1:.1f}s', fill='#777', font=font)
        for k, l in enumerate(lines):
            d.text((W * 3 + 32, y + 36 + k * 26), l, fill='black', font=font)
    sheet.save(out + '/story.png')
    return out + '/story.png'

def motion(video):
    """Follows the bright screen's box at 30 frames a second: its width is
    the camera's zoom; how much of the frame changes is a cut, a dissolve or
    a caption."""
    import numpy as np
    W, H = 270, 480
    p = subprocess.Popen(['ffmpeg', '-v', 'error', '-i', video, '-vf', f'scale={W}:{H},format=gray', '-f', 'rawvideo', '-'], stdout=subprocess.PIPE)
    rows, prev, i = [], None, 0
    while True:
        buf = p.stdout.read(W * H)
        if len(buf) < W * H:
            break
        f = np.frombuffer(buf, np.uint8).reshape(H, W).astype(np.int16)
        bright = f > 200
        cols = np.where(bright.sum(0) > H * 0.15)[0]
        rows.append({'t': round(i / 30, 3), 'w': int(cols[-1] - cols[0]) if len(cols) else 0, 'diff': float(np.abs(f - prev).mean()) if prev is not None else 0.0})
        prev = f; i += 1
    lines, segs, cur = [], [], [rows[0]]
    for x in rows[1:]:
        if abs(x['w'] - cur[-1]['w']) <= 1:
            cur.append(x)
        else:
            segs.append(cur); cur = [x]
    segs.append(cur)
    holds = [s for s in segs if len(s) >= 8 and s[0]['w'] >= 60]
    rest = min((s[0]['w'] for s in holds), default=0)
    lines.append('camera (zoom is the screen\'s width against its narrowest hold):')
    for a, b in zip(holds, holds[1:]):
        lines.append(f"  {a[0]['t']:6.2f}-{a[-1]['t']:6.2f}  hold at {a[0]['w'] / rest:.2f}x")
        gap = b[0]['t'] - a[-1]['t']
        if b[0]['w'] != a[0]['w']:
            lines.append(f"  {a[-1]['t']:6.2f}-{b[0]['t']:6.2f}  {'move' if gap > 0.1 else 'cut'} to {b[0]['w'] / rest:.2f}x in {gap * 1000:.0f}ms")
    if holds:
        lines.append(f"  {holds[-1][0]['t']:6.2f}-{holds[-1][-1]['t']:6.2f}  hold at {holds[-1][0]['w'] / rest:.2f}x")
    lines.append('changes while the camera holds (runs of frames that differ; long runs are dissolves, short ones captions):')
    run = []
    for k, x in enumerate(rows):
        steady = k > 0 and abs(x['w'] - rows[k - 1]['w']) <= 1
        if steady and x['diff'] > 1.5:
            run.append(x)
        else:
            if len(run) >= 6:
                lines.append(f"  {run[0]['t']:6.2f}  {len(run)} frames ({len(run) / 30 * 1000:.0f}ms), peak {max(r['diff'] for r in run):.1f}")
            run = []
    return '\n'.join(lines)

def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument('what', choices=['words', 'story', 'motion', 'all'])
    ap.add_argument('video')
    ap.add_argument('--caption', default='720,660,360,150', help='x,y,w,h of the caption pill region')
    ap.add_argument('--intro', default='150,1230,780,220', help='x,y,w,h of the intro caption region')
    ap.add_argument('--intro-secs', type=float, default=3.5)
    a = ap.parse_args()
    out = os.path.join('.refs', os.path.splitext(os.path.basename(a.video))[0])
    os.makedirs(out, exist_ok=True)
    if a.what in ('words', 'all'):
        end = duration(a.video)
        intro = read(frames(a.video, 10, [int(v) for v in a.intro.split(',')], out + '/intro.d', a.intro_secs), 10, False)
        intro = [w for w in intro if w['t'] < a.intro_secs - 0.5]
        body = read(frames(a.video, 10, [int(v) for v in a.caption.split(',')], out + '/words.d'), 10, True, end)
        # the intro ends where the first caption pill appears; anything read
        # in the intro region after that is the screen dissolving in
        first = body[0]['t'] if body else end
        intro = [w for w in intro if w['t'] < first - 0.1]
        words = intro + body
        json.dump(words, open(out + '/words.json', 'w'), indent=0)
        sents = sentences(words)
        json.dump(sents, open(out + '/sentences.json', 'w'), indent=1)
        print('\n'.join(f"{s['t']:6.1f}  {s['text']}" for s in sents))
    if a.what in ('story', 'all'):
        sents = json.load(open(out + '/sentences.json'))
        print('storyboard:', story(a.video, sents, out))
    if a.what in ('motion', 'all'):
        m = motion(a.video)
        open(out + '/motion.txt', 'w').write(m + '\n')
        print(m)

if __name__ == '__main__':
    main()
