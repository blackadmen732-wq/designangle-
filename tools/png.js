/*
 * Minimal PNG reader: enough to turn a Playwright screenshot back into pixels.
 *
 * Why this exists. The audit decides whether text is readable by comparing it
 * with the colour behind it, and it used to find that colour by walking up the
 * DOM for the first ancestor that paints a background. That is right until the
 * background is not an ancestor. A full-bleed hero puts the photograph in an
 * absolutely positioned sibling, so the walk sails past it and reports the
 * page colour — and white type over a dark photograph was failing at "1.06:1
 * on #faf8f6", a number that describes nothing on the screen.
 *
 * Rather than guess, or wave the case through, the audit now hides the text,
 * photographs what is actually behind it, and reads those pixels. This file is
 * the part that reads them.
 *
 * Playwright writes 8-bit non-interlaced PNG, which is the only shape handled
 * here. Anything else throws rather than returning a wrong answer.
 */
'use strict';
const zlib = require('zlib');

function decode(buf) {
  if (buf.readUInt32BE(0) !== 0x89504e47) throw new Error('not a PNG');
  let p = 8, width = 0, height = 0, depth = 0, colour = 0, interlace = 0;
  const idat = [];
  while (p < buf.length) {
    const len = buf.readUInt32BE(p);
    const type = buf.toString('ascii', p + 4, p + 8);
    const data = buf.slice(p + 8, p + 8 + len);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0); height = data.readUInt32BE(4);
      depth = data[8]; colour = data[9]; interlace = data[12];
    } else if (type === 'IDAT') idat.push(data);
    else if (type === 'IEND') break;
    p += 12 + len;
  }
  if (depth !== 8) throw new Error('unsupported bit depth ' + depth);
  if (interlace !== 0) throw new Error('interlaced PNG unsupported');
  const ch = { 0: 1, 2: 3, 4: 2, 6: 4 }[colour];
  if (!ch) throw new Error('unsupported colour type ' + colour);

  const raw = zlib.inflateSync(Buffer.concat(idat));
  const stride = width * ch;
  const out = Buffer.alloc(height * stride);

  for (let y = 0; y < height; y++) {
    const filter = raw[y * (stride + 1)];
    const line = raw.slice(y * (stride + 1) + 1, y * (stride + 1) + 1 + stride);
    const cur = out.slice(y * stride, (y + 1) * stride);
    const prev = y ? out.slice((y - 1) * stride, y * stride) : null;
    for (let i = 0; i < stride; i++) {
      const a = i >= ch ? cur[i - ch] : 0;          // left
      const b = prev ? prev[i] : 0;                 // up
      const c = (prev && i >= ch) ? prev[i - ch] : 0; // up-left
      let v = line[i];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) {
        const pa = Math.abs(b - c), pb = Math.abs(a - c), pc = Math.abs(a + b - 2 * c);
        v += (pa <= pb && pa <= pc) ? a : (pb <= pc ? b : c);
      } else if (filter !== 0) throw new Error('bad filter ' + filter);
      cur[i] = v & 0xff;
    }
  }
  return { width, height, channels: ch, data: out };
}

/* Every pixel, as [r,g,b]. Alpha is dropped: a screenshot is already composited. */
function pixels(img) {
  const { width, height, channels, data } = img;
  const list = [];
  for (let i = 0; i < width * height; i++) {
    const o = i * channels;
    if (channels <= 2) list.push([data[o], data[o], data[o]]);
    else list.push([data[o], data[o + 1], data[o + 2]]);
  }
  return list;
}

module.exports = { decode, pixels };
